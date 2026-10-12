import fs from 'node:fs'
import fetch from 'node-fetch'
import Yaml from 'yaml'
import {
  pluginRoot
} from '../config/constant.js'

// 后端默认配置，config/code.yaml 缺失或字段不全时兜底
const defaultCfg = {
  backend: 'wandbox',
  piston: {
    url: 'https://emkc.org/api/v2/piston',
    token: ''
  }
}

const loadCfg = () => {
  try {
    const cfg = Yaml.parse(fs.readFileSync(`${pluginRoot}/config/code.yaml`, 'utf8')) || {}
    return {
      backend: cfg.backend || defaultCfg.backend,
      piston: { ...defaultCfg.piston, ...cfg.piston }
    }
  } catch (err) {
    logger.warn('读取 config/code.yaml 失败，使用默认后端', err?.message || err)
    return defaultCfg
  }
}

// piston：语言ID；同名语言可能有多个运行时（如 javascript 的 node/deno），按关键词挑
const pistonLang = {
  bash: 'bash', python: 'python', c: 'c', cpp: 'c++', javascript: 'javascript',
  kotlin: 'kotlin', lua: 'lua', go: 'go', csharp: 'csharp', java: 'java',
  php: 'php', groovy: 'groovy', rust: 'rust', typescript: 'typescript', perl: 'perl'
}
const pistonPrefer = {
  javascript: ['node'],
  typescript: ['node'],
  csharp: ['mono']
}
let pistonRuntimes = null

// wandbox：语言名；编译器版本会更新，从 list.json 动态选非 head 的
const wandboxLang = {
  bash: 'Bash script', python: 'Python', c: 'C', cpp: 'C++',
  javascript: 'JavaScript', lua: 'Lua', go: 'Go', csharp: 'C#',
  java: 'Java', php: 'PHP', groovy: 'Groovy', rust: 'Rust',
  typescript: 'TypeScript', perl: 'Perl'
}
const wandboxPrefer = {
  python: ['cpython-3.'], c: ['gcc-'], cpp: ['gcc-'], javascript: ['nodejs-'],
  lua: ['lua-5.4', 'lua-'], go: ['go-1.2', 'go-1.'], csharp: ['mono-', 'dotnetcore-'],
  java: ['openjdk-'], php: ['php-8', 'php-'], groovy: ['groovy-'], rust: ['rust-1', 'rust-'],
  typescript: ['typescript-'], perl: ['perl-5', 'perl-'], bash: ['bash']
}
let wandboxList = null

// glot.io 2026 新接口：单端点 POST /api/mux，action=run
// 语言 → 镜像/构建/运行命令 映射来自官方 glotcode/glot-languages 仓库
const glotRunMap = {
  bash:       { image: 'glot/bash:latest',       build: [],                                       run: 'bash main.sh' },
  python:     { image: 'glot/python:latest',     build: [],                                       run: 'python main.py' },
  c:          { image: 'glot/clang:latest',      build: ['clang -o a.out -lm main.c'],            run: './a.out' },
  cpp:        { image: 'glot/clang:latest',      build: ['clang++ -std=c++11 -o a.out main.cpp'], run: './a.out' },
  javascript: { image: 'glot/javascript:latest', build: [],                                       run: 'node main.js' },
  kotlin:     { image: 'glot/kotlin:latest',     build: ['kotlinc main.kt'],                      run: 'kotlin MainKt' },
  lua:        { image: 'glot/lua:latest',        build: [],                                       run: 'lua main.lua' },
  go:         { image: 'glot/golang:latest',     build: ['go build -o a.out main.go'],            run: './a.out' },
  csharp:     { image: 'glot/csharp:latest',     build: ['mcs -out:a.exe main.cs'],               run: 'mono a.exe' },
  java:       { image: 'glot/java:latest',       build: ['javac main.java'],                      run: 'java Main' },
  php:        { image: 'glot/php:latest',        build: [],                                       run: 'php main.php' },
  groovy:     { image: 'glot/groovy:latest',     build: [],                                       run: 'groovy main.groovy' },
  rust:       { image: 'glot/rust:latest',       build: ['rustc -o a.out main.rs'],               run: './a.out' },
  typescript: { image: 'glot/typescript:latest', build: ['tsc main.ts'],                          run: 'node main.js' },
  perl:       { image: 'glot/perl:latest',       build: [],                                       run: 'perl main.pl' }
}


export class Code extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'code',
      /** 功能描述 */
      dsc: '模拟运行各种语言',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [{
        /** 命令正则匹配 */
        reg: `^(#|\\.)?code .*(\r|\n)*`,
        /** 执行方法 */
        fnc: 'code'
      }]
    })
  }


  async code(e) {
    let text = e.msg;
    let nl = /\r|\n/.exec(text);
    if (!nl) {
      this.reply("用法：#code 语言\n代码\n（语言和代码要在同一条消息里，用换行分隔）", true);
      return;
    }
    let a = nl.index;
    let lang = text.substring(0, a).substring(text.indexOf(" ")+1).toLowerCase();
    let command = text.substring(a + 1);

    var FileName;
    switch (lang) {
      case "bash":
        lang = "bash";
        FileName = "sh";
        break;
      case "sh":
        lang = "bash";
        FileName = "sh";
        break;
      case "py":
        lang = "python";
        FileName = "py";
        break;
      case "python":
        lang = "python";
        FileName = "py";
        break;
      case "c":
        lang = "c";
        FileName = "c";
        break;
      case "c++":
        lang = "cpp";
        FileName = "cpp";
        break;
      case "cpp":
        lang = "cpp";
        FileName = "cpp";
        break;
      case "js":
        lang = "javascript";
        FileName = "js";
        break;
      case "javascript":
        lang = "javascript";
        FileName = "js";
        break;
      case "kt":
        lang = "kotlin";
        FileName = "kt";
        break;
      case "kotlin":
        lang = "kotlin";
        FileName = "kt";
        break;
      case "lua":
        lang = "lua";
        FileName = "lua";
        break;
      case "go":
        lang = "go";
        FileName = "go";
        break;
      case "golang":
        lang = "go";
        FileName = "go";
        break;
      case "c#":
        lang = "csharp";
        FileName = "cs";
        break;
      case "java":
        lang = "java";
        FileName = "java";
        break;
      case "php":
        lang = "php";
        FileName = "php";
        break;
      case "groovy":
        lang = "groovy";
        FileName = "groovy";
        break;
      case "rust":
        lang = "rust";
        FileName = "rs";
        break;
      case "typescript":
        lang = "typescript";
        FileName = "ts";
        break;
      case "ts":
        lang = "typescript";
        FileName = "ts";
        break;
      case "perl":
        lang = "perl";
        FileName = "pl";
        break;
      default:
        this.reply("未知语言" + lang, true);
        return;
        break;
    }

    let cfg = loadCfg();
    let out;
    try {
      if (cfg.backend === 'glot') {
        out = await this.glotRun(lang, FileName, command);
      } else if (cfg.backend === 'piston') {
        out = await this.pistonRun(cfg, lang, FileName, command);
      } else {
        out = await this.wandboxRun(lang, command);
      }

      let msg = await e.runtime.common.makeForwardMsg(e, out);
      this.reply(msg);
    } catch (error) {
      logger.error(error);
      this.reply("执行出错：" + (error?.message || error), true);
    }
  }

  // 旧接口 POST https://glot.io/run/{lang} 已于2026年下线（404）
  // 现走官网新接口 /api/mux（与浏览器前端一致，响应字段 stdout/stderr/error 同构）
  async glotRun(lang, FileName, command) {
    let g = glotRunMap[lang];
    if (!g) {
      throw new Error("glot 不支持语言：" + lang);
    }

    const response = await fetch("https://glot.io/api/mux", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "run",
        data: {
          image: g.image,
          payload: {
            runInstructions: {
              buildCommands: g.build,
              runCommand: g.run
            },
            files: [{
              name: "main."+FileName,
              content: command
            }],
            stdin: null
          }
        }
      })
    });

    let raw = await response.text();
    if (!response.ok) {
      let msg = raw.slice(0, 200);
      try {
        msg = JSON.parse(raw).error?.message || msg;
      } catch (err) {}
      throw new Error("glot.io HTTP " + response.status + "：" + msg);
    }
    const data = JSON.parse(raw).data;
    return [
      `stdout:\n${data.stdout || "（无）"}`,
      `stderr:\n${data.stderr || "（无）"}`,
      `error:\n${data.error || "（无）"}`
    ]
  }

  async pistonRun(cfg, lang, FileName, command) {
    let base = cfg.piston.url.replace(/\/+$/, "");

    if (!pistonRuntimes) {
      const res = await fetch(base + "/runtimes");
      let raw = await res.text();
      if (!res.ok) {
        throw new Error("获取 piston runtimes 失败：HTTP " + res.status + " " + raw.slice(0, 100));
      }
      pistonRuntimes = JSON.parse(raw);
    }

    let id = pistonLang[lang];
    let cands = pistonRuntimes.filter(x => x.language === id || (x.aliases || []).includes(id));
    if (!cands.length) {
      throw new Error("piston 不支持语言：" + id);
    }
    let runtime = cands[0];
    for (let key of pistonPrefer[lang] || []) {
      let hit = cands.find(x => (x.aliases || []).join().includes(key) || x.language.includes(key));
      if (hit) {
        runtime = hit;
        break;
      }
    }

    let headers = { "Content-Type": "application/json" };
    if (cfg.piston.token) {
      headers["Authorization"] = "Token " + cfg.piston.token;
    }
    const res = await fetch(base + "/execute", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{
          name: "main." + FileName,
          content: command
        }],
        stdin: ""
      })
    });

    let raw = await res.text();
    if (!res.ok) {
      let msg = raw.slice(0, 200);
      try {
        msg = JSON.parse(raw).message || msg;
      } catch (err) {}
      throw new Error("piston HTTP " + res.status + "：" + msg);
    }
    const data = JSON.parse(raw);
    let stderr = [data.compile?.stderr, data.run?.stderr].filter(Boolean).join("\n");
    let errInfo = [
      data.compile?.code ? "compile exit: " + data.compile.code : "",
      data.run?.code ? "run exit: " + data.run.code : ""
    ].filter(Boolean).join(", ");
    return [
      `stdout:\n${data.run?.stdout || "（无）"}`,
      `stderr:\n${stderr || "（无）"}`,
      `error:\n${errInfo || "（无）"}`
    ]
  }

  async wandboxRun(lang, command) {
    let langName = wandboxLang[lang];
    if (!langName) {
      throw new Error("wandbox 不支持语言：" + lang + "（可在 config/code.yaml 切换 glot 后端）");
    }

    if (!wandboxList) {
      const res = await fetch("https://wandbox.org/api/list.json");
      let raw = await res.text();
      if (!res.ok) {
        throw new Error("获取 wandbox 编译器列表失败：HTTP " + res.status + " " + raw.slice(0, 100));
      }
      wandboxList = JSON.parse(raw);
    }

    let cands = wandboxList.filter(x => x.language === langName);
    if (!cands.length) {
      throw new Error("wandbox 无此语言的编译器：" + langName);
    }
    let stable = cands.filter(x => !x.name.includes("head"));
    let compiler = stable[0] || cands[0];
    for (let prefix of wandboxPrefer[lang] || []) {
      let hit = stable.find(x => x.name.startsWith(prefix));
      if (hit) {
        compiler = hit;
        break;
      }
    }

    const res = await fetch("https://wandbox.org/api/compile.ndjson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        compiler: compiler.name,
        code: command,
        codes: [],
        options: "",
        stdin: ""
      })
    });

    let raw = await res.text();
    if (!res.ok) {
      throw new Error("wandbox HTTP " + res.status + "：" + raw.slice(0, 200));
    }
    let stdout = "", stderr = "", exit = "";
    for (let line of raw.split("\n")) {
      if (!line.trim()) continue;
      let ev;
      try {
        ev = JSON.parse(line);
      } catch (err) {
        continue;
      }
      if (ev.type === "StdOut") {
        stdout += ev.data;
      } else if (ev.type === "StdErr") {
        stderr += ev.data;
      } else if (ev.type === "ExitCode") {
        exit = ev.data;
      }
    }
    return [
      `stdout:\n${stdout || "（无）"}`,
      `stderr:\n${stderr || "（无）"}`,
      `error:\n${(exit !== "" && exit !== "0") ? "exit code: " + exit : "（无）"}`
    ]
  }
}

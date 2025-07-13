import fetch from 'node-fetch'
import {
  makeForwardMsg
} from '../model/utils.js'

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
        reg: `^(#|\.)?code .*(\r|\n)*`,
        /** 执行方法 */
        fnc: 'code'
      }]
    })
  }


  async code(e) {
    let text = e.msg;
    let a = /\r|\n/.exec(text).index;
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

    let postData = JSON.stringify({
      files: [{
        name: "main."+FileName,
        content: command
      }],
      stdin: "",
      command: ""
    });

    try {
      const response = await fetch("https://glot.io/run/" + lang + "?version=latest", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: postData
      });

      const data = await response.json();
      // let out = data.stdout + data.stderr + data.error;
      // out = out || "执行成功，但是没有输出";
      let out = [
        `stdout:\n${data.stdout}`,
        `stderr:\n${data.stderr}`,
        `error:\n${data.error}`
      ]

      let msg = await makeForwardMsg(e, out);
      this.reply(msg);
    } catch (error) {
      logger.error(error);
    }
  }
}
import fetch from "node-fetch"

export class setu extends plugin {
  constructor() {
    super({
      name: '涩图',
      dsc: '获取涩图信息',
      event: 'message',
      priority: 4000,
      rule: [{
        reg: '^#来[一二两三四五六七八九十百千万亿]*[1-9][0-9]*张.*(涩|色)图',
        fnc: 'getSetu'
      }]
    })
  }

  async getSetu(e) {
    if (/^#?来[一二两三四五六七八九十百千万亿]*张.*/.test(e.msg)) {
      this.reply("请用阿拉伯数字表达数量", true)
      return true
    }
    let cfg = {
      r18Type: "1",
      picType: "url"
    }
    await e.reply('正在给你找图片啦～', true, {
      recallMsg: 7
    })
    var setu = []
    setu.push("请复制链接去浏览器打开\n浏览器打不开就换个别的浏览器，比如via，Google")
    let Ret = /^#来([1-9][0-9]*)张(.*)?(?:涩|色|瑟)图/.exec(e.msg)
    if (!Ret) return false
    let num = (Number(Ret[1]) > 20) ? 20 : Number(Ret[1])
    let isR18 = cfg.r18Type
    let tags = Ret[2].trim()
    var taglist = ""
    if (tags) {
      tags.split(" ").forEach(a => {
        taglist += "&tag=" + a
      })
    }
    let url = "https://api.lolicon.app/setu/v2?size=regular&r18=" + isR18 + "&num=" + num + taglist
    let response = await fetch(url)
    let obj = await response.json()
    if (obj.data.length < 1) {
      await this.reply("没有找到关于" + tags + "的色图", true, {
        recallMsg: 60
      })
      return
    }
    setu.push("尝试获取" + num + "张涩图\n共获取" + obj.data.length + "张涩图")
    logger.mark("尝试获取" + num + "张" + taglist + "涩图\n共获取" + obj.data.length + "张涩图")
    obj.data.forEach(v => {
      var tag = ''
      v.tags.forEach(t => {
        tag += t + "、"
      })
      setu.push(
        "涩图pid：" + v.pid +
        "\n涩图标题：" + v.title +
        "\n涩图作者：" + v.author +
        "\n作者uid：" + v.uid +
        "\n涩图标签：" + tag +
        "\n涩图格式：" + v.ext +
        ((isR18 != 0 || cfg.picType == "url") ? "\n涩图链接：" + v.urls.regular : '' + setu.push(segment.image(v.urls.regular)))
      )
    })
    let abc = await this.reply(await e.runtime.common.makeForwardMsg(this.e, setu, "啊哈哈哈哈哈，涩图来咯～"), false, {
      recallMsg: 60
    })
    if (!abc) {
      return e.reply('涩图似乎被吞了', true, {
        recallMsg: 60
      })
    }

    return true
  }
}
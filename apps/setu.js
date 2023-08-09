import { segment } from "oicq";
import fetch from "node-fetch";
import plugin from '../../../lib/plugins/plugin.js';
import YAML from 'yaml'
import fs from 'fs'
import { makeForwardMsg } from '../models/utils.js'

export class setu extends plugin {
    constructor() {
        super({
            name: '涩图',
            dsc: '获取涩图信息',
            event: 'message',
            priority: 4000,
            rule: [
                {
                    reg: '^#来[1-9][0-9]*张.*(涩|色)图',
                    fnc: 'getSetu'
                }
            ]
        });
        
    }

    async getSetu(e) {
        
        await e.reply('正在给你找图片啦～',true,{recallMsg:7});
        var setu=[]
        setu.push("请复制链接去浏览器打开\n浏览器打不开就换个别的浏览器，比如via，Google")
        let index=e.msg.indexOf("张")
        var num=e.msg.substring(2,index)
        if(!num) num=1
        if(num > 20) num=20
        var isR18=0
        var tags=e.msg.substring(index+1,e.msg.length - 2).split(" ")
        let Ret = /^#来[1-9][0-9]*张.*(r|R)18(涩|色)图/.exec(e.msg)
        if (Ret) {
        tags=e.msg.substring(index+1,e.msg.length - 5).split(" ")
        isR18=1
        }
        var taglist=""
        if(tags){
          tags.forEach(a => {
            taglist+="&tag="+a
          })
        }
        let url = "https://api.lolicon.app/setu/v2?size=regular&r18="+isR18+"&num="+num+taglist;
        let response = await fetch(url);
        let obj = await response.json();
        if (obj.data.length < 1) {
          await this.reply("没有找到关于"+tags+"的色图",true,{recallMsg:60})
          return;
        }
        setu.push("尝试获取"+num+"张涩图\n共获取"+obj.data.length+"张涩图")
        logger.mark("尝试获取"+num+"张"+taglist+"涩图\n共获取"+obj.data.length+"张涩图")
        let set = await YAML.parse(fs.readFileSync('./plugins/TianRu-plugin/config/cfg.yaml','utf8'));
        obj.data.forEach(v => {
          var tag='';
          v.tags.forEach(t => {
            tag+=t+"、"
          })
          setu.push(
          "涩图pid："+v.pid+
          "\n涩图标题："+v.title+
          "\n涩图作者："+v.author+
          "\n作者uid："+v.uid+
          "\n涩图标签："+tag+
          "\n涩图格式："+v.ext+
          ((isR18 || set.picType == "url") ? "\n涩图链接："+v.urls.regular : '' + setu.push(segment.image(v.urls.regular)))
          )
        })
        var abc=await this.reply(await this.makeForwardMsg(this.e,setu,"啊哈哈哈哈哈，涩图来咯～"),false,{recallMsg:60});//recallmsg后为撤回间隔，单位秒）
        //var abc=await this.reply(segment.flash(obj.data[0].urls.original))
        
        if (!abc) {
            return e.reply('涩图似乎被吞了',true,{recallMsg:60});
        }

        return true;
    }
   async makeForwardMsg(e, msg = [], dec = '') {
  let nickname = "小冲怡神，大冲伤身"
  if (e.isGroup) {
    let info = await Bot.getGroupMemberInfo(e.group_id, Bot.uin)
    nickname = info.card || info.nickname
  }
  let userInfo = {
    user_id: e.user_id,
    nickname,
  }

  let forwardMsg = []
  msg.forEach(v => {
    forwardMsg.push({
      ...userInfo,
      message: v,
    })
  })

  /** 制作转发内容 */
  if (e.isGroup) {
    forwardMsg = await e.group.makeForwardMsg(forwardMsg)
  } else if (e.friend) {
    forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
  } else {
    return false
  }

  if (dec) {
    /** 处理描述 */
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${dec}</title>`)
  }

  return forwardMsg
}
}
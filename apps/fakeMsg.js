import plugin from '../../../lib/plugins/plugin.js'
import { NEWLINE } from '../models/utils.js'

const getName = (e,qq) => e.isGroup ? e.group.pickMember(qq).card : Bot.pickFriend(qq).nickname

const makeForwardMsg = async function (e, msg, dec) {
  var forward
  if (e.isGroup) forward = await e.group.makeForwardMsg(msg)
  else if (e.friend) forward = await e.friend.makeForwardMsg(msg)
  else return false
  if (!forward) return false
  if (dec) {
    /** 处理描述 */
    if (typeof (forward.data) === 'object') {
      let detail = forward.data?.meta?.detail
      if (detail) {
        let news = []
        if (dec.includes("\n")) {
          for (let i of dec.split("\n")) {
            news.push({ text: i })
          }
        }
        else {
          news.push({ text: dec })
        }
        detail.news = news
      }
    } else {
      var xml = ""
      if (dec.includes("\n")) {
        for (let i of dec.split("\n")) {
          xml += `<title color="#777777" size="26">${i}</title>`
        }
      } else {
        xml = `<title color="#777777" size="26">${dec}</title>`
      }
      forward.data = forward.data
        .replace(/\n/g, '')
        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
        .replace(/___+/, xml)
    }
  }
  return forward
}

export class fakeMsg extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '伪造聊天',
      /** 功能描述 */
      dsc: '伪造一些聊天记录',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 3000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^#伪造聊天(记录)?(.|${NEWLINE})*`,
          /** 执行方法 */
          fnc: 'fakeMsg'
        }
      ]
    })
  }


  async fakeMsg (e) {
    if (!this.e.isMaster){
      return true
    }
    var list = []
    let msg = e.msg
    let reg = /pic\[(.+)\]/
    for (let item of msg.substring(msg.indexOf(NEWLINE) + 1).split(NEWLINE)) {
      let space = item.indexOf(" ")
      let qq = Number(item.substring(0,space))
      var message = item.substring(space+1)
      let ret = reg.exec(message)
      if (ret) {
        message = segment.image(ret[1])
      } else {
        message = message.replaceAll("\\n","\n")
      }
      list.push({
        user_id: qq,
        nickname: getName(e,qq),
        message: message
      })
    }
    let dec = msg.substring(0,msg.indexOf("\n")).replace(/#?伪造聊天(记录)?/,"").trim().replaceAll("\\n","\n")
    let forwardMsg = await makeForwardMsg(e,list,dec)
    if (!forwardMsg) {
      logger.warn("[fakeMsg]制作聊天记录失败")
      return true
    }
    await e.reply(forwardMsg)
  }
}

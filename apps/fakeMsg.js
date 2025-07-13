const getName = (e, qq) => e.isGroup ? e.group.pickMember(qq).card : Bot.pickFriend(qq).nickname

export class fakeMsg extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '伪造聊天',
      /** 功能描述 */
      dsc: '伪造一些聊天记录',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 3000,
      rule: [{
        /** 命令正则匹配 */
        reg: `^#伪造聊天(记录)?(.|\r|\n)*`,
        /** 执行方法 */
        fnc: 'fakeMsg'
      }]
    })
  }


  async fakeMsg(e) {
    if (!this.e.isMaster) return true
    var list = []
    let msg = e.msg
    let reg = /pic\[(.+)\]/
    let reg_newline = /\r|\n/
    for (let item of msg.substring(reg_newline.exec(msg).index + 1).split(reg_newline)) {
      let space = item.indexOf(" ")
      let qq = Number(item.substring(0, space))
      var message = item.substring(space + 1)
      let ret = reg.exec(message)
      if (ret) {
        message = segment.image(ret[1])
      } else {
        message = message.replaceAll("\\n", "\n")
      }
      list.push({
        user_id: qq,
        nickname: getName(e, qq),
        message: message
      })
    }
    let dec = msg.substring(0, msg.indexOf("\n")).replace(/#?伪造聊天(记录)?/, "").trim().replaceAll("\\n", "\n")
    if (e?.isGroup) return e.bot.adapter.sendGroupForwardMsg(e, list)
    else if (e?.friend) return e.bot.adapter.sendFriendForwardMsg(e, list)
    else return logger.warn("伪造失败")
  }
}
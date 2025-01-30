
export class whoami extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '我是XXX',
      /** 功能描述 */
      dsc: '模拟群u执行指令',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: -114514,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^#我是`,
          /** 执行方法 */
          fnc: 'whoami'
        }
      ]
    })
  }


  async whoami (e) {
    if (!this.e.isMaster) return false
    // Pick user_id
    let QQnumber = -1
    let QQreg = /[1-9][0-9]{4,12}/
    let msg = e.msg
    let command = ''
    // 如果e有at 属性，则赋值为e.at
    if (e.at && QQreg.test(e.at)) {
      QQnumber = e.at
      command = msg.substring(3)
    } else {
      const QQret = QQreg.exec(e.msg)
      if (!QQret) {
        e.reply('请输入群友 QQ 号，或者直接 @群友')
        return true
      }
      let match = /\r|\n/.exec(msg)
      if (match) {
        QQnumber = QQret[0].toString()
        command = msg.substring(match.index + 1)
      } else {
        e.reply('请输入命令')
        return true
      }
    }    
    
    Bot.em("message", {
      self_id: this.e.self_id,
      message_id: this.e.message_id,
      user_id: QQnumber,
      sender: {
        user_id: QQnumber,
        nickname: '',
        card: '',
        role: '',
        title: '',
        level: ''
      },
      reply: this.reply.bind(this),
      post_type: "message",
      message_type: 'private',
      sub_type: 'normal',
      message: [{ type: "text", text: command }],
      raw_message: command,
    })
  }
}

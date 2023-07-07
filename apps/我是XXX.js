import plugin from '../../../lib/plugins/plugin.js'

export class example extends plugin {
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
          reg: '^#我是.*\n#.*',
          /** 执行方法 */
          fnc: 'whoami'
        }
      ]
    })
  }


  async whoami (e) {
    if (!this.e.isMaster) return false
    let QQreg = /[1-9][0-9]{4,12}/
    let QQret = QQreg.exec(e.toString())
    if (!QQret) return false
    let msg = e.msg.toString()
    e.msg = msg.substring(msg.indexOf("\n") + 1)
    logger.mark(e.msg)
    e.original_msg = e.msg
    e.user_id = QQret[0].toString()
    logger.mark(e.user_id)
    e.at = 0
    e.uid = 0
    return false
  }
}

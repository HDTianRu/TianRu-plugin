import plugin from '../../../lib/plugins/plugin.js'
import { getUid } from '../models/utils.js'
import Runtime from '../../../lib/plugins/runtime.js'

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
    
    e.msg = command
    e.original_msg = e.msg
    e.user_id = QQnumber * 1
    e.at = 0
    await Runtime.init(e)
    e.sender = e.isGroup ? e.group.pickMember(e.user_id) : Bot.pickUser(e.user_id)
    e.uid = await getUid(e)
    return false
  }
}

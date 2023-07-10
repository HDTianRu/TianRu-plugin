import plugin from '../../../lib/plugins/plugin.js'
import {getUid} from '../models/utils.js'

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
          reg: '^#我是.*\n.*',
          /** 执行方法 */
          fnc: 'whoami'
        }
      ]
    })
  }
/*
logObj(obj) {
  logger.mark(Object.prototype.toString.call(obj));
  logger.mark(typeof(obj));
  for (let key in obj) {
    if (typeof obj[key] === 'function') {
      logger.mark("function:"+key);
      continue;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      //this.logObj(obj[key]);
      logger.mark("object:"+key);
      continue;
    } else {
      logger.mark(key+":"+obj[key]);
    }
  }
}*/

  async whoami (e) {
    if (!this.e.isMaster) return false
    let QQreg = /[1-9][0-9]{4,12}/
    let QQret = QQreg.exec(e.toString())
    if (!QQret) return true
    let msg = e.toString()
    e.msg = msg.substring(msg.indexOf("\n") + 1)
    e.original_msg = e.msg
    e.user_id = QQret[0].toString() * 1
    e.at = 0
    e.uid = await getUid(e)
    /*
    咕咕咕，还没搞明白这些东西，正在研究
    this.logObj(e.runtime.user)
    this.logObj(e.user.mysUsers)*/
    return false
  }
}

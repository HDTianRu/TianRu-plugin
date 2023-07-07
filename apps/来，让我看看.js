import plugin from '../../../lib/plugins/plugin.js'
import Gacha from '../../miao-plugin/apps/gacha/Gacha.js'

export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '让我看看',
      /** 功能描述 */
      dsc: '偷看群u抽卡记录XD',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#让我看看 ?(全部|抽卡|抽奖|角色|武器|常驻|up|版本)+池?(记录|祈愿|分析|统计).*',
          /** 执行方法 */
          fnc: 'see'
        }
      ]
    })
  }


  async see (e) {
    if (!this.e.isMaster){
    await this.reply("不要啦",true)
    return true
    }
    let reg = /(全部|抽卡|抽奖|角色|武器|常驻|up|版本)+池?(记录|祈愿|分析|统计)/
    let ret = reg.exec(e.msg)
    if (!ret) return true
    let QQreg = /[1-9][0-9]{4,12}/
    let QQret = QQreg.exec(e.toString())
    if (!QQret) return true
    e.msg = "#" + ret[0].toString()
    e.original_msg = e.msg
    e.user_id = QQret[0].toString()
    e.at = 0
    e.uid = 0
    if (/(全部|抽卡|抽奖|角色|武器|常驻|up|版本)+池?(统计)/.test(msg)) Gacha.stat(e)
    else Gacha.detail(e)
    return true;
  }
}

import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'

export class pai extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '作图',
      /** 功能描述 */
      dsc: '对头像作图',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(拍|咬|捣|顶) ?(@.*|[0-9]{5,12})?',
          /** 执行方法 */
          fnc: 'makePic'
        }
      ]
    })
  }

  /**
   * #一言
   * @param e oicq传递的事件参数e
   */
  async makePic (e) {
    var qq = e.user_id
    let qqRet = /[0-9]{5,12}/.exec(e.toString())
    if (qqRet) {
      qq = qqRet[0]
    } else {
    await this.reply("请艾特一个人或输入QQ号，艾特不能复制")
    return true
    }
    let list={"拍":"http://ovooa.com/API/face_pat/?QQ=","咬":"http://ovooa.com/API/face_suck/?QQ=","捣":"http://ovooa.com/API/face_pound/?QQ=","顶":"http://ovooa.com/API/face_play/?QQ="}
    let Ret = /拍|咬|捣|顶/.exec(e.msg)
    await this.reply(segment.image(list[Ret[0]]+qq))
  }
}

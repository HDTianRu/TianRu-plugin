import plugin from '../../../lib/plugins/plugin.js'
import { NEWLINE } from '../models/utils.js'
import lodash from 'lodash'

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
    if (!this.e.isMaster) return true
    let list = []
    for (let item of e.msg.substring(e.msg.indexOf(NEWLINE) + 1).split(NEWLINE)) {list.push({user_id: Number(item.substring(0,item.indexOf(" "))),nickname: ((e,qq) => e.isGroup ? e.group.pickMember(qq).card : Bot.pickFriend(qq).nickname)(e,Number(item.substring(0,item.indexOf(" ")))),message: item.substring(item.indexOf(" ")+1).replaceAll("\\n","\n")})}
    (await e.reply(e.isGroup ? await e.group.makeForwardMsg(list) : (e.friend ? await e.friend.makeForwardMsg(list) : false))) ? "yeeeee~" : logger.warn("[fakeMsg]制作聊天记录/发送消息失败")
  }
}

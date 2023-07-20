import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import { NEWLINE } from '../models/utils.js'

export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '执行sh',
      /** 功能描述 */
      dsc: '执行shell命令',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 3000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^#执行sh(.|${NEWLINE})*`,
          /** 执行方法 */
          fnc: 'eval'
        }
      ]
    })
  }

  /**
   * #一言
   * @param e oicq传递的事件参数e
   */
  async eval (e) {
    if (!this.e.isMaster){
    await this.reply("还想执行shell？想得美哦～",true)
    return true
    }
    this.reply("正在执行....",true)
  exec(e.msg.substring(e.msg.indexOf(NEWLINE)), (e, so, se) => {
  this.reply("err："+e+"\nstdout："+so+"\nstderr："+se,true)
  logger.mark("err："+e+"\nstdout："+so+"\nstderr："+se)
});
  }
}

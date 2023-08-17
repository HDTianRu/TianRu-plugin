import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import { makeForwardMsg } from '../models/utils.js'

export class remote extends plugin {
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
          reg: `^#执行sh[\\s\\S]+`,
          /** 执行方法 */
          fnc: 'remote'
        },
        {
          /** 命令正则匹配 */
          reg: `^#执行js[\\s\\S]+`,
          /** 执行方法 */
          fnc: 'remoteJs'
        }
      ]
    })
  }

  async remote (e) {
    if (!this.e.isMaster){
      await this.reply("还想执行shell？想得美哦～",true)
      return true
    }
    this.reply("正在执行....",true)
    let cmd = e.msg.replace("#执行sh","").trim()
    exec(cmd, (e, so, se) => {
      let msg = []
      if (so) {
        msg.push(so)
      }
      if (se) {
        msg.push(`执行错误输出:\n${se}`)
      }
      if (e) {
        msg.push(`执行错误:\n${e}`)
      }
      this.e.reply(makeForwardMsg(this.e,msg))
    });
  }
  
  async remoteJs (e) {
    if (!this.e.isMaster){
      await this.reply("还想执行js？想得美哦～",true)
      return true
    }
    this.reply("正在执行....",true)
    let msg = []
    let cmd = e.msg.replace("#执行js","").trim()
    try {
      msg.push(await eval(cmd))
    } catch (e) {
      msg.push(`执行错误:\n${e.toString()}`)
    }
    if (msg.filter(item => item !== undefined && item !== '').length != 0) this.e.reply(makeForwardMsg(this.e,msg))
  }
}

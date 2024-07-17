import { pluginName } from "../config/constant.js"
let Update = null
try {
  Update = (await import("../../other/update.js").catch(e => null))?.update
  Update ||= (await import("../../system/apps/update.ts")).update
} catch (e) {
  logger.error(`[${pluginName}]未获取到更新js ${logger.yellow("更新功能")} 将无法使用`)
}

export class update extends plugin {
  constructor() {
    super({
      name: "天如插件更新",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: `^#*(天如|${pluginName})(插件)?(强制)?更新|^#*(强制)?更新(天如|${pluginName})(插件)?`,
          fnc: "update"
        },
        {
          reg: `^#?(天如|${pluginName})(插件)?更新日志`,
          fnc: "update_log"
        }
      ]
    })
  }

  async update(e = this.e) {
    if (!e.isMaster) return
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新${pluginName}`
    const up = new Update(e)
    up.e = e
    return up.update()
  }

  async update_log() {
    let Update_Plugin = new Update()
    Update_Plugin.e = this.e
    Update_Plugin.reply = this.reply

    if (Update_Plugin.getPlugin(pluginName)) {
      this.e.reply(await Update_Plugin.getLog(pluginName))
    }
    return true
  }
}

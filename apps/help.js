import lodash from 'lodash'
import fs from 'fs'
import { Cfg, Version, Common, Data } from '../components/index.js'
import HelpTheme from './help/HelpTheme.js'

const _path = process.cwd()
const helpPath = `${_path}/plugins/TianRu-plugin/resources/help`

export class help extends plugin {
	constructor() {
		super({
			name: '[天如插件]帮助',
			dsc: '天如帮助',
			event: 'message',
			priority: 100,
			rule: [
				{
					reg: "^#?(天如|(T|t)ian(R|r)u)(命令|帮助|菜单|help|说明|功能|指令|使用说明)$",
					fnc: 'help'
				},
                {
                    reg: "^#?天如版本$",
					fnc: 'versionInfo'
                }
			]
		})
	}

async help (e) {

  let custom = {}
  let help = {}
  let { diyCfg, sysCfg } = await Data.importCfg('help')

  // 兼容一下旧字段
  if (lodash.isArray(help.helpCfg)) {
    custom = {
      helpList: help.helpCfg,
      helpCfg: {}
    }
  } else {
    custom = help
  }

  let helpConfig = lodash.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList

  let helpGroup = []

  lodash.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    lodash.forEach(group.list, (help) => {
      let icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        let x = (icon - 1) % 10
        let y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  let themeData = await HelpTheme.getThemeData(diyCfg.helpCfg || {}, sysCfg.helpCfg || {})
  return await Common.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    ...themeData,
    element: 'default'
  }, { e, scale: 1.2 })
}

async versionInfo (e) {
  return await Common.render('help/version-info', {
    currentVersion: Version.version,
    changelogs: Version.changelogs,
    elem: 'anemo'
  }, { e, scale: 1.2 })
}
}

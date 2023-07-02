import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import lodash from 'lodash'
import GachaLog from '../../genshin/model/gachaLog.js'
import moment from 'moment';
import User from "../../xiaoyao-cvs-plugin/model/user.js"

export class QRCode extends plugin {
  constructor() {
    super({
      name: "提瓦特小助手抽卡记录",
      dsc: "自动获取提瓦特小助手抽卡记录并保存",
      event: "message",
      priority: 10,
      rule: [
        {
          reg: "^#?(获取|更新)(提瓦特)?小助手(抽卡|祈愿)?(记录|历史)",
          fnc: "getGcLog"
        }
      ]
    })

    this.pool = [
      { type: 301, typeName: '角色活动' },
      { type: 302, typeName: '武器活动' },
      { type: 200, typeName: '常驻' }
    ]

    this.typeName = {
      301: '角色',
      302: '武器',
      200: '常驻'
    }
  }

  async getGcLog(e) {
	let user = new User(e);
	await user.cookie(e)
	let authkey = await getAuthKey(e, user)
	if (!authkey) {
		return true;
	}
    if (!e.uid) {
	  e.uid = e?.runtime?.user?._regUid
	}
	let url = "https://www.lelaer.com/outputGacha.php"
    let gachaURL = encodeURIComponent(`https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=301&gacha_id=fecafa7b6560db5f3182222395d88aaa6aaac1bc&timestamp=${Math.floor(Date.now() / 1000)}&lang=zh-cn&device_type=mobile&plat_type=ios&region=${e.region}&authkey=${encodeURIComponent(authkey)}&game_biz=hk4e_cn&gacha_type=301&page=1&size=5&end_id=0`)
    let body = `uid=${e.uid}&gachaurl=${gachaURL}&lang=zh-Hans`
    let param = {
	  headers: {
	    "Host": "www.lelaer.com",
	    "Content-Type": "application/x-www-form-urlencoded"
	  },
	  timeout: 10000,
	  method: 'post',
	  body: body
	}
    let response = await fetch(url, param)
    let json = await response.json()
    if (!response || response?.code == 400) {
      await e.reply("更新失败")
      return true
    }
    let data = dealJson(json.list)
    if (!data) return false
    /** 保存json */
    let msg = []
    for (let type in data) {
      if (!this.typeName[type]) continue
      let gachLog = new GachaLog(this.e)
      gachLog.uid = e.uid
      gachLog.type = type
      gachLog.writeJson(data[type])

      msg.push(`${this.typeName[type]}记录：${data[type].length}条`)
    }

    await this.e.reply(`导入成功\n${msg.join('\n')}`)
  }
}

  async function getAuthKey(e, user) {
	if (!e.uid) {
		e.uid = e?.runtime?.user?._regUid
	}
	e.region = getServer(e.uid)
	let authkeyrow = await user.getData("authKey", {});
	if (!authkeyrow?.data) {
		e.reply(`uid:${e.uid},authkey获取失败：` + (authkeyrow.message.includes("登录失效") ? "请重新绑定stoken" : authkeyrow.message))
		return false;
	}
	return authkeyrow.data["authkey"];
  }
  
  function getServer(uid) {
	switch (String(uid)[0]) {
		case '1':
		case '2':
			return 'cn_gf01' // 官服
		case '5':
			return 'cn_qd01' // B服
		case '6':
			return 'os_usa' // 美服
		case '7':
			return 'os_euro' // 欧服
		case '8':
			return 'os_asia' // 亚服
		case '9':
			return 'os_cht' // 港澳台服
	}
	return 'cn_gf01'
  }

  function dealJson (list) {
    let data = {}

    /** 必要字段 */
    let reqField = ['gacha_type', 'item_type', 'name', 'time']

    for (let v of reqField) {
      if (!list[0][v]) {
        this.e.reply(`json文件内容错误：缺少必要字段${v}`)
        return false
      }
    }

    /** 倒序 */
    if (moment(list[0].time).format('x') < moment(list[list.length - 1].time).format('x')) {
      list = list.reverse()
    }

    for (let v of list) {
      if (!data[v.uigf_gacha_type]) data[v.uigf_gacha_type] = []
      data[v.uigf_gacha_type].push(v)
    }

    return data
  }
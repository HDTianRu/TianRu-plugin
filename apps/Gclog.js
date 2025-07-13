import fetch from 'node-fetch'
import lodash from 'lodash'
import GachaLog from '../../genshin/model/gachaLog.js'
import moment from 'moment'
import { _path } from '../models/path.js'
import fs from 'node:fs'
import { getUid, makeForwardMsg } from '../model/utils.js'

export class Gclog extends plugin {
  constructor() {
    super({
      name: "提瓦特小助手抽卡记录",
      dsc: "自动获取提瓦特小助手抽卡记录并保存",
      event: "message",
      priority: 10,
      rule: [
        {
          reg: "^#?(获取|更新)(提瓦特)?小助手(抽卡|祈愿)?(记录|历史)( *|(\r|\n)*)(https.*)?",
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
    var authkey
    let urlRet = /https.*/
    let ret = urlRet.exec(this.e.msg)
    if (ret) {
      this.e.uid = await getUid(this.e)
      this.e.msg = ret[0]
      this.logUrl(e)
      return true
    } else if (fs.existsSync(`${_path}/plugins/xiaoyao-cvs-plugin`)) {
      try {
        const User = (await import("../../xiaoyao-cvs-plugin/model/user.js")).default
        let user = new User(e);
        await user.cookie(e)
        authkey = await getAuthKey(e, user)
        if (!authkey) {
          return true;
        }
      } catch (err) {
        logger.error(err)
      }
    } else {
      if (!this.e.uid) {
        this.e.uid = e?.runtime?.user?._regUid || await getUid(this.e)
      }
      let gacha = new GachaLog(e)
      gacha.uid = this.e.uid
      /** 获取authkey */
      authkey = await redis.get(`${gacha.urlKey}${gacha.uid}`)
      if (!authkey) {
        this.e.reply("请私聊发送抽卡记录链接",true)
        this.setContext('logUrl')
        return true
      }
      
      /** 调一次接口判断是否有效 */
      let res = await gacha.logApi({ gacha_type: 301, authkey, region: gacha.getServer() })

      /** key过期，或者没有数据 */
      if (res.retcode !== 0 || !res?.data?.list || res.data.list.length <= 0) {
        logger.debug(`${this.e.logFnc} ${res.message || 'error'}`)
        this.e.reply("请私聊发送抽卡记录链接",true)
        this.setContext('logUrl')
        return true
      }
    }
    if(!this.e.region) this.e.region = getServer(this.e.uid)
    this.e.authkey = authkey
    this._getGcLog(e)
    return true
  }
  
  async logUrl (e) {
    if (!this.e.uid) {
      this.e.uid = e?.runtime?.user?._regUid || await getUid(this.e)
    }
    let gacha = new GachaLog(e)
    gacha.uid = this.e.uid
    let url = this.e.msg
    let param = gacha.dealUrl(url)
    if (!param) {
      this.finish('logUrl')
      return
    }
    if (!await gacha.checkUrl(param)) {
      this.e.reply("链接错误")
      this.finish('logUrl')
      return
    }
    this.e.authkey = param.authkey
    this.e.region = param.region
    this._getGcLog(e)
    this.finish('logUrl')
  }

  async _getGcLog (e) {
    if (!this.e.authkey) return true
    if (!this.e.uid) {
      this.e.uid = e?.runtime?.user?._regUid || await getUid(this.e)
    }
    logger.mark(this.e.uid)
    let gachaURL = encodeURIComponent(`https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=301&gacha_id=fecafa7b6560db5f3182222395d88aaa6aaac1bc&timestamp=${Math.floor(Date.now() / 1000)}&lang=zh-cn&device_type=mobile&plat_type=ios&region=${this.e.region}&authkey=${encodeURIComponent(this.e.authkey)}&game_biz=hk4e_cn&gacha_type=301&page=1&size=5&end_id=0`)
    let url = "https://www.lelaer.com/outputGacha.php"
    let body = `uid=${this.e.uid}&gachaurl=${gachaURL}&lang=zh-Hans`
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
    let list = json?.list
    if (!json || !list) {
      await this.e.reply(`更新失败 ${json?.result}`)
      logger.mark(json)
      return true
    }
    if (!list?.length || list?.length <= 0) {
      await this.e.reply("\"提瓦特小助手\"抽卡记录为空")
      return true
    }
    let data = dealJson(list,e)
    if (!data) return true
    /** 保存json */
    let msg = []
    let gachaLog = new GachaLog(this.e)
    gachaLog.uid = this.e.uid
    for (let type in data) {
      if (!this.typeName[type]) continue
      gachaLog.type = type
      let log = gachaLog.readJson()
      let finalJson = mergeJson(log.list, data[type])
      gachaLog.writeJson(finalJson)

      msg.push(`${this.typeName[type]}记录：${data[type].length}条，现共${finalJson.length}条`)
    }

    msg.push("导入成功")
    //await this.e.reply(makeForwardMsg(e,msg))
    await this.e.reply(msg.join("\n"))
  }
}

async function getAuthKey(e, user) {
  if (!e.uid) {
    e.uid = e?.runtime?.user?._regUid || getUid(e)
  }
  e.region = getServer(e.uid)
  let authkeyrow = await user.getData("authKey", {});
  if (!authkeyrow?.data) {
    e.reply(`uid:${e.uid},authkey获取失败：` + (authkeyrow.message.includes("登录失效") ? "请在指令后跟上抽卡链接或重新绑定stoken" : authkeyrow.message))
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

function dealJson (list,e) {
  let data = {}

  /** 必要字段 */
  let reqField = ['gacha_type', 'item_type', 'name', 'time']

  for (let v of reqField) {
    if (!list[0][v]) {
      e.reply(`json文件内容错误：缺少必要字段${v}`)
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

function mergeJson(json,jsonNew) {
  function unique(arr){
    const res = new Map()
    return arr.filter((a) => !res.has(a.id) && res.set(a.id,1))
  }
  return unique(json.concat(jsonNew)).sort((a,b) => {
    return Number(b.id) - Number(a.id)
  })
}
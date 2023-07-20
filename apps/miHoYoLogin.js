import _ from "lodash"
import crypto from "crypto"
import fetch from "node-fetch"
import QR from "qrcode"

const regex = "^#?(米哈?游社?登(录|陆|入)|登(录|陆|入)米哈?游社?)"
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDvekdPMHN3AYhm/vktJT+YJr7cI5DcsNKqdsx5DZX0gDuWFuIjzdwButrIYPNmRJ1G8ybDIF7oDW2eEpm5sMbL9zs
9ExXCdvqrn51qELbqj0XxtMTIpaCHFSI50PfPpTFV9Xt/hmyVwokoOXFlAEgCn+Q
CgGs52bFoYMtyi+xEQIDAQAB
-----END PUBLIC KEY-----`
const app_id = 8

function random_string(n) {
  return _.sampleSize("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", n).join("")
}

function encrypt_data(data) {
  return crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, data).toString("base64")
}

function md5(data) {
  return crypto.createHash("md5").update(data).digest("hex")
}

function ds(data) {
  const t = Math.floor(Date.now()/1000)
  const r = random_string(6)
  const h = md5(`salt=JwYDpKvLj6MrMqqYU6jTKF17KNO2PXoS&t=${t}&r=${r}&b=${data}&q=`)
  return `${t},${r},${h}`
}

function sleep(ms) {
  return new Promise(resolve=>setTimeout(resolve, ms))
}

async function request(url, data, aigis) {
  return await fetch(url, {
    method: "post",
    body: data,
    headers: {
      "x-rpc-app_version": "2.41.0",
      "DS": ds(data),
      "x-rpc-aigis": aigis,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-rpc-game_biz": "bbs_cn",
      "x-rpc-sys_version": "12",
      "x-rpc-device_id": random_string(16),
      "x-rpc-device_fp": random_string(13),
      "x-rpc-device_name": random_string(16),
      "x-rpc-device_model": random_string(16),
      "x-rpc-app_id": "bll8iq97cem8",
      "x-rpc-client_type": "2",
      "User-Agent": "okhttp/4.8.0"
    }
  })
}

const errorTips = "登录失败，请检查日志\nhttps://Yunzai.TRSS.me"
const accounts = {}
const Running = {}

export class miHoYoLogin extends plugin {
  constructor() {
    super({
      name: "米哈游登录",
      dsc: "米哈游登录",
      event: "message",
      priority: 10,
      rule: [
        {
          reg: `${regex} `,
          event: "message.private",
          fnc: "miHoYoLoginDetect"
        },
        {
          reg: `${regex}$`,
          event: "message.private",
          fnc: "miHoYoLoginQRCode"
        },
        {
          reg: "^#?(体力|(c|C)(oo)?k(ie)?|(s|S)(to)?k(en)?)(帮助|教程)$",
          fnc: "miHoYoLoginHelp"
        }
      ]
    })
  }

  async miHoYoLoginDetect(e) {
    accounts[this.e.user_id] = this.e
    this.setContext("miHoYoLogin")
    await await this.reply("请发送密码", true)
  }

  async crack_geetest(gt, challenge) {
    let res
    await this.reply(`请完成验证：https://challenge.minigg.cn/manual/index.html?gt=${gt}&challenge=${challenge}`, true)
    for (let n=1;n<60;n++) {
      await sleep(5000)
      try {
        res = await fetch(`https://challenge.minigg.cn/manual/?callback=${challenge}`)
        res = await res.json()
        if (res.retcode == 200) {
          return res.data
        }
      } catch (err) {
        logger.error(`[米哈游登录] 错误：${logger.red(err)}`)
      }
    }
    await this.reply("验证超时", true)
    return false
  }

  async miHoYoLogin(e) {
    if(!this.e.msg)return false
    this.finish("miHoYoLogin")
    if (Running[this.e.user_id]) {
      await this.reply("有正在进行的登录操作，请完成后再试……", true)
      return false
    }
    Running[this.e.user_id] = true

    const password = this.e.msg.trim()
    this.e = accounts[this.e.user_id]
    const account = this.e.msg.replace(new RegExp(`${regex} `), "").trim()

    const data = JSON.stringify({
      account: encrypt_data(account),
      password: encrypt_data(password)
    })

    const url = "https://passport-api.mihoyo.com/account/ma-cn-passport/app/loginByPassword"
    let res = await request(url, data, "")
    const aigis_data = JSON.parse(res.headers.get("x-rpc-aigis"))
    res = await res.json()
    logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(res))}`)

    if (res.retcode == -3101) {
      logger.mark("[米哈游登录] 正在验证")
      const aigis_captcha_data = JSON.parse(aigis_data.data)
      const challenge = aigis_captcha_data.challenge
      const validate = await this.crack_geetest(aigis_captcha_data.gt, challenge)
      if (validate.geetest_validate) {
        logger.mark("[米哈游登录] 验证成功")
      } else {
        logger.error("[米哈游登录] 验证失败")
        Running[this.e.user_id] = false
        return false
      }

      const aigis = aigis_data.session_id + ";" + Buffer.from(JSON.stringify({
        geetest_challenge: challenge,
        geetest_seccode: validate.geetest_validate + "|jordan",
        geetest_validate: validate.geetest_validate
      })).toString("base64")

      res = await request(url, data, aigis)
      res = await res.json()
      logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(res))}`)
    }

    if (res.retcode == 0) {
      let cookie = await fetch(`https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoBySToken?stoken=${res.data.token.token}&mid=${res.data.user_info.mid}`)
      cookie = await cookie.json()
      logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(cookie))}`)
      await this.reply(`ltoken=${res.data.token.token};ltuid=${res.data.user_info.aid};cookie_token=${cookie.data.cookie_token};login_ticket=${res.data.login_ticket}`)
      await this.reply(`stoken=${res.data.token.token};stuid=${res.data.user_info.aid};mid=${res.data.user_info.mid}`)
      await this.reply("登录完成，以上分别是 Cookie 和 Stoken，发送给 Bot 完成绑定", true)
    } else {
      await this.reply(`错误：${JSON.stringify(res)}`, true)
      Running[this.e.user_id] = false
      return false
    }

    Running[this.e.user_id] = false
  }

  async miHoYoLoginQRCode(e) {
    if (Running[this.e.user_id]) {
      await this.reply("有正在进行的登录操作，请完成后再试……", true)
      return false
    }
    Running[this.e.user_id] = true

    const device = random_string(64)
    let res = await fetch("https://hk4e-sdk.mihoyo.com/hk4e_cn/combo/panda/qrcode/fetch", {
      method: "post",
      body: JSON.stringify({ app_id, device })
    })
    res = await res.json()
    logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(res))}`)

    const url = res.data.url
    const ticket = url.split("ticket=")[1]
    const img = (await QR.toDataURL(url)).replace("data:image/png;base64,", "base64://")
    await this.reply(["请使用米游社扫码登录", segment.image(img)], true)

    let data
    for (let n=1;n<60;n++) {
      await sleep(5000)
      try {
        res = await fetch("https://hk4e-sdk.mihoyo.com/hk4e_cn/combo/panda/qrcode/query", {
          method: "post",
          body: JSON.stringify({ app_id, device, ticket })
        })
        res = await res.json()

        if (res.retcode != 0) {
          await this.reply("二维码已过期，请重新登录", true)
          Running[this.e.user_id] = false
          return false
        }

        if (res.data.stat == "Scanned") {
          logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(res))}`)
          await this.reply("二维码已扫描，请确认登录", true)
        }

        if (res.data.stat == "Confirmed") {
          logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(res))}`)
          data = JSON.parse(res.data.payload.raw)
          break
        }
      } catch (err) {
        logger.error(`[米哈游登录] 错误：${logger.red(err)}`)
      }
    }

    if (!(data.uid&&data.token)) {
      await this.reply(errorTips, true)
      Running[this.e.user_id] = false
      return false
    }

    res = await request(
      "https://passport-api.mihoyo.com/account/ma-cn-session/app/getTokenByGameToken",
      JSON.stringify({ account_id: parseInt(data.uid), game_token: data.token }),
      ""
    )
    res = await res.json()
    logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(res))}`)

    let cookie = await fetch(`https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoByGameToken?account_id=${data.uid}&game_token=${data.token}`)
    cookie = await cookie.json()
    logger.mark(`[米哈游登录] ${logger.blue(JSON.stringify(cookie))}`)

    await this.reply(`ltoken=${res.data.token.token};ltuid=${res.data.user_info.aid};cookie_token=${cookie.data.cookie_token}`)
    await this.reply(`stoken=${res.data.token.token};stuid=${res.data.user_info.aid};mid=${res.data.user_info.mid}`)
    await this.reply("登录完成，以上分别是 Cookie 和 Stoken，发送给 Bot 完成绑定", true)

    Running[this.e.user_id] = false
  }

  async miHoYoLoginHelp(e) {
    await this.reply("二维码登录：私聊发送【米哈游登录】\n账号密码登录：私聊发送【米哈游登录 账号】", true)
  }
}
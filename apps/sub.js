import linkify from "linkify-it"

export class sub extends plugin {
  constructor() {
    super({
      name: 'sub',
      dsc: '查询订阅信息',
      event: 'message',
      priority: 0,
      rule: [{
        reg: '^#?sub',
        fnc: 'sub'
      }]
    })
  }

  /*async accept(e) {
    const url = urls(e.raw_message)
    logger.mark(url)
    if (!url) return
    e.reply(
      (await Promise.all(url.map(getSubscriptionInfo).filter(Boolean))).join("\n")
    )
  }*/

  async sub(e) {
    const url = urls(e.raw_message)
    logger.mark(url)
    if (!url) return
    e.reply(
      (await Promise.all(url.map(getSubscriptionInfo).filter(Boolean))).join("\n")
    )
  }
}

function urls(text) {
  const ret = linkify.match(text)
    .filter(m => m.schema === 'http:' || m.schema === 'https:')
    .map(m => m.url)
  return ret
}

async function getSubscriptionInfo(sub) {
  try {
    const response = await fetch(sub, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mihomo/1.18.3'
      }
    })
    if (!response.ok) return
    const infoHeader = response.headers.get('subscription-userinfo')
    if (!infoHeader) return
    const data = {}
    info.split(/; ?/).forEach(item => {
      const [key, value] = item.trim().split('=')
      if (key && value) data[key] = parseInt(value)
    })

    const GB = 1024 * 1024 * 1024
    const used = (data.upload + data.download) / GB
    const total = data.total / GB
    const remaining = total - used
    const expire = data.expire ? new Date(data.expire * 1000).toLocaleString() : "永不过期"
    /*return {
      used,
      total,
      remaining,
      expire
    }*/
    return `订阅信息:
链接: ${sub}
流量信息: ${used.toFixed(2)}/${total.toFixed(2)}
剩余流量: ${remaining.toFixed(2)}
过期时间: ${expire}`
  } catch (e) {
    return
  }
}
import linkify_lib from "linkify-it"
const linkify = linkify_lib()

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

  async accept(e) {
    const url = urls(e.raw_message)
    if (!url) return null
    e.reply(
      (await Promise.all(url?.map(getSubscriptionInfo)?.filter(Boolean)))?.join("\n")
    )
  }

  /*async sub(e) {
    const url = urls(e.raw_message)
    if (!url) return
    e.reply(
      (await Promise.all(url.map(getSubscriptionInfo).filter(Boolean))).join("\n")
    )
  }*/
}

function urls(text) {
  const ret = linkify.match(text)
    ?.filter(m => m.schema === 'http:' || m.schema === 'https:')
    ?.map(m => m.url)
  return ret
}

function formatStorage(bytes) {
    if (bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
    }
    return `${parseFloat(value.toFixed(1))}${units[i]}`;
}

async function getSubscriptionInfo(sub) {
  try {
    const response = await fetch(sub, {
      method: 'GET',
      headers: {
        'User-Agent': 'clash/clash.meta/Mihomo/1.18.3'
      }
    })
    if (!response.ok) return null
    const info = response.headers.get('subscription-userinfo')
    if (!info) return null
    const data = Object.fromEntries(info.split(";").map(i => i.trim().split('=')))
    logger.mark(sub, data)
    const used = Number(data.upload) + Number(data.download)
    const total = data.total
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
已用流量: ${formatStorage(used)}/${formatStorage(total)}
剩余流量: ${formatStorage(remaining)}
过期时间: ${expire}`
  } catch (e) {
    return null
  }
}
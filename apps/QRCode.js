import { segment } from "oicq"
import QR from "qrcode"

export class QRCode extends plugin {
  constructor() {
    super({
      name: "二维码生成",
      dsc: "二维码生成",
      event: "message",
      priority: 10,
      rule: [
        {
          reg: "^#?二维码 .+",
          fnc: "QRCode"
        }
      ]
    })
  }

  async QRCode(e) {
    let msg = this.e.msg.replace(/#?二维码/, "").trim()
    logger.mark(`[二维码生成] 信息：${logger.blue(msg)}`)
    let img = await QR.toDataURL(msg)
    img = img.replace("data:image/png;base64,", "base64://")
    await this.reply(segment.image(img), true)
  }
}
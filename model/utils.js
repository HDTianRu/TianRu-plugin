import NoteUser from '../../genshin/model/mys/NoteUser.js'
import common from '../../../lib/common/common.js'
import os from 'os'

const _getUid = async function (qq) {
  let user = await NoteUser.create(qq)
  return user.uid
}

const getUid = async function (e, set = false) {
  var qq = e
  var ise = false
  if (e && e.user_id) {
    qq = e.user_id
    ise = true
  }
  let uid = await _getUid(qq)
  if (set && ise) {
    e.uid = uid
  }
  return uid
}

const makeForwardMsg = async function (e, msg = [], dec = '', onlyMsg = false, msgsscr = false) {
  if (typeof(msg) === "string") {
    if (msg == "") return false
    return await common.makeForwardMsg(e, [msg], dec, msgsscr)
  }
  if (msg.length == 0) return false
  if (onlyMsg || typeof(msg[0]) === "string") return await common.makeForwardMsg(e, msg, dec, msgsscr)
  
  var forward
  if (e.isGroup) forward = await e.group.makeForwardMsg(msg)
  else if (e.friend) forward = await e.friend.makeForwardMsg(msg)
  else return false
  if (!forward) return false
  if (dec) {
    /** 处理描述 */
    if (typeof (forward.data) === 'object') {
      let detail = forward.data?.meta?.detail
      if (detail) {
        let news = []
        if (dec.includes("\n")) {
          for (let i of dec.split("\n")) {
            news.push({ text: i })
          }
        }
        else {
          news.push({ text: dec })
        }
        detail.news = news
      }
    } else {
      var xml = ""
      if (dec.includes("\n")) {
        for (let i of dec.split("\n")) {
          xml += `<title color="#777777" size="26">${i}</title>`
        }
      } else {
        xml = `<title color="#777777" size="26">${dec}</title>`
      }
      forward.data = forward.data
        .replace(/\n/g, '')
        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
        .replace(/___+/, xml)
    }
  }
  return forward
}

export {
  getUid,
  makeForwardMsg,
}
import NoteUser from '../../genshin/model/mys/NoteUser.js'
import common from '../../../lib/common/common.js'

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

const makeForwardMsg = async function (e, msg = [], dec = '') {
  if (typeof(msg) === "string") {
    if (msg == "") return false
    return await common.makeForwardMsg(e, [msg], dec, msgsscr)
  }
  if (msg.length == 0) return false
  if (onlyMsg || typeof(msg[0]) === "string") return await common.makeForwardMsg(e, msg, dec, msgsscr)
  
  var forward
  if (e.isGroup) forward = await e.group.makeForwardMsg(msg)
  else if (e.friend) forward = await e.friend.makeForwardMsg(msg)
  else forward = Bot.makeForwardMsg(forwardMsg)
  return forward
}

export {
  getUid,
  makeForwardMsg,
}
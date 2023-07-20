import NoteUser from '../../genshin/model/mys/NoteUser.js'
import Os from 'os'

const _getUid = async function (qq) {
  let user = await NoteUser.create(qq)
  return user.uid
}

const async function getUid (e, set = false) {
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

const NEWLINE = (Os.platform() === 'win32') ? '\r' : '\n'

export {
  getUid
  NEWLINE
}
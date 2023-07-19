import NoteUser from '../../genshin/model/mys/NoteUser.js'

const _getUid = async function (qq) {
  let user = await NoteUser.create(qq)
  return user.getUid()
}

export async function getUid (e, set = false) {
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
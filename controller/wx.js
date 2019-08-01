
const config = require('../conf/config.default')

// 获取 WeChat, WechatOAuth 实例
const { getWechat, getOAuth} = require('../wx/index')

let wechat = getWechat()
let oauth = getOAuth()

exports.fetchAccessToken = async () =>{
  let data = await wechat.fetchAccessToken()
  return data
}

exports.fetchTicket = async () => {
  let data = await wechat.fetchTicket()
  return data
}

exports.clearQuota = async () => {
  let data = await wechat.clearQuota()
  return data
}

exports.oauth = async (id, type) => {
  const scope = type
  const target = config.baseUrl + 'wx/userinfo'
  const state = id
  const url = oauth.getAuthorizeURL(scope, target, state)
  return url
}

exports.getUserinfo = async (code) => {
  // 通过 code 获取网页授权 access_token
  const data = await oauth.fetchAccessToken(code)

  // 通过网页授权 access_token，获取用户信息
  const userData = await oauth.getUserInfo(data.access_token, data.openid)

  return userData
}

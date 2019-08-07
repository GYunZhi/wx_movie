
const config = require('../conf/config.default')
const { sign } = require('../wx_lib/utils')

// 获取 WeChat, WechatOAuth 实例
const { getWechat, getOAuth } = require('../wx/index')

let wechat = getWechat()
let oauth = getOAuth()

const mongoose = require('mongoose')
const User = mongoose.model('User')

fetchAccessToken = async () =>{
  let data = await wechat.fetchAccessToken()
  return data
}

fetchTicket = async () => {
  let data = await wechat.fetchTicket()
  return data
}

clearQuota = async () => {
  let data = await wechat.clearQuota()
  return data
}

getOauth = async (id, type) => {
  const scope = type
  const target = config.baseUrl + '/wx/userinfo'
  const state = id
  const url = oauth.getAuthorizeURL(scope, target, state)
  return url
}

getUserinfo = async (code) => {
  // 通过 code 获取网页授权 access_token
  const data = await oauth.fetchAccessToken(code)

  // 通过网页授权 access_token，获取用户信息
  const userData = await oauth.getUserInfo(data.access_token, data.openid)

  return userData
}

// 获取 signature，使用 js-sdk
getSignature = async (url) => {

  const tokenData = await wechat.fetchAccessToken()
  const token = tokenData.access_token

  const ticketData = await wechat.fetchTicket(token)
  const ticket = ticketData.ticket

  let params = sign(ticket, url)
  params.appId = wechat.appID

  return params
}

// 微信环境检查
isWechat = (ua) => {
  if (ua.indexOf('MicroMessenger') >= 0) {
    return true
  } else {
    return false
  }
}

// 检查是否是微信环境，完成授权跳转
checkWechat = async (req, res, next) => {
  const ua = req.headers['user-agent']
  const code = req.query.code

  if (req.method === 'GET') {
    // code存在，说明用户已经授权
    if (code) {
      await next()
      // code不存在，且是微信环境，可以配置授权的跳转
    } else if (isWechat(ua)) {
      const target = req.protocol + '://' + req.get('host') + req.originalUrl
      const scope = 'snsapi_base'
      const url = oauth.getAuthorizeURL(scope, target, 'fromWechat')

      res.redirect(url)
    } else {
      await next()
    }
  } else {
    await next()
  }
}

// 微信网页授权成功后保存用户信息
wechatRedirect = async (req, res, next) => {
  const { code, state } = req.query

  if (code && state === 'fromWechat') {
    const userData = await getUserinfo(code)
    const user = await saveWechatUser(userData)

    req.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    }
  }

  await next()
}

// 存储微信账号用户信息
saveWechatUser = async (userData) => {
  let query = {
    openid: userData.openid
  }

  if (userData.unionid) {
    query = {
      unionid: userData.unionid
    }
  }

  let user = await User.findOne(query)

  if (!user) {
    user = new User({
      openid: [userData.openid],
      unionid: userData.unionid,
      nickname: userData.nickname,
      email: (userData.unionid || userData.openid) + '@wx.com',
      province: userData.province,
      country: userData.country,
      city: userData.city,
      gender: userData.gender || userData.sex
    })

    user = await user.save()
  }
  return user
}

// 持久化用户
// 对用户打标签和统计
saveMPUser = async (message, from = '') => {
  let sceneId = message.eventkey
  let openid = message.fromusername
  let count = 0

  if (sceneId && sceneId.indexOf('qrscene_') > -1) {
    sceneId = sceneId.replace('qrscene_', '')
  }

  let user = await User.findOne({
    openid: openid
  })

  let userInfo = await wechat.handle('getUserInfo', openid)

  if (sceneId === 'imooc') {
    from = 'imooc'
  }

  if (!user) {
    let userData = {
      from: from,
      openid: [userInfo.openid],
      unionid: userInfo.unionid,
      nickname: userInfo.nickname,
      email: (userInfo.unionid || userInfo.openid) + '@wx.com',
      province: userInfo.province,
      country: userInfo.country,
      city: userInfo.city,
      gender: userInfo.gender || userInfo.sex
    }

    user = new User(userData)
    user = await user.save()
  }

  // 打标签分组
  if (from === 'imooc') {
    let tagid

    count = await User.count({
      from: 'imooc'
    })

    try {
      let tagsData = await wechat.handle('fetchTags')

      tagsData = tagsData || {}
      const tags = tagsData.tags || []
      const tag = tags.filter(tag => {
        return tag.name === 'imooc'
      })

      if (tag && tag.length > 0) {
        tagid = tag[0].id
        count = tag[0].count || 0
      } else {
        let res = await wechat.handle('createTag', 'imooc')

        tagid = res.tag.id
      }

      if (tagid) {
        await wechat.handle('batchTag', [openid], tagid)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return {
    user,
    count
  }
}

module.exports = {
  fetchAccessToken,
  fetchTicket,
  clearQuota,
  oauth,
  getUserinfo,
  getSignature,
  isWechat,
  checkWechat,
  wechatRedirect,
  saveWechatUser,
  saveMPUser
}

const request = require('request-promise')
const base = 'https://api.weixin.qq.com/sns/'
const api = {
  authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
  accessToken: base + 'oauth2/access_token?',
  userInfo: base + 'userinfo?'
}

/**
 * 微信网页授权
 *
 * 详细信息/主动授权： snsapi_userinfo
 *
 * 基本信息/静默授权： snsapi_base
 *
 * WechatOAuth 类
 *
 */

module.exports = class WechatOAuth {
  constructor (opts) {
    this.appID = opts.appID
    this.appSecret = opts.appSecret
  }

  async request (options) {
    options = Object.assign({}, options, { json: true })
    try {
      const resp = await request(options)
      return resp
    } catch (err) {
      console.log(err)
    }
  }

  // 授权页面，获取 code
  getAuthorizeURL (scope = 'snsapi_base', target, state) {
    const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    return url
  }

  // 用户授权后，通过 code 获取网页授权 access_token
  async fetchAccessToken (code) {
    const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`
    const resp = await this.request({ url })
    return resp
  }


  // 通过网页授权 access_token，获取用户信息
  async getUserInfo (token, openID, lang = 'zh_CN') {
    const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
    const resp = await this.request({ url })
    return resp
  }
}

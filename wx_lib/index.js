const http = require('../utils/http')
const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
  accessToken: base + 'token?grant_type=client_credential',
  ticket: base + 'ticket/getticket?'
}

/**
 * Wechat 类
 * access_token 获取、刷新
 * ticket 获取、刷新
 *
 */
module.exports = class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket

    // this.fetchAccessToken()
  }

  // 检查 access_token、ticket 是否过期
  isValid (data, name) {
    if (!data || !data[name]) {
      return false
    }

    const expiresIn = data.expires_in
    const now = new Date().getTime()

    if (now < expiresIn) {
      return true
    } else {
      return false
    }
  }

  // 1. 首先检查数据库里的 token 是否过期
  // 2. 过期则刷新
  // 3. token 入库

  // 获取 access_token
  async updateAccessToken () {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

    const data = await http.get(url).catch((err) => {
      console.log('err', err)
    })

    const now = new Date().getTime()

    const expiresIn = now + (data.expires_in - 300) * 1000
    data.expires_in = expiresIn

    await this.saveAccessToken(data)

    return data
  }

  async fetchAccessToken () {
    let data = await this.getAccessToken()

    // 如果 access_token 存在且未过期，直接返回，否则获取新的 access_token
    if (!this.isValid(data, 'access_token')) {
      data = await this.updateAccessToken()
    }

    return data
  }

  // 获取 ticket
  async updateTicket(token) {
    const url = `${api.ticket}access_token=${token}&type=jsapi`

    const data = await http.get(url).catch((err) => {
      console.log('err', err)
    })

    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 300) * 1000

    data.expires_in = expiresIn

    await this.saveTicket(data)

    return data
  }

  async fetchTicket() {
    // 获取 access_token
    const token = await this.fetchAccessToken()

    // 获取 ticket
    let data = await this.getTicket()

    // 如果 ticket 存在且未过期，直接返回，否则获取新的 ticket
    if (!this.isValid(data, 'ticket')) {
      data = await this.updateTicket(token.access_token)
    }

    return data
  }
}

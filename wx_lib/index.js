const fs = require('fs')
const request = require('request-promise')
const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
  clearQuota: base + 'clear_quota?',
  accessToken: base + 'token?grant_type=client_credential',
  ticket: base + 'ticket/getticket?',
  // 素材管理
  temporary: {
    upload: base + 'media/upload?',
    fetch: base + 'media/get?'
  },
  permanent: {
    upload: base + 'material/add_material?',
    uploadNews: base + 'material/add_news?',
    uploadNewsPic: base + 'media/uploadimg?',
    fetch: base + 'material/get_material?',
    del: base + 'material/del_material?',
    update: base + 'material/update_news?',
    count: base + 'material/get_materialcount?',
    batch: base + 'material/batchget_material?'
  },
}

/**
 * Wechat 类
 * access_token 获取、刷新
 * ticket 获取、刷新
 * 素材管理
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

  // 封装 request
  async request (options) {
    options = Object.assign({}, options, { json: true })
    try {
      const resp = await request(options)
      return resp
    } catch (err) {
      console.log(err)
    }
  }

  // 清除调用频次限制（每月共10次清零操作机会）
  async clearQuota () {
    // 获取 access_token
    const tokenData = await this.fetchAccessToken()

    const url = `${api.clearQuota}access_token=${tokenData.access_token}`

    const options = {
      method: 'POST',
      url: url,
      body: { appid: this.appID }
    }

    const data = await this.request(options)

    return data
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

  // 获取 access_token
  async fetchAccessToken () {
    let data = await this.getAccessToken()

    // 如果 access_token 存在且未过期，直接返回，否则获取新的 access_token
    if (!this.isValid(data, 'access_token')) {
      data = await this.updateAccessToken()
    }
    return data
  }

  async updateAccessToken () {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

    const data = await this.request({ url })

    const now = new Date().getTime()

    const expiresIn = now + (data.expires_in - 300) * 1000
    data.expires_in = expiresIn

    await this.saveAccessToken(data)

    return data
  }

  // 获取 ticket
  async fetchTicket() {
    // 获取 access_token
    const tokenData = await this.fetchAccessToken()

    // 获取 ticket
    let data = await this.getTicket()

    // 如果 ticket 存在且未过期，直接返回，否则获取新的 ticket
    if (!this.isValid(data, 'ticket')) {
      data = await this.updateTicket(tokenData.access_token)
    }
    return data
  }

  async updateTicket(token) {
    const url = `${api.ticket}access_token=${token}&type=jsapi`

    const data = await this.request({ url })

    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 300) * 1000

    data.expires_in = expiresIn

    await this.saveTicket(data)

    return data
  }

  // 封装用来请求接口的入口方法
  async handle(operation, ...args) {
    // 获取 access_token
    const tokenData = await this.fetchAccessToken()
    const options = this[operation](tokenData.access_token, ...args)
    const data = await this.request(options)
    return data
  }

  // 上传素材
  uploadMaterial(token, type, material, permanent) {
    let form = {}
    let url = api.temporary.upload

    // 永久素材 form 是个 obj，继承外面传入的新对象
    if (permanent) {
      url = api.permanent.upload
      form = Object.assign(form, permanent)
    }

    // 上传图文消息中的图片素材
    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    }

    // 图文素材 from 是一个数组
    if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      form.media = fs.createReadStream(material)
    }

    let uploadUrl = `${url}access_token=${token}&type=${type}`


    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }

    // 图文和非图文素材 request 提交主体判断
    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }

    // console.log('uploadMaterial options', options)

    return options
  }

  // 获取素材本身
  fetchMaterial (token, mediaId, type, permanent) {
    let form = {}
    let fetchUrl = api.temporary.fetch

    if (permanent) {
      fetchUrl = api.permanent.fetch
    }

    let url = fetchUrl + 'access_token=' + token
    let options = {
      method: 'POST',
      url
    }

    if (permanent) {
      form.media_id = mediaId
      form.access_token = token
      options.body = form
    } else {
      if (type === 'video') {
        url = url.replace('https:', 'http:')
      }

      url += '&media_id=' + mediaId
    }

    // console.log('fetchMaterial options', options)

    return options
  }

  // 删除素材
  deleteMaterial(token, mediaId) {
    const form = {
      media_id: mediaId
    }
    const url = `${api.permanent.del}access_token=${token}&media_id=${mediaId}`

    return {
      method: 'POST',
      url,
      body: form
    }
  }

  // 更新图文素材
  updateMaterial(token, mediaId, news) {
    let form = {
      media_id: mediaId
    }
    form = Object.assign(form, news)

    const url = `${api.permanent.update}access_token=${token}&media_id=${mediaId}`

    return {
      method: 'POST',
      url,
      body: form
    }
  }

  // 获取素材总数
  countMaterial(token) {
    const url = `${api.permanent.count}access_token=${token}`
    return {
      method: 'POST',
      url
    }
  }

  // 获取素材列表
  batchMaterial(token, options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10

    const url = `${api.permanent.batch}access_token=${token}`

    return {
      method: 'POST',
      url,
      body: options
    }
  }
}

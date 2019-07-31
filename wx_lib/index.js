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

  // 用户管理
  tag: {
    create: base + 'tags/create?',
    fetch: base + 'tags/get?',
    update: base + 'tags/update?',
    del: base + 'tags/delete?',
    fetchUsers: base + 'user/tag/get?',
    batchTag: base + 'tags/members/batchtagging?',
    batchUnTag: base + 'tags/members/batchuntagging?',
    getUserTags: base + 'tags/getidlist?'
  },
  user: {
    fetch: base + 'user/get?',
    remark: base + 'user/info/updateremark?',
    info: base + 'user/info?',
    batch: base + 'user/info/batchget?'
  }
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

  // 获取素材
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

  // 创建标签
  createTag(token, name) {
    const body = { tag: { name }}

    const url = api.tag.create + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 获取全部标签
  fetchTags(token) {
    const url = api.tag.fetch + 'access_token=' + token

    return { url }
  }

  // 编辑标签
  updateTag(token, id, name) {
    const body = { tag: { id, name } }

    const url = api.tag.update + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 删除标签
  delTag(token, id) {
    const body = { tag: { id }}

    const url = api.tag.del + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 批量加标签和取消标签
  batchTag(token, openidList, id, unTag) {
    const body = { openid_list: openidList, tagid: id }

    let url = !unTag ? api.tag.batchTag : api.tag.batchUnTag
    url += 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 获取标签下的用户列表
  fetchTagUsers(token, id, openId) {
    const body = { tagid: id, next_openid: openId || '' }

    const url = api.tag.fetchUsers + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 获取某个用户的标签列表
  getUserTags(token, openId) {
    const body = { openid: openId }

    const url = api.tag.getUserTags + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 设置用户备注名(认证服务号专用接口)
  remarkUser(token, openId, remark) {
    const body = { openid: openId, remark }

    const url = api.user.remark + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

  // 获取用户基本信息
  getUserInfo(token, openId, lan = 'zh_CN') {
    const url = api.user.info + 'access_token=' + token + '&openid=' + openId + '&lang=' + lan

    return { url }
  }

  // 批量获取用户基本信息
  fetchBatchUsers(token, openIdList) {
    const body = { user_list: openIdList }

    const url = api.user.batch + 'access_token=' + token

    return {
      method: 'POST',
      url,
      body
    }
  }

   // 获取用户列表
  fetchUserList(token, openId) {
    const url = api.user.fetch + 'access_token=' + token + '&next_openid=' + (openId || '')

    return { url }
  }
}

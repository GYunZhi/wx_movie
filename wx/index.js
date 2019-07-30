const Wechat = require('../wx_lib')
const config = require('../conf/config.default')
const mongoose = require('mongoose')

const Token = mongoose.model('Token')
const Ticket = mongoose.model('Ticket')

const wxConfig = {
  appID: config.wx.appID,
  appSecret: config.wx.appSecrect,
  token: config.wx.token,
  getAccessToken: async () => {
    const res = await Token.getAccessToken()
    return res
  },
  saveAccessToken: async (data) => {
    const res = await Token.saveAccessToken(data)
    return res
  },
  getTicket: async () => {
    const res = await Ticket.getTicket()
    return res
  },
  saveTicket: async (data) => {
    const res = await Ticket.saveTicket(data)
    return res
  }
}

exports.getWechat = () => new Wechat(wxConfig)

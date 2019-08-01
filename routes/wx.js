
var express = require('express');
var router = express.Router();

var config = require('../conf/config.default');
var { fetchAccessToken, fetchTicket, clearQuota, oauth, getUserinfo, getSignature } = require('../controller/wx')

// 微信API调用相关代码
var check = require('../wx_lib/check')
var msg = require('../wx_lib/msg')

// 微信接入验证
router.get('/', check(config.wx))

// 消息自动回复
router.post('/', check(config.wx), msg())

// 测试 access_token
router.get('/test/token', function(req, res, next) {
  fetchAccessToken().then(data => {
    res.send(data)
  })
})

// 测试 ticket
router.get('/test/ticket', function(req, res, next) {
  fetchTicket().then(data => {
    res.send(data)
  })
})

// 清除调用频次限制（每月共10次清零操作机会）
router.get('/test/clearQuota', function(req, res, next) {
  clearQuota().then(data => {
    res.send(data)
  })
})

// 跳到授权页面(静默授权)
router.get('/oauth', function (req, res, next) {
  let id = req.query.id
  let type = 'snsapi_userinfo'
  oauth(id, type).then(url => {
    res.redirect(url)
  })
})

// 跳到授权页面（手动授权）
router.get('/oauth/base', function (req, res, next) {
  let id = req.query.id
  let type = 'snsapi_base'
  oauth(id, type).then(url => {
    res.redirect(url)
  })
})

// 通过 code 获取用户信息
router.get('/userinfo', function (req, res, next) {
  let code = req.query.code
  getUserinfo(code).then(data => {
    res.send(data)
  })
})

// 获取 signature，使用 jssdk
router.get('/jssdk', function (req, res, next) {
  const url = req.href
  getSignature(url).then(data => {
    // res.send(data)
    res.render('wx/jssdk', data)
  })
})

module.exports = router;

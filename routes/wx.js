
var express = require('express');
var router = express.Router();

var config = require('../conf/config.default');
var { fetchAccessToken, fetchTicket, clearQuota } = require('../controller/wx')

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

// 测试 ticket
router.get('/test/clearQuota', function(req, res, next) {
  clearQuota().then(data => {
    res.send(data)
  })
})

module.exports = router;

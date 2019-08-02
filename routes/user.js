var express = require('express');
var router = express.Router();

const { login, register, logout } = require('../controller/user')

router.get('/login', function (req, res, next) {
  res.render('pages/login', {
    title: '登录页面'
  })
})

router.get('/register', function (req, res, next) {
  res.render('pages/register', {
    title: '注册页面'
  })
})

// 登录
router.post('/login', function (req, res, next) {
  login(req, res, next)
})

// 注册
router.post('/register', function (req, res, next) {
  register(req, res, next)
})

// 登出
router.get('/logout', function (req, res, next) {
  logout(req, res, next)
})

module.exports = router;

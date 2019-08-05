var express = require('express');
var router = express.Router();

var { checkLogin, checkAdmin } = require('../utils')
var { getUserList} = require('../controller/userMag')

// 后台的用户列表页面
router.get('/', getUserList);

module.exports = router;

var express = require('express');
var router = express.Router();

var { checkLogin, checkAdmin } = require('../utils')

var { show, add, list, del } = require('../controller/category')

  // 后台的分类管理页面
  router.get('/', show)

  router.post('/', add)

  router.get('/list', list)

  router.get('/update/:_id', show)

  router.delete('/', del)

module.exports = router;

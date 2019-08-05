
var express = require('express');
var router = express.Router();

var { checkLogin, checkAdmin } = require('../utils')
var { show, savePosterURL, add, list, del } = require('../controller/movie')

// 后台的电影管理页面
router.get('/', show)
router.post('/', savePosterURL, add)
router.get('/list', list)
router.get('/update/:_id', show)
router.delete('/',del)

module.exports = router;

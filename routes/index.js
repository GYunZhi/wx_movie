var express = require('express');
var router = express.Router();

var { getCatagoryList, detail, search, comment } = require('../controller/index')

router.get('/', getCatagoryList);

router.get('/movie/:_id', detail)

 // 搜索
 router.get('/results', search)

 // 评论
 router.post('/comment', comment)

module.exports = router;

var express = require('express');
var router = express.Router();

var { getCatagoryList, detail, search } = require('../controller/index')

router.get('/', getCatagoryList);

router.get('/movie/:_id', detail)

 // 搜索
 router.get('/results', search)

module.exports = router;

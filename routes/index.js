var express = require('express');
var router = express.Router();

var { getCatagoryList, detail } = require('../controller/index')

router.get('/', getCatagoryList);

router.get('/movie/:_id', detail)

module.exports = router;

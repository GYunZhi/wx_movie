var express = require('express');
var router = express.Router();

var { getCatagoryList } = require('../controller/index')

router.get('/', function(req, res, next) {
  getCatagoryList().then(categories => {
    res.render('pages/index', {title: '首页', categories});
  })
});

module.exports = router;

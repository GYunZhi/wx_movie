var express = require('express');
var router = express.Router();

var { checkLogin, checkAdmin } = require('../utils')
var { getUserList} = require('../controller/admin')

router.get('/users', checkLogin, checkAdmin, getUserList);

module.exports = router;

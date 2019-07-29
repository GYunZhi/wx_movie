var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var xmlparser = require('express-xml-bodyparser');
var logger = require('morgan');
var wxConfig = require('./conf/wx')

// 微信API调用相关代码
var check = require('./wx_lib/check')
var msg = require('./wx_lib/msg')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(xmlparser({ limit: '1MB' }))

app.use(express.static(path.join(__dirname, 'public')));

// 微信接入验证
app.get('/', check(wxConfig))

// 消息自动回复
app.post('/', check(wxConfig), msg())

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'develop' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

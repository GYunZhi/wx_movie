var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session')
var xmlparser = require('express-xml-bodyparser');
var xmlparser = require('express-xml-bodyparser');
var multer = require('multer')
var logger = require('morgan');
const mongoose = require('mongoose')
var moment = require('moment')


var config = require('./conf/config.default');
var { connect, initSchemas } = require('./db/init');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 添加 moment
app.locals.moment = moment;

app.use(logger('dev'));


// 配置 session
app.use(session({
  name: 'userId',
  secret: 'WJiol#23123_',
  cookie: {
    // path: '/',   // 默认配置
    // httpOnly: true,  // 默认配置
    maxAge: 12 * 60 * 60 * 1000
  }
}))

// 使用 multer
// 磁盘存储
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xmlparser({ limit: '1MB' }))

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

(async () => {
  // 连接数据库，
  await connect(config.db)

  // 初始化schema
  initSchemas()

  // 判断用户是否登录，使用 app.locals.user 定义全局数据，并在渲染模板中使用
  app.use(async (req, res, next) => {
    const User = mongoose.model('User')
    let user = req.session.user

    if (user && user._id) {
      user = await User.findOne({ _id: user._id })

      if (user) {
        req.session.user = {
          _id: user._id,
          role: user.role,
          nickname: user.nickname
        }
        app.locals = Object.assign(app.locals, {
          user: {
            _id: user._id,
            nickname: user.nickname
          }
        })
      }
    } else {
      app.locals.user = null
    }
    await next()
  })

  var indexRouter = require('./routes/index');
  var wxRouter = require('./routes/wx');
  var userRouter = require('./routes/user');
  var userMagRouter = require('./routes/userMag');
  var categoryRouter = require('./routes/category');
  var movieRouter = require('./routes/movie');



  app.use('/wx', wxRouter);
  app.use('/user', userRouter);
  app.use('/admin/users', userMagRouter);
  app.use('/admin/category', categoryRouter);
  app.use('/admin/movie', upload.any(), movieRouter);
  app.use('/', indexRouter);

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
})()

module.exports = app;


const mongoose = require('mongoose')
const User = mongoose.model('User')

// 登录
exports.login = async (req, res, next) => {
  const { email, password } = req.body.user
  const user = await User.findOne({ email })

  if (!user) return res.redirect('/user/register')

  const isMatch = await user.comparePassword(password, user.password)

  if (isMatch) {
    req.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    }
    res.redirect('/')
  } else {
    res.redirect('/user/login')
  }
}

// 注册
exports.register = async (req, res, next) => {
  const {
    email,
    password,
    nickname
  } = req.body.user

  let user = await User.findOne({ email })

  if (user) return res.redirect('/user/signin')

  user = new User({
    email,
    nickname,
    password
  })

  req.session.user = {
    _id: user._id,
    role: user.role,
    nickname: user.nickname
  }

  user = await user.save()

  res.redirect('/')
}

// 登出
exports.logout = async (req, res, next) => {
  req.session.user = {}
  res.redirect('/')
}


const mongoose = require('mongoose')
const User = mongoose.model('User')

// 用户列表页面
exports.getUserList = async (req, res, next) => {
  const users = await User.find({}).sort('meta.updatedAt')

  await res.render('pages/userlist', {
    title: '用户列表页面',
    users
  })
}

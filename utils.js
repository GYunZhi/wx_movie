// 登录校验
exports.checkLogin = async (req, res, next) => {
  const user = req.session.user

  if (!user || !user._id) {
    return res.redirect('/')
  }

  await next()
}

// 管理员身份校验
exports.checkAdmin = async (req, res, next) => {
  const user = req.session.user

  if (user.role !== 'admin') {
    return res.redirect('/')
  }

  await next()
}

const sha1 = require('sha1')

// 微信接入验证
module.exports = (config) => {
  return (req, res, next) => {
    // 1. 获取微信服务器 get 请求的参数 signature、timestamp、nonce、echostr
    const {signature, timestamp, nonce,  echostr } = req.query

    // 2. 将 token、timestamp、nonce 三个参数进行字典序排序,然后拼接成一个字符串
    let tempStr = [config.token, timestamp, nonce].sort().join('')

    // 3. 使用 sha1 加密
    const resultCode = sha1(tempStr)

    console.log(req.method)

    if (req.method === 'GET') {
      // 4. 将加密后的字符串与 signature 对比，标识该请求是否来源于微信
      if (resultCode === signature) {
        res.send(echostr)
      } else {
        res.send('mismatch')
      }
    } else if (req.method === 'POST') {
      if (resultCode === signature) {
        next()
      } else {
        res.send('mismatch')
      }
    }
  }
}

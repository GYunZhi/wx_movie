let { formatMessage, parseTemplate } = require('./utils')
let { reply } = require('../wx/reply')

// 消息自动回复
module.exports = () => {
  return async (req, res, next) => {

    let message = formatMessage(req.body.xml)
    req.message = message

    await reply(req, res, next)
    let data = parseTemplate(req.reply, req.message)

    console.log('xml', data)

    res.writeHead(200, {
      'Content-Type': 'application/xml'
    });
    res.end(data)
  }
}

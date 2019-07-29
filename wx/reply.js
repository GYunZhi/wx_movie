exports.reply = async (req, res, next) => {

  const message = req.message

  switch(message.msgtype) {
    case 'voice': {
      let reply = ''

      req.reply = reply
      break
    }
    case 'image': {
      let reply = ''

      req.reply = reply
      break
    }
    case 'event': {
      let reply = ''
      if (message.event === 'subscribe') {
        reply = '欢迎订阅！'
      }

      req.reply = reply
      break
    }
    case 'text': {

      let content = message.content
      let reply = 'Oh, 你说的 ' + message.content + ' 太复杂了，无法解析'

      // 匹配回复
      if (content === '1') {
        reply = '天下第一吃大米'
      } else if (content === '2') {
        reply = '天下第二吃豆腐'
      } else if (content === '3') {
        reply = '天下第三吃咸蛋'
      }

      req.reply = reply
      break
    }
  }
}

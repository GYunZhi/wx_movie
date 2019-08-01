const sha1 = require('sha1')
const template = require('./template')

const formatMessage = result => {
  let message = {}

  if (typeof result === 'object') {
    const keys = Object.keys(result)

    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]]
      let key = keys[i]

      if (!(item instanceof Array) || item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]

        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }

  return message
}

const parseTemplate = (content, message) => {

  let type = 'text'

  if (Array.isArray(content)) {
    type = 'news'
  }

  if (!content) content = 'Empty News'
  if (content && content.type) {
    type = content.type
  }

  let info = Object.assign({}, {
    content: content,
    msgType: type,
    createTime: new Date().getTime(),
    toUserName: message.fromusername,
    fromUserName: message.tousername
  })

  return template(info)
}

//生成16位随机字符串
const createNonce = () => {
  return Math.random().toString(36).substr(2, 16)
}

// 生成时间戳
const createTimestame = () => {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

// 加密签名的入口方法
const sign = (ticket, url) => {

  // 生成随机串
  const noncestr = createNonce()

  // 生成时间戳
  const timestamp = createTimestame()

  // 字典排序
  let string = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`

  // 加密
  const signature = sha1(string)

  return {
    noncestr,
    timestamp,
    signature
  }
}

module.exports = {
  formatMessage,
  parseTemplate,
  sign
}

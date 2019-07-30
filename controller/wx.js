
// 获取 WeChat实例
let getWechat = require('../wx/index').getWechat

let wechat = getWechat()

exports.fetchAccessToken = () =>{
  return wechat.fetchAccessToken().then(data => {
    return data
  })
}

exports.fetchTicket = () => {
  return wechat.fetchTicket().then(data => {
    return data
  })
}


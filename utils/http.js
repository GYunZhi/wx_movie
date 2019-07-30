const axios = require('axios')

const instance = axios.create({
  timeout: 1000 * 30,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

instance.interceptors.response.use(resp => {
  return resp && resp.data
}, (err) => {
  if (!err.response) {
    err.response = {
      data: {
        msg: '服务器开小差了，请稍候再试'
      },
      status: 504
    }
  }
  return Promise.reject(err)
})

module.exports = instance

const mongoose = require('mongoose')
const path = require('path')
const glob = require('glob')

mongoose.Promise = global.Promise

exports.initSchemas = () => {
  glob.sync(path.resolve(__dirname, './schema', '**/*.js')).forEach(require)
}

exports.connect = (db) => {
  let maxConnectTimes = 0

  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true)
    }
    mongoose.connect(db, { useNewUrlParser: true })

    // 断开连接
    mongoose.connection.on('disconnect', () => {
      maxConnectTimes++

      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Error('数据库开小差了，请稍候再试')
      }
    })

    // 连接失败
    mongoose.connection.on('error', err => {
      maxConnectTimes++
      console.log('Mongodb connect err', err)

      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Error('数据库开小差了，请稍候再试')
      }
    })
    // 连接成功
    mongoose.connection.on('open', () => {
      resolve()
      console.log('Mongodb connected!')
    })
  })
}

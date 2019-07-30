const { resolve } = require('path')

exports.reply = async (req, res, next) => {

  const message = req.message

  // 获取 WeChat实例
  let getWechat = require('../wx/index').getWechat

  let wechat = getWechat()

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
      if (content === 'imooc') {
        reply = `哎呦喂！你是来自慕课的小伙伴`
      } else if  (content === '1') {
        reply = '天下第一吃大米'
      } else if (content === '2') {
        reply = '天下第二吃豆腐'
      } else if (content === '3') {
        reply = '天下第三吃咸蛋'
      } else if (content === '4') {
        let data = await wechat.handle('uploadMaterial', 'image', resolve(__dirname, '../public/images/2.jpg'))

        reply = {
          type: 'image',
          mediaId: data.media_id
        }
      } else if (content === '5') {
        let data = await wechat.handle('uploadMaterial', 'video', resolve(__dirname, '../public/images/6.mp4'))

        reply = {
          type: 'video',
          title: '视频标题——蔡徐坤打篮球',
          description: '视频描述——鬼畜小王子打篮球',
          mediaId: data.media_id
        }
      } else if (content === '6') {
        // 永久性图片素材
        let data = await wechat.handle('uploadMaterial', 'image', resolve(__dirname, '../public/images/2.jpg'), {
          type: 'image'
        })

        reply = {
          type: 'image',
          mediaId: data.media_id
        }
      } else if (content === '7') {
        // 永久性视频素材
        let data = await wechat.handle('uploadMaterial', 'video', resolve(__dirname, '../public/images/6.mp4'), {
          type: 'video',
          description: '{"title": "视频素材", "introduction": "这是一个永久性视频素材"}'
        })

        reply = {
          type: 'video',
          title: '视频标题——蔡徐坤打篮球2',
          description: '视频描述——鸡你太美',
          mediaId: data.media_id
        }
      } else if (content === '8') {

        let data = await wechat.handle('uploadMaterial', 'image', resolve(__dirname, '../public/images/2.jpg'), {
          type: 'image'
        })

        let data2 = await wechat.handle('uploadMaterial', 'pic', resolve(__dirname, '../public/images/2.jpg'), {
          type: 'image'
        })

        let media = {
          articles: [
           {
              title: '这是服务端上传的图文',
              thumb_media_id: data.media_id,
              author: 'Scott',
              digest: '没有摘要',
              show_cover_pic: 1,
              content: '点击去往 github',
              content_source_url: 'http://github.com/'
            }
          ]
        }

        let uploadData = await wechat.handle('uploadMaterial', 'news', media, {})

        // 更新图文
        // let newMedia = {
        //   media_id: uploadData.media_id,
        //   index: 0,
        //   articles: {
        //     title: '这是更新之后的图文',
        //     thumb_media_id: data.media_id,
        //     author: 'Scott',
        //     digest: '没有摘要',
        //     show_cover_pic: 1,
        //     content: '点击去往慕课网',
        //     content_source_url: 'http://coding.imooc.com/'
        //   }
        // }

        // await wechat.handle('updateMaterial', uploadData.media_id, newMedia)

        let newsData = await wechat.handle('fetchMaterial', uploadData.media_id, 'news', true)
        let items = newsData.news_item
        let news = []

        items.forEach(item => {
          news.push({
            title: item.title,
            description: item.description,
            picUrl: data2.url,
            url: item.url
          })
        })

        reply = news
      } else if (content === '9') {
        let counts = await wechat.handle('countMaterial')

        console.log(JSON.stringify(counts))

        let resp = await Promise.all([
          wechat.handle('batchMaterial', {
            type: 'image',
            offset: 0,
            count: 10
          }),
          wechat.handle('batchMaterial', {
            type: 'video',
            offset: 0,
            count: 10
          }),
          wechat.handle('batchMaterial', {
            type: 'voice',
            offset: 0,
            count: 10
          }),
          wechat.handle('batchMaterial', {
            type: 'news',
            offset: 0,
            count: 10
          })
        ])

        reply = `
          image: ${resp[0].total_count}
          video: ${resp[1].total_count}
          voice: ${resp[2].total_count}
          news: ${resp[3].total_count}
        `
      }

      req.reply = reply
      break
    }
  }
}

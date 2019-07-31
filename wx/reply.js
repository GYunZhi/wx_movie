const { resolve } = require('path')
const commonMenu = require('./menu')
const config = require('../conf/config.default')

const help = '亲爱的，欢迎关注\n' +
  '回复 1-3，测试文字回复\n' +
  '回复 4，测试图片回复\n' +
  '回复 首页，进入网站首页\n' +
  '回复 电影名字，查询电影信息\n' +
  '点击帮助，获取帮助信息\n' +
  '某些功能呢订阅号无权限，比如网页授权\n' +
  '回复语音，查询电影信息\n' +
  '也可以点击 <a href="' + config.baseUrl + '/sdk">语音查电影</a>，查询电影信息\n'

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
      console.log(message.PicUrl)
      break
    }
    case 'event': {
      let reply = ''
      if (message.event === 'subscribe') {
        reply = '欢迎订阅！'
      } else if (message.event === 'unsubscribe') {
        reply = '取消订阅'
      } else if (message.event === 'scan') {
        console.log('关注后扫二维码' + '！ 扫码参数' + message.eventkey + '_' + message.ticket)
      } else if (message.event === 'LOCATION') {
        reply = `您上报的位置是：${message.latitude}-${message.longitude}-${message.precision}`
      } else if (message.event === 'CLICK') {
        if (message.eventkey === 'help') {
          reply = help
        } else if (message.eventkey === 'movie_hot') {
          let movies = await api.movie.findHotMovies(-1, 4)
          reply = []

          movies.forEach(movie => {
            reply.push({
              title: movie.title,
              description: movie.summary,
              picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
              url: config.baseUrl + '/movie/' + movie._id
            })
          })
        } else if (message.eventkey === 'movie_cold') {
          let movies = await api.movie.findHotMovies(1, 4)
          reply = []

          movies.forEach(movie => {
            reply.push({
              title: movie.title,
              description: movie.summary,
              picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
              url: config.baseUrl + '/movie/' + movie._id
            })
          })
        } else if (message.eventkey === 'movie_sci') {
          let catData = await api.movie.findMoviesByCat('科幻')
          let movies = catData.movies || []
          reply = []

          movies = movies.slice(0, 6)
          movies.forEach(movie => {
            reply.push({
              title: movie.title,
              description: movie.summary,
              picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
              url: config.baseUrl + '/movie/' + movie._id
            })
          })
        } else if (message.eventkey === 'movie_love') {
          let catData = await api.movie.findMoviesByCat('爱情')
          let movies = catData.movies || []
          reply = []

          movies.forEach(movie => {
            reply.push({
              title: movie.title,
              description: movie.summary,
              picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
              url: config.baseUrl + '/movie/' + movie._id
            })
          })
        }
      } else if (message.event === 'VIEW') {
        console.log('你点击了菜单链接： ' + message.eventkey + ' ' + message.menuid)
      } else if (message.event === 'scancode_push') {
        console.log('你扫码了： ' + message.scancodeinfo.scantype + ' ' + message.scancodeinfo.scanresult)
      } else if (message.event === 'scancode_waitmsg') {
        console.log('你扫码了： ' + message.scancodeinfo.scantype + ' ' + message.scancodeinfo.scanresult)
      } else if (message.event === 'pic_sysphoto') {
        console.log('系统拍照： ' + message.sendpicsinfo.count + ' ' + JSON.stringify(message.sendpicsinfo.piclist))
      } else if (message.event === 'pic_photo_or_album') {
        console.log('拍照或者相册： ' + message.sendpicsinfo.count + ' ' + JSON.stringify(message.sendpicsinfo.piclist))
      } else if (message.event === 'pic_weixin') {
        console.log('微信相册发图： ' + message.sendpicsinfo.count + ' ' + JSON.stringify(message.sendpicsinfo.piclist))
      } else if (message.event === 'location_select') {
        console.log('地理位置： ' + JSON.stringify(message.sendlocationinfo))
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
      } else if (content === '10') {
        // 创建标签
        // let newTag = await wechat.handle('createTag', 'imooc')
        // console.log(newTag)

        // 获取全部的标签
        let tagsData = await wechat.handle('fetchTags')
        reply = JSON.stringify(tagsData.tags)

        // 编辑标签
        // await wechat.handle('updateTag', 101, '慕课网')

        // 删除标签
        // await wechat.handle('delTag', 100)

        // 批量加标签和取消标签
        // let data = await wechat.handle('batchTag', [message.fromusername], 101, true)
        // console.log(data)

        // 获取某个标签的用户列表
        // let userList = await wechat.handle('fetchTagUsers', 101)
        // console.log(userList)

        // 获取某个用户的标签列表
        // let userTags = await wechat.handle('getUserTags', message.fromusername)
        // reply= JSON.stringify(userTags)
      } else if (content === '11') {
        let userList = await wechat.handle('fetchUserList')

        reply = userList.total + ' 个关注者'
      } else if (content === '12') {
        await wechat.handle('remarkUser', message.fromusername, 'Scott')
        reply = '添加备注成功'
      } else if (content === '13') {
        let userInfoData = await wechat.handle('getUserInfo', message.fromusername)

        reply = JSON.stringify(userInfoData)
      } else if (content === '14') {
        let batchUsersInfo = await wechat.handle('fetchBatchUsers', [{
          openid: message.fromusername,
          lang: 'zh_CN'
        }, {
          openid: 'ofD82xFUtZAFy2uUUZaJVQlRMTsQ',
          lang: 'zh_CN'
        }])

        console.log(batchUsersInfo)

        reply = JSON.stringify(batchUsersInfo)
      } else if (content === '19') {
        try {
          await wechat.handle('deleteMenu')
          let menu = {
            button: [
              {
                name: '一级菜单',
                sub_button: [
                  {
                    name: '二级菜单 1',
                    type: 'click',
                    key: 'no_1'
                  }, {
                    name: '二级菜单 2',
                    type: 'click',
                    key: 'no_2'
                  }, {
                    name: '二级菜单 3',
                    type: 'click',
                    key: 'no_3'
                  }, {
                    name: '二级菜单 4',
                    type: 'click',
                    key: 'no_4'
                  }, {
                    name: '二级菜单 5',
                    type: 'click',
                    key: 'no_5'
                  }
                ]
              },
              {
                name: 'imooc',
                type: 'view',
                url: 'https://www.imooc.com'
              },
              {
                name: '新菜单',
                type: 'click',
                key: 'new_1'
              }
            ]
          }
          await wechat.handle('createMenu', menu)
        } catch (err) {
          console.log(err)
        }
        reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
      } else if (content === '20') {
        try {
          let menu = {
            button: [
              {
                name: 'Scan_Photo',
                sub_button: [
                  {
                    name: '系统拍照',
                    type: 'pic_sysphoto',
                    key: 'no_1'
                  }, {
                    name: '拍照或者发图',
                    type: 'pic_photo_or_album',
                    key: 'no_2'
                  }, {
                    name: '微信相册发布',
                    type: 'pic_weixin',
                    key: 'no_3'
                  }, {
                    name: '扫码',
                    type: 'scancode_push',
                    key: 'no_4'
                  }
                ]
              },
              {
                name: '跳新链接',
                type: 'view',
                url: 'https://www.imooc.com'
              },
              {
                name: '其他',
                sub_button: [
                  {
                    name: '点击',
                    type: 'click',
                    key: 'no_11'
                  }, {
                    name: '地理位置',
                    type: 'location_select',
                    key: 'no_12'
                  }
                ]
              }
            ]
          }
          let rules = {
            // tag_id: '2',
            // sex: '0',
            country: '中国',
            province: '北京',
            // city: "广州",
            // wechat_platform_type: '2',
            // language: 'zh_CN'
          }
          await wechat.handle('createMenu', menu, rules)
        } catch (err) {
          console.log(err)
        }

        let menus = await wechat.handle('fetchMenu')

        console.log(JSON.stringify(menus))

        reply = '个性化菜单创建成功，地理位置为中国北京的用户可以使用个性化菜单'
      } else if (content === '21') {
        try {
          await wechat.handle('deleteMenu')
          await wechat.handle('createMenu', commonMenu)
        } catch (err) {
          console.log(err)
        }
        reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
      } else if (content === '22') {
        try {
          let menus = await wechat.handle('fetchMenu')
          console.log(JSON.stringify(menus))
        } catch (err) {
          console.log(err)
        }
      }

      req.reply = reply
      break
    }
  }
}
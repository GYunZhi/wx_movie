module.exports = {
  button: [{
    name: '排行榜',
    sub_button: [{
      name: '最热门',
      type: 'click',
      key: 'movie_hot'
    }, {
      name: '最冷门',
      type: 'click',
      key: 'movie_cold'
    }]
  }, {
    name: '分类',
    sub_button: [{
      name: '科幻',
      type: 'click',
      key: 'movie_sci'
    }, {
      name: '动画',
      type: 'click',
      key: 'movie_cartoon'
    }]
  }, {
    name: '帮助',
    type: 'click',
    key: 'help'
  }]
}

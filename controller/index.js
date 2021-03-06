const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const Comment = mongoose.model('Comment')

// 获取首页分类电影列表
exports.getCatagoryList = async (req, res, next) => {

  const categories = await Category.find({}).populate({
    path: 'movies',
    select: '_id title poster',
    options: {
      limit: 8
    }
  })

  await res.render('pages/index', {
    title: '首页',
    categories
  })
}

// 电影详情页
exports.detail = async (req, res, next) => {
  const _id = req.params._id
  const movie =  await Movie.findOne({ _id })

  await Movie.update({ _id }, { $inc: { pv: 1 } })

  // 获取评论
  const comments = await Comment.find({
    movie: _id
  })
    .populate('from', '_id nickname')
    .populate('replies.from replies.to', '_id nickname')

  await res.render('pages/detail', {
    title: '电影详情页面',
    movie,
    comments
  })
}

// 电影搜索功能
exports.search = async (req, res, next) => {
  const { catId, q, p } = req.query
  const page = parseInt(p, 10) || 0
  const count = 4
  const index = page * count

  if (catId) {
    // 分类搜索
    const categories = await Category.find({ _id: catId }).populate({
      path: 'movies',
      select: '_id title poster',
      options: {
        limit: 8
      }
    })
    const category = categories[0]
    let movies = category.movies || []
    let results = movies.slice(index, index + count)

    await res.render('pages/results', {
      title: '分类搜索结果页面',
      keyword: category.name,
      currentPage: (page + 1),
      query: 'catId=' + catId,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  } else {
    // 关键字搜索
    let movies = await Movie.find({
      title: new RegExp(q + '.*', 'i')
    })
    let results = movies.slice(index, index + count)
    await res.render('pages/results', {
      title: '关键词搜索结果页面',
      keyword: q,
      currentPage: (page + 1),
      query: 'q=' + q,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  }
}

// 评论
exports.comment = async (req, res, next) => {
  const commentData = req.body.comment

  if (commentData.cid) {
    let comment = await Comment.findOne({
      _id: commentData.cid
    })

    const reply = {
      from: commentData.from,
      to: commentData.tid,
      content: commentData.content
    }

    comment.replies.push(reply)

    await comment.save()

    res.send({ success: true })
  } else {
    let comment = new Comment({
      movie: commentData.movie,
      from: commentData.from,
      content: commentData.content
    })
    await comment.save()
    res.send({ success: true })
  }
}

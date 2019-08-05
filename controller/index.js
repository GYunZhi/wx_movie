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

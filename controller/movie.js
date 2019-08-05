const _ = require('lodash')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')

// 后台电影录入页面
exports.show = async (req, res, next) => {
  const { _id } = req.params
  let movie = {}

  if (_id) {
    movie = await Movie.findOne({ _id })
  }

  let categories = await Category.find({}, '_id name meta.updatedAt')

  await res.render('pages/movie_admin', {
    title: '后台电影录入页面',
    movie,
    categories
  })
}

// 上传海报之后拼接完整地址存入数据库
exports.savePosterURL = async (req, res, next) => {
  if(req.files.length > 0) {
    const posterData = req.files[0]
    const fileName = posterData.filename

    if (fileName) {
      // const url = req.protocol + '://' + req.get('host') + '/' + fileName
      const url = '/' + fileName
      req.poster = url
    }
  }

  next()
}

// 新增电影
exports.add = async (req, res, next) => {

  let movieData = req.body || {}
  let movie

  if (movieData._id) {
    movie = await Movie.findOne({ _id: movieData._id })
  }

  // 用户上传的海报
  if (req.poster) {
    movieData.poster = req.poster
  }

  // 电影和分类关联
  const categoryId = movieData.categoryId
  const categoryName = movieData.categoryName
  let category

  // 如果 categoryId 不存在，创建一条新的category
  if (categoryId && categoryName === '') {
    category = await Category.findOne({ _id: categoryId })
  } else if (categoryName) {
    category = new Category({ name: categoryName })
    await category.save()
  }

  if (movie) {
    movie = _.extend(movie, movieData)
    movie.category = category._id
  } else {
    delete movieData._id

    movieData.category = category._id
    movie = new Movie(movieData)
  }

  category = await Category.findOne({ _id: category._id })

  if (category) {
    category.movies = category.movies || []
    category.movies.push(movie._id)
    await category.save()
  }

  await movie.save()

  res.redirect('/admin/movie/list')
}

// 电影的后台列表
exports.list = async (req, res, next) => {
  const movies = await Movie.find({}).populate('category', 'name')
  await res.render('pages/movie_list', {
    title: '后台电影列表页面',
    movies
  })
}

// 删除电影数据(同时删除分类下的电影)
exports.del = async (req, res, next) => {
  const id = req.query.id
  const cat = await Category.findOne({
    movies: {
      $in: [id]
    }
  })

  if (cat && cat.movies.length) {
    const index = cat.movies.indexOf(id)
    cat.movies.splice(index, 1)
    await cat.save()
  }

  try {
    await Movie.remove({ _id: id })
    res.send({ success: true })
  } catch (err) {
    res.send({ success: false })
  }
}

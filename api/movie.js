const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const request = require('request-promise')
const _ = require('lodash')

// 更新电影库
const updateMovies = async (movie) => {
  const options = {
    uri: `https://api.douban.com/v2/movie/subject/${movie.doubanId}?apikey=0b2bdeda43b5688921839c8ecb20399b`,
    json: true
  }

  const data = await request(options)

  const director = data.directors[0] || ''

  _.extend(movie, {
    country: data.countries[0],
    language: data.language,
    summary: data.summary,
    genres: data.genres,
    director: director.name
  })

  const genres = data.genres || []

  if (genres && genres.length) {
    await Promise.all(genres.forEach(async genre => {
      let cat = await Category.findOne({
        name: genre
      })

      if (cat) {
        cat.movies.push(movie._id)

        await cat.save()
      } else {
        cat = new Category({
          name: genre,
          movies: [movie._id]
        })

        cat = await cat.save()
        movie.category = cat._id
        await movie.save()
      }
    }))
  } else {
    movie.save()
  }
}

// 根据豆瓣查询电影（同步一部电影）
exports.searchByDouban = async (q) => {

  const options = {
    uri: `https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(q)}&apikey=0b2bdeda43b5688921839c8ecb20399b`,
    json: true
  }

  const data = await request(options)

  let movies = []

  if (data.length) {

    let movie = new Movie({
      title: data[0].title,
      summary: data[0].sub_title,
      doubanId: data[0].id,
      year: data[0].year,
      poster: data[0].img
    })

    movie = await movie.save()

    movies.push(movie)

    // 更新电影
    updateMovies(movie)
  }

  return movies
}

// 根据热度搜索电影（排行榜）
exports.findHotMovies = async (hot, count) => {
  const data = await Movie.find({}).sort({
    pv: hot
  }).limit(count)

  return data
}

// 根据分类搜索电影（分类）
exports.findMoviesByCat = async (cat) => {
  const data = await Category.findOne({
      name: cat
    })
    .populate({
      path: 'movies',
      select: '_id title poster summary'
    })

  return data
}

// 点击分类根据分类 id 搜索电影
exports.searchByCategroyId = async (catId) => {
  const data = await Category.find({
    _id: catId
  }).populate({
    path: 'movies',
    select: '_id title poster',
    options: {
      limit: 8
    }
  })

  return data
}

// 根据关键字搜索电影
exports.searchByKeyword = async (q) => {
  const data = await Movie.find({
    title: new RegExp(q + '.*', 'i')
  })

  return data
}

// 根据电影 id 搜索电影
exports.findMovieById = async (id) => {
  const data = await Movie.findOne({
    _id: id
  })

  return data
}

// 查询所有分类
exports.findCategories = async (id) => {
  const data = await Category.find({})

  return data
}

// 根据 id 查询分类
exports.findCategoryById = async (id) => {
  const data = await Category.findOne({
    _id: id
  })

  return data
}

// 查询电影和电影分类
exports.findMoviesAndCategory = async (fields) => {
  const data = await Movie.find({}).populate('category', fields)

  return data
}

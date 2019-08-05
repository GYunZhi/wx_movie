const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')

// 分类录入页面
exports.show = async (req, res, next) => {
  const { _id } = req.params
  let category = {}

  if (_id) {
    category = await Category.findOne({ _id })
  }

  await res.render('pages/category_admin', {
    title: '后台分类录入页面',
    category
  })
}

// 新增分类
exports.add = async (req, res, next) => {
  const { name, _id } = req.body.category

  let category

  if (_id) {
    category = await await Category.findOne({ _id })
  }

  if (category) {
    category.name = name
  } else {
    category = new Category({
      name
    })
  }

  await category.save()

  res.redirect('/admin/category/list')
}

// 分类列表页面
exports.list = async (req, res, next) => {
  const categories = await Category.find({}, '_id name meta.updatedAt')
  await res.render('pages/category_list', {
    title: '分类的列表页面',
    categories
  })
}

// 删除分类（删除该分类下所有电影）
exports.del = async (req, res, next) => {
  const id = req.query.id

  try {
    await Category.remove({
      _id: id
    })
    await Movie.remove({
      category: id
    })
    res.send({ success: true })
  } catch (err) {
    res.send({ success: false })
  }
}

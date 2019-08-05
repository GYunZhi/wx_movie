const mongoose = require('mongoose')
const Category = mongoose.model('Category')

// 获取首页分类电影列表
exports.getCatagoryList = async (ctx, next) => {
  const categories = await Category.find({})

  return categories
}

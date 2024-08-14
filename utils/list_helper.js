const _ = require('lodash')

const totalLikes = (blogs) => {
  return blogs.reduce(
    (acc, cur) => acc + cur.likes,
    0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  } else {
    blogs.sort((a, b) => a.likes - b.likes)
    const favorite =
        {
          title: blogs.at(-1).title,
          author: blogs.at(-1).author,
          likes: blogs.at(-1).likes
        }
    return favorite
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  } else {
    const authors = _(blogs)
      .groupBy('author')
      .map((items, author) => {
        return {
          author: author,
          blogs: items.length
        }
      })
      .orderBy('blogs', 'desc')
      .value()
    return authors[0]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  } else {
    const authors = _(blogs)
      .groupBy('author')
      .map((items, author) => {
        let likes = 0
        _.map(items, item => {
          likes = item.likes + likes
        })
        return {
          author: author,
          likes: likes
        }
      })
      .orderBy('likes', 'desc')
      .value()
    return authors[0]
  }
}

const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  dummy
}
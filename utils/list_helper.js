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

const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

module.exports = {
  totalLikes,
  favoriteBlog,
  dummy
}
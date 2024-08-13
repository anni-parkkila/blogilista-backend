const totalLikes = (blogs) => {
  return blogs.reduce(
    (acc, cur) => acc + cur.likes,
    0)
}

const dummy = (blogs) => {
  return 1
}

module.exports = {
  totalLikes,
  dummy
}
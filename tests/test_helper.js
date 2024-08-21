const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Matin Testiploki',
    author: 'Matti Meikäläinen',
    url: 'matinploki.fi',
    likes: 1
  },
  {
    title: 'Maijan Testiblogi',
    author: 'Maija Mehiläinen',
    url: 'maijanblogi.fi',
    likes: 3
  }
]
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
  nonExistingId
}

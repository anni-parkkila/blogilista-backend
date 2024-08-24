const blogsRouter = require('express').Router()
const middleware = require('../utils/middleware')
const userExtractor = middleware.userExtractor
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author || 'N/A',
    url: body.url,
    likes: body.likes || 0,
    user: user
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body
  const user = await User.findById(request.body.user)

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true })
  updatedBlog.user = user
  response.json(updatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    user.blogs = user.blogs.filter(b => b.id.toString() !== blog.id.toString())
    await user.save()
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'user not authorized' })
  }
})

blogsRouter.get('/info', async (request, response, next) => {
  await Blog.countDocuments({})
    .then(numberOfBlogs => {
      response.send(
        `<p>Bloglist has info for ${numberOfBlogs} blogs</p>
          <p>${new Date()}</p>`
      )})
    .catch(error => next(error))
})

module.exports = blogsRouter
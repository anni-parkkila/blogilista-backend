require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const morgan = require('morgan')

const Blog = require('./models/blog')


const mongoUrl = process.env.MONGODB_URI
console.log('connecting to MongoDB')
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
morgan.token('post-data', function (req) {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = request.body

  new Blog(blog)
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

app.get('/info', async (request, response, next) => {
  await Blog.countDocuments({})
    .then(numberOfBlogs => {
      response.send(
        `<p>Bloglist has info for ${numberOfBlogs} blogs</p>
          <p>${new Date()}</p>`
      )})
    .catch(error => next(error))
})

module.exports = app
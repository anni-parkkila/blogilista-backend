require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')

const mongoose = require('mongoose')

const morgan = require('morgan')


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

app.use('/api/blogs', blogsRouter)

module.exports = app
const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const blogs = await helper.blogsInDb()
  assert.strictEqual(blogs.length, helper.initialBlogs.length)
})

test('blogs have a unique property called id, not _id', async () => {
  const blogs = await helper.blogsInDb()
  blogs.forEach(blog => {
    assert.strictEqual(blog._id, undefined)
    assert.notStrictEqual(blog.id, undefined)
  })
})

test('a new blog can be added', async () => {
  const newBlog = {
    title: 'Adventures of Sherlock Holmes',
    author: 'John H. Wilson',
    url: 'b221.co.uk',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()
  const title = blogs.map(r => r.title)

  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
  assert(title.includes('Adventures of Sherlock Holmes'))
})

test('likes will be set to 0 if it is undefined while posting', async () => {
  const newBlog = {
    title: 'Adventures of Sherlock Holmes',
    author: 'John H. Wilson',
    url: 'b221.co.uk'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()

  assert.strictEqual(blogs.at(-1).likes, 0)
})

test('a blog without title or url is not added', async () => {
  const newBlogNoTitle = {
    author: 'John H. Wilson',
    url: 'b221.co.uk'
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoTitle)
    .expect(400)

  const newBlogNoUrl = {
    title: 'Adventures of Sherlock Holmes',
    author: 'John H. Wilson'
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoUrl)
    .expect(400)

  const blogs = await helper.blogsInDb()

  assert.strictEqual(blogs.length, helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})
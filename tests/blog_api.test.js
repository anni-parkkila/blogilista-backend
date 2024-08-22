const { test, describe, before, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sherlocked', 10)
    const initialUser = new User({
      username: 'holmes',
      name: 'Sherlock Holmes',
      passwordHash
    })
    await initialUser.save()

    const loggedIn = await api
      .post('/api/login')
      .send({ username: 'holmes', password: 'sherlocked' })
      .expect(200)
    const token = loggedIn.body.token

    await Blog.deleteMany({})
    const initialBlog = {
      title: 'Matin Testiploki',
      author: 'Matti Meikäläinen',
      url: 'matinploki.fi',
    }
    await api
      .post('/api/blogs')
      .send(initialBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, 1)
  })

  test('blogs have a unique property called id, not _id', async () => {
    const blogs = await helper.blogsInDb()
    blogs.forEach(blog => {
      assert.strictEqual(blog._id, undefined)
      assert.notStrictEqual(blog.id, undefined)
    })
  })

  describe('adding a new blog', () => {
    test('a new blog can be added', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newBlog = {
        title: 'Adventures of Sherlock Holmes',
        author: 'John H. Wilson',
        url: 'b221.co.uk',
        likes: 0
      }

      const loggedIn = await api
        .post('/api/login')
        .send({ username: 'holmes', password: 'sherlocked' })
        .expect(200)
      const token = loggedIn.body.token

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const title = blogsAtEnd.map(r => r.title)

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
      assert(title.includes('Adventures of Sherlock Holmes'))
    })

    test('likes will be set to 0 if it is undefined while posting', async () => {
      const newBlog = {
        title: 'Adventures of Sherlock Holmes',
        author: 'John H. Wilson',
        url: 'b221.co.uk'
      }

      const loggedIn = await api
        .post('/api/login')
        .send({ username: 'holmes', password: 'sherlocked' })
        .expect(200)
      const token = loggedIn.body.token

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogs = await helper.blogsInDb()

      assert.strictEqual(blogs.at(-1).likes, 0)
    })

    test('a blog without title or url is not added', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newBlogNoTitle = {
        author: 'John H. Wilson',
        url: 'b221.co.uk'
      }

      const loggedIn = await api
        .post('/api/login')
        .send({ username: 'holmes', password: 'sherlocked' })
        .expect(200)
      const token = loggedIn.body.token

      await api
        .post('/api/blogs')
        .send(newBlogNoTitle)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const newBlogNoUrl = {
        title: 'Adventures of Sherlock Holmes',
        author: 'John H. Wilson'
      }

      await api
        .post('/api/blogs')
        .send(newBlogNoUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('a blog cannot be added if token is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newBlog = {
        title: 'Adventures of Sherlock Holmes',
        author: 'John H. Wilson',
        url: 'b221.co.uk',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  describe('updating a blog', () => {
    test('updating succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedLikes = {
        ...blogToUpdate,
        likes: 1000
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedLikes)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd[0]

      assert.strictEqual(updatedBlog.likes, 1000)
    })

    test('updating does not succeed if id is not valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedLikes = {
        ...blogToUpdate,
        likes: 1000
      }

      await api
        .put('/api/blogs/idnotvalid000')
        .send(updatedLikes)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd[0]

      assert.strictEqual(blogToUpdate.likes, updatedBlog.likes)
    })
  })

  describe('deleting a blog', () => {
    test('deleting succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      const loggedIn = await api
        .post('/api/login')
        .send({ username: 'holmes', password: 'sherlocked' })
        .expect(200)
      const token = loggedIn.body.token

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

      const titles = blogsAtEnd.map(r => r.title)
      assert(!titles.includes(blogToDelete.title))
    })

    test('deleting does not succeed if id is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const loggedIn = await api
        .post('/api/login')
        .send({ username: 'holmes', password: 'sherlocked' })
        .expect(200)
      const token = loggedIn.body.token

      await api
        .delete('/api/blogs/idnotvalid000')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })
  after(async () => {
    await mongoose.connection.close()
  })
})
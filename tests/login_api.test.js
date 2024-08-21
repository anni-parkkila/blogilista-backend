const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
//const Blog = require('../models/blog')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  describe('login', () => {
    test('succeeds with the existing username', async () => {
      const user = {
        username: 'root',
        password: 'sekret'
      }

      const result = await api
        .post('/api/login')
        .send(user)
        .expect(200)

      assert(result.body.token)
      assert.strictEqual(result.body.username, user.username)
    })

    test('succeeds with a fresh username', async () => {
      await helper.usersInDb()

      const newUser = {
        username: 'holmes',
        name: 'Sherlock Holmes',
        password: 'sherlocked',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))

      const result = await api
        .post('/api/login')
        .send(newUser)
        .expect(200)

      assert(result.body.token)
      assert.strictEqual(result.body.username, newUser.username)
    })

    test('fails if password is incorrect', async () => {
      const user = {
        username: 'root',
        password: 'sikrit'
      }

      const result = await api
        .post('/api/login')
        .send(user)
        .expect(401)

      assert(!result.body.token)
      assert(result.body.error.includes('invalid username or password'))
    })

    test('fails if username is incorrect', async () => {
      const user = {
        username: 'rot',
        password: 'sekret'
      }

      const result = await api
        .post('/api/login')
        .send(user)
        .expect(401)

      assert(!result.body.token)
      assert(result.body.error.includes('invalid username or password'))
    })
  })
  after(async () => {
    await mongoose.connection.close()
  })
})
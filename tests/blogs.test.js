const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogList = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

describe('total likes', () => {

  test('of an empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(blogList.slice(0,1))
    assert.strictEqual(result, 7)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogList)
    assert.strictEqual(result, 36)
  })

  test('of first three blogs in the list is 24', () => {
    const result = listHelper.totalLikes(blogList.slice(0, 3))
    assert.strictEqual(result, 24)
  })
})

describe('favorite blog', () => {

  test('when the list is empty, there is no favorite', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, undefined)
  })

  test('when list has only one blog, favorite is that blog', () => {
    const result = listHelper.favoriteBlog(blogList.slice(0,1))
    const favorite =
    {
      title: blogList.slice(0,1)[0].title,
      author: blogList.slice(0,1)[0].author,
      likes: blogList.slice(0,1)[0].likes
    }
    assert.deepEqual(result, favorite)
  })

  test('is the one with the most likes of all the blogs', () => {
    const result = listHelper.favoriteBlog(blogList)
    const favorite =
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12
      }
    assert.deepEqual(result, favorite)
  })
})

describe('author with the most blogs', () => {

  test('when the list is empty, there are no authors', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, undefined)
  })

  test('when list has only one blog, most blogs are from that author', () => {

    const result = listHelper.mostBlogs(blogList.slice(0,1))
    const author =
    {
      author: blogList.slice(0,1)[0].author,
      blogs: 1
    }
    assert.deepEqual(result, author)
  })

  test('out of all the blogs', () => {
    const result = listHelper.mostBlogs(blogList)
    const author =
    {
      author: 'Robert C. Martin',
      blogs: 3
    }
    assert.deepEqual(result, author)
  })
})

describe('author with the most likes', () => {

  test('when the list is empty, there are no authors', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, undefined)
  })

  test('when list has only one blog, most likes are from that blog', () => {
    const result = listHelper.mostLikes(blogList.slice(0,1))
    const author =
    {
      author: blogList.slice(0,1)[0].author,
      likes: blogList.slice(0,1)[0].likes
    }
    assert.deepEqual(result, author)
  })

  test('out of all the blogs is the one with the highest sum of likes', () => {
    const result = listHelper.mostLikes(blogList)
    const author =
    {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }
    assert.deepEqual(result, author)
  })
})
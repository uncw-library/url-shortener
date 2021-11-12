const express = require('express')
const queries = require('../queries.js')

const router = express.Router()

/*
    Routes for site.com/create/
*/

router.get('/', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }
  payload = {
    username: req.user
  }
  res.render('create', payload)
})

router.post('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }

  const item = {
    slug: req.body.shortened,
    dest: req.body.destination,
    username: req.body.username
  }

  // all three fields must be entered
  if (!item.slug.length || !item.dest.length || !item.username.length) {
    return res.render('create', {error: {text: "All fields must be entered"}})
  }
  // dest must be like a url
  if (!isUrlValid(item.dest)) {
    return res.render('create', {error: {text: "Please retype the destination URL.  It did not appear valid."}})
  }

  return await queries.createItem(item)
    .then(res.redirect('/'))
    .catch(next)
})

function isUrlValid(url) {
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
  const re = new RegExp(expression)
  const match = url.match(re)
  if (!match || !match.length) {
    return false
  }
  return true
}

module.exports = router
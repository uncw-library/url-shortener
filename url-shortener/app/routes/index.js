const express = require('express')
const passport = require('passport')
const db = require('../db.js')
const ensureAuthenticated = require('../config.js')

const router = express.Router()

router.get('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  const queryText = `
    SELECT id, slug, dest, username
    FROM urls
    ORDER BY id DESC;
  `
  const result = await db.query(queryText)
  const previousItems = result.rows
  payload = {
    username: req.user,
    previousItems: previousItems
  } 
  res.render('items-page', payload)
})

router.get('/create', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  res.render('create')
})

router.post('/create', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  const shortened = req.body.shortened
  const destination = req.body.destination
  const username = req.body.username
  // all three fields must be entered
  if (!(shortened.length && destination.length && username.length)) {
    return res.render('create', {error: {text: "All fields must be entered"}})
  }
  const validatedDest = check_url(destination)
  if (!validatedDest) {
    return res.render('create', {error: {text: "Please retype the destination URL.  It did not appear valid."}})
  }
  const queryText = `
    INSERT INTO urls (slug, dest, username)
    VALUES ($1, $2, $3)
  `
  return await db.query(queryText, [shortened, validatedDest, username])
    .then(res.redirect('/'))
    .catch(next)
})

router.get('/revise', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  const id = req.query.id
  const queryText = `
    SELECT id, slug, dest, username
    FROM urls
    WHERE id = $1;
  `
  const result = await db.query(queryText, [id])
  const item = result.rows
  if (!item.length) {
    return res.redirect('/')
  }
  payload = {
    username: req.user,
    item: item[0]
  } 
  res.render('revise', payload)
})

router.post('/revise', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  const id = req.body.id
  const shortened = req.body.shortened
  const destination = req.body.destination
  const username = req.body.username
  if (!shortened.length && !destination.length && !username.length) {
    const queryText = `
      SELECT id, slug, dest, username
      FROM urls
      ORDER BY id DESC;
    `
    const result = await db.query(queryText)
    const previousItems = result.rows
    payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "At least one field must be different"}
    } 
    return res.render('items-page', payload)
  }
  // get the existing db row
  const queryText1 = `
    SELECT id, slug, dest, username
    FROM urls
    WHERE id = $1;
  `
  const result = await db.query(queryText1, [id])
  const items = result.rows
  if (!items.length) {
    const queryText2 = `
      SELECT id, slug, dest, username
      FROM urls
      ORDER BY id DESC;
    `
    const result = await db.query(queryText2)
    const previousItems = result.rows
    payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "DB error.  Couldn't find matching item"}
    } 
    return res.render('items-page', payload)
  }
  const existingItem = items[0]
  if (shortened.length) {
    existingItem.slug = shortened
  }
  if (destination.length) {
    existingItem.dest = destination
  }
  if (username.length) {
    existingItem.username = username
  }
  const validatedDest = check_url(existingItem.dest)
  if (!validatedDest) {
    const queryText = `
      SELECT id, slug, dest, username
      FROM urls
      ORDER BY id DESC;
    `
    const result = await db.query(queryText)
    const previousItems = result.rows
    payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "Please retype the destination URL.  It did not appear valid."}
    } 
    return res.render('items-page', payload)
  }
  const queryText3 = `
    UPDATE urls
    SET slug = $1, dest = $2, username = $3
    WHERE id = $4
  `
  return await db.query(queryText3, [existingItem.slug, existingItem.dest, existingItem.username, id])
    .then(res.redirect('/'))
    .catch(next)
})

router.get('/delete', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  const id = req.query.id
  const queryText = `
    SELECT id, slug, dest, username
    FROM urls
    WHERE id = $1;
  `
  const result = await db.query(queryText, [id])
  const item = result.rows
  if (!item.length) {
    return res.redirect('/')
  }
  payload = {
    username: req.user,
    item: item[0]
  } 
  res.render('delete', payload)
})

router.post('/delete', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  const id = req.body.id

  // get the existing db row
  const queryText1 = `
    SELECT id, slug, dest, username
    FROM urls
    WHERE id = $1;
  `
  const result = await db.query(queryText1, [id])
  const items = result.rows
  if (!items.length) {
    const queryText2 = `
      SELECT id, slug, dest, username
      FROM urls
      ORDER BY id DESC;
    `
    const result = await db.query(queryText2)
    const previousItems = result.rows
    payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "DB error.  Couldn't find matching item"}
    } 
    return res.render('items-page', payload)
  }
  // delete the item
  const queryText3 = `
    DELETE FROM urls
    WHERE id = $1
  `
  return await db.query(queryText3, [id])
    .then(res.redirect('/'))
    .catch(next)
})

function check_url(url) {
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
  const re = new RegExp(expression)
  const match = url.match(re)
  if (!match || !match.length) {
    return null
  }
  return match[0]
}

router.get('/login', (req, res, next) => {
  res.render('login', {
    layout: 'layout',
    title: '--- Login ---',
    failure: (req.query.failure) // Failed login attempt
  })
})

router.post('/login', passport.authenticate('ldapauth', { failureRedirect: '/login?failure=true' }), async (req, res) => {
  res.redirect('/')
})

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/login')
})


module.exports = router
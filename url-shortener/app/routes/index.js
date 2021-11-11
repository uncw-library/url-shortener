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
    SELECT *
    FROM urls;
  `
  const result = await db.query(queryText)
  const previousItems = result.rows

  payload = {
    username: req.user,
    previousItems: previousItems
  } 
  res.render('items-page', payload)
})

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
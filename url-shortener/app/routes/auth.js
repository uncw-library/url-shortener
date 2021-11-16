const express = require('express')
const passport = require('passport')

const ensureAuthenticated = require('../config.js')

const router = express.Router()

/*
    Routes for site.com/auth/
*/

router.get('/login', (req, res, next) => {
  const error = req.query.error || null
  const payload = {
    error: error
  }
  res.render('login', payload)
})

router.post('/login', passport.authenticate('ldapauth', { failureRedirect: '/auth/login?error=true' }), async (req, res) => {
  res.redirect('/')
})

router.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/auth/login')
})

module.exports = router
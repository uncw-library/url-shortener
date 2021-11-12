const express = require('express')
const queries = require('../queries.js')

const router = express.Router()

router.get('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }

  const items = await queries.getAllItems(next)
  const payload = {
    username: req.user,
    previousItems: items
  } 

  res.render('items-page', payload)
})

module.exports = router
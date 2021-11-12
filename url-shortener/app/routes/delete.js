const express = require('express')
const queries = require('../queries.js')

const router = express.Router()

/*
    Routes for site.com/delete/
*/

router.get('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }

  const id = req.query.id
  const items = await queries.getItemsByID(id).catch(next)
  if (!items.length) {
    return res.redirect('/')
  }

  payload = {
    username: req.user,
    item: items[0]
  }
  res.render('delete', payload)
})

router.post('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }
  const id = req.body.id

  const items = await queries.getItemsByID(id).catch(next)

  // Exit to homepage + error message, if item not findable
  if (!items.length) {
    const previousItems = await queries.getAllItems().catch(next)
    const payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "DB error.  Couldn't find matching item"}
    }
    return res.render('items-page', payload)
  }

  // Delete the item
  return await queries.deleteItemByID(id)
    .then(res.redirect('/'))
    .catch(next)
})


module.exports = router
const express = require('express')
const queries = require('../queries.js')

const router = express.Router()

/*
    Routes for site.com/revise/
*/

router.get('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }
  const id = req.query.id
  const items = await queries.getItemsByID(id)
  
  // Exit to homepage + error, if item not findable
  if (!items.length) {
    const previousItems = await queries.getAllItems()
    const payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "DB error.  Could not find item"}
    } 
    return res.render('items-page', payload)
  }

  const payload = {
    username: req.user,
    item: items[0]
  } 
  res.render('revise', payload)
})

router.post('/', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login')
  }

  const reqItem = {
    id: req.body.id,
    slug: req.body.shortened,
    dest: req.body.destination,
    username: req.body.username
  }

  // exit to homepage + error message, if not one field entered
  if (!reqItem.slug.length && !reqItem.dest.length && !reqItem.username.length) {
    const previousItems = await queries.getAllItems()
    const payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "At least one field must be different"}
    } 
    return res.render('items-page', payload)
  }

  // get the existing db row
  const items = await queries.getItemsByID(reqItem.id)

  // exit to homepage + error if item not findable
  if (!items.length) {
    const previousItems = queries.getAllItems()
    const payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "DB error.  Couldn't find matching item"}
    } 
    return res.render('items-page', payload)
  }

  const existingItem = items[0]
  const mergedItem = mergeIn(existingItem, reqItem)

  // exit to homepage + error if req dest is not like a url
  if (!isUrlValid(mergedItem.dest)) {
    const previousItems = await queries.getAllItems()
    payload = {
      username: req.user,
      previousItems: previousItems,
      error: {text: "Please retype the destination URL.  It did not appear valid."}
    } 
    return res.render('items-page', payload)
  }

  // if we survived this far, update the db & exit to homepage
  return await queries.updateItem(mergedItem)
    .then(res.redirect('/'))
    .catch(next)
})

function mergeIn(previousItem, newItem) {
  if (newItem.slug.length) {
      previousItem.slug = newItem.slug
  }
  if (newItem.dest.length) {
      previousItem.dest = newItem.dest
  }
  if (newItem.username.length) {
      previousItem.username = newItem.username
  }
  return previousItem
}

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
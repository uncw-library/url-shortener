const express = require('express')
const createError = require('http-errors')

const router = require('./routes.js')

const app = express()
app.use('/', router)

/*
 if the request doesn't match a route above,
 create a 404 error
*/

app.use((req, res, next) => {
  next(createError(404))
})

/*
error handler
*/

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  console.error(err.stack)
  res.locals.message = err.message
  // send error details to view only in development
  res.locals.error = app.get('env') === 'development' ? err : {}
  res.render('error')
})

module.exports = app

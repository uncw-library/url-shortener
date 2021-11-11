const express = require('express')

const db = require('./db.js')

const router = express.Router()

router.get('/', (req, res, next) => {
  res.redirect('https://library.uncw.edu')
})

router.get('/:path', async (req, res, next) => {
  // the table "urls" has rows:
  //  {id, url, to, user}
  const path = req.params.path
  const queryText = `
    SELECT * 
    FROM urls 
    WHERE url = '${path}'
  `
  const response = await db.query(queryText)
  const shortcircuit = `https://library.uncw.edu/${path}`
  if (!response.rows.length) {
    return res.redirect(shortcircuit)
  }
  const targetPath = response.rows[0].to
  if (!targetPath.length) {
    return res.redirect(shortcircuit)
  }
  console.log(`redirecting to:  ${targetPath}`)
  res.redirect(targetPath)
})

module.exports = router

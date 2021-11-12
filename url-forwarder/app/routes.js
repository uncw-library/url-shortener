const express = require('express')

const db = require('./db.js')

const router = express.Router()

router.get('/', (req, res, next) => {
  res.redirect('https://library.uncw.edu')
})

router.get('/:path', async (req, res, next) => {
  // the table "urls" has rows:
  //  {id, slug, dest, username}
  const path = req.params.path
  const queryText = `
    SELECT * 
    FROM urls 
    WHERE slug = $1
  `
  const response = await db.query(queryText, [path])
  const shortcircuit = `https://library.uncw.edu/${path}`
  if (!response.rows.length) {
    return res.redirect(shortcircuit)
  }
  const targetPath = response.rows[0].dest
  if (!targetPath.length) {
    return res.redirect(shortcircuit)
  }
  console.log(`redirecting to:  ${targetPath}`)
  res.redirect(targetPath)
})

module.exports = router

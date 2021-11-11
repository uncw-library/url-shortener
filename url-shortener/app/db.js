const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'url-shortener-api',
  port: 5432,
  host: 'db',
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 36000,
  application_name: 'url-shortener'
})

module.exports = {
  query: (text, params, next) => {
    return pool.query(text, params, next)
  }
}

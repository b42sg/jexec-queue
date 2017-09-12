const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const pinoLogger = require('express-pino-logger')

const createRouter = require('./router')

const errorHandler = () => function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  res.status(500)
  res.json({ error: err.message || err })
}

module.exports = function ({ jobs, workers, log }) {
  const app = express()

  app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

  if (log) {
    app.use(pinoLogger())
  }

  app.use(bodyParser.json())
  app.use(createRouter({ jobs, workers }))
  app.use(errorHandler())

  return app
}

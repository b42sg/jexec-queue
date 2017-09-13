const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const pinoLogger = require('express-pino-logger')

const createRouter = require('./router')

// const auth = () => 

const errorHandler = () => function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  res.status(500)
  res.json({ error: err.message || err })
}

module.exports = function ({ jobs, workers, log, corsOrigin }) {
  const app = express()

  if (corsOrigin) {
    app.use(cors({ credentials: true, origin: corsOrigin }))
  }

  if (log) {
    app.use(pinoLogger())
  }

  app.use(bodyParser.json())
  app.use(createRouter({ jobs, workers }))
  app.use(errorHandler())

  return app
}

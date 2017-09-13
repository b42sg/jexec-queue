const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const pinoLogger = require('express-pino-logger')

const createRouter = require('./router')

const auth = () => (req, res, next) => {
  if (!req.query.api_key) {
    res.status(401)
    res.json({ error: 'Unauthorized' })
    return
  }

  next()
}

const errorHandler = () => function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  res.status(500)
  res.json({ error: err.message || err })
}

module.exports = function ({ jobs, workers, log, corsOrigin }) {
  const app = express()

  app.use(auth())

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

const bootWSIO = require('./wsio')
const bootQueue = require('./queue')
const bootServer = require('./server')
const bootModels = require('./models')
const bootServices = require('./services')

module.exports = async function boot (options) {
  const io = await bootWSIO()
  const models = await bootModels({ uri: options.mongoURL })
  const services = await bootServices({ io, models })

  const server = await bootServer({
    ...services,
    log: options.log,
    host: options.serverHost,
    port: options.serverPort,
    corsOrigin: options.corsOrigin
  })

  const queue = await bootQueue({
    io,
    stuckJobsTimeout: options.queueStuckJobsTimeout,
    stuckCleanerInterval: options.queueStuckCleanerInterval,
    ...services
  })

  io.attach(server)
  queue.run()

  return { server }
}

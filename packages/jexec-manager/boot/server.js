const http = require('http')
const Promise = require('bluebird')
const createApp = require('../lib/app')

module.exports = function ({ host, port, ...options }) {
  const app = createApp(options)
  const server = http.createServer(app)
  const listen = Promise.promisify(server.listen, { context: server })

  return listen(+port, host).return(server)
}

const socketIO = require('socket.io')
const Promise = require('bluebird')

module.exports = function ({ server } = {}) {
  return Promise.resolve(socketIO(server))
}

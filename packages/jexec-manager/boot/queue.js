const Promise = require('bluebird')

const Queue = require('../lib/Queue')

module.exports = function (options) {
  const queue = new Queue(options)
  return Promise.resolve(queue)
}

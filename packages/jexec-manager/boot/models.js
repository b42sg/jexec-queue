const mongoose = require('mongoose')
const Promise = require('bluebird')

const jobSchema = require('../lib/schemas/Job')
const workerSchema = require('../lib/schemas/Worker')

mongoose.Promise = Promise

module.exports = function ({ uri }) {
  return mongoose.createConnection(uri, { useMongoClient: true }).then(db => ({
    job: db.model('jobs', jobSchema),
    worker: db.model('workers', workerSchema)
  }))
}

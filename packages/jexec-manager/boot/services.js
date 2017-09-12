const Promise = require('bluebird')

const Jobs = require('../lib/services/Jobs')
const Workers = require('../lib/services/Workers')

module.exports = function ({ io, models }) {
  const jobs = new Jobs({ model: models.job })
  const workers = new Workers({ io, model: models.worker })

  return Promise.resolve({ jobs, workers })
}

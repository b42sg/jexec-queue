const Config = require('12factor-config')

const scheme = {
  serverHost: {
    env: 'SERVER_HOST',
    default: process.env.HOST || '0.0.0.0',
    required: true
  },
  serverPort: {
    env: 'SERVER_PORT',
    type: 'integer',
    default: process.env.PORT || 8088,
    required: true
  },
  mongoURL: {
    env: 'MONGO_URL',
    default: 'mongodb://localhost:27017/jexec',
    required: true
  },
  log: {
    env: 'LOG',
    default: true,
    type: 'boolean'
  },
  corsOrigin: {
    env: 'CORS_ORIGIN',
    default: 'http://localhost:3000'
  },
  queueStuckJobsTimeout: {
    env: 'QUEUE_STUCK_JOBS_TIMEOUT',
    type: 'integer',
    default: 120000
  },
  queueStuckCleanerInterval: {
    env: 'QUEUE_STUCK_CLEANER_INTERVAL',
    type: 'integer',
    default: 120000
  }
}

const config = Config(scheme)

module.exports = config

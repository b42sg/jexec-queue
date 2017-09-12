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
  }
}

const config = Config(scheme)

module.exports = config

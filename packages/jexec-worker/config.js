const Config = require('12factor-config')

const scheme = {
  managerUrl: {
    env: 'GRID_URL',
    default: 'http://localhost:8088',
    required: true
  },
  delay: {
    env: 'DELAY',
    type: 'integer',
    default: 0
  }
}

const config = Config(scheme)

module.exports = config

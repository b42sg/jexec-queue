const boot = require('./boot')
const config = require('./config')

boot(config).then(({ server }) => {
  console.log(server.address())
})

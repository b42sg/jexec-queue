const { omit, assign } = require('lodash')

const id2Id = item => (item ? assign(omit(item, ['_id']), { id: item._id }) : item)

module.exports = { id2Id }

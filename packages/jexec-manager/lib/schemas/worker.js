const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = Schema({
  status: { type: 'string', enum: ['pending', 'processing', 'locked'], default: 'pending' },
  locked: 'boolean',
  created_at: { type: Date, required: true, default: Date.now },
  reconnected_at: Date
}, { versionKey: false })

const transform = {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
  }
}

schema.set('toJSON', transform)
schema.set('toObject', transform)

module.exports = schema

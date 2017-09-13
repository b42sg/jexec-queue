const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  status: {
    type: 'string',
    enum: ['pending', 'processing', 'completed', 'aborted', 'failed', 'locked'],
    default: 'pending'
  },
  result: 'object',
  locked: 'boolean',
  payload: 'object',
  workerId: 'string',
  failed_at: Date,
  aborted_at: Date,
  started_at: Date,
  created_at: { type: Date, required: true, default: Date.now },
  completed_at: Date
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

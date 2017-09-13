const EventEmitter = require('events')
const debug = require('debug')('jexec-manager:jobs')

module.exports = class Jobs extends EventEmitter {
  constructor ({ model }) {
    super()
    this.model = model
  }

  async create (payload) {
    const job = await this.model.create({ payload, status: 'pending' })
    this.emit('CREATED', job)
    return job
  }

  async abort (jobId) {
    debug('abort job %j', jobId)
    const filter = { _id: jobId, status: { $in: ['locked', 'pending', 'processing'] } }
    const update = { status: 'aborted', aborted_at: new Date() }
    const result = await this.model.findOneAndUpdate(filter, update)
    this.emit('ABORTED', result)
    return result;
  }

  async remove(jobId) {
    debug('remove %j', jobId)

    const job = await this.model.findById(jobId)

    if (job) {
      await this.model.deleteOne({ _id: jobId })
      this.emit('REMOVED', job)
    }

    return true
  }

  find (...args) {
    return this.model.find(...args)
  }

  count (...args) {
    return this.model.count(...args)
  }

  failByWorkerId (workerId) {
    debug('fail by worker %j', workerId)
    const filter = { workerId, status: 'processing' }
    const update = { status: 'failed', failed_at: new Date(), $unset: { workerId: 1 } }
    return this.model.update(filter, update)
  }

  async completeByWorkerId (workerId, result) {
    const filter = { workerId, status: 'processing' }
    const update = { result, status: 'completed', completed_at: new Date(), $unset: { workerId: 1 } }
    return this.model.update(filter, update)
  }

  async getAndLockNextToProcess (jobId) {
    const filter = { status: 'pending', workerId: { $exists: false } }
    if (jobId) filter._id = jobId
    const update = { status: 'locked' }
    const job = await this.model.findOneAndUpdate(filter, update)
    return job
  }

  async findById (jobId) {
    return this.model.findById(jobId)
  }

  async complete (jobId) {
    return this.model.updateOne({ _id: jobId }, { status: 'completed', completed_at: new Date() })
  }

  async process (jobId, workerId) {
    debug('process %j workerId: %j', jobId, workerId)
    await this.model.updateOne({ _id: jobId }, { workerId, status: 'processing', started_at: new Date() })
  }

  async unlock (jobId) {
    debug('unlock %j', jobId)
    await this.model.updateOne({ _id: jobId }, { status: 'pending' })
  }

  async cleanStuck ({ period }) {
    const startedBefore = new Date(new Date() - period)
    debug('clean stuck %j ms ago (%j)', period, startedBefore)
    const filter = { status: { $in: ['processing', 'locked'] }, started_at: { $lt: startedBefore } }
    const update = { status: 'failed', failed_at: new Date(), $unset: { workerId: 1 } }

    await this.model.update(filter, update, { multi: true })
  }
}

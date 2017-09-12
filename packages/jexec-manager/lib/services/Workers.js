const assert = require('assert')
const EventEmitter = require('events')
const debug = require('debug')('jexec-manager:workers')

module.exports = class Workers extends EventEmitter {
  constructor ({ model, io }) {
    super()

    assert(io, 'io required')
    assert(model, 'model required')

    this.model = model
    this.sockets = new Map()
    this.workers = new WeakMap()

    io.on('connection', this.addSocket.bind(this))
  }

  addSocket (socket) {
    socket.on('REGISTER', (id, fn) => this.handleSocketRegister(socket, id, fn))
    socket.on('RESULT', data => this.handleSocketResult(socket, data))
    socket.on('ERROR', error => this.handleSocketError(socket, error))
    socket.on('disconnect', () => this.handleSocketDisconnect(socket))
    socket.on('ping', () => console.log('ping'))
  }

  async handleSocketDisconnect (socket) {
    const workerId = this.workers.get(socket)
    debug('disconnect worker %j', workerId)
    this.workers.delete(socket)
    this.sockets.delete(workerId)
    await this.model.deleteOne({ _id: workerId })
    this.emit('DROPPED', { workerId })
  }

  async handleSocketRegister (socket, id, callback) {
    debug('register with id %j', id)

    let workerId

    if (id) {
      const worker = await this.model.findOneAndUpdate(id, { reconnected_at: new Date() })
      workerId = worker ? worker.id : null
    }

    if (!workerId) {
      const worker = await this.model.create({})
      workerId = worker.id
    }

    this.workers.set(socket, workerId)
    this.sockets.set(workerId, socket)
    callback && callback(workerId)
    this.emit('AVAILABLE', workerId)
  }

  async handleSocketResult (socket, result) {
    const workerId = this.workers.get(socket)
    await this.model.updateOne({ _id: workerId }, { status: 'pending' })
    this.emit('RESULT', { workerId, result })
  }

  async handleSocketError (socket, error) {
    const workerId = this.workers.get(socket)
    await this.model.updateOne({ _id: workerId }, { status: 'pending' })
    this.emit('ERROR', { workerId, error })
  }

  async process (workerId, jobId, payload) {
    debug('process job %j by %j with %j', jobId, workerId, payload)
    const socket = this.sockets.get(workerId)

    if (!socket) return

    await this.model.updateOne({ _id: workerId }, { status: 'processing' })
    socket.emit('PROCESS', { jobId, payload })
  }

  async getOneAvailable (workerId, lock) {
    const filter = { status: 'pending', _id: { $in: Array.from(this.sockets.keys()) } }
    if (workerId) filter._id = workerId
    const update = lock ? { status: 'locked' } : {}
    const worker = await this.model.findOneAndUpdate(filter, update)
    return worker
  }

  async unlock (workerId) {
    await this.model.updateOne({ _id: workerId }, { status: 'pending' })
  }

  count (...args) {
    return this.model.count(...args)
  }

  async cleanStuck ({ period }) {
    const filter = { _id: { $nin: Array.from(this.sockets.keys()) } }
    await this.model.deleteMany(filter)
  }
}

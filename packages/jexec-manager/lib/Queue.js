const assert = require('assert')
const debug = require('debug')('jexec-manager:queue')

class Queue {
  constructor ({ workers, jobs, stuckJobsTimeout, stuckCleanerInterval }) {
    assert(jobs, 'jobs required')
    assert(workers, 'workers required')

    this.jobs = jobs
    this.workers = workers
    this.stuckJobsTimeout = stuckJobsTimeout
    this.stuckCleanerInterval = stuckCleanerInterval

    jobs.on('CREATED', this.handleJobCreated.bind(this))
    jobs.on('ABORTED', this.handleJobAborted.bind(this))
    jobs.on('REMOVED', this.handleJobAborted.bind(this))

    workers.on('AVAILABLE', this.handleWorkerAvailable.bind(this))
    workers.on('DROPPED', this.handleWorkerDropped.bind(this))
    workers.on('RESULT', this.handleWorkerResult.bind(this))
    workers.on('ERROR', this.handleWorkerError.bind(this))
  }

  async handleWorkerAvailable ({ workerId }) {
    await this.processNextJob(workerId)
  }

  async handleWorkerDropped ({ workerId }) {
    await this.jobs.failByWorkerId(workerId)
  }

  async handleJobAborted (job) {
    debug('handle job abort %j', job)

    if (job.workerId && job.status === 'processing') {
      await this.workers.abort(job.workerId)
    }

    this.processNextJob()
  }

  async handleWorkerResult ({ workerId, result }) {
    debug('result %j on worker %j', result, workerId)
    await this.jobs.completeByWorkerId(workerId, result)
    this.processNextJob(workerId)
  }

  async handleWorkerError ({ workerId, error }) {
    debug('error %j on worker %j', error, workerId)
    await this.jobs.failByWorkerId(workerId)
    this.processNextJob(workerId)
  }

  async handleJobCreated ({ id, payload }) {
    this.processNextJob(null, id, payload)
  }

  async processNextJob (workerId, jobId, payload) {
    const [ job, worker ] = await Promise.all([
      this.jobs.getAndLockNextToProcess(jobId),
      this.workers.getOneAvailable(workerId, true)
    ])

    if (worker && job) {
      await Promise.all([
        this.jobs.process(job.id, worker.id),
        this.workers.process(worker.id, job.id, job.payload)
      ])
    } else {
      await Promise.all([
        job && this.jobs.unlock(job.id),
        worker && this.workers.unlock(worker.id)
      ])
    }
  }

  async cleanStuckEntities () {
    const period = this.stuckJobsTimeout
    debug('clean stuck %j ms ago', period)
    await Promise.all([ this.workers.cleanStuck(), this.jobs.cleanStuck({ period }) ])
  }

  initStuckCleaner () {
    this.stuckJobsTimer = this.stuckCleanerInterval && this.stuckJobsTimeout &&
      setInterval(this.cleanStuckEntities.bind(this), this.stuckCleanerInterval)

    debug('stuck cleaner inited with interval %j', this.stuckCleanerInterval)

    this.isStuckCleanerInited = true
  }

  async run () {
    if (!this.isStuckCleanerInited) {
      this.initStuckCleaner()
    }

    let worker
    do {
      worker = await this.workers.getOneAvailable()
      if (worker) this.processNextJob(worker.id)
    } while (worker)
  }
}

module.exports = Queue

const assert = require('assert')
const pick = require('lodash/pick')

module.exports = function ({ jobs, workers }) {
  assert(jobs, 'jobs required')
  assert(workers, 'workers required')

  const Router = require('express').Router
  const router = new Router()

  router.get('/jobs', async function (req, res, next) {
    try {
      const [ data, count ] = await Promise.all([
        jobs.find({}, null, { sort: { created_at: -1 } }),
        jobs.count()
      ])

      res.json({ data, total: count })
    } catch (err) {
      next(err)
    }
  })

  router.post('/jobs', async function (req, res, next) {
    try {
      const data = pick(req.body, ['value'])
      const resp = await jobs.create(data)
      res.json(resp)
    } catch (err) {
      next(err)
    }
  })

  router.put('/jobs/:jobId/aborted', async function (req, res, next) {
    try {
      const jobId = req.params.jobId
      const resp = await jobs.abort(jobId)
      res.json(resp)
    } catch (err) {
      next(err)
    }
  })

  router.delete('/jobs/:jobId', async function (req, res, next) {
    try {
      const jobId = req.params.jobId
      const resp = await jobs.remove(jobId)
      res.json(resp)
    } catch (err) {
      next(err)
    }
  })

  router.get('/status', async function (req, res, next) {
    try {
      const [
        failedJobsCount,
        pendingJobsCount,
        completedJobsCount,
        processingJobsCount,
        pendingWorkersCount,
        processingWorkersCount
      ] = await Promise.all([
        jobs.count({ status: 'failed' }),
        jobs.count({ status: 'pending' }),
        jobs.count({ status: 'completed' }),
        jobs.count({ status: 'processing' }),
        workers.count({ status: 'pending' }),
        workers.count({ status: 'processing' })
      ])

      res.json({
        jobs: {
          failed: failedJobsCount,
          pending: pendingJobsCount,
          completed: completedJobsCount,
          processing: processingJobsCount
        },
        workers: {
          pending: pendingWorkersCount,
          processing: processingWorkersCount
        }
      })
    } catch (err) {
      next(err)
    }
  })

  return router
}

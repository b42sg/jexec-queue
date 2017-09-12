#!/usr/bin/env node
'use strict'

const io = require('socket.io-client')
const path = require('path')
const config = require('./config')
const debug = require('debug')('jexec-worker')

const taskScript = process.argv[2] || path.join(__dirname, './task')

const task = require(taskScript)

const url = config.managerUrl
const delay = config.delay

const socket = io(url)

let timer
let workerId
let processing = false // @TODO debug

let completedEvent
let hasDisconnected
let completedPayload

socket.on('connect', () => {
  debug('connect %j processing %j', workerId, processing)

  socket.emit('REGISTER', workerId, function (id) {
    debug('last completed %j %j %j %j', hasDisconnected, completedEvent, completedPayload, workerId)
    if (hasDisconnected && workerId === id && completedEvent) {
      debug('send last completed %j %j', completedEvent, completedPayload)
      socket.emit(completedEvent, completedPayload)
      completedEvent = null
      hasDisconnected = false
      completedPayload = null
    }

    workerId = id
    debug('registered with id %s', workerId)
  })
})

socket.on('disconnect', () => {
  debug('disconnected')
  hasDisconnected = true
})

socket.on('ABORT', () => {
  debug('abort %j', workerId)

  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})

socket.on('PROCESS', message => {
  if (timer) { // already running
    socket.emit('ERROR', { error: { message: 'busy' } })
    return
  }

  const { payload } = message

  debug('process %j', message)

  timer = setTimeout(() => {
    task(payload, function (error, result) {
      const event = error ? 'ERROR' : 'RESULT'
      const payload = error ? { error } : { result }

      debug(event + ' %j' + (hasDisconnected ? ' but disconnected' : ''), payload)

      if (!hasDisconnected) {
        socket.emit(event, payload)
      } else {
        completedEvent = event
        completedPayload = payload
      }

      timer = null
    })
  }, delay)
})



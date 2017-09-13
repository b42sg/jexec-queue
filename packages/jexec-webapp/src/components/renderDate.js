import React from 'react'
import moment from 'moment'

export default function ({ date } = {}) {
  return (
    <span>
      {date ? moment(date).calendar() : '-'}
    </span>
  )
}
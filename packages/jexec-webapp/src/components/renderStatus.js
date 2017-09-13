import React from 'react'
import Badge from 'reactstrap/lib/Badge'

const colors = {
  locked: 'info',
  failed: 'danger',
  pending: 'warning',
  aborted: 'default',
  completed: 'success',
  processing: 'primary'
}

export default function renderStatus({ status }) {
  return <Badge style={{ fontSize: 12 }} color={colors[status]}>{status}</Badge>
}
import React, { PureComponent } from 'react'
import { get, find } from 'lodash'
import { TableCell } from 'material-ui'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import { PagingState, LocalPaging, SelectionState } from '@devexpress/dx-react-grid'
import everyLimit from 'async/everyLimit'
import {
  Grid as DataGrid,
  TableView, TableHeaderRow,
  PagingPanel,
  TableSelection
} from '@devexpress/dx-react-grid-material-ui'

import axios from 'axios'

import api from '../api'

import BlockUI from '../components/BlockUI'
import renderDate from '../components/renderDate'
import AddJobDialog from '../components/AddJobDialog'
import renderStatus from '../components/renderStatus'
import JobDetailsDialog from '../components/JobDetailsDialog'
import ActionsIconButton from '../components/ActionsIconButton'

const RELOAD_PERIOD = 3000

export default class IndexPage extends PureComponent {
  state = {
    columns: [
      { name: 'id', title: 'ID' },
      { name: 'status', title: 'Status' },
      { name: 'failed_at', title: 'Failed' },
      { name: 'created_at', title: 'Added' },
      { name: 'aborted_at', title: 'Aborted' },
      { name: 'completed_at', title: 'Completed' },
      { name: 'actions', title: ' ' }
    ],
    rows: [],
    selectedRows: [],
    detailsJobId: null,
    allowedPageSizes: [10, 50, 100, 0]
  }

  componentDidMount () {
    this.loadData()
    this.initReloadTimer()
  }

  initReloadTimer = () => {
    this.reloadTimer = setTimeout(() => {
      this.loadData().then(this.initReloadTimer, this.initReloadTimer)
    }, RELOAD_PERIOD)
  }

  componentWillUmount () {
    clearTimeout(this.reloadTimer)
  }

  async abortJob (jobId) {
    return api.put(`/jobs/${jobId}/aborted`)
  }

  async removeJob (jobId) {
    return api.delete(`/jobs/${jobId}`)
  }

  async addJob (value) {
    return api.post('/jobs', { value })
  }

  abortSelectedJobs = () => {
    this.block()
    const ids = this.getSelectedIds()
    const iteratee = (id, cb) => this.abortJob(id).then(() => cb(null, true)).catch(cb)
    const callback = () => this.loadData().then(this.unblock, this.unblock)
    everyLimit(ids, 5, iteratee, callback)
    this.setState({ selectedRows: [] })
  }

  removeSelectedJobs = () => {
    this.block()
    const ids = this.getSelectedIds()
    const iteratee = (id, cb) => this.removeJob(id).then(() => cb(null, true)).catch(cb)
    const callback = () => this.loadData().then(this.unblock, this.unblock)
    everyLimit(ids, 5, iteratee, callback)
    this.setState({ selectedRows: [] })
  }

  getSelectedIds () {
    const { selectedRows, rows } = this.state
    return selectedRows.map(rowIndex => get(rows, `${rowIndex}.id`))
  }

  handleJobsAbortClick = () => {
    this.abortSelectedJobs()
  }

  handleJobsRemoveClick = () => {
    this.removeSelectedJobs()
  }

  handleJobRequestAbort = jobId => {
    this.block()
    this.abortJob(jobId).then(this.loadData.bind(this)).then(this.unblock, this.unblock)
  }

  handleJobRequestRemove = jobId => {
    this.block()
    this.removeJob(jobId).then(this.loadData.bind(this)).then(this.unblock, this.unblock)
  }

  handleSelectionChange = selectedRows => this.setState({ selectedRows })

  handleAddJobClick = () => this.setState({ isAddJobDialogOpen: true })

  handleAddJobDialogRequestAdd = value => {
    this.block()
    this.addJob(value).then(this.loadData.bind(this)).then(this.unblock)
    this.setState({ isAddJobDialogOpen: false })
  }

  handleAddJobDialogRequestClose = () => this.setState({ isAddJobDialogOpen: false })

  handleRequestDetails = detailsJobId => this.setState({ detailsJobId })

  handleJobDetailsRequestClose = () => this.setState({ detailsJobId: null })

  async loadData() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel()
    }

    const cancelTokenSource = axios.CancelToken.source()
    this.cancelTokenSource = cancelTokenSource
    const response = await api.get('/jobs', { cancelToken: cancelTokenSource.token })
    const { data } = response.data
    this.cancelTokenSource = null
    this.setState({ rows: data })
  }

  block = () => this.setState({ blocked: true })
  unblock = () => this.setState({ blocked: false })

  tableCellTemplate = ({ row, column, style }) => {
    if (/_at$/.test(column.name)) { // date
      return <TableCell>{renderDate({ date: row[column.name] })}</TableCell>
    } else if (column.name === 'actions') {
      return (
        <TableCell style={{ textAlign: 'right' }}>
          <ActionsIconButton
            value={row.id}
            onRequestAbort={this.handleJobRequestAbort}
            onRequestRemove={this.handleJobRequestRemove}
            onRequestDetails={this.handleRequestDetails}
          />
        </TableCell>
      )
    } else if (column.name === 'status') {
      return <TableCell>{renderStatus({ status: row[column.name] })}</TableCell>
    }

    return undefined
  }

  render () {
    const { rows, columns, allowedPageSizes, selectedRows, blocked, isAddJobDialogOpen, detailsJobId } = this.state

    const details = detailsJobId ? find(rows, { id: detailsJobId }) : {}

    return (
      <div style={{ width: 1200, margin: 'auto' }}>
        {blocked && <BlockUI />}
        <JobDetailsDialog open={!!detailsJobId} item={details} onRequestClose={this.handleJobDetailsRequestClose} />
        <AddJobDialog
          open={isAddJobDialogOpen}
          onRequestAdd={this.handleAddJobDialogRequestAdd}
          onRequestClose={this.handleAddJobDialogRequestClose}
        />
        <div style={{ padding: 10, marginBottom: 20, marginTop: 20, borderBottom: 'solid 1px #777' }}>
          <Typography style={{ position: 'relative' }} type='display1' gutterBottom>
            Jobs
            <Button
              raised
              color='primary'
              style={{ position: 'absolute', right: -10, top: 5 }}
              onClick={this.handleAddJobClick}
            >
              + Add Job
            </Button>
          </Typography>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Button
            raised
            disabled={!selectedRows.length}
            color='accent'
            onClick={this.handleJobsRemoveClick}
          >
            Remove
          </Button>
          <Button
            raised
            disabled={!selectedRows.length}
            style={{ marginLeft: 15 }}
            color='accent'
            onClick={this.handleJobsAbortClick}
          >
            Abort
          </Button>
        </div>
        <DataGrid rows={rows} columns={columns}>
          <PagingState defaultCurrentPage={0} defaultPageSize={0} />
          <LocalPaging />
          <TableView tableCellTemplate={this.tableCellTemplate} />
          <TableHeaderRow />
          <SelectionState selection={selectedRows} onSelectionChange={this.handleSelectionChange} />
          <TableSelection />
          <PagingPanel allowedPageSizes={allowedPageSizes} />
        </DataGrid>
      </div>
    )
  }
}
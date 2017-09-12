import React, { PureComponent } from 'react'
import moment from 'moment'
import { get } from 'lodash'
import { TableCell } from 'material-ui'
import Button from 'material-ui/Button'
import Badge from 'reactstrap/lib/Badge'
import Typography from 'material-ui/Typography'
import { PagingState, LocalPaging, SelectionState } from '@devexpress/dx-react-grid'
import everyLimit from 'async/everyLimit'
import { Grid as DataGrid, TableView, TableHeaderRow, PagingPanel, TableSelection } from '@devexpress/dx-react-grid-material-ui'

import api from '../api'

import Actions from './Actions'

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
    allowedPageSizes: [10, 50, 100, 0],
  }

  componentDidMount() {
    this.loadData()
    this.initReloadTimer()
  }

  initReloadTimer () {
    this.reloadTimer = setTimeout(() => {
      this.loadData()
      this.initReloadTimer()
    }, 2000)
  }

  componentWillUmount() {
    clearTimeout(this.reloadTimer)
  }

  async abortJob (jobId) {
    return api.put(`/jobs/${jobId}/aborted`)
  }

  async removeJob (jobId) {
    return api.delete(`/jobs/${jobId}`)
  }

  abortSelectedJobs = () => {
    this.block()

    everyLimit(
      this.getSelectedIds(),
      5,
      (id, cb) => this.abortJob(id).then(() => cb(null, true)).catch(cb),
      () => this.loadData().then(this.unblock, this.unblock)
    )

    this.setState({ selectedRows: [] })
  }

  removeSelectedJobs = () => {
    this.block()

    everyLimit(
      this.getSelectedIds(),
      5,
      (id, cb) => this.removeJob(id).then(() => cb(null, true)).catch(cb),
      () => this.loadData().then(this.unblock, this.unblock)
    )

    this.setState({ selectedRows: [] })
  }

  getSelectedIds() {
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
    this.abortJob(jobId).then(this.unblock, this.unblock)
  }

  handleJobRequestRemove = jobId => {
    this.block()
    this.removeJob(jobId).then(this.unblock, this.unblock)
  }

  handleSelectionChange = selectedRows => this.setState({ selectedRows })

  async loadData() {
    const response = await api.get('/jobs')
    const { data } = response.data
    this.setState({ rows: data })
  }

  block = () => this.setState({ blocked: true })
  unblock = () => this.setState({ blocked: false })

  tableCellTemplate = ({ row, column, style }) => {
    if (/_at$/.test(column.name)) { // date
      const value = row[column.name]
      const text = value ? moment(value).calendar() : '-'
      return <TableCell>{text}</TableCell>
    } else if (column.name === 'actions') {
      return (
        <TableCell style={{ textAlign: 'right' }}>
          <Actions value={row.id} onRequestAbort={this.handleJobRequestAbort} onRequestRemove={this.handleJobRequestRemove} />
        </TableCell>
      )
    } else if (column.name === 'status') {
      const value = row[column.name]
      const color = ({
        locked: 'info',
        failed: 'danger',
        pending: 'warning',
        aborted: 'default',
        completed: 'success',
        processing: 'primary'
      })[value]
      return <TableCell><Badge style={{ fontSize: 12 }} color={color}>{value}</Badge></TableCell>
    }

    return undefined;
  }

  render() {
    const { rows, columns, allowedPageSizes, selectedRows, blocked } = this.state;

    return (
      <div style={{ width: 1200, margin: 'auto' }}>
        {blocked &&
          <div
            style={{
              zIndex: '1000',
              border: 'none',
              margin: '0px',
              padding: '0px',
              width: '100%',
              height: '100%',
              top: '0px',
              left: '0px',
              backgroundColor: 'rgb(0, 0, 0)',
              opacity: '0.6',
              cursor: 'wait',
              position: 'fixed'
            }}
          />
        }
        <div style={{ padding: 10, marginBottom: 20, marginTop: 20, borderBottom: 'solid 1px #777' }}>
          <Typography style={{ position: 'relative' }} type='display1' gutterBottom>
            Jobs
            <Button style={{ position: 'absolute', right: -10, top: 5 }} raised color='primary'>
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
    );
  }
}
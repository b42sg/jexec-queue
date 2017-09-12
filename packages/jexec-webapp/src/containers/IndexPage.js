import React, { PureComponent } from 'react'
import moment from 'moment'
import { TableCell } from 'material-ui'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import { PagingState, LocalPaging, SelectionState } from '@devexpress/dx-react-grid'
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

  async loadData() {
    const response = await api.get('/jobs')
    const { data } = response.data
    this.setState({ rows: data })
  }

  tableCellTemplate = ({ row, column, style }) => {
    if (/_at$/.test(column.name)) { // date
      const value = row[column.name]
      const text = value ? moment(value).calendar() : '-'
      return <TableCell>{text}</TableCell>
    } else if (column.name === 'actions') {
      return <TableCell style={{ textAlign: 'right' }}><Actions /></TableCell>
    }

    return undefined;
  }

  render() {
    const { rows, columns, allowedPageSizes } = this.state;

    return (
      <div style={{ width: 1200, margin: 'auto' }}>
        <div style={{ padding: 10, marginBottom: 20, marginTop: 20, borderBottom: 'solid 1px #777' }}>
          <Typography style={{ position: 'relative' }} type='display1' gutterBottom>
            Jobs
            <Button style={{ position: 'absolute', right: -10, top: 5 }} raised color='primary'>
              + Add Job
            </Button>
          </Typography>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Button disabled raised color='accent'>Remove</Button>
          <Button disabled style={{ marginLeft: 15 }} raised color='accent'>Abort</Button>
        </div>
        <DataGrid rows={rows} columns={columns}>
          <PagingState defaultCurrentPage={0} defaultPageSize={0} />
          <LocalPaging />
          <TableView tableCellTemplate={this.tableCellTemplate} />
          <TableHeaderRow />
          <SelectionState />
          <TableSelection />
          <PagingPanel allowedPageSizes={allowedPageSizes} />
        </DataGrid>
      </div>
    );
  }
}
import React from 'react'
import { withStyles } from 'material-ui/styles'
import { get } from 'lodash'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog'
import List, { ListItem } from 'material-ui/List'

import renderDate from './renderDate'
import renderStatus from './renderStatus'

const styles = theme => ({
  value: {
    marginLeft: 10
  }
})

class JobDetailsDialog extends React.Component {
  static defaultProps = {
    item: {},
    onRequestClose: () => {}
  }

  handleCancel = () => this.props.onRequestClose(this.props.value)

  render () {
    const { item, classes, ...other } = this.props

    return (
      <Dialog maxWidth='xs' {...other}>
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <Typography type='body2'>ID:</Typography>
              <Typography className={classes.value}>{item.id}</Typography>
            </ListItem>
            <ListItem>
              <Typography type='body2'>Status:</Typography>
              <Typography className={classes.value}>{renderStatus({ status: item.status })}</Typography>
            </ListItem>
            <ListItem>
              <Typography type='body2'>Added:</Typography>
              <Typography className={classes.value}>{renderDate({ date: item.created_at })}</Typography>
            </ListItem>
            <ListItem>
              <Typography type='body2'>Completed:</Typography>
              <Typography className={classes.value}>{renderDate({ date: item.completed_at })}</Typography>
            </ListItem>
            <ListItem>
              <Typography type='body2'>Failed:</Typography>
              <Typography className={classes.value}>{renderDate({ date: item.failed_at })}</Typography>
            </ListItem>
            <ListItem>
              <Typography type='body2'>Output:</Typography>
              <Typography className={classes.value}>{get(item, 'result.value', '-')}</Typography>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(JobDetailsDialog)

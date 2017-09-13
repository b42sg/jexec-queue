import React from 'react'
import { withStyles } from 'material-ui/styles'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog'

const styles = theme => ({
})

class AddJobDialog extends React.Component {
  static defaultProps = {
    onRequestAdd: () => {},
    onRequestClose: () => {}
  }

  state = {
    value: ''
  }

  handleCancel = () => this.props.onRequestClose(this.props.value)
  handleOk = () => this.props.onRequestAdd(this.state.value)
  // handleChange = event => this.setState({ value: event.target.value.replace(/[^\d]*/, '') })
  handleChange = event => this.setState({ value: event.target.value })
  handleKeyPress = event => {
    if(event.key === 'Enter') {
      this.props.onRequestAdd(this.state.value)
    }
  }

  render () {
    const {
      onRequestAdd, // eslint-disable-line no-unused-vars
      ...other
    } = this.props

    const { value } = this.state

    return (
      <Dialog maxWidth='xs' {...other}>
        <DialogTitle>Add Job</DialogTitle>
        <DialogContent>
          <TextField
            value={value}
            maxLength={12}
            onChange={this.handleChange}
            placeholder='Input'
            onKeyPress={this.handleKeyPress}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel} color='primary'>
            Close
          </Button>
          <Button onClick={this.handleOk} color='primary'>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(AddJobDialog)

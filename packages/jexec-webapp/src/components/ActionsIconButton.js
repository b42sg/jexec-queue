import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVertIcon from 'material-ui-icons/MoreVert';


const ITEM_HEIGHT = 48;

class LongMenu extends Component {
  static defaultProps = {
    onRequestAbort: () => {},
    onRequestRemove: () => {},
    onRequestDetails: () => {}
  }

  state = {
    anchorEl: null,
    open: false
  }

  handleClick = event => {
    this.setState({ open: true, anchorEl: event.currentTarget })
  }

  handleRequestClose = () => {
    this.setState({ open: false })
  }

  handleAbortClick = () => {
    this.props.onRequestAbort(this.props.value)
    this.setState({ open: false })
  }

  handleDetailsClick = () => {
    this.props.onRequestDetails(this.props.value)
    this.setState({ open: false })
  }

  handleRemoveClick = () => {
    this.props.onRequestRemove(this.props.value)
    this.setState({ open: false })
  }

  render() {
    return (
      <div>
        <IconButton
          aria-label="More"
          aria-owns={this.state.open ? 'long-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: 200,
            },
          }}
        >
          <MenuItem onClick={this.handleDetailsClick}>Details</MenuItem>
          <MenuItem onClick={this.handleAbortClick}>Abort</MenuItem>
          <MenuItem onClick={this.handleRemoveClick}>Remove</MenuItem>
        </Menu>
      </div>
    );
  }
}

export default LongMenu;
// module imports
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlexView from 'react-flexview';
import { withStyles } from 'material-ui/styles';
import socketIOClient from 'socket.io-client';

// local imports
import * as actions from '../actions';
import DisplayStatus from '../components/DisplayStatus';

// style imports

const styles = theme => ({
  root: {
    padding: 12
  }
});

class StatusContainer extends Component {
  constructor() {
    super();
    this.state = {
      status: []
    };
  }

  componentWillMount = async () => {
    this.getStatus();
    let socketUri;
    if (process.env.NODE_ENV === 'production') {
      socketUri = 'https://<your url>.herokuapp.com';
    } else {
      socketUri = 'http://localhost:5000';
    }
    const socket = socketIOClient(socketUri);
    socket.on('NewActivity', this.getStatus);
  };

  getStatus = async () => {
    const res = await this.props.getStatus();
    if (res.success) {
      this.setState({
        status: res.data
      });
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <FlexView column grow className={classes.root}>
        <DisplayStatus data={this.state.status} />
      </FlexView>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  connect(null, actions)(StatusContainer)
);

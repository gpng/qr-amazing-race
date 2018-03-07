// module imports
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlexView from 'react-flexview';
import { withStyles } from 'material-ui/styles';

// local imports
import * as actions from '../actions';
import DisplayActivity from '../components/DisplayActivity';

// style imports

const styles = theme => ({
  root: {
    padding: 12
  }
});

class ActivityContainer extends Component {
  constructor() {
    super();
    this.state = {
      activities: []
    };
  }

  componentWillMount = async () => {
    this.getAllActivity();
  };

  getAllActivity = async () => {
    const res = await this.props.getAllActivity();
    if (res.success) {
      this.setState({
        activities: res.data
      });
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <FlexView column grow className={classes.root}>
        <DisplayActivity data={this.state.activities} />
      </FlexView>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  connect(null, actions)(ActivityContainer)
);

// module imports
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlexView from 'react-flexview';
import { withStyles } from 'material-ui/styles';

// local imports
import * as actions from '../actions';
import PasswordForm from '../components/PasswordForm';
import QuestionForm from '../components/QuestionForm';
import DisplayHint from '../components/DisplayHint';
import Snackbar from '../components/Snackbar';

// style imports

const styles = theme => ({
  root: {
    padding: 12
  }
});

class MainContainer extends Component {
  constructor() {
    super();
    this.state = {
      status: 'password',
      team: 0,
      question: '',
      answers: [],
      hint: '',
      message: 'test message',
      toggleSnackbar: true
    };
  }

  handlePasswordSubmit = async values => {
    const req = {
      password: values.password,
      station_id: window.location.pathname.slice(1)
    };
    const res = await this.props.verifyPassword(req);
    if (res.success) {
      this.setState({
        status: 'question',
        team: res.data.team,
        question: res.data.question,
        answers: res.data.answers
      });
    } else {
      this.handleSnackbarToggle(res.data);
    }
  };

  handleQuestionSubmit = async values => {
    const req = {
      team: this.state.team,
      answer: values.answer,
      station_id: window.location.pathname.slice(1)
    };
    const res = await this.props.verifyAnswer(req);
    if (res.success) {
      this.setState({
        status: 'hint',
        hint: res.data.hint
      });
    } else {
      this.handleSnackbarToggle(res.data);
    }
  };

  handleSnackbarToggle = message => {
    this.setState({
      toggleSnackbar: !this.state.toggleSnackbar,
      message
    });
  };

  renderContent = () => {
    switch (this.state.status) {
      case 'password':
        return <PasswordForm onSubmit={this.handlePasswordSubmit} />;
      case 'question':
        return (
          <QuestionForm
            onSubmit={this.handleQuestionSubmit}
            question={this.state.question}
            answers={this.state.answers}
          />
        );
      case 'hint':
        return <DisplayHint hint={this.state.hint} team={this.state.team} />;
      default:
        return null;
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <FlexView column grow className={classes.root}>
        {this.renderContent()}
        <Snackbar
          message={this.state.message}
          toggle={this.state.toggleSnackbar}
        />
      </FlexView>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  connect(null, actions)(MainContainer)
);

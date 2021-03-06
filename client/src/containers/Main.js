// module imports
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlexView from 'react-flexview';
import { withStyles } from 'material-ui/styles';
import { ToastContainer, toast } from 'react-toastify';

// local imports
import * as actions from '../actions';
import PasswordForm from '../components/PasswordForm';
import QuestionForm from '../components/QuestionForm';
import DisplayHint from '../components/DisplayHint';
import SimpleAppBar from '../components/AppBar';

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
      hint: ''
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
      toast.error(res.data);
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
      toast.error(res.data);
    }
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
        <SimpleAppBar />
        <ToastContainer position={toast.POSITION.TOP_CENTER} autoClose={1500} />
        <FlexView column style={{ marginTop: 56 }}>
          {this.renderContent()}
        </FlexView>
      </FlexView>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  connect(null, actions)(MainContainer)
);

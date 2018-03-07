// module imports
import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import FlexView from 'react-flexview';

// local imports
import * as actions from '../actions';
import Main from './Main';
import Activity from './Activity';

// style imports

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <FlexView grow>
          <Switch>
            <Route exact path="/activity" component={Activity} />
            <Route path="/" component={Main} />
            {/* <Route path="/" component={Header} /> */}
          </Switch>
        </FlexView>
      </BrowserRouter>
    );
  }
}

export default connect(null, actions)(App);

// module imports
import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import FlexView from 'react-flexview';

// local imports
import * as actions from '../actions';
import Main from './Main';

// style imports

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <FlexView grow>
          <Route path="/" component={Main} />
          {/* <Route path="/" component={Header} /> */}
        </FlexView>
      </BrowserRouter>
    );
  }
}

export default connect(null, actions)(App);

// module imports
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import registerServiceWorker from './registerServiceWorker';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';

// local imports
import App from './containers/App';
import reducers from './reducers';

// style imports
import 'react-flexview/lib/flexView.css';
import './index.css';
import 'react-table/react-table.css';

const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

// palette taken from material.io/color
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#666ad1',
      main: '#303f9f',
      dark: '#001970',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#ff5bff',
      main: '#d500f9',
      dark: '#9e00c5',
      contrastText: '#000000'
    }
  }
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Reboot />
    <Provider store={store}>
      <App />
    </Provider>
  </MuiThemeProvider>,
  document.querySelector('#root')
);
registerServiceWorker();

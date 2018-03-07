// module imports
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

// local imports

export default combineReducers({
  form: formReducer
});

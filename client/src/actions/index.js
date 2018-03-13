import to from 'await-to-js';
import axios from 'axios';

export const verifyPassword = formData => async dispatch => {
  let err, res;
  [err, res] = await to(axios.post('/api/auth', formData));
  if (err) {
    console.log('error', err);
    return { success: false, data: 'error' };
  }
  return { success: res.data.success, data: res.data.data };
};

export const verifyAnswer = formData => async dispatch => {
  let err, res;
  [err, res] = await to(axios.post('/api/answer', formData));
  if (err) {
    console.log('error', err);
    return { success: false, data: 'error' };
  }
  return { success: res.data.success, data: res.data.data };
};

export const getAllActivity = () => async dispatch => {
  let err, res;
  [err, res] = await to(axios.get('/api/activity'));
  if (err) {
    return { success: false, data: 'error' };
  }
  return { success: res.data.success, data: res.data.data };
};

export const getStatus = () => async dispatch => {
  let err, res;
  [err, res] = await to(axios.get('/api/status'));
  if (err) {
    return { success: false, data: 'error getting status' };
  }
  return { success: res.data.success, data: res.data.data };
};

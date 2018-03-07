// module imports
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderField, required } from './FormFieldValidation';
import Button from 'material-ui/Button';

// local imports

// style imports

const styles = {
  button: {
    marginTop: 12
  }
};

let TeamForm = props => {
  const { handleSubmit, submitting } = props;

  /* First Required-> Material UI Text validation */
  /* Second Required -> */
  return (
    <form id="teamform" className="form-horizontal" onSubmit={handleSubmit}>
      <Field
        required
        id="signup-password"
        name="team_id"
        label="Team Number"
        type="number"
        component={renderField}
        validate={[required]}
      />
      <Button
        style={styles.button}
        variant="raised"
        color="primary"
        type="submit"
        onClick={this.handleSubmit}
        disabled={submitting}
      >
        Submit Team Number
      </Button>
    </form>
  );
};

TeamForm = reduxForm({
  // a unique name for the form
  form: 'team'
})(TeamForm);

export default TeamForm;

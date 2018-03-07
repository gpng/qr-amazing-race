// module imports
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import Button from 'material-ui/Button';
import FlexView from 'react-flexview';
import Typography from 'material-ui/Typography';

// local imports

// style imports

const styles = {
  button: {
    marginTop: 12
  },
  answers: {
    marginTop: 12
  }
};

let QuestionForm = props => {
  const { handleSubmit, submitting, question, answers } = props;

  const renderAnswers = () => {
    let answerArr = [];
    for (let i = 0; i < answers.length; i++) {
      answerArr.push(
        <label key={i} style={styles.answers}>
          <Field
            name="answer"
            component="input"
            type="radio"
            value={answers[i]}
          />
          {answers[i]}
        </label>
      );
    }
    return answerArr;
  };

  return (
    <form id="teamform" className="form-horizontal" onSubmit={handleSubmit}>
      <FlexView column hAlignContent="left">
        <Typography variant="title">{question}</Typography>
        {renderAnswers()}
        <Button
          style={styles.button}
          variant="raised"
          color="primary"
          type="submit"
          onClick={this.handleSubmit}
          disabled={submitting}
        >
          Submit Answer
        </Button>
      </FlexView>
    </form>
  );
};

QuestionForm = reduxForm({
  // a unique name for the form
  form: 'question'
})(QuestionForm);

export default QuestionForm;

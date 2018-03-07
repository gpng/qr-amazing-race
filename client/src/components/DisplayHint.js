// module imports
import React from 'react';
import FlexView from 'react-flexview';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';

// local imports

// style imports

const styles = theme => ({
  root: {
    padding: 12
  },
  text: {
    marginTop: 24
  }
});

/**
 *
 * @param {object[]} jobs Array of job objects to be displayed
 */
const DisplayHint = props => {
  const { classes, hint, team } = props;

  return (
    <FlexView column className={classes.root}>
      <Typography variant="title">{`Team ${team}`}</Typography>
      <Typography variant="headline" className={classes.text}>
        {hint === 'congratulations'
          ? 'Congratulations! You have completed all stations'
          : 'The clue for your next station is:'}
      </Typography>
      <Typography className={classes.text}>
        {hint === 'congratulations' ? '' : hint}
      </Typography>
    </FlexView>
  );
};

export default withStyles(styles, { withTheme: true })(DisplayHint);

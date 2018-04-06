import React from 'react';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import FlexView from 'react-flexview';

const styles = {
  root: {}
};
const SimpleAppBar = props => {
  const { classes } = props;
  return (
    <FlexView grow className={classes.root}>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <Typography variant="title" color="inherit">
            QR Amazing Race
          </Typography>
        </Toolbar>
      </AppBar>
    </FlexView>
  );
};

export default withStyles(styles)(SimpleAppBar);

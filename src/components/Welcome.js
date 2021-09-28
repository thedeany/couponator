import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const updates = [];

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2, 0),
  },
  version: {
    marginLeft: theme.spacing(2),
    marginRight: 'auto',
  },
}));

const Welcome = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const currentVersion = process.env.REACT_APP_VERSION;
    const lastVersionShown = localStorage.getItem('couponator_lastVersionShown'); // eslint-disable-line
    const preventWelcomeOnVersions = process.env.REACT_APP_PREVENT_WELCOME_ON_VERSIONS.split(','); // eslint-disable-line
    if (
      !preventWelcomeOnVersions.includes(currentVersion) &&
      lastVersionShown !== currentVersion
    ) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(
      'couponator_lastVersionShown',
      process.env.REACT_APP_VERSION
    );
  };

  const classes = useStyles();

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="welcome-dialog"
      open={open}
      disableBackdropClick
    >
      <DialogTitle id="welcome-dialog" onClose={handleClose}>
        <Typography variant="h5">What's New?</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {updates.map((update, index) => {
          const isNotLastUpdate = index !== updates.length - 1;
          return (
            <div key={index}>
              <Typography variant="h6">{update.title}</Typography>
              <Typography>{update.body}</Typography>

              {isNotLastUpdate && (
                <Divider
                  variant="middle"
                  light
                  classes={{ root: classes.divider }}
                />
              )}
            </div>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Typography variant="caption" classes={{ root: classes.version }}>
          v{process.env.REACT_APP_VERSION}
        </Typography>
        <Button onClick={handleClose} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Welcome;

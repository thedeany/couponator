import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles'; // eslint-disable-line
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactGA from 'react-ga';
import { getStateFromUrl } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  dialogStyle: {
    width: '600px',
  },
  cancelButtonStyle: {
    color: 'red',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

const LoadFromUrl = (props) => {
  const { updateState } = props;
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();
  const classes = useStyles();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setUrl('');
    setError('');
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
    setError(false);
  };

  const handleLoad = async () => {
    setLoading(true);

    // fetch image from URL
    getStateFromUrl(url).then((response) => {
      if (response.type === 'success') {
        updateState({ ...response.data, loadedFromUrl: true });
        setLoading(false);
        setError(false);
        handleClose();
      } else if (response.type === 'error') {
        setError(response.message);
        inputRef.current.blur();
        inputRef.current.focus();
      }

      ReactGA.event({
        category: 'Load',
        action: `Loaded from URL`,
      });
    });
  };

  return (
    <>
      <Button onClick={handleOpen}>Load from URL</Button>
      <Dialog
        fullWidth
        onClose={handleClose}
        aria-labelledby="load-from-url-dialog"
        open={open}
        disableBackdropClick
      >
        <DialogTitle id="welcome-dialog" onClose={handleClose}>
          Enter a coupon image URL
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            inputRef={inputRef}
            id="coupon-image-url"
            label="Coupon image URL"
            type="text"
            onChange={handleChange}
            name="coupon-image-url"
            value={url}
            margin="normal"
            fullWidth
            autoFocus
            error={!!error}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
          />
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            className={classes.cancelButtonStyle}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className={classes.wrapper}>
            <Button
              onClick={handleLoad}
              color="primary"
              disabled={!url || loading}
            >
              Load
            </Button>
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

LoadFromUrl.propTypes = {
  updateState: PropTypes.func.isRequired,
};

export default LoadFromUrl;

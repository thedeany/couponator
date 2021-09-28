import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ReactGA from 'react-ga';

import { cleanFilename } from '../utils/utils';

const useStyles = makeStyles((theme) => ({
  actionButtonsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
  },
  actionButton: {
    margin: theme.spacing(),
  },
  spanButton: {
    gridColumn: 'span 2',
  },
  cancelButtonStyle: {
    color: 'red',
  },
}));

const ActionButtons = (props) => {
  const classes = useStyles();
  const { data, prepare, upload, cancel } = props;
  const { actionStatus, imageUri, filename, currentTab } = data;
  const cleanedFilename =
    currentTab === 'coupon'
      ? `${cleanFilename(filename)}.png`
      : `${cleanFilename(filename)}_starburst.png`;
  return (
    <div className={classes.actionButtonsContainer}>
      {actionStatus === 'idle' ? (
        <Button
          color="primary"
          onClick={prepare}
          className={clsx([classes.actionButton, classes.spanButton])}
        >
          Prepare Image
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={upload}
            className={clsx([classes.actionButton, classes.spanButton])}
            disabled={actionStatus === 'uploaded'}
          >
            {actionStatus === 'uploaded' ? 'Uploaded' : 'Upload to S3'}
          </Button>
          <Button
            color="primary"
            href={imageUri}
            download={cleanedFilename}
            className={classes.actionButton}
            onClick={() =>
              ReactGA.event({
                category: 'Offer',
                action: `Downloaded ${currentTab}`,
              })
            }
          >
            Download
          </Button>
          <Button
            // disabled={imageUri === ''}
            onClick={cancel}
            className={clsx([classes.cancelButtonStyle, classes.actionButton])}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
};

ActionButtons.propTypes = {
  data: PropTypes.object,
  prepare: PropTypes.func,
  upload: PropTypes.func,
  cancel: PropTypes.func,
};

export default ActionButtons;

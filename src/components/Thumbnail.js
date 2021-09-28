import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  thumbnail: {
    position: 'relative',
    width: '270px',
    display: 'grid',
    gridTemplateRows: '1fr max-content',
    alignItems: 'center',
  },
  media: {
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    margin: '0 auto',
    textAlign: 'center',
  },
  imageDetails: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    textAlign: 'right',
  },
  filenameTextDisabled: {
    color: theme.palette.text.secondary,
    background: theme.palette.grey[200],
  },
  uriDisplay: {
    marginTop: theme.spacing(2),
    '& label.Mui-disabled': {
      color: theme.palette.text.primary,
    },
  },
  uriDisplayText: {
    color: theme.palette.text.primary,
    cursor: 'pointer',
  },
}));

const Thumbnail = (props) => {
  const { file, change, copy, remove } = props;
  const { dataURL: src, filename: title, type, uploaded, publicUri } = file;
  const classes = useStyles();
  const {
    thumbnail,
    media,
    imageDetails,
    filenameText,
    filenameTextDisabled,
    uriDisplay,
    uriDisplayText,
  } = classes;

  let fileSize;
  if (file.size < 1000000) {
    fileSize = `${Math.round(file.size / 1000)}KB`;
  } else {
    fileSize = `${(file.size / 1000000).toFixed(2)}MB`;
  }

  return (
    <Card classes={{ root: thumbnail }}>
      <CardMedia
        classes={{ root: media }}
        component={type.match(/image\/.*/) ? 'img' : 'div'}
        src={src}
        title={title}
      >
        {type.match(/image\/.*/) ? null : title}
      </CardMedia>
      <CardContent>
        <div className={clsx('image-details', imageDetails)}>
          {file.width && file.height && `${file.width}x${file.height} - `}
          {fileSize}
        </div>
        <TextField
          value={title}
          size="small"
          fullWidth
          disabled={uploaded}
          onChange={(e) => change(e, title)}
          InputProps={{
            classes: { root: filenameText, disabled: filenameTextDisabled },
          }}
        />
        {publicUri && (
          <TextField
            classes={{ root: uriDisplay }}
            variant="outlined"
            label="Click to copy"
            value={publicUri}
            size="small"
            fullWidth
            multiline
            disabled
            InputProps={{
              readOnly: true,
              classes: { disabled: uriDisplayText },
            }}
            onClick={() => copy(publicUri)}
          />
        )}
      </CardContent>
      <CardActions>
        {!uploaded && (
          <Button
            size="small"
            style={{ color: 'red' }}
            onClick={() => {
              remove(title);
            }}
          >
            Remove
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

Thumbnail.propTypes = {
  file: PropTypes.object.isRequired,
  change: PropTypes.func.isRequired,
  copy: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

export default Thumbnail;

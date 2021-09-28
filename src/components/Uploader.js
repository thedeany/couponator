import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { shallowEqualObjects } from 'shallow-equal';
import ReactGA from 'react-ga';
import Thumbnail from './Thumbnail';

const useStyles = makeStyles((theme) => ({
  input: {
    minWidth: '400px',
    border: `2px dashed ${theme.palette.grey[400]}`,
    borderRadius: '5px',
    justifySelf: 'start',
    display: 'grid',
    alignItems: 'center',
    height: '75px',
  },
  inputText: {
    textAlign: 'center',
  },
  controls: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr max-content',
    gap: theme.spacing(4),
  },
  prependTextStyle: {
    justifySelf: 'end',
    width: '400px',
  },
  uploadButton: {
    justifySelf: 'end',
  },
  thumbnailsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 270px)',
    gridColumn: '1 / 3',
    width: '100%',
    justifyContent: 'space-evenly',
    justifyItems: 'center',
    gap: `${theme.spacing(4)}px`,
    marginTop: `${theme.spacing(4)}px`,
  },
}));

const Uploader = ({ updateState, handleCopy }) => {
  const [files, setFiles] = useState([]);
  const [prependText, setPrependText] = useState('');
  const [uploadStatus, setUploadStatus] = useState('pending');
  const classes = useStyles();

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = async () => {
          file.dataURL = reader.result;
          file.filename = file.name;

          // get image dimensions
          async function loadImage(imageUrl) {
            let img;
            const imageLoadPromise = new Promise((resolve) => {
              img = new Image();
              img.onload = resolve;
              img.src = imageUrl;
            });

            await imageLoadPromise;
            return img;
          }
          if (file.type.includes('image')) {
            const img = await loadImage(reader.result);
            file.width = img.naturalWidth;
            file.height = img.naturalHeight;
          }
          // end get image dimensions

          if (!files.some((f) => shallowEqualObjects(f, file))) {
            setFiles(files => [...files, file]); // eslint-disable-line
          } else {
            updateState({
              copySnackbarOpen: true,
              copySnackbarMessage: `${acceptedFiles > 1 ? 'An' : 'The'} image you're attempting to upload has already been selected.` // eslint-disable-line
            });
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [files]
  );

  const handleChange = (e, file) => {
    const newFiles = [...files];
    const index = newFiles.findIndex((item) => item.filename === file);
    newFiles[index].filename = e.target.value;
    setFiles(newFiles);
  };

  const handleRemove = (file) => {
    const newFiles = [...files];
    const index = newFiles.findIndex((item) => item.filename === file);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleUpload = () => {
    ReactGA.event({
      category: 'Upload',
      action: `Uploaded images`,
      value: files.length,
    });
    if (prependText !== '') {
      ReactGA.event({
        category: 'Upload',
        action: 'Prepended text',
      });
    }
    const filesToUpload = files.map((file) => {
      const index = file.filename.lastIndexOf('.');
      const filename = `${prependText} ${file.filename.substr(0, index)}`.trim(); // eslint-disable-line
      const extension = file.filename.substr(index + 1);
      return {
        filename,
        extension,
        contentType: file.type,
        imageUri: file.dataURL,
      };
    });
    axios
      .post('/upload', {
        files: filesToUpload,
      })
      .then(({ data }) => {
        setUploadStatus('uploaded');
        const newFiles = [...files];

        data.map((upload, i) => {
          if (upload.value) {
            // upload was successful
            const uri = upload.value && upload.value.Location;
            console.groupCollapsed(`URLs for ${newFiles[i].filename}`);
            console.info('Public URL:', uri);
            console.groupEnd();

            newFiles[i].uploaded =
              upload.status && upload.status === 'fulfilled';
            newFiles[i].publicUri = uri;
          } else {
            // upload was unsuccessful
            let msg =
              'An error occurred when uploading. Please check the console for more information.';
            if (upload.reason?.type === 'BAD_HEADER') {
              msg = `[${upload.reason?.file}] ${upload.reason?.message}`;
            }
            updateState({
              uploadError: true,
              copySnackbarOpen: true,
              copySnackbarMessage: msg,
            });
          }

          return false;
        });

        setFiles(newFiles);
      })
      .catch((error) => {
        updateState({
          uploadError: true,
          copySnackbarOpen: true,
          copySnackbarMessage:
            'An error occurred when uploading. Please check the console for more information.',
        });

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response from server:', error.response.data);

          if (window.couponator.debug) {
            console.info('Response status code:', error.response.status);
            console.info('Response headers:', error.response.headers);
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.error(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
        }
        if (window.couponator.debug) {
          console.error('Upload error:', error.toJSON());
          console.error('Config:', error.config);
        }
      });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const {
    input,
    inputText,
    controls,
    prependTextStyle,
    uploadButton,
    thumbnailsContainer,
  } = classes;

  return (
    <>
      <div className={input} {...getRootProps()}> {/* eslint-disable-line */}
        <input {...getInputProps()} /> {/* eslint-disable-line */}
        {isDragActive ? (
          <p className={inputText}>Drop the files here...</p>
        ) : (
          <p className={inputText}>
            Drop some files here, or click to select files...
          </p>
        )}
      </div>
      <div className={controls}>
        <TextField
          classes={{ root: prependTextStyle }}
          label="Prepend Text"
          helperText="Text to be prepended to all filenames"
          placeholder="e.g. Client Name"
          fullWidth
          onChange={(e) => setPrependText(e.target.value)}
        />
        <Button
          classes={{ root: uploadButton }}
          color="primary"
          onClick={handleUpload}
          disabled={!files.length || uploadStatus === 'uploaded'}
        >
          {uploadStatus === 'uploaded' ? 'Uploaded' : 'Upload'}
        </Button>
      </div>
      <div className={clsx('thumbnails-container', thumbnailsContainer)}>
        {files &&
          files.map((file) => (
            <Thumbnail
              key={file.name}
              file={file}
              change={handleChange}
              copy={handleCopy}
              remove={handleRemove}
            />
          ))}
      </div>
    </>
  );
};

Uploader.propTypes = {
  updateState: PropTypes.func.isRequired,
  handleCopy: PropTypes.func.isRequired,
};

export default Uploader;

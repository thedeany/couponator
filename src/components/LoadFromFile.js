import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { useDropzone } from 'react-dropzone';
import extract from 'png-chunks-extract';
import text from 'png-chunk-text';
import ReactGA from 'react-ga';

const LoadFromFile = (props) => {
  const { updateState } = props;

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      if (file.type !== 'image/png') return;
      console.log(file);
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async () => {
        const imageBase64 = reader.result.replace(/data:.*;base64,/, '');
        const imageData = Buffer.from(imageBase64, 'base64');

        // extract metadata from image
        const chunks = extract(imageData);

        const textChunks = chunks
          .filter((chunk) => chunk.name === 'tEXt')
          .map((chunk) => text.decode(chunk.data));

        if (
          textChunks[0]?.keyword === 'couponator' &&
          textChunks[1]?.keyword === 'encodedState'
        ) {
          const decodedState = decodeURIComponent(
            window.atob(textChunks[1].text)
          );
          const jsonState = JSON.parse(decodedState);
          updateState({ ...jsonState, loadedFromFile: true });
        }

        ReactGA.event({
          category: 'Load',
          action: `Loaded from file`,
        });
      };
      reader.readAsDataURL(file);
    });
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}> {/* eslint-disable-line */}
      <input {...getInputProps()} multiple={false} /> {/* eslint-disable-line */}
      {isDragActive ? (
        <Button>Drop the files here...</Button>
      ) : (
        <Button>Load from file</Button>
      )}
    </div>
  );
};

LoadFromFile.propTypes = {
  updateState: PropTypes.func.isRequired,
};

export default LoadFromFile;

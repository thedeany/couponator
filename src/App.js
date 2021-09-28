import React, { useEffect, useReducer, useCallback } from 'react';
import axios from 'axios';
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import html2canvas from 'html2canvas';
import extract from 'png-chunks-extract';
import encode from 'png-chunks-encode';
import text from 'png-chunk-text';
import ReactGA from 'react-ga';
import contrast from 'contrast';

import Welcome from './components/Welcome';
import CreateForm from './components/CreateForm';
import ImageRender from './components/ImageRender';
import ActionButtons from './components/ActionButtons';
import Uploader from './components/Uploader';
import { cleanFilename, getStateFromUrl } from './utils/utils';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#9ACD58',
    },
    secondary: {
      main: '#861E5A',
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: {
          backgroundColor: '#f0f0f0',
        },
        body: {
          backgroundColor: '#f0f0f0',
          lineHeight: 'normal',
        },
      },
    },
    MuiButton: {
      containedPrimary: {
        color: '#ffffff',
      },
      textPrimary: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
});

const useStyles = makeStyles({
  paperStyle: {
    margin: '2em auto',
    width: '90%',
    overflow: 'auto',
    maxWidth: '1800px',
    minHeight: '754px',
    position: 'relative',
  },
  appBar: {
    background: '#861E5A',
    color: '#FFFFFF',
    // height: '64px'
  },
  tabsIndicator: {
    backgroundColor: '#FFFFFF',
  },
  tabRoot: {
    height: '64px',
    background: '#861E5A',
    color: '#FFFFFF',
  },
  app: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(580px, 1fr))',
    justifyContent: 'space-evenly',
    justifyItems: 'center',
    alignItems: 'center',
    gap: '3em',
    padding: '2em',
    minWidth: '650px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
  },
});

const reducer = (state, updateArg) => {
  // check if the type of update argument is a callback function
  // this allows us to use current state (prevState) to determine
  // how to set new state (ex: `someProp: !prevState.someProp`)
  if (updateArg.constructor === Function) {
    return { ...state, ...updateArg(state) };
  }
  return { ...state, ...updateArg };
};

const initialState = {
  couponTextValue: '',
  couponTextSize: '30',
  couponTextBold: true,
  couponTextItalic: false,
  couponSubtextValue: '',
  couponSubtextSize: '30',
  couponSubtextBold: false,
  couponSubtextItalic: false,
  disclaimerValue: '',
  disclaimerSize: '10',
  disclaimerBold: false,
  disclaimerItalic: false,
  couponBackgroundColor: '#918156',
  couponTextColor: '#ffffff',
  starburstBackgroundColor: '#407f87',
  starburstTextColor: '#ffffff',
  imageUri: '',
  filename: '',
  filenameUserEdited: false,
  currentTab: 'coupon',
  borderStyle: 'solid',
  copySnackbarOpen: false,
  copySnackbarMessage: '',
  publicUri: '',
  actionStatus: 'idle',
  uploadError: false,
  loadingFromUrl: false,
  loadedFromUrl: false,
  loadedFromFile: false,
  loadError: false,
  copyError: false,
};

const App = () => {
  const [state, updateState] = useReducer(reducer, initialState);

  useEffect(() => {
    ReactGA.initialize(process.env.REACT_APP_UA_CODE, {
      testMode: process.env.REACT_APP_ENVIRONMENT !== 'production',
      debug: process.env.REACT_APP_ENVIRONMENT !== 'production',
    });

    if (!window.couponator) {
      window.couponator = {
        debug: false,
      };
    }

    if (window.location.href.includes('load=')) {
      const encoded = window.location.href.split('load=');
      if (encoded[1] && encoded[1].length > 1) {
        const decoded = decodeURIComponent(window.atob(encoded[1]));
        const obj = JSON.parse(decoded);
        updateState({ ...obj });
      }
    } else if (window.location.href.includes('loadFromUrl=')) {
      updateState({ loadingFromUrl: true });
      const url = window.location.href.split('loadFromUrl=')[1];
      getStateFromUrl(url).then((response) => {
        if (response.type === 'success') {
          updateState({
            ...response.data,
            loadedFromUrl: true,
            loadingFromUrl: false,
          });
        } else if (response.type === 'error') {
          updateState({
            loadError: true,
            copySnackbarOpen: true,
            copySnackbarMessage: response.message,
            loadingFromUrl: false,
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    switch (state.currentTab) {
      case 'coupon':
        ReactGA.pageview('/coupon', [], 'Coupon');
        break;
      case 'starburst':
        ReactGA.pageview('/starburst', [], 'Starburst');
        break;
      case 'upload':
        ReactGA.pageview('/upload', [], 'Upload');
        break;
      default:
        ReactGA.pageview('/', [], 'Couponator');
    }
  }, [state.currentTab]);

  useEffect(() => {
    if (state.publicUri.length > 0) {
      const copyPublicUriToClipboard = () => {
        const uri = state.publicUri;
        console.log('Public URL:', uri);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(uri).then(
            () => {
              updateState({
                copySnackbarOpen: true,
                copySnackbarMessage: 'Coupon URL copied!',
              });
            },
            () => {
              console.info(
                `%CDN URL%c ${uri}`,
                'background: #f90; color: white; padding: 0.5em',
                'background: unset; color: unset; padding: unset;'
              );
              updateState({
                copyError: true,
                copySnackbarOpen: true,
                copySnackbarMessage:
                  'Error copying coupon URL. Please check the console or try again.',
              });
            }
          );
        } else {
          updateState({
            copyError: true,
            copySnackbarOpen: true,
            copySnackbarMessage: `Failed to copy to clipboard. Please copy this URL: ${uri}`,
          });
        }
      };
      copyPublicUriToClipboard();
    }
  }, [state.publicUri]);

  useEffect(() => {
    if (['prepared', 'uploaded'].includes(state.actionStatus)) {
      cancelImage(); // eslint-disable-line
    }
  }, [
    state.couponTextValue,
    state.couponTextSize,
    state.couponTextBold,
    state.couponTextItalic,
    state.couponSubtextValue,
    state.couponSubtextSize,
    state.couponSubtextBold,
    state.couponSubtextItalic,
    state.disclaimerValue,
    state.disclaimerSize,
    state.disclaimerBold,
    state.disclaimerItalic,
    state.couponBackgroundColor,
    state.starburstBackgroundColor,
    state.filename,
    state.currentTab,
    state.borderStyle,
  ]);

  // auto-generate a filename based on the Coupon Text
  useEffect(() => {
    if (
      !state.filenameUserEdited &&
      !state.loadedFromUrl &&
      !state.loadedFromFile &&
      !window.location.href.includes('load=') // don't affect filename on a shared or loaded coupon
    ) {
      const value = cleanFilename(state.couponTextValue)
        .toLowerCase()
        .substr(0, 50);

      updateState({ filename: value });
    }
  }, [state.couponTextValue]);

  const handleChange = useCallback((e) => {
    if (!e.target.name) {
      e.target = e.target.parentElement;
    }
    const { value, name, type } = e.target;

    if (type === 'button') {
      updateState((prevState) => ({
        [name]: !prevState[name],
      }));

      return;
    }

    updateState({
      [name]: value,
    });

    if (name === 'filename') {
      updateState({ filenameUserEdited: true });
    }

    if (
      name === 'couponBackgroundColor' ||
      name === 'starburstBackgroundColor'
    ) {
      const typeTextColor =
        name === 'couponBackgroundColor'
          ? 'couponTextColor'
          : 'starburstTextColor';
      const textColor = contrast(value) === 'light' ? '#393839' : '#ffffff';
      updateState({ [typeTextColor]: textColor });
    }
  }, []);

  const copy = (shareUrl) => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        updateState({
          copySnackbarOpen: true,
          copySnackbarMessage: 'Coupon URL copied!',
        });
      },
      () => {
        console.info(
          `%cShare URL%c ${shareUrl}`,
          'background: #f90; color: white; padding: 0.5em',
          'background: unset; color: unset; padding: unset;'
        );
        updateState({
          copySnackbarOpen: true,
          copySnackbarMessage:
            'Error copying coupon URL. Please check the console or try again.',
        });
      }
    );
  };

  const generateShareUrl = () => {
    const stringifiedState = JSON.stringify({
      couponTextValue: state.couponTextValue,
      couponTextSize: state.couponTextSize,
      couponTextBold: state.couponTextBold,
      couponTextItalic: state.couponTextItalic,
      couponSubtextValue: state.couponSubtextValue,
      couponSubtextSize: state.couponSubtextSize,
      couponSubtextBold: state.couponSubtextBold,
      couponSubtextItalic: state.couponSubtextItalic,
      disclaimerValue: state.disclaimerValue,
      disclaimerSize: state.disclaimerSize,
      disclaimerBold: state.disclaimerBold,
      disclaimerItalic: state.disclaimerItalic,
      couponBackgroundColor: state.couponBackgroundColor,
      couponTextColor: state.couponTextColor,
      starburstBackgroundColor: state.starburstBackgroundColor,
      startburstTextColor: state.startburstTextColor,
      filename: state.filename,
      currentTab: state.currentTab,
      borderStyle: state.borderStyle,
    });
    const sanitizedStringifiedState = stringifiedState.replace(/’/g, `'`);
    // eslint-disable-next-line
    const encodedState = window.btoa(encodeURIComponent(sanitizedStringifiedState));
    const shareUrl = `${window.location.origin}${window.location.pathname}?load=${encodedState}`;

    return shareUrl;
  };

  const handleShare = () => {
    const shareUrl = generateShareUrl();
    ReactGA.event({
      category: 'Offer',
      action: `Shared ${state.currentTab}`,
    });
    copy(shareUrl);
  };

  const closeCopySnackbar = () => {
    updateState({
      copySnackbarOpen: false,
      uploadError: false,
      loadError: false,
      copyError: false,
      copySnackbarMessage: '',
    });
  };

  const prepareImage = () => {
    const type = state.currentTab;

    const imageDiv = document.querySelector('.image-render');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const couponOptions = {
      width: 580,
      height: 317,
      scale: devicePixelRatio,
      backgroundColor: null,
      logging: window.couponator.debug,
    };
    const starburstOptions = {
      width: 578,
      height: 578,
      scale: 1.41, // starburst uses a different ratio to size it correctly
      backgroundColor: null,
      logging: window.couponator.debug,
    };

    const options = type === 'coupon' ? couponOptions : starburstOptions;

    html2canvas(imageDiv, options).then((canvas) => {
      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('width', options.width);
      newCanvas.setAttribute('height', options.height);
      const ctx = newCanvas.getContext('2d');
      const drawWidth = type === 'coupon' ? canvas.width : options.width;
      const drawHeight = type === 'coupon' ? canvas.height : options.height;
      ctx.drawImage(
        canvas,
        0,
        0,
        drawWidth,
        drawHeight,
        0,
        0,
        options.width,
        options.height
      );

      const imageDataUrl = newCanvas.toDataURL();
      const imageBase64 = imageDataUrl.replace(/data:.*;base64,/, '');
      const imageData = Buffer.from(imageBase64, 'base64');

      // encode metadata within image
      const chunks = extract(imageData);

      chunks.splice(-1, 0, text.encode('couponator', 'true'));
      const encodedState = generateShareUrl().split('load=')[1];
      chunks.splice(-1, 0, text.encode('encodedState', encodedState));

      let finalImage = 'data:image/png;base64,';
      finalImage += Buffer.from(encode(chunks)).toString('base64');
      // end encode

      // for debugging
      if (window.couponator.debug) {
        const img = document.createElement('img');
        img.setAttribute('src', finalImage);
        document.body.append(img);
        console.log(`Canvas width: ${canvas.width}`);
        console.log(`Canvas height: ${canvas.height}`);
        console.log(`Options`, options);
      }

      updateState({
        imageUri: finalImage,
        actionStatus: 'prepared',
      });
    });
  };

  const cancelImage = () =>
    updateState({
      actionStatus: 'idle',
      imageUri: '',
    });

  const uploadImage = () => {
    const { imageUri, filename, currentTab } = state; // eslint-disable-line

    ReactGA.event({
      category: 'Offer',
      action: `Uploaded ${currentTab}`,
    });

    axios
      .post('/image', {
        imageUri,
        filename,
        type: currentTab,
      })
      .then((res) => {
        updateState({
          publicUri: res.data.Location,
          actionStatus: 'uploaded',
          uploadError: false,
          loadError: false,
        });
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
            console.log('Response status code:', error.response.status);
            console.log('Response headers:', error.response.headers);
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

  const classes = useStyles();
  const {
    currentTab,
    copySnackbarOpen,
    copySnackbarMessage,
    uploadError,
    loadError,
    copyError,
    loadingFromUrl,
  } = state;

  let alertSeverity = 'success';

  if (uploadError || loadError) {
    alertSeverity = 'error';
  } else if (copyError) {
    alertSeverity = 'warning';
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Welcome />
      <AppBar position="static" classes={{ root: classes.appBar }}>
        <Toolbar>
          <Tabs
            value={currentTab}
            onChange={(e, value) => updateState({ currentTab: value })}
            classes={{ indicator: classes.tabsIndicator }}
          >
            <Tab
              value="coupon"
              label="Coupon"
              classes={{ root: classes.tabRoot }}
            />
            <Tab
              value="starburst"
              label="Starburst"
              classes={{ root: classes.tabRoot }}
            />
            <Tab
              value="upload"
              label="Upload"
              classes={{ root: classes.tabRoot }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Paper classes={{ root: classes.paperStyle }}>
        {loadingFromUrl ? (
          <CircularProgress
            size={120}
            thickness={2.3}
            className={classes.buttonProgress}
          />
        ) : (
          <div className={classes.app}>
            {currentTab !== 'upload' ? (
              <>
                <CreateForm
                  handleChange={handleChange}
                  updateState={updateState}
                  handleShare={handleShare}
                  data={state}
                  type={currentTab}
                />
                <ImageRender data={state} />
                <div />
                <ActionButtons
                  data={state}
                  prepare={prepareImage}
                  upload={uploadImage}
                  cancel={cancelImage}
                />
              </>
            ) : (
              <Uploader updateState={updateState} handleCopy={copy} />
            )}
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              open={copySnackbarOpen}
              autoHideDuration={uploadError || loadError ? null : 5000}
              ClickAwayListenerProps={
                uploadError || loadError ? { mouseEvent: false } : null
              }
            >
              <MuiAlert
                elevation={6}
                variant="filled"
                severity={alertSeverity}
                onClose={closeCopySnackbar}
              >
                {copySnackbarMessage}
              </MuiAlert>
            </Snackbar>
          </div>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default App;

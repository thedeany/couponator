import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { ArrowDropDown } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';
import ColorPicker from './ColorPicker';
import LoadFromFile from './LoadFromFile';
import LoadFromUrl from './LoadFromUrl';

const useStyles = makeStyles((theme) => ({
  formGroup: {
    margin: '20px',
    display: 'grid',
    gridTemplateColumns: 'max-content max-content max-content max-content',
    alignItems: 'center',
  },
  colorPickerContainer: {
    position: 'relative',
    '& > [style="position: relative;"]': {
      position: 'absolute !important',
      left: '50%',
    },
  },
  textField: {
    margin: theme.spacing(),
    width: 300,
  },
  numberField: {
    margin: theme.spacing(),
    width: 45,
  },
  boldButton: {
    fontWeight: 'bold',
    minWidth: '50px',
  },
  italicButton: {
    fontStyle: 'italic',
    minWidth: '50px',
  },
  toggleButtonGroupRoot: {
    display: 'inline',
  },
  colorButton: {
    margin: theme.spacing(),
  },
  borderStyleLabel: {
    top: 0,
    left: 0,
    position: 'absolute',
    color: 'rgba(0, 0, 0, 0.54)',
    padding: 0,
    fontSize: '1rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: 1,
    transform: 'translate(0, 1.5px) scale(0.75)',
    transformOrigin: 'top left',
  },
  borderStyleToggleButtonGroup: {
    marginTop: theme.spacing(2),
  },
  formActions: {
    '& > *:not(:last-child)': {
      marginRight: theme.spacing(),
    },
  },
  genericSelectContainer: {
    marginTop: theme.spacing(-2),
    marginLeft: theme.spacing(),
  },
  genericSelect: {
    minWidth: '160px',
  },
  openMenuButton: {
    background: '#e0e0e0',
  },
}));

const CreateForm = (props) => {
  const { handleChange, updateState, handleShare, data, type } = props;
  const [genericAnchorEl, setGenericAnchorEl] = useState(null);
  const [disclaimerMenuAnchorEl, setDisclaimerMenuAnchorEl] = useState(null);
  const classes = useStyles();

  const fields = [
    {
      label: 'Coupon Text',
      placeholder: 'Enter coupon text',
      value: 'couponTextValue',
      size: 'couponTextSize',
      bold: 'couponTextBold',
      italic: 'couponTextItalic',
    },
    {
      label: 'Coupon Subtext',
      placeholder: 'Enter coupon subtext',
      value: 'couponSubtextValue',
      size: 'couponSubtextSize',
      bold: 'couponSubtextBold',
      italic: 'couponSubtextItalic',
    },
    {
      label: 'Disclaimer',
      placeholder: 'Enter disclaimer text',
      value: 'disclaimerValue',
      size: 'disclaimerSize',
      bold: 'disclaimerBold',
      italic: 'disclaimerItalic',
    },
  ];

  const genericOffers = [
    {
      value: 'generic',
      display: 'Generic',
    },
  ];

  const defaultDisclaimers = [
    '*See leasing office for details.',
    '*Restrictions apply. See leasing office for details.',
    '*Restrictions apply.',
    '*Certain restrictions apply.',
    '*Contact leasing office for details.',
    '*Certain terms and conditions apply.',
  ];

  const dateParts = Intl.DateTimeFormat('en-us', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const date = dateParts[4].value + dateParts[0].value + dateParts[2].value;

  const handleGenericOpen = (e) => {
    setGenericAnchorEl(e.currentTarget);
  };

  const handleGenericClose = () => {
    setGenericAnchorEl(null);
  };

  const handleGenericChoice = (e) => {
    const { value } = e.currentTarget.dataset;

    let textValue = '';
    const textSize = 31;
    const backgroundColor = data.couponBackgroundColor;
    const gaAction = 'Generic';

    if (value === 'generic') {
      textValue = 'Our move-in specials change daily! Please contact the leasing team to learn more about our most up to date offerings!'; // eslint-disable-line
    }

    const newState = {
      couponBackgroundColor: backgroundColor,
      couponTextValue: textValue,
      couponTextSize: textSize,
      couponSubtextValue: '',
      disclaimerValue: '',
      filenameUserEdited: true,
      filename: `${value}${value === 'generic' ? '' : ' generic'}`,
    };

    updateState(newState);

    ReactGA.event({
      category: 'Offer',
      action: `Filled ${gaAction} Text`,
    });

    handleGenericClose();
  };

  const handleDisclaimerMenu = (e) => {
    setDisclaimerMenuAnchorEl(e.target);
  };

  const handleDisclaimerMenuClose = () => {
    setDisclaimerMenuAnchorEl(null);
  };

  const handleDisclaimerMenuChoice = (e) => {
    const { value } = e.currentTarget.dataset;

    updateState({
      disclaimerValue: value,
    });

    handleDisclaimerMenuClose();
  };

  return (
    <div className="form">
      <div className={`${classes.formGroup} ${classes.formActions}`}>
        <Button
          aria-controls="generic-offer-menu"
          aria-haspopup="true"
          onClick={handleGenericOpen}
          className={!!genericAnchorEl && classes.openMenuButton}
        >
          Fill Generic Offer
        </Button>
        <Menu
          id="generic-offer-menu"
          anchorEl={genericAnchorEl}
          keepMounted
          open={!!genericAnchorEl}
          onClose={handleGenericClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        >
          {genericOffers.map((offer) => (
            <MenuItem
              key={offer.value}
              data-value={offer.value}
              onClick={handleGenericChoice}
            >
              {offer.display}
            </MenuItem>
          ))}
        </Menu>
        <LoadFromFile updateState={updateState} />
        <LoadFromUrl updateState={updateState} />
      </div>
      {fields.map((field) => (
        <div className={classes.formGroup} key={field.label}>
          <TextField
            id={field.value}
            label={field.label}
            placeholder={field.placeholder}
            className={classes.textField}
            onChange={handleChange}
            name={field.value}
            value={data[field.value]}
            margin="normal"
            multiline
            InputProps={
              field.label === 'Disclaimer'
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          disableRipple
                          aria-label="toggle default disclaimer selection menu"
                          onClick={handleDisclaimerMenu}
                        >
                          <ArrowDropDown />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : null
            }
          />
          <TextField
            id={field.size}
            label="Size"
            placeholder="30"
            className={classes.numberField}
            type="number"
            onChange={handleChange}
            name={field.size}
            value={data[field.size]}
            margin="normal"
          />
          <ToggleButtonGroup classes={{ root: classes.toggleButtonGroupRoot }}>
            <ToggleButton
              value={field.bold}
              name={field.bold}
              classes={{ root: classes.boldButton, selected: classes.selected }}
              onClick={handleChange}
              selected={data[field.bold]}
            >
              B
            </ToggleButton>
            <ToggleButton
              value={field.italic}
              name={field.italic}
              classes={{
                root: classes.italicButton,
                selected: classes.selected,
              }}
              onClick={handleChange}
              selected={data[field.italic]}
            >
              I
            </ToggleButton>
          </ToggleButtonGroup>

          {field.label === 'Disclaimer' ? (
            <Menu
              id="disclaimer-menu"
              anchorEl={disclaimerMenuAnchorEl}
              keepMounted
              open={!!disclaimerMenuAnchorEl}
              onClose={handleDisclaimerMenuClose}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
              {defaultDisclaimers.sort().map((disclaimer) => (
                <MenuItem
                  key={disclaimer}
                  data-value={disclaimer}
                  onClick={handleDisclaimerMenuChoice}
                >
                  {disclaimer}
                </MenuItem>
              ))}
            </Menu>
          ) : null}
        </div>
      ))}

      {/* Color picker */}
      <ColorPicker
        data={data}
        type={type}
        handleChange={handleChange}
        classes={classes.formGroup}
        updateState={updateState}
      />
      {/* End color picker */}

      {/* Border style */}
      {/* type === 'coupon' ? (
        <div className={classes.formGroup}>
          <TextField
            className={classes.textField}
            label="Border"
            value={data.borderStyle}
            InputLabelProps={{
              shrink: true,
            }}
            select
            onChange={e => handleChange('borderStyle')(e.target.value)}
          >
            {['solid', 'dashed', 'dotted', 'double'].map(value => (
              <MenuItem key={value} value={value}>
                {value[0].toUpperCase() + value.substring(1)}
              </MenuItem>
            ))}
          </TextField>
        </div>
      ) : null */}

      {/* Filename */}
      <div className={classes.formGroup}>
        <TextField
          id="filename"
          label="Filename"
          name="filename"
          className={classes.textField}
          value={data.filename}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {type === 'starburst'
                  ? `_${date}_starburst.png`
                  : `_${date}.png`}
              </InputAdornment>
            ),
          }}
        />
      </div>
      {/* End filename */}

      {/* Share button */}
      <div className={classes.formGroup}>
        <Button onClick={handleShare}>Share</Button>
      </div>
      {/* End share button */}
    </div>
  );
};

CreateForm.propTypes = {
  updateState: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleShare: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  type: PropTypes.string,
};

export default CreateForm;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import { default as MuiColorPicker } from 'material-ui-color-picker'; // eslint-disable-line

const colors = {
  autoOrange: {
    background: '#FE5500',
    color: '#FFFFFF',
    '&:hover': {
      background: '#ff7733',
    },
  },
  autoBlue: {
    background: '#2472BB',
    color: '#FFFFFF',
    '&:hover': {
      background: '#3a8cd9',
    },
  },
  furnBlue: {
    background: '#273955',
    color: '#FFFFFF',
    '&:hover': {
      background: '#558baa',
    },
  },
  mfTan: {
    background: '#918156',
    color: '#FFFFFF',
    '&:hover': {
      background: '#aa9a6e',
    },
  },
  mfTeal: {
    background: '#407f87',
    color: '#FFFFFF',
    '&:hover': {
      background: '#509faa',
    },
  },
  bozzuto: {
    background: '#186838',
    color: '#FFFFFF',
  },
  maa: {
    background: '#050f32',
    color: '#FFFFFF',
  },
  nolan: {
    background: '#DB3732',
    color: '#FFFFFF',
  },
  nts: {
    background: '#F12500',
    color: '#FFFFFF',
  },
  windsor: {
    background: '#7Ec7E0',
    color: '#FFFFFF',
  },
};

const useStyles = makeStyles((theme) => ({
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
  colorButton: {
    margin: theme.spacing(),
  },
  colorMenu: {
    padding: 0,
    minWidth: '180px',
  },
  openMenuButton: {
    background: '#e0e0e0',
  },
  ...colors,
}));

const ColorPicker = ({
  data,
  type,
  handleChange,
  classes: cl,
  updateState,
}) => {
  const [colorMenuAnchorEl, setColorMenuAnchorEl] = useState(null);
  const classes = useStyles();
  const propClasses = Array.isArray(cl) ? cl.join(' ') : cl;
  const typeColors = [
    ['Auto', 'autoBlue'],
    ['Auto', 'autoOrange'],
    ['Furniture', 'furnBlue'],
    ['Multifamily', 'mfTan'],
    ['Multifamily', 'mfTeal'],
    ['Bozzuto', 'bozzuto'],
    ['MAA', 'maa'],
    ['Nolan', 'nolan'],
    ['NTS', 'nts'],
    ['Windsor', 'windsor'],
  ];
  const typeStateName = `${type}BackgroundColor`;

  const handleColorMenuOpen = (e) => {
    setColorMenuAnchorEl(e.currentTarget);
  };

  const handleColorMenuClose = () => {
    setColorMenuAnchorEl(null);
  };

  const handleColorMenuChoice = (e) => {
    debugger;
    const { color } = e.currentTarget.dataset;

    updateState({
      [typeStateName]: colors[color].background,
    });

    handleColorMenuClose();
  };

  return (
    <div className={clsx(propClasses, classes.colorPickerContainer)}>
      <>
        <MuiColorPicker
          id="background-color"
          label="Background Color"
          name={typeStateName}
          value={data[typeStateName]}
          onChange={(color) =>
            handleChange({
              target: { name: typeStateName, value: color },
            })
          }
          TextFieldProps={{
            value: data[typeStateName],
            className: classes.textField,
            InputProps: null,
          }}
        />
        <Button
          aria-controls="color-menu"
          aria-haspopup="true"
          onClick={handleColorMenuOpen}
          className={!!colorMenuAnchorEl && classes.openMenuButton}
        >
          Color Presets
        </Button>
        <Menu
          classes={{ list: classes.colorMenu }}
          id="color-menu"
          anchorEl={colorMenuAnchorEl}
          keepMounted
          open={!!colorMenuAnchorEl}
          onClose={handleColorMenuClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        >
          {typeColors.map(([label, color]) => (
            <MenuItem
              data-color={color}
              data-label={label}
              onClick={handleColorMenuChoice}
              style={{
                background: colors[color].background,
                color: colors[color].color,
              }}
            >
              <ListItemText primary={label} />
            </MenuItem>
          ))}
        </Menu>
      </>
    </div>
  );
};

ColorPicker.propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  classes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  updateState: PropTypes.func.isRequired,
};

export default ColorPicker;

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import StarburstSVG from './StarburstSVG';
import ImageRenderText from './ImageRenderText';

const useStyles = makeStyles({
  couponPreviewContainer: {
    width: '580px',
    height: '317px',
    padding: '27px',
    color: (props) => props.couponTextColor,
    background: '#918156',
    textTransform: 'uppercase',
    textAlign: 'center',
    boxSizing: 'border-box',
    fontFamily: 'Lato, sans-serif',
  },
  starburstPreviewContainer: {
    fontFamily: 'Lato, sans-serif',
  },
  couponTextContainer: {
    height: '100%',
    borderWidth: '4px',
    borderColor: (props) => props.couponTextColor,
    padding: '20px',
    position: 'relative',
    fontSize: '30px',
    display: 'grid',
    gridTemplateRows: '1fr',
  },
  starburstTextContainer: {
    position: 'relative',
    width: '410px',
    height: '410px',
    backgroundSize: 'contain',
    backgroundColor: 'transparent',
    display: 'grid',
    justifyItems: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: (props) => props.starburstTextColor,
  },
  starburstText: {
    display: 'grid',
    gridTemplateRows: '1fr',
    justifyItems: 'center',
    alignItems: 'center',
    width: '320px',
    height: '290px',
  },
  imageBackgroundColor: (props) => ({
    backgroundColor:
      props.currentTab === 'coupon' ? props.couponBackgroundColor : null,
  }),
  imageBorderStyle: (props) => ({
    borderStyle: props.currentTab === 'coupon' ? props.borderStyle : null,
  }),
});

const ImageRender = ({ data }) => {
  const { currentTab, starburstBackgroundColor } = data;
  const classes = useStyles(data);

  return (
    <>
      <div
        className={clsx(
          currentTab === 'coupon'
            ? classes.couponPreviewContainer
            : classes.starburstPreviewContainer,
          classes.imageBackgroundColor,
          'image-render'
        )}
      >
        {currentTab === 'starburst' ? (
          <StarburstSVG
            styles={{
              fill: starburstBackgroundColor,
              width: 410,
              height: 410,
              position: 'absolute',
            }}
          />
        ) : null}
        <div
          className={clsx(
            currentTab === 'coupon'
              ? classes.couponTextContainer
              : classes.starburstTextContainer,
            classes.imageBorderStyle
          )}
        >
          {currentTab === 'coupon' ? (
            <ImageRenderText data={data} />
          ) : (
            <div className={classes.starburstText}>
              <ImageRenderText data={data} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

ImageRender.propTypes = {
  data: PropTypes.object,
};

export default ImageRender;

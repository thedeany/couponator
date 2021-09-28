import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import DisplayText from './DisplayText';

const useStyles = makeStyles({
  couponTextMain: {
    display: 'grid',
    justifyItems: 'center',
    alignItems: 'center',
  },
  starburstTextMain: {
    display: 'grid',
    justifyItems: 'center',
    alignItems: 'center',
  },
  couponDisclaimer: {
    '&:before': {
      content: '""',
      height: '2px',
      width: '90%',
      margin: '10px auto',
      background: (props) => props.couponTextColor,
      display: 'block',
    },
  },
  starburstDisclaimer: {
    width: '80%',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});

const ImageRenderText = ({ data }) => {
  const {
    currentTab,
    couponTextValue,
    couponTextSize,
    couponTextBold,
    couponTextItalic,
    couponSubtextValue,
    couponSubtextSize,
    couponSubtextBold,
    couponSubtextItalic,
    disclaimerValue,
    disclaimerSize,
    disclaimerBold,
    disclaimerItalic,
  } = data;
  const classes = useStyles(data);
  return (
    <>
      <div
        className={clsx(
          currentTab === 'coupon'
            ? classes.couponTextMain
            : classes.starburstTextMain
        )}
      >
        {couponTextValue ? (
          <DisplayText
            size={couponTextSize}
            className={clsx(
              currentTab === 'coupon' ? 'coupon-text' : 'starburst-text',
              {
                [classes.bold]: couponTextBold,
                [classes.italic]: couponTextItalic,
              }
            )}
          >
            {couponTextValue}
          </DisplayText>
        ) : null}
        {couponSubtextValue ? (
          <DisplayText
            size={couponSubtextSize}
            className={clsx(
              currentTab === 'coupon' ? 'coupon-subtext' : 'starburst-subtext',
              {
                [classes.bold]: couponSubtextBold,
                [classes.italic]: couponSubtextItalic,
              }
            )}
          >
            {couponSubtextValue}
          </DisplayText>
        ) : null}
      </div>
      {disclaimerValue ? (
        <DisplayText
          size={disclaimerSize}
          className={clsx(
            currentTab === 'coupon'
              ? classes.couponDisclaimer
              : classes.starburstDisclaimer,
            {
              [classes.bold]: disclaimerBold,
              [classes.italic]: disclaimerItalic,
            }
          )}
        >
          {disclaimerValue}
        </DisplayText>
      ) : null}
    </>
  );
};

ImageRenderText.propTypes = {
  data: PropTypes.object,
};

export default ImageRenderText;

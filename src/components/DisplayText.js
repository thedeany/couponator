import React from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';

const renderHtml = (html) => ({
  __html: sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span', 'u']),
    allowedAttributes: {
      '*': ['style'],
    },
  }),
});

const DisplayText = (props) => {
  const { size, className, children } = props;
  const style = {
    fontSize: `${size}px`,
  };
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={renderHtml(children.replace(/\n/g, '<br>'))}
    />
  );
};

DisplayText.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
  size: PropTypes.string.isRequired,
};

export default DisplayText;

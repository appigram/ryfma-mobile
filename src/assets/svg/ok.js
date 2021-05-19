import React from 'react';
import PropTypes from 'prop-types';

const OK = (props) => {
  const { color, size, ...otherProps } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="-20 0 512 512"
      fill="none"
      stroke={color}
      strokeWidth="43"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <g>
        <path d="M256.239,277.333c76.583,0,138.667-62.083,138.667-138.667S332.823,0,256.239,0   S117.573,62.083,117.573,138.667C117.667,215.211,179.695,277.239,256.239,277.333z M256.239,64   c41.237,0,74.667,33.429,74.667,74.667s-33.429,74.667-74.667,74.667s-74.667-33.429-74.667-74.667S215.002,64,256.239,64z"/><path d="M392.069,343.04c15.07-9.926,24.15-26.755,24.171-44.8c0.21-14.976-8.241-28.728-21.696-35.307   c-13.824-6.905-30.372-5.35-42.667,4.011c-56.983,41.543-134.27,41.543-191.253,0c-12.314-9.312-28.833-10.865-42.667-4.011   c-13.449,6.578-21.904,20.315-21.717,35.285c0.032,18.042,9.109,34.866,24.171,44.8c19.324,12.851,40.368,22.906,62.507,29.867   c3.755,1.166,7.63,2.247,11.627,3.243l-64.469,63.04c-16.912,16.409-17.321,43.42-0.912,60.333   c16.409,16.912,43.42,17.321,60.333,0.912c0.352-0.342,0.698-0.689,1.038-1.043l65.707-68.011l65.835,68.139   c16.395,16.925,43.407,17.355,60.332,0.96c16.925-16.395,17.355-43.407,0.96-60.332c-0.343-0.354-0.692-0.702-1.047-1.044   l-64.363-62.976c3.996-1.024,7.886-2.112,11.669-3.264C351.743,365.908,372.767,355.874,392.069,343.04z"/>
      </g>
    </svg>
  );
};

OK.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

OK.defaultProps = {
  color: 'currentColor',
  size: '24',
};

export default OK;
import React from 'react';
import PropTypes from 'prop-types';
import Svg, {
  Circle, Ellipse, G, Text, TSpan, TextPath, Path, Polygon, Polyline, Line, Rect, Use, Image, Symbol, Defs, LinearGradient, RadialGradient, Stop, ClipPath, Pattern, Mask
} from 'react-native-svg'

const RCoin = (props) => {
  const { color, size, ...otherProps } = props;
  return (<span className='coin-currency' style={{ width: `${size}px`, height: `${size}px` }}>
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 640 640"
      fill="none"
      stroke={color}
      {...otherProps}
    >
      <Circle r="317.5" cy="317.49999" cx="317.50001" fill="#F6D738" />
      {/* <circle r="269.45801" cy="317.49999" cx="317.50001" fill="#EDBD31"/> */}
      <Path d="m293.00101,149.87799c49.741,0 87.836,8.845 114.303,26.539c26.461,17.695 39.694,45.196 39.694,82.497c0,23.28 -5.345,42.165 -16.023,56.673c-10.684,14.508 -26.064,25.908 -46.152,34.193c6.698,8.291 13.708,17.779 21.044,28.457c7.329,10.684 14.586,21.837 21.759,33.472c7.173,11.646 14.111,23.755 20.803,36.351c6.698,12.596 12.915,24.946 18.651,37.061l-83.398,0c-6.083,-10.835 -12.249,-21.832 -18.489,-32.997c-6.239,-11.159 -12.635,-22 -19.199,-32.521c-6.558,-10.522 -13.043,-20.484 -19.439,-29.888c-6.407,-9.404 -12.808,-17.935 -19.204,-25.589l-36.826,0l0,120.995l-74.603,0l0,-326.638c16.258,-3.181 33.069,-5.417 50.451,-6.692c17.377,-1.27 32.919,-1.913 46.628,-1.913zm4.304,63.606c-5.423,0 -10.281,0.162 -14.586,0.475c-4.305,0.324 -8.369,0.643 -12.193,0.956l0,89.91l21.044,0c28.049,0 48.136,-3.505 60.257,-10.522c12.115,-7.011 18.17,-18.964 18.17,-35.865c0,-16.263 -6.139,-27.814 -18.41,-34.674c-12.278,-6.853 -30.37,-10.28 -54.282,-10.28z" fill="#C67D26" />
    </Svg>
  </span>);
};

RCoin.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

RCoin.defaultProps = {
  color: '#F6D738',
  size: '20',
};

export default RCoin;

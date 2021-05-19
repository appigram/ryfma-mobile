import React from 'react';
import tw from 'tailwind-rn';
import { Image } from '~components/Themed';

export default function Avatar({ uri, type, size, style = '', ...otherProps }) {
  let width = 'w-10'
  let height = 'h-10'
  if (type === 'middle') {
    width = 'w-14'
    height = 'h-14'
  } else if (type === 'big') {
    width = 'w-20'
    height = 'h-20'
  }

  if (size) {
    width = 'w-' + size
    height = 'h-' + size
  }
  return (
    <Image
      source={{ uri }}
      style={tw(`${width} ${height} rounded-full ${style}`)}
      {...otherProps}
    />
  );
}

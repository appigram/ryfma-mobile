import React from 'react';
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native';

export default function Link({ page, params, style, replace, children }) {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      onPress={() => {
        console.log('routePage: ', page)
        console.log('routeParams: ', params)
        if (replace) {
          navigation.navigate(page, params)
        } else {
          navigation.push(page, params)
        }
      }}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
}

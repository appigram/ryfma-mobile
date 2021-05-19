import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';

export default function WebLink({ to, style, children }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Linking.canOpenURL(to).then(supported => {
        if (supported) {
          Linking.openURL(to);
        } else {
          console.log("Don't know how to open URI: " + to);
        }
      })
      }}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
}

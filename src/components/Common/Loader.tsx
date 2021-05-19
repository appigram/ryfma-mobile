import React from 'react'
import tw from 'tailwind-rn'
import { ActivityIndicator } from 'react-native'
import { View } from '~components/Themed'

function Loader () {
  return (
    <View
      style={tw('flex px-2')}
    >
      <ActivityIndicator animating size="large" />
    </View>
  )
}

export default Loader

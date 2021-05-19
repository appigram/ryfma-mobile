import React from 'react'
import { Feather } from '@expo/vector-icons'
import tw from 'tailwind-rn'
import { View, Text } from '~components/Themed'

function EmptyView ({ iconName, header, text, button }) {
  return (
    <View style={tw('flex py-12 px-2 items-center')}>
      <Feather name={iconName} size={48} />
      <Text style={tw('text-xl font-semibold my-2')}>{header}</Text>
      <Text>{text}</Text>
      {button || null}
    </View>
  )
}

export default EmptyView

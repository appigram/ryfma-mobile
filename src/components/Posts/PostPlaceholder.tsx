import React from 'react'
import tw from 'tailwind-rn'
import { View } from '~components/Themed'

function PostPlaceholder () {
  return (
    <View style={tw('flex p-4')}>
      <View style={tw('flex flex-row items-center mb-2')}>
        <View style={tw('w-14 h-14 rounded-full bg-gray-100 mr-2')} />
        <View>
          <View style={tw('h-5 w-40 mb-2 bg-gray-100 rounded-lg')} />
          <View style={tw('h-4 w-20 bg-gray-100 rounded-lg')} />
        </View>
      </View>

      <View style={tw('w-64 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-48 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-64 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-48 h-3 my-1 bg-gray-100 rounded-lg')} />

    </View>
  )
}

export default PostPlaceholder

import React from 'react'
import tw from 'tailwind-rn'
import { View } from '~components/Themed'

const PostPagePlaceholder = () => {
  return (<View style={tw('flex h-full')}>
    <View style={tw('w-full h-48 rounded-lg bg-gray-100 mb-2')} />

    <View style={tw('flex p-4')}>
      <View style={tw('h-6 w-48 bg-gray-100 rounded-lg')} />
      <View style={tw('flex flex-row items-center my-4')}>
        <View style={tw('w-8 h-8 rounded-full bg-gray-100 mr-2')} />
        <View style={tw('flex flex-wrap')}>
          <View style={tw('h-2 w-20 bg-gray-100 rounded-lg mb-2')} />
          <View style={tw('flex flex-row items-center')}>
            <View style={tw('h-2 w-20 bg-gray-100 rounded-lg')} />
            <View style={tw('w-2 h-2 bg-gray-100 rounded-full mx-3')} />
            <View style={tw('h-2 w-10 bg-gray-100 rounded-lg')} />
          </View>
        </View>
      </View>

      <View style={tw('w-64 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-48 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-64 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-48 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-64 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-48 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-64 h-3 my-1 bg-gray-100 rounded-lg')} />
      <View style={tw('w-48 h-3 my-1 bg-gray-100 rounded-lg')} />

      <View style={tw('flex flex-row mt-4')} >
        <View style={tw('w-14 h-4 bg-gray-100 rounded-lg mr-3')} />
        <View style={tw('w-14 h-4 bg-gray-100 rounded-lg mr-3')} />
        <View style={tw('w-14 h-4 bg-gray-100 rounded-lg mr-3')} />
      </View>

      <View style={tw('flex flex-row mt-4')} >
        <View style={tw('w-20 h-3 bg-gray-100 rounded-full')} />
      </View>

      <View style={tw('flex flex-row justify-between mt-6')} >
        <View style={tw('w-4 h-4 bg-gray-100 rounded-full')} />
        <View style={tw('w-4 h-4 bg-gray-100 rounded-full')} />
        <View style={tw('w-4 h-4 bg-gray-100 rounded-full')} />
        <View style={tw('w-4 h-4 bg-gray-100 rounded-full')} />
        <View style={tw('w-4 h-4 bg-gray-100 rounded-full')} />
      </View>

    </View>
  </View>)
}

export default PostPagePlaceholder

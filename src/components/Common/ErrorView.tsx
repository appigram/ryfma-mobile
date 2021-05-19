import React from 'react'
import tw from 'tailwind-rn'
import { Feather } from '@expo/vector-icons'
import { View, Text, Button } from '~components/Themed'

function ErrorView ({ error, refetch }) {
  let errorMsg = ''
  if (error.error_type) {
    errorMsg = `${error.error_type}: ${error.error_data.error_code}.${error.error_data.error_reason}`
  } else if (error.errors) {
    errorMsg = `${error.errors[0].extensions.code}: ${error.errors[0].message}`
  } else if (error.message) {
    errorMsg = `${error.message}`
  } else {
    errorMsg = `${error.toString()}`
  }
  return (
    <View style={tw('flex h-full items-center py-40 px-2')}>
      <Feather name='alert-circle' size={48} />
      <Text style={tw('my-4 text-lg')}>Что-то пошло не так :(</Text>
      {!!errorMsg && <Text style={tw('mb-4 text-xs')}>
        {errorMsg}
      </Text>}
      <Button
        title='Повторить'
        onPress={refetch}
        style={tw('flex-initial rounded-md bg-blue-500 text-white font-semibold flex items-center justify-center py-3 px-6')}
      />
    </View>
  )
}

export default ErrorView

import React, {useRef, useState} from 'react'
import { useTranslation } from 'react-i18next'
import tw from 'tailwind-rn'
import { Feather } from '@expo/vector-icons'
import { View, TextInput, Button } from '~components/Themed'

function SearchInput ({ defaultValue, onChange }) {
  const [t] = useTranslation('notif')
  const [searchFocused, setSearchFocused] = useState(false)

  const clearSearchInput = () => {
    setSearchFocused(false)
    onChange('')
  }

  return (<View style={tw('flex flex-row')}>
    <View style={tw('flex-1 flex-row bg-gray-200 pl-2 rounded-full pr-4')}>
      <Feather name='search' size={20} color="#000" style={tw('py-2')}/>
      <TextInput
        style={tw('flex-1 ml-1 py-2 bg-gray-200 rounded-r-full')}
        placeholder="Search"
        defaultValue={defaultValue}
        onChangeText={onChange}
        onFocus={() => setSearchFocused(true)}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize='none'
      />
    </View>
    {(searchFocused || !!defaultValue) && <Button title={t('common:cancel')} style={tw('p-0 rounded-none ml-2')} styleTitle={tw('text-blue-500')} onPress={clearSearchInput} />}
  </View>)
}

export default SearchInput

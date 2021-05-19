import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { View, Text, Button } from '~components/Themed'
import SearchInput from '~components/Common/SearchInput'
import tw from 'tailwind-rn'
import debounce from 'lodash.debounce'
import SearchUsersResult from '~components/Search/SearchUsersResult'
import SearchPostsResult from '~components/Search/SearchPostsResult'
import PaidUsers from '~components/Search/PaidUsers'
import CuratedTopics from '~components/Home/CuratedTopics'
import EditorsPicks from '~components/Home/EditorsPicks'
import ClassicBlock from '~components/Home/ClassicBlock'
import FairyTailsBlock from '~components/Home/FairytailsBlock'
// import Audios from '~components/Home/Audios'
// import PopularTagsList from '~components/Tags/PopularTagsList'

import Avatar from '~components/Common/Avatar'

import ReactGA from 'react-ga'
// import SearchBooksResult from './SearchBooksResult'
// import AdvBanner from '/imports/ui/components/Adv/AdvBanner'

const SearchTabs = createMaterialTopTabNavigator()

function SearchScreen({ navigation }) {
  const [t] = useTranslation('search')
  const [searchKeyword, setSearchKeyword] = useState('')

  const handleSearchChange = (nextKeyword) => {
    let keyword = nextKeyword
    keyword = keyword.replace(new RegExp(':\\[', 'g'), '/\\')
    ReactGA.event({
      category: 'Search',
      action: 'SearchOnPage',
      label: `SearchOnPage: ${keyword}`,
      value: 1,
    })
    setSearchKeyword(keyword)
  }

  const onChange = debounce((keyword) => {
    handleSearchChange(keyword)
  }, 600)

  return (<View style={tw('h-full pt-14')}>
    <View style={tw("flex flex-row items-center justify-between px-2 pb-2")}>
      <Text style={tw("text-4xl font-black text-black")} lightColor="#eee" darkColor="rgba(255,255,255,0.1)">Search</Text>
      <View style={tw("flex flex-row items-center justify-between")}>
        <Button
          icon={
            <Avatar uri='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' type='small' />}
          onPress={() => navigation.push('ProfileTab')}
          style={tw('p-0')}
        />
      </View>
    </View>
    <View style={tw('px-2 py-2')}>
      <SearchInput defaultValue={searchKeyword} onChange={onChange} />
    </View>
    {searchKeyword ?
      <SearchTabs.Navigator
        tabBarOptions={{
          scrollEnabled: true,
          activeTintColor: '#222',
          tabStyle: { width: 'auto', paddingLeft: 12, paddingRight: 12, paddingBottom: 0, paddingTop: 0, height: 40 },
          labelStyle: { fontSize: 14, fontWeight: '900', height: 28 },
          style: { marginLeft: 8, paddingBottom: 0, marginBottom: 0 },
        }}
      >
        <SearchTabs.Screen
          name='SearchByUsers'
          component={SearchUsersResult}
          options={{ tabBarLabel: t('searchByUsers') }}
          initialParams={{ keyword: searchKeyword }}
        />
        <SearchTabs.Screen
          name='SearchByPosts'
          component={SearchPostsResult}
          options={{ tabBarLabel: t('searchByPosts') }}
          initialParams={{ keyword: searchKeyword }}
        />
        {/* <SearchTabs.Screen
          name='SearchByBooks'
          component={SearchBooksResult}
          options={{ tabBarLabel: t('searchByBooks') }}
        /> */}
      </SearchTabs.Navigator>
      :
      <ScrollView>
        <ClassicBlock />

        <CuratedTopics />

        <FairyTailsBlock />

        {/* <PopularTagsList /> */}

        <EditorsPicks />

        {/* <Audios /> */}


        <PaidUsers />
      </ScrollView>
    }
  </View>)
}

export default SearchScreen

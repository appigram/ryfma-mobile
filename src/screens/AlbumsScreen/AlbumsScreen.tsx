import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import tw from 'tailwind-rn'
import { Text, View, TextInput, Button } from '~components/Themed'

import LatestNotifications from '~components/Notifications/LatestNotifications'
import MyComments from '~components/Notifications/MyComments'
import AllComments from '~components/Notifications/AllComments'

const NotificationsTabs = createMaterialTopTabNavigator()

export default function AlbumsScreen({ navigation }) {
  const [t] = useTranslation('notification')

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
    <NotificationsTabs.Navigator
      tabBarOptions={{
        scrollEnabled: true,
        activeTintColor: '#222',
        tabStyle: { width: 'auto', paddingLeft: 12, paddingRight: 12, paddingBottom: 0, paddingTop: 0, height: 40 },
        labelStyle: { fontSize: 14, fontWeight: '900', height: 28 },
        style: { marginLeft: 8, paddingBottom: 0, marginBottom: 0 },
      }}
    >
      <NotificationsTabs.Screen
        name='LatestNotifications'
        component={LatestNotifications}
        options={{ tabBarLabel: t('notifications') }}
      />
      <NotificationsTabs.Screen
        name='MyComments'
        component={MyComments}
        options={{ tabBarLabel: t('mycomments') }}
      />
      <NotificationsTabs.Screen
        name='AllComments'
        component={AllComments}
        options={{ tabBarLabel: t('allcomments') }}
      />
    </NotificationsTabs.Navigator>
  </View>
  )
}

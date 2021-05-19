import React from 'react';
import { Feather } from '@expo/vector-icons'
import { ScrollView } from 'react-native'
import tw from 'tailwind-rn'
// import { Formik } from 'formik'
import Avatar from '~components/Common/Avatar'
import PostsListMenu from '~components/Posts/PostsListMenu'
import Slider from '~components/Home/Slider'

import { Text, View, TextInput, Button } from '~components/Themed'
import { useAuth } from '~hooks/useAuth';

//<Image source={{ uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80"}} width='64' height='64' alt="" />

export default function HomeScreen({ navigation }) {
  const { currUserId } = useAuth()
  return (<View
    style={tw('h-full pt-14')}
  >
    <View style={tw("flex flex-row items-center justify-between px-2 pb-2")}>
      <Text style={tw("text-4xl font-black text-black")} lightColor="#eee" darkColor="rgba(255,255,255,0.1)">Home</Text>
      <View style={tw("flex flex-row items-center justify-between")}>
        <Button
          icon={<Feather size={24} name='bell' />}
          style={tw("flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 mr-3 p-0")}
          onPress={() => navigation.push('Notifications')}
        />
        <Button
          icon={
            <Avatar uri='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' type='small' />}
          onPress={() => navigation.push('ProfileTab')}
          style={tw('p-0')}
        />
      </View>
    </View>

    {!currUserId && <Slider />}

    <PostsListMenu />

  </View>
  )
}

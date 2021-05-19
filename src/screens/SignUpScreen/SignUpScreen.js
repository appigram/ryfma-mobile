import React, {Component, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Button,
  Alert,
  ActivityIndicator
} from 'react-native';
import tailwind from 'tailwind-rn';

import {Feather} from '@expo/vector-icons';

export default function SignUpScreen(props) {

  const [state, setState] = React.useState({
    displayName: '',
    email: '',
    password: '',
    isLoading: false,
    first_name: '',
    last_name: ''
  })
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = React.useState('')

  const registerUser = () => {}

  if (loading) {
    return (<View style={tailwind("inset-0 absolute items-center justify-center bg-white")}>
      <ActivityIndicator size="large" color="#9E9E9E"/>
    </View>)
  }

  return (<View style={tailwind("flex-grow my-24 flex flex-col py-8 px-12 justify-center")}>
    <TextInput style={tailwind("w-full mb-2 rounded-sm p-3 bg-gray-300 border-gray-400 border-b")} placeholder="First Name" value={state.first_name} onChangeText={(val) => updateInputVal(val, 'first_name')}/>
    <TextInput style={tailwind("w-full mb-2 rounded-sm p-3 bg-gray-300 border-gray-400 border-b")} placeholder="Last Name" value={state.last_name} onChangeText={(val) => updateInputVal(val, 'last_name')}/>
    <TextInput style={tailwind("w-full mb-2 rounded-sm p-3 bg-gray-300 border-gray-400 border-b")} placeholder="Email" value={state.email} onChangeText={(val) => updateInputVal(val, 'email')}/>
    <TextInput style={tailwind("w-full mb-2 rounded-sm p-3 bg-gray-300 border-gray-400 border")} placeholder="Password" value={state.password} onChangeText={(val) => updateInputVal(val, 'password')} maxLength={15} on="on" secureTextEntry={true}/>
    <Button onPress={registerUser} title={'Sign Up'}/>

    <View style={tailwind("flex-grow mt-4 flex flex-row items-end")}>
      <Text>
        Already Registered?
      </Text>
      <Text style={tailwind("text-center text-orange-400")} onPress={() => props.navigation.push('Sign In')}>
        Click here to login
      </Text>
    </View>
  </View>);
}

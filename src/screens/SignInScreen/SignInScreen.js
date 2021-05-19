import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  KeyboardAvoidingView,
  Button,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import tailwind from 'tailwind-rn';

import {Feather} from '@expo/vector-icons';

export default function SignInScreen(props) {

  const [state, setState] = React.useState({email: '', password: '', isLoading: false})

  const [modalVisible, setModalVisible] = React.useState(false)

  const updateInputVal = (val, prop) => {

    setState({
      ...state,
      [prop]: val
    });
  }

  const forgotPassword = () => {
    setModalVisible(true)
  }

  const userLogin = () => {
    if (state.email === '' && state.password === '') {
      Alert.alert('Enter details to signin!')
    } else {
      setState({
        ...state,
        isLoading: true
      })
      Alert.alert(JSON.stringify(error.message))
      setState({
        ...state,
        errorMessage: error.message,
        isLoading: false
      })
    }
  }
  const resetPassword = () => {
    var auth = firebase.auth();
    var emailAddress = state.email;
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      // Email sent.
      Alert.alert("Password Reset Email has been sent. Check your Email")
      setTimeout(() => {
        setModalVisible(false)
        Alert.alert("Password Reset Email has been sent. Check your Email", '', [
          {
            text: 'Ok',
            onPress: () => props.navigation.navigate("AuthScreen")
          }
        ])
      }, 3000)
    }).catch(function(error) {
      // An error happened.
      Alert.alert("Error your email doesn't exist")
      console.log(error)
    });

  }

  const modalForgotPassword = (<Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => {
      Alert.alert("Modal has been closed.");
    }}>
    <KeyboardAvoidingView style={tailwind("flex flex-grow w-full h-full items-center justify-center")}>
      <View style={tailwind("rounded-lg bg-white p-6")}>
        <Text style={tailwind("mb-4 text-center text-lg")}>Reset your Password</Text>
        <TextInput style={tailwind("w-64 mb-2 rounded-sm p-3 bg-gray-300 border-gray-400 border")} placeholder="Email" value={state.email} onChangeText={(val) => updateInputVal(val, 'email')}/>
        <View style={tailwind("w-56 self-center mb-2 rounded-sm p-3")}>
          <Button color="#000000" title="Reset" textStyle={tailwind("text-white text-xl")} onPress={() => resetPassword()}/>
        </View>
        <TouchableHighlight style={{
            ...tailwind("w-full self-center p-2 rounded-lg bg-blue-800"),
            backgroundColor: "#2196F3"
          }} onPress={() => {
            setModalVisible(!modalVisible);
          }}>
          <Text style={tailwind("text-center font-semibold text-white")}>Close</Text>
        </TouchableHighlight>
      </View>
    </KeyboardAvoidingView>
  </Modal>)

  if (state.isLoading) {
    return (<View style={styles.preloader}>
      <ActivityIndicator size="large" color="#9E9E9E"/>
    </View>)
  }
  return (<View style={tailwind("flex-grow flex flex-col my-24 items-center p-12 justify-center")}>
    <TextInput style={tailwind("w-full mb-2 rounded-sm p-3 bg-gray-300 border-gray-400 border")} placeholder="Email" value={state.email} testID="email" onChangeText={(val) => updateInputVal(val, 'email')}/>
    <TextInput style={tailwind("w-full mb-5 rounded-sm p-3 bg-gray-300 border-gray-400 border")} placeholder="Password" testID="password" value={state.password} onChangeText={(val) => updateInputVal(val, 'password')} maxLength={15} secureTextEntry={true}/>
    <Button testID="login-btn" onPress={userLogin} title={'Sign In'}/>

    <Text style={tailwind("text-center mt-2 text-orange-400")} onPress={forgotPassword}>
      Forgot your password
    </Text>
    {modalForgotPassword}

    <View style={tailwind("flex-grow flex items-center justify-center flex-row")}>
      <Feather name="chat" size={24} color="black" onPress={() => props.navigation.navigate("Support")}/>
    </View>

    <View style={tailwind("flex-grow flex flex-row items-end")}>
      <Text>
        Don't have account?
      </Text>
      <Text style={tailwind("text-center text-orange-400")} onPress={() => props.navigation.push('Sign Up')}>
        Click here to Signup
      </Text>
    </View>
  </View>);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 35,
    backgroundColor: '#fff'
  },
  inputStyle: {
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    alignSelf: "center",
    borderColor: "#ccc",
    borderBottomWidth: 1
  },
  loginText: {
    color: '#3740FE',
    marginTop: 25,
    textAlign: 'center'
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  }
});

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react';
import { ColorSchemeName } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NotFoundScreen from '~screens/NotFoundScreen'
// Auth
import SignInScreen from '~screens/SignInScreen'
import SignUpScreen from '~screens/SignUpScreen'
import ResetPasswordScreen from '~screens/ResetPasswordScreen'

import { RootStackParamList, AuthStackParamList } from '~types'
import BottomTabNavigator from './BottomTabNavigator'
import LinkingConfiguration from './LinkingConfiguration'
import { Text } from '~components/Themed'

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'
// const THEME_PERSISTENCE_KEY = 'THEME_TYPE'

export default function Navigation({ colorScheme, initialState, isLoggedIn }: { colorScheme: ColorSchemeName, initialState: any }) {
  return (<NavigationContainer
    initialState={initialState}
    onStateChange={(state) =>
      AsyncStorage?.setItem(
        NAVIGATION_PERSISTENCE_KEY,
        JSON.stringify(state)
      )
    }
    linking={LinkingConfiguration}
    theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    fallback={<Text>Loading…</Text>}
  >
    <RootNavigator isLoggedIn={isLoggedIn} />
  </NavigationContainer>)
}

const AuthStack = createStackNavigator<AuthStackParamList>()
function AuthNavigator() {
  return (<AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>)
}


// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>()
function RootNavigator({ isLoggedIn }) {
  if (isLoggedIn) {
    return AuthNavigator
  } else {
    // const commonScreens = getCommon(CommonStack)
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      </Stack.Navigator>
    )
  }
}

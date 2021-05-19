import 'react-native-gesture-handler'
import 'react-native-get-random-values'

import React, { useEffect, useState } from 'react';
import AppLoading from "expo-app-loading"
import { Feather } from '@expo/vector-icons'
import {
  Platform,
  Linking,
} from 'react-native'
import {
  InitialState,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
// import { Asset } from "expo-asset"
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ActionSheetProvider } from '@expo/react-native-action-sheet'

// import { createApolloClient, initApolloClient } from "./apollo";

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import FlashMessage from "react-native-flash-message"

import { ApolloProvider } from "@apollo/client";
import { initWithClient } from '~components/meteor-react-apollo-accounts'
import client from './apollo'

import useColorScheme from '~hooks/useColorScheme';
import {useAuth} from '~hooks';
import Navigation from '~navigation';

// i18n
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

initWithClient(client)

// const client = createApolloClient();

// Wrapping a stack with translation hoc asserts we get new render on language change
// the hoc is set to only trigger rerender on languageChanged
/* const WrappedNavigation = ({colorScheme}) => {
  return <Navigation screenProps={{ t: i18n.getFixedT() }} colorScheme={colorScheme} />
}
const ReloadAppOnLanguageChange = withTranslation('common', {
  bindI18n: 'languageChanged',
  bindStore: false
})(WrappedNavigation) */

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
const THEME_PERSISTENCE_KEY = 'THEME_TYPE';

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

export default function App({ skipLoadingScreen }) {
  const [theme, setTheme] = useState(DefaultTheme)
  const [initialState, setInitialState] = useState<
    InitialState | undefined
  >()
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const colorScheme = useColorScheme()
  const {currUserId, token} = useAuth()

  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (Platform.OS !== 'web' || initialUrl === null) {
          const savedState = await AsyncStorage?.getItem(
            NAVIGATION_PERSISTENCE_KEY
          );

          const state = savedState ? JSON.parse(savedState) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        try {
          const themeName = await AsyncStorage?.getItem(THEME_PERSISTENCE_KEY);

          setTheme(themeName === 'dark' ? DarkTheme : DefaultTheme);
        } catch (e) {
          // Ignore
        }

        setLoadingComplete(true);
      }
    };

    restoreState();
  }, [])

  async function loadResourcesAndDataAsync() {
    try {
      SplashScreen.preventAutoHideAsync();
      await Font.loadAsync({
        ...Feather.font,
        'space-mono': require('~assets/fonts/SpaceMono-Regular.ttf'),
      })

      // await initApolloClient(client)
    } catch (e) {
      // We might want to provide this error information to an error reporting service
      console.warn(e);
    } finally {
      setLoadingComplete(true);
      SplashScreen.hideAsync();
    }
  }

  const handleLoadingError = () => {
    // ...
  };

  const handleFinishLoading = () => {
    setLoadingComplete(true);
  };

  if (!isLoadingComplete&& !skipLoadingScreen) {
    return (<AppLoading
      startAsync={loadResourcesAndDataAsync}
      onError={handleLoadingError}
      onFinish={handleFinishLoading}
    />)
  } else {
    return (<ActionSheetProvider>
      <I18nextProvider i18n={i18n}>
        <ApolloProvider client={client}>
          <SafeAreaProvider>
            <Navigation colorScheme={colorScheme} initialState={initialState} isLoggedIn={false} />
            <StatusBar />
            <FlashMessage position="bottom" />
          </SafeAreaProvider>
        </ApolloProvider>
      </I18nextProvider>
    </ActionSheetProvider>)
  }
}

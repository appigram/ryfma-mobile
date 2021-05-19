import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    initialRouteName: 'HomeScreen',
    screens: {
      Root: {
        screens: {
          HomeTab: {
            screens: {
              HomeScreen: 'home',
            },
          },
          BooksTab: {
            screens: {
              BooksScreen: 'books',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};

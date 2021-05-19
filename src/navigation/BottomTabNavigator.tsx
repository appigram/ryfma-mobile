import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '~constants/Colors';
import useColorScheme from '~hooks/useColorScheme';
import HomeScreen from '~screens/HomeScreen/HomeScreen';
import SearchScreen from '~screens/SearchScreen/SearchScreen';
import NewPostScreen from '~screens/NewPostScreen/NewPostScreen';
import BookmarkScreen from '~screens/BookmarkScreen/BookmarkScreen';
import ProfileScreen from '~screens/ProfileScreen/ProfileScreen';

import PostPageScreen from '~screens/PostPageScreen/PostPageScreen'
import UserPageScreen from '~screens/ProfileScreen/ProfileScreen'
import AlbumPageScreen from '~screens/AlbumsScreen/AlbumPageScreen'

import { BottomTabParamList, HomeParamList, SearchParamList, NewPostParamList, BookmarkParamList, ProfileParamList, CommonScreensParamList } from '~types';

const CommonStack = createStackNavigator<CommonScreensParamList>()
const getCommon = (CommonStack) => {
  return [
    <CommonStack.Screen
      key="postpage"
      name="PostPage"
      component={PostPageScreen}
      options={{
        headerShown: true,
        headerBackTitleVisible: false,
        title: ''
      }}
    />,
    <CommonStack.Screen key="userpage" name="UserPage" component={UserPageScreen} options={{ headerShown: true, headerBackTitleVisible: false }} />,
    <CommonStack.Screen key="albumpage" name="AlbumPage" component={AlbumPageScreen} options={{ headerShown: true, headerBackTitleVisible: false }} />,
  ]
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="HomeTab"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint, showLabel: false }}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="SearchTab"
        component={SearchNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="NewPostTab"
        component={NewPostNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="BookmarkTab"
        component={BookmarkNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Feather>['name']; color: string }) {
  return <Feather size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const HomeStack = createStackNavigator<HomeParamList>();

function HomeNavigator() {
  const commonScreens = getCommon(CommonStack)
  return (
    <HomeStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ }}
      />
      {commonScreens}
    </HomeStack.Navigator>
  );
}

const SearchStack = createStackNavigator<SearchParamList>();

function SearchNavigator() {
  const commonScreens = getCommon(CommonStack)
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerTitle: 'Search' }}
      />
      {commonScreens}
    </SearchStack.Navigator>
  );
}

const NewPostStack = createStackNavigator<NewPostParamList>();

function NewPostNavigator() {
  return (
    <NewPostStack.Navigator screenOptions={{ headerShown: false }}>
      <NewPostStack.Screen
        name="NewPostScreen"
        component={NewPostScreen}
        options={{ headerTitle: 'New Post Title' }}
      />
    </NewPostStack.Navigator>
  );
}

const BookmarkStack = createStackNavigator<BookmarkParamList>();

function BookmarkNavigator() {
  const commonScreens = getCommon(CommonStack)
  return (
    <BookmarkStack.Navigator screenOptions={{ headerShown: false }}>
      <BookmarkStack.Screen
        name="BookmarkScreen"
        component={BookmarkScreen}
        options={{ headerTitle: 'Bookmark Title' }}
      />
      {commonScreens}
    </BookmarkStack.Navigator>
  );
}

const ProfileStack = createStackNavigator<ProfileParamList>();

function ProfileNavigator() {
  const commonScreens = getCommon(CommonStack)
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerTitle: 'Profile Title' }}
      />
      {commonScreens}
    </ProfileStack.Navigator>
  );
}

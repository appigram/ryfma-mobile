import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useAuth, useSettings } from '~hooks'
import { Button } from '~components/Themed'

import PostsList from '~components/Posts/PostsList'

const HomeTabs = createMaterialTopTabNavigator()

function PostsListMenu() {
  const [t] = useTranslation('notif')
  const { showActionSheetWithOptions } = useActionSheet()
  const { currUserId } = useAuth()
  const { feedView, setFeedView } = useSettings()

  const [activeBestFilter, setActiveBestFilter] = useState('week')

  const iconSize = 16

  /* let view = <Feather name='server' size={iconSize} />
  if (activeView === 'compact') {
    view = <Feather name='align-justify' size={iconSize} />
  } */

  const handleChangeView = (viewType) => (e) => setFeedView(viewType)

  const handleActiveFilter = (filter) => (e) => setActiveBestFilter(filter)

  const renderBestFilter = () => {
    let text = t('common:thisDay')
    switch (activeFilter) {
      case 'day':
        text = t('common:thisDay')
        break
      case 'week':
        text = t('common:thisWeek')
        break
      case 'month':
        text = t('common:thisMonth')
        break
      case 'year':
        text = t('common:thisYear')
        break
    }

    return (<Button onPress={showBestFilters} title={text} />)
  }

  const showBestFilters = () => {
    showActionSheetWithOptions(
      {
        options: [t('common:cancel'), t('common:thisYear'), t('common:thisMonth'), t('common:thisWeek'), t('common:thisDay')],
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          handleChangeFilter('year')
        } else if (buttonIndex === 2) {
          handleChangeFilter('month')
        } else if (buttonIndex === 3) {
          handleChangeFilter('week')
        } else if (buttonIndex === 4) {
          handleChangeFilter('day')
        }
      }
    )
  }

  const showViewMode = () => {
    showActionSheetWithOptions(
      {
        options: [t('common:cancel'), t('common:compactView'), t('common:defaultView')],
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          handleChangeView('compact')
        } else if (buttonIndex === 2) {
          handleChangeView('default')
        }
      }
    )
  }

  return (<>
    <HomeTabs.Navigator
      initialRouteName="HomeTab"
      tabBarOptions={{
        scrollEnabled: true,
        activeTintColor: '#222',
        tabStyle: { width: 'auto', paddingLeft: 12, paddingRight: 12, paddingBottom: 0, paddingTop: 0, height: 40 },
        labelStyle: { fontSize: 14, fontWeight: '900', height: 28 },
        style: { marginLeft: 8, paddingBottom: 0, marginBottom: 0 },
      }}
    >
      {!!currUserId && <HomeTabs.Screen
        name='HomeTab'
        component={PostsList}
        options={{ tabBarLabel: t('common:forYouTab') }}
        initialParams={{ type: 'following', userId: currUserId }}
      />}
      <HomeTabs.Screen
        name='HotTab'
        component={PostsList}
        options={{ tabBarLabel: t('common:hotTab') }}
        initialParams={{ type: 'commented', duration: 'month' }}
      />
      <HomeTabs.Screen
        name='LatestTab'
        component={PostsList}
        options={{ tabBarLabel: t('common:latestTab') }}
        initialParams={{ type: 'latest' }}
      />
      <HomeTabs.Screen
        name='BestTab'
        component={PostsList}
        options={{ tabBarLabel: t('common:bestTab') }}
        initialParams={{ type: 'popular', duration: activeBestFilter }}
      />
      <HomeTabs.Screen
        name='PicksTab'
        component={PostsList}
        options={{ tabBarLabel: t('common:picks') }}
        initialParams={{ type: 'picks', duration: activeBestFilter }}
      />
      {/* <HomeTabs.Screen
        name='LiveTab'
        component={LatestPosts}
        options={{ tabBarLabel: t('common:liveTab') }}
      /> */}
    </HomeTabs.Navigator>
    {/* isActive === 'best' && renderBestFilter()}
    <Button onPress={showViewMode} title={view} /> */}
  </>)
}

export default PostsListMenu

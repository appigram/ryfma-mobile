import React, { useEffect } from 'react';
import UserPagePlaceholder from '~components/Users/Common/UserPagePlaceholder'
import NotFoundUser from '~components/Users/Common/NotFoundUser'
import BlockedUser from '~components/Users/Common/BlockedUser'
import UserPage from '~components/Users/UserPage'
import { useQuery } from '@apollo/client/react'
import getUser from '~graphqls/queries/User/getUser'

export default function ProfileScreen({ navigation, route }) {
  const { username, forceFetch } = route.params

  const { loading, error, data } = useQuery(getUser, {
    variables: {
      username: username,
      noCache: !!forceFetch
    },
    fetchPolicy: forceFetch ? 'network-only' : 'cache-first'
  })

  if (loading) {
    return <UserPagePlaceholder />
  }

  if (error || !data.getUser) {
    return (<NotFoundUser username={username} />)
  }

  if (data.getUser.isDeleted) {
    return <Redirect to={data.getUser.redirectTo} />
  }

  const user = data.getUser
  const isBlocked = user.isBlocked

  if (isBlocked) {
    return <BlockedUser username={username} />
  }

  return (
    <UserPage user={user} navigation={navigation} route={route} />
  )
}
import React from 'react'
import { useTranslation } from 'react-i18next'
import Link from '~components/Common/Link'
import GET_PAID_USERS_FULL from '~graphqls/queries/Common/getPaidUsersFull'
import { useQuery } from '@apollo/client/react'
import Avatar from '~components/Common/Avatar'

function PremiumOnlyPage () {
  const [t] = useTranslation('home')
  // Queries and Mutations
  const { loading, error, data } = useQuery(GET_PAID_USERS_FULL, {
    variables: {
      limit: 100
    }
  })
  let premiumUsers = []

  if (data !== undefined) {
    premiumUsers = data.getPaidUsersFull
  }

  return (<View className='content-not-allowed premium'>
    <View className='header'>
      <img src='https://cdn.ryfma.com/defaults/icons/premium-lock-min.png' className='welcome-img' />
      <h1>{t('enablePremiumProhibitedHeader')}</h1>
      <p>{t('enablePremiumProhibitedDesc')}</p>
    </View>
    <Link to='/upgrade' target='_blank' className='ui button warning'>{t('enablePremiumButton')}</Link>
    <View className='content'>
      <p>{t('enablePremiumProhibitedUsers')}</p>
      <View className='premium-users'>
        {premiumUsers && premiumUsers.map(user => <Avatar
          image={user.profile.image}
          username={user.username}
          name={user.profile.name}
          roles={user.roles}
          noBadge
          type='middle'
        />)}
      </View>
    </View>
    <Link to='/upgrade' target='_blank' className='ui button warning'>{t('enablePremiumButton')}</Link>
  </View>)
}

export default PremiumOnlyPage

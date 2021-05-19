import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
// import AdvBanner from '~components/Adv/AdvBanner'
import { Feather } from '@expo/vector-icons'
import { Share } from 'react-native'
import { useActionSheet } from '@expo/react-native-action-sheet'
import tw from 'tailwind-rn'
import Link from '~components/Common/Link'
import UserLatestPosts from '~components/Users/UserLatestPosts'
import Loader from '~components/Common/Loader'
import { Text, View, Image, TextInput, Button } from '~components/Themed'
import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '~hooks'

import getAlbumInfoFull from '~graphqls/queries/Album/getAlbumInfoFull'
import increaseAlbumViewCount from '~graphqls/mutations/Album/increaseAlbumViewCount'


function AlbumPageScreen({ route, navigation }) {
  const [t] = useTranslation('album')
  const { albumId, albumSlug, refresh } = route.params
  const { showActionSheetWithOptions } = useActionSheet()
  const { currUserId } = useAuth()

  const { loading, error, data, refetch } = useQuery(getAlbumInfoFull, {
    variables: {
      userId: currUserId,
      albumId: albumId
    },
    fetchPolicy: refresh ? 'network-only' : 'cache-and-network'
  })

  const [increaseAlbumViewCountMutation] = useMutation(increaseAlbumViewCount)

  useEffect(() => {
    if (data?.album) {
      navigation.setOptions({
        title: <View style={tw(`flex items-center overflow-ellipsis bg-transparent`)}>
          <Text numberOfLines={1} style={tw('text-xs font-bold')}>Ryfma.com {/* post.author.profile.name */}</Text>
          <Text numberOfLines={1} style={tw('text-xs')}>{data.album.title}</Text>
        </View>,
        headerRight: () => (<Button
          key={1}
          icon={<Feather name='more-horizontal' size={20} />}
          onPress={handleOpenActions}
          style={tw('py-2 px-3 bg-transparent')}
        />)
      })
    }
  }, [navigation, route, data])

  useEffect(() => {
    try {
      if (albumId) {
        increaseAlbumViewCountMutation({ variables: { _id: albumId } })
      }
    } catch (error) {
      // console.log(error)
    }
  }, [])

  const handleOpenActions = () => {
    const isOwner = currUserId === data.album.userId
    let options = [
      t('common:share'),
      t('common:cancel')
    ]

    if (isOwner) {
      options = [
        t('common:edit'),
        ...options
      ]
    }

    // const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === 1) {
          // cancel action
        } else if (buttonIndex === 0) {
          if (isOwner) {
            navigation.push('AlbumEditPage', { albumId: album._id })
          } else {
            handleShare()
          }
        } else if (buttonIndex === 1) {
          // changeView('compact')
        }
      },
    )
  }

  const handleShare = async () => {
    const album = data.album
    const seoTitle = t('seoAlbumTitle') + album.title
    const seoDesc = album.description ? album.description + ' - ' + album.author.profile.name : seoTitle + ' - ' + album.author.profile.name + t('seoAlbumDesc')
    try {
      const result = await Share.share({
        title: seoTitle,
        url: `https://ryfma.com/album/${album._id}/${album.slug}`,
        message: seoDesc
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (err) {
      console.log(err.message)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (error || !data.album) {
    return (<ErrorView refetch={refetch} error={error} />)
  }

  const album = data.album

  const albumHeader = (<View style={tw('flex items-center')}>
    {album.coverImg && <Image source={{ uri: album.coverImg }} style={tw('w-full h-36')} />}
    <Text style={tw('my-4')}>{album.description}</Text>
    <Link page='UserPage' params={{ username: album.author.username }}>
      <Text style={tw('font-semibold')}>{album.author.profile.name}</Text>
    </Link>
  </View>)

  if (album.postCount === 0) {
    return (<View style={tw('items-center mx-4 my-8')}>
      <Text style={tw('font-bold')}>
        {t('emptyAlbum')}
      </Text>
    </View>)
  }

  return (<View>
    {/* <AdvBanner adType='toplong'/> */}

    <UserLatestPosts
      route={{
        params: {
          userId: album.author._id,
          albumId: album._id,
          isPersonal: album.isPersonal,
          limit: 32,
          topComponent: albumHeader
        }
      }}
    />
    {/* <AdvBanner adType='multiList'/> */}
  </View>)
}

export default AlbumPageScreen

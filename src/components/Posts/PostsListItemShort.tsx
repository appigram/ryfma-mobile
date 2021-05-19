import React from 'react'
import * as Sharing from 'expo-sharing'
import { useTranslation } from 'react-i18next'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import Link from '~components/Common/Link'
import { View, Text, Button, Image } from '~components/Themed'
import TimeAgoExt from '~components/Common/TimeAgoExt'
import videoLinkParser from '~utils/helpers/videoLinkParser'
import nFormatter from '~utils/helpers/nFormatter'

function PostsListItemShort({ post, isPromo, isOwner }) {
  const [t] = useTranslation('post')
  const navigation = useNavigation()
  const { showActionSheetWithOptions } = useActionSheet()

  const postLikes = nFormatter(post.likeCount || 0)
  const postComments = nFormatter(post.commentsCount || 0)
  const postViews = nFormatter(post.viewCount || 0)

  /* if (isPromo) {
    return (<Link itemProp='url' to={`/me/promote/${post._id}`} className='item post-list-item short-item' itemScope itemType='https://schema.org/Article'>
      <View className='content'>
        <View className='post-title'>
          <View className='post-title-info'>
            <View className='post-title-header'>
              <Text itemProp='ui header name'>
                {post.title}
              </Text>
              <TimeAgoExt date={post.createdAt} />
            </View>
          </View>
        </View>
      </View>
    </Link>)
  } */

  const handleShareNative = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      // alert(`Uh oh, sharing isn't available on your platform`);
      return;
    }
    await Sharing.shareAsync(`https://ryfma.com/p/${post._id}/${post.slug}`)
  }

  const showExtraActions = () => {
    showActionSheetWithOptions(
      {
        options: isOwner ? [t('common:cancel'), t('common:edit'), t('common:shareSocial')] : [t('common:cancel'), t('common:shareSocial')],
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          navigation.push('PostEdit', { postId: post._id, slug: post.slug })
        } else if (buttonIndex === 2) {
          handleShareNative()
        }
      }
    )
  }


  let coverImg = post.coverImg || 'https://cdn.ryfma.com/defaults/icons/default_back_full.jpg'
  if (post.videoLink) {
    const videoLink = videoLinkParser(post.videoLink)
    coverImg = videoLink.hqImg
  }

  const badges = []
  if (post.isEditorsPick) {
    badges.push(<Image source={{ uri: 'https://cdn.ryfma.com/defaults/icons/award.svg' }} width='14' height='14' />)
  }

  if (post.isAdultContent) {
    badges.push(<Text>18+</Text>)
  }
  if (post.paymentType === 1) {
    badges.push(<Feather name='users' size={14} />)
  }
  if (post.paymentType === 2) {
    badges.push(<Feather name='dollar-sign' size={14} />)
  }
  if (post.isPromoted) {
    badges.push(<Feather name='star' size={14} />)
  }
  if (post.videoLink) {
    badges.push(<Feather name='video' size={14} />)
  }
  if (post.audioFiles && post.audioFiles.length > 0) {
    badges.push(<Feather name='headphones' size={14} />)
  }

  return (<View className='post-info'>
    <Link page='PostPage' params={{ postId: post._id, postSlug: post.slug }}>
      <Text>
        {post.title}
      </Text>
      <View className='badges'>
        {badges}
      </View>
    </Link>

    <View className='meta'>
      <Link page='UserPage' params={{ username: post.author.username }}>u/{post.author.username}</Link>
      <Text className='dot-divider'>·</Text>
      <TimeAgoExt date={post.createdAt} />
      {post.album && (
        <View className='post-from-album'>
          <Text className='dot-divider'>·</Text>
          {t('fromAlbum')}
          <Link page='AlbumPage' params={{ albumId: post.album._id, albumSlug: post.album.slug }}>
            {post.album.title}
          </Link>
        </View>
      )}
    </View>

    <View className='post-stats'>
      {post.likeCount > 0 && <View><Feather name='heart' size={14} /><Text>{postLikes}</Text></View>}
      {post.commentsCount > 0 && <View><Feather name='message-circle' size={14} /><Text>{postComments}</Text></View>}
      {post.viewCount > 0 && <View><Feather name='eye' size={14} /><Text>{postViews}</Text></View>}
      <Button onPress={showExtraActions} icon={<Feather name='more-horizontal' size={14} />} />
    </View>

  </View>
  )
}

export default PostsListItemShort

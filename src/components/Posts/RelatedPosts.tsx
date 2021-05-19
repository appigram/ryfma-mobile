import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useQuery } from '@apollo/client/react'
import { View, Image, Text } from '~components/Themed'
import Avatar from '~components/Common/Avatar'
import Link from '~components/Common/Link'
import tw from 'tailwind-rn'
import getRelatedPosts from '~graphqls/queries/Post/getRelatedPosts'
// import AdvBanner from '~components/Adv/AdvBanner'

function RelatedPosts ({ type, post }) {
  const [t] = useTranslation('post')
  const tagsIds = post.tags.map(item => item._id)

  const {loading, error, data} = useQuery(getRelatedPosts, {
    skip: !post._id,
    variables: {
      postId: post._id,
      tags: tagsIds
    }
  })

  if (loading) {
    return <View />
  }

  if (error) {
    return <View>Error: {error.message}</View>
  }

  const relatedPosts = data.relatedPosts

  if (relatedPosts.length === 0) {
    return null
  }

  const tags = post.tags

  const renderPostItem = (item, isOdd = false) => {
    let similarTag = ''

    for (let i = 0; i < tags.length; i++) {
      for (let j = 0; j < item.tags.length; j++) {
        if (tags[i]._id === item.tags[j]._id) {
          similarTag = tags[i].name
          break
        }
      }
    }

    return (<View key={item._id} style={tw(`w-72 pl-4`)}>
      <Link page='PostPage' params={{ postId: item._id, slug: item.slug }}>
        <Image source={{ uri: item.coverImg || 'https://cdn.ryfma.com/defaults/icons/default_back_full.jpg'}} style={tw('w-full h-32 rounded-lg mb-2')} />
        {similarTag ? <Text style={tw('text-xs text-gray-600')}>{t('similarTag')}{similarTag}</Text> : <Text style={tw('text-xs text-gray-600')}>{t('youCanLike')}</Text>}
        <Text numberOfLines={1} style={tw('text-base font-bold mt-1 mb-2')}>{item.title}</Text>
      </Link>
      <Link page='UserPage' params={{ username: item.author.username }}>
        <View style={tw('flex flex-row items-center')}>
          <Avatar
            uri={item.author.profile.image}
            type='small'
            username={item.author.username}
            name={item.author.profile.name}
            roles={item.author.roles}
            type='small'
            isComment
            size={8}
            style='mr-2'
          />
          <Text numberOfLines={2}>{item.author.profile.name}</Text>
        </View>
      </Link>
    </View>)
  }

  return (<>
    <Text style={tw('text-base font-black mt-4 mb-2 px-4')}>
      {t('relatedPosts')}
    </Text>
    <View style={tw('flex h-64 w-full')}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {relatedPosts.map(item => renderPostItem(item))}
      </ScrollView>
    </View>
  </>)
}

export default RelatedPosts

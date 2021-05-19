import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import getNextPrevPosts from '~graphqls/queries/Post/getNextPrevPosts'
import { View, Image, Text } from '~components/Themed'
import Link from '~components/Common/Link'
import tw from 'tailwind-rn'

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
]

function ReadNextPrevPosts({ type, postId, postCreated, isAMP }) {
  const [t] = useTranslation('post')

  const { loading, error, data } = useQuery(getNextPrevPosts, {
    skip: !postId,
    variables: {
      postId,
    }
  })

  if (loading) {
    return <View />
  }

  if (error) {
    return <View>Error: {error.message}</View>
  }

  const readNextPrevPosts = data.getNextPrevPosts

  if (readNextPrevPosts.length === 0) {
    return null
  }

  return (<>
    <Text style={tw('text-base font-black mt-2 mb-3 px-4')}>
      {t('readNextPrevPosts')}
    </Text>
    <View style={tw('flex flex-row')}>
      {readNextPrevPosts.map((post, index) => {
        const pubDate = new Date(post.postedAt)
        const publicationDate = pubDate.getDate() + ' ' + MONTHS[pubDate.getMonth()] + ' ' + pubDate.getFullYear()
        let pubStatus = t('newer')
        if (post.postedAt < postCreated) {
          pubStatus = t('older')
        }
        return (<View key={post._id} style={tw(`w-1/2 ${index === 0 ? 'pl-4 pr-1' : 'pr-4 pl-1'}`)}>
          <Link page='PostPage' params={{ postId: post._id, slug: post.slug }}>
            <Image source={{ uri: post.coverImg || 'https://cdn.ryfma.com/defaults/icons/default_back_full.jpg'}} style={tw('w-full h-20 rounded-lg')} />
            <Text numberOfLines={1} style={tw('text-sm font-bold my-1')}>{post.title}</Text>
            <Text style={tw('text-xs text-gray-600')}>{publicationDate}&nbsp;({pubStatus})</Text>
            </Link>
          </View>)
      })}
    </View>
  </>
  )
}

export default ReadNextPrevPosts

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import tw from 'tailwind-rn'
import { FlatList } from 'react-native'
import Link from '~components/Common/Link'
// import Stories from '~components/Common/Stories';
import EmptyView from '~components/Common/EmptyView'
import ErrorView from '~components/Common/ErrorView'
import Loader from '~components/Common/Loader'
import PostPlaceholder from './PostPlaceholder'
import PostsListItem from './PostsListItem'
import PostsListItemShort from './PostsListItemShort'
// /import AdvBanner from '~components/Adv/AdvBanner'
// import PostPromotion from './PostPromotion'
import { useQuery } from '@apollo/client/react'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '~hooks'
import { View, Text, Button } from '~components/Themed'
import getLatestPosts from '~graphqls/queries/Post/getLatestPosts'

const POSTS_PER_PAGE = 16
const CHECK_POSTS_TIMEOUT = 1000 * 60 * 10 // 10 min

function PostsList({ route, ...rest }) {
  const mergedParams = {...rest, ...route?.params}
  const { topComponent = null, viewMode, hideAds, userId, albumId, isPromo, type, tagId, festId, duration, withImage, personal = false, keyword, status, showNewPostsButton = false, skip = 0, limit = POSTS_PER_PAGE, forceFetch = false } = mergedParams
  const [t] = useTranslation('post')
  const { currUser, currUserId } = useAuth()
  const [skipPosts, setSkipPosts] = useState(POSTS_PER_PAGE)
  const [infinityLoading, setInfinityLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [checkPostsAgain, setCheckPostsAgain] = useState(false)
  let postsFetchedTime = new Date()

  const { loading, error, data, refetch, fetchMore } = useQuery(getLatestPosts, {
    variables: {
      type,
      userId,
      albumId,
      tagId,
      festId,
      duration,
      withImage,
      personal,
      keyword,
      status,
      skip,
      limit: viewMode === 'compact' ? limit * 2 : limit
    },
    fetchPolicy: forceFetch ? 'network-only' : 'cache-first'
  })

  /* useEffect(() => {
    if (showNewPostsButton) {
      const checkPostsInterval = setInterval(() => {
        const currDate = new Date()
        const diffCheckTime = currDate.getTime() - postsFetchedTime.getTime()
        setCheckPostsAgain(diffCheckTime > CHECK_POSTS_TIMEOUT)
      }, CHECK_POSTS_TIMEOUT)

      return () => clearInterval(checkPostsInterval)
    }
  }, []) */

  const fetchMorePosts = () => {
    if (infinityLoading) {
      fetchMore({
        query: getLatestPosts,
        variables: {
          type,
          userId,
          albumId,
          tagId,
          festId,
          withImage,
          duration,
          personal,
          keyword,
          status,
          skip: skipPosts,
          limit: viewMode === 'compact' ? limit * 2 : limit
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newPosts = fetchMoreResult.posts
          setSkipPosts(skipPosts + (viewMode === 'compact' ? limit * 2 : limit))
          setInfinityLoading(newPosts.length === limit)
          postsFetchedTime = new Date()
          return newPosts.length
            ? Object.assign({}, previousResult, {
              posts: [...previousResult.posts, ...newPosts]
            })
            : previousResult
        }
      })
    }
  }

  const handlePullToRefresh = () => {
    console.log('handlePullToRefresh fired!')
    setSkipPosts(0)
    setInfinityLoading(true)
    setIsRefreshing(true)
    refetch()
    setIsRefreshing(false)
  }

  const handleRefetchButton = () => {
    postsFetchedTime = new Date()
    setCheckPostsAgain(false)
    refetch()
  }

  if (loading || !data) {
    postsFetchedTime = new Date()
    return (<FlatList
      data={[0, 1, 2, 3, 4]}
      renderItem={() => <PostPlaceholder />}
      keyExtractor={item => `p_${item}`}
    />)
  }

  if (error) {
    return (<ErrorView refetch={refetch} />)
  }

  const posts = data.posts

  let sponsorOf = []
  if (currUser) {
    if (currUser.sponsorOf) {
      sponsorOf = currUser.sponsorOf
    }
  }

  const renderPostItem = ({ item }) => {
    const isOwner = currUser ? currUser._id === item.author._id : false
    const coins = currUser ? currUser.coins : 0
    const postItem = viewMode === 'compact'
      ? <PostsListItemShort key={item._id} post={item} currCoins={coins} userId={userId} isPromo={isPromo} isOwner={isOwner} sponsorOf={sponsorOf} />
      : <PostsListItem key={item._id} post={item} currCoins={currUser ? currUser.coins : 0} userId={userId} isOwner={isOwner} sponsorOf={sponsorOf} postType={type} /> 

    /* let showAdsBlock = (index === 2) || (index % 5 === 0 && index > 0)
    let showPromoBlock = (index === 3 && !hideAds) || (index % 7 === 0 && index > 0 && !hideAds)
    if (albumId) {
      showAdsBlock = (index === 3) || (index % 15 === 0 && index > 0)
    }

    if (viewMode === 'compact'){
      showAdsBlock = (index === 3) || (index % 15 === 0 && index > 0)
      showPromoBlock =  (index === 4 && !hideAds) || (index % 16 === 0 && index > 0 && !hideAds)
    } */

    return (<>
      {postItem}
      {/* showPromoBlock && <PostPromotion /> */}
    </>
    )
  }

  const renderFooter = () => {
    if (!infinityLoading) return null;

    return (
      <Loader />
    );
  }

  const renderEmptyComponent = () => {
    if (posts.length === 0 && type === 'following') {
      return <>
        <EmptyView iconName='file-text' header={t('noPosts')} text={t('postNotFoundFollowing')} />
        <Link page='SearchTab'>
          <Feather name='search' />
          <Text>{t('findAuthors')}</Text>
        </Link>
      </>
    } else {
      return <EmptyView iconName='file-text' header={t('noPosts')} text={userId ?
        (currUserId === userId ?
          <Link page='NewPost'>{t('writeFirstPost')}</Link> : <Text>{t('userNoPosts')}</Text>)
        :
        <Text>{t('postNotFound')}</Text>
      }
      />
    }
  }

  // TODO: remove className's
  // TODO: add ScrollView
  return (
    <View>
      {checkPostsAgain && <Button onPress={handleRefetchButton}>{t('common:newPosts')}</Button>}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item._id}

        onEndReached={fetchMorePosts}
        onEndReachedThreshold={0.55}
        initialNumToRender={5}
        windowSize={5}
        maxToRenderPerBatch={7}
        updateCellsBatchingPeriod={30}
        removeClippedSubviews={false}

        onRefresh={handlePullToRefresh}
        refreshing={isRefreshing}

        ListHeaderComponent={topComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={tw('py-2')}
      />
    </View>
  )
}

export default PostsList

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useScrollToTop } from '@react-navigation/native'
import { Animated, StyleSheet, Share, useWindowDimensions } from 'react-native'
import { WebView } from 'react-native-webview'
import { useActionSheet } from '@expo/react-native-action-sheet'
import tw from 'tailwind-rn'
import { getI18n, useTranslation } from 'react-i18next'
import { Feather } from '@expo/vector-icons'
import HTMLView from 'react-native-htmlview'
import { Text, View, Button, Image } from '~components/Themed'
import Link from '~components/Common/Link'
// import RCoin from '~shared/svg/rcoin'
import Notification from '~components/Common/Notification'
import UserInfoItem from '~components/Users/UserInfoItem'
import CommentsWrapper from '~components/Comments/CommentsWrapper'
import PostTags from './PostTags'
// import AdvBanner from '~components/Adv/AdvBanner'
import ReadNextPrevPosts from './ReadNextPrevPosts'
import RelatedPosts from './RelatedPosts'
import { useMutation } from '@apollo/client/react'
import { useAuth } from '~hooks'
import likePost from '~graphqls/mutations/Post/likePost'
import unLikePost from '~graphqls/mutations/Post/unLikePost'
import FOLLOW_USER from '~graphqls/mutations/User/followUser'
import INCREASE_POST_VIEW_COUNT from '~graphqls/mutations/Post/increasePostViewCount'
import ALLOW_ADULT_CONTENT from '~graphqls/mutations/Common/allowAdultContent'
// import linkifyText from '~utils/helpers/linkifyText'
import videoLinkParser from '~utils/helpers/videoLinkParser'
import nFormatter from '~utils/helpers/nFormatter'

import ReactGA from 'react-ga'
import PostItemShort from '~components/Contests/Posts/PostItemShort'

function PostPageContent({ post, navigation, route, ...rest }) {
  const [t] = useTranslation(['post', 'comment'])
  const { showActionSheetWithOptions } = useActionSheet()
  const { currUser, currUserId } = useAuth()

  const window = useWindowDimensions()
  const ref = useRef(null);

  useScrollToTop(ref)

  const [likes, setLikes] = useState(post.likeCount)
  const [liked, setLiked] = useState(post.liked)
  const [currUserLikes, setCurrUserLikes] = useState(post.currUserLikes === 0 && liked ? 1 : post.currUserLikes)
  const [totalLikes, setTotalLikes] = useState(currUserLikes === 0 && liked ? 1 : currUserLikes)
  const [savedCount, setSavedCount] = useState(post.savedCount)
  const [saved, setSaved] = useState(post.saved)
  const [initSelectedAlbums, setInitSelectedAlbums] = useState(post.albums || [])
  const [initUnselectedAlbums, setInitUnselectedAlbums] = useState([])
  const [isAdultContent, setIsAdultContent] = useState(post.isAdultContent)
  const [paymentType, setPaymentType] = useState(post.paymentType)
  const [hearts, setHearts] = useState([])
  const [isBought, setIsBought] = useState(post.isBought)
  const [isEditorsPick, setIsEditorsPick] = useState(post.isEditorsPick)
  const [isAllowAdultContent, setIsAllowAdultContent] = useState(currUserId ? currUser.isAllowAdultContent : false)
  const [isPaid, setIsPaid] = useState(paymentType === 2)
  const [isFollowersOnly, setIsFollowersOnly] = useState(paymentType === 1)
  const [isSponsorsOnly, setIsSponsorsOnly] = useState(paymentType === 3)
  const [isFollowing, setIsFollowing] = useState(post.author.isFollowing || false)

  // Queries and Mutations
  const [likePostMutation] = useMutation(likePost)
  const [unLikePostMutation] = useMutation(unLikePost)
  const [increasePostViewCountMutation] = useMutation(INCREASE_POST_VIEW_COUNT)
  const [allowAdultContentMutation] = useMutation(ALLOW_ADULT_CONTENT)
  const [followUserMutation] = useMutation(FOLLOW_USER)

  const yOffset = useRef(new Animated.Value(0)).current;
  const headerOpacity = !!post.coverImg ? yOffset.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  }) : null

  useEffect(() => {
    navigation.setOptions({
      title: <View style={tw(`flex items-center overflow-ellipsis bg-transparent`)}>
        <Text numberOfLines={1} style={tw('text-xs font-bold')}>Ryfma.com {/* post.author.profile.name */}</Text>
        <Text numberOfLines={1} style={tw('text-xs')}>{post.title}</Text>
      </View>,
      headerStyle: {
        opacity: headerOpacity
      },
      headerBackground: () => (<Animated.View
        style={{
          backgroundColor: "white",
          ...StyleSheet.absoluteFillObject,
          opacity: headerOpacity,
        }}
      />
      ),
      headerTransparent: !!post.coverImg,
      headerRight: () => (<Button
        key={1}
        icon={<Feather name='more-horizontal' size={20} />}
        onPress={handleOpenActionSheet}
        style={tw('py-2 px-3 bg-transparent')}
      />)
    })
  }, [headerOpacity, navigation, route, post])

  /* useEffect(() => {
    try {
      if (post) {
        increasePostViewCountMutation({ variables: { _id: post._id, userId: post.userId, status: post.status } })
      }
    } catch (err) {}
  }, []) */

  useEffect(() => {
    if (currUserLikes > 0 && currUserLikes !== post.currUserLikes) {
      // Create a timeout if queueClaps was bigger than 0
      const timeout = setTimeout(() => {
        // After 2000ms, send the network request and then
        // update the claps based on the network, reset
        // queueClaps
        handleLikePost()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [currUserLikes])

  const handleLikePost = async () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы поставить лайк')
      return
    }
    const newLikes = currUserLikes > 50 ? 50 : currUserLikes
    try {
      await likePostMutation({
        variables: {
          _id: post._id,
          title: post.title,
          userId: post.userId,
          totalLikes: newLikes,
          likes: currUserLikes - totalLikes
        }
      })
      ReactGA.event({
        category: 'Post',
        action: 'PostLiked',
        label: `PostLiked: ${post.userId}, pId: ${post._id}, likes: ${newLikes}`,
        value: newLikes
      })
      setLiked(true)
      setHearts([])
      setTotalLikes(newLikes)
      // Notification.success(t('postLiked'))
    } catch (error) {
      Notification.error(error)
    }
  }

  const handleUnlikePost = async () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы добавить в избранное')
      return
    }
    const newLikes = currUserLikes > 50 ? 50 : currUserLikes
    try {
      await unLikePostMutation({
        variables: {
          _id: post._id,
          userId: post.userId,
          likes: newLikes
        }
      })
      ReactGA.event({
        category: 'Post',
        action: 'PostUnliked',
        label: `PostUnliked: ${post.userId}, pId: ${post._id}, likes: ${newLikes}`,
        value: newLikes
      })
      setLiked(false)
      setCurrUserLikes(0)
      setLikes(likes - newLikes)
    } catch (error) {
      Notification.error(error)
    }
  }

  const handleCreateLikes = () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы поставить лайк')
      return
    }

    const b = Math.floor(Math.random() * 1000 + 1)
    const d = ['flowOne', 'flowTwo', 'flowThree']
    const a = ['colOne', 'colTwo', 'colThree', 'colFour', 'colFive', 'colSix']
    const c = (Math.random() * (1.6 - 1.2) + 1.2).toFixed(1)

    hearts.push({
      id: 'part-' + b,
      content: (
        <View
          key={'part-' + b}
          className={`heartAnim part-${b}`}
          style={{
            display: 'block',
            fontSize: Math.floor(Math.random() * (50 - 22) + 22) + 'px',
            animation: d[Math.floor(Math.random() * 3)] + ' ' + c + 's linear'
          }}
        >
          <i
            aria-hidden='true' className={`icon heart ${a[Math.floor(Math.random() * 6)]}`}
          />
        </View>
      )
    })

    setHearts(hearts)
    setCurrUserLikes(currUserLikes + 1)

    setTimeout(() => {
      const index = hearts.map((x) => x.id).indexOf('part-' + b)

      hearts.splice(index, 1)
      setHearts(hearts)
    }, c * 900)
  }

  const handleSetNewLike = () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы поставить лайк')
      return
    }
    if (currUserLikes < 50) {
      handleCreateLikes()
      setLikes(likes + 1)
      // handleLikePost()
    }
  }

  const handleOpenReportForm = async () => {
    navigation.push('ReportForm', { objectId: post._id, objectType: 'post' })
  }

  const handleAdultContent = async () => {
    try {
      if (currUserId) await allowAdultContentMutation()
      setIsAllowAdultContent(true)
    } catch (error) {
      Notification.error(error)
    }
  }

  const handleFollowersOnly = async () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы подписываться на других авторов')
      return
    }
    try {
      const followed = await followUserMutation({ _id: post.author._id })
      setIsFollowersOnly(followed)
      setIsFollowing(true)
    } catch (error) {
      Notification.error(error)
    }
  }

  const handlePaid = (coins, amount) => async () => {
    if (!currUserId) {
      navigation.push('LoginForm', { referer: `/p/${post._id}/${post.slug}` })
    } else {
      navigation.push('PaymentForm', {
        post: post
      })
    }
  }

  const handleSponsorship = async () => {
    if (isSponsorsOnly && !isOwner && post.author.tariffs) {
      navigation.push('DonationForm', {
        user: post.author,
        isOwner: isOwner
      })
    }
  }

  const handleAddToAlbum = async () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы добавить в избранное')
      return
    }
    navigation.push('AddToAlbum', {
      postId: post._id,
      initSelectedAlbums: initSelectedAlbums,
      initUnselectedAlbums: initUnselectedAlbums
    })
  }

  const copyToClipboard = () => {
    console.log('copyToClipboard event')
    if (!isOwner && (isFollowersOnly || isPaid || isSponsorsOnly)) {
      return
    }
    const postLink = `https://ryfma.com/p/${post._id}/${post.slug}`
    //Get the selected text and append the extra info
    const selection = window.getSelection();
    const pagelink = "<br/><br/> Источник:&nbsp;" + postLink
    let copytext = pagelink
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
      const clonedSelection = range.cloneContents()
      const div = document.createElement('div')
      div.appendChild(clonedSelection)
      copytext = div.innerHTML.replace(/<p>/gi, '').replace(/<\/p>/gi, '<br/>') + pagelink
    }

    // const copytext = selection ? selection.getRangeAt(0).cloneContents() + pagelink : pagelink
    //Create a new div to hold the prepared text
    const newDiv = document.createElement('div')

    //hide the newly created container
    newDiv.style.position = 'absolute'
    newDiv.style.left = '-99999px'

    //insert the container, fill it with the extended text, and define the new selection
    document.body.appendChild(newDiv)
    newDiv.innerHTML = copytext
    selection.selectAllChildren(newDiv)

    setTimeout(() => {
      document.body.removeChild(newDiv)
    }, 100)
  }

  const handleShowSendGift = async () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы отправлять подарки')
      return
    }
    navigation.push('SendGift', {
      userId: post.userId,
      objectType: 'post',
      objectId: post._id,
      objectSlug: post.slug
    })
  }

  const handleOpenActionSheet = () => {
    const defaultOptions = [t('common:sendReport'), t('common:shareSocial'), t('common:cancel')]
    let options = []
    if (isOwner) {
      options = [
        // t('common:delete')
        t('common:copyLink')
      ]
      if (!post.isPromoted) {
        options = [
          // t('common:delete')
          t('common:edit'),
          t('common:copyLink')
        ]
      }
    }

    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    options = [...options, ...defaultOptions]

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === 3) {
          // cancel action
        } else if (buttonIndex === 2) {
          handleShare()
        } else if (buttonIndex === 1) {
          navigation.push('PostEditPage', { postId: post._id })
        } else if (buttonIndex === 0) {
          handleOpenReportForm()
        }
      },
    )
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: `📗${post.seoTitle} (${post.author.profile.name}) - ${t('seoTitle')}${postTags.includes('сказка') ? ' ' + t('seoTitleFairytail') : ''}${postTags.includes('стихи') ? ' ' + t('seoTitlePoem') : ''} ${t('seoTitleOnRyfma')}`,
        url: `https://ryfma.com/p/${post._id}/${post.slug}`,
        message: `${post.excerpt.replace(/<br\s\/>/gi, '\n')}${t('postDefaultDesc')}`
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


  const renderHTMLNode = (node, index, siblings, parent, defaultRenderer) => {
    if (node.type !== 'tag') return null
    if (node.name === 'iframe') {
      const attrs = node.attribs
      const iframeWidth = window.width
      const iframeHeight = window.width / 1.9325
      const iframeHtml = `<iframe
        src="${attrs.src}"
        width="100%"
        height="${iframeHeight * 2.9325}"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen />`
      return (
        <View key={index} style={{ width: Number(iframeWidth), height: Number(iframeHeight) }}>
          <WebView source={{ html: iframeHtml }} />
        </View>
      )
    }
  }

  console.log('post: ', post)

  let sponsorOf = []
  if (currUserId) {
    if (currUser.sponsorOf) {
      sponsorOf = currUser.sponsorOf
    }
  }
  const currCoins = post.author.coins || 0
  const postBody = post.htmlBody.replace(/<p><\/p>/gi, '').replace(/<p><br\s+\/>/gi, '<p>')
  const excerpt = post.excerpt
  const postTags = post.tags.map((tag) => {
    return tag.name.toLowerCase()
  })
  const postLikes = nFormatter(likes)
  const postViews = nFormatter(post.viewCount || 0)
  const postLiked = liked
  const postSaves = savedCount
  const postSaved = saved
  const isOwner = currUserId === post.author._id
  // const inFests = post.fests ? post.fests.length > 0 : false
  const isCertified = post.isCertified
  let lockedBanner = null
  /* if (isFollowersOnly && !isFollowing && !sponsorOf.includes(post.author._id)) {
    lockedBanner = (<View className='overlay'>
      <View className='v-align'>
        <Feather name='unlock' />
        {post.coins > 0
          ? <View>{t('postFor')} <RCoin size={16} />{post.coins}</View>
          : <View>{t('followersOnlyPost')}</View>}
          <Button className='unlock-button follow-button' onPress={handleFollowersOnly}>{t('subscribe')}</Button>
      </View>
    </View>)
  }
  if (isAdultContent && !isAllowAdultContent) {
    lockedBanner = (<View className='overlay'>
    <View className='v-align'>
      <Feather name='unlock' />
      <View>{t('youMustBeOld')}</View>
      <Button className='unlock-button adult-button' onPress={handleAdultContent}>{t('imOld')}</Button>
      </View>
    </View>)
  }
  if (isPaid && !paymentSucceed) {
    lockedBanner = (<View className='overlay'>
      <View className='v-align'>
        <Feather name='unlock' />
        <View>{t('postFor')} {post.coins}₽</View>
        <Button className='ui button unlock-button follow-button' onPress={handlePaid(currCoins, post.coins)}>{t('unlock')}</Button>
      </View>
    </View>)
  }

  if (isSponsorsOnly && !sponsorOf.includes(post.author._id)) {
    lockedBanner = (<View className='overlay'>
      <View className='v-align'>
        <Feather name='unlock' />
        <View>{t('sponsorsOnlyPost')}</View>
        {post.author.sponsors && <View className='sponsors'>
          {post.author.stats.sponsorsCount > 3 && <View className='active-sponsors'>{t('sponsorsAlready')}</View>}
          {post.author.sponsors.map(item => {
            return (<Image source={{ uri: item.profile.image }} key={item.username} />)
            })
          }
          {post.author.stats.sponsorsCount > 3 && <View className='more-sponsors'>+{post.author.stats.sponsorsCount - 3} {t('sponsors')}</View>}
        </View>}
          <Button className='ui button unlock-button adult-button' onPress={handleSponsorship}>
            <Feather name='heart' size={18} color='white' />{t('sponsor')}
          </Button>
      </View>
    </View>)
  } */
  const isLocked = !!lockedBanner && !isOwner
  const pageClass = isLocked ? 'post-page lock item' : 'post-page item'
  let pageBody = isLocked ? excerpt : postBody // .replace(/\<\/strong>/gi, '</strong>\n')
  const isAudioExists = post.audios ? post.audios.length > 0 : false

  if (pageBody.indexOf('<p>') === -1) {
    pageBody = '<p>' + pageBody + '</p>'
  }

  const articleBody = pageBody // useMemo(() => linkifyText(pageBody, true), [pageBody])

  /* let articleBody = urlifyBody
  const BREAK_CHARS_LIMIT = 3000
  if (urlifyBody.length > BREAK_CHARS_LIMIT) {
    const articleBodyArr = []
    let currCharsCounter = 0
    let totalCharsCounter = 0
    urlifyBody.split('\n').map((item, index) => {
      currCharsCounter += item.length
      totalCharsCounter += item.length
      if (currCharsCounter > BREAK_CHARS_LIMIT && ((urlifyBody.length - totalCharsCounter) > BREAK_CHARS_LIMIT)) {
        currCharsCounter = 0
        articleBodyArr.push(<View key={index + 'blck'} dangerouslySetInnerHTML={{__html: item}}></View>)
        articleBodyArr.push(<AdvBanner key={index + '_ad'} adType='postPageNative' />) //<AdvBanner adType='postPageNative' />
      } else {
        articleBodyArr.push(<View key={index + 'blck'} dangerouslySetInnerHTML={{__html: item}}></View)
      }
    })
    articleBody = articleBodyArr
  } */

  /* let ratingCount = 10
  let ratingValue = 10
  if (post.author.isClassic) {
    ratingCount = Math.round(likes / 50) || 1
    ratingValue = Math.floor(likes / ratingCount / 5) || 10
  } */

  let iframeBlock = null
  if (post.videoLink) {
    const videoSrc = useMemo(() => videoLinkParser(post.videoLink), [post.videoLink])
    if (videoSrc.source === 'youtube') {
      iframeBlock = `<iframe src="https://www.youtube.com/embed/${videoSrc.id}" />`
    } else if (videoSrc.source === 'vimeo') {
      iframeBlock = `<iframe src="https://player.vimeo.com/video/${videoSrc.id}" />`
    } else if (videoSrc.source === 'vk') {
      iframeBlock = `<iframe src="//vk.com/video_ext.php?oid=-${videoSrc.oid}&id=${videoSrc.id}&hash=c610b6d8e3ef268a" />`
    }
  }

  console.log('iframeBlock: ', iframeBlock)
  return (<>
    <Animated.ScrollView
      ref={ref}
      onScroll={Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: {
                y: yOffset,
              },
            },
          },
        ],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={tw('flex h-full')}>
        {!!post.coverImg && <View style={tw('w-full h-48 bg-gray-100 mb-2')}>
          <Image source={{ uri: post.coverImg }} style={tw('w-full h-48')} />
        </View>}

        {iframeBlock && <HTMLView
          value={iframeBlock}
          renderNode={renderHTMLNode}
        />
        }

        <View style={tw('flex p-4')}>
          <Text style={tw('font-bold text-2xl')}>
            {post.title}
            {isOwner && isCertified && <Feather name='shield' />}
          </Text>

          <UserInfoItem user={post.author} pubDate={post.postedAt} isPost isShowUsername showUnFollowButton={false} />

          {post.gifts && post.gifts.gifts && post.gifts.gifts.length > 0 && <View style={tw('flex flex-row flex-wrap mb-1 bg-gray-100 p-1 px-2 rounded-md')}>
            {post.gifts.gifts.map((gift, index) => {
              return (
                <View key={'gft_' + index} style={tw('flex flex-row items-center bg-transparent')}>
                  <Image source={{ uri: `https://cdn.ryfma.com/defaults/gifts/${gift.giftId}-min.png` }} width={24} height={24} />
                  <Text style={tw('text-xs ml-1')}>{gift.countGifts}</Text>
                </View>)
            })}
            {currUserId && <View onPress={handleShowSendGift}><Feather name='plus-circle' size={16} /></View>}
          </View>}
          {isEditorsPick && <View style={tw("flex flex-row items-center")}>
            <Image
              source={{ uri: 'https://cdn.ryfma.com/defaults/icons/award.svg' }}
              svgProps={{ width: '24', height: '24' }}
            />
            <Text style={tw('font-semibold ml-2')}>{t('common:editorsPick')}</Text>
          </View>
          }

          {isLocked && lockedBanner}

          {!isOwner && (isFollowersOnly || isPaid || isSponsorsOnly) ? <View /> : null}
          <View style={tw('mt-4')}>{!isOwner && (isFollowersOnly || isPaid || isSponsorsOnly)
            ?
            <HTMLView
              onLinkPress={(url) => console.log('clicked link: ', url)}
              value={articleBody}
              stylesheet={textStyles}
            />
            :
            <HTMLView
              value={articleBody}
              stylesheet={textStyles}
            />
          }
          </View>

          <PostTags tags={post.tags} />

          {post.album && (
            <View style={tw('flex flex-row mt-4')}>
              <Feather name='book' size={16} />
              <Text style={tw('ml-1 italic')}>{t('fromAlbum')}</Text>
              <Link page='AlbumPage' params={{ albumId: post.album._id, albumSlug: post.album.slug }}>
                <Text style={tw('font-bold text-blue-500 italic')}>{post.album.title}</Text>
              </Link>
            </View>
          )}

          {isOwner && isCertified && <View style={tw('flex flex-row mt-4')}>
            <Text style={tw('mr-2')}>&copy;&nbsp;{t('common:rightsReserved')}</Text><Feather name='shield' size={20} />
          </View>}

          {post.inFests && post.inFests.length > 0 && <View style={tw('flex mt-4')}>
            <Text style={tw('font-bold')}>{t('postInFests')}</Text>
            <View style={tw('flex flex-row mt-2')}>
              {post.inFests.map(item => {
                let title = item.title
                if (title.length > 32) {
                  title = title.substring(0, 29) + '...'
                }
                if (item.isDuel) {
                  return <Link key={item.slug} page='duelPage' params={{ duelId: item._id, duelSlug: item.slug }}><Text style={tw('font-bold text-blue-600')}>{title}</Text></Link>
                } else {
                  return <Link key={item.slug} page='duelPage' params={{ festId: item._id, festSlug: item.slug }}><Text style={tw('font-bold text-blue-600')}>{title}</Text></Link>
                }
              })}
            </View>
          </View>}

          <Text style={tw('mt-8')}>Вы можете поставить посту от 1 до 50 лайков!</Text>

          <View style={tw('flex flex-row justify-between my-2')}>
            <View style={tw('flex flex-row justify-between')}>
              <Button
                title={post.likesCount}
                icon={postLiked ?
                  <Feather name='heart' size={24} />
                  :
                  <Feather name='heart' size={24} />
                }
                onPress={handleSetNewLike}
                style={tw('p-0')}
              />

              {/* <View>
                {hearts.map((heart) => heart.content)}
              </View> */}

              {/* postLiked && <Button
                  onPress={handleUnlikePost}
                >
                  <Feather name='x-circle' size={20} />
                </Button>
               */}

              <Button
                icon={<Feather name='gift' size={24} />}
                onPress={handleShowSendGift}
                style={tw('p-0 pl-8')}
              />
            </View>
            <View style={tw('flex flex-row justify-between')}>
              <Button
                key={0}
                icon={postSaved ?
                  <Feather name='bookmark' fill='#f00' size={24} />
                  :
                  <Feather name='bookmark' size={24} />}
                onPress={handleAddToAlbum}
                style={tw('py-2 pr-8')}
              />

              <Button
                icon={<Feather name='share' size={24} />}
                onPress={handleShare}
                style={tw('p-0')}
              />
            </View>
          </View>

        </View>

        <ReadNextPrevPosts postId={post._id} postCreated={post.createdAt} />

        <CommentsWrapper
          author={post.author}
          objectType='post'
          objectId={post._id}
          title={post.title}
          commentsLength={post.commentsCount || 0}
        />

        <RelatedPosts
          type='horizontal'
          post={post}
        />
      </View>
    </Animated.ScrollView>
  </>
  )
}

const textStyles = StyleSheet.create({
  p: {
    fontSize: 16,
    padding: 0,
    margin: 0
  },
  a: {
    color: '#FF3366', // make links coloured pink
  },
});

export default PostPageContent

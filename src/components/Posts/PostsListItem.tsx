import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import tw from 'tailwind-rn'
import { Text, View, Button, Image } from '~components/Themed'
//import RCoin from '~shared/svg/rcoin'
import { Feather } from '@expo/vector-icons'
import Link from '~components/Common/Link'
import TimeAgoExt from '~components/Common/TimeAgoExt'
import Avatar from '~components/Common/Avatar'
//  import { Notification } from '~components/Notification/Notification'
import ReactGA from 'react-ga'
import { useMutation } from '@apollo/client/react'
import { useAuth } from '~hooks'
import FOLLOW_USER from '~graphqls/mutations/User/followUser'
import INCREASE_POST_VIEW_COUNT from '~graphqls/mutations/Post/increasePostViewCount'
import ALLOW_ADULT_CONTENT from '~graphqls/mutations/Common/allowAdultContent'
import createPayment from '~graphqls/mutations/Payment/createPayment'
import videoLinkParser from '~utils/helpers/videoLinkParser'

let CheckoutForm = () => null
let PaymentForm = () => null
let NotEnoughForm = () => null
let LoginForm = () => null
let UserDonationBlock = () => null

function PostsListItem({ post, currCoins, isPromoted, isOwner, sponsorOf = [], postType, isAMP }) {
  const [t] = useTranslation('post')
  const navigation = useNavigation()
  const { currUser, currUserId } = useAuth()

  const [isAdultContent, setIsAdultContent] = useState(post.isAdultContent)
  const [paymentSucceed, setPaymentSucceed] = useState(post.isBought || false)
  const [isFollowing, setIsFollowing] = useState(post.author.isFollowing || false)
  const [isFollowersOnly, setIsFollowersOnly] = useState(post.paymentType === 1)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [openPaymentForm, setOpenPaymentForm] = useState(false)
  const [openCheckoutPaymentForm, setOpenCheckoutPaymentForm] = useState(false)
  const [openNotEnoughForm, setOpenNotEnoughForm] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('token')

  const isPaid = post.paymentType === 2
  const isSponsorsOnly = post.paymentType === 3

  const isAllowAdultContent = currUser ? currUser.isAllowAdultContent : false

  const [allowAdultContent] = useMutation(ALLOW_ADULT_CONTENT)
  const [increasePostViewCount] = useMutation(INCREASE_POST_VIEW_COUNT)
  const [followUser] = useMutation(FOLLOW_USER)
  const [createPaymentMutation] = useMutation(createPayment)

  /* useEffect(() => {
    try {
      if (post) {
        increasePostViewCount({ variables: { _id: post._id, userId: currUserId, status: post.status } })
      }
    } catch (err) {}
  }, []) */

  const handleAdultContent = async () => {
    try {
      await allowAdultContent()
      setIsAdultContent(!isAdultContent)
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
      const followed = await followUser({ variables: { _id: post.author._id } })
      setIsFollowersOnly(followed)
      setIsFollowing(true)
      navigation.push('Common', { screen: 'PostPage', params: { postId: post._id, postSlug: post.slug } })
    } catch (error) {
      Notification.error(error)
    }
  }

  const completePayment = async (payMethod) => {
    const paymentTotalMethod = payMethod || paymentMethod
    const price = post.coins
    const amount = 1

    if (currUser) {
      ReactGA.event({
        category: 'Post',
        action: 'BuyPost',
        label: 'BuyPost: userId: ' + currUser._id + ' , price: ' + price + ' , amount: ' + amount,
        value: price
      })
      const payParams = {
        paymentMethod: paymentTotalMethod,
        amount: currUser.roles.includes('admin') ? 2 : parseInt(price, 10),
        currency: 'RUB',
        phone: phoneNumber,
        orderType: 'buyPost',
        objectId: post._id,
        objectType: 'post',
        objectAmount: parseInt(amount, 10),
        isRecurrent: false,
        returnUrl: 'https://ryfma.com/p/' + post._id + '/' + post.slug
      }

      try {
        const result = await createPaymentMutation({ variables: payParams })
        console.log('Result from server')
        setOpenCheckoutPaymentForm(false)
        if (result) {
          if (result.data.createPayment.confirmation) {
            if (result.data.createPayment.confirmation.type === 'redirect') {
              window.location.replace(result.data.createPayment.confirmation.confirmation_url)
            }
          }
        }
      } catch (error) {
        Notification.error(error)
      }
    }
  }

  const handlePaid = (coins, amount) => async () => {
    /* const importedLoginModule = await import('~components/Common/LoginForm')
    LoginForm = importedLoginModule.default

    const importedModule = await import('~components/Common/CheckoutForm')
    CheckoutForm = importedModule.default
    setOpenCheckoutPaymentForm(true) */
  }

  const handleCoinsPaid = (coins, amount) => async () => {
    // setOpenCheckoutPaymentForm(false)
    /* if (coins > amount) {
      const importedModule = await import('~components/Common/PaymentForm')
      PaymentForm = importedModule.default
      setOpenPaymentForm(true)
    } else {
      const importedModule = await import('~components/Common/NotEnoughForm')
      NotEnoughForm = importedModule.default
      setOpenNotEnoughForm(true)
    } */
  }

  const handleSponsorship = async () => {
    /* const importedModule = await import('~components/Users/UserDonationBlock')
    UserDonationBlock = importedModule.default
    setShowDonationModal(true) */
  }

  const handlePaymentMethod = (paymentMethod) => setPaymentMethod(paymentMethod)

  const handlePhoneNumber = (phoneNumber) => setPhoneNumber(phoneNumber)

  const handleCloseCheckout = () => {
    setOpenCheckoutPaymentForm(false)
    setOpenPaymentForm(false)
    setOpenNotEnoughForm(false)
  }

  const handleCloseDonationForm = () => setShowDonationModal(false)

  const handlePaymentSuccess = () => {
    setPaymentSucceed(true)
    setOpenPaymentForm(false)
  }

  const handleClosePaymentForm = () => {
    setOpenPaymentForm(false)
    setOpenCheckoutPaymentForm(false)
  }

  const handleCloseNotEnoughForm = () => setOpenNotEnoughForm(false)

  let lockedBanner = null
  /* if (isFollowersOnly && !isFollowing && !isPromoted && !sponsorOf.includes(post.author._id)) {
    lockedBanner = (<View className='overlay'>
      <View className='v-align'>
        <Feather name='unlock' />
        {post.coins > 0
          ? <View>{t('postFor')} {/*<RCoin size={16} />{post.coins}</View>
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
  if (isPaid && !paymentSucceed && !isPromoted) {
    lockedBanner = (<View className='overlay'>
      <View className='v-align'>
        <Feather name='unlock' />
        <View>{t('postFor')} {post.coins}₽</View>
        <Button className='unlock-button follow-button' onPress={handlePaid(currCoins, post.coins)}>{t('unlock')}</Button>
      </View>
    </View>)
  }

  if (isSponsorsOnly && !sponsorOf.includes(post.author._id) && !isPromoted) {
    lockedBanner = (<View className='overlay'>
      <View className='v-align'>
        <Feather name='unlock' />
        <View>{t('sponsorsOnlyPost')}</View>
        {post.author.sponsors && <View className='sponsors'>
          {post.author.stats.sponsorsCount > 3 && <View className='active-sponsors'>{t('sponsorsAlready')}</View>}
          {post.author.sponsors.map(item => {
            return (<Image key={item.usernam} source={{ uri: item.profile.image}} alt={item.profile.name} />)
            })
          }
          {post.author.stats.sponsorsCount > 3 && <View className='more-sponsors'>+{post.author.stats.sponsorsCount - 3} {t('sponsors')}</View>}
        </View>}
        <Button className='unlock-button adult-button' onPress={handleSponsorship}>
          <Feather size={18} color='white' />{t('sponsor')}
        </Button>
      </View>
    </View>)
  } */
  const isLocked = !!lockedBanner && !isOwner
  const isVerified = post.author.emails && post.author.emails[0] && post.author.emails[0].verified
  // const postBodyArr = post.excerpt.split('<br />')
  const postBodyFull = null
  let coverImg = post.coverImg || ''
  if (post.videoLink) {
    const videoLink = videoLinkParser(post.videoLink)
    coverImg = videoLink.hqImg
  }

  const editorBadge = post.isEditorsPick && <View key="0">
    <Image
      source={{ uri: 'https://cdn.ryfma.com/defaults/icons/award.svg' }}
      svgProps={{ width: '24', height: '24' }}
    />
  </View>

  const badgeStyle = tw("flex items-center justify-center w-6 h-6 rounded-full bg-yellow-300 ml-1")

  return (
    <View key={post._id} style={tw(post.isPromoted || isPromoted ? 'flex p-2 bg-yellow-200' : 'flex p-2')}>
      <View style={tw('flex flex-row items-center mb-1')}>
        <Avatar
          uri={post.author.profile.image}
          type='small'
          username={post.author.username}
          name={post.author.profile.name}
          roles={post.author.roles}
          type='middle'
          isComment
          size={10}
          style='mr-2'
        />
        <View style={tw('flex flex-row items-center w-10/12')}>
          <View style={tw('flex-1 overflow-hidden overflow-ellipsis')}>
            <Link page='PostPage' params={{ postId: post._id, postSlug: post.slug }} replace>
              <Text numberOfLines={1} style={tw('h-7 text-lg font-bold')}>{post.title}</Text>
            </Link>
            <View style={tw('flex flex-row items-center max-w-xs')}>
              <Text>{t('common:by')}</Text>
              <Link page='UserPage' params={{ username: post.author.username }} replace>
                <View style={tw('mx-1 h-4 overflow-hidden')}>
                  <Text numberOfLines={1} style={{ maxWidth: 170 }}>{post.author.profile.name}</Text>
                </View>
              </Link>
              {!!isVerified && <Image source={{ uri: 'https://cdn.ryfma.com/defaults/icons/verified-badge.svg' }} svgProps={{ width: '12', height: '12' }} />}
              {!isPromoted && <Text style={tw('mx-1')}>·</Text>}
              {/* !isPromoted && <TimeAgoExt date={post.createdAt} /> */}
            </View>
            {isPromoted &&
              <Text style={tw('text-xs font-bold text-green-500 mt-1')}>
                {t('common:promotion')}
              </Text>
            }
          </View>
          <View style={tw('flex flex-row items-center')}>
            {editorBadge}
            {post.isAdultContent && <View style={badgeStyle}><Text>18+</Text></View>}
            {post.paymentType === 1 && <View style={badgeStyle}><Feather name='users' size={14} /></View>}
            {post.paymentType === 2 && <View style={badgeStyle}><Feather name='dollar-sign' size={14} /></View>}
            {isPromoted && <View style={badgeStyle}><Feather name='star' size={14} /></View>}
            {!post.isPromoted && isOwner && post.status !== 1 && <View style={badgeStyle}><Feather name='zap' size={14} /></View>}
            {!!post.videoLink && <View style={badgeStyle}><Feather name='video' size={14} /></View>}
            {!!post.audioFiles && <View style={badgeStyle}><Feather name='headphones' size={14} /></View>}
          </View>
        </View>
      </View>

      <Link page='PostPage' params={{ postId: post._id, postSlug: post.slug }} replace>
        <View style={tw('mb-1')}>
          {!!coverImg &&
            <Image source={{ uri: coverImg }} style={tw('w-full h-40 rounded-xl bg-gray-100 my-1')} />
          }
          <View>
            {postBodyFull
              ?
              <Text>{postBodyFull}</Text>
              :
              <Text style={tw('text-lg')}>
                {post.excerpt?.replace(/<br\s*\/?>/g, '\n').replace(/\n$/g, '')}
              </Text>
            }
          </View>
          {isLocked ? lockedBanner : <Text style={tw('text-base font-bold mt-1')}>
            {t('readMore')}
          </Text>}
        </View>
      </Link>

      {/* (openPaymentForm || openNotEnoughForm) && !currUserId && <LoginForm referer={`/p/${post._id}/${post.slug}`} handleCloseLoginForm={handleCloseCheckout} />}
      {openCheckoutPaymentForm && currUserId && <>
        <CheckoutForm
          open={openCheckoutPaymentForm && !openPaymentForm}
          onClose={handleCloseCheckout}
          completePayment={completePayment}
          handlePaymentMethod={handlePaymentMethod}
          handlePhoneNumber={handlePhoneNumber}
          amount={post.coins}
          allowCoinsPayment={true}
          handleCoinsPayment={handleCoinsPaid(currCoins, post.coins)}
        />
        {openPaymentForm && <PaymentForm
          ownerId={post.author._id}
          objectId={post._id}
          objectType='post'
          currCoins={currCoins}
          amount={post.coins}
          openPaymentForm
          handleClosePaymentForm={handleClosePaymentForm}
          handlePaymentSuccess={handlePaymentSuccess}
        />}
      </>
      }
      {openNotEnoughForm && currUserId &&
        <NotEnoughForm
          currCoins={currCoins}
          amount={post.coins}
          openNotEnoughForm
          handleCloseNotEnoughForm={handleCloseNotEnoughForm}
        />}
      {isSponsorsOnly && !isOwner && post.author.tariffs && showDonationModal &&
        <UserDonationBlock
          user={post.author}
          isOwner={isOwner}
          showDonation={showDonationModal}
          hideButton
          handleCloseDonationForm={handleCloseDonationForm}
        /> */}
      {/* post.promo && isOwner && <View className='promo-stat'>
        {post.promo.status === 1 && <View className=''><Feather name='clock' />&nbsp;Ожидает проверки модератором</View>}
        {post.promo.status === 2 && <View className=''><Feather name='users' /> Просмотров от продвижения: {post.promo ? post.promo.currentViews : 0} • Пост продвигается</View>}
        {post.promo.status === 5 && <View className=''><Feather name='users' /> Просмотров от продвижения: {post.promo ? post.promo.currentViews : 0} • Продвижение завершено •
          <Link to={`/me/promote/${post._id}`} className='promote-badge' title={post.title}>
            <Feather name='bolt' />{t('common:promoteMore')}
          </Link>
        </View>}
        {post.promo.status === 6 && <View className=''><Feather name='users' /> Просмотров от продвижения: {post.promo ? post.promo.currentViews : 0} • На сегодня лимит показов исчерпан (Пауза)</View>}
      </View> */}

    </View>
  );
}

export default PostsListItem

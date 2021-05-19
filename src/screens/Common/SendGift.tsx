import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation} from '@apollo/client/react'
import Link from '~components/Common/Link'
import { Modal, Form, Button } from 'semantic-ui-react'
import X from 'react-feather/dist/icons/x'
import CheckCircle from 'react-feather/dist/icons/check-circle'
// import Modal from 'semantic-ui-react/elements/Modal/Modal.js'
// import ContaForminer from 'semantic-ui-react/elements/Form/Form.js'
// import Button from 'semantic-ui-react/elements/Button/Button.js'
import { Notification } from '~components/Notification/Notification'
import RCoin from '~shared/svg/rcoin'
import sendGift from '~graphqls/mutations/Common/sendGift'
import { useAuth } from '~hooks'
import gifts from '~gifts'
import ReactGA from 'react-ga'

function SendGift ({ objectId, objectType, objectSlug, userId, showSendGift, handleCloseSendGift }) {
  const [t] = useTranslation('user')
  const { currUser, setCurrUser } = useAuth()

  const [sendGiftMutation] = useMutation(sendGift)
  const [activeGift, setActiveGift] = useState({})
  const [msgToUser, setMsgToUser] = useState('')
  const [msgCharsRest, setMsgCharsRest] = useState(1024)
  const [isPrivate, setIsPrivate] = useState(false)
  const [showCoins, setShowCoins] = useState(false)
  const [price, setPrice] = useState(100)
  const [amount, setAmount] = useState(450)

  const handleSendGift = async () => {
    if (activeGift) {
      try {
        const sendGiftResult = await sendGiftMutation({
          variables: {
            userId: userId,
            giftId: activeGift._id,
            objectId,
            objectType,
            objectSlug,
            msgToUser,
            isPrivate
          }
        })
        if (sendGiftResult) {
          ReactGA.event({
            category: 'Gift',
            action: 'GiftSend',
            label: `GiftSend: gId: ${activeGift._id}`,
            value: 1
          })
          Notification.success(t('notif:giftSent'))
          currUser.coins = currUser.coins - activeGift.price
          setCurrUser(currUser)
          handleCloseSendGift()
        } else {
          Notification.success(t('notif:giftSentFailed'))
        }
      } catch (error) {
        Notification.error(error)
      }
    }
  }

  const handleChoosePack = (price, amount) => () => {
    setPrice(price)
    setAmount(amount)
    setShowCoins(true)
  }

  const handleActiveGift = (gift) => () => setActiveGift(gift)

  let referer = ``
  if (objectType === 'user') {
    referer = `/u/${objectSlug}`
  } else if (objectType === 'post') {
    referer = `/p/${objectId}/${objectSlug}`
  } else if (objectType === 'book') {
    referer = `/b/${objectId}/${objectSlug}`
  }

  return (
    <Modal
      className='sendGiftModal'
      open={!!showSendGift}
      onClose={handleCloseSendGift}
      centered={false}
      size='tiny'
    >
      <Modal.Header>
        <View className='close-header'>
          <button onClick={handleCloseSendGift} className='close-button'><X /></button>
          {t('sendGift')}
        </View>
        <Link to={`/coins?referer=${referer}`} className='user-coins-balance'>
          <span className='money-value'>{currUser ? currUser.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0}</span>
          <RCoin size={16} />
          <span className='add-coins'>+</span>
        </Link>
      </Modal.Header>
      <Modal.Content scrolling>
        <View className='send-gift-wrapper'>
          <View className='content'>
            <View className='section-header'>
              {/* <h2>{t('usualGifts')}</h2> */}
            </View>
            <View className='gifts-list'>
              {Object.keys(gifts).map(key => {
                const gift = gifts[key]
                return (<View key={key} className={activeGift._id === gift._id ? 'gift-item active' : 'gift-item'} onClick={handleActiveGift(gift)}>
                  <img src={gift.image} className='gift-image' alt={gift.title} width='84' height='84'/>
                  <View className='gift-title'>{gift.title}</View>
                  <View className='gift-price'>{gift.price}</View>
                  {activeGift._id === gift._id && <CheckCircle className='checked-gift'/>}
                </View>)
              })}
            </View>
          </View>
        </View>
      </Modal.Content>
      <Modal.Actions>
        <Form onSubmit={handleSendGift}>
          <View className='msgToUser'>
            <Form.Input placeholder={t('enterYourMessage')} name='msgToUser' className='msg-to-user' value={msgToUser} onChange={(e, {name, value}) => {
              const msgCharsRest = 40 - value.length
              if (msgCharsRest > -1) {
                setMsgToUser(value)
                setMsgCharsRest(msgCharsRest)
              }
            }}
            />
            <View className='msg-chats-rest'>{msgCharsRest}</View>
          </View>
          <Form.Checkbox
            checked={isPrivate}
            label={<label>{t('messagePrivate')}</label>}
            onChange={(e, {name, value}) => setIsPrivate(value)}
          />
          <Button type='submit' className='next-button primary'>{t('sendGift')}</Button>
        </Form>
      </Modal.Actions>
      {/* <h2>{t('coins')}</h2>
      <View className='payment-packages'>
        <View className={amount === 100 ? 'pack active' : 'pack'} onClick={handleChoosePack(100, 100)}>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Monetki1.png' />
          </View>
          <View className='pack-title'>
            {t('pack1Amount')}
            <View className='pack-coins'>(100)</View>
          </View>
          <View className='pack-old-price'>120₽</View>
          <View className='pack-price'>100₽</View>
          <View className='pack-benefit'>0 {t('free')}</View>
        </View>
        <View className={amount === 550 ? 'pack active' : 'pack'} onClick={handleChoosePack(450, 550)}>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Monetki2.png' />
          </View>
          <View className='pack-title'>
            {t('pack2Amount')}
            <View className='pack-coins'>(550)</View>
          </View>
          <View className='pack-old-price'>594₽</View>
          <View className='pack-price'>450₽</View>
          <View className='pack-benefit'>100 {t('free')}!</View>
        </View>
        <View className={amount === 1250 ? 'pack active' : 'pack'} onClick={handleChoosePack(700, 1250)}>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Monetki3.png' />
          </View>
          <View className='pack-title'>
            {t('pack3Amount')}
            <View className='pack-coins'>(1250)</View>
          </View>
          <View className='pack-old-price'>1215₽</View>
          <View className='pack-price'>700₽</View>
          <View className='pack-benefit'>550 {t('free')}!</View>
        </View>
        <View className={amount === 2750 ? 'pack active' : 'pack'} onClick={handleChoosePack(1500, 2750)}>
          <View className='pack-bonus'>{t('popular')}</View>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Sunduk.png' />
          </View>
          <View className='pack-title'>
            {t('pack4Amount')}
            <View className='pack-coins'>(2750)</View>
          </View>
          <View className='pack-old-price'>2407₽</View>
          <View className='pack-price'>1500₽</View>
          <View className='pack-benefit'>1250 {t('free')}!</View>
        </View>
      </View>
      <br />
      <View className='payment-packages'>
        <View className={amount === 5750 ? 'pack premium active' : 'pack premium'} onClick={handleChoosePack(3500, 5750)}>
          <View className='pack-bonus'>{t('premium')}</View>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Sunduk2.png' />
          </View>
          <View className='pack-title'>
            {t('packSuperAmount')}
            <View className='pack-coins'>(5750)</View>
            <View>+</View>
            <a to='/upgrade' target='_blank' className='upgrade-link'>Ryfma {t('premium')} (1 {t('mo')})</a>
          </View>
          <View>
            <View className='pack-price'>2950₽</View>
            <View className='pack-benefit'>2800 {t('free')}!</View>
          </View>
        </View>
      </View> */}{/* <h2>{t('coins')}</h2>
      <View className='payment-packages'>
        <View className={amount === 100 ? 'pack active' : 'pack'} onClick={handleChoosePack(100, 100)}>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Monetki1.png' />
          </View>
          <View className='pack-title'>
            {t('pack1Amount')}
            <View className='pack-coins'>(100)</View>
          </View>
          <View className='pack-old-price'>120₽</View>
          <View className='pack-price'>100₽</View>
          <View className='pack-benefit'>0 {t('free')}</View>
        </View>
        <View className={amount === 550 ? 'pack active' : 'pack'} onClick={handleChoosePack(450, 550)}>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Monetki2.png' />
          </View>
          <View className='pack-title'>
            {t('pack2Amount')}
            <View className='pack-coins'>(550)</View>
          </View>
          <View className='pack-old-price'>594₽</View>
          <View className='pack-price'>450₽</View>
          <View className='pack-benefit'>100 {t('free')}!</View>
        </View>
        <View className={amount === 1250 ? 'pack active' : 'pack'} onClick={handleChoosePack(700, 1250)}>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Monetki3.png' />
          </View>
          <View className='pack-title'>
            {t('pack3Amount')}
            <View className='pack-coins'>(1250)</View>
          </View>
          <View className='pack-old-price'>1215₽</View>
          <View className='pack-price'>700₽</View>
          <View className='pack-benefit'>550 {t('free')}!</View>
        </View>
        <View className={amount === 2750 ? 'pack active' : 'pack'} onClick={handleChoosePack(1500, 2750)}>
          <View className='pack-bonus'>{t('popular')}</View>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Sunduk.png' />
          </View>
          <View className='pack-title'>
            {t('pack4Amount')}
            <View className='pack-coins'>(2750)</View>
          </View>
          <View className='pack-old-price'>2407₽</View>
          <View className='pack-price'>1500₽</View>
          <View className='pack-benefit'>1250 {t('free')}!</View>
        </View>
      </View>
      <br />
      <View className='payment-packages'>
        <View className={amount === 5750 ? 'pack premium active' : 'pack premium'} onClick={handleChoosePack(3500, 5750)}>
          <View className='pack-bonus'>{t('premium')}</View>
          <View className='pack-icon'>
            <img src='https://cdn.ryfma.com/defaults/icons/Sunduk2.png' />
          </View>
          <View className='pack-title'>
            {t('packSuperAmount')}
            <View className='pack-coins'>(5750)</View>
            <View>+</View>
            <a to='/upgrade' target='_blank' className='upgrade-link'>Ryfma {t('premium')} (1 {t('mo')})</a>
          </View>
          <View>
            <View className='pack-price'>2950₽</View>
            <View className='pack-benefit'>2800 {t('free')}!</View>
          </View>
        </View>
      </View> */}
    </Modal>
  );
}

export default SendGift

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Header, Button } from 'semantic-ui-react'
import { Notification } from '~components/Notification/Notification'
import { useMutation } from '@apollo/client/react'
import buyItem from '~graphqls/mutations/Common/buyItem'
import RCoin from '~shared/svg/rcoin'
import { useAuth } from '~hooks'
import ReactGA from 'react-ga'

function PaymentForm ({ currCoins, amount, ownerId, objectId, objectType, openPaymentForm, handlePaymentSuccess, handleClosePaymentForm }) {
  const [t] = useTranslation('notif')
  const { currUserId } = useAuth()

  const [buyItemMutation] = useMutation(buyItem)

  const handleBuyItem = async () => {
    if (!currUserId) {
      Notification.error(
        'Войдите в свой аккаунт, чтобы совершать покупки'
      )
      return
    }
    try {
      const success = await buyItemMutation({
        variables: {
          objectId: objectId,
          objectType: objectType,
          ownerId: ownerId,
          price: amount
        }
      })
      ReactGA.event({
        category: 'Buy',
        action: 'BuyPost',
        label: 'BuyPost: ' + objectId + ' for ' + amount,
        value: amount
      })
      if (success) handlePaymentSuccess()
    } catch (error) {
      Notification.error(error)
    }
  }

  return (<Modal
    className='paymentModal'
    closeIcon='times'
    size='tiny'
    open={openPaymentForm}
    onClose={handleClosePaymentForm}
  >
    <Modal.Content>
      <Header content={t('common:paymentConfirmation')} />
      <p>
        {t('common:paymentConfirmationText')}<br />
        <RCoin size={16} />{amount}?
      </p>
      <View className='actions'>
        <Button color='green' onClick={handleBuyItem} className='confirm-button' disabled={currCoins < amount}>
          {t('common:confirm')}
        </Button>
        <Button onClick={handleClosePaymentForm} className='cancel-button'>
          {t('common:cancel')}
        </Button>
      </View>
      <View className='current-balance'>
        {t('common:currentBalance')}:
        <span><RCoin size={16} />{currCoins}</span>
      </View>
    </Modal.Content>
  </Modal>
  )
}

export default PaymentForm

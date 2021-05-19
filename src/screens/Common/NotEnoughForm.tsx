import React, { useState } from 'react'
import Link from '~components/Common/Link'
import { useTranslation } from 'react-i18next'
import { Modal, Header, Button } from 'semantic-ui-react'
import { useMutation } from '@apollo/client/react'
import buyItem from '~graphqls/mutations/Common/buyItem'
import RCoin from '~shared/svg/rcoin'
import { useAuth } from '~hooks'
import ReactGA from 'react-ga'

function NotEnoughForm ({ currCoins, openNotEnoughForm, handleCloseNotEnoughForm }) {
  const [t] = useTranslation('form')
  const { currUserId } = useAuth()
  const [showBuyMore, setShowBuyMore] = useState(false)
  const [paymentType, setPaymentType] = useState(null)

  const [buyItemMutation] = useMutation(buyItem)

  const buyMore = (price) => () => {
    if (currUserId) {
      ReactGA.event({
        category: 'Coins',
        action: 'WantBuyMore',
        label: 'Coins: ' + currUserId + ' - ' + price,
        value: price
      })
    }
    setShowBuyMore(true)
  }

  return (<Modal
    className='paymentModal notEnoughForm'
    closeIcon='times'
    size='tiny'
    open={openNotEnoughForm}
    onClose={handleCloseNotEnoughForm}
  >
    <Modal.Content>
      <Header content={t('common:notEnoughHeader')} />
      <p>
        {t('common:notEnoughText')}
      </p>
      <View className='actions'>
        <Button color='green' onClick={buyMore(229)} className='confirm-button'>
          <RCoin size={16} />230&nbsp;{t('common:for')} 229Р
        </Button>
        <Link to='/coins' className='ui button primary buy-more-button'>
          {t('common:buyMore')}
        </Link>
        <br />
        <br />
        <Button onClick={handleCloseNotEnoughForm} className='cancel-button'>
          {t('common:cancel')}
        </Button>
        {showBuyMore && <form
          className='payment-form'
          method='POST'
          action='https://money.yandex.ru/quickpay/confirm.xml'
          id='yandexFormPayment'
          target='_blank'
          rel='noopener'
        >
          <input type='hidden' name='receiver' value='410011144354295' />
          <input type='hidden' name='short-dest' value='Покупка 230 монет на Ryfma' />
          <input type='hidden' name='label' value={`${paymentType}_id_${currUserId}`} />
          <input type='hidden' name='quickpay-form' value='shop' />
          <input type='hidden' name='targets' value='Покупка 230 монет на Ryfma' />
          <input type='hidden' name='sum' value={229} data-type='number' />
          <input type='hidden' name='successURL' value='/payment/success?amount=230' />
          <p>{t('form:choosePayment')}</p>
          <label htmlFor='AC_type' className={paymentType === 'AC' ? 'payment-form-type checked' : 'payment-form-type'}>
            <input
              type='radio'
              checked={paymentType === 'AC'}
              name='paymentType'
              value='AC'
              id='AC_type'
              className='payment-control'
              onClick={() => setPaymentType('AC')}
            />
            <span className='payment-text'><img src='https://cdn.ryfma.com/defaults/icons/mc-visa-logos.png' /></span>
          </label>
          <label htmlFor='PC_type' className={paymentType === 'PC' ? 'payment-form-type yandex checked' : 'payment-form-type yandex'}>
            <input
              type='radio'
              checked={paymentType === 'PC'}
              name='paymentType'
              value='PC'
              id='PC_type'
              className='payment-control'
              onClick={() => setPaymentType('PC')}
            />
            <span className='payment-text'><img src='https://cdn.ryfma.com/defaults/icons/yandex-money-logo.png' /></span>
          </label>
          <label htmlFor='MC_type' className={paymentType === 'MC' ? 'payment-form-type checked' : 'payment-form-type'}>
            <input
              type='radio'
              checked={paymentType === 'MC'}
              name='paymentType'
              value='MC'
              id='MC_type'
              className='payment-control'
              onClick={() => setPaymentType('MC')}
            />
            <span className='payment-text'><img src='https://cdn.ryfma.com/defaults/icons/mobile-logos.png' /></span>
          </label>
          <input type='submit' id='submitPayment' value={t('form:pay')} disabled={!paymentType} />
          <span className='payment-warning'>
            {t('form:paymentWarn1')}
            <br />
            {t('form:paymentWarn2')} <a href='mailto:info@ryfma.com'>{t('form:paymentWarn3')}</a>
          </span>
        </form>}
      </View>
      <View className='current-balance'>
        {t('common:currentBalance')}:
        <span><RCoin size={16} />{currCoins}</span>
      </View>
    </Modal.Content>
  </Modal>
  )
}

export default NotEnoughForm

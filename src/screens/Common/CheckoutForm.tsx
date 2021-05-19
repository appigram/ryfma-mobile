import React, { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import ArrowLeft from 'react-feather/dist/icons/arrow-left'
import Clock from 'react-feather/dist/icons/clock'
import XCircle from 'react-feather/dist/icons/x-circle'
import { Modal, Image, Button, Input } from 'semantic-ui-react'
import getPaymentCards from '~graphqls/queries/Card/getPaymentCards'
import { useAuth } from '~hooks'
import Loader from '~components/Common/Loader'

function CheckoutForm ({ completePayment, handlePaymentMethod, handlePhoneNumber, open, onClose, hasError, allowCoinsPayment, handleCoinsPayment }) {
  const [t] = useTranslation(['account', 'form'])
  const { currUser } = useAuth()

  const [showAllMethods, setShowAllMethods] = useState(currUser ? !currUser.hasCard : true)
  const [methodSelected, setMethodSelected] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(hasError)
  const [phoneNumberError, setPhoneNumberError] = useState('')

  const { loading, error, data } = useQuery(getPaymentCards, {
    skip: !currUser
  })

  const showMoreMethods = () => setShowAllMethods(!showAllMethods)

  const handleCloseSelectMethod = () => setMethodSelected(false)

  const selectPayment = (paymentType) => () => {
    setMethodSelected(true)
    setPaymentType(paymentType)

    if (paymentType !== 'mobile_balance' && paymentType !== 'qiwi') {
      if (completePayment) {
        completePayment(paymentType)
      }
    } else {
      if (handlePaymentMethod) {
        handlePaymentMethod(paymentType)
      }
    }
  }

  const processPhoneNumber = (e, {name, value}) => {
    const phoneNumber = value.replace(/[^0-9]/g, '')
    setPhoneNumber(phoneNumber)
    if (handlePhoneNumber) {
      handlePhoneNumber(phoneNumber)
    }
  }

  const handleCreatePayment = () => {
    setPaymentProcessing(true)
    if (completePayment) {
      completePayment()
    }
  }

  if (loading) {
    return <Loader />
  }

  if (paymentProcessing) {
    return (<View className='adding-payment-method-loader'>
      <Clock />
      <p>{t('form:processing')}</p>
      <p>{t('pleaseWait')}</p>
    </View>)
  }

  let card = null
  if (data) {
    const paymentCards = data.getPaymentCards || []
    card = paymentCards[0]
  }

  return (<Modal
    className='checkout-modal choose-payments'
    open={open}
    onClose={onClose}
    size='small'
    closeIcon='times'
  >
    <Modal.Content>
      <Modal.Header className='checkout-header'>
        {methodSelected && <View className='back-button' onClick={handleCloseSelectMethod}>
          <ArrowLeft />
          Назад
        </View>}
        <Image avatar size='tiny' src='https://cdn.ryfma.com/defaults/icons/favicon-196x196.png' alt='Ryfma' />
        {!methodSelected && <h3>{t('checkoutFormText')}</h3>}
        {/* }<p>{t('checkoutFormText')}</p> */}
      </Modal.Header>
      {methodSelected ? <View className='checkout-method-selected'>
        {(paymentType === 'mobile_balance' || paymentType === 'qiwi') ? <View className='checkout-mobile-balance'>
          <label>{t('enterPhoneNumber')}</label>
          <Input
            error={phoneNumberError}
            value={phoneNumber}
            onChange={processPhoneNumber}
            name='phoneNumber'
            type='text'
            placeholder={t('enterPhoneNumberHint')}
            className='phoneNumber'
            pattern='[0-9]*'
            icon='lock' iconPosition='right'
          />
          <Button primary onClick={handleCreatePayment}>{t('form:pay')}</Button>
        </View>
          : (paymentError
            ? <View className='adding-payment-method-loader'>
              <XCircle color='#f74160' size={32} />
              <p>{t('form:errorProcessing')}</p>
              <p>{t('form:tryProcessing')}</p>
              </View>
            : <View className='adding-payment-method-loader'>
              <Clock color='#FFBF31' size={32} />
              <p>{t('form:goToProcessing')}</p>
              <p>{t('pleaseWait')}</p>
              </View>
          )}
      </View>
        : <View className='checkout-payment-methods'>
          {currUser?.hasCard && card && <View className='checkout-one-click'>
            <h4>{t('checkoutFormFastMethod')}</h4>
            <View>
              <i aria-hidden='true' className='icon credit-card' />
              <View>
                <b>{card.cardNumberLast}</b>
                <p>{t('expires')} {card.cardExpMonth}/{card.cardExpYear}</p>
              </View>
            </View>
            <Button primary onClick={handleCreatePayment}>{t('form:payOneClick')}</Button>
          </View>}
          {currUser?.hasCard && <View className='show-more-methods'>
            <a onClick={showMoreMethods}>{t('checkoutFormOtherMethods')}</a>
          </View>}
          {showAllMethods && <View className='checkout-other-methods'>
            <View className='checkout-other-methods-wrapper'>
              <View className='bankcard-payment payment-item' onClick={selectPayment('bank_card')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_visa.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_mastercard.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_maestro.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_mir.svg' />
                  </View>
                </View>
                <h4>Банковские карты</h4>
              </View>
              <View className='yandex-payment payment-item' onClick={selectPayment('yoo_money')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_yoomoney.svg' />
                  </View>
                </View>
                <h4>ЮMoney</h4>
              </View>
              <View className='yandex-payment payment-item' onClick={selectPayment('sberbank')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_sberbank.svg' />
                  </View>
                </View>
                <h4>Сбербанк.Онлайн</h4>
              </View>
              <View className='webmoney-payment payment-item' onClick={selectPayment('alfabank')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_alfa.svg' />
                  </View>
                </View>
                <h4>Альфа-Клик</h4>
              </View>
              <View className='qiwi-payment payment-item' onClick={selectPayment('tinkoff_bank')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_tinkoff.svg' />
                  </View>
                </View>
                <h4>Тинькофф</h4>
              </View>
              <View className='qiwi-payment payment-item' onClick={selectPayment('qiwi')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_qiwi.svg' />
                  </View>
                </View>
                <h4>Qiwi</h4>
              </View>
              <View className='webmoney-payment payment-item' onClick={selectPayment('webmoney')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_webmoney.svg' />
                  </View>
                </View>
                <h4>Webmoney</h4>
              </View>
              <View className='mobile-payment payment-item' onClick={selectPayment('mobile_balance')}>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_beeline.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_mts.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_megafon.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_tele2.svg' />
                  </View>
                </View>
                <h4>Баланс телефона</h4>
              </View>
              <View className='apple-google-payment payment-item inactive'>
                <View className='logos'>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_apple.svg' />
                  </View>
                  <View className='logo-wrapper'>
                    <img src='https://cdn.ryfma.com/defaults/logos/brand_logo_google.svg' />
                  </View>
                </View>
                <h4>Apple Pay и Google Pay (недоступно)</h4>
              </View>
              {allowCoinsPayment && <View className='coins-payment payment-item' onClick={handleCoinsPayment}>
                <View className='logos'>
                  <span className="currency"><i aria-hidden="true" className="icon copyright"></i></span>
                </View>
                <h4>Оплатить монетами</h4>
              </View>}
            </View>
            <View className='payment-warning'>
              {t('form:paymentWarn2')} <a href='mailto:info@ryfma.com'>{t('form:paymentWarn3')}</a>
            </View>
          </View>}
          </View>}
    </Modal.Content>
  </Modal>
  )
}

export default CheckoutForm

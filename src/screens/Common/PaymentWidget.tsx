import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import Link from '~components/Common/Link'
import { useTranslation } from 'react-i18next'
import Lock from 'react-feather/dist/icons/lock'
import HelpCircle from 'react-feather/dist/icons/help-circle'
import { Form, Button, Input, Popup } from 'semantic-ui-react'
import addCard from '~graphqls/mutations/Card/addCard'
import { Notification } from '~components/Notification/Notification'
import Loader from '~components/Common/Loader'

function PaymentWidget ({ amount, language, returnUrl, isRecurrent, isAddCard, isSubscribe, isUpgrade, sponsorUser, closeAddCard, createOrder }) {
  const [t] = useTranslation(['account', 'form'])

  const [checkoutForm, setCheckoutForm] = useState(null)
  const [cardFormLoaded, setCardFormLoaded] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState(amount || 1.00)
  const [openLoader, setOpenLoader] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const [addCardMutation] = useMutation(addCard)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const yandexCheckoutScript = document.createElement('script')
      yandexCheckoutScript.type = 'text/javascript'
      yandexCheckoutScript.src = 'https://kassa.yandex.ru/checkout-ui/v2.js'

      document.head.appendChild(yandexCheckoutScript)
      yandexCheckoutScript.onload = async () => {
        if (isAddCard) {
          const checkout = window.YandexCheckout(550026, {
              language: language || 'ru',
              amount: amount || 1.00,
              isRecurrent: !!isRecurrent
            })
          setCheckoutForm()
          setCardFormLoaded(true)
          //Отображение платежной форме в заданном элементе
          checkout.render('payment-form')
        }
      }
    }
  }, [])

  const addPaymentMethod = async () => {
    if (checkoutForm) {
      const res = await checkoutForm.tokenize({
        number: cardNumber,
        cvc: cardCVV,
        month: cardMonth,
        year: cardYear
      })
      if (res && res.status === 'success') {
        setOpenLoader(true)
        const { paymentToken } = res.data.response

        const currency = 'RUB'
        const cardObject = {
          amount: parseInt(paymentAmount, 10),
          currency,
          paymentToken,
          paymentType: 'bank_card',
          cardNumberLast: 'xxxx ' + cardNumber.substr(cardNumber.length - 4),
          cardExpMonth: cardMonth,
          cardExpYear: cardYear,
          isRecurrent: !!isRecurrent,
          returnUrl: returnUrl
        }
        if (isSubscribe || isUpgrade) {
          sponsorUser(cardObject)
          return
        }
        try {
          const result = await addCardMutation({ variables: cardObject })
          if (result) {
            if (result.data.addCard.confirmation) {
              if (result.data.addCard.confirmation.type === 'redirect') {
                window.location.replace(result.data.addCard.confirmation.confirmation_url)
              }
            }
            setOpenLoader(false)
            setCardNumber('')
            setCardCVV('')
            setCardMonth('')
            setCardYear('')
            if (closeAddCard) {
              closeAddCard()
              Notification.success('Платежный метод добавлен успешно!')
            }
            if (createOrder) {
              createOrder()
            }
          }
        } catch (err) {
          Notification.error(err)
        }
      } else {
        if (res.error) {
          if (res.error.type === 'validation_error') {
            const errors = {}
            for (let i = 0; i < res.error.params.length; i++) {
              const err = res.error.params[i]
              if (err.code === 'invalid_number') {
                setErrorNumber(true)
              }
              if (err.code === 'invalid_expiry_month') {
                setErrorMonth(true)
              }
              if (err.code === 'invalid_expiry_year') {
                setErrorYear(true)
              }
            }
            Notification.error('Ошибка добавления платежного метода')
          }
        } else {
          Notification.error('Ошибка добавления платежного метода')
        }
      }
    }
  }

  const handleInputChange = (event) => {
    const target = event.target
    const name = target.name
    const value = target.value
    const re = /^[0-9\b]+$/
    if (value === '' || re.test(value)) {
      if (name === 'cardNumber') {
        setCardNumber(value)
        setErrorNumber(false)
      } else if (name === 'cardMonth') {
        setCardMonth(value)
        setErrorMonth(false)
      } else if (name === 'cardYear') {
        setCardYear(value)
        setErrorYear(false)
      } else {
        setState({
          [name]: value
        })
      }
    }
  }

  if (!cardFormLoaded) {
    return <Loader />
  }

  return (<View id="payment-form"></View>)

  return (
    <View className={isAddCard || isUpgrade ? 'add-payment-modal' : 'add-payment-modal blueCard'}>
      {isAddCard && !isUpgrade && <h2>{t('form:cardDetails')}</h2>}
      {openLoader && <View className='adding-payment-method-loader'>
        <Loader />
        <p>{t('addingPaymentMethod')}</p>
        <p>{t('pleaseWait')}</p>
      </View>}
      {!openLoader && <Form>
        {/* isAddCard && !isUpgrade && <Form.Field>
          <label>{t('paymentAmount')}</label>
          <b>{paymentAmount} RUB</b>
        </Form.Field> */}
        <Form.Field>
          <label>{t('form:cardNumber')}</label>
          <Input
            error={errorNumber}
            value={cardNumber}
            onChange={handleInputChange}
            name='cardNumber'
            type='text'
            placeholder={t('form:cardNumberHint')}
            className='card-number'
            maxLength={19}
            pattern='[0-9]*'
          />
        </Form.Field>
        <View className='equal width fields'>
          <Form.Field>
            <label>{t('form:cardExpDate')}</label>
            <View className='card-exp'>
              <Input
                error={errorMonth}
                value={cardMonth}
                onChange={handleInputChange}
                name='cardMonth'
                type='text'
                placeholder={t('form:cardExpMonthHint')}
                className='month'
                maxLength={2}
                pattern='[0-9]*'
              />
              <View className='card-separator'>/</View>
              <Input
                error={errorYear}
                value={cardYear}
                onChange={handleInputChange}
                name='cardYear'
                type='text'
                placeholder={t('form:cardExpYearHint')}
                className='year'
                maxLength={4}
                pattern='[0-9]*'
              />
            </View>
          </Form.Field>
          <Form.Field className='card-cvv'>
            <label>
              {t('form:cardCVV')}
              <Popup
                trigger={<HelpCircle size={16} />}
                content={t('form:cardCVVHint')}
                positioning='top center'
                size='mini'
                inverted
              />
            </label>
            <Input
              error={errorCVV}
              value={cardCVV}
              onChange={handleInputChange}
              name='cardCVV'
              type='text'
              maxLength={4}
              pattern='[0-9]*'
            />
          </Form.Field>
        </View>
      </Form>}
      {!openLoader && <View className='actions'>
        {/* <View className='error'>{t('common:releaseSoon')}</View> */}
        {isUpgrade &&
          <Button positive onClick={addPaymentMethod} disabled={isButtonDisabled}>
            <Lock size={16} />
            {t('form:pay')}&nbsp;{amount}₽/мес
          </Button>}
        {isAddCard && !isUpgrade &&
          <Button positive onClick={addPaymentMethod} disabled={isButtonDisabled}>
            <Lock size={16} />
            {t('form:saveCard')}
          </Button>}
        {isSubscribe &&
          <Button positive onClick={addPaymentMethod} disabled={isButtonDisabled}>
            <Lock size={16} />
            {t('form:sponsor')}
          </Button>}
        {!isAddCard && !isSubscribe && !isUpgrade && <Button positive onClick={addPaymentMethod} disabled={isButtonDisabled}>
          <Lock size={16} />
          {t('form:payCard')}
        </Button>}
        {isAddCard && !isUpgrade && <p className='hint'>{t('form:tempHoldHint')}</p>}
        {(isSubscribe || isUpgrade) && <p className='hint'>Ваш банк может взимать комиссионные сборы за международные транзакции и обмен валюты.</p>}
        {isSubscribe && <p className='hint'>Нажимая "Спонсировать", вы подтверждаете, что вам есть 18 лет, и принимаете <Link to='/terms'>Условия использования Ryfma</Link>. Если вы откажетесь от подписки до окончания расчетного периода, средства за оставшиеся дни возвращены не будут.</p>}
        {isSubscribe && <p className='hint'>Продолжая, вы принимаете <Link to='/privacy' target='_blank'>Соглашение о конфиденциальности</Link></p>}
        {isUpgrade && <p className='hint'>Продолжая, вы подтверждаете, что ознакомились с <Link to='/terms-premium' target='_blank'>Условиями использования Премиум</Link> и принимаете <Link to='/privacy' target='_blank'>Соглашение о конфиденциальности</Link></p>}
        <View className='payment-bottom'>
          <View>
            <Lock size={16} />
            {t('form:httpsSSL')}
          </View>
          <img src='https://cdn.ryfma.com/defaults/icons/verified-visa-master.jpg' />
        </View>
      </View>}
    </View>
  )
}

export default PaymentWidget

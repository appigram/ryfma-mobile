import React, {useEffect, useState} from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react'
import Link from '~components/Common/Link'
import { Modal, Form, Button } from 'semantic-ui-react'
import debounce from 'lodash.debounce'
import { useAuth } from '~hooks'
import UserInfoVertical from '~components/Users/UserInfoVertical'
import Share from '~components/Common/Share'
import EmptyView from '~components/Common/EmptyView'

import { Notification } from '~components/Notification/Notification'
import GET_PAID_USERS_FULL from '~graphqls/queries/Common/getPaidUsersFull'
import SEARCH_USERS_FULL from '~graphqls/queries/Search/searchUsersFull'
import SAVE_PROFILE from '~graphqls/mutations/User/saveProfile'
import SKIP_WELCOME_TOUR from '~graphqls/mutations/User/skipWelcomeTour'
import store from '~store'
import ReactGA from 'react-ga'

function WelcomeTour ({ steps, skippedWelcomeTour, handleCloseWelcomeTour }) {
  const [t] = useTranslation('home')
  const [searchUsers, setSearchUsers] = useState([])
  const [activeStep, setActiveStep] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const { currUser, setCurrUser } = useAuth()

  const [age, setAge] = useState(currUser.profile.age || 18)
  const [city, setCity] = useState(currUser.profile.city)
  const [skippedBefore, setSkippedBefore] = useState(skippedWelcomeTour)

  // Queries and Mutations
  const { loading, error, data: paidUsersData } = useQuery(GET_PAID_USERS_FULL, {
    variables: {
      limit: 30
    }
  })

  const [ loadSearchUsers, searchUsersData ] = useLazyQuery(SEARCH_USERS_FULL)
  const [saveProfileMutation] = useMutation(SAVE_PROFILE)
  const [skipWelcomeTour] = useMutation(SKIP_WELCOME_TOUR)

  const onCloseWelcomeTour = () => {
    const currDate = new Date()
    const nextDate = currDate.setDate(currDate.getDate() + 7)
    store.setItem('Meteor.nextShowWelcomeTour', JSON.stringify(nextDate))
    handleCloseWelcomeTour()
  }

  const handleSkipWelcomeTour = (times) => () => {
    if (times) {
      try {
        if ((times + 1) > 7) {
          ReactGA.event({
            category: 'Common',
            action: 'WelcomeTour',
            label: `WelcomeTour Done: ${currUser._id}`,
            value: times
          })
        } else {
          ReactGA.event({
            category: 'Common',
            action: 'WelcomeTour',
            label: `WelcomeTour: ${currUser._id}, skippedOnStep:${times}`,
            value: times
          })
        }
      } catch (err) {
      }
      skipWelcomeTour({ variables: { times: times + 1 } })
    }
    onCloseWelcomeTour()
  }

  const handleActiveStep = (step) => () => {
    if (steps.includes(2) && step === 3) {
      handleSaveProfile()
    }
    setActiveStep(step)
    setSkippedBefore(step - 1)
  }

  const handleSaveProfile = async () => {
    if (age && city) {
      const newAge = parseInt(age, 10)
      const newCity = city.toString()

      try {
        await saveProfileMutation({ variables: { age: newAge, city: newCity } })
        currUser.profile.age = newAge
        currUser.profile.city = newCity
        setCurrUser(currUser)
        Notification.success(t('notif:accountUpdated'))
      } catch (error) {
        Notification.error(error)
      }
    }
  }

  const handleSearchChange = debounce((e, data) => {
    let keyword = data.value || ''
    if (keyword.length < 1) {
      return
    }

    keyword = keyword.replace(new RegExp(':\\[', 'g'), '/\\')
    loadSearchUsers({
      variables: { keyword },
      onCompleted: (graphQLResult) => {
        const { errors, data } = graphQLResult

        if (errors) {
        } else {
          setSearchKeyword(keyword)
          setSearchUsers(data.searchUsers)
        }
      }
    })
  }, 750)

  const handleInputChange = (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    if (name === 'age') setAge(value)
    if (name === 'city') setCity(value)
  }

  const moveToStep = (step) => () => handleActiveStep(step)

  const renderFollowUsersStep = () => {
    if (loading) {
      return null
    }

    if (error && paidUsersData) {
      return (<View className='error'>{paidUsersData.error}</View>)
    }

    const premiumUsers = paidUsersData ? paidUsersData.getPaidUsersFull : []
    const nextStep = steps.includes(2) ? 2 : 3
    return (<View className='welcome-tour-wrapper search-users'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/welcome/welcome-min.png' className='welcome-img' />
        <h1>{t('searchUsersHeader')}</h1>
        <p>{t('searchUsersDesc')}</p>
        <Form.Input placeholder={t('searchUsers')} className='search-field' defaultValue={searchKeyword} onChange={handleSearchChange} icon='search' iconPosition='left' />
      </View>
      <View className='content'>
        {searchUsers.length === 0 && searchKeyword && <View className='search-users-result'>
          <EmptyView iconName='users' header={t('emptyUserHeader')} text={t('emptyUserText')} />
        </View>}
        {searchUsers.length > 0 && searchKeyword && <View className='search-users-result'>
          <h2>{t('searchUsersResult')}</h2>
          {searchUsers.map(user => <UserInfoVertical key={user._id} user={user} />)}
        </View>}
        {premiumUsers && <View className='premium-users-result'>
          <h2>{t('searchUsersPremium')}<Link to='/upgrade' target='_blank'>{t('searchUsersWantPremium')}</Link></h2>
          {premiumUsers.map(user => <UserInfoVertical key={user._id} user={user} />)}
        </View>}
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleActiveStep(nextStep)} className='next-button primary'>{t('next')}</Button>
      </View>
    </View>)
  }

  const renderAgeCityStep = () => {
    return (<View className='welcome-tour-wrapper age-city'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/welcome/welcome-min.png' className='welcome-img' />
        <h1>{t('askAgeAndCityHeader')}</h1>
        <p>{t('askAgeAndCityDesc')}</p>
      </View>
      <View className='content'>
        <Form onSubmit={handleSaveProfile}>
          <Form.Input placeholder={t('enterYourAge')} name='age' className='age-city-field' defaultValue={age} label={t('enterYourAge')} onChange={handleInputChange} />
          <Form.Input placeholder={t('enterYourCity')} name='city' className='age-city-field' defaultValue={city} label={t('enterYourCity')} onChange={handleInputChange} />
        </Form>
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleActiveStep(3)} className='next-button primary'>{t('next')}</Button>
      </View>
    </View>)
  }

  const renderSponsorsStep = () => {
    return (<View className='welcome-tour-wrapper sponsors'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/welcome/money-min.png' className='welcome-img' />
        <h1>{t('enableSponsorsHeader')}</h1>
        <p>{t('enableSponsorsDesc')}</p>
      </View>
      <View className='content'>
        <Link to='/me/tiers' target='_blank' className='ui button primary'>{t('enableSponsorsButton')}</Link>
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleActiveStep(4)} className='next-button primary'>{t('next')}</Button>
      </View>
    </View>)
  }

  const renderPremiumStep = () => {
    const checkIcon = <i aria-hidden='true' className='icon check-circle' />
    return (<View className='welcome-tour-wrapper premium'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/welcome/premium-min.png' className='welcome-img' />
        <h1>{t('enablePremiumHeader')}</h1>
        <p>{t('enablePremiumDesc')}</p>
      </View>
      <View className='content'>
        <ul>
          <li>
            {checkIcon}
            <span>Никакой рекламы, чистый и быстрый интерфейс.</span>
          </li>
          <li>
            {checkIcon}
            <span>Оповещения для ваших читателей о новых публикациях, даже если их нет на сайте!</span>
          </li>
          <li>
            {checkIcon}
            <span>Попадание в рекомендации: в поиске, в блок &quot;Сегодня читают&quot; и в Ознакомительный тур</span>
          </li>
          <li>
            {checkIcon}
            <span>Повышенный процент дохода от продаж и подписок</span>
          </li>
          <li>
            {checkIcon}
            <span>Удивительная Тёмная тема и комфортная Книжная тема для чтения</span>
          </li>
          <li>
            {checkIcon}
            <span>Поддержка развития любимого сайта!</span>
          </li>
          <li>
            {checkIcon}
            <span>И многое другое...</span>
          </li>
        </ul>
        <Link to='/upgrade' target='_blank' className='ui button primary'>{t('enablePremiumButton')}</Link>
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleActiveStep(6)} className='next-button primary'>{t('next')}</Button>
      </View>
    </View>)
  }

  const renderEventsStep = () => {
    return (<View className='welcome-tour-wrapper events'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/banners/Events.png' className='share-cat' />
        <h1>{t('enableEventsHeader')}</h1>
        <p>{t('enableEventsDesc')}</p>
      </View>
      <View className='content'>
        <Link to='/e/all' target='_blank' className='ui button primary'>{t('enableEventsButton')}</Link>
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleActiveStep(6)} className='next-button primary'>{t('next')}</Button>
      </View>
    </View>)
  }

  const renderContestsStep = () => {
    return (<View className='welcome-tour-wrapper contests'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/banners/Contests.png' className='share-cat' />
        <h1>{t('enableContestsHeader')}</h1>
        <p>{t('enableContestsDesc')}</p>
      </View>
      <View className='content'>
        <Link to='/f/all' target='_blank' className='ui button primary'>{t('enableContestsButton')}</Link>
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleActiveStep(7)} className='next-button primary'>{t('next')}</Button>
      </View>
    </View>)
  }

  const renderShareProfileStep = () => {
    return (<View className='welcome-tour-wrapper share-profile'>
      <View className='header'>
        <img src='https://cdn.ryfma.com/defaults/icons/Share_cat.svg' className='welcome-img' />
        <h1>{t('enableShareHeader')}</h1>
        <p>{t('enableShareDesc')}</p>
      </View>
      <View className='content'>
        <View className='share-block'>
          <Share
            type='big'
            shareUrl={`/u/${currUser.username}`}
            title={`Моя страница &quot;${currUser.profile.name}&quot; на Ryfma. Подписывайся и читай!`}
            allSocials
          />
        </View>
      </View>
      <View className='actions'>
        <a onClick={handleSkipWelcomeTour(skippedBefore + 3)} className='skip-tour'>{t('skipWelcomeTour')}</a>
        <View className='dots'>
          {steps.map(step => <span key={step} className={activeStep === step ? 'active dot' : 'dot'} onClick={moveToStep(step)}></span>)}
        </View>
        <Button onClick={handleSkipWelcomeTour(7)} className='next-button primary'>{t('done')}</Button>
      </View>
    </View>)
  }

  return (<Modal
    className='welcomeTourModal'
    closeIcon='times'
    open
    onClose={onCloseWelcomeTour}
    centered={false}
  >
    <Modal.Content scrolling>
      {activeStep === 1 && renderFollowUsersStep()}
      {activeStep === 2 && renderAgeCityStep()}
      {activeStep === 3 && renderSponsorsStep()}
      {activeStep === 4 && renderPremiumStep()}
      {/* activeStep === 5 && renderEventsStep() */}
      {activeStep === 6 && renderContestsStep()}
      {activeStep === 7 && renderShareProfileStep()}
    </Modal.Content>
  </Modal>)
}

export default WelcomeTour

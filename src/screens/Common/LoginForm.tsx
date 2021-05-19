import React, { useState } from 'react'
import Link from '~components/Common/Link'
import { useTranslation } from 'react-i18next'
import { Modal } from 'semantic-ui-react'

function LoginForm ({ referer, handleCloseLoginForm }) {
  const[t] = useTranslation(['contest', 'form'])
  const [openLoginModal, setOpenLoginModal] = useState(true)

  const loginUrl = referer ? `/login?referer=${referer}` : '/login'
  const registerUrl = referer ? `/register?referer=${referer}` : '/register'
  return (
    <Modal
      className='loginForm'
      size='tiny'
      closeIcon='times'
      open={openLoginModal}
      onClose={() => {
        setOpenLoginModal(false)
        if (handleCloseLoginForm) handleCloseLoginForm()
      }}
    >
      <h1>{t('form:loginFormTitle')}</h1>
      <p>{t('form:loginFormText')}</p>
      <Modal.Content>
        <View className='first-post-msg no-user'>
          <h3>{t('doYouHaveAccount')}</h3>
          <Link className='ui huge button primary' to={loginUrl} rel='noopener nofollow'>{t('loginRyfma')}</Link>
          <View className='divider' />
          <h3>{t('noAccountYet')}</h3>
          <Link className='ui huge button red' to={registerUrl} rel='noopener nofollow'>{t('createRyfma')}</Link>
        </View>
      </Modal.Content>
    </Modal>
  )
}

export default LoginForm

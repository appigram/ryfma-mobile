import React,  {useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button } from 'semantic-ui-react'
import { Notification } from '~components/Notification/Notification'
import { useMutation } from '@apollo/client/react'
import blockUser from '~graphqls/mutations/User/blockUser'
import { useAuth } from '~hooks'
import ReactGA from 'react-ga'

function BlockForm ({ userId, objectTypeBlock, username, openBlockForm, handleCloseBlockForm }) {
  const [t] = useTranslation('notif')
  const { currUserId } = useAuth()
  // const [blockType, setBlockType] = useState(null)

  const [blockUserMutation] = useMutation(blockUser)

  const handleBlockUser = async () => {
    if (!currUserId) {
      Notification.error(
        'Войдите в свой аккаунт, чтобы добавить аккаунт в черный список'
      )
      return
    }
    try {
      const isBlocked = await blockUserMutation({ variables: { userId: userId } })
      ReactGA.event({
        category: 'BlockUser',
        action: `${objectTypeBlock}`,
        label: `BlockUser: ${userId}, type: ${objectTypeBlock}`,
        value: 1
      })
      handleCloseBlockForm(isBlocked)
    } catch (error) {
      Notification.error(error)
    }
  }

  return (<Modal
    className='blockModal'
    closeIcon='times'
    size='small'
    open={openBlockForm}
    onClose={handleCloseBlockForm}
    style={{ width: '45%' }}
  >
    <Modal.Content>
      <h2>{t('common:blockUserHeader')}{username}</h2>
      <p>{t('common:blockUserHint')}</p>
      <br />
      <Button color='red' onClick={handleBlockUser}>
        {t('common:blockUser')}
      </Button>
      <Button color='grey' onClick={handleCloseBlockForm}>
        {t('common:cancel')}
      </Button>
    </Modal.Content>
  </Modal>
  )
}

export default BlockForm

import React from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Notification } from '~components/Notification/Notification'
import AlbumEditorWrapper from './AlbumEditorWrapper'
import { useMutation } from '@apollo/client/react'
import createNewAlbum from '~graphqls/mutations/Album/createNewAlbum'
import ReactGA from 'react-ga'
import { useAuth } from '~hooks'

function NewAlbum () {
  const [t] = useTranslation('notif')
  const history = useHistory()
  const { currUserId } = useAuth()

  const [createNewAlbumMutation] = useMutation(createNewAlbum)

  const handleCreate = async (params) => {
    try {
      const response = await createNewAlbumMutation({ variables: params })
      Notification.success(t('notif:albumCreated'))
      ReactGA.event({
        category: 'Album',
        action: 'AlbumCreated',
        label: `AlbumCreated: ${currUserId}, ${response.data.createNewAlbum._id}`,
        value: 1
      })
      history.push(`/album/${response.data.createNewAlbum._id}?refresh=true`)
    } catch (error) {
      Notification.error(error)
    }
  }

  if (!currUserId) {
    return <Redirect to='/login?referer=/new-album' />
  }

  const initData = {
    title: '',
    description: '',
    isPrivate: false
  }

  return (
    <AlbumEditorWrapper initData={initData} createAlbum={handleCreate} currUserId={currUserId} />
  )
}

export default NewAlbum

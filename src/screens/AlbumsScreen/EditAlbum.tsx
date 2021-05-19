import React from 'react'
import { Redirect, useParams, useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import NotFound from '~pages/NotFound'
import Loader from '~components/Common/Loader'
import { Notification } from '~components/Notification/Notification'
import AlbumEditorWrapper from './AlbumEditorWrapper'
import { useQuery, useMutation } from '@apollo/client/react'
import getAlbumInfo from '~graphqls/queries/Album/getAlbumInfo'
import updateAlbum from '~graphqls/mutations/Album/updateAlbum'
import deleteAlbum from '~graphqls/mutations/Album/deleteAlbum'
import ReactGA from 'react-ga'
import { useAuth } from '~hooks'

function EditAlbum () {
  const [t] = useTranslation('notif')
  const history = useHistory()
  const { albumId } = useParams()
  const { currUser, currUserId } = useAuth()

  const { loading, error, data } = useQuery(getAlbumInfo, {
    skip: !currUserId,
    variables: {
      albumId: albumId
    },
    fetchPolicy: 'network-only'
  })
  const [updateAlbumMutation] = useMutation(updateAlbum)
  const [deleteAlbumMutation] = useMutation(deleteAlbum)

  if (!currUserId) {
    return <Redirect to={`/login?referer=/album/${albumId}/edit`} />
  }

  const handleUpdate = async (params) => {
    const albumVariables = {
      _id: albumId,
      ...params
    }

    try {
      await updateAlbumMutation({ variables: albumVariables })
      Notification.success(t('notif:albumUpdated'))
      history.push(`/album/${albumId}?refresh=true`)
    } catch (error) {
      Notification.error(error)
    }
  }

  const handleDelete = async (albumId) => {
    try {
      await deleteAlbumMutation({ variables: { _id: albumId } })
      Notification.success(t('notif:albumDeleted'))
      ReactGA.event({
        category: 'Album',
        action: 'AlbumDeleted',
        label: `AlbumDeleted: ${currUser._id}, ${albumId}`,
        value: 1
      })
      history.push(`/u/${currUser.username}/albums?refresh=true`)
    } catch (error) {
      Notification.error(error)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <NotFound />
  }

  const initData = {
    ...data.album,
  }

  return (
    <AlbumEditorWrapper
      initData={initData}
      deleteAlbum={handleDelete}
      updateAlbum={handleUpdate}
      currUserId={currUserId}
      isEditMode
    />
  )
}

export default EditAlbum

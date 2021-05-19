import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TimeAgo from 'react-timeago'
import {
  Form,
  Modal,
  Item,
  Checkbox,
  Button
} from 'semantic-ui-react'
import { Notification } from '~components/Notification/Notification'
import EmptyView from '~components/Common/EmptyView'
import Loader from '~components/Common/Loader'
import getLatestAlbumsFull from '~graphqls/queries/Album/getLatestAlbumsFull'
import savePost from '~graphqls/mutations/Post/savePost'
import unSavePost from '~graphqls/mutations/Post/unSavePost'
import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '~hooks'
import ReactGA from 'react-ga'

const { Content, Image } = Item

let CreateAlbumModal = () => null

function AddToAlbum ({ postId, initSelectedAlbums = [], initUnselectedAlbums = [], openAddToAlbumModal, handleCloseAddToAlbum }) {
  const [t] = useTranslation('album')
  const { currUserId } = useAuth()

  const [filteredAlbum, setFilteredAlbum] = useState('')
  const [selectedAlbums, setSelectedAlbums] = useState(initSelectedAlbums || [])
  const [unSelectedAlbums, setUnSelectedAlbums] = useState(initUnselectedAlbums || [])
  const [openCreateAlbumModal, setOpenCreateAlbumModal] = useState(false)

  const { loading, error, data } = useQuery(getLatestAlbumsFull, {
    variables: {
      type: 'latest',
      userId: currUserId
    },
    fetchPolicy: 'network-only'
  })

  const [savePostMutation] = useMutation(savePost)
  const [unSavePostMutation] = useMutation(unSavePost)

  const handleFilterAlbum = (e, {value}) => setFilteredAlbum(value)

  const handleCreateAlbum = (e, {value}) => {
    import('~components/Albums/Modals/CreateAlbum').then(module => {
      CreateAlbumModal = module.default
      setOpenCreateAlbumModal(true)
    })
  }

  const handleAddToAlbum = async () => {
    if (!currUserId) {
      Notification.error('Войдите в свой аккаунт, чтобы добавить в избранное')
      return
    }

    if (unSelectedAlbums && unSelectedAlbums.length > 0) {
      let intersectionArr = []
      if (unSelectedAlbums.length > initUnselectedAlbums.length) {
        intersectionArr = unSelectedAlbums.filter(value => !initUnselectedAlbums.includes(value))
      } else {
        intersectionArr = initUnselectedAlbums.filter(value => !unSelectedAlbums.includes(value))
      }
      if (intersectionArr.length > 0) {
        try {
          await unSavePostMutation({
            variables: {
              _id: postId,
              userId: currUserId,
              albums: intersectionArr
            }
          })
          ReactGA.event({
            category: 'Post',
            action: 'PostUnsaved',
            label: `PostUnsaved: ${currUserId}, pId: ${postId}`,
            value: 1
          })
          Notification.success(t('notif:postUnSavedFromCollection'))
        } catch (error) {
          Notification.error(error)
        }

      }
    }

    if (selectedAlbums && selectedAlbums.length > 0) {
      let intersectionArr = []
      if (selectedAlbums.length > initSelectedAlbums.length) {
        intersectionArr = selectedAlbums.filter(value => !initSelectedAlbums.includes(value))
      } else {
        intersectionArr = initSelectedAlbums.filter(value => !selectedAlbums.includes(value))
      }
      if (intersectionArr.length > 0) {
        try {
          await savePostMutation({
            variables: {
              _id: postId,
              userId: currUserId,
              albums: intersectionArr
            }
          })
          ReactGA.event({
            category: 'Post',
            action: 'PostSaved',
            label: `PostSaved: ${currUserId}, pId: ${postId}`,
            value: 1
          })
          Notification.success(t('notif:postSavedToCollection'))
        } catch (error) {
          Notification.error(error)
        }
      }
    }

    let newSavedCount = 0
    if (initSelectedAlbums.length === 0 && selectedAlbums.length > 0) {
      newSavedCount = 1
    } else if ((initSelectedAlbums.length === unSelectedAlbums.length) && selectedAlbums.length === 0) {
      newSavedCount = -1
    }

    handleCloseAddToAlbum({ newSavedCount, selectedAlbums, unSelectedAlbums })
  }

  const handleCloseCreateAlbum = (status) => {
    setOpenCreateAlbumModal(status)
  }

  const handleSelectAlbum = (checked, albumId) => {
    if (!checked) {
      setSelectedAlbums([...selectedAlbums, albumId])
      if (unSelectedAlbums.includes(albumId)) {
        const newUnSelectedAlbums = [...unSelectedAlbums]
        const index = newUnSelectedAlbums.indexOf(albumId)
        newUnSelectedAlbums.splice(index, 1)
        setUnSelectedAlbums(newUnSelectedAlbums)
      }
    } else {
      const newSelectedAlbums = [...selectedAlbums]
      const index = newSelectedAlbums.indexOf(albumId)
      if (index !== -1) {
        setUnSelectedAlbums([albumId, ...unSelectedAlbums])
        newSelectedAlbums.splice(index, 1)
      }
      setSelectedAlbums(newSelectedAlbums)
    }
  }

  const renderAddToAlbum = () => {
    return (<>
      <View className='header'>
        <h4>{t('addPostToAlbum')}</h4>
        <Form.Input placeholder={t('filterAlbums')} className='search-field' defaultValue={filteredAlbum} onChange={handleFilterAlbum} icon='search' iconPosition='left' />
      </View>
      <View className='albums-list-view'>
      {albumsFiltered && albumsFiltered.length > 0
        ? albumsFiltered.map((album, index) => {
          const coverImg = album.coverImg || 'https://cdn.ryfma.com/defaults/icons/default_full_avatar.jpg'
          const isAlbumSelected = selectedAlbums.includes(album._id)
          return (
            <Item key={album._id} className={ isAlbumSelected ? 'album-list-item active' : 'album-list-item'} onClick={() => handleSelectAlbum(isAlbumSelected, album._id)}>
              <Image source={{ uri: coverImg.replace('_full_', '_middle_')} alt={album.title} />
              <Content>
                <View>
                  <h4>{album.title}</h4>
                  <View>{album.postCount} {t('posts')}</View>
                  <View className='updated'>{t('updated')} <TimeAgo date={album.updatedAt} /></View>
                </View>
                <Form.Field className='select-box'>
                  <Checkbox
                    checked={isAlbumSelected}
                    onChange={(event, { checked }) => handleSelectAlbum(checked, album._id)}
                  />
                </Form.Field>
              </Content>
            </Item>)
        })
        : <EmptyView iconName='boxes' header={t('noAlbums')} text={t('noAlbumsMeText')} />}
      </View>
      <View className='actions'>
        <Button onClick={handleAddToAlbum} primary>{t('common:done')}</Button>
        <Button onClick={handleCreateAlbum} basic>{t('createNewAlbum')}</Button>
      </View>
    </>)
  }

  const renderCreateAlbum = () => {
    return (<CreateAlbumModal currUserId={currUserId} handleCloseCreateAlbum={handleCloseCreateAlbum} />)
  }

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <View className='error'>{error.reason || error.message}</View>
  }

  const albums = data.albums

  let albumsFiltered = albums || []

  if (filteredAlbum) {
    albumsFiltered = albums.filter(item => {
      if (item.title) {
        const title = item.title.toLowerCase()
        if (title.includes(filteredAlbum.toLowerCase())) {
          return item
        }
      }
    })
  }

  return (<Modal
    className='addToAlbumModal'
    closeIcon='times'
    size='tiny'
    open={openAddToAlbumModal || openCreateAlbumModal}
    onClose={() => handleCloseAddToAlbum(false, false)}
  >
    <Modal.Content scrolling={false}>
      {openCreateAlbumModal ? renderCreateAlbum() : renderAddToAlbum()}
    </Modal.Content>
  </Modal>)
}

export default AddToAlbum

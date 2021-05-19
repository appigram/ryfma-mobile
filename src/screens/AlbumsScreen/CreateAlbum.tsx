import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import getSlug from 'speakingurl'
import { Notification } from '~components/Notification/Notification'
import { Slingshot } from 'meteor/edgee:slingshot'
import { uploadBlobToS3 } from '~uploadToCloud'
import {
  Form,
  Item
} from 'semantic-ui-react'
import ImageEditor from '~components/Common/ImageEditor'
import { useMutation } from '@apollo/client/react'
import createNewAlbum from '~graphqls/mutations/Album/createNewAlbum'
import getLatestAlbumsFull from '~graphqls/queries/Album/getLatestAlbumsFull'
import ReactGA from 'react-ga'

const { Content } = Item

function AlbumEditorWrapper ({ currUserId, handleCloseCreateAlbum }) {
  const [t] = useTranslation('album')

  const [metaContext, setMetaContext] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [albumId, setAlbumId] = useState(null)
  const [title, setTitle] = useState('')
  const [coverImg, setCoverImg] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isPersonal, setIsPersonal] = useState(false)
  const [errTitle, setErrTitle] = useState(false)

  const [createNewAlbumMutation] = useMutation(createNewAlbum)

  useEffect(() => {
    const imageRestrictions = {
      allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'],
      maxSize: 2 * 1024 * 1024 // 2 MB (use null for unlimited)
    }
    Slingshot.fileRestrictions('albumFullImage', imageRestrictions)
    Slingshot.fileRestrictions('albumMiddleImage', imageRestrictions)
    Slingshot.fileRestrictions('albumSmallImage', imageRestrictions)
  }, [])

  const submitAlbumForm = async (coverImg) => {
    if (!title) {
      Notification.error(t('addAlbumTitle'))
      setErrTitle(true)
      return
    }

    const albumVariables = {
      title,
      slug: getSlug(title, { lang: 'ru' }),
      description,
      status: 2, // One of pending (`1`), approved (`2`), or deleted (`3`)
      sticky: false,
      coverImg,
      isPrivate,
      isPersonal
    }

    try {
      const response = await createNewAlbumMutation({
        variables: albumVariables,
        optimisticResponse: null,
        update: (cache, { data: { createNewAlbum } }) => {
          // Fetch the albums from the cache
          const existingAlbums = cache.readQuery({
            query: getLatestAlbumsFull,
            variables: {
              type: 'latest',
              userId: currUserId
            }
          })
          // Add the new todo to the cache
          const newAlbums = existingAlbums ? [{...createNewAlbum, ...albumVariables}, ...existingAlbums.albums] : [{...createNewAlbum, ...albumVariables}]
          cache.writeQuery({
            query: getLatestAlbumsFull,
            variables: {
              type: 'latest',
              userId: currUserId
            },
            data: {
              albums: newAlbums
            }
          })
        }
      })
      Notification.success(t('notif:albumCreated'))
      ReactGA.event({
        category: 'Album',
        action: 'AlbumCreated',
        label: `AlbumCreated: ${currUserId}, ${response.data.createNewAlbum._id}`,
        value: 1
      })
      handleCloseCreateAlbum(false)
    } catch (error) {
      Notification.error(error)
    }
  }

  const updateCanvasData = (metaContext) => {
    setMetaContext(metaContext)
    setCoverImg('')
  }

  const uploadImagesToS3 = (event) => {
    event.preventDefault()
    const filename = getSlug(metaContext.filename, { lang: 'ru' })
    if (metaContext.fullCanvas) {
      setImageUploading(true)
      const timeNow = Date.now()
      const fullUploader = new Slingshot.Upload('albumFullImage', {
        filename: filename,
        filenamePrefix: 'album_full_',
        time: timeNow,
        albumId: null,
        userId: currUserId
      })
      const middleUploader = new Slingshot.Upload('albumMiddleImage', {
        filename: filename,
        filenamePrefix: 'album_middle_',
        time: timeNow,
        albumId: null,
        userId: currUserId
      })
      uploadBlobToS3(middleUploader, metaContext.middleCanvas) // async
      const fullImageUrl = uploadBlobToS3(fullUploader, metaContext.fullCanvas) // async, but waiting response
      fullImageUrl.then(
        function (src) {
          const coverImg = src.replace(
            's3-eu-central-1.amazonaws.com/cdn.ryfma.com',
            'cdn.ryfma.com'
          )
          submitAlbumForm(coverImg)
        },
        function (err) {
          // console.log(err)
        }
      )
    } else {
      submitAlbumForm(coverImg || '')
    }
  }

  const handleAlbumIsPrivate = () => {
    setIsPrivate(!isPrivate)
  }

  return (
    <Item className='album-page'>
      <Content>
        <Form onSubmit={uploadImagesToS3}>
          <ImageEditor
            defaultImg={coverImg}
            updateCanvasData={updateCanvasData}
            objectType='album'
            objectId={albumId}
          />
          <br />
          <Form.Group widths='equal'>
            <Form.Input
              error={errTitle}
              value={title}
              onChange={(event, {name, value}) => setTitle(value)}
              name='title'
              label={t('albumTitle')}
              placeholder={t('albumTitle')}
              type='text'
            />
          </Form.Group>
          <Form.TextArea
            value={description}
            onChange={(event, {name, value}) => setDescription(value)}
            name='description'
            label={t('albumDesc')}
            placeholder={t('albumDesc')}
            rows='3'
          />
          <Form.Checkbox
            checked={isPrivate}
            label={<label>{t('isPrivate')}</label>}
            name='isPrivate'
            onChange={handleAlbumIsPrivate}
          />
          <Form.Group widths='equal' className='delete-album-actions'>
            <Form.Button
              type='submit'
              disabled={imageUploading}
              color='green'
            >
              {t('createAlbum')}
            </Form.Button>
            <Form.Button
              onClick={handleCloseCreateAlbum}
            >
              {t('common:cancel')}
            </Form.Button>
          </Form.Group>
        </Form>
      </Content>
    </Item>
  )
}

export default AlbumEditorWrapper

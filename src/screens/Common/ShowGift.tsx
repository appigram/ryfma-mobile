import React from 'react'
import { Modal } from 'semantic-ui-react'
import gifts from '~gifts'

function ShowGift ({ giftId, handleCloseShowGift }) {
  const giftIds = `id${giftId}`
  const gift = gifts[giftIds]

  if (!gift) {
    return null
  }

  return (<Modal
    className='gift-show-modal'
    open
    onClose={handleCloseShowGift}
    centered={false}
    size='tiny'
    closeIcon='times'
  >
    <Modal.Content>
      <View className='header'>
        <View className='gift-img'>
          <img src={`https://cdn.ryfma.com/defaults/gifts/${gift._id}-min.png`} alt={`Подарок ${gift.title}`} width='164' height='164' />
        </View>
      </View>
      <View className='desc'>
        <h1>{gift.title}</h1>
        <p>{gift.desc}</p>
      </View>
    </Modal.Content>
  </Modal>)
}

export default ShowGift

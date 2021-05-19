import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Modal, Header, Button, Radio } from 'semantic-ui-react'
import { Notification } from '~components/Notification/Notification'
import { useMutation } from '@apollo/client/react'
import sendReport from '~graphqls/mutations/Common/sendReport'
import ReactGA from 'react-ga'
import { useAuth } from '~hooks'

function ReportForm ({ userId, objectId, objectType, objectTypeReport, openReportForm, handleCloseReportForm }) {
  const [t] = useTranslation('notif')
  const { currUserId } = useAuth()
  const [reportType, setReportType] = useState(null)

  const [sendReportMutation] = useMutation(sendReport)

  const handleSendReport = async () => {
    if (!currUserId) {
      Notification.error(
        'Войдите в свой аккаунт, чтобы отправлять отчеты'
      )
      return
    }
    if (!reportType) {
      Notification.error(
        'Укажите причину вашей жалобы'
      )
      return
    }
    try {
      await sendReportMutation({
        variables: {
          objectId: objectId,
          objectType: objectType,
          userId: currUserId,
          reportType: parseInt(reportType, 10)
        }
      })
      ReactGA.event({
        category: 'Report',
        action: `${objectTypeReport}`,
        label: `ReportTo: ${objectType}-${objectId}, uId: ${userId}, type: ${objectTypeReport}`,
        value: 1
      })
      Notification.success('Ваша жалоба успешно отправлена!')
    } catch (error) {
      Notification.error(error)
    }
    handleCloseReportForm()
  }

  return (<Modal
    className='reportModal'
    closeIcon='times'
    size='small'
    open={openReportForm}
    onClose={handleCloseReportForm}
    style={{ width: '45%' }}
  >
    <Header content={t('common:sendReport')} />
    <Modal.Content>
      <p>{t('common:sendReportHint')}</p>
      <Form>
        <Form.Group grouped>
          <Form.Field>
            <Radio
              name='reportType'
              label={t('common:idontlike')}
              value='1'
              checked={reportType === '1'}
              onChange={(e, { value }) => setReportType(value)}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label={t('common:reportSpam')}
              value='2'
              checked={reportType === '2'}
              onChange={(e, {value}) => setReportType(value)}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label={t('common:nudity')}
              value='3'
              checked={reportType === '3'}
              onChange={(e, {value}) => setReportType(value)}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label={t('common:rulesViolation')}
              value='4'
              checked={reportType === '4'}
              onChange={(e, {value}) => setReportType(value)}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label={t('common:other')}
              value='5'
              checked={reportType === '5'}
              onChange={(e, {value}) => setReportType(value)}
            />
          </Form.Field>
        </Form.Group>
      </Form>
      <br />
      <Button color='red' onClick={handleSendReport} disabled={!reportType}>
        {t('common:sendReportButton')}
      </Button>
      <Button color='grey' onClick={handleCloseReportForm}>
        {t('common:cancel')}
      </Button>
    </Modal.Content>
  </Modal>
  )
}

export default ReportForm

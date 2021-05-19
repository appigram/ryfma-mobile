import { showMessage, hideMessage } from "react-native-flash-message"

const show = (message = '', type = 'info', duration = 0, color = {}) => {
  showMessage({
    message,
    type,
    duration,
    // Custom options
    icon: 'auto',
    floating: true
  })
}

const Notification = {
  error: (message) => {
    if (message) {
      if (message.graphQLErrors) {
        if (message.graphQLErrors[0]) {
          show(message.graphQLErrors[0].message, 'danger', 10000)
        } else {
          if (message.message) {
            show(message.message, 'danger', 10000)
          } else {
            show(message, 'danger', 10000)
          }
        }
      } else if (message.message) {
        show(message.message, 'danger', 10000)
      } else {
        show(message, 'danger', 10000)
      }
    } else {
      show('An unknown error occured', 'danger', 5000)
    }
  },
  success: (message: string) => {
    show(message, 'success', 3000)
  },
  warning: (message: string) => {
    show(message, 'warning', 6000)
  }
}

export default Notification

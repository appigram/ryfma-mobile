import {
  ApolloClient, ApolloLink, HttpLink, InMemoryCache,
} from '@apollo/client'
// import fetch from 'unfetch'
// import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
// import { LoggingLink } from 'apollo-logger'
import { getLoginToken } from '~components/meteor-react-apollo-accounts'

const isDev = process.env.NODE_ENV === 'development'

let uriLink = 'https://ryfma.com/graphql'
if (isDev) {
  uriLink = 'http://localhost:3000/graphql'
}

// apply widdleware to add access token to request
const middlewareLink = new ApolloLink(async (operation, forward) => {
  const authToken = await getLoginToken()
  console.log('ApolloLink token: ', authToken)
  operation.setContext({
    headers: {
      'meteor-login-token': authToken,
    },
  })
  return forward(operation)
})

// const httpLink = createPersistedQueryLink({ useGETForHashedQueries: true }).concat(
const httpLink = new HttpLink({
  uri: uriLink,
  fetch,
})
// )

const link = middlewareLink.concat(httpLink)

// const logOptions = { logger: console.log }

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          settings: {
            merge(existing, incoming) {
              return { ...existing, ...incoming }
            },
          },
          stats: {
            merge(existing, incoming) {
              return { ...existing, ...incoming }
            },
          },
          profile: {
            merge(existing, incoming) {
              return { ...existing, ...incoming }
            },
          },
        },
      },
    },
  }),
  link,
  // link: ApolloLink.from((isDev ? [new LoggingLink(logOptions)] : []).concat([link])),
})

export default client

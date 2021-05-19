import gql from 'graphql-tag'

const getTopPosts = gql`
  query getTopPosts {
    topPosts {
      _id
      createdAt
      postedAt
      title
      slug
      userId
      coverImg
      excerpt
      author {
        _id
        username
        profile {
          name
        }
      }
    }
  }
`

export default getTopPosts

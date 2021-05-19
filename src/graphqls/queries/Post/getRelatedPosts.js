import gql from 'graphql-tag'

const getRelatedPosts = gql`
  query getRelatedPosts($postId: ID!, $tags: [String]) {
    relatedPosts(postId: $postId, tags: $tags) {
      _id
      createdAt
      postedAt
      title
      coverImg
      slug
      excerpt
      tags {
        _id
        name
        slug
      }
      author {
        _id
        username
        roles
        profile {
          name
          image
        }
      }
    }
  }
`

export default getRelatedPosts

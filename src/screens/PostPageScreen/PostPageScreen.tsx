import * as React from 'react';
import PostPageContent from '~components/Posts/PostPageContent'
import PostPagePlaceholder from '~components/Posts/PostPagePlaceholder'
import NotFoundPost from '~components/Posts/NotFoundPost'
import AccessDeniedPost from '~components/Posts/AccessDeniedPost'
import { useQuery } from '@apollo/client/react'
import getPostInfo from '~graphqls/queries/Post/getPostInfo'

export default function PostPageScreen({navigation, route}) {
  const { postId, forceFetch } = route.params

  const {loading, error, data} = useQuery(getPostInfo, {
    variables: {
      postId: postId,
      noCache: !!forceFetch
    },
    fetchPolicy: forceFetch ? 'network-only' : 'cache-first'
  })

  // console.log('loading: ', loading)
  // console.log('=== PostPage data: ', !!data)

  if (loading) {
    return <PostPagePlaceholder />
  }

  if (error || !(data && data.getPost)) {
    return (<NotFoundPost navigation={navigation} />)
  }

  if (data.getPost.isBlocked) {
    return (<AccessDeniedPost />)
  }

  const post = data.getPost

  return (
    <PostPageContent post={post} navigation={navigation} route={route} />
  )
}

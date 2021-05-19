import React from 'react'
import { Text, View } from '~components/Themed'
import Link from '~components/Common/Link'
import tw from 'tailwind-rn'

const PostTags = ({ tags }) => {
  return (
    <View style={tw('flex flex-wrap flex-row mt-4')}>
      {tags.map((tag, i) => (
        <Link key={tag._id} page='TagPage' params={{ tagId: tag._id, tagName: tag.name}}>
          <View style={tw('px-3 py-1 bg-blue-200 rounded-full mr-1 mt-2')}>
            <Text style={tw('text-xs font-bold text-blue-600 capitalize')}>{tag.name}</Text>
          </View>
        </Link>))
      }
    </View>
  )
}

export default PostTags

import React from 'react'
import { useTranslation } from 'react-i18next'
import tw from 'tailwind-rn'
import TimeAgo from 'react-timeago'
import russianStrings from 'react-timeago~language-strings/ru'
import englishStrings from 'react-timeago~language-strings/en'
import buildFormatter from 'react-timeago~formatters/buildFormatter'
import { View, Text } from '~components/Themed'

function TimeText({children, ...restProps}) {
  return <Text style={tw('text-xs')} {...restProps}>{children}</Text>
}

function TimeAgoExt ({ date, style }) {
  /* const {i18n} = useTranslation()
  let currLang = 'ru'
  if (i18n && i18n.language) {
    currLang = i18n.language
  }
  // const formatter = currLang === 'en' ? buildFormatter(englishStrings) : buildFormatter(russianStrings) */
  return (<View>
    <TimeAgo date={date} component={TimeText} lazy={false} />
  </View>
  )
}

export default TimeAgoExt

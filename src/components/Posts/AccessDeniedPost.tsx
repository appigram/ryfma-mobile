import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { useTranslation } from 'react-i18next'
import tw from 'tailwind-rn'
import { View, Text, Button, Image } from '~components/Themed'

import { RootStackParamList } from '~types';

export default function NotFoundScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'NotFound'>) {
  const [t] = useTranslation('post')
  return (
    <View style={tw('flex h-full items-center p-8')}>
      <Image source={{ uri: 'https://cdn.ryfma.com/defaults/icons/ryfma-403.png' }} width={250} height={220} />
      <Text style={tw('text-xl font-bold my-4')}>{t('postAccessDeniedTitle')}</Text>
      <Text>{t('postAccessDeniedDesc')}</Text>
      <Button onPress={() => navigation.goBack()} title={t('postNotFoundLink')} primary style={tw('mt-4')}/>
    </View>
  )
}

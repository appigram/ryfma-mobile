import * as Localization from 'expo-localization';
import i18n from 'i18next';
import Backend from 'i18next-chained-backend';
import AsyncStorageBackend from 'i18next-async-storage-backend'; // primary use cache
import XHR from 'i18next-xhr-backend'; // fallback xhr load
import { initReactI18next } from 'react-i18next';

import ru from '~assets/locales/ru/index';
import en from '~assets/locales/en/index';

const resources = {
  ru: ru,
  en: en
};


const cacheOptions = {
  // turn on or off
  enabled: false,
  // prefix for stored languages
  prefix: 'i18next_res_',
  // expiration
  expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  // language versions
  versions: {
    ru: 'v1.1.69',
    en: 'v1.0.15'
  }
}

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    cleanCode: true,
    react: {
      useSuspense: false,
    },
    backend: {
      backends: [
        AsyncStorageBackend,  // primary
        XHR                   // fallback
      ],
      backendOptions: [
        cacheOptions,
        {
          loadPath: '/locales/{{lng}}/{{ns}}.json' // xhr load path for my own fallback
        }
      ]
    }
  });

export default i18n;

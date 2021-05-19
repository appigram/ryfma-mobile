# ryfma-mobile
Ryfma React Native (Expo) boilerplate
<p>
  <!-- iOS -->
  <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  <!-- Android -->
  <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
</p>

## 🚀 How to use

- Install with `yarn` or `npm install`.
- Run `expo start` to try it out.

Architecture
============

All source code inside `src` folder

```
assets
├── fonts // Custom fonts
├── images // App images
├── locales // Locales files
└── svg // Custom SVG icons
components
├── Common // Common small components
├── Posts // Base components
constants
graphqls // All graphqls mutations and queries
hooks // Global hooks
navigation // React Navigation components
screens // All app screens
utils // Various helpers
```

## 📝 Notes

- The Apollo configuration lies in the `apollo.js` file.
- The file also contains an option (with commented code) to pass an authorization token to the API.
- [Apollo Client Docs](https://www.apollographql.com/docs/react/v3.0-beta/)
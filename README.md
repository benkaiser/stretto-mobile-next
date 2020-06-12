Stretto Android
=================
#### Android Client for [Stretto](https://github.com/benkaiser/stretto)

![screenshot](https://user-images.githubusercontent.com/608054/51808440-912ac600-2248-11e9-9a21-3fccf4a74008.png)

To have the app auto-update, you can install it from the [play store](https://play.google.com/store/apps/details?id=com.strettomobilenext.release), alternatively you can find the latest committed build available for download [here](https://github.com/benkaiser/stretto-mobile-next/raw/master/android/app/build/outputs/apk/release/app-release.apk).

### Developer

#### Overview

This application is built with react-native, but only supports Android currently (iOS devs welcome to test out / fix issues). It works by syncing the users library from the hosted [stretto website](https://next.kaiserapps.com/) and playing the tracks through a separate [stretto-streamer](https://github.com/benkaiser/stretto-streamer) endpoint.

#### Running

```
yarn
npm run start
```

in a new console, leaving the bundler from the last step running

```
npm run android-debug
```

This will deploy the app to your plugged in android device.
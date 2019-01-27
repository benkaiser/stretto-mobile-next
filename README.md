Stretto Android
=================
#### Android Client for [Stretto](https://github.com/benkaiser/stretto)

![screenshot](https://user-images.githubusercontent.com/608054/51808440-912ac600-2248-11e9-9a21-3fccf4a74008.png)

Go to the [releases](https://github.com/benkaiser/stretto-mobile-next/releases) page to download the latest version.

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
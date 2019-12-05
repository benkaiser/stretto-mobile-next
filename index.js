import App from './src/App';
import { AppRegistry, YellowBox } from "react-native";
import TrackPlayer from 'react-native-track-player';

AppRegistry.registerComponent('Stretto', () => App);
TrackPlayer.registerPlaybackService(() => require('./src/services/trackPlayerService'));
YellowBox.ignoreWarnings([
  'Require cycle: node_modules/rn-fetch-blob/index.js',
  'Require cycle: node_modules/react-native/Libraries/Network/fetch.js',
  'Please update the following components: IconToggle',
  'Please update the following components: ListItem',
  'Please update the following components: BottomNavigation, SafeView, Transitioner'
]);
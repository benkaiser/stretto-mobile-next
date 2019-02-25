import App from './src/App';
import { AppRegistry, YellowBox } from "react-native";

AppRegistry.registerComponent('Stretto', () => App);
YellowBox.ignoreWarnings([
  'Require cycle: node_modules/rn-fetch-blob/index.js',
  'Require cycle: node_modules/react-native/Libraries/Network/fetch.js'
]);
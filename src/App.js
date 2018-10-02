import { createStackNavigator } from 'react-navigation';
import Login from './Login';
import Playlist from './Playlist';

// import Reactotron, { networking } from 'reactotron-react-native';
// Reactotron
//   .configure({ host: "192.168.0.139" }) // controls connection & communication settings
//   .useReactNative() // add all built-in react native plugins
//   .use(networking())
//   .connect() ;

export default createStackNavigator({
  Login: {
    screen: Login
  },
  Playlist: {
    screen: Playlist
  }
}, {
  initialRouteName: 'Login'
});

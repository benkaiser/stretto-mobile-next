import { createStackNavigator } from 'react-navigation';
import Login from './Login';
import Playlists from './Playlists';
import Playlist from './Playlist';
import Track from './Track';
import Settings from './Settings';
import Search from './Search';

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
  Playlists: {
    screen: Playlists
  },
  Playlist: {
    screen: Playlist
  },
  Track: {
    screen: Track
  },
  Search: {
    screen: Search
  },
  Settings: {
    screen: Settings
  }
}, {
  initialRouteName: 'Login'
});

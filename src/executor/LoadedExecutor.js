import { AsyncStorage } from 'react-native';
import Player from '../services/player';

export default class LoadedExecutor {
  static execute(data) {
    AsyncStorage.getItem('PLAY_STATE').then(state => {
      if (!state) {
        return;
      }
      console.log('loading from state');
      state = JSON.parse(state);
      if (!state.track || !state.playlistItems) {
        return;
      }
      Player.restoreFromState(state);
    });
  }
}
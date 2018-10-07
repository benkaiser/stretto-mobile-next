import { Audio } from 'expo';
import Config from '../config';

class Player {
  constructor() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });
  }

  playSong(song) {
    if (this._sound) {
      this._sound.unloadAsync();
    }
    Audio.Sound.create(
      { uri: Config.STREAMER_URL + '/youtube/' + song.id.replace('y_', '') },
      { shouldPlay: true },
      this._onPlaybackStatusUpdate
    ).then(({ sound }) => this._sound = sound);
  }

  _onPlaybackStatusUpdate(status) {

  }
}

export default new Player();
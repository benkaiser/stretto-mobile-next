import Config from '../config';
import TrackPlayer from 'react-native-track-player';

class Player {
  constructor() {
    TrackPlayer.setupPlayer()
  }

  playSong(song) {
    if (this._sound) {
      this._sound.unloadAsync();
    }
    TrackPlayer.add({
      id: song.id,
      url: Config.STREAMER_URL + '/youtube/' + song.id.replace('y_', ''),
      title: song.title,
      artist: song.artist,
      artwork: song.cover
    }).then(() => {
      TrackPlayer.skip(song.id);
      TrackPlayer.play();
    })
  }

  playPause() {
    TrackPlayer.getState()
    .then(state => {
      state === TrackPlayer.STATE_PAUSED ? TrackPlayer.play() : TrackPlayer.pause();
    });
  }

  _onPlaybackStatusUpdate(status) {

  }
}

export default new Player();
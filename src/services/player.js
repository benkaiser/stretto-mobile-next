import Config from '../config';
import TrackPlayer from 'react-native-track-player';
import { AppState } from 'react-native';

class Player {  
  constructor() {
    this._listeners = [];
    this._seekTime = 0;
    this._duration = 1;

    this._eventMappings = {
      'remote-play': this.playPause.bind(this),
      'remote-pause': this.playPause.bind(this),
      // 'remote-stop': this.stop
      'remote-next': this.next.bind(this),
      'remote-previous': this.previous.bind(this),
      'playback-state': this._updateState.bind(this),
      'playback-track-changed': this._updateTrackChanged.bind(this),
      'playback-queue-ended': this._restartQueue.bind(this),
      'playback-error': this._playbackError.bind(this)
    };

    TrackPlayer.setupPlayer().then(() => {
      TrackPlayer.registerEventHandler(this._trackPlayerEvent.bind(this));
      TrackPlayer.updateOptions({
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SEEK_TO,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS
        ]
      });
    });
  }

  get playing() {
    return this._lastState === TrackPlayer.STATE_PLAYING;
  }

  get buffering() {
    return this._lastState === TrackPlayer.STATE_BUFFERING;
  }

  get currentTrack() {
    return this._currentTrack;
  }

  get seekTime() {
    return this._seekTime;
  }

  get duration() {
    return this._duration;
  }

  addListener(listener) {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      index > -1 && this._listeners.splice(index, 1);
    }
  }

  addPlaylist() {
    return TrackPlayer.add(this._playlist.map((song) => this._songToTrackPlayerItem(song)));
  }

  playSong(song, playlist) {
    this._playlist = playlist;
    if (this._currentTrack && song.id === this._currentTrack.id) {
      return;
    }
    this._song = song;
    TrackPlayer.reset();
    this.addPlaylist()
    .then(() => TrackPlayer.skip(song.id))
    .then(() => TrackPlayer.play());
  }

  playPause() {
    console.log(this.playing ? 'Pausing' : 'Playing');
    this.playing ? TrackPlayer.pause() : TrackPlayer.play();
  }

  seekToFraction(fraction) {
    return TrackPlayer.getDuration()
    .then((duration) => TrackPlayer.seekTo(fraction * duration));
  }

  next() {
    return TrackPlayer.skipToNext();
  }

  previous() {
    return TrackPlayer.skipToPrevious();
  }

  _songToTrackPlayerItem(song) {
    return {
      id: song.id,
      url: this._urlFor(song),
      title: song.title,
      artist: song.artist,
      artwork: song.cover
    };
  }

  _trackPlayerEvent(event) {
    return (this._eventMappings[event.type] || this._updateState.bind(this))(event).then(() => {
      this._listeners.forEach(listener => listener && listener());
    });
  }

  _playbackError(event) {
    console.log('Error with playback, skipping song');
    console.log(event);
    const nextTrack = this._nextTrack(this._currentTrack);
    return TrackPlayer.reset()
    .then(() => this.addPlaylist())
    .then(() => TrackPlayer.skip(nextTrack.id))
    .then(() => TrackPlayer.play());
  }

  _restartQueue() {
    return TrackPlayer.getQueue()
    .then(queue => {
      queue && queue[0] && TrackPlayer.skip(queue[0].id);
    });
  }

  _updateState() {
    return Promise.all([
      TrackPlayer.getState(),
      TrackPlayer.getPosition(),
      TrackPlayer.getDuration()
    ]).then(([state, time, duration]) => {
      this._lastState = state;
      this._seekTime = time;
      this._duration = duration;
    });
  }

  _updateTrackChanged() {
    return TrackPlayer.getCurrentTrack()
    .then(id => TrackPlayer.getTrack(id))
    .then((track) => {
      this._currentTrack = track;
      this._seekTime = 0;
    });
  }

  _nextTrack(track) {
    return this._playlist[this._playlist.findIndex((item) => item.id == track.id) + 1] || this._playlist[0];
  }

  _urlFor(song) {
    if (song.id.indexOf('s_') === 0) {
      return Config.STREAMER_URL + '/soundcloud/' + song.id.replace('s_', '')
    } else {
      return Config.STREAMER_URL + '/youtube/' + song.id.replace('y_', '');
    }
  }
}

export default new Player();
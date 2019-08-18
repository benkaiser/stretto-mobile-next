import TrackPlayer from 'react-native-track-player';
import { AsyncStorage, ToastAndroid } from 'react-native';
import Utilities from '../utilities';
import OfflineManager from '../dataAccess/OfflineManager';
import SearchService from './SearchService';

class Player {
  constructor() {
    this._listeners = [];
    this._seekTime = 0;
    this._duration = 1;
    this._shuffled = false;
    this._currentTrack = undefined;
    this._unlazifying = false;

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

    TrackPlayer.registerEventHandler(this._trackPlayerEvent.bind(this));
    TrackPlayer.setupPlayer().then(() => {
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
    return TrackPlayer && this._lastState === TrackPlayer.STATE_PLAYING;
  }

  get buffering() {
    return this._unlazifying || TrackPlayer && this._lastState === TrackPlayer.STATE_BUFFERING;
  }

  get currentTrack() {
    return this._currentTrack && {
      ...this._currentTrack,
      cover: this._currentTrack.artwork
    };
  }

  get playlist() {
    return this._playlist;
  }

  get originalPlaylist() {
    return this._originalPlaylist;
  }

  get seekTime() {
    return this._seekTime;
  }

  get shuffled() {
    return this._shuffled;
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
    const indexOfCurrentSong = this._playlist.findIndex(item => {
      return item.id == (this._currentTrack ? this._currentTrack.id : this._song.id)
    });
    const songsWithCurrentTrackFirst = this._playlist.slice(indexOfCurrentSong).concat(this._playlist.slice(0, indexOfCurrentSong));
    if (this._currentTrack && this._currentTrack.id == songsWithCurrentTrackFirst[0].id) {
      songsWithCurrentTrackFirst.shift();
    }
    return TrackPlayer.add(songsWithCurrentTrackFirst.map((song) => this._songToTrackPlayerItem(song)));
  }

  playSong(song, playlist, startPaused) {
    this._originalPlaylist = playlist.slice(0);
    this._song = song;
    this._unlazifying = false;
    if (this._currentTrack && song.id === this._currentTrack.id) {
      return;
    }
    this._currentTrack = undefined;
    this._reshufflePlaylistIfNeeded();
    TrackPlayer.reset();
    this.addPlaylist()
    .then(() => !startPaused && TrackPlayer.play());
    this._writePlayState();
  }

  playPause() {
    console.log(this.playing ? 'Pausing' : 'Playing');
    this.playing ? TrackPlayer.pause() : TrackPlayer.play();
  }

  restoreFromState(state) {
    this._shuffled = state.shuffled || false;
    this.playSong(state.track, state.playlistItems, state.playing == false);
  }

  seekToFraction(fraction) {
    return TrackPlayer.getDuration()
    .then((duration) => TrackPlayer.seekTo(fraction * duration));
  }

  toggleShuffle() {
    this._shuffled = !this._shuffled;
    this._reshufflePlaylistIfNeeded();
  }

  next() {
    return TrackPlayer.skipToNext().catch(() => {
      TrackPlayer.getQueue().then(queue => {
        TrackPlayer.skip(queue[0].id);
      });
    });
  }

  previous() {
    return TrackPlayer.skipToPrevious().catch(() => {
      TrackPlayer.getQueue().then(queue => {
        TrackPlayer.skip(queue[queue.length - 1].id);
      });
    });
  }

  _emitChange() {
    this._listeners.forEach(listener => listener && listener());
  }

  _reshufflePlaylistIfNeeded() {
    this._playlist = this._shuffled ? Utilities.shuffleArray(this._originalPlaylist.slice(0)) : this._originalPlaylist.slice(0);
    this._requeueTracks();
    this._updateState().then(() => {
      this._emitChange();
    });
  }

  _requeueTracks() {
    TrackPlayer.removeUpcomingTracks();
    this.addPlaylist();
  }

  _songToTrackPlayerItem(song) {
    return {
      id: song.id,
      url: this._urlFor(song),
      title: song.title,
      artist: song.artist,
      artwork: song.cover,
      lazy: song.lazy
    };
  }

  _trackPlayerEvent(event) {
    try {
      return (this._eventMappings[event.type] || this._updateState.bind(this))(event).then(() => {
        this._writePlayState();
        this._emitChange();
      });
    } catch (error) {
      console.log('Unable to find event for: ' + event.type);
      console.error(error);
    }
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
      if (track && track.lazy) {
        this._unLazifyTrack(track);
      }
      this._currentTrack = track;
      this._seekTime = 0;
    });
  }

  _unLazifyTrack(track) {
    if (!this._unlazifying) {
      TrackPlayer.pause();
      this._unlazifying = true;
      SearchService.getYoutubeId(track)
      .then(youtubeId => {
        console.log(youtubeId);
        const newId = 'y_' + youtubeId;
        this._playlist = this.playlist.map(item => {
          if (item.id === track.id) {
            item.id = newId;
            item.lazy = false;
          }
          return item;
        });
        this._song && (this._song.id = newId);
        return TrackPlayer.reset()
        .then(() => this.addPlaylist())
        .then(() => TrackPlayer.skip(newId))
        .then(() => {
          this._unlazifying = false;
          return TrackPlayer.play();
        });
      })
      .catch(error => {
        console.error(error);
      });
    }
  }

  _writePlayState() {
    if (!this._song || !this._playlist) {
      return;
    }
    AsyncStorage.setItem('PLAY_STATE', JSON.stringify({
      track: this.currentTrack ? this.currentTrack : this._song,
      playlistItems: this._originalPlaylist,
      playing: this.playing,
      shuffled: this._shuffled
    }));
  }

  _nextTrack(track) {
    return this._playlist[this._playlist.findIndex((item) => item.id == track.id) + 1] || this._playlist[0];
  }

  _urlFor(song) {
    const offlinePath = OfflineManager.getSongLocation(song);
    if (offlinePath) {
      console.log('Playing from offline path: ' + offlinePath);
      return 'file://' + offlinePath;
    } else {
    return Utilities.urlFor(song);
    }
  }
}

export default new Player();
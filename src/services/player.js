import TrackPlayer, { State, Capability } from 'react-native-track-player';
import { AsyncStorage } from 'react-native';
import Utilities from '../utilities';
import OfflineManager from '../dataAccess/OfflineManager';
import SearchService from './SearchService';
import UrlService from './UrlService';
import DataService from './dataService';
import DownloadManager from './DownloadManager';
import SettingsManager from '../dataAccess/SettingsManager';

const PLACEHOLDER = 'PLACEHOLDER';

class Player {
  constructor() {
    this._listeners = [];
    this._seekTime = 0;
    this._duration = 1;
    this._currentIndex = 0;
    this._shuffled = false;
    this._repeat = false;
    this._unlazifying = false;
    this._movingNext = true;
    this._listeningToErrorAndEnd = true;
    this._subscriptions = [];

    this._eventMappings = {
      'remote-play': this.playPause.bind(this),
      'remote-pause': this.playPause.bind(this),
      'remote-stop': this.stop.bind(this),
      'remote-next': this.next.bind(this),
      'remote-previous': this.previous.bind(this),
      'playback-state': this._updateState.bind(this),
      'playback-track-changed': this._updateTrackChanged.bind(this),
      'playback-queue-ended': this._restartQueue.bind(this),
      'playback-error': this._playbackError.bind(this)
    };

    Object.keys(this._eventMappings).forEach(key => {
      this._subscriptions.push(TrackPlayer.addEventListener(key, (arg) => {
        // this._log(key);
        try {
          this._eventMappings[key](arg).catch(error => {
            this._log(error);
          }).then(() => {
            this._writeStateAndEmit.bind(this, key)();
          });
        } catch (error) {
          this._log('Threw for mapping: ' + key);
        }
      }));
    });

    TrackPlayer.setupPlayer({}).then(() => {
      TrackPlayer.updateOptions({
        stopWithApp: true,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
          Capability.SkipToNext,
          Capability.SkipToPrevious
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          // Capability.Stop,
          Capability.SeekTo,
          Capability.SkipToNext,
          Capability.SkipToPrevious
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause
        ],
      });
    });
  }

  get playing() {
    return TrackPlayer && this._lastState === State.Playing;
  }

  get buffering() {
    return this._unlazifying || TrackPlayer && this._lastState === State.Buffering;
  }

  get currentTrack() {
    return this._song;
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

  get repeat() {
    return this._repeat;
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

  _attemptToPlayCurrentSong(startPaused) {
    this._emitChange();
    this._log('Attempting to play: ' + this._song.title);
    if (!this._song) {
      return;
    }
    if (this._song.lazy || this._noStreamUrl(this._song)) {
      this._log('Song is lazy... fetching');
      return this._queuePlaceholder()
      .then(() =>  this._unLazifyTrack(this._song))
      .then((successAndTrackUnchanged) => {
        return successAndTrackUnchanged &&
          this._playCurrentTrackUnlazified(startPaused)
      }
      ).then(() => {
        this._emitChange();
      })
      .catch((error) => {
        this._log('Failed on error' + error);
        this._log(error);
        this._movingNext ?
          this.next() :
          this.previous();
      });
    } else {
      this._log('Song is NOT lazy');
      this._unlazifying = false;
      return this._playCurrentTrackUnlazified(startPaused).then(() => {
        this._emitChange();
      });
    }
  }

  _queuePlaceholder() {
    if (!this._playTrackLock) {
      this._playTrackLock = Promise.resolve();
    }
    this._listeningToErrorAndEnd = false;
    return this._playTrackLock.then(() => {
      return this._playTrackLock = Promise.resolve()
      .then(() => {
        return this._lastPlaceholderTrack ? TrackPlayer.remove([this._lastPlaceholderTrack]) : Promise.resolve();
      })
      .then(() => {
        this._lastPlaceholderTrack = this._songToTrackPlayerItem(this._song, true);
        return TrackPlayer.add(this._lastPlaceholderTrack)
      })
      .then(() => TrackPlayer.pause())
      .then(() => TrackPlayer.skip(this._lastPlaceholderTrack.id).catch(error => this._log('caught placeholder skip error')));
    });
  }

  _playCurrentTrackUnlazified(startPaused) {
    if (!this._playTrackLock) {
      this._playTrackLock = Promise.resolve();
    }
    return this._playTrackLock.then(() => {
      return this._playTrackLock = TrackPlayer.reset()
      .then(() => TrackPlayer.add(this._songToTrackPlayerItem(this._song, false)))
      .then(() => TrackPlayer.skip(this._song.id).catch(error => {
        this._log(error);
        this._log('caught regular skip error')
        this._log(this._song);
        this._songToTrackPlayerItem(this._song, false);
      }))
      .then(() => !startPaused && TrackPlayer.play())
      .then(() => this._listeningToErrorAndEnd = true);
    });
  }

  _restartTrack() {
    return this.seekToFraction(0);
  }

  playSong(song, playlist, startPaused) {
    if (!song || !playlist) {
      return;
    }
    this._originalPlaylist = playlist.slice(0);
    this._reshufflePlaylistIfNeeded(song);
    if (this._song && song.id === this._song.id) {
      this._log('Song is the same, ignoring');
      return;
    }
    this._unlazifying = false;
    this._movingNext = true;
    this._song = song;
    this._updateCurrentIndex();
    this._log('Resetting player');
    TrackPlayer.reset()
    .then(() => this._attemptToPlayCurrentSong(startPaused))
    this._writePlayState();
  }

  stop() {
    TrackPlayer.destroy();
    return Promise.resolve();
  }

  playPause() {
    if (this._unlazifying) {
      return Promise.resolve();
    }
    this._log(this.playing ? 'Pausing' : 'Playing');
    this.playing ? TrackPlayer.pause() : TrackPlayer.play();
    return Promise.resolve();
  }

  restoreFromState(state) {
    this._shuffled = state.shuffled || false;
    this._repeat = state.repeat || false;
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

  toggleRepeat() {
    this._repeat = !this._repeat;
    this._writeStateAndEmit();
  }

  next() {
    if (this._repeat) {
      this._seekTime = 0;
      return this._restartTrack();
    }
    if (!this._playlist) {
      return Promise.resolve();
    }
    this._unlazifying = false;
    this._movingNext = true;
    this._song = this._nextTrackInPlaylist();
    return this._attemptToPlayCurrentSong(false);
  }

  previous() {
    if (this._repeat) {
      this._seekTime = 0;
      return this._restartTrack(false);
    }
    if (!this._playlist) {
      return Promise.resolve();
    }
    this._unlazifying = false;
    this._movingNext = false;
    this._song = this._previousTrackInPlaylist();
    return this._attemptToPlayCurrentSong(false);
  }

  _emitChange() {
    this._listeners.forEach(listener => listener && listener());
  }

  _reshufflePlaylistIfNeeded() {
    this._playlist = this._shuffled ? Utilities.shuffleArray(this._originalPlaylist.slice(0)) : this._originalPlaylist.slice(0);
    this._updateState().then(() => {
      this._emitChange();
    });
  }

  _updateCurrentIndex() {
    this._currentIndex = Math.max(this._playlist.findIndex(item => item === this._song), 0);
  }

  _nextTrackInPlaylist() {
    this._currentIndex = (this._currentIndex + 1) % this._playlist.length;
    return this._playlist[this._currentIndex];
  }

  _previousTrackInPlaylist() {
    this._currentIndex--;
    if (this._currentIndex < 0) {
      this._currentIndex = this._playlist.length - 1;
    }
    return this._playlist[this._currentIndex];
  }

  _songToTrackPlayerItem(song, isPlaceholder) {
    if (!song) {
      return {
        id: PLACEHOLDER + song.title + song.artist + song.alubm,
        url: Utilities.urlFor(song),
        title: 'Placeholder',
        artist: 'Placeholder'
      };
    }
    return {
      id: isPlaceholder ? PLACEHOLDER + song.title + song.artist + song.alubm : song.id,
      url: this._urlFor(song),
      title: song.title,
      artist: song.artist,
      artwork: song.cover
    };
  }

  _writeStateAndEmit(eventKey) {
    try {
      this._writePlayState();
      this._emitChange();
    } catch (error) {
      this._log('Error for event type: ' + eventKey);
      this._log(error);
    }
  }

  _playbackError(event, code) {
    if (this._listeningToErrorAndEnd) {
      this._listeningToErrorAndEnd = false;
      this._log('Error with playback, skipping song');
      this._log(event);
      return this._movingNext ?
        this.next().then(() => this._listeningToErrorAndEnd = true) :
        this.previous().then(() => this._listeningToErrorAndEnd = true);
    } else {
      return Promise.resolve();
    }
  }

  _restartQueue() {
    this._log('Queue ended, no-op');
    // return this.next();
    return Promise.resolve();
  }

  _updateState() {
    return Promise.all([
      TrackPlayer.getState(),
      TrackPlayer.getPosition(),
      TrackPlayer.getDuration()
    ]).then(([state, time, duration]) => {
      // because we don't put our songs in the queue, we have to manually detect when playback
      // stops at the end of a song and move forward
      if (this._lastState !== State.Stopped && state == State.Stopped && time >= duration && this._listeningToErrorAndEnd) {
        this._log('Detected end of song, skipping');
        this.next();
      }
      this._lastState = state;
      this._seekTime = time;
      this._duration = duration;
      this._emitChange();
    }).catch(error => {
      this._log('Error getting state' + error);
      /* no-op */
    })
  }

  _updateTrackChanged() {
    return TrackPlayer.getCurrentTrack()
    .then(id => TrackPlayer.getTrack(id))
    .then((track) => {
      if (!track) {
        return;
      }
      const newTrack = this._playlistItemForTrack(track);
      if (newTrack) {
        this._song = this._playlistItemForTrack(track);
      }
      this._seekTime = 0;
      TrackPlayer.getDuration()
      .then(duration => {
        this._duration = duration;
        this._emitChange();
      });
    });
  }

  _noStreamUrl(song) {
    if (!song || song.id.indexOf('s_') === 0 || OfflineManager.getSongLocation(song)) {
      return false;
    }
    return !song.streamUrl;
  }

  /**
   * Unlazify the current song, returns true if the current song hasn't changed whilst unlazifying
   * Returns false otherwise.
   * @param {the current song} song
   */
  _unLazifyTrack(song) {
    this._unlazifying = true;
    const unlazifyingId = this._lazyTrackUniqueId(song);
    this._emitChange();
    return this._getIdIfNeeded(song)
    .then((newId) => {
      return this._getUrlIfNeeded(song)
      .then(() => {
        this._unlazifying = false;
        // in case the user moved songs while this one was fetching
        if (unlazifyingId !== this._lazyTrackUniqueId(this._song)) {
          return false;
        }
        return true;
      });
    }).catch(error => {
      this._unlazifying = false;
      this._log(error);
      if (unlazifyingId !== this._lazyTrackUniqueId(this._song)) {
        // swallow the error, the user has moved to another song already
        return false;
      }
      throw error;
    });
  }

  _lazyTrackUniqueId(track) {
    return track.title + track.artist + track.album;
  }

  _getIdIfNeeded(track) {
    if (!track.lazy) {
      return Promise.resolve(track.id);
    }
    return SearchService.getYoutubeId(track)
    .then(youtubeId => {
      const newId = 'y_' + youtubeId;
      this._playlist = this.playlist.map(item => {
        if (item.id === track.id) {
          item.id = newId;
          item.lazy = false;
        }
        return item;
      });
      // this._song && (this._song.id = newId);
      // this._song && (this._song.lazy = false);
      track.lazy = false;
      track.id = newId;
      return newId;
    });
  }

  _getUrlIfNeeded(track) {
    if (!this._noStreamUrl(track)) {
      return Promise.resolve(track.url);
    }
    return UrlService.getYoutubeAudioUrl(track)
    .then(url => {
      this._playlist = this.playlist.map(item => {
        if (item.id === track.id) {
          item.streamUrl = url;
        }
        return item;
      });
      // this._song && (this._song.streamUrl = url);
      track.streamUrl = url;
      return url;
    });
  }

  _isSoundCloud(track) {
    return track && track.id && track.id.indexOf('s_') === 0;
  }

  _writePlayState() {
    if (!this._song || !this._playlist) {
      return;
    }
    AsyncStorage.setItem('PLAY_STATE', JSON.stringify({
      track: this._song,
      playlistItems: this._originalPlaylist,
      playing: this.playing,
      shuffled: this._shuffled,
      repeat: this._repeat
    }));
  }

  _nextTrack(track) {
    if (!track) {
      return this._playlist[0];
    }
    return this._playlist[this._playlist.findIndex((item) => item && item.id == track.id) + 1] || this._playlist[0];
  }

  _playlistItemForTrack(track) {
    return this._playlist && this._playlist.filter((item) => item && item.id == track.id)[0];
  }

  _autoDownload(track) {
    if (!SettingsManager.getSetting('autoDownload')) {
      return;
    }
    const fullDetails = this._playlistItemForTrack(track);
    const isInLibrary = DataService.isSongInLibrary(fullDetails)
    if (!isInLibrary) {
      return;
    }
    const alreadyDownloaded = !!OfflineManager.getSongLocation(fullDetails);
    if (alreadyDownloaded) {
      return;
    }
    this._log('Auto-downloading track');
    this._log(fullDetails);
    return DownloadManager.downloadSong(fullDetails);
  }

  _urlFor(song) {
    console.log('Getting song url for: ' + song.title);
    const offlinePath = OfflineManager.getSongLocation(song);
    if (offlinePath) {
      console.log('Offline path: ' + offlinePath);
      return 'file://' + offlinePath;
    } else {
      if (song.streamUrl) {
        return song.streamUrl;
      }
      return Utilities.urlFor(song);
    }
  }

  _log(message) {
    if (__DEV__) {
      console.log(message);
    }
  }

  _dispose() {
    this._subscriptions.forEach(subscription => {
      subscription.remove();
    });
    this._listeners = [];
  }
}

const player = new Player();

if (module.hot) {
  module.hot.dispose(() => {
    player._dispose();
  });
}

export default player;
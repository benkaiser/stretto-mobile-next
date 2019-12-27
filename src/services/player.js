import TrackPlayer, { State, Capability } from 'react-native-track-player';
import { AsyncStorage } from 'react-native';
import Utilities from '../utilities';
import OfflineManager from '../dataAccess/OfflineManager';
import SearchService from './SearchService';
import UrlService from './UrlService';
import DataService from './dataService';
import DownloadManager from './DownloadManager';
import SettingsManager from '../dataAccess/SettingsManager';

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
      'remote-stop': this.stop.bind(this),
      'remote-next': this.next.bind(this),
      'remote-previous': this.previous.bind(this),
      'playback-state': this._updateState.bind(this),
      'playback-track-changed': this._updateTrackChanged.bind(this),
      'playback-queue-ended': this._restartQueue.bind(this),
      'playback-error': this._playbackError.bind(this)
    };

    Object.keys(this._eventMappings).forEach(key => {
      TrackPlayer.addEventListener(key, () => {
        console.log(key);
        this._eventMappings[key]().catch(error => {
          console.error(error);
        }).then(() => {
          this._writeStateAndEmit.bind(this, key)();
        });
      });
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

  addPlaylist(onlyClearedUpcoming) {
    const indexOfCurrentSong = this._playlist.findIndex(item => {
      return item && item.id == (this._currentTrack ? this._currentTrack.id : (this._song ? this._song.id : -1))
    });
    const songsWithCurrentTrackFirst = this._playlist.slice(indexOfCurrentSong).concat(this._playlist.slice(0, indexOfCurrentSong));
    if (onlyClearedUpcoming && this._currentTrack && songsWithCurrentTrackFirst.length > 0 && this._currentTrack && this._currentTrack.id == songsWithCurrentTrackFirst[0].id) {
      songsWithCurrentTrackFirst.shift();
    }
    return TrackPlayer.add(songsWithCurrentTrackFirst.map((song) => this._songToTrackPlayerItem(song)));
  }

  playSong(song, playlist, startPaused) {
    if (!song || !playlist) {
      return;
    }
    this._originalPlaylist = playlist.slice(0);
    this._song = song;
    this._reshufflePlaylistIfNeeded();
    this._unlazifying = false;
    if (this._currentTrack && song.id === this._currentTrack.id) {
      return;
    }
    this._currentTrack = undefined;
    TrackPlayer.reset();
    this.addPlaylist()
    .then(() => !startPaused && TrackPlayer.play());
    this._writePlayState();
  }

  stop() {
    TrackPlayer.destroy();
    return Promise.resolve();
  }

  playPause() {
    console.log(this.playing ? 'Pausing' : 'Playing');
    this.playing ? TrackPlayer.pause() : TrackPlayer.play();
    return Promise.resolve();
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
    this._unlazifying = false;
    return TrackPlayer.skipToNext().catch(() => {
      TrackPlayer.getQueue().then(queue => {
        if (!queue[0]) {
          return;
        }
        TrackPlayer.skip(queue[0].id);
      });
    });
  }

  previous() {
    this._unlazifying = false;
    return TrackPlayer.skipToPrevious().catch(() => {
      TrackPlayer.getQueue().then(queue => {
        if (!queue[queue.length - 1]) {
          return;
        }
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
    this.addPlaylist(true);
  }

  _songToTrackPlayerItem(song) {
    if (!song) {
      return;
    }
    return {
      id: song.id,
      url: this._urlFor(song),
      title: song.title,
      artist: song.artist,
      artwork: song.cover,
      lazy: song.lazy
    };
  }

  _writeStateAndEmit(eventKey) {
    try {
      this._writePlayState();
      this._emitChange();
    } catch (error) {
      console.error('Error for event type: ' + eventKey);
      console.error(error);
    }
  }

  _playbackError(event) {
    console.log('Error with playback, skipping song');
    const nextTrack = this._nextTrack(this._currentTrack);
    if (!nextTrack) {
      return;
    }
    return TrackPlayer.skip(nextTrack.id)
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
      if (!track) {
        return;
      }
      if (!this._playlistItemForTrack(track)) {
        return;
      }
      if (track && (track.lazy || this._noStreamUrl(track))) {
        this._unLazifyTrack(track);
      } else {
        this._autoDownload(track);
      }
      this._currentTrack = track;
      this._seekTime = 0;
    });
  }

  _noStreamUrl(track) {
    if (!track || track.id.indexOf('s_') === 0 || OfflineManager.getSongLocation(track)) {
      return false;
    }
    const _foundTrack = this._playlistItemForTrack(track);
    return track.url !== _foundTrack.streamUrl;
  }

  _unLazifyTrack(track) {
    if (!this._unlazifying) {
      TrackPlayer.pause();
      const unlazifyingId = this._lazyTrackUniqueId(track);
      this._unlazifying = unlazifyingId;
      this._getIdIfNeeded(track)
      .then((newId) => {
        // in case the user moved songs while this one was fetching
        if (!this._unlazifying || this._unlazifying !== unlazifyingId) {
          return;
        }
        return this._getUrlIfNeeded(track)
        .then(() => {
          // in case the user moved songs while this one was fetching
          if (!this._unlazifying || this._unlazifying !== unlazifyingId) {
            return;
          }
          TrackPlayer.reset()
          .then(() => this.addPlaylist())
          .then(() => TrackPlayer.skip(newId))
          .then(() => {
            this._unlazifying = false;
            return TrackPlayer.play();
          });
        });
      }).catch(error => {
        this._unlazifying = false;
        this.next().then(() => TrackPlayer.play());
        console.error(error);
      });
    }
  }

  _lazyTrackUniqueId(track) {
    return track.id + track.title;
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
      this._song && (this._song.id = newId);
      track.id = newId;
      return newId;
    });
  }

  _getUrlIfNeeded(track) {
    console.log(track);
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
      this._song && (this._song.streamUrl = url);
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
      track: this.currentTrack ? this.currentTrack : this._song,
      playlistItems: this._originalPlaylist,
      playing: this.playing,
      shuffled: this._shuffled
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
    console.log('Auto-downloading track');
    console.log(fullDetails);
    return DownloadManager.downloadSong(fullDetails);
  }

  _urlFor(song) {
    const offlinePath = OfflineManager.getSongLocation(song);
    if (offlinePath) {
      return 'file://' + offlinePath;
    } else {
      if (song.streamUrl) {
        return song.streamUrl;
      }
      return Utilities.urlFor(song);
    }
  }
}

export default new Player();
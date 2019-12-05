import Player from './player';
import TrackPlayer from 'react-native-track-player';

// service.js
module.exports = async function() {
  // This service needs to be registered for the module to work
  // but it will be used later in the "Receiving Events" section
  // this._eventMappings = {
  //   'remote-play': () => TrackPlayer.play(),
  //   'remote-pause': () => TrackPlayer.pause(),
  //   'remote-stop': () => TrackPlayer.stop(),
  //   'remote-next': () => TrackPlayer.next(),
  //   'remote-previous': Player.previous.bind(Player),
  //   'playback-state': Player._updateState.bind(Player),
  //   'playback-track-changed': Player._updateTrackChanged.bind(Player),
  //   'playback-queue-ended': Player._restartQueue.bind(Player),
  //   'playback-error': Player._playbackError.bind(Player)
  // };

  // Object.keys(this._eventMappings).forEach(key => {
  //   TrackPlayer.addEventListener(key, () => {
  //     function noopFunction() {
  //       console.log('Event not handled: ' + key)
  //     }
  //     console.log('Running event for ' + key);
  //     (this._eventMappings[key] || noopFunction)().catch(error => {
  //       console.error(error);
  //     });
  //   });
  // });
}
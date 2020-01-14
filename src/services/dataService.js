import Config from '../config';
import Utilities from '../utilities';
import { AsyncStorage } from 'react-native';
import PlaylistWrapper from '../dataAccess/PlaylistWrapper';

export default class DataService {
  static _lastLocalData;

  static getData(options) {
    if (!options || !options.token || !options.email) {
      throw new Error('Attempt to get data without token or email');
    }

    return DataService._getLocalData().then(data => {
      if (data) {
        DataService._login(options.token, options.email).then(DataService._updateData());
        return data;
      } else {
        return DataService._login(options.token, options.email)
        .then(DataService._getData);
      }
    }).then((data) => {
      PlaylistWrapper.setData(data);
      return data;
    });
  }

  static addSongToLibrary(song) {
    if (!song) {
      return;
    }
    // ensure we aren't modifying the original
    song = { ...song };
    delete song.streamUrl;
    return fetch(Config.BASE_URL + '/addsong', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        song: song,
        playlist: 'Library'
      })
    })
    .then(Utilities.fetchToJson)
    .then(serverResponseWithVersion => {
      console.log(serverResponseWithVersion);
      if (!serverResponseWithVersion.success) {
        throw new Error(serverResponseWithVersion);
      }
      return this._getLocalData().then(localData => {
        const doesSongExist = localData.songs.filter(localSong => localSong && localSong.id === song.id).length > 0;
        if (!doesSongExist) {
          localData.playlists = localData.playlists.map(playlist => {
            if (playlist.title === 'Library') {
              playlist.songs.push(song.id);
            }
            return playlist;
          });
          localData.songs.push(song);
        }
        localData.version = serverResponseWithVersion.version;
        return this._setLocalData(localData);
      });
    }).catch(error => {
      console.log(error);
    });
  }

  static isSongInLibrary(song) {
    return this._lastLocalData ? this._lastLocalData.songs.some(localSong => localSong && localSong.id === song.id) : false;
  }

  static _login(token, email) {
    return fetch(Config.BASE_URL + '/androidlogin', {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        email: email,
        token: token
      })
    })
    .then(Utilities.fetchToJson)
    .then((data) => {
      if (!data.success) {
        throw new Error('unable to login to stretto server');
      }
    });
  }

  static _getData() {
    return fetch(Config.BASE_URL + '/latestdata', {
      credentials: 'same-origin',
      method: 'GET'
    })
    .then(Utilities.fetchToJson)
    .then((data) => {
      data.playlists = data.playlists.sort((a, b) => {
        return a.editable >= b.editable || a.title > b.title;
      });
      DataService._setLocalData(data);
      return data;
    })
    .catch((error) => {
      console.log('landed in error');
      console.log(error);
    });
  }

  static _updateData() {
    return DataService._getLocalData().then(data => {
      if (data) {
        return fetch(Config.BASE_URL + '/latestversion', {
          credentials: 'same-origin',
          method: 'GET'
        }).then(Utilities.fetchToJson)
        .then(response => {
          if (parseInt(data.version) < parseInt(response.version)) {
            console.log('our version is old, getting new data');
            return DataService._getData();
          } else {
            console.log('our data is up to date, no need to update');
          }
        });
      } else {
        return DataService._getData();
      }
    })
  }

  static _setLocalData(data) {
    AsyncStorage.setItem('USER_DATA', JSON.stringify(data));
    this._lastLocalData = data;
    PlaylistWrapper.setData(data);
  }

  static _getLocalData() {
    return AsyncStorage.getItem('USER_DATA').then(data => JSON.parse(data)).then(localData => {
      this._lastLocalData = localData;
      return localData;
    })
  }
}

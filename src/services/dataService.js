import Config from 'react-native-config'
import Utilities from '../utilities';

export default class DataService {
  static getData(options) {
    if (!options || !options.token || !options.email) {
      throw new Error('Attempt to get data without token or email');
    }

    return DataService._login(options.token, options.email)
    .then(DataService._getData);
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
      return data;
      // this._setLocalData(data.songs || [], data.playlists || []);
      // this._updateLatestVersion(data.version);
    })
    .catch((error) => {
      console.log('landed in error');
      console.log(error);
    });
  }
}

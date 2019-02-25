import Config from '../config';
import Utilities from '../utilities';
import { AsyncStorage } from 'react-native';
import PlaylistWrapper from '../dataAccess/PlaylistWrapper';

export default class DataService {
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
    PlaylistWrapper.setData(data);
  }

  static _getLocalData() {
    return AsyncStorage.getItem('USER_DATA').then(data => JSON.parse(data));
  }
}

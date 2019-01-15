import { AsyncStorage } from "react-native"
import { google } from 'react-native-simple-auth';
import Utilities from '../utilities';
import Config from '../config';

class LoginService {
  checkLogin() {
    return AsyncStorage.getItem('USER_INFO')
    .then(userInfo => {
      if (userInfo) {
        this._userInfo = JSON.parse(userInfo);
        return fetch('https://www.googleapis.com/oauth2/v4/token', {
          method: 'POST',
          body: JSON.stringify({
            client_id: Config.GOOGLE_CLIENT_ID,
            refresh_token: this._userInfo.refresh_token,
            grant_type: 'refresh_token'
          })
        });
      } else {
        return Promise.reject(new Error('No user info saved'));
      }
    })
    .then(Utilities.fetchToJson)
    .then(googleResponse => {
      this._userInfo.id_token = googleResponse.id_token;
      return this._userDataResponse();
    });
  }

  login() {
    return google({
      appId: Config.GOOGLE_CLIENT_ID,
      callback: 'com.strettomobilenext.' + (__DEV__ ? 'debug' : 'release') + ':/oauth2redirect'
    })
    .then((result) => {
      if (!result || !result.credentials.id_token || !result.credentials.refresh_token || !result.user.email) {
        throw new Error('unable to login');
      }
      this._userInfo = {
        email: result.user.email,
        id_token: result.credentials.id_token,
        refresh_token: result.credentials.refresh_token
      };
      console.log(this._userInfo);
      AsyncStorage.setItem('USER_INFO', JSON.stringify(this._userInfo));
      return this._userDataResponse();
    }).catch((error) => {
      console.log('Unable to auth with Google');
      console.log(error);
    })
  }

  _userDataResponse() {
    return {
      email: this._userInfo.email,
      token: this._userInfo.id_token
    };
  }
}

export default new LoginService();

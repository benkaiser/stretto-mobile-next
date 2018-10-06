import { AsyncStorage } from "react-native"
import Utilities from '../utilities';

const ANDROID_CLIENT_ID = '335415163955-etr0oh4paravsga46ldik5hhmlv18g7h.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'NOT_IMPLEMENTED';
const scopes = ['profile', 'email'];

class LoginService {
  checkLogin() {
    return AsyncStorage.getItem('USER_INFO')
    .then(userInfo => {
      if (userInfo) {
        this._userInfo = JSON.parse(userInfo);
        return fetch('https://www.googleapis.com/oauth2/v4/token', {
          method: 'POST',
          body: JSON.stringify({
            client_id: ANDROID_CLIENT_ID,
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
    return Expo.Google.logInAsync({
      androidClientId: ANDROID_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      scopes
    }).then((result) => {
      if (!result || !result.idToken || !result.user || !result.user.email) {
        throw new Error('unable to login');
      }
      this._userInfo = {
        email: result.user.email,
        id_token: result.idToken,
        refresh_token: result.refreshToken
      };
      AsyncStorage.setItem('USER_INFO', JSON.stringify(this._userInfo));
      return this._userDataResponse();
    });
  }

  _userDataResponse() {
    return {
      email: this._userInfo.email,
      token: this._userInfo.id_token
    };
  }
}

export default new LoginService();

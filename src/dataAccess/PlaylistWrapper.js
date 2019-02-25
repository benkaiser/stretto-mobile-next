import { AsyncStorage } from 'react-native';

const listeners = [];

export default class PlaylistWrapper {
  static addListener(listener) {
    listeners.push(listener);
  }

  static loadFromLocal() {
    return AsyncStorage.getItem('USER_DATA').then(
      data => this.setData(JSON.parse(data))
    );
  }

  static getPlaylists() {
    return PlaylistWrapper._playlists;
  }

  static setData(data) {
    PlaylistWrapper._playlists = data.playlists.map((playlist) => {
      return {
        ...playlist,
        songs: playlist.songs.map((songId) => {
          return data.songs.filter((item) => item.id === songId)[0];
        }).filter(item => !!item)
      }
    });
    this._emitChange();
  }

  static _emitChange() {
    listeners.forEach(listener => {
      listener && listener();
    });
  }
}
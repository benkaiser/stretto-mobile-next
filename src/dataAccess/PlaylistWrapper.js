import { AsyncStorage } from 'react-native';

const listeners = [];

export default class PlaylistWrapper {
  static addListener(listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      index > -1 && listeners.splice(index, 1);
    }
  }

  static loadFromLocal() {
    return AsyncStorage.getItem('USER_DATA').then(
      data => this.setData(JSON.parse(data))
    );
  }

  static getPlaylists() {
    return PlaylistWrapper._playlists;
  }

  static getSongs() {
    return PlaylistWrapper._songs;
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
    PlaylistWrapper._songs = data.songs;
    this._emitChange();
  }

  static _emitChange() {
    listeners.forEach(listener => {
      listener && listener();
    });
  }
}
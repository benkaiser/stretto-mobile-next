import { AsyncStorage } from 'react-native';

export class OfflineManager {
  constructor() {
    this.loadFromLocal();
    this._data = {};
  }

  loadFromLocal() {
    return AsyncStorage.getItem('OFFLINE_INFO').then(data => {
      data && this.setData(JSON.parse(data));
    });
  }

  getSongLocation(song) {
    return this._data[song.id];
  }

  setData(data) {
    this._data = data;
  }

  addSong(song, location) {
    this._data[song.id] = location;
    this._writeData();
  }

  _writeData() {
    return AsyncStorage.setItem('OFFLINE_INFO', JSON.stringify(this._data));
  }
}

export default new OfflineManager();
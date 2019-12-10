import { AsyncStorage } from 'react-native';
import * as fs from 'react-native-fs';
import Utilities from '../utilities';

export class OfflineManager {
  constructor() {
    this._data = {};
    this.loadFromLocal().then(() => {
      this._verifyAvailableSongs();
    });
  }

  loadFromLocal() {
    return AsyncStorage.getItem('OFFLINE_INFO').then(data => {
      data && this.setData(JSON.parse(data));
    });
  }

  getSongLocation(song) {
    if (!song) {
      return undefined;
    }
    return this._data[song.id];
  }

  setData(data) {
    this._data = data;
  }

  addSong(song, location) {
    if (!song || !song.id) {
      return;
    }
    this._data[song.id] = location;
    this._writeData();
  }

  _writeData() {
    return AsyncStorage.setItem('OFFLINE_INFO', JSON.stringify(this._data));
  }

  _verifyAvailableSongs() {
    fs.readDir(Utilities.downloadDir)
    .then(results => {
      results.forEach(result => {
        const fileName = result.path.split('/').pop();
        let dirty = false;
        if (result.isFile() && !this._data[fileName]) {
          this._data[fileName] = result.path;
          dirty = true;
          console.log('Added offline missing file: ' + fileName);
        }
        if (dirty) {
          this._writeData();
        }
      });
    });
  }
}

export default new OfflineManager();
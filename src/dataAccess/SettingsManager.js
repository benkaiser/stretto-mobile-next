import { AsyncStorage } from 'react-native';

export class SettingsManager {
  constructor() {
    this.loadFromLocal();
    this._data = {
      autoDownload: false
    };
  }

  loadFromLocal() {
    return AsyncStorage.getItem('SETTINGS_INFO').then(data => {
      data && this.setData(JSON.parse(data));
    });
  }

  getSetting(key, defaultValue) {
    const value = this._data[key];
    if (value === undefined || value === null) {
      return defaultValue;
    } else {
      return value;
    }
  }

  setData(data) {
    this._data = data;
  }

  setSetting(key, value) {
    this._data[key] = value;
    this._writeData();
  }

  _writeData() {
    return AsyncStorage.setItem('SETTINGS_INFO', JSON.stringify(this._data));
  }
}

export default new SettingsManager();
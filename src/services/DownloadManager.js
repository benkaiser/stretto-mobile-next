import { PermissionsAndroid, ToastAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Utilities from '../utilities';
import OfflineManager from '../dataAccess/OfflineManager';
import UrlService from './UrlService';

const downloadDir = Utilities.downloadDir;
const parallelDownloads = 10;

export class DownloadManager {
  downloadPlaylist(playlist) {
    ToastAndroid.show('Starting download for ' + playlist.title, ToastAndroid.SHORT);
    return this._requestPermissionsAndMakeDir()
    .then(() =>
      this._scheduleDownloads(playlist.songs)
      .then(() => {
        ToastAndroid.show('Completed download for ' + playlist.title, ToastAndroid.SHORT);
      })
    );
  }

  downloadSong(song) {
    ToastAndroid.show('Starting download for ' + song.title, ToastAndroid.SHORT);
    return this._requestPermissionsAndMakeDir()
    .then(() =>
      this._downloadSong(song).then(() => {
        ToastAndroid.show('Completed download for ' + song.title, ToastAndroid.SHORT);
      })
    );
  }

  _scheduleDownloads(songs) {
    let complete;
    const completedPromise = new Promise((resolve) => {
      complete = resolve;
    });
    let numProcessed = 0;
    let numStarted = 0;
    const downloadComplete = () => {
      numProcessed++;
      if (numProcessed == songs.length) {
        complete();
      } else {
        ToastAndroid.show(`Downloaded ${numProcessed} out of ${songs.length}`, ToastAndroid.SHORT);
        if (numStarted < songs.length - 1) {
          this._downloadSong(songs[numStarted]).then(downloadComplete.bind(this));
          numStarted++;
        }
      }
    };
    while (numStarted < Math.min(parallelDownloads, songs.length)) {
      this._downloadSong(songs[numStarted]).then(downloadComplete.bind(this));
      numStarted++;
    }
    return completedPromise;
  }

  _downloadSong(song) {
    let promise;
    if (song.id.indexOf('s_') === 0 || song.streamUrl) {
      promise = Promise.resolve(Utilities.urlFor(song));
    } else {
      promise = UrlService.getYoutubeAudioUrl(song).then()
    }
    return promise.then((url) => {
      console.log('downloading with url: ' + url);
      return RNFetchBlob
      .config({
        path: downloadDir + song.id,
      })
      .fetch('GET', url)
      .then((res) => {
        OfflineManager.addSong(song, res.path());
        console.log('The file saved to ', res.path())
      });
    })
  }

  _requestPermissionsAndMakeDir() {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
    .then(granted => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      } else {
        console.log('Need permissions to download');
        throw new Error('Unable to download');
      }
    }).then(granted => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return RNFetchBlob.fs.exists(downloadDir).then(exists => {
          return exists ? Promise.resolve() : RNFetchBlob.fs.mkdir(downloadDir);
        });
      } else {
        console.log('Need permissions to download');
        throw new Error('Unable to download');
      }
    });
  }
}

export default new DownloadManager();
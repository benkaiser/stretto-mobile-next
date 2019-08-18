import Config from './config';
import RNFetchBlob from 'rn-fetch-blob';

export default {
  fetchToJson: (response) => response.json(),
  shuffleArray: (a) => {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  },
  urlFor: (song) => {
    // use an empty mp3 file until we load in the real deal
    if (song.lazy) {
      return 'https://raw.githubusercontent.com/anars/blank-audio/master/10-seconds-of-silence.mp3';
    }
    if (song.id.indexOf('s_') === 0) {
      return Config.STREAMER_URL + '/soundcloud/' + song.id.replace('s_', '')
    } else {
      return Config.STREAMER_URL + '/youtube/' + song.id.replace('y_', '');
    }
  },
  downloadDir: RNFetchBlob.fs.dirs.MusicDir + '/stretto/'
};

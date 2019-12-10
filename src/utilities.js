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
    if (!song) {
      return 'https://raw.githubusercontent.com/anars/blank-audio/master/10-seconds-of-silence.mp3';
    }
    if (song.streamUrl) {
      return song.streamUrl;
    }
    // use an empty mp3 file until we load in the real deal
    if (song.lazy || (song.id && song.id.indexOf('y_') === 0)) {
      return 'https://raw.githubusercontent.com/anars/blank-audio/master/10-seconds-of-silence.mp3';
    }
    if (song.id.indexOf('s_') === 0) {
      return `https://api.soundcloud.com/tracks/${song.id.replace('s_', '')}/stream?client_id=3c2fb8cfc81c40dcfb99bb9f786f561c`;
    }
  },
  downloadDir: RNFetchBlob.fs.dirs.MusicDir + '/stretto/'
};

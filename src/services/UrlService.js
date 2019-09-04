import ytdl from 'ytdl-core';

const urlCache = {};

export default class SearchService {
  static getYoutubeAudioUrl(track) {
    if (urlCache[track]) {
      return Promise.resolve(urlCache[track]);
    }
    return ytdl.getInfo(track.id.replace('y_',''))
    .then(info => {
      let formats = ytdl.filterFormats(info.formats, 'audioonly');
      const aacFormat = formats.filter(format => format.audioEncoding === 'aac')[0];
      if (aacFormat) {
        return aacFormat.url;
      } else {
        return formats[0].url;
      }
    }).then(url => {
      if (url) {
        urlCache[track.id] = url;
      }
      return url;
    });
  }
}

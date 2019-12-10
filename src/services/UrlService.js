import ytdl from 'ytdl-core';

const urlCache = {};

export default class SearchService {
  static getYoutubeAudioUrl(track) {
    var resolveUrl, failUrl;
    if (!track) {
      return;
    }
    if (urlCache[track]) {
      return Promise.resolve(urlCache[track]);
    }
    ytdl.getInfo(track.id.replace('y_',''), {}, (err, info) => {
      if (err) {
        return failUrl(err);
      }
      let formats = ytdl.filterFormats(info.formats, 'audio');
      const aacFormat = formats.filter(format =>
        format.audioEncoding === 'aac' && !format.isDashMPD
      )[0];
      if (aacFormat) {
        resolveUrl(aacFormat.url);
      } else {
        resolveUrl(formats[0].url);
      }
    })
    return new Promise((resolve, reject) => {
      resolveUrl = resolve;
      failUrl = reject;
    }).then(url => {
      if (url) {
        urlCache[track.id] = url;
      }
      return url;
    });
  }
}

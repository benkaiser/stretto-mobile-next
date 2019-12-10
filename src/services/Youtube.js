export default class Youtube {
  static getYoutubeMix(track) {
    if (!track || !track.id) {
      return;
    }
    const videoId = track.id.replace('y_', '');
    return this._findMixPlaylist(videoId)
    .then(playlistId => this._getPlaylistItems(videoId, playlistId));
  }

  static _findMixPlaylist(videoId) {
    return fetch(`https://www.youtube.com/watch?v=${videoId}`)
    .then((response) => response.text())
    .then(responseText => {
      const results = /0026list=([^"\\]+)/.exec(responseText);
      if (results && results[1]) {
        return results[1];
      } else {
        return Promise.reject('Unable to find mix id');
      }
    });
  }

  static _getPlaylistItems(videoId, playlistId) {
    const headers = {
      'User-Agent': 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:71.0) Gecko/20100101 Firefox/71.0'
    };
    return fetch(this._radioUrl(videoId, playlistId), {
      headers
    })
    .then(response => response.text())
    .then(responseText => {
      const windowIndex = responseText.indexOf('window["ytInitialData"]');
      const nextWindow = responseText.indexOf('window["ytInitialPlayerResponse"]', windowIndex);
      const substring = responseText.substr(windowIndex + 26, nextWindow - windowIndex - 26);
      const json = substring.substr(0, substring.lastIndexOf('}') + 1);
      return JSON.parse(json);
    }).then(parsedJson => {
      const playlist = parsedJson.contents.twoColumnWatchNextResults.playlist.playlist;
      const items = playlist.contents.map((item) => { return item.playlistPanelVideoRenderer });
      return {
        title: playlist.title,
        items: this._guessSplitTitle(items.map(this._convertScrapedToStandardTrack))
      };
    });
  }

  static _radioUrl(videoId, playlistId) {
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&start_radio=1`;
  }

  static _guessSplitTitle(items) {
    return items.map((item) => {
      const youtubeTitle = item.title; 
      const dashIndex = youtubeTitle.indexOf('-');
      if (dashIndex > -1) {
        item.title = youtubeTitle.substr(dashIndex + 1).trim();
        item.artist = youtubeTitle.substr(0, dashIndex).trim();
      } else {
        item.artist = item.channel;
      }
      return item;
    });
  }

  static _convertScrapedToStandardTrack(track) {
    return {
      channel: track.shortBylineText.runs[0].text,
      cover: track.thumbnail.thumbnails[track.thumbnail.thumbnails.length-1].url,
      id: 'y_' + track.videoId,
      isSoundcloud: false,
      isYoutube: true,
      title: track.title.simpleText,
      album: '',
      url: `https://www.youtube.com/watch?v=${track.videoId}`,
      explicit: false,
      createdAt: +new Date(),
      updatedAt: +new Date(),
      duration: track.lengthText.simpleText.split(':').reduce((acc,time) => (60 * acc) + +time)
    };
  }
}

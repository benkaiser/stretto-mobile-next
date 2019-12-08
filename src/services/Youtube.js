export default class Youtube {
  static getYoutubeMix(track) {
    return this._findMixPlaylist(track)
    .then(playlistId => {
      console.log(playlistId);
    });
  }

  static _findMixPlaylist(track) {
    return fetch(`https://www.youtube.com/watch?v=${track.id.replace('y_', '')}`)
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
}

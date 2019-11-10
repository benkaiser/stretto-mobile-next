import Utilities from '../utilities';

const YT_SEARCH_QUERY_URI = (
  'https://m.youtube.com/results?' +
  'hl=en&gl=US&category=music' +
  '&search_query='
)

export default class SearchService {
  static search(query) {
    return fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=50&country=us`)
    .then(Utilities.fetchToJson)
    .then(responseJson => {
      return responseJson.results.map(this._standardItem);
    })
    .catch(() => {
      return [];
    });
  }
  
  static getYoutubeId(track) {
    return fetch(YT_SEARCH_QUERY_URI + encodeURIComponent(track.title + " " + track.artist))
    .then(response => response.text())
    .then(responseText => {
      return this._extractFirstIdFromResponse(responseText);
    }); 
  }

  // Youtube has a bunch of preloads for images, this logic relies
  // on the first preload being the first result image (i.e the videoid we need)
  static _extractFirstIdFromResponse(html) {
    const YT_IMAGE_STRING = 'https://i.ytimg.com/vi/';
    const firstYtImage = html.indexOf(YT_IMAGE_STRING);
    const trimmedStart = html.slice(firstYtImage + YT_IMAGE_STRING.length);
    const trimmedBoth = trimmedStart.slice(0, trimmedStart.indexOf('/'));
    if (trimmedBoth.length < 5 || trimmedBoth.indexOf('"') >= 0) {
      throw new Error('Unable to extract youtube id, likely being rate limited');
    }
    return trimmedBoth;
  }

  static _standardItem(itunesItem) {
    return {
      id: String(itunesItem.trackId + itunesItem.collectionId),
      title: itunesItem.trackName,
      artist: itunesItem.artistName,
      album: itunesItem.collectionName,
      cover: itunesItem.artworkUrl100.replace('100x100', '600x600'),
      explicit: itunesItem.trackExplicitness === 'explicit',
      duration: itunesItem.trackTimeMillis / 1000,
      isYoutube: true,
      isSoundcloud: false,
      lazy: true,
      createdAt: +new Date(),
      updatedAt: +new Date()
    };
  }
}

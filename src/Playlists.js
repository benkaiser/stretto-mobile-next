import React from 'react';
import { Alert } from 'react-native';
import { ListItem } from 'react-native-material-ui';
import BaseListView from './BaseListView';
import PlaylistWrapper from './dataAccess/PlaylistWrapper';
import DownloadManager from './services/DownloadManager';

export default class Playlists extends BaseListView {
  static navigationOptions = { ...BaseListView.navigationOptions, ...{
    title: 'Playlists',
  }};

  constructor(props) {
    super(props);
    this._unsubscribe = PlaylistWrapper.addListener(this._updateState.bind(this))
    this.state = this._getStateFromStores();
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
  }

  getData() {
    return this.state.playlists;
  }

  itemHeight() {
    return 40;
  }

  keyExtractor(item) {
    return item.title;
  }

  renderListItem({ item }) {
    return (
      <ListItem
        key={item.title}
        divider
        centerElement={{
          primaryText: item.title,
        }}
        onPress={this._itemClick.bind(this, item)}
        onLongPress={this._longPress.bind(this, item)}
      />
    );
  }

  _itemClick(item) {
    this.props.navigation.push('Playlist', {
      item: item
    });
  }

  _updateState() {
    this.setState(this._getStateFromStores());
  }

  _getStateFromStores() {
    return {
      playlists: PlaylistWrapper.getPlaylists()
    };
  }

  _longPress(item) {
    Alert.alert(
      'Download playlist?',
      'This will be downloaded to your Music folder',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: this._startDownload.bind(this, item)
        },
      ],
      {cancelable: false},
    );
  }

  _startDownload(item) {
    DownloadManager.downloadPlaylist(item);
  }
}
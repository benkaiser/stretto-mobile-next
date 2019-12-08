import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-material-ui';
import OptionsMenu from 'react-native-options-menu';
import BaseListView from './BaseListView';
import PlaylistWrapper from './dataAccess/PlaylistWrapper';
import DownloadManager from './services/DownloadManager';
import OfflineManager from './dataAccess/OfflineManager';
import SettingsManager from './dataAccess/SettingsManager';
// import Icon from './components/icon';
import Icon from 'react-native-vector-icons/FontAwesome';


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

  renderListItem({ item, index }) {
    return (
      <ListItem
        key={item.title}
        divider
        centerElement={{
          primaryText: item.title,
        }}
        rightElement={
          <View>
            <OptionsMenu
              customButton={<Icon style={styles.icon} name='ellipsis-v' size={15} />}
              options={['Download']}
              actions={[this._startDownload.bind(this, item)]}
            >

            </OptionsMenu>
          </View>
        }
        onPress={this._itemClick.bind(this, item)}
      />
    );
  }

  _itemClick(item) {
    this.props.navigation.push('Playlist', {
      item: this._filterOfline(item)
    });
  }

  _filterOfline(item) {
    if (SettingsManager.getSetting('offlineMode', false)) {
      item = { ...item };
      item.songs = item.songs.filter(song => OfflineManager.getSongLocation(song));
    }
    return item;
  }

  _updateState() {
    this._isMounted && this.setState(this._getStateFromStores());
  }

  _getStateFromStores() {
    return {
      playlists: PlaylistWrapper.getPlaylists()
    };
  }

  _startDownload(item) {
    DownloadManager.downloadPlaylist(item);
  }
}

const styles = StyleSheet.create({
  icon: {
    paddingLeft: 15,
    paddingRight: 15
  }
});
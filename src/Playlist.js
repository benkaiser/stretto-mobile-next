import React from 'react';
import { ListItem } from 'react-native-material-ui';
import { Alert, StyleSheet, Text, View, ToastAndroid } from 'react-native';
import FastImage from 'react-native-fast-image'
import OptionsMenu from 'react-native-options-menu';
import BaseListView from './BaseListView';
import IconComponent from './components/icon';
import Icon from 'react-native-vector-icons/FontAwesome';
import OfflineManager from './dataAccess/OfflineManager';
import DownloadManager from './services/DownloadManager';
import DataService from './services/dataService';

export default class Playlist extends BaseListView {
  static navigationOptions = ({ navigation }) => ({ ...BaseListView.navigationOptions, ...{
    title: `${navigation.state.params.item.title}`
  }});

  constructor(props) {
    super(props);
    const item = props.navigation.getParam('item');
    this.state = {
      item,
      songs: item.title !== 'Library' ? item.songs : item.songs.sort((a, b) => {
        return a.createdAt < b.createdAt ? 1 : -1;
      })
    };
  }

  getData() {
    return this.state.songs;
  }

  itemHeight() {
    return 50;
  }

  keyExtractor(item) {
    if (!item) {
      return '';
    }
    return item.id + item.artist + item.title;
  }

  renderListItem({ item }) {
    const options = [];
    const optionsMethods = [];
    if (DataService.isSongInLibrary(item)) {
      if (!this._isOffline(item)) {
        options.push('Download');
        optionsMethods.push(this._startDownload.bind(this, item));
      }
    } else {
      options.push('Add to Library');
      optionsMethods.push(this._addToLibrary.bind(this, item));
    }
    if (item && item.id && item.id.indexOf('s_') !== 0) {
      options.push('Start Youtube Mix');
      optionsMethods.push(this.startYoutubeMix.bind(this, item));
    }
    return (
      <ListItem
        key={this.keyExtractor(item)}
        height={50}
        divider
        onPress={this._itemClick.bind(this, item)}
        centerElement={
          <View style={styles.listItem}>
            <FastImage
              source={{uri: item.cover}}
              style={styles.image}
            />
            <Text style={styles.text}>{item.title}</Text>
          </View>
        }
        rightElement={
          <View style={styles.rightIcons}>
            { this._isOffline(item) && <IconComponent name='plane' size={15} /> }
            { options.length > 0 && <OptionsMenu
              customButton={<Icon style={styles.icon} name='ellipsis-v' size={15} />}
              options={options}
              actions={optionsMethods}
            /> }
          </View>
        }
      />
    );
  }

  _isOffline(song) {
    return !!OfflineManager.getSongLocation(song);
  }

  _itemClick(item) {
    this.props.navigation.push('Track', {
      item: item,
      playlistItems: this.state.songs
    });
  }
  
  _startDownload(item) {
    DownloadManager.downloadSong(item).then(() => {
      this.forceUpdate();
    })
  }

  _addToLibrary(item) {
    console.log(item);
    DataService.addSongToLibrary(item).then(() => {
      ToastAndroid.show('Added \'' + item.title + '\' to Library', ToastAndroid.SHORT);
    });
  }
}

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 0,
    marginTop: 5,
    marginLeft: -10
  },
  text: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
    lineHeight: 50,
    color: '#000'
  },
  listItem: {
    flex: 1,
    flexDirection: 'row'
  },
  icon: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10
  },
  rightIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    maxWidth: 60
  }
});
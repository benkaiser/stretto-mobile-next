import React from 'react';
import BasePlayerView from './BasePlayerView';
import { Alert, View, StatusBar, StyleSheet, Text, FlatList, ToastAndroid } from 'react-native';
import { SearchBar } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { ListItem } from 'react-native-material-ui';
import OptionsMenu from 'react-native-options-menu';
import Icon from 'react-native-vector-icons/FontAwesome';
import SearchService from './services/SearchService';
import DataService from './services/dataService';
import Youtube from './services/Youtube';

const SEARCH_WAIT = 300;

export default class Search extends BasePlayerView {
  static navigationOptions = { ...BasePlayerView.navigationOptions, ...{
    header: null
  }};

  static LAST_SEARCH;
  static LAST_RESULTS;

  constructor(props) {
    super(props);
    var searchText;
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      searchText = this.props.navigation.state.params.searchText;
    }
    this.state = {
      search: searchText || Search.LAST_SEARCH || '',
      loading: false,
      results: searchText ? [] : Search.LAST_RESULTS || []
    }
  }

  componentDidMount() {
    super.componentDidMount();
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      this._runSearch();
    }
  }

  renderContent() {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder='Search'
          showLoading={this.state.loading}
          onChangeText={this._search.bind(this)}
          value={this.state.search}
          lightTheme
        />
        <FlatList
          data={this.state.results}
          keyExtractor={item => item && item.id}
          renderItem={this._renderListItem.bind(this)}
          getItemLayout={this._getItemLayout.bind(this)}
        />
      </View>
    )
  }

  _renderListItem({ item }) {
    return (
      <ListItem
        key={item.title}
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
          <View>
            <OptionsMenu
              customButton={<Icon style={styles.icon} name='ellipsis-v' size={15} />}
              options={['Add to Library', 'Start Youtube Mix']}
              actions={[this._addSongToLibrary.bind(this, item), this._startYoutubeMix.bind(this, item)]}
            />
          </View>
        }
      />
    );
  }

  _itemClick(item) {
    this.props.navigation.push('Track', {
      item: item,
      playlistItems: this.state.results
    });
  }

  _addSongToLibrary(song) {
    this._getLazyItem(song).then(fullSong => {
      DataService.addSongToLibrary(fullSong).then(() => {
        ToastAndroid.show('Added \'' + fullSong.title + '\' to Library', ToastAndroid.SHORT);
      });
    });
  }

  _startYoutubeMix(song) {
    this._getLazyItem(song).then(fullSong => {
      ToastAndroid.show('Getting mix...', ToastAndroid.SHORT);
      Youtube.getYoutubeMix(fullSong).then(mix => {
        this.props.navigation.push('Playlist', {
          item: {
            title: 'Youtube Mix for ' + fullSong.artist + ' - ' + fullSong.title,
            songs: mix.items
          }
        });
      });
    });
  }

  _getLazyItem(song) {
    ToastAndroid.show('Finding youtube backing track...', ToastAndroid.SHORT);
    return SearchService.getYoutubeId(song).then(id => {
      song.id = `y_${id}`;
      song.url = `https://www.youtube.com/watch?v=${id}`;
      delete song.lazy;
      return song;
    })
  }

  _getItemLayout(item, index) {
    return {
      length: 50,
      offset: 50 * index,
      index
    };
  }

  _search(search) {
    this.setState({
      search
    });
    if (this._worthSearching(search)) {
      this._searchTimeout && clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => {
        this._runSearch();
      }, SEARCH_WAIT);
    }
  }

  _runSearch() {
    const search = this.state.search;
    if (this._worthSearching(search)) {
      this.setState({
        loading: true
      });
      SearchService.search(search)
      .then(response => {
        Search.LAST_SEARCH = search;
        Search.LAST_RESULTS = response || [];
        this._isMounted && this.setState({
          results: response || [],
          loading: false
        });
      });
    }
  }

  _worthSearching(text) {
    return text.length > 3;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight,
    flex: 1
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 0,
    marginTop: 5,
    marginLeft: -10
  },
  text: {
    marginLeft: 10,
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
  }
});
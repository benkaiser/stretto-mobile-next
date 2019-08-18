import React from 'react';
import BasePlayerView from './BasePlayerView';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Config from './config';
import Utilities from './utilities';
import { ListItem } from 'react-native-material-ui';
import SearchService from './services/SearchService';

const SEARCH_WAIT = 300;

export default class Search extends BasePlayerView {
  static navigationOptions = { ...BasePlayerView.navigationOptions, ...{
    header: null
  }};

  static LAST_SEARCH;
  static LAST_RESULTS;

  constructor(props) {
    super(props);
    this.state = {
      search: Search.LAST_SEARCH || '',
      loading: false,
      results: Search.LAST_RESULTS || []
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
          keyExtractor={item => item.id}
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
      />
    );
  }

  _itemClick(item) {
    this.props.navigation.push('Track', {
      item: item,
      playlistItems: this.state.results
    });
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
  }
});
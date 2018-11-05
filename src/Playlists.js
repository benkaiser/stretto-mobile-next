import React from 'react';
import { ListItem } from 'react-native-material-ui';
import BaseListView from './BaseListView';

export default class Playlists extends BaseListView {
  static navigationOptions = { ...BaseListView.navigationOptions, ...{
    title: 'Playlists',
  }};

  constructor(props) {
    super(props);
    this._data = props.navigation.getParam('data');
  }

  getData() {
    return this._data.playlists;
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
      />
    );
  }

  _itemClick(item) {
    this.props.navigation.push('Playlist', {
      data: this._data,
      item: item
    });
  }
}
import React from 'react';
import { ListItem } from 'react-native-material-ui';
import BaseListView from './BaseListView';

export default class Playlist extends BaseListView {
  static navigationOptions = ({ navigation }) => ({ ...BaseListView.navigationOptions, ...{
    title: `${navigation.state.params.item.title}`
  }});

  constructor(props) {
    super(props);
    this._data = props.navigation.getParam('data');
    this._item = props.navigation.getParam('item');
    this._tracks = this._item.songs.map((songId) => {
      return this._data.songs.filter((item) => item.id === songId)[0];
    }).filter(item => !!item);
  }


  getData() {
    return this._tracks;
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
        onPress={this._itemClick.bind(this, item)}
        centerElement={{
          primaryText: item.title,
        }}
      />
    );
  }

  _itemClick(item) {
    this.props.navigation.push('Track', {
      data: this._data,
      item: item,
      playlistItems: this._tracks
    });
  }
}

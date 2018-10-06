import React from 'react';
import { StyleSheet, FlatList, Text, TouchableHighlight, View } from 'react-native';
import { ListItem } from 'react-native-material-ui';
import BaseView from './BaseView';

export default class Playlists extends BaseView {
  static navigationOptions = { ...BaseView.navigationOptions, ...{
    title: 'Playlists',
  }};

  constructor(props) {
    super();
    this._data = props.navigation.getParam('data');
  }

  renderInternal() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this._data.playlists}
          keyExtractor={(item) => item.title}
          renderItem={this._renderListItem.bind(this)}
          style={styles.list}
        />
      </View>
    );
  }

  _renderListItem({item}) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    width: '100%'
  }
});

import React from 'react';
import { ListItem } from 'react-native-material-ui';
import { Image, StyleSheet, Text, View } from 'react-native';
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
    if (this._item.title === 'Library') {
      this._tracks = this._tracks.sort((a, b) => {
        return a.createdAt < b.createdAt ? 1 : -1;
      });
    } 
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
        centerElement={
          <View style={styles.listItem}>
            <Image
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
      data: this._data,
      item: item,
      playlistItems: this._tracks
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
    fontSize: 18,
    lineHeight: 50,
    color: '#000'
  },
  listItem: {
    flex: 1,
    flexDirection: 'row'
  }
});
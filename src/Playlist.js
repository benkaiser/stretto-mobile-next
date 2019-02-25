import React from 'react';
import { ListItem } from 'react-native-material-ui';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image'
import BaseListView from './BaseListView';

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
    return item.title;
  }

  renderListItem({ item }) {
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
      playlistItems: this.state.songs
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
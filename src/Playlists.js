import React from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import { ListItem } from 'react-native-elements'
import Expo from 'expo';
import DataService from './services/dataService';

export default class Playlists extends React.Component {
  static navigationOptions = {
    title: 'Playlists',
  };

  constructor(props) {
    super();
    this._data = props.navigation.getParam('data');
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this._data.playlists}
          keyExtractor={(item) => item.title}
          renderItem={({item}) =>
            <ListItem
              key={item.title}
              onPress={this._itemClick.bind(this, item)}
              title={item.title} />
          }
          style={styles.list}
        />
      </View>
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

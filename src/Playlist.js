import React from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import { ListItem } from 'react-native-elements'
import Expo from 'expo';
import DataService from './services/dataService';

export default class Playlist extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.item.title}`
  });

  constructor(props) {
    super();
    this._data = props.navigation.getParam('data');
    this._item = props.navigation.getParam('item');
    this._tracks = this._item.songs.map((songId) => {
      return this._data.songs.filter((item) => item.id === songId)[0];
    }).filter(item => !!item);
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this._tracks}
          keyExtractor={(item) => item.id}
          renderItem={({item}) =>
            <ListItem
              key={item.title}
              onPress={() => this._itemClick.bind(this, item)}
              title={item.title} />
          }
          style={styles.list}
        />
      </View>
    );
  }

  _itemClick(item) {

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

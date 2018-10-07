import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import BaseView from './BaseView';
import Player from './services/player';

export default class Track extends BaseView {
  static navigationOptions = ({ navigation }) => ({ ...BaseView.navigationOptions, ...{
    title: `${navigation.state.params.item.title}`
  }});

  constructor(props) {
    super();
    this._data = props.navigation.getParam('data');
    this._item = props.navigation.getParam('item');
    console.log(this._item);
  }

  componentDidMount() {
    Player.playSong(this._item);
  }

  renderInternal() {
    return (
      <View style={styles.container}>
        <Text>{this._item.title}</Text>
        <Image
          source={{uri: this._item.cover}}
          style={{width: 400, height: 400}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

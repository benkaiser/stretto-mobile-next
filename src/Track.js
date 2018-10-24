import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Button } from 'react-native-material-ui';
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
        <Button text='play/pause' onPress={this._onPause.bind(this)} />
      </View>
    );
  }

  _onPause() {
    Player.playPause();
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

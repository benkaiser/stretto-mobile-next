import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Audio } from 'expo';
import BaseView from './BaseView';
import Config from './config';

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
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    }).then(() => {
      Audio.Sound.create(
        { uri: Config.STREAMER_URL + '/youtube/' + this._item.id.replace('y_', '') },
        { shouldPlay: true },
        this._onPlaybackStatusUpdate
      ).then(({ sound }) => this._sound = sound);
    })
  }

  componentWillUnmount() {
    this._sound && this._sound.stopAsync();
  }

  _onPlaybackStatusUpdate(status) {
    // console.log(status);
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

  _itemClick(item) {

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

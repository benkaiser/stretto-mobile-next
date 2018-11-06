import React from 'react';
import { ActivityIndicator, StyleSheet, Image, Slider, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BaseView from './BaseView';
import Player from './services/player';

export default class Track extends BaseView {
  static navigationOptions = ({ navigation }) => ({ ...BaseView.navigationOptions, ...{
    title: navigation.state.params.title || navigation.state.params.item.title
  }});

  constructor(props) {
    super();
    this._data = props.navigation.getParam('data');
    this._item = props.navigation.getParam('item');
    this._playlistItems = props.navigation.getParam('playlistItems');
    this.state = {
      buffering: true,
      playing: false,
      seekTime: 0,
      duration: 0
    };
  }

  componentDidMount() {
    Player.playSong(this._item, this._playlistItems);
    this._unlisten = Player.addListener(this._updateState.bind(this));
  }

  componentWillUnmount() {
    this._unlisten && this._unlisten();
    this._autoIncrementTimer && clearInterval(this._autoIncrementTimer);
  }

  renderInternal() {
    return (
      <View style={styles.container}>
        <Text>{this._title()}</Text>
        <Image
          source={{uri: this._cover()}}
          style={{width: 400, height: 400}}
        />
        <View style={styles.controls}>
          <Icon.Button iconStyle={styles.icon} size={30} name='random' color="#000" backgroundColor="#fff" onPress={() => {}} />
          <Icon.Button iconStyle={styles.icon} size={30} name='step-backward' color="#000" backgroundColor="#fff" onPress={this._previous.bind(this)} />
          { this.state.buffering ? 
            <ActivityIndicator style={styles.buffer} size='large' />
            : <Icon.Button iconStyle={styles.icon} size={30} name={this.state.playing ? 'pause' : 'play'} color="#000" backgroundColor="#fff" onPress={this._onPlayPause.bind(this)} />
          }
          <Icon.Button iconStyle={styles.icon} size={30} name='step-forward' color="#000" backgroundColor="#fff" onPress={this._next.bind(this)} />
          <Icon.Button iconStyle={styles.icon} size={30} name='retweet' color="#000" backgroundColor="#fff" onPress={() => {}} />
        </View>
        <View style={styles.sliderContainer}>
          <Slider style={styles.slider} step={0.001} minimumValue={0} maximumValue={1} value={this.state.duration !== 0 ? this.state.seekTime / this.state.duration : 0} onValueChange={this._onSlide.bind(this)} />
        </View>
      </View>
    );
  }

  _title() {
    return this.state.currentTrack ? this.state.currentTrack.title : this._item.title;
  }

  _cover() {
    return this.state.currentTrack ? this.state.currentTrack.artwork : this._item.cover;
  }

  _onPlayPause() {
    Player.playPause();
  }

  _updateState() {
    if (this._title() !== Player.currentTrack.title) {
      this.props.navigation.setParams({ title: Player.currentTrack.title });
    }
    this.setState({
      playing: Player.playing,
      buffering: Player.buffering,
      currentTrack: Player.currentTrack,
      seekTime: Player.seekTime,
      duration: Player.duration
    });
    this._autoIncrementTimer && clearInterval(this._autoIncrementTimer);
    if (Player.playing) {
      this._autoIncrementTimer = setInterval(this._incrementTime.bind(this), 1000);
    }
  }

  _incrementTime() {
    this.setState({
      seekTime: this.state.seekTime + 1
    });
  }

  _previous() {
    Player.previous();
  }

  _next() {
    Player.next();
  }

  _onSlide(value) {
    Player.seekToFraction(value);
  }
}

const styles = StyleSheet.create({
  buffer: {
    marginLeft: 15,
    marginRight: 15
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    margin: 0,
    padding: 10
  },
  sliderContainer: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20
  },
  slider: {
    flex: 1
  }
});

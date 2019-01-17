import React from 'react';
import { ActivityIndicator, StyleSheet, Slider, Text, View } from 'react-native';
import { withTheme } from 'react-native-material-ui';
import FastImage from 'react-native-fast-image'

import BaseView from './BaseView';
import Icon from './components/icon';
import Player from './services/player';

class Track extends BaseView {
  static navigationOptions = ({ navigation }) => ({ ...BaseView.navigationOptions, ...{
    title: navigation.state.params.title || navigation.state.params.item.title
  }});

  constructor(props) {
    super();
    this._item = props.navigation.getParam('item');
    this._playlistItems = props.navigation.getParam('playlistItems');
    this.state = {
      buffering: Player.buffering,
      playing: Player.playing,
      shuffled: Player.shuffled,
      seekTime: 0,
      duration: 0
    };
  }

  componentDidMount() {
    console.log('mounted?');
    Player.playSong(this._item, this._playlistItems);
    this._unlisten = Player.addListener(this._updateState.bind(this));
  }

  componentWillUnmount() {
    this._unlisten && this._unlisten();
    this._autoIncrementTimer && clearInterval(this._autoIncrementTimer);
  }

  renderInternal() {
    let shuffleStyles = {};
    if (this.state.shuffled) {
      shuffleStyles.color = this.props.theme.palette.primaryColor;
    }

    return (
      <View style={styles.container}>
        <Text>{this._title()}</Text>
        <FastImage
          source={{uri: this._cover()}}
          style={{width: 400, height: 400}}
        />
        <View style={styles.controls}>
          <Icon iconStyle={[styles.icon, shuffleStyles]} name='random' onPress={Player.toggleShuffle.bind(Player)} />
          <Icon iconStyle={styles.icon} name='step-backward' onPress={this._previous.bind(this)} />
          { this.state.buffering ? 
            <ActivityIndicator style={styles.buffer} size='large' />
            : <Icon iconStyle={styles.icon} name={this.state.playing ? 'pause' : 'play'} onPress={this._onPlayPause.bind(this)} />
          }
          <Icon iconStyle={styles.icon} name='step-forward' onPress={this._next.bind(this)} />
          <Icon iconStyle={styles.icon} name='retweet' onPress={() => {}} />
        </View>
        <View style={styles.sliderContainer}>
          <Slider style={styles.slider} step={0.001} minimumValue={0} maximumValue={1} value={this.state.duration !== 0 ? this.state.seekTime / this.state.duration : 0} onValueChange={this._onSlide.bind(this)} />
        </View>
      </View>
    );
  }

  _title() {
    return (this.state.currentTrack || this._item).title;
  }

  _cover() {
    return (this.state.currentTrack || this._item).cover;
  }

  _onPlayPause() {
    Player.playPause();
  }

  _updateState() {
    if (Player.currentTrack && this._title() !== Player.currentTrack.title) {
      this.props.navigation.setParams({ title: Player.currentTrack.title });
    }
    this.setState({
      playing: Player.playing,
      buffering: Player.buffering,
      currentTrack: Player.currentTrack,
      seekTime: Player.seekTime,
      duration: Player.duration,
      shuffled: Player.shuffled
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

export default withTheme(Track);

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

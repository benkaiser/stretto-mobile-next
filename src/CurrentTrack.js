import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image'

import Player from './services/player';
import Icon from './components/icon';

export default class CurrentTrack extends React.Component {
  constructor() {
    super();
    this.state = {
      currentTrack: Player.currentTrack || undefined,
      playing: Player.playing
    };
  }

  componentDidMount() {
    this._unlisten = Player.addListener(this._updateState.bind(this));
  }

  componentWillUnmount() {
    this._unlisten && this._unlisten();
  }

  render() {
    if (!this.state.currentTrack) {
      return null;
    } else {
      return (
        <TouchableOpacity style={styles.container} onPress={this._click.bind(this)}>
          <FastImage
            source={{uri: this.state.currentTrack.cover}}
            style={styles.image}
          />
          <View style={styles.textContainer}>
            <Text numberOfLines={1} style={styles.text}>{this.state.currentTrack.title} • {this.state.currentTrack.artist}</Text>
          </View>
          <View style={styles.control}>
            { this.state.buffering ? 
              <ActivityIndicator style={styles.buffer} size='large' />
              : <Icon name={this.state.playing ? 'pause' : 'play'} size={30} onPress={this._onPlayPause.bind(this)} />
            }
          </View>
        </TouchableOpacity>
      );
    }
  }

  _updateState() {
    if (Player.currentTrack) {
      this.setState({
        currentTrack: Player.currentTrack,
        buffering: Player.buffering,
        playing: Player.playing
      });
    }
  }

  _onPlayPause() {
    Player.playPause();
  }

  _click() {
    console.log('navigating');
    this.props.navigation.push('Track', {
      item: this.state.currentTrack,
      playlistItems: Player.playlist
    });
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: 60,
    maxHeight: 60,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    flex: 1,
    flexDirection: 'row'
  },
  buffer: {
    marginTop: -50
  },
  image: {
    width: 50,
    height: 50,
    margin: 5
  },
  textContainer: {
    flex: 0,
    flexShrink: 1,
    flexGrow: 1,
    paddingRight: 10,
    paddingLeft: 5
    // width: 50
  },
  text: {
    fontSize: 18,
    lineHeight: 60,
  },
  control: {
    flex: 1,
    alignSelf: 'flex-end',
    marginTop: -3,
    width: 60,
    flexShrink: 0,
    flexBasis: 60,
    maxWidth: 60
  }
});

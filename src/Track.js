import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, StatusBar, Text, TouchableOpacity, View, ToastAndroid } from 'react-native';
import Slider from '@react-native-community/slider';
import { withTheme } from 'react-native-material-ui';
import FastImage from 'react-native-fast-image'
import { StackActions, NavigationActions } from 'react-navigation';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import BaseView from './BaseView';
import Icon from './components/icon';
import Icon5 from './components/icon5';
import Player from './services/player';
import PlaylistWrapper from './dataAccess/PlaylistWrapper';
import Youtube from './services/Youtube';

class Track extends BaseView {
  static navigationOptions = ({ navigation }) => ({ ...BaseView.navigationOptions, ...{
    title: navigation.state.params.title || navigation.state.params.item.title,
    header: null
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

    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    return (
      <GestureRecognizer config={config} onSwipeDown={this._navigateBack} style={styles.container}>
        <StatusBar backgroundColor='rgba(0,0,0,0.2)' barStyle="light-content" translucent={true} />
        <View style={styles.navigateBack}>
          <Icon5 name='chevron-down' iconStyle={styles.navigateBackIcon} onPress={this._navigateBack} />
          <View styles={styles.iconSpacer} />
          { this._id() && this._id().indexOf('y_') === 0 && <Icon5 name='dice-five' iconStyle={styles.mixIcon} onPress={this._startMix} /> }
        </View>
        <FastImage
          source={{uri: this._cover()}}
          resizeMode='cover'
          style={{ width: '100%', height: 400}}
        />
        <ScrollView style={styles.titleScrollView} horizontal={true}>
          <Text style={styles.title}>{this._title()}</Text>
        </ScrollView>
        <ScrollView style={styles.subtext} horizontal={true} contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.subtextInner}>
            <TouchableOpacity key='artist' onPress={this._onPress.bind(this, this._artist())}>
              <Text style={styles.albumArtist}>{this._artist()}</Text>
            </TouchableOpacity>
            { this._album() ? <Text key='spacer' style={styles.artistSpacer}> - </Text> : undefined }
            
            { this._album() ?
              <TouchableOpacity key='album' onPress={this._onPress.bind(this, this._album())}>
                <Text style={styles.albumArtist}>{this._album()}</Text>
              </TouchableOpacity> : undefined }
          </View>
        </ScrollView>
        <View style={styles.spacer}></View>
        <View style={styles.controls}>
          <Icon key='shuffle' iconStyle={[styles.icon, shuffleStyles]} name='random' onPress={Player.toggleShuffle.bind(Player)} />
          <Icon key='previous' iconStyle={styles.icon} name='step-backward' onPress={this._previous.bind(this)} />
          { this.state.buffering ? 
            <ActivityIndicator key='buffer' style={styles.buffer} size='large' />
            : <Icon key='playPause' iconStyle={styles.largeIcon} name={this.state.playing ? 'pause' : 'play'} onPress={this._onPlayPause.bind(this)} />
          }
          <Icon key='next' iconStyle={styles.icon} name='step-forward' onPress={this._next.bind(this)} />
          <Icon key='repeat' iconStyle={styles.icon} name='retweet' onPress={() => {}} />
        </View>
        <View style={styles.sliderContainer}>
          <Slider style={styles.slider} step={0.001} minimumValue={0} maximumValue={1} value={this.state.duration !== 0 ? this.state.seekTime / this.state.duration : 0} onValueChange={this._onSlide.bind(this)} />
        </View>
      </GestureRecognizer>
    );
  }

  _title() {
    return (this.state.currentTrack || this._item).title;
  }

  _artist() {
    return (this.state.currentTrack || this._item).artist;
  }

  _album() {
    return (this.state.currentTrack || this._item).album;
  }

  _cover() {
    return (this.state.currentTrack || this._item).cover;
  }

  _id() {
    return (this.state.currentTrack || this._item || {}).id;
  }

  _onPlayPause() {
    Player.playPause();
  }

  _updateState() {
    if (Player.currentTrack && this._title() !== Player.currentTrack.title) {
      this.props.navigation.setParams({ title: Player.currentTrack.title });
    }
    const currentTrackModified = { ...Player.currentTrack };
    if (Player.currentTrack) {
      const matchedSongs = PlaylistWrapper.getSongs().filter(song => Player.currentTrack && song && song.id === Player.currentTrack.id);
      if (matchedSongs && matchedSongs[0]) {
        currentTrackModified.album = matchedSongs[0].album;
      }
    }
    this.setState({
      playing: Player.playing,
      buffering: Player.buffering,
      currentTrack: currentTrackModified,
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

  _onPress(value) {
    const resetAction = StackActions.push({
      routeName: 'Search', params: { searchText: value }
    });
    this.props.navigation.dispatch(resetAction);
  }

  _navigateBack = () => {
    this.props.navigation.goBack();
  }

  _startMix = () => {
    const song = this.state.currentTrack || this._item;
    ToastAndroid.show('Getting mix...', ToastAndroid.SHORT);
    Youtube.getYoutubeMix(song).then(mix => {
      this.props.navigation.push('Playlist', {
        item: {
          title: 'Youtube Mix for ' + song.artist + ' - ' + song.title,
          songs: mix.items
        }
      });
    });
  }
}

export default withTheme(Track);

const styles = StyleSheet.create({
  albumArtist: {
    fontSize: 20,
    lineHeight: 50,
    height: 50,
    textAlign: 'center'
  },
  artistSpacer: {
    fontSize: 20,
    lineHeight: 50,
    height: 50,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center'
  },
  buffer: {
    marginLeft: 15,
    marginRight: 15
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  navigateBack: {
    position: 'absolute',
    zIndex: 100,
    top: StatusBar.currentHeight,
    left: 0,
    right: 10,
    // width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  navigateBackIcon: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingLeft: 3,
    paddingRight: 3,
    borderRadius: 4
  },
  iconSpacer: {
    flex: 2
  },
  mixIcon: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 5,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 5,
    alignSelf: 'flex-end'
  },
  subtext: {
    height: 50,
    maxHeight: 50,
    width: '100%'
  },
  subtextInner: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 100,
    marginBottom: 20,
    width: '100%'
  },
  largeIcon: {
    margin: 0,
    padding: 0,
    fontSize: 50
  },
  icon: {
    margin: 0,
    padding: 10,
  },
  sliderContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 50
  },
  slider: {
    flex: 1
  },
  spacer: {
    flex: 1
  },
  title: {
    fontSize: 40,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center'
  },
  titleScrollView: {
    maxHeight: 60
  }
});

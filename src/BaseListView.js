import React from 'react';
import { StyleSheet, FlatList, ToastAndroid, View } from 'react-native';
import BasePlayerView from './BasePlayerView';
import Youtube from './services/Youtube';

export default class BaseListView extends BasePlayerView {
  static navigationOptions = BasePlayerView.navigationOptions;

  renderContent() {
    return (
      <View style={styles.container}>
        { this.header() }
        <FlatList
          data={this.getData()}
          keyExtractor={this.keyExtractor.bind(this)}
          renderItem={this.renderListItem.bind(this)}
          getItemLayout={this._getItemLayout.bind(this)}
        />
      </View>
    );
  }

  getData() {
    throw new Error('Unimplemented');
  }

  itemHeight(_) {
    throw new Error('Unimplemented');
  }

  keyExtractor(item) {
    throw new Error('Unimplemented');
  }

  header() {
    return null;
  }

  renderListItem(item) {
    throw new Error('Unimplemented');
  }
  
  startYoutubeMix(item) {
    ToastAndroid.show('Getting mix...', ToastAndroid.SHORT);
    Youtube.getYoutubeMix(item).then(mix => {
      this.props.navigation.push('Playlist', {
        item: {
          title: 'Youtube Mix for ' + item.artist + ' - ' + item.title,
          songs: mix.items
        }
      });
    });
  }

  _getItemLayout(item, index) {
    return {
      length: this.itemHeight(item),
      offset: this.itemHeight(item) * index,
      index
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

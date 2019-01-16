import React from 'react';
import { StyleSheet, View } from 'react-native';

import BaseView from './BaseView';
import CurrentTrack from './CurrentTrack';

export default class BasePlayerView extends BaseView {
  static navigationOptions = BaseView.navigationOptions;

  renderInternal() {
    return (
      <View style={styles.container}>
        { this.renderContent() }
        <CurrentTrack navigation={this.props.navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

import React from 'react';
import { View } from 'react-native';
import BaseView from './BaseView';

export default class BasePlayerView extends BaseView {
  static navigationOptions = BaseView.navigationOptions;

  renderInternal() {
    return (
      <View>
        { this.renderContent() }
      </View>
    );
  }
}
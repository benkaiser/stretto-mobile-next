import React from 'react';
import BasePlayerView from './BasePlayerView';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-material-ui';
import { AsyncStorage } from 'react-native';

export default class Settings extends BasePlayerView {
  static navigationOptions = { ...BasePlayerView.navigationOptions, ...{
    title: 'Settings',
  }};

  constructor(props) {
    super(props);
  }

  renderContent() {
    return (
      <View style={styles.container}>
        <Button raised accent text="Logout" onPress={this._logout.bind(this)} />
      </View>
    )
  }

  _logout() {
    AsyncStorage.removeItem('USER_INFO').then(() => {
      this.props.navigation.replace('Login');
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
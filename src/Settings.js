import React from 'react';
import BasePlayerView from './BasePlayerView';
import { Switch, Text, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-material-ui';
import { AsyncStorage } from 'react-native';
import SettingsManager from './dataAccess/SettingsManager';

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
        <View>
          <Text>Auto-download when playing (this will double the data usage on a first listen but reduce all future plays)</Text>
          <Switch value={SettingsManager.getSetting('autoDownload', false)} onValueChange={this._toggleValue.bind(this, 'autoDownload')} />
        </View>
        <View>
          <Text>Offline Mode (only show offline music)</Text>
          <Switch value={SettingsManager.getSetting('offlineMode', false)} onValueChange={this._toggleValue.bind(this, 'offlineMode')} />
        </View>
        <Button style={styles.logout} raised accent text="Logout" onPress={this._logout.bind(this)} />
      </View>
    )
  }

  _logout() {
    AsyncStorage.removeItem('USER_INFO').then(() => {
      this.props.navigation.replace('Login');
    });
  }

  _toggleValue = (settingKey, toggleValue) => {
    SettingsManager.setSetting(settingKey, toggleValue);
    this.forceUpdate();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  logout: {
    alignSelf: 'flex-end'
  }
});
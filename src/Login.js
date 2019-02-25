import React from 'react';
import {
  ActivityIndicator,
  Linking,
  NetInfo,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button } from 'react-native-material-ui';
import DataService from './services/dataService';
import LoginService from './services/loginService';
import LoadedExecutor from './executor/LoadedExecutor';
import BaseView from './BaseView';
import PlaylistWrapper from './dataAccess/PlaylistWrapper';

export default class Login extends BaseView {
  static navigationOptions = { ...BaseView.navigationOptions, ...{
    title: 'Login',
  }};

  constructor() {
    super();
    this.state = {
      loading: true,
      loadingText: 'Loading...'
    };
  }

  componentDidMount() {
    Linking.getInitialURL().then((url) => {
      if (url && url.split('://')[1]) {
        console.log('Initial url is: ' + url);
      } else {
        NetInfo.getConnectionInfo().then((connectionInfo) => {
          if (connectionInfo.type === 'none' || connectionInfo.type === 'unknown') {
            PlaylistWrapper.loadFromLocal().then(this._loadingComplete.bind(this));
          } else {
            LoginService.checkLogin().then(credentials => {
              if (credentials) {
                this._authServerLoadData(credentials);
              } else {
                this.setState({
                  loading: false
                });
              }
            }).catch(error => {
              console.log(error);
              this.setState({
                loading: false
              });
            });
          }
        });
      }
    });
  }

  renderInternal() {
    return (
      <View style={styles.container}>
        { this.state.loading ? this._loadingView() : this._loginView() }
      </View>
    );
  }

  _loadingView() {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>{this.state.loadingText}</Text>
      </View>
    );
  }

  _loginView() {
    return (
      <Button
        primary
        text="Login to Show Your Library"
        onPress={this._onLoginPressed.bind(this)}
        />
    );
  }

  _onLoginPressed() {
    LoginService.login()
    .then(this._authServerLoadData.bind(this));
  }

  _onReload() {
    Updates.reload();
  }

  _authServerLoadData(credentials) {
    this.setState({
      isLoading: true,
      loadingText: 'Loading Stretto data'
    });
    return DataService.getData(credentials)
    .then(this._loadingComplete.bind(this))
    .catch((error) => {
      this.setState({
        loading: false
      });
      console.log(error);
    });
  }

  _loadingComplete() {
    LoadedExecutor.execute();
    this.props.navigation.replace('Playlists');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

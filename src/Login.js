import React from 'react';
import {
  ActivityIndicator,
  Button,
  Linking,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Updates } from 'expo';
import DataService from './services/dataService';
import LoginService from './services/loginService';
import BaseView from './BaseView';

export default class Login extends BaseView {
  static navigationOptions = { ...BaseView.navigationOptions, ...{
    title: 'Login',
  }};

  constructor() {
    super();
    this.state = {
      loading: true,
      loadingText: 'Checking login status...'
    };
  }

  componentDidMount() {
    Linking.getInitialURL().then((url) => {
      if (url && url.split('://')[1]) {
        console.log('Initial url is: ' + url);
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

  renderInternal() {
    return (
      <View style={styles.container}>
        { this.state.loading ? this._loadingView() : this._loginView() }
        <Button
          title="Reload"
          onPress={this._onReload.bind(this)}
        />
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
        title="Login to Show Your Library"
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
    .then(data => {
      this.props.navigation.replace('Playlists', {
        data: data
      });
    }).catch((error) => {
      this.setState({
        loading: false
      });
      console.log(error);
    });
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

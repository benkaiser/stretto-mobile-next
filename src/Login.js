import React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Expo from 'expo';
import DataService from './services/dataService';
import LoginService from './services/loginService';

export default class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
  };

  constructor() {
    super();
    this.state = {
      loading: true,
      loadingText: 'Checking login status...'
    };
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

  render() {
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
        title="Login to Show Your Library"
        onPress={this._onLoginPressed.bind(this)}
        />
    );
  }

  _onLoginPressed() {
    LoginService.login()
    .then(this._authServerLoadData.bind(this));
  }

  _authServerLoadData(credentials) {
    this.setState({
      isLoading: true,
      loadingText: 'Loading Stretto data'
    });
    return DataService.getData(credentials)
    .then(data => {
      this.props.navigation.replace('Playlist', {
        data: data
      });
    }).catch((error) => {
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

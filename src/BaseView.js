import React from 'react';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';
import { BottomNavigation } from 'react-native-material-ui';
import { StackActions, NavigationActions } from 'react-navigation';

const themeColor = COLOR.blue400;

const uiTheme = {
  palette: {
    primaryColor: themeColor,
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};

const keymap = {
  'Login': 'library',
  'Playlists': 'library',
  'Search': 'search',
  'Settings': 'settings'
}

export default class BaseView extends React.Component {
  static navigationOptions = {
    headerStyle: {
      backgroundColor: themeColor
    },
    headerTintColor: COLOR.white
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        { this.renderInternal() }
        { this._bottomNavigation() }
      </ThemeContext.Provider>
    );
  }

  _bottomNavigation() {
    return (
      <BottomNavigation active={this._activeKey()} hidden={false} >
        <BottomNavigation.Action
            key="library"
            icon="audiotrack"
            label="Library"
            onPress={() => this._navigate('Playlists')}
        />
        <BottomNavigation.Action
            key="search"
            icon="search"
            label="Search"
            onPress={() => this._navigate('Search')}
        />
        <BottomNavigation.Action
            key="settings"
            icon="settings"
            label="Settings"
            onPress={() => this._navigate('Settings')}
        />
      </BottomNavigation>
    );
  }

  _activeKey() {
    const route = this.props.navigation.state.routeName;
    return keymap[route] || route; 
  }

  _navigate(routeName) {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })],
    });
    this.props.navigation.dispatch(resetAction);
  }
}
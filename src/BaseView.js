import React from 'react';
import { View } from 'react-native';
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';

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

export default class BaseView extends React.Component {
  static navigationOptions = {
    headerStyle: {
      backgroundColor: themeColor
    },
    headerTintColor: COLOR.white
  };

  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        { this.renderInternal() }
      </ThemeContext.Provider>
    );
  }
}
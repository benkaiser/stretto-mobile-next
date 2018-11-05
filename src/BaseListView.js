import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import BasePlayerView from './BasePlayerView';

export default class BaseListView extends BasePlayerView {
  static navigationOptions = BasePlayerView.navigationOptions;

  renderContent() {
    return (
      <View>
        <FlatList
          data={this.getData()}
          keyExtractor={this.keyExtractor.bind(this)}
          renderItem={this.renderListItem.bind(this)}
          getItemLayout={this._getItemLayout.bind(this)}
          style={styles.list}
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

  renderListItem(item) {
    throw new Error('Unimplemented');
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
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    width: '100%'
  }
});

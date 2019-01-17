import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { IconToggle } from 'react-native-material-ui';

export default function(props) {
  return (
    <IconToggle style={props.toggleStyle || {}} size={props.size || 30} onPress={props.onPress || function(){}}>
      <Icon style={props.iconStyle || {}} name={props.name} size={props.size || 30} />
    </IconToggle>
  );
}
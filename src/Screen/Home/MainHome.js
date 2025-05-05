import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import styles from './style';
import Content from './Content';

export default function MainHome() {
  return (
    <View style={styles.container}>
      <Header />
      <Content />
    </View>
  );
}


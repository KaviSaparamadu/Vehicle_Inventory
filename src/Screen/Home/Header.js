import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import styles from './style';
import Profile from '../../img/profile.png'; 
export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.welcomeText}>Welcome !</Text>
      <Image source={Profile} style={styles.profileIcon} />
    </View>
  );
}

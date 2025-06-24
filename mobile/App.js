import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  const siteUrl =
    process.env.SITE_URL ||
    Constants.expoConfig?.extra?.siteUrl ||
    'https://alibek0301.github.io/Aliqgroup/';

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ uri: siteUrl }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webview: {
    flex: 1
  }
});

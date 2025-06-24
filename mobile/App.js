import React from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  const siteUrl =
    process.env.SITE_URL ||
    Constants.expoConfig?.extra?.siteUrl ||
    'https://alibek0301.github.io/Aliqgroup/';

  const handleNavigation = (event) => {
    const url = event.url || '';
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ uri: siteUrl }}
        style={styles.webview}
        onShouldStartLoadWithRequest={handleNavigation}
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

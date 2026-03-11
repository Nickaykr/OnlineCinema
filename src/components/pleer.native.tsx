import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface PlayerProps {
  kpId: string | number;
}

const MoviePlayer: React.FC<PlayerProps> = ({ kpId }) => {
  const playerUrl = `https://kinovibe.vip/embed/kinopoisk/${kpId}/`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: playerUrl }}
        style={styles.video}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: 250, backgroundColor: '#000' },
  video: { flex: 1 },
});

export default MoviePlayer;
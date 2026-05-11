import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const { latitude, longitude } = location.coords;

    sendLocationToMap(latitude, longitude);
  };

  const sendLocationToMap = (lat: number, lng: number) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'location',
          lat,
          lng,
        })
      );
    }
  };

  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet/dist/leaflet.css"
    />

    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

    <script>
      const map = L.map('map').setView([0, 0], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      let marker;

      document.addEventListener("message", function(event) {
        const data = JSON.parse(event.data);

        if (data.type === 'location') {

          map.setView([data.lat, data.lng], 16);

          if (marker) {
            map.removeLayer(marker);
          }

          marker = L.marker([data.lat, data.lng]).addTo(map);
        }
      });
    </script>
  </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" style={styles.loader} />}

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        javaScriptEnabled={true}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 999,
  },
});
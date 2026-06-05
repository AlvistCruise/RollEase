import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useApp, Place } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function MapScreen() {
  const webViewRef = useRef<WebView>(null);
  const { addHistoryEntry, toggleFavorite, isFavorite, activeRoute, setActiveRoute } = useApp();
  
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  // State Variables
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  
  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [startCoords, setStartCoords] = useState<Place | null>(null);
  const [destCoords, setDestCoords] = useState<Place | null>(null);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'start' | 'dest' | null>(null);
  const [searching, setSearching] = useState(false);
  
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [routingInProgress, setRoutingInProgress] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        setMapReady(true);
      }
    } catch (e) {
      console.warn('WebView Message Error:', e);
    }
  }, []);

  // Send communication to WebView Leaflet Map
  const postMessageToMap = useCallback((msg: any) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(msg));
    }
  }, []);

  const sendUserLocation = useCallback((lat: number, lng: number, center: boolean) => {
    postMessageToMap({
      type: 'userLocation',
      lat,
      lng,
      center,
    });
  }, [postMessageToMap]);

  const calculateRoute = useCallback(async () => {
    if (!startCoords || !destCoords) return;
    setRoutingInProgress(true);
    
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${startCoords.lng},${startCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        Alert.alert('Route Error', 'Could not find a wheelchair-pedestrian path between these locations.');
        setRouteInfo(null);
        postMessageToMap({ type: 'clearRoute' });
        return;
      }

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]); // Swap lng,lat to lat,lng
      const distance = route.distance; // meters
      // Calculate realistic wheelchair duration based on 1.2 m/s average speed (~4.3 km/h)
      const duration = distance / 1.2; 

      setRouteInfo({ distance, duration });

      // Draw polyline on the map
      postMessageToMap({
        type: 'drawRoute',
        coordinates: coords,
        startName: startCoords.name,
        destName: destCoords.name,
      });

    } catch (e) {
      console.error('Failed to compute route:', e);
      Alert.alert('Network Error', 'Could not calculate the route. Please check your connection.');
    } finally {
      setRoutingInProgress(false);
    }
  }, [startCoords, destCoords, postMessageToMap]);

  const fetchSuggestions = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RollEaseMobileWheelchairApp/1.0',
        },
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch autocomplete suggestions:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  // Setup Real-time Location Tracking
  useEffect(() => {
    let locationSubscription: any;

    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permissions are required to show your current location and route from it.');
        setLoading(false);
        return;
      }

      // Get initial position
      let initialLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(initialLoc.coords);
      setLoading(false);

      // Watch for changes
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
        },
        (loc) => {
          setUserLocation(loc.coords);
        }
      );
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Synchronise current location to Leaflet map once ready
  useEffect(() => {
    if (mapReady && userLocation) {
      if (!hasCentered) {
        sendUserLocation(userLocation.latitude, userLocation.longitude, true);
        setHasCentered(true);
      } else {
        sendUserLocation(userLocation.latitude, userLocation.longitude, false);
      }
    }
  }, [mapReady, userLocation, hasCentered, sendUserLocation]);

  // Listen for Shared Navigation Route (when coming from History or Favorites)
  useEffect(() => {
    if (activeRoute) {
      if (activeRoute.start.name === 'Current Location') {
        // Use current user location
        if (userLocation) {
          const updatedStart = {
            name: 'Current Location',
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          };
          setStartCoords(updatedStart);
          setStartQuery('Current Location');
        } else {
          Alert.alert('Error', 'Current location is not available yet.');
        }
      } else {
        setStartCoords(activeRoute.start);
        setStartQuery(activeRoute.start.name);
      }

      setDestCoords(activeRoute.destination);
      setDestQuery(activeRoute.destination.name);
      
      // Clean activeRoute so it doesn't trigger on every mount
      setActiveRoute(null);
    }
  }, [activeRoute, userLocation, setActiveRoute]);

  // Debounced search for suggestions
  useEffect(() => {
    const activeText = activeInput === 'start' ? startQuery : destQuery;
    
    if (!activeInput || !activeText || activeText.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (activeText === 'Current Location') {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions(activeText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [startQuery, destQuery, activeInput, fetchSuggestions]);

  // Trigger routing when start or dest changes
  useEffect(() => {
    if (startCoords && destCoords) {
      calculateRoute();
    } else {
      setRouteInfo(null);
      // Clear route in webview
      postMessageToMap({ type: 'clearRoute' });
    }
  }, [startCoords, destCoords, calculateRoute, postMessageToMap]);

  const centerOnUser = () => {
    if (userLocation) {
      sendUserLocation(userLocation.latitude, userLocation.longitude, true);
    } else {
      Alert.alert('Location unavailable', 'Waiting for location updates...');
    }
  };


  const handleSelectSuggestion = (item: any) => {
    const place: Place = {
      name: item.display_name.split(',')[0] || item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };

    if (activeInput === 'start') {
      setStartCoords(place);
      setStartQuery(item.display_name);
    } else if (activeInput === 'dest') {
      setDestCoords(place);
      setDestQuery(item.display_name);
    }

    setSuggestions([]);
    setActiveInput(null);
    Keyboard.dismiss();
  };

  const useCurrentLocationAsStart = () => {
    if (userLocation) {
      const place: Place = {
        name: 'Current Location',
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
      setStartCoords(place);
      setStartQuery('Current Location');
      setActiveInput(null);
      setSuggestions([]);
      Keyboard.dismiss();
    } else {
      Alert.alert('Location unavailable', 'Please wait until your current location is detected.');
    }
  };

  const handleSwapLocations = () => {
    const tempCoords = startCoords;
    const tempQuery = startQuery;

    setStartCoords(destCoords);
    setStartQuery(destQuery);

    setDestCoords(tempCoords);
    setDestQuery(tempQuery);
  };

  const handleStartNavigation = async () => {
    if (!startCoords || !destCoords || !routeInfo) return;
    
    // Add to history list
    await addHistoryEntry(startCoords, destCoords, routeInfo.distance, routeInfo.duration);
    
    const isCurrentLocation = startCoords.name === 'Current Location';

    // Start navigation state in Leaflet
    postMessageToMap({
      type: 'startNavigation',
      followUser: isCurrentLocation,
      lat: startCoords.lat,
      lng: startCoords.lng,
    });

    Alert.alert(
      'Navigation Started',
      `Simulating accessibility route of ${((routeInfo.distance) / 1000).toFixed(2)} km. History has been logged!`,
      [{ text: 'Dismiss' }]
    );
  };

  const handleClearRoute = () => {
    setStartQuery('');
    setDestQuery('');
    setStartCoords(null);
    setDestCoords(null);
    setRouteInfo(null);
    postMessageToMap({ type: 'clearRoute' });
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
  };

  // Leaflet HTML String configuration
  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: ${isDark ? '#151718' : '#F3F4F6'};
      /* Pulsing Blue Location Dot */
      .leaflet-div-icon {
        background: transparent !important;
        border: none !important;
      }
      .custom-location-icon {
        background: transparent !important;
        border: none !important;
      }
      .location-marker {
        width: 14px;
        height: 14px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
        animation: pulse 1.6s infinite alternate;
        margin: 1px 0 0 1px;
      }
      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.6); }
        100% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([0, 0], 2);

      // OpenStreetMap Tiles (support Dark Mode stylesheet filter if dark)
      const tileUrl = '${isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}';
      const attribution = '${isDark ? '&copy; CartoDB' : '&copy; OpenStreetMap contributors'}';

      L.tileLayer(tileUrl, { attribution }).addTo(map);

      let userMarker = null;
      let startMarker = null;
      let destMarker = null;
      let activePolyline = null;
      let followUserLocation = false;

      // Handle App messages
      function handleAppMessage(event) {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch(e) {
          return;
        }

        if (data.type === 'userLocation') {
          const latlng = [data.lat, data.lng];
          if (userMarker) {
            userMarker.setLatLng(latlng);
          } else {
            const icon = L.divIcon({
              className: 'custom-location-icon',
              html: '<div class="location-marker"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            userMarker = L.marker(latlng, { icon }).addTo(map);
          }
          
          if (data.center) {
            map.setView(latlng, 18);
          } else if (followUserLocation) {
            map.setView(latlng, map.getZoom() || 18);
          }
        }

        if (data.type === 'center') {
          map.setView([data.lat, data.lng], data.zoom || 18);
        }

        if (data.type === 'startNavigation') {
          followUserLocation = data.followUser;
          if (followUserLocation && startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
          }
          map.setView([data.lat, data.lng], 18);
        }

        if (data.type === 'drawRoute') {
          // Clean previous polyline/markers
          clearRoute();

          const coords = data.coordinates;
          const start = coords[0];
          const dest = coords[coords.length - 1];

          // Setup markers
          startMarker = L.marker(start).addTo(map).bindPopup('Start: ' + data.startName);
          destMarker = L.marker(dest).addTo(map).bindPopup('Destination: ' + data.destName);

          // Route Polyline (Thick accessible style)
          activePolyline = L.polyline(coords, {
            color: '#0a7ea4',
            weight: 6,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          // Zoom to route
          map.fitBounds(activePolyline.getBounds(), {
            padding: [60, 60]
          });
        }

        if (data.type === 'clearRoute') {
          clearRoute();
          if (userMarker) {
            map.setView(userMarker.getLatLng(), 18);
          }
        }
      }

      window.addEventListener('message', handleAppMessage);
      document.addEventListener('message', handleAppMessage);

      function clearRoute() {
        followUserLocation = false;
        if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
        if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
        if (activePolyline) { map.removeLayer(activePolyline); activePolyline = null; }
      }

      // Notify React Native that the map is fully loaded and ready
      function notifyReady() {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
        }
      }

      notifyReady();
      window.onload = notifyReady;
      document.addEventListener('DOMContentLoaded', notifyReady);
      setTimeout(notifyReady, 200);
      setTimeout(notifyReady, 500);
      setTimeout(notifyReady, 1500);
    </script>
  </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      {/* Backdrop overlay to catch taps when inputs are active or suggestions are open */}
      {activeInput !== null && (
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={() => {
            Keyboard.dismiss();
            setActiveInput(null);
          }}
        />
      )}

      {/* Leaflet Webview */}
      <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletHTML }}
          javaScriptEnabled={true}
          onMessage={handleWebViewMessage}
          onLoadStart={() => {
            setMapReady(false);
            setHasCentered(false);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          style={styles.map}
        />

        {/* Floating Search Controls Card */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
          <View style={styles.inputRow}>
            <View style={[styles.inputIcon, { backgroundColor: '#10B981' }]} />
            <TextInput
              style={[styles.textInput, { color: themeColors.text }]}
              placeholder="Starting Location..."
              placeholderTextColor={isDark ? '#687076' : '#9BA1A6'}
              value={startQuery}
              onFocus={() => setActiveInput('start')}
              onChangeText={setStartQuery}
            />
            {startQuery !== '' && (
              <TouchableOpacity onPress={() => { setStartQuery(''); setStartCoords(null); }}>
                <MaterialIcons name="close" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.separator, { backgroundColor: isDark ? '#2D3032' : '#F3F4F6' }]} />

          <View style={styles.inputRow}>
            <View style={[styles.inputIcon, { backgroundColor: '#EF4444' }]} />
            <TextInput
              style={[styles.textInput, { color: themeColors.text }]}
              placeholder="Where to? (Destination)..."
              placeholderTextColor={isDark ? '#687076' : '#9BA1A6'}
              value={destQuery}
              onFocus={() => setActiveInput('dest')}
              onChangeText={setDestQuery}
            />
            {destQuery !== '' && (
              <TouchableOpacity onPress={() => { setDestQuery(''); setDestCoords(null); }}>
                <MaterialIcons name="close" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Toolbar */}
          <View style={styles.toolbarRow}>
            <TouchableOpacity style={styles.toolbarBtn} onPress={useCurrentLocationAsStart}>
              <MaterialIcons name="my-location" size={16} color="#0a7ea4" />
              <Text style={styles.toolbarBtnText}>Use Current Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleSwapLocations}>
              <MaterialIcons name="swap-vert" size={18} color="#0a7ea4" />
              <Text style={styles.toolbarBtnText}>Swap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggestion Dropdown List */}
        {activeInput && suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestionItem, { borderBottomColor: isDark ? '#2D3032' : '#F3F4F6' }]}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <MaterialIcons name="location-on" size={18} color="#9BA1A6" style={{ marginRight: 10 }} />
                  <Text numberOfLines={2} style={[styles.suggestionText, { color: themeColors.text }]}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {/* Search / Autocomplete Loader */}
        {searching && (
          <ActivityIndicator
            size="small"
            color="#0a7ea4"
            style={[styles.searchLoader, { right: 36, top: activeInput === 'start' ? 70 : 120 }]}
          />
        )}

        {/* Recenter Button */}
        <TouchableOpacity
          style={[styles.recenterBtn, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}
          onPress={centerOnUser}
        >
          <MaterialIcons name="gps-fixed" size={22} color="#0a7ea4" />
        </TouchableOpacity>

        {/* Routing/Details Card */}
        {routeInfo && (
          <View style={[styles.detailsCard, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={[styles.detailsTitle, { color: themeColors.text }]}>Wheelchair Route</Text>
                <Text style={styles.detailsSubtitle}>Accessible Pedestrian Path</Text>
              </View>
              {destCoords && (
                <TouchableOpacity onPress={() => toggleFavorite(destCoords)}>
                  <MaterialIcons
                    name={isFavorite(destCoords.lat, destCoords.lng) ? 'star' : 'star-outline'}
                    size={28}
                    color="#EAB308"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.detailsStats, { borderTopColor: isDark ? '#2D3032' : '#F3F4F6' }]}>
              <View style={styles.statCol}>
                <Text style={styles.statHeader}>Distance</Text>
                <Text style={[styles.statValue, { color: themeColors.text }]}>
                  {formatDistance(routeInfo.distance)}
                </Text>
              </View>
              <View style={[styles.statCol, { borderLeftWidth: 1, borderLeftColor: isDark ? '#2D3032' : '#F3F4F6' }]}>
                <Text style={styles.statHeader}>Estimation Time</Text>
                <Text style={[styles.statValue, { color: themeColors.text }]}>
                  {formatDuration(routeInfo.duration)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.navBtn]}
                onPress={handleStartNavigation}
              >
                <FontAwesome5 name="wheelchair" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Start Navigating</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.clearBtn, { borderColor: isDark ? '#3D4144' : '#E5E7EB' }]}
                onPress={handleClearRoute}
              >
                <Text style={[styles.clearBtnText, { color: isDark ? '#9BA1A6' : '#687076' }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Global Loading Overlay */}
        {loading && (
          <View style={styles.loaderBg}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.loaderText}>Centering Leaflet Map...</Text>
          </View>
        )}

        {/* Routing Loader Overlay */}
        {routingInProgress && (
          <View style={styles.loaderBg}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.loaderText}>Calculating accessible path...</Text>
          </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loaderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 4,
  },
  inputIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolbarBtnText: {
    color: '#0a7ea4',
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 196,
    left: 16,
    right: 16,
    maxHeight: 220,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 200,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  searchLoader: {
    position: 'absolute',
    zIndex: 150,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 195,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
    zIndex: 90,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  detailsSubtitle: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  detailsStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    color: '#808080',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    flex: 2,
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1.5,
  },
  clearBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
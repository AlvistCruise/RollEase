import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp, HistoryItem, FavoriteItem, Place } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function SavedScreen() {
  const { history, favorites, toggleFavorite, clearHistory, setActiveRoute } = useApp();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRouteSelect = (start: Place, destination: Place) => {
    setActiveRoute({ start, destination });
    router.replace('/');
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const isDark = colorScheme === 'dark';
    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
        <View style={styles.routeHeader}>
          <FontAwesome5 name="wheelchair" size={18} color="#0a7ea4" style={{ marginRight: 8 }} />
          <Text style={[styles.dateText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            {formatDate(item.timestamp)}
          </Text>
        </View>

        <View style={styles.locationsContainer}>
          <View style={styles.timelineContainer}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <View style={[styles.line, { backgroundColor: isDark ? '#3D4144' : '#E1E3E5' }]} />
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          </View>
          <View style={styles.addressesContainer}>
            <Text numberOfLines={1} style={[styles.addressText, { color: themeColors.text }]}>
              {item.start.name}
            </Text>
            <Text numberOfLines={1} style={[styles.addressText, { color: themeColors.text, marginTop: 12 }]}>
              {item.destination.name}
            </Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { borderBottomColor: isDark ? '#2D3032' : '#F3F4F6' }]} />

        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            <View style={styles.statDetail}>
              <MaterialIcons name="directions-walk" size={16} color="#687076" />
              <Text style={[styles.statDetailText, { color: themeColors.text }]}>
                {formatDistance(item.distance)}
              </Text>
            </View>
            <View style={[styles.statDetail, { marginLeft: 16 }]}>
              <MaterialIcons name="access-time" size={16} color="#687076" />
              <Text style={[styles.statDetailText, { color: themeColors.text }]}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.goButton, { backgroundColor: '#0a7ea4' }]}
            onPress={() => handleRouteSelect(item.start, item.destination)}
          >
            <MaterialIcons name="navigation" size={16} color="#fff" />
            <Text style={styles.goButtonText}>Go</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
    const isDark = colorScheme === 'dark';
    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
        <View style={styles.favHeader}>
          <View style={styles.favTitleContainer}>
            <MaterialIcons name="place" size={20} color="#EF4444" style={{ marginRight: 6 }} />
            <Text numberOfLines={1} style={[styles.favTitle, { color: themeColors.text }]}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite({ name: item.name, lat: item.lat, lng: item.lng })}>
            <MaterialIcons name="star" size={24} color="#EAB308" />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.coordinatesText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          Lat: {item.lat.toFixed(5)}, Lng: {item.lng.toFixed(5)}
        </Text>

        <View style={[styles.cardDivider, { borderBottomColor: isDark ? '#2D3032' : '#F3F4F6' }]} />

        <View style={styles.favActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: '#0a7ea4', borderWidth: 1 }]}
            onPress={() => {
              // Set as destination, start is current location
              setActiveRoute({
                start: { name: 'Current Location', lat: 0, lng: 0 }, // Handled specially in index.tsx
                destination: { name: item.name, lat: item.lat, lng: item.lng },
              });
              router.replace('/');
            }}
          >
            <MaterialIcons name="directions" size={16} color="#0a7ea4" style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnText, { color: '#0a7ea4' }]}>Navigate To</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: '#10B981', borderWidth: 1 }]}
            onPress={() => {
              // Set as start location
              setActiveRoute({
                start: { name: item.name, lat: item.lat, lng: item.lng },
                destination: { name: '', lat: 0, lng: 0 },
              });
              router.replace('/');
            }}
          >
            <MaterialIcons name="location-searching" size={16} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Set as Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isDark = colorScheme === 'dark';

    const gradientColors = isDark
      ? ['#0a7ea430', '#151718']
      : ['#0a7ea415', '#F3F4F6'];

    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#151718' : '#F3F4F6' }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Screen Title */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: themeColors.text }]}>Saved Routes</Text>
              {activeTab === 'history' && history.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Segmented Tab Controls */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? '#1F2224' : '#E5E7EB' }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'history' && [styles.activeTab, { backgroundColor: isDark ? '#3D4144' : '#fff' }],
                ]}
                onPress={() => setActiveTab('history')}
              >
                <MaterialIcons
                  name="history"
                  size={18}
                  color={activeTab === 'history' ? '#0a7ea4' : isDark ? '#9BA1A6' : '#687076'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'history' ? '#0a7ea4' : isDark ? '#9BA1A6' : '#687076' },
                    activeTab === 'history' && styles.activeTabText,
                  ]}
                >
                  History
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'favorites' && [styles.activeTab, { backgroundColor: isDark ? '#3D4144' : '#fff' }],
                ]}
                onPress={() => setActiveTab('favorites')}
              >
                <MaterialIcons
                  name="star"
                  size={18}
                  color={activeTab === 'favorites' ? '#EAB308' : isDark ? '#9BA1A6' : '#687076'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'favorites' ? '#EAB308' : isDark ? '#9BA1A6' : '#687076' },
                    activeTab === 'favorites' && styles.activeTabText,
                  ]}
                >
                  Favorites
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lists */}
            {activeTab === 'history' ? (
              history.length > 0 ? (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id}
                  renderItem={renderHistoryItem}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={[styles.emptyIconBg, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
                    <FontAwesome5 name="wheelchair" size={48} color="#9BA1A6" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Route History</Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                    Your recently started routes will show up here to help you navigate quickly.
                  </Text>
                </View>
              )
            ) : favorites.length > 0 ? (
              <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={renderFavoriteItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBg, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
                  <MaterialIcons name="star-outline" size={54} color="#9BA1A6" />
                </View>
                <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Favorite Places</Text>
                <Text style={[styles.emptySubtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                  Star a location on the map screen to save it for quick wheelchair routing access.
                </Text>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  clearAllText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  timelineContainer: {
    alignItems: 'center',
    width: 16,
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 20,
    marginVertical: 4,
  },
  addressesContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardDivider: {
    borderBottomWidth: 1,
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDetailText: {
    fontSize: 13,
    fontWeight: '600',
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  goButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Favorites Specific Styles
  favHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  favTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  favTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  coordinatesText: {
    fontSize: 12,
    fontWeight: '500',
    paddingLeft: 26,
  },
  favActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    backgroundColor: '#0a7ea4',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bioText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  editProfileText: {
    color: '#0a7ea4',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  editFormContainer: {
    width: '100%',
    marginTop: 12,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

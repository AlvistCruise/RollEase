import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { user, isGuest, login, signup, logout, history, favorites, setIsGuest } = useApp();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setErrorMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = isSignUp 
        ? await signup(username, password) 
        : await login(username, password);

      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      } else {
        setUsername('');
        setPassword('');
      }
    } catch {
      setErrorMsg('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const renderAuthForm = () => {
    const isDark = colorScheme === 'dark';
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setShowAuthForm(false);
              setErrorMsg('');
            }}
          >
            <IconSymbol size={18} name="chevron.right" color="#0a7ea4" style={{ transform: [{ rotate: '180deg' }], marginRight: 4 }} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={[styles.logoBg, { backgroundColor: '#0a7ea4' }]}>
              <IconSymbol size={48} name="figure.roll" color="#fff" />
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>RollEase</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#A0A3A6' : '#687076' }]}>
              Accessible Wheelchair Navigation
            </Text>
          </View>

          <Text style={[styles.formTitle, { color: themeColors.text }]}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: themeColors.text,
                  borderColor: isDark ? '#3D4144' : '#E1E3E5',
                  backgroundColor: isDark ? '#151718' : '#F9FAFB',
                },
              ]}
              placeholder="Enter your username"
              placeholderTextColor={isDark ? '#687076' : '#9BA1A6'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    color: themeColors.text,
                    borderColor: isDark ? '#3D4144' : '#E1E3E5',
                    backgroundColor: isDark ? '#151718' : '#F9FAFB',
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? '#687076' : '#9BA1A6'}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={isDark ? '#9BA1A6' : '#687076'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#0a7ea4' }]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleModeButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
          >
            <Text style={[styles.toggleModeText, { color: '#0a7ea4' }]}>
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, { borderColor: '#0a7ea4' }]}
            onPress={() => setIsGuest(true)}
          >
            <Text style={[styles.guestButtonText, { color: '#0a7ea4' }]}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderLanding = () => {
    const isDark = colorScheme === 'dark';
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoBg, { backgroundColor: '#0a7ea4' }]}>
              <IconSymbol size={48} name="figure.roll" color="#fff" />
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>RollEase</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#A0A3A6' : '#687076', textAlign: 'center' }]}>
              Accessible Wheelchair Navigation Assistant
            </Text>
          </View>

          <View style={styles.featuresList}>
            <View style={[styles.featureItem, { borderBottomColor: isDark ? '#2D3032' : '#F3F4F6' }]}>
              <IconSymbol size={24} name="paperplane.fill" color="#0a7ea4" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: themeColors.text }]}>Accessible Routing</Text>
                <Text style={[styles.featureDesc, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                  Calculates pedestrian and sidewalk-friendly paths, keeping you off dangerous highways.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol size={24} name="house.fill" color="#EAB308" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: themeColors.text }]}>Saved History & Favorites</Text>
                <Text style={[styles.featureDesc, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                  Save places like home or work, and quickly reload recent routes from your history.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#0a7ea4', marginTop: 24 }]}
            onPress={() => {
              setIsSignUp(false);
              setShowAuthForm(true);
            }}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, { borderColor: '#0a7ea4', marginTop: 12 }]}
            onPress={() => {
              setIsSignUp(true);
              setShowAuthForm(true);
            }}
          >
            <Text style={[styles.guestButtonText, { color: '#0a7ea4' }]}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleModeButton}
            onPress={() => setIsGuest(true)}
          >
            <Text style={[styles.toggleModeText, { color: '#687076', textDecorationLine: 'underline' }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderProfile = () => {
    const isDark = colorScheme === 'dark';
    const activeUser = user || { username: 'Guest User' };
    const totalDistance = history.reduce((sum, item) => sum + item.distance, 0);
    const distanceKm = (totalDistance / 1000).toFixed(1);

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
          <View style={[styles.avatar, { backgroundColor: '#0a7ea4' }]}>
            <Text style={styles.avatarText}>{getInitials(activeUser.username)}</Text>
          </View>
          <Text style={[styles.profileUsername, { color: themeColors.text }]}>{activeUser.username}</Text>
          <Text style={[styles.profileRole, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            {user ? 'Registered Account' : 'Guest Account Mode'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
            <IconSymbol size={28} name="clock.fill" color="#0a7ea4" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{history.length}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Routes Taken</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
            <IconSymbol size={28} name="star.fill" color="#EAB308" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Saved Places</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#1F2224' : '#fff' }]}>
            <IconSymbol size={28} name="location.fill" color="#10B981" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{distanceKm} km</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Total Dist.</Text>
          </View>
        </View>

        {/* Account Details & Actions */}
        <View style={[styles.profileHeaderCard, { backgroundColor: isDark ? '#1F2224' : '#fff', marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Settings</Text>
          
          <View style={[styles.detailRow, { borderBottomColor: isDark ? '#3D4144' : '#F3F4F6' }]}>
            <Text style={[styles.detailLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Account Type</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {user ? 'Authenticated Profile' : 'Guest (Offline)'}
            </Text>
          </View>

          {user && (
            <View style={[styles.detailRow, { borderBottomColor: isDark ? '#3D4144' : '#F3F4F6' }]}>
              <Text style={[styles.detailLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Username</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{activeUser.username}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: '#EF4444' }]}
            onPress={() => {
              if (user) {
                logout();
              } else {
                // Return to login screen
                setIsGuest(false);
                setShowAuthForm(true);
              }
            }}
          >
            <Text style={[styles.logoutButtonText, { color: '#EF4444' }]}>
              {user ? 'Log Out' : 'Sign In / Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const isDark = colorScheme === 'dark';

    // Kita buat pengaturan warna gradien yang pasti:
    // Jika isDark: Biru tua transparan memudar ke warna latar dark mode (#151718)
    // Jika light: Biru muda transparan memudar ke warna latar light mode (#F3F4F6)
    const gradientColors = isDark
      ? ['#0a7ea430', '#151718']
      : ['#0a7ea415', '#F3F4F6'];

    return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          // Berikan warna dasar yang sesuai agar saat di-scroll mentok (bounce) tidak terlihat putih
          style={[styles.container, { backgroundColor: isDark ? '#151718' : '#F3F4F6' }]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          >
            {user || isGuest ? (
              renderProfile()
            ) : showAuthForm ? (
              renderAuthForm()
            ) : (
              renderLanding()
            )}
          </LinearGradient>
        </KeyboardAvoidingView>
      );
    }

const styles = StyleSheet.create({
  container: {
      flex: 1,
      // Hapus background color solid di sini jika kamu menggunakan style.container di KeyboardAvoidingView
    },
    // --- TAMBAHKAN STYLE BARU INI ---
    gradient: {
      flex: 1, // Pastikan gradien memenuhi seluruh area container
    },
    // ... rest of existing styles
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleModeButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  toggleModeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Profile Logged In
  profileHeaderCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileUsername: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  guestButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#0a7ea4',
    fontSize: 15,
    fontWeight: '700',
  },
  featuresList: {
    width: '100%',
    marginVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

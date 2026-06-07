import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Place {
  name: string;
  lat: number;
  lng: number;
}

export interface HistoryItem {
  id: string;
  start: Place;
  destination: Place;
  distance: number; // meters
  duration: number; // seconds
  timestamp: number; // milliseconds
}

export interface FavoriteItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface AppContextType {
  user: { username: string } | null;
  isGuest: boolean;
  history: HistoryItem[];
  favorites: FavoriteItem[];
  activeRoute: { start: Place; destination: Place } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setIsGuest: (val: boolean) => void;
  addHistoryEntry: (start: Place, destination: Place, distance: number, duration: number) => Promise<void>;
  toggleFavorite: (place: Place) => Promise<void>;
  isFavorite: (lat: number, lng: number) => boolean;
  setActiveRoute: (route: { start: Place; destination: Place } | null) => void;
  clearHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeRoute, setActiveRouteState] = useState<{ start: Place; destination: Place } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load active session on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Reload history and favorites when user changes
  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('rollease_current_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    const keyPrefix = user ? user.username : 'guest';
    try {
      const storedHistory = await AsyncStorage.getItem(`rollease_history_${keyPrefix}`);
      const storedFavorites = await AsyncStorage.getItem(`rollease_favorites_${keyPrefix}`);

      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  };

  const login = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Username and password cannot be empty' };
    }
    
    try {
      const usersStr = await AsyncStorage.getItem('rollease_users');
      const users = usersStr ? JSON.parse(usersStr) : {};

      const cleanUsername = username.trim().toLowerCase();
      if (!users[cleanUsername]) {
        return { success: false, error: 'User does not exist. Please sign up.' };
      }

      if (users[cleanUsername].password !== password) {
        return { success: false, error: 'Incorrect password.' };
      }

      const loggedInUser = { username: users[cleanUsername].username };
      await AsyncStorage.setItem('rollease_current_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsGuest(false);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Username and password cannot be empty' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    try {
      const usersStr = await AsyncStorage.getItem('rollease_users');
      const users = usersStr ? JSON.parse(usersStr) : {};

      const cleanUsername = username.trim().toLowerCase();
      if (users[cleanUsername]) {
        return { success: false, error: 'Username is already taken' };
      }

      // Save user
      users[cleanUsername] = { username: username.trim(), password };
      await AsyncStorage.setItem('rollease_users', JSON.stringify(users));

      // Log in automatically
      const loggedInUser = { username: username.trim() };
      await AsyncStorage.setItem('rollease_current_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsGuest(false);

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('rollease_current_user');
      setUser(null);
      setIsGuest(false);
      setActiveRouteState(null); // Clear active route on logout
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const addHistoryEntry = async (start: Place, destination: Place, distance: number, duration: number) => {
    const keyPrefix = user ? user.username : 'guest';
    const newEntry: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      start,
      destination,
      distance,
      duration,
      timestamp: Date.now(),
    };

    try {
      const updated = [newEntry, ...history].slice(0, 50); // Keep last 50 history entries
      setHistory(updated);
      await AsyncStorage.setItem(`rollease_history_${keyPrefix}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history entry', e);
    }
  };

  const toggleFavorite = async (place: Place) => {
    const keyPrefix = user ? user.username : 'guest';
    const isFav = isFavorite(place.lat, place.lng);

    let updated: FavoriteItem[];
    if (isFav) {
      updated = favorites.filter((f) => Math.abs(f.lat - place.lat) > 0.00001 || Math.abs(f.lng - place.lng) > 0.00001);
    } else {
      const newFav: FavoriteItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        timestamp: Date.now(),
      };
      updated = [newFav, ...favorites];
    }

    try {
      setFavorites(updated);
      await AsyncStorage.setItem(`rollease_favorites_${keyPrefix}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  const isFavorite = (lat: number, lng: number) => {
    return favorites.some((f) => Math.abs(f.lat - lat) < 0.00001 && Math.abs(f.lng - lng) < 0.00001);
  };

  const setActiveRoute = (route: { start: Place; destination: Place } | null) => {
    setActiveRouteState(route);
  };

  const clearHistory = async () => {
    const keyPrefix = user ? user.username : 'guest';
    try {
      setHistory([]);
      await AsyncStorage.removeItem(`rollease_history_${keyPrefix}`);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isGuest,
        history,
        favorites,
        activeRoute,
        loading,
        login,
        signup,
        logout,
        setIsGuest,
        addHistoryEntry,
        toggleFavorite,
        isFavorite,
        setActiveRoute,
        clearHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

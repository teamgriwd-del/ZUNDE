import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './config';

import LoginScreen        from './screens/LoginScreen';
import DashboardScreen    from './screens/DashboardScreen';
import HerdScreen         from './screens/HerdScreen';
import MarketplaceScreen  from './screens/MarketplaceScreen';
import FeedAnalyzerScreen from './screens/FeedAnalyzerScreen';
import VetMessengerScreen from './screens/VetMessengerScreen';
import ProfileScreen      from './screens/ProfileScreen';
import IoTScreen          from './screens/IoTScreen';
import JindaRaMamboFAB    from './components/JindaRaMamboFAB';

const Tab = createBottomTabNavigator();

const ROLE_TABS = {
  Farmer: [
    { name: 'Dashboard', emoji: '🏠', label: 'Home',    screen: DashboardScreen },
    { name: 'Herd',      emoji: '🐄', label: 'Herd',    screen: HerdScreen },
    { name: 'Market',    emoji: '🛒', label: 'Market',  screen: MarketplaceScreen },
    { name: 'Feed',      emoji: '🌾', label: 'Feed',    screen: FeedAnalyzerScreen },
    { name: 'IoT',       emoji: '📡', label: 'IoT',     screen: IoTScreen },
    { name: 'Profile',   emoji: '👤', label: 'More',    screen: ProfileScreen },
  ],
  Veterinarian: [
    { name: 'Dashboard', emoji: '📋', label: 'Home',    screen: DashboardScreen },
    { name: 'Herd',      emoji: '🐄', label: 'Animals', screen: HerdScreen },
    { name: 'IoT',       emoji: '📡', label: 'IoT',     screen: IoTScreen },
    { name: 'Market',    emoji: '🛒', label: 'Market',  screen: MarketplaceScreen },
    { name: 'Vet',       emoji: '💬', label: 'Cases',   screen: VetMessengerScreen },
    { name: 'Profile',   emoji: '👤', label: 'More',    screen: ProfileScreen },
  ],
  Supplier: [
    { name: 'Dashboard', emoji: '📦', label: 'Home',    screen: DashboardScreen },
    { name: 'Market',    emoji: '🛒', label: 'Market',  screen: MarketplaceScreen },
    { name: 'Feed',      emoji: '🌾', label: 'Feed',    screen: FeedAnalyzerScreen },
    { name: 'Vet',       emoji: '💬', label: 'Comms',   screen: VetMessengerScreen },
    { name: 'Profile',   emoji: '👤', label: 'More',    screen: ProfileScreen },
  ],
  Retailer: [
    { name: 'Dashboard', emoji: '🏪', label: 'Home',    screen: DashboardScreen },
    { name: 'Market',    emoji: '🛒', label: 'Market',  screen: MarketplaceScreen },
    { name: 'Feed',      emoji: '🌾', label: 'Feed',    screen: FeedAnalyzerScreen },
    { name: 'Vet',       emoji: '💬', label: 'Contact', screen: VetMessengerScreen },
    { name: 'Profile',   emoji: '👤', label: 'Profile', screen: ProfileScreen },
  ],
};

const ROLE_COLORS = {
  Farmer: COLORS.primary, Veterinarian: '#1565c0',
  Supplier: '#e65100',    Retailer: '#6a1b9a',
};

// ── Tab icon: pill highlight on active, clean spacing ──────────────────────
const TabIcon = ({ emoji, label, focused, roleColor }) => (
  <View style={styles.tabIconWrap}>
    <View style={[styles.tabPill, focused && { backgroundColor: roleColor + '1a' }]}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
    </View>
    <Text style={[styles.tabLabel, { color: focused ? roleColor : '#aaa' }]}>{label}</Text>
    {focused && <View style={[styles.tabDot, { backgroundColor: roleColor }]} />}
  </View>
);

function RoleTabNavigator({ currentUser, onLogout }) {
  const role  = currentUser?.role || 'Farmer';
  const tabs  = ROLE_TABS[role] || ROLE_TABS.Farmer;
  const color = ROLE_COLORS[role] || COLORS.primary;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          borderTopColor: color + '25',
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {tabs.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji={t.emoji} label={t.label} focused={focused} roleColor={color} />
            ),
          }}
        >
          {props => <t.screen {...props} currentUser={currentUser} onLogout={onLogout} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={setCurrentUser} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Wrap in a relative View so the FAB can be absolutely positioned above the tab bar */}
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <RoleTabNavigator
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
          />
        </NavigationContainer>
        <JindaRaMamboFAB currentUser={currentUser} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    height: 76,
    paddingBottom: 0,
    paddingTop: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  // Each tab column
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    width: 64,
  },

  // Pill behind the emoji when focused
  tabPill: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  tabEmoji:       { fontSize: 20 },
  tabEmojiActive: { fontSize: 22 },

  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
    marginBottom: 2,
  },

  // Tiny active dot below the label
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
});

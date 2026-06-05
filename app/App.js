import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from './config';

import HomeScreen       from './screens/HomeScreen';
import HerdScreen       from './screens/HerdScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import FeedAnalyzerScreen from './screens/FeedAnalyzerScreen';
import ProfileScreen    from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, label, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : '#999' }]}>{label}</Text>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home"    focused={focused} /> }}
        />
        <Tab.Screen
          name="Herd"
          component={HerdScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🐄" label="Herd"    focused={focused} /> }}
        />
        <Tab.Screen
          name="Market"
          component={MarketplaceScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" label="Market"  focused={focused} /> }}
        />
        <Tab.Screen
          name="Feed"
          component={FeedAnalyzerScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌾" label="Feed"    focused={focused} /> }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8f5e9',
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabIcon: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tabIconActive: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
  },
  tabEmoji:  { fontSize: 20 },
  tabLabel:  { fontSize: 10, fontWeight: '700', marginTop: 2 },
});

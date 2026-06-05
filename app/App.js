import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import DashboardScreen from './screens/DashboardScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import FeedAnalyzerScreen from './screens/FeedAnalyzerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2e7d32',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#fff', paddingBottom: 5 },
          headerStyle: { backgroundColor: '#2e7d32' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarIcon: () => <Text>📊</Text>, title: 'Zunde - Dashboard' }}
        />
        <Tab.Screen
          name="Marketplace"
          component={MarketplaceScreen}
          options={{ tabBarIcon: () => <Text>🛒</Text>, title: 'Marketplace' }}
        />
        <Tab.Screen
          name="Feed Analyzer"
          component={FeedAnalyzerScreen}
          options={{ tabBarIcon: () => <Text>🌾</Text>, title: 'Feed Analyzer' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
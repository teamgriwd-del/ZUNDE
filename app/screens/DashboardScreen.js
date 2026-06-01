import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'http://localhost:5000'; // Android emulator → your PC
// const API = 'http://localhost:5000'; // Web

export default function DashboardScreen() {
  const [stats, setStats] = useState({ listings: 0, messages: 0 });
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/feed`)
      .then(res => { setFeeds(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to Zunde 🌱</Text>
        <Text style={styles.subText}>Smart Livestock & Market Platform</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Feed Types</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>My Listings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionLabel}>Browse Market</Text>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>🌾</Text>
          <Text style={styles.actionLabel}>Analyze Feed</Text>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Post Listing</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Available Feeds</Text>
      {loading ? <ActivityIndicator color="#2e7d32" /> :
        feeds.slice(0, 3).map(feed => (
          <View key={feed.id} style={styles.feedCard}>
            <Text style={styles.feedName}>{feed.name}</Text>
            <Text style={styles.feedDetail}>Protein: {feed.protein_percent}% | Energy: {feed.energy_mj} MJ</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2e7d32', padding: 20, paddingTop: 10 },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subText: { color: '#c8e6c9', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', margin: 16 },
  statCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, alignItems: 'center', flex: 1, marginHorizontal: 4, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 16, marginTop: 8, marginBottom: 8, color: '#333' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 16 },
  actionCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, alignItems: 'center', flex: 1, marginHorizontal: 4, elevation: 2 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 11, color: '#666', marginTop: 6, textAlign: 'center' },
  feedCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14, elevation: 2 },
  feedName: { fontSize: 15, fontWeight: 'bold', color: '#2e7d32' },
  feedDetail: { fontSize: 12, color: '#666', marginTop: 4 },
});
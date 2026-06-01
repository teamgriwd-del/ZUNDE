import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, ActivityIndicator, TouchableOpacity
} from 'react-native';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function FeedAnalyzerScreen() {
  const [feeds, setFeeds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}/feed`)
      .then(res => { setFeeds(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = feeds.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryBadgeColor = (cat) => {
    if (cat === 'protein') return '#1565c0';
    if (cat === 'energy') return '#e65100';
    return '#4e342e';
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search feed (e.g. Maize, Soya)..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? <ActivityIndicator color="#2e7d32" size="large" /> : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelected(selected?.id === item.id ? null : item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.feedName}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: getCategoryBadgeColor(item.category) }]}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
              </View>

              {selected?.id === item.id && (
                <View style={styles.details}>
                  <Text style={styles.detailTitle}>Nutritional Breakdown</Text>
                  <View style={styles.nutriRow}>
                    <Text style={styles.nutriLabel}>🥩 Protein</Text>
                    <Text style={styles.nutriValue}>{item.protein_percent}%</Text>
                  </View>
                  <View style={styles.nutriRow}>
                    <Text style={styles.nutriLabel}>⚡ Energy</Text>
                    <Text style={styles.nutriValue}>{item.energy_mj} MJ/kg</Text>
                  </View>
                  <View style={styles.nutriRow}>
                    <Text style={styles.nutriLabel}>🌿 Fibre</Text>
                    <Text style={styles.nutriValue}>{item.fibre_percent}%</Text>
                  </View>
                  <View style={styles.nutriRow}>
                    <Text style={styles.nutriLabel}>🦴 Calcium</Text>
                    <Text style={styles.nutriValue}>{item.calcium_percent}%</Text>
                  </View>
                  <View style={styles.nutriRow}>
                    <Text style={styles.nutriLabel}>💊 Phosphorus</Text>
                    <Text style={styles.nutriValue}>{item.phosphorus_percent}%</Text>
                  </View>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              )}
              <Text style={styles.tapHint}>
                {selected?.id === item.id ? '▲ Tap to collapse' : '▼ Tap to see nutrition'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12, elevation: 2, fontSize: 14 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedName: { fontSize: 15, fontWeight: 'bold', color: '#1b5e20', flex: 1 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  details: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 10 },
  detailTitle: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  nutriRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nutriLabel: { fontSize: 13, color: '#555' },
  nutriValue: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  description: { fontSize: 12, color: '#888', marginTop: 8, fontStyle: 'italic' },
  tapHint: { fontSize: 11, color: '#aaa', marginTop: 8, textAlign: 'right' },
});
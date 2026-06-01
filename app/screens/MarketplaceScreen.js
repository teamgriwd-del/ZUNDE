import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, TextInput
} from 'react-native';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function MarketplaceScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = () => {
    axios.get(`${API}/listings`)
      .then(res => { setListings(res.data); setLoading(false); })
      .catch(() => {
        // Demo data when API not connected
        setListings([
          { id: 1, product_name: 'Soya Bean Meal', category: 'feed', price: 450, unit: 'kg', quantity: 500, location: 'Harare', seller_name: 'John Moyo', description: 'High quality soya meal' },
          { id: 2, product_name: 'Maize Grain', category: 'feed', price: 320, unit: 'kg', quantity: 1000, location: 'Bulawayo', seller_name: 'Grace Ndlovu', description: 'Fresh maize grain' },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => { fetchListings(); }, []);

  const filtered = listings.filter(l =>
    l.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (cat) => {
    if (cat === 'feed') return '#e8f5e9';
    if (cat === 'produce') return '#fff3e0';
    return '#e3f2fd';
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2e7d32" />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>➕ Post New Listing</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: getCategoryColor(item.category) }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.price}>USD {item.price}/{item.unit}</Text>
            </View>
            <Text style={styles.detail}>📦 Qty: {item.quantity} {item.unit}</Text>
            <Text style={styles.detail}>📍 {item.location}</Text>
            <Text style={styles.detail}>👤 {item.seller_name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>Contact Seller</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No listings found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12, elevation: 2, fontSize: 14 },
  addButton: { backgroundColor: '#2e7d32', marginHorizontal: 12, marginBottom: 10, borderRadius: 10, padding: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  card: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#2e7d32' },
  detail: { fontSize: 13, color: '#555', marginBottom: 3 },
  description: { fontSize: 12, color: '#777', marginTop: 6, fontStyle: 'italic' },
  contactBtn: { backgroundColor: '#2e7d32', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
  contactBtnText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});
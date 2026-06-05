import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config';

const VET_CONTACTS = [
  { id: 'v1', name: 'Dr. T. Moyo',       role: 'DVS Duty Officer',      province: 'Mashonaland West', avatar: 'TM', color: COLORS.primary, online: true,  speciality: 'Tick-borne Diseases'    },
  { id: 'v2', name: 'Dr. R. Chikwanda',  role: 'Regional Vet Officer',  province: 'Harare',           avatar: 'RC', color: '#1565c0',       online: true,  speciality: 'Reproductive Health'    },
  { id: 'v3', name: 'Dr. S. Ndlovu',     role: 'Emergency Response',    province: 'Bulawayo',         avatar: 'SN', color: '#6a1b9a',       online: false, speciality: 'FMD & CBPP'            },
  { id: 'v4', name: 'DVS Emergency Line',role: 'Ministry of Agriculture',province: 'National',         avatar: '🚨', color: '#c62828',       online: true,  speciality: 'All Emergencies'       },
];

const AUTO_RESPONSES = {
  Emergency: [
    'HIGH PRIORITY: Your case has been flagged. A duty officer is being notified. Please isolate the animal immediately.',
    'Case registered. Expected response within 15 minutes. Do not move the animal or remove any discharge material.',
  ],
  Vaccination: [
    'Vaccination request received. Please confirm the animal\'s current weight and last vaccination date.',
    'Your vaccination schedule has been reviewed. A certificate will be issued within 24 hours.',
  ],
  'Trade Certification': [
    'Trade certification request received. A health inspection must be conducted before certificate issuance.',
    'Your export health certificate is being processed. Estimated: 2-3 working days.',
  ],
  General: [
    'Message received. A vet officer will respond shortly.',
    'Thank you for contacting ZUNDE Vet Services. We aim to respond within 1 hour.',
  ],
};

const CATEGORIES = ['Emergency', 'Vaccination', 'Trade Certification', 'General'];
const CAT_COLORS  = { Emergency: '#c62828', Vaccination: COLORS.primary, 'Trade Certification': '#1565c0', General: '#555' };

const now = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function VetMessengerScreen({ currentUser }) {
  const [selectedVet, setSelectedVet] = useState(null);
  const [messages, setMessages]       = useState([
    { id: 1, text: 'Hello! How can I assist you today?', from: 'vet', time: '09:00' },
  ]);
  const [input, setInput]             = useState('');
  const [category, setCategory]       = useState('General');
  const scrollRef = useRef(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), text, from: 'user', time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const replies = AUTO_RESPONSES[category] || AUTO_RESPONSES.General;
    const reply   = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, from: 'vet', time: now() }]);
    }, 1200);
  };

  // Contact list view
  if (!selectedVet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerSub}>ZUNDE RaMambo</Text>
          <Text style={s.headerTitle}>Vet Messenger</Text>
          <Text style={s.headerDesc}>Connect with licensed Zimbabwe DVS officers</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

          {/* Emergency hotline banner */}
          <View style={s.emergencyBanner}>
            <Text style={{ fontSize: 22 }}>🚨</Text>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={s.emergencyTitle}>DVS Emergency Hotline</Text>
              <Text style={s.emergencyDesc}>Available 24/7 for disease outbreaks and animal health emergencies in Zimbabwe</Text>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL('tel:+263242706331')} activeOpacity={0.8}>
              <Text style={s.callBtnText}>Call Now</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionLabel}>AVAILABLE VET OFFICERS</Text>

          {VET_CONTACTS.map(vet => (
            <TouchableOpacity
              key={vet.id}
              style={s.vetCard}
              onPress={() => setSelectedVet(vet)}
              activeOpacity={0.8}
            >
              <View style={[s.avatar, { backgroundColor: vet.color }]}>
                <Text style={s.avatarText}>{vet.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Text style={s.vetName}>{vet.name}</Text>
                  <View style={[s.onlineDot, { backgroundColor: vet.online ? '#4caf50' : '#aaa' }]} />
                </View>
                <Text style={s.vetRole}>{vet.role}</Text>
                <Text style={s.vetProvince}>📍 {vet.province} · {vet.speciality}</Text>
              </View>
              <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Info panel */}
          <View style={s.infoPanel}>
            <Text style={s.infoTitle}>🛡  How Vet Messenger Works</Text>
            {[
              '📋  Select a vet officer from the list above',
              '💬  Send a message describing your animal\'s condition',
              '📄  Receive an official response and certificate if needed',
              '✅  DVS-certified documents are valid for all livestock trade',
            ].map((line, i) => (
              <Text key={i} style={s.infoLine}>{line}</Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Chat view
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <StatusBar barStyle="light-content" backgroundColor={selectedVet.color} />

      {/* Chat header */}
      <View style={[s.chatHeader, { backgroundColor: selectedVet.color }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => setSelectedVet(null)} activeOpacity={0.8}>
          <Text style={s.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={[s.avatarSm, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={[s.avatarText, { fontSize: 14 }]}>{selectedVet.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.chatName}>{selectedVet.name}</Text>
          <Text style={s.chatStatus}>{selectedVet.online ? '🟢 Online now' : '⚪ Away'} · {selectedVet.speciality}</Text>
        </View>
      </View>

      {/* Category picker */}
      <View style={s.catRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[s.catChip, category === c && { backgroundColor: CAT_COLORS[c], borderColor: CAT_COLORS[c] }]}
              onPress={() => setCategory(c)}
              activeOpacity={0.8}
            >
              <Text style={[s.catChipText, category === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(msg => (
          <View key={msg.id} style={[s.msgRow, msg.from === 'user' && s.msgRowUser]}>
            {msg.from === 'vet' && (
              <View style={[s.msgAvatar, { backgroundColor: selectedVet.color }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{selectedVet.avatar}</Text>
              </View>
            )}
            <View style={[s.bubble, msg.from === 'user' ? s.bubbleUser : s.bubbleVet]}>
              <Text style={[s.bubbleText, msg.from === 'user' && { color: '#fff' }]}>{msg.text}</Text>
              <Text style={[s.bubbleTime, msg.from === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{msg.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            placeholder={`Message ${selectedVet.name}…`}
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: selectedVet.color, opacity: input.trim() ? 1 : 0.4 }]}
            onPress={sendMessage}
            activeOpacity={0.8}
          >
            <Text style={s.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:          { backgroundColor: COLORS.primary, padding: 24, paddingTop: 56 },
  headerSub:       { color: '#a5d6a7', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle:     { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 2 },
  headerDesc:      { color: '#a5d6a7', fontSize: 12, fontWeight: '600', marginTop: 2 },

  sectionLabel:    { fontSize: 9, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },

  emergencyBanner: { backgroundColor: '#fff5f5', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#fca5a5', marginBottom: 8 },
  emergencyTitle:  { fontSize: 13, fontWeight: '900', color: '#991b1b', marginBottom: 4 },
  emergencyDesc:   { fontSize: 11, color: '#b91c1c', lineHeight: 16 },
  callBtn:         { backgroundColor: '#c62828', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  callBtnText:     { color: '#fff', fontSize: 12, fontWeight: '800' },

  vetCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  avatar:          { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText:      { color: '#fff', fontSize: 16, fontWeight: '900' },
  vetName:         { fontSize: 14, fontWeight: '900', color: '#111827' },
  onlineDot:       { width: 8, height: 8, borderRadius: 4 },
  vetRole:         { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  vetProvince:     { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  infoPanel:       { backgroundColor: '#e8f5e9', borderRadius: 16, padding: 16, marginTop: 16 },
  infoTitle:       { fontSize: 13, fontWeight: '900', color: COLORS.primary, marginBottom: 12 },
  infoLine:        { fontSize: 12, color: '#2e7d32', marginBottom: 8, lineHeight: 18, fontWeight: '500' },

  chatHeader:      { flexDirection: 'row', alignItems: 'center', padding: 14, paddingTop: 6 },
  backBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backBtnText:     { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  avatarSm:        { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  chatName:        { color: '#fff', fontSize: 15, fontWeight: '900' },
  chatStatus:      { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },

  catRow:          { backgroundColor: '#fff', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  catChip:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  catChipText:     { fontSize: 12, fontWeight: '700', color: '#6b7280' },

  msgRow:          { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowUser:      { flexDirection: 'row-reverse' },
  msgAvatar:       { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bubble:          { maxWidth: '75%', borderRadius: 16, padding: 12 },
  bubbleVet:       { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  bubbleUser:      { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText:      { fontSize: 14, color: '#111827', lineHeight: 20 },
  bubbleTime:      { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' },

  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', gap: 10 },
  textInput:       { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 100 },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendBtnText:     { color: '#fff', fontSize: 18 },
});

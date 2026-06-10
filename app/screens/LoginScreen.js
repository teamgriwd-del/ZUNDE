import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sprout, Stethoscope, Pill, Store, User, Phone, Mail,
  Building2, MapPin, Check, CheckCircle, ArrowRight, ArrowLeft,
} from 'lucide-react-native';
import { COLORS } from '../config';

const ROLES = [
  { name: 'Farmer',       icon: Sprout,      color: COLORS.primary, desc: 'Register animals, track health, list for sale' },
  { name: 'Veterinarian', icon: Stethoscope, color: '#1565c0',      desc: 'Certify animals, manage outbreaks, consult farmers' },
  { name: 'Supplier',     icon: Pill,        color: '#e65100',      desc: 'Supply medicines and feed to farmers' },
  { name: 'Retailer',     icon: Store,       color: '#6a1b9a',      desc: 'Browse verified livestock and place bids' },
];

const PROVINCES = [
  'Mashonaland West','Mashonaland Central','Mashonaland East',
  'Matabeleland North','Matabeleland South','Midlands',
  'Manicaland','Masvingo','Harare','Bulawayo',
];

const STEPS = ['Role','Personal','Organisation','Details','Confirm'];
const inp = { backgroundColor: '#f4f6f5', borderRadius: 14, padding: 14, fontSize: 14, color: '#1a1a1a', marginBottom: 12 };

const InputField = ({ icon: Icon, ...props }) => (
  <View style={styles.inputWrap}>
    <Icon size={16} color="#aaa" style={styles.inputIcon} />
    <TextInput style={[inp, styles.inputWithIcon]} placeholderTextColor="#aaa" {...props} />
  </View>
);

export default function LoginScreen({ onLogin }) {
  const [mode,      setMode]      = useState('login');
  const [step,      setStep]      = useState(0);
  const [loginName, setLoginName] = useState('');
  const [loginRole, setLoginRole] = useState('Farmer');
  const [form, setForm] = useState({
    role: 'Farmer', fullName: '', phone: '', email: '',
    orgName: '', province: 'Mashonaland West', district: '',
    farmSize: '', species: [], licenseNumber: '', speciality: '',
    businessReg: '', supplyCategories: [], tradingAreas: '',
  });

  const set       = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleArr = (k, v) => setForm(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));
  const role      = ROLES.find(r => r.name === form.role) || ROLES[0];
  const canNext   = () => { if (step===1) return form.fullName.trim()&&form.phone.trim(); if (step===2) return form.orgName.trim(); return true; };

  const handleLogin   = () => { if (!loginName.trim()) return; onLogin({ name: loginName, role: loginRole, org:'', province:'Mashonaland West', avatar: loginName }); };
  const handleConfirm = () => { onLogin({ name: form.fullName, role: form.role, org: form.orgName, province: form.province, phone: form.phone, email: form.email, district: form.district, farmSize: form.farmSize, species: form.species, licenseNumber: form.licenseNumber, avatar: form.fullName }); };

  const ProgressBar = () => (
    <View style={styles.progress}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[styles.progDot, i <= step && { backgroundColor: COLORS.primary }]}>
            {i < step
              ? <Check size={14} color="#fff" strokeWidth={3} />
              : <Text style={[styles.progDotText, i <= step && { color:'#fff' }]}>{i + 1}</Text>}
          </View>
          {i < STEPS.length - 1 && <View style={[styles.progLine, i < step && { backgroundColor: COLORS.primary }]} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View>
      <Text style={styles.stepTitle}>Choose Your Role</Text>
      <Text style={styles.stepSub}>Your role determines what you can see and do on ZUNDE.</Text>
      <View style={styles.roleGrid}>
        {ROLES.map(r => (
          <TouchableOpacity key={r.name} activeOpacity={0.8}
            style={[styles.roleCard, form.role===r.name && { borderColor:r.color, backgroundColor:r.color+'0d' }]}
            onPress={() => set('role', r.name)}>
            <View style={[styles.roleIconBox, { backgroundColor: r.color+'1a' }]}>
              <r.icon size={22} color={r.color} />
            </View>
            <Text style={[styles.roleName, form.role===r.name && { color:r.color }]}>{r.name}</Text>
            <Text style={styles.roleDesc}>{r.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSub}>How other stakeholders will identify and contact you.</Text>
      <Text style={styles.label}>Full Name *</Text>
      <InputField icon={User}  placeholder="e.g. Tatenda Moyo"  value={form.fullName} onChangeText={v=>set('fullName',v)} />
      <Text style={styles.label}>Phone Number *</Text>
      <InputField icon={Phone} placeholder="+263 77 123 4567"   value={form.phone}    onChangeText={v=>set('phone',v)}    keyboardType="phone-pad" />
      <Text style={styles.label}>Email Address</Text>
      <InputField icon={Mail}  placeholder="you@example.com"    value={form.email}    onChangeText={v=>set('email',v)}    keyboardType="email-address" />
      <View style={styles.infoBox}><Text style={styles.infoText}>Your phone number lets farmers, vets, and suppliers find and contact you directly in the ZUNDE directory.</Text></View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Your Organisation</Text>
      <Text style={styles.stepSub}>{form.role==='Farmer' ? 'Your farm name and location.' : 'Your business or practice details.'}</Text>
      <Text style={styles.label}>{form.role==='Farmer' ? 'Farm Name *' : 'Organisation Name *'}</Text>
      <InputField icon={Building2} placeholder={form.role==='Farmer' ? 'e.g. Moyo Family Farm' : 'e.g. AgroChem Zimbabwe'} value={form.orgName} onChangeText={v=>set('orgName',v)} />
      <Text style={styles.label}>Province</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
        {PROVINCES.map(p => (
          <TouchableOpacity key={p} activeOpacity={0.8} onPress={() => set('province',p)}
            style={[styles.chip, form.province===p && { backgroundColor:COLORS.primary, borderColor:COLORS.primary }]}>
            <Text style={[styles.chipText, form.province===p && { color:'#fff' }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.label}>Physical Address</Text>
      <InputField icon={MapPin} placeholder="e.g. Plot 23, Chegutu Road" value={form.district} onChangeText={v=>set('district',v)} />
    </View>
  );

  const renderStep3 = () => {
    if (form.role==='Farmer') return (
      <View>
        <Text style={styles.stepTitle}>Farm Details</Text>
        <Text style={styles.stepSub}>Helps vets and suppliers understand your operation.</Text>
        <Text style={styles.label}>Farm Size (hectares)</Text>
        <TextInput style={inp} placeholder="e.g. 50" value={form.farmSize} onChangeText={v=>set('farmSize',v)} keyboardType="numeric" placeholderTextColor="#aaa" />
        <Text style={styles.label}>Main Livestock Species</Text>
        <View style={styles.chipRow}>
          {['Cattle','Goat','Sheep','Pig','Poultry'].map(s => (
            <TouchableOpacity key={s} activeOpacity={0.8} onPress={() => toggleArr('species',s)}
              style={[styles.chip, form.species.includes(s) && { backgroundColor:COLORS.primary, borderColor:COLORS.primary }]}>
              <Text style={[styles.chipText, form.species.includes(s) && { color:'#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
    if (form.role==='Veterinarian') return (
      <View>
        <Text style={styles.stepTitle}>Professional Details</Text>
        <Text style={styles.stepSub}>Credentials verify your authority to issue certificates.</Text>
        <Text style={styles.label}>DVS License Number</Text>
        <TextInput style={inp} placeholder="DVS-ZIM-2024-0045" value={form.licenseNumber} onChangeText={v=>set('licenseNumber',v)} placeholderTextColor="#aaa" />
        <Text style={styles.label}>Speciality</Text>
        <View style={styles.chipRow}>
          {['General Practice','Tick-borne Diseases','Reproductive Health','FMD Specialist','Emergency Response'].map(s => (
            <TouchableOpacity key={s} activeOpacity={0.8} onPress={() => set('speciality',s)}
              style={[styles.chip, form.speciality===s && { backgroundColor:'#1565c0', borderColor:'#1565c0' }]}>
              <Text style={[styles.chipText, form.speciality===s && { color:'#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
    return (
      <View>
        <Text style={styles.stepTitle}>{form.role==='Supplier' ? 'Supply Details' : 'Trading Details'}</Text>
        <Text style={styles.stepSub}>Farmers verify your identity before any transaction.</Text>
        <Text style={styles.label}>Business Registration Number</Text>
        <TextInput style={inp} placeholder="BP 12345/2024" value={form.businessReg} onChangeText={v=>set('businessReg',v)} placeholderTextColor="#aaa" />
        <Text style={styles.label}>{form.role==='Supplier' ? 'Trading Areas' : 'Areas Served'}</Text>
        <TextInput style={inp} placeholder="e.g. Mashonaland West, Harare" value={form.tradingAreas} onChangeText={v=>set('tradingAreas',v)} placeholderTextColor="#aaa" />
      </View>
    );
  };

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Confirm Your Identity</Text>
      <Text style={styles.stepSub}>Review before creating your ZUNDE Digital ID.</Text>
      <View style={[styles.confirmCard, { borderLeftColor: role.color }]}>
        <View style={[styles.roleBadge, { backgroundColor: role.color }]}>
          <role.icon size={13} color="#fff" />
          <Text style={styles.roleBadgeText}>{form.role}</Text>
        </View>
        {[
          ['Full Name', form.fullName], ['Phone', form.phone], ['Email', form.email||'—'],
          ['Organisation', form.orgName], ['Province', form.province],
          form.farmSize      ? ['Farm Size', `${form.farmSize} ha`] : null,
          form.species?.length ? ['Species', form.species.join(', ')] : null,
          form.licenseNumber ? ['DVS License', form.licenseNumber] : null,
          form.businessReg   ? ['Business Reg', form.businessReg] : null,
        ].filter(Boolean).map(([label, val]) => (
          <View key={label} style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>{label}</Text>
            <Text style={styles.confirmVal} numberOfLines={1}>{val}</Text>
          </View>
        ))}
      </View>
      <View style={styles.infoBox}><Text style={styles.infoText}>Your profile will be visible in the ZUNDE stakeholder directory. Others can search for you by name, organisation, or province.</Text></View>
    </View>
  );

  const steps = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: COLORS.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios' ? 'padding' : undefined}>

        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.medium]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.header}>
          <View style={styles.headerGlow1} />
          <View style={styles.headerGlow2} />
          <View style={styles.headerTop}>
            <View style={styles.logoBox}><Text style={styles.logoText}>R</Text></View>
            <View style={{ flex:1 }}>
              <Text style={styles.appName}>ZUNDE RaMambo</Text>
              <Text style={styles.appTagline}>Zimbabwe's Livestock Intelligence Platform</Text>
            </View>
          </View>
          <View style={styles.ecosystemRow}>
            {ROLES.map(r => (
              <View key={r.name} style={styles.ecosystemItem}>
                <View style={styles.ecosystemIconBox}>
                  <r.icon size={15} color="#fff" />
                </View>
                <Text style={styles.ecosystemLabel}>{r.name}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* White card */}
        <View style={styles.card}>
          {mode === 'login' ? (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSub}>Select your role to access the portal</Text>
              <View style={styles.roleGrid}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r.name} activeOpacity={0.8}
                    style={[styles.roleCard, loginRole===r.name && { borderColor:r.color, backgroundColor:r.color+'0d' }]}
                    onPress={() => setLoginRole(r.name)}>
                    <View style={[styles.roleIconBox, { backgroundColor: r.color+'1a' }]}>
                      <r.icon size={22} color={r.color} />
                    </View>
                    <Text style={[styles.roleName, loginRole===r.name && { color:r.color }]}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Your Full Name</Text>
              <TextInput style={inp} placeholder="e.g. Tatenda Moyo" value={loginName} onChangeText={setLoginName} placeholderTextColor="#aaa" />
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: ROLES.find(r=>r.name===loginRole)?.color||COLORS.primary }]} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Enter Portal</Text>
                <ArrowRight size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('register'); setStep(0); }} style={styles.switchLink}>
                <Text style={styles.switchText}>New to ZUNDE? <Text style={{ color:COLORS.primary, fontWeight:'800' }}>Create Digital ID</Text></Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <ProgressBar />
              {steps[step]()}
              <View style={styles.navRow}>
                {step > 0 && (
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s=>s-1)} activeOpacity={0.8}>
                    <ArrowLeft size={15} color="#555" />
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                )}
                {step < STEPS.length-1 ? (
                  <TouchableOpacity style={[styles.primaryBtn,{flex:1,opacity:canNext()?1:0.4}]} onPress={() => canNext()&&setStep(s=>s+1)} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>Continue</Text>
                    <ArrowRight size={16} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.primaryBtn,{flex:1}]} onPress={handleConfirm} activeOpacity={0.85}>
                    <CheckCircle size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}>Create Digital ID</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => setMode('login')} style={styles.switchLink}>
                <Text style={styles.switchText}>Already registered? <Text style={{ color:COLORS.primary, fontWeight:'800' }}>Sign In</Text></Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:        { padding:24, paddingTop:12, paddingBottom:18, overflow:'hidden' },
  headerGlow1:   { position:'absolute', width:170, height:170, borderRadius:85, backgroundColor:'rgba(255,255,255,0.06)', top:-70, right:-50 },
  headerGlow2:   { position:'absolute', width:130, height:130, borderRadius:65, backgroundColor:'rgba(255,255,255,0.05)', bottom:-60, left:-40 },
  headerTop:     { flexDirection:'row', alignItems:'center', gap:14, marginBottom:16 },
  logoBox:       { width:48, height:48, backgroundColor:COLORS.yellow, borderRadius:14, alignItems:'center', justifyContent:'center', elevation:4 },
  logoText:      { color:COLORS.primary, fontSize:28, fontWeight:'900' },
  appName:       { color:'#fff', fontSize:20, fontWeight:'900' },
  appTagline:    { color:'#a5d6a7', fontSize:11, fontWeight:'600', marginTop:1 },
  ecosystemRow:    { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:2 },
  ecosystemItem:   { alignItems:'center', gap:5, width:64 },
  ecosystemIconBox:{ width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.14)', borderWidth:1, borderColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
  ecosystemLabel:  { fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.85)', textAlign:'center' },
  card:          { flex:1, backgroundColor:'#fff', borderTopLeftRadius:28, borderTopRightRadius:28, padding:24, paddingBottom:40 },
  cardTitle:     { fontSize:24, fontWeight:'900', color:'#1a1a1a', marginBottom:4 },
  cardSub:       { fontSize:13, color:'#888', marginBottom:20 },
  roleGrid:      { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 },
  roleCard:      { width:'47%', borderWidth:1.5, borderColor:'#e0e0e0', borderRadius:16, padding:14, alignItems:'center', backgroundColor:'#fafafa' },
  roleIconBox:   { width:44, height:44, borderRadius:14, alignItems:'center', justifyContent:'center', marginBottom:8 },
  roleName:      { fontSize:13, fontWeight:'900', color:'#1a1a1a', marginBottom:4 },
  roleDesc:      { fontSize:10, color:'#888', textAlign:'center', lineHeight:14 },
  label:         { fontSize:11, fontWeight:'800', color:'#888', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 },
  inputWrap:     { justifyContent:'center', marginBottom:12 },
  inputIcon:     { position:'absolute', left:14, zIndex:1 },
  inputWithIcon: { paddingLeft:42, marginBottom:0 },
  infoBox:       { backgroundColor:'#e8f5e9', borderRadius:12, padding:12, marginTop:4, marginBottom:12 },
  infoText:      { fontSize:12, color:COLORS.primary, fontWeight:'600', lineHeight:18 },
  progress:      { flexDirection:'row', alignItems:'center', marginBottom:24 },
  progDot:       { width:28, height:28, borderRadius:14, backgroundColor:'#eee', alignItems:'center', justifyContent:'center' },
  progDotText:   { fontSize:11, fontWeight:'800', color:'#999' },
  progLine:      { flex:1, height:2, backgroundColor:'#eee' },
  stepTitle:     { fontSize:20, fontWeight:'900', color:'#1a1a1a', marginBottom:4 },
  stepSub:       { fontSize:13, color:'#888', marginBottom:20, lineHeight:18 },
  chip:          { paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1.5, borderColor:'#e0e0e0', backgroundColor:'#f9f9f9', marginRight:8, marginBottom:8 },
  chipText:      { fontSize:12, fontWeight:'700', color:'#555' },
  chipRow:       { flexDirection:'row', flexWrap:'wrap', marginBottom:12 },
  confirmCard:   { backgroundColor:'#f9f9f9', borderRadius:16, padding:16, marginBottom:14, borderLeftWidth:4 },
  roleBadge:     { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', paddingHorizontal:12, paddingVertical:5, borderRadius:20, marginBottom:12 },
  roleBadgeText: { color:'#fff', fontSize:12, fontWeight:'800' },
  confirmRow:    { flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:1, borderBottomColor:'#ececec' },
  confirmLabel:  { fontSize:12, color:'#888', fontWeight:'600' },
  confirmVal:    { fontSize:12, fontWeight:'800', color:'#1a1a1a', maxWidth:'55%', textAlign:'right' },
  navRow:        { flexDirection:'row', gap:12, marginTop:20, marginBottom:8 },
  backBtn:       { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:20, paddingVertical:15, backgroundColor:'#f0f0f0', borderRadius:16, justifyContent:'center' },
  backBtnText:   { fontWeight:'800', color:'#555', fontSize:14 },
  primaryBtn:    { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:COLORS.primary, borderRadius:16, paddingVertical:16, elevation:4 },
  primaryBtnText:{ color:'#fff', fontWeight:'900', fontSize:15 },
  switchLink:    { alignItems:'center', marginTop:16, paddingVertical:8 },
  switchText:    { fontSize:13, color:'#999' },
});

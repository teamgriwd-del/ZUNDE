import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config';

// ── seed data (mirrors web App.jsx) ────────────────────────────────────────
const ANIMALS = [
  { id: 101, name: 'Bessie',  species: 'Cattle', breed: 'Brahman', age: '2y 4m', tagId: 'ZIM-882',
    birthDate: '2023-10-15', currentWeight: 420, forSale: false, costToDate: 120 },
  { id: 102, name: 'Thunder', species: 'Cattle', breed: 'Angus',   age: '1y 9m', tagId: 'ZIM-104',
    birthDate: '2024-05-20', currentWeight: 380, forSale: true,  costToDate: 95 },
];
const NOTIFICATIONS = [
  { id: 1, title: 'January Disease Alert', msg: 'Chegutu Area — increased tick counts detected.', type: 'Critical', time: '1h ago' },
  { id: 2, title: 'Vaccine Recall',         msg: 'Lot #992 Oxytetracycline recalled by supplier.',  type: 'Info',     time: '4h ago' },
];
const INVENTORY = [
  { id: 1, name: 'Oxytetracycline (LA)', stock: 500,  unit: 'ml', min: 100, supplier: 'AgroChem Zim' },
  { id: 2, name: 'Buparvaquone',         stock: 120,  unit: 'ml', min: 50,  supplier: 'VetDirect' },
  { id: 3, name: 'Albendazole',          stock: 1000, unit: 'ml', min: 200, supplier: 'AgroChem Zim' },
];
const ORDERS = [
  { id: 'ORD-441', farm: 'Moyo Livestock',     item: 'Oxytetracycline (LA)',   qty: '200ml',    status: 'Dispatched', urgent: false },
  { id: 'ORD-442', farm: 'ZimAgro Enterprise', item: 'FMD Vaccine',            qty: '50 doses', status: 'Pending',    urgent: true  },
  { id: 'ORD-443', farm: 'Kumar Farms',         item: 'Buparvaquone (Butalex)',qty: '100ml',    status: 'Pending',    urgent: true  },
  { id: 'ORD-444', farm: 'Central Paddock',     item: 'Albendazole Drench',    qty: '500ml',    status: 'Delivered',  urgent: false },
];
const FARMS = [
  { name: 'Kumar Farms',        animals: 24, status: 'Verified', province: 'Mashonaland West', alert: false },
  { name: 'Moyo Livestock',     animals: 18, status: 'Verified', province: 'Mashonaland West', alert: true  },
  { name: 'ZimAgro Enterprise', animals: 45, status: 'Verified', province: 'Mashonaland West', alert: false },
  { name: 'Central Paddock',    animals: 12, status: 'Pending',  province: 'Mashonaland East', alert: false },
];
const RECENT_BIDS = [
  { animal: 'Thunder', bidder: 'ZimAgro Ltd', amount: 620, time: '2h ago' },
  { animal: 'Bessie',  bidder: 'Farm Direct', amount: 850, time: '5h ago' },
];

const VACCINE_SCHEDULES = {
  Cattle: [
    { name: 'FMD Vaccine (Annual)',     age: 180 },
    { name: 'Anthrax Vaccine',          age: 365 },
    { name: 'Blackleg Vaccine',         age: 90  },
  ],
};

const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// ── Shared UI primitives ────────────────────────────────────────────────────
const SectionLabel = ({ children, light }) => (
  <Text style={[s.sectionLabel, light && { color: 'rgba(255,255,255,0.4)' }]}>{children}</Text>
);

const KpiCard = ({ label, value, sub, accent, textColor, borderColor }) => (
  <View style={[s.kpiCard, accent && { backgroundColor: accent }, borderColor && { borderColor }]}>
    <Text style={s.kpiLabel}>{label}</Text>
    <Text style={[s.kpiValue, textColor && { color: textColor }]}>{value}</Text>
    {sub ? <Text style={s.kpiSub} numberOfLines={2}>{sub}</Text> : null}
  </View>
);

const QuickBtn = ({ emoji, label, desc, color, onPress }) => (
  <TouchableOpacity style={s.quickBtn} onPress={onPress} activeOpacity={0.8}>
    <View style={[s.quickIcon, { backgroundColor: color }]}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.quickLabel}>{label}</Text>
      <Text style={s.quickDesc} numberOfLines={1}>{desc}</Text>
    </View>
    <Text style={s.quickArrow}>›</Text>
  </TouchableOpacity>
);

const AlertCard = ({ title, msg, type, time }) => (
  <View style={[s.alertCard, type === 'Critical' ? s.alertCritical : s.alertInfo]}>
    <View style={[s.alertDot, { backgroundColor: type === 'Critical' ? '#ef4444' : '#3b82f6' }]} />
    <View style={{ flex: 1 }}>
      <Text style={s.alertTitle}>{title}</Text>
      <Text style={s.alertMsg}>{msg}</Text>
      <Text style={s.alertTime}>{time}</Text>
    </View>
  </View>
);

// ── Stakeholder map (shared) ───────────────────────────────────────────────
const StakeholderMap = () => (
  <View style={s.smCard}>
    <Text style={s.smTitle}>🌍  How ZUNDE Connects Everyone</Text>
    <Text style={s.smDesc}>
      ZUNDE is a four-stakeholder ecosystem. Every role plays a specific part — here's how they all connect.
    </Text>
    {[
      { emoji: '🌾', role: 'Farmer',       color: '#e8f5e9', text: '#1b5e20', desc: 'Registers animals, tracks health, orders medicines, lists livestock for sale.' },
      { emoji: '💊', role: 'Supplier',      color: '#fff3e0', text: '#bf360c', desc: 'Distributes vaccines, medicines, and feed to farmers.' },
      { emoji: '🏪', role: 'Retailer',      color: '#f3e5f5', text: '#4a148c', desc: 'Browses certified livestock, places bids, receives DVS certificates.' },
      { emoji: '🩺', role: 'Veterinarian',  color: '#e3f2fd', text: '#0d47a1', desc: 'Certifies animal health, issues movement permits, manages outbreaks.' },
    ].map(r => (
      <View key={r.role} style={[s.smRow, { backgroundColor: r.color }]}>
        <Text style={{ fontSize: 20, marginRight: 10 }}>{r.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.smRoleName, { color: r.text }]}>{r.role}</Text>
          <Text style={s.smRoleDesc}>{r.desc}</Text>
        </View>
      </View>
    ))}
    <View style={s.smFlow}>
      <Text style={s.smFlowTitle}>HOW IT FLOWS</Text>
      {[
        '🌾 Farmer  →  💊 Supplier — orders medicines & vaccines',
        '🌾 Farmer  →  🩺 Vet — requests health checks & movement certs',
        '🌾 Farmer  →  🏪 Retailer — lists animals for sale',
        '🏪 Retailer  →  🌾 Farmer — places a bid / makes an offer',
        '🩺 Vet  →  🏪 Retailer — issues DVS movement certificate',
      ].map((line, i) => <Text key={i} style={s.smFlowLine}>{line}</Text>)}
    </View>
  </View>
);

// ── FARMER DASHBOARD ────────────────────────────────────────────────────────
function FarmerDashboard({ currentUser, animals, navigation }) {
  const [localAnimals, setLocalAnimals] = useState(animals);
  const forSale    = localAnimals.filter(a => a.forSale).length;
  const critAlerts = NOTIFICATIONS.filter(n => n.type === 'Critical');
  const lowStock   = INVENTORY.filter(i => i.stock <= i.min);
  const totalValue = localAnimals.reduce((acc, a) => acc + 500 + a.currentWeight * 1.5, 0);

  const overdueVaccines = useMemo(() => {
    const rows = [];
    localAnimals.forEach(a => {
      if (!a.birthDate) return;
      const birth = new Date(a.birthDate);
      (VACCINE_SCHEDULES[a.species] || []).forEach(v => {
        const due = new Date(birth);
        due.setDate(birth.getDate() + v.age);
        if (new Date() > due) rows.push({ animal: a.name, vaccine: v.name });
      });
    });
    return rows.slice(0, 4);
  }, [localAnimals]);

  const toggleSale = (id) =>
    setLocalAnimals(prev => prev.map(a => a.id === id ? { ...a, forSale: !a.forSale } : a));

  return (
    <ScrollView style={s.bg} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Greeting banner */}
      <View style={[s.banner, { backgroundColor: COLORS.primary }]}>
        <Text style={s.bannerEyebrow}>{greet()}, Farmer</Text>
        <Text style={s.bannerTitle}>Here's your farm today</Text>
        <Text style={s.bannerSub}>
          {localAnimals.length} animal{localAnimals.length !== 1 ? 's' : ''} · {critAlerts.length} critical alert{critAlerts.length !== 1 ? 's' : ''} · {overdueVaccines.length} overdue vaccine{overdueVaccines.length !== 1 ? 's' : ''}
        </Text>
        {critAlerts.length > 0 && (
          <View style={s.bannerAlert}>
            <Text style={s.bannerAlertText}>⚠  {critAlerts.length} Critical Alert{critAlerts.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* KPI row */}
      <View style={s.kpiRow}>
        <KpiCard label="Total Animals"    value={localAnimals.length}                     sub="In your herd registry" />
        <KpiCard label="Herd Value"       value={`$${totalValue.toLocaleString()}`}       sub="Estimated market value" />
      </View>
      <View style={s.kpiRow}>
        <KpiCard
          label="Overdue Vaccines" value={overdueVaccines.length}
          sub={overdueVaccines.length ? 'Need immediate attention' : 'All vaccinations current'}
          accent={overdueVaccines.length ? '#fff5f5' : undefined}
          textColor={overdueVaccines.length ? COLORS.danger : undefined}
          borderColor={overdueVaccines.length ? '#fca5a5' : undefined}
        />
        <KpiCard label="Listed for Sale" value={forSale} sub={forSale ? 'Visible on marketplace' : 'None listed yet'} />
      </View>

      {/* Priority Actions */}
      <SectionLabel>PRIORITY ACTIONS</SectionLabel>
      <View style={s.panel}>
        {overdueVaccines.length === 0 && lowStock.length === 0 && critAlerts.length === 0 ? (
          <View style={s.emptyInner}>
            <Text style={{ fontSize: 28 }}>✅</Text>
            <Text style={s.emptyInnerText}>All good — no urgent actions</Text>
          </View>
        ) : (
          <>
            {overdueVaccines.map((v, i) => (
              <View key={i} style={s.priorityItem}>
                <View style={[s.priorityDot, { backgroundColor: '#ef4444' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.priorityTitle}>{v.vaccine}</Text>
                  <Text style={s.prioritySub}>{v.animal} — overdue</Text>
                </View>
              </View>
            ))}
            {lowStock.map(item => (
              <View key={item.id} style={[s.priorityItem, { backgroundColor: '#fff7ed' }]}>
                <Text style={s.priorityDot}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.priorityTitle, { color: '#9a3412' }]}>{item.name}</Text>
                  <Text style={[s.prioritySub, { color: '#c2410c' }]}>Low stock — {item.stock}{item.unit} left</Text>
                </View>
              </View>
            ))}
            {critAlerts.map(n => (
              <View key={n.id} style={[s.priorityItem, { backgroundColor: '#fefce8' }]}>
                <Text style={s.priorityDot}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.priorityTitle, { color: '#713f12' }]}>{n.title}</Text>
                  <Text style={[s.prioritySub, { color: '#92400e' }]}>{n.msg}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Quick Navigation */}
      <SectionLabel>QUICK NAVIGATION</SectionLabel>
      <View style={s.panel}>
        <QuickBtn emoji="🐄" label="Herd Registry"  desc="View & manage your animals"  color={COLORS.primary} onPress={() => navigation.navigate('Herd')} />
        <QuickBtn emoji="💉" label="Lifecycle"       desc="Vaccines & health protocols"  color="#2563eb"        onPress={() => navigation.navigate('Herd')} />
        <QuickBtn emoji="📡" label="IoT Monitor"     desc="Live sensor & GPS tracking"   color="#7c3aed"        onPress={() => navigation.navigate('IoT')} />
        <QuickBtn emoji="🛒" label="Marketplace"     desc="Browse & list livestock"       color="#0d9488"        onPress={() => navigation.navigate('Market')} />
        <QuickBtn emoji="🌾" label="Feed Analyzer"   desc="Livestock nutrition database"  color="#ea580c"        onPress={() => navigation.navigate('Feed')} />
      </View>

      {/* Sell Your Animals */}
      <SectionLabel>SELL YOUR ANIMALS</SectionLabel>
      <View style={s.panel}>
        <Text style={s.panelDesc}>
          Toggle any animal to list it on the ZUNDE Marketplace. Retailers and livestock buyers will immediately see it.
        </Text>
        {localAnimals.length === 0 ? (
          <View style={s.emptyInner}>
            <Text style={{ fontSize: 36 }}>🐄</Text>
            <Text style={s.emptyInnerText}>No animals registered yet</Text>
          </View>
        ) : localAnimals.map(a => (
          <View key={a.id} style={[s.animalRow, a.forSale && s.animalRowActive]}>
            <View style={{ flex: 1 }}>
              <Text style={s.animalName}>{a.name}</Text>
              <Text style={s.animalSub}>{a.species} · {a.currentWeight}kg</Text>
              {a.forSale && <Text style={s.animalListed}>✓ Visible to retailers now</Text>}
            </View>
            <TouchableOpacity
              style={[s.listBtn, a.forSale && s.listBtnActive]}
              onPress={() => toggleSale(a.id)}
              activeOpacity={0.8}
            >
              <Text style={[s.listBtnText, a.forSale && s.listBtnTextActive]}>
                {a.forSale ? 'Unlist' : 'List for Sale'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Medicine Cabinet */}
      <SectionLabel>MEDICINE CABINET</SectionLabel>
      <View style={s.panel}>
        {INVENTORY.map(item => {
          const isLow = item.stock <= item.min;
          const pct   = Math.min(100, (item.stock / 1000) * 100);
          return (
            <View key={item.id} style={[s.medicineRow, isLow && { backgroundColor: '#fff5f5', borderColor: '#fca5a5' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={s.medicineName}>{item.name}</Text>
                {isLow && <Text style={s.medicineLow}>Low — reorder</Text>}
              </View>
              <Text style={s.medicineDetail}>{item.stock} {item.unit} · from {item.supplier}</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, {
                  width: `${pct}%`,
                  backgroundColor: isLow ? COLORS.danger : pct > 50 ? COLORS.primary : '#f97316',
                }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Disease Alerts */}
      <SectionLabel>DISEASE ALERTS NEAR YOU</SectionLabel>
      <View style={s.panel}>
        {NOTIFICATIONS.map(n => <AlertCard key={n.id} {...n} />)}
      </View>

      <StakeholderMap />
    </ScrollView>
  );
}

// ── VETERINARIAN DASHBOARD ──────────────────────────────────────────────────
function VeterinarianDashboard({ currentUser, navigation }) {
  const province = currentUser?.province || 'Mashonaland West';
  const lastName  = currentUser?.name?.split(' ').pop() || 'Officer';

  return (
    <ScrollView style={[s.bg, { backgroundColor: '#0f172a' }]} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Greeting banner */}
      <View style={[s.banner, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
        <Text style={[s.bannerEyebrow, { color: '#86efac' }]}>Authority Dashboard · {province}</Text>
        <Text style={s.bannerTitle}>{greet()}, Dr. {lastName}</Text>
        <Text style={[s.bannerSub, { color: '#94a3b8' }]}>Provincial veterinary oversight — outbreaks, certifications, and farmer case management</Text>
        <View style={[s.bannerAlert, { backgroundColor: '#dc2626' }]}>
          <Text style={s.bannerAlertText}>🌐  FMD QUARANTINE ACTIVE</Text>
        </View>
      </View>

      {/* KPIs */}
      <View style={s.kpiRow}>
        <KpiCard label="Active Outbreaks"  value="1"   sub="FMD — Chegutu District"       accent="#1a0a0a" textColor="#f87171" borderColor="#7f1d1d" />
        <KpiCard label="Cert. Queue"       value="12"  sub="Awaiting your sign-off"        accent="#1e293b" textColor="#f8fafc" borderColor="#334155" />
      </View>
      <View style={s.kpiRow}>
        <KpiCard label="Farms Under Watch" value="4"   sub="Mashonaland West registry"     accent="#1e293b" textColor="#f8fafc" borderColor="#334155" />
        <KpiCard label="Node Sync"         value="99%" sub="RaMambo mesh network online"   accent="#1e293b" textColor="#4ade80" borderColor="#334155" />
      </View>

      {/* Active Outbreak */}
      <SectionLabel light>ACTIVE OUTBREAK</SectionLabel>
      <View style={[s.panel, { backgroundColor: '#1a0a0a', borderColor: '#7f1d1d', borderWidth: 1 }]}>
        <Text style={{ color: '#f87171', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>⚠  CRITICAL — Active</Text>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>Foot & Mouth Disease</Text>
        <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 14, lineHeight: 18 }}>
          Confirmed in Chegutu District, Mashonaland West. Movement ban in effect.
        </Text>
        {[
          ['Status',          'CRITICAL — Active'],
          ['Affected farms',  '3 confirmed'],
          ['Animals at risk', '~200 cattle'],
          ['Restriction',     'No livestock movement'],
        ].map(([k, v]) => (
          <View key={k} style={s.infoRow}>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>{k}</Text>
            <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '800' }}>{v}</Text>
          </View>
        ))}
        <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#dc2626', marginTop: 14 }]} activeOpacity={0.8}>
          <Text style={s.primaryBtnText}>📞  Issue Emergency Advisory</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <SectionLabel light>QUICK ACTIONS</SectionLabel>
      <View style={[s.panel, { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }]}>
        {[
          { emoji: '💬', label: 'Vet Messenger',      desc: 'Chat with farmers',      color: COLORS.primary, tab: 'Vet'  },
          { emoji: '🐄', label: 'Animal Registry',    desc: 'View herd records',      color: '#7c3aed',      tab: 'Herd' },
          { emoji: '📡', label: 'IoT Monitor',         desc: 'Live sensor telemetry',  color: '#0d9488',      tab: 'IoT'  },
          { emoji: '🛡', label: 'Issue Certificate',  desc: 'Sign off a case',        color: '#2563eb',      tab: 'Vet'  },
        ].map(a => (
          <QuickBtn key={a.label} emoji={a.emoji} label={a.label} desc={a.desc} color={a.color} onPress={() => navigation.navigate(a.tab)} />
        ))}
      </View>

      {/* Farm Registry */}
      <SectionLabel light>FARMER REGISTRY — {province.toUpperCase()}</SectionLabel>
      <View style={[s.panel, { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }]}>
        <Text style={{ color: '#64748b', fontSize: 11, marginBottom: 12, lineHeight: 16 }}>
          Farms under your provincial oversight. Tap to open a consultation.
        </Text>
        {FARMS.map((farm, i) => (
          <View key={i} style={s.farmRow}>
            <View style={s.farmAvatar}>
              <Text style={s.farmAvatarText}>{farm.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[s.farmName, { color: '#f8fafc' }]}>{farm.name}</Text>
                {farm.alert && <Text style={s.farmAlertBadge}>Alert</Text>}
              </View>
              <Text style={[s.farmSub, { color: '#64748b' }]}>{farm.province} · {farm.animals} animals</Text>
            </View>
            <Text style={[s.statusBadge, farm.status === 'Verified' ? s.statusVerified : s.statusPending]}>
              {farm.status}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── SUPPLIER DASHBOARD ──────────────────────────────────────────────────────
function SupplierDashboard({ currentUser, navigation }) {
  const pending    = ORDERS.filter(o => o.status === 'Pending').length;
  const dispatched = ORDERS.filter(o => o.status === 'Dispatched').length;
  const delivered  = ORDERS.filter(o => o.status === 'Delivered').length;

  return (
    <ScrollView style={s.bg} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Banner */}
      <View style={[s.banner, { backgroundColor: '#ea580c' }]}>
        <Text style={s.bannerEyebrow}>{greet()}, Supplier</Text>
        <Text style={s.bannerTitle}>Supply Distribution Hub</Text>
        <Text style={[s.bannerSub, { color: '#fed7aa' }]}>
          {pending} pending · {dispatched} in transit · {delivered} delivered
        </Text>
      </View>

      {/* Role explanation */}
      <View style={s.panel}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Your Role on ZUNDE</Text>
        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1a1a1a', marginBottom: 6 }}>You are a veterinary medicine & vaccine distributor</Text>
        <Text style={{ fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 10 }}>
          Farmers across Zimbabwe register on ZUNDE to manage herd health. When they run low on vaccines or medicines, they contact you through the platform. You fulfill the order and dispatch to the farm.
        </Text>
        <Text style={{ fontSize: 12, color: '#888' }}>🌾 Farmer runs low  →  💊 You fulfill & dispatch  →  🐄 Animals stay healthy</Text>
      </View>

      {/* KPIs */}
      <View style={s.kpiRow}>
        <KpiCard label="Pending Orders" value={pending}    sub="Need dispatch today"       accent={pending ? '#fff7ed' : undefined} textColor={pending ? '#c2410c' : undefined} borderColor={pending ? '#fed7aa' : undefined} />
        <KpiCard label="In Transit"     value={dispatched} sub="On the way to farmers"     />
      </View>
      <View style={s.kpiRow}>
        <KpiCard label="Delivered"       value={delivered} sub="Completed this week"       />
        <KpiCard label="Fulfillment Rate" value="92%"     sub="Monthly on-time delivery"  />
      </View>

      {/* Active Orders */}
      <SectionLabel>ACTIVE ORDERS</SectionLabel>
      <View style={s.panel}>
        {ORDERS.map(o => (
          <View key={o.id} style={[s.orderRow, o.urgent && o.status === 'Pending' && { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>📦</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={s.orderFarm}>{o.farm}</Text>
                {o.urgent && o.status === 'Pending' && <Text style={s.urgentBadge}>Urgent</Text>}
              </View>
              <Text style={s.orderDetail}>{o.item} · {o.qty} · {o.id}</Text>
            </View>
            <Text style={[s.orderStatus,
              o.status === 'Pending'    ? { color: '#c2410c', backgroundColor: '#fff7ed' } :
              o.status === 'Dispatched' ? { color: '#1d4ed8', backgroundColor: '#eff6ff' } :
              { color: '#15803d', backgroundColor: '#f0fdf4' },
            ]}>{o.status}</Text>
          </View>
        ))}
      </View>

      {/* Message a farmer */}
      <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#ea580c', marginTop: 4 }]} onPress={() => navigation.navigate('Vet')} activeOpacity={0.8}>
        <Text style={s.primaryBtnText}>💬  Message a Farmer</Text>
      </TouchableOpacity>

      <StakeholderMap />
    </ScrollView>
  );
}

// ── RETAILER DASHBOARD ──────────────────────────────────────────────────────
function RetailerDashboard({ currentUser, navigation }) {
  const listings    = ANIMALS.filter(a => a.forSale);
  const totalValue  = listings.reduce((a, l) => a + 500 + l.currentWeight * 1.5, 0);
  const avgPrice    = listings.length ? Math.round(totalValue / listings.length) : 0;

  return (
    <ScrollView style={s.bg} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Banner */}
      <View style={[s.banner, { backgroundColor: '#6d28d9' }]}>
        <Text style={s.bannerEyebrow}>{greet()}, Retailer</Text>
        <Text style={s.bannerTitle}>Livestock Marketplace</Text>
        <Text style={[s.bannerSub, { color: '#ddd6fe' }]}>
          {listings.length} active listing{listings.length !== 1 ? 's' : ''} · Market sentiment: Bullish
        </Text>
      </View>

      {/* Role explanation */}
      <View style={s.panel}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Your Role on ZUNDE</Text>
        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1a1a1a', marginBottom: 6 }}>You are a livestock buyer & trader</Text>
        <Text style={{ fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 10 }}>
          Farmers list their animals for sale on ZUNDE. Each animal comes with a certified Health Passport. You place a bid, the farmer accepts, and a DVS Vet issues an official movement certificate so you can legally transport the animal.
        </Text>
        <Text style={{ fontSize: 12, color: '#888' }}>🌾 Farmer lists  →  🏪 You bid  →  🩺 Vet certifies  →  ✅ Sale complete</Text>
      </View>

      {/* KPIs */}
      <View style={s.kpiRow}>
        <KpiCard label="Active Listings"     value={listings.length}             sub="Verified with health passports" />
        <KpiCard label="Avg. Price / Unit"   value={listings.length ? `$${avgPrice.toLocaleString()}` : '$—'} sub="Estimated market value" />
      </View>
      <View style={s.kpiRow}>
        <KpiCard label="Total Listing Value" value={`$${totalValue.toLocaleString()}`}  sub="Combined herd value on market" />
        <KpiCard label="Market Sentiment"    value="BULLISH"                            sub="Prices trending upward +10%"  accent="#f5f3ff" textColor="#6d28d9" borderColor="#c4b5fd" />
      </View>

      {/* Listings */}
      <SectionLabel>VERIFIED MARKETPLACE LISTINGS</SectionLabel>
      <View style={s.panel}>
        <Text style={s.panelDesc}>All animals have a certified ZUNDE Health Passport — safe to bid</Text>
        {listings.length === 0 ? (
          <View style={s.emptyInner}>
            <Text style={{ fontSize: 36 }}>🛒</Text>
            <Text style={s.emptyInnerText}>No listings yet</Text>
            <Text style={[s.emptyInnerText, { fontSize: 11, marginTop: 4 }]}>Farmers can list animals from their Herd Registry</Text>
          </View>
        ) : listings.map(a => (
          <View key={a.id} style={s.listingRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: '900', color: '#1a1a1a' }}>{a.name}</Text>
                <Text style={s.certBadge}>Certified</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{a.breed} · {a.species} · {a.age} · {a.currentWeight}kg</Text>
              <Text style={{ fontSize: 11, color: '#555', fontWeight: '700' }}>🛡  Verified Health Passport · Tag #{a.tagId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: '#888', fontWeight: '700', textTransform: 'uppercase' }}>Est. Value</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#6d28d9' }}>${(500 + a.currentWeight * 1.5).toLocaleString()}</Text>
              <TouchableOpacity style={s.bidBtn} activeOpacity={0.8}>
                <Text style={s.bidBtnText}>Bid</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Bids */}
      <SectionLabel>RECENT BIDS</SectionLabel>
      <View style={s.panel}>
        {RECENT_BIDS.map((b, i) => (
          <View key={i} style={s.bidRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#1a1a1a' }}>{b.animal}</Text>
              <Text style={{ fontSize: 11, color: '#666' }}>{b.bidder}</Text>
              <Text style={{ fontSize: 10, color: '#aaa', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>{b.time}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#6d28d9' }}>${b.amount}</Text>
          </View>
        ))}
      </View>

      {/* How to Buy */}
      <SectionLabel>HOW TO BUY</SectionLabel>
      <View style={s.panel}>
        {[
          { n: '1', t: 'Browse Listings',   d: 'All animals carry a certified ZUNDE Health Passport' },
          { n: '2', t: 'Check the Passport',d: 'View vaccination history and breed details before bidding' },
          { n: '3', t: 'Place a Bid',        d: 'Your offer goes directly to the farmer via the platform' },
          { n: '4', t: 'Receive Certificate',d: 'DVS movement permit issued on confirmed sale' },
        ].map(step => (
          <View key={step.n} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
            <View style={s.stepNum}><Text style={s.stepNumText}>{step.n}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1a1a1a' }}>{step.t}</Text>
              <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{step.d}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Contact seller */}
      <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#6d28d9' }]} onPress={() => navigation.navigate('Vet')} activeOpacity={0.8}>
        <Text style={s.primaryBtnText}>💬  Contact a Seller</Text>
      </TouchableOpacity>

      <StakeholderMap />
    </ScrollView>
  );
}

// ── ROOT ────────────────────────────────────────────────────────────────────
export default function DashboardScreen({ currentUser, onLogout, navigation }) {
  const role = currentUser?.role || 'Farmer';

  const ROLE_COLOR = {
    Farmer: COLORS.primary, Veterinarian: '#1e293b',
    Supplier: '#ea580c',    Retailer: '#6d28d9',
  };
  const headerBg = ROLE_COLOR[role] || COLORS.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: role === 'Veterinarian' ? '#0f172a' : COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={headerBg} />

      {/* Top bar */}
      <View style={[s.topBar, { backgroundColor: headerBg }]}>
        <View style={s.logoRow}>
          <View style={s.logoBox}><Text style={s.logoText}>R</Text></View>
          <View>
            <Text style={s.logoName}>ZUNDE RaMambo</Text>
            <Text style={s.logoTagline}>Zimbabwe's Livestock Platform</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.userName} numberOfLines={1}>{currentUser?.name || 'User'}</Text>
          <Text style={s.userRole}>{role}</Text>
        </View>
      </View>

      {/* Role dashboard */}
      {role === 'Farmer'       && <FarmerDashboard       currentUser={currentUser} animals={ANIMALS} navigation={navigation} />}
      {role === 'Veterinarian' && <VeterinarianDashboard  currentUser={currentUser} navigation={navigation} />}
      {role === 'Supplier'     && <SupplierDashboard      currentUser={currentUser} navigation={navigation} />}
      {role === 'Retailer'     && <RetailerDashboard      currentUser={currentUser} navigation={navigation} />}
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  bg:              { flex: 1, backgroundColor: '#f4f6f5' },
  topBar:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  logoRow:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox:         { width: 36, height: 36, backgroundColor: '#fbc02d', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText:        { color: COLORS.primary, fontSize: 20, fontWeight: '900' },
  logoName:        { color: '#fff', fontSize: 14, fontWeight: '900' },
  logoTagline:     { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '600' },
  userName:        { color: '#fff', fontSize: 13, fontWeight: '800', maxWidth: 120 },
  userRole:        { color: '#fbc02d', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

  banner:          { borderRadius: 20, padding: 20, marginBottom: 16 },
  bannerEyebrow:   { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  bannerTitle:     { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  bannerSub:       { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  bannerAlert:     { marginTop: 12, backgroundColor: 'rgba(220,38,38,0.3)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
  bannerAlertText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  kpiRow:          { flexDirection: 'row', gap: 10, marginBottom: 10 },
  kpiCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 },
  kpiLabel:        { fontSize: 9, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  kpiValue:        { fontSize: 26, fontWeight: '900', color: '#111827', marginBottom: 4 },
  kpiSub:          { fontSize: 10, fontWeight: '500', color: '#9ca3af', lineHeight: 14 },

  sectionLabel:    { fontSize: 9, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  panel:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  panelDesc:       { fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 18 },

  emptyInner:      { alignItems: 'center', paddingVertical: 24 },
  emptyInnerText:  { fontSize: 13, fontWeight: '700', color: '#9ca3af', marginTop: 8, textAlign: 'center' },

  priorityItem:    { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff5f5', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
  priorityDot:     { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  priorityTitle:   { fontSize: 12, fontWeight: '800', color: '#991b1b' },
  prioritySub:     { fontSize: 11, color: '#b91c1c', marginTop: 2 },

  quickBtn:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  quickIcon:       { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quickLabel:      { fontSize: 13, fontWeight: '800', color: '#111827' },
  quickDesc:       { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  quickArrow:      { fontSize: 20, color: '#d1d5db', marginLeft: 8 },

  alertCard:       { flexDirection: 'row', borderRadius: 12, padding: 12, marginBottom: 10, borderLeftWidth: 3, gap: 10 },
  alertCritical:   { backgroundColor: '#fff5f5', borderLeftColor: '#ef4444' },
  alertInfo:       { backgroundColor: '#eff6ff', borderLeftColor: '#3b82f6' },
  alertDot:        { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  alertTitle:      { fontSize: 12, fontWeight: '800', color: '#111827' },
  alertMsg:        { fontSize: 11, color: '#6b7280', marginTop: 2 },
  alertTime:       { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginTop: 4 },

  animalRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb' },
  animalRowActive: { backgroundColor: '#fefce8', borderColor: '#fde68a' },
  animalName:      { fontSize: 14, fontWeight: '900', color: '#111827' },
  animalSub:       { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  animalListed:    { fontSize: 10, fontWeight: '800', color: '#92400e', marginTop: 3 },
  listBtn:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.primary },
  listBtnActive:   { backgroundColor: '#fbc02d', borderColor: '#fbc02d' },
  listBtnText:     { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  listBtnTextActive: { color: '#1a1a1a' },

  medicineRow:     { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  medicineName:    { fontSize: 12, fontWeight: '800', color: '#374151' },
  medicineLow:     { fontSize: 10, fontWeight: '800', color: COLORS.danger },
  medicineDetail:  { fontSize: 10, color: '#9ca3af', marginBottom: 8 },
  progressBar:     { height: 5, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: 99 },

  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },

  farmRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', gap: 12 },
  farmAvatar:      { width: 40, height: 40, backgroundColor: '#334155', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  farmAvatarText:  { color: '#86efac', fontSize: 16, fontWeight: '900' },
  farmName:        { fontSize: 13, fontWeight: '900' },
  farmSub:         { fontSize: 10, marginTop: 2 },
  farmAlertBadge:  { backgroundColor: 'rgba(220,38,38,0.2)', color: '#f87171', fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, textTransform: 'uppercase' },
  statusBadge:     { fontSize: 9, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, textTransform: 'uppercase', overflow: 'hidden' },
  statusVerified:  { backgroundColor: 'rgba(134,239,172,0.15)', color: '#4ade80' },
  statusPending:   { backgroundColor: 'rgba(251,146,60,0.15)',  color: '#fb923c' },

  orderRow:        { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 10, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb' },
  orderFarm:       { fontSize: 13, fontWeight: '800', color: '#111827' },
  orderDetail:     { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  urgentBadge:     { fontSize: 9, fontWeight: '800', color: '#ea580c', backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, textTransform: 'uppercase', overflow: 'hidden' },
  orderStatus:     { fontSize: 10, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, textTransform: 'uppercase', overflow: 'hidden' },

  listingRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 12, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', gap: 10 },
  certBadge:       { fontSize: 9, fontWeight: '800', backgroundColor: '#fef08a', color: '#713f12', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, overflow: 'hidden' },
  bidBtn:          { marginTop: 8, backgroundColor: '#6d28d9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  bidBtnText:      { color: '#fff', fontSize: 11, fontWeight: '800' },

  bidRow:          { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f5f3ff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ddd6fe' },

  stepNum:         { width: 22, height: 22, backgroundColor: '#6d28d9', borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  stepNumText:     { color: '#fff', fontSize: 10, fontWeight: '900' },

  primaryBtn:      { borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 4, marginBottom: 16 },
  primaryBtnText:  { color: '#fff', fontWeight: '900', fontSize: 15 },

  // Stakeholder map
  smCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 8, elevation: 2, marginBottom: 8 },
  smTitle:         { fontSize: 13, fontWeight: '900', color: '#111827', marginBottom: 4 },
  smDesc:          { fontSize: 11, color: '#9ca3af', marginBottom: 14, lineHeight: 16 },
  smRow:           { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 12, marginBottom: 8 },
  smRoleName:      { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  smRoleDesc:      { fontSize: 10, color: '#6b7280', lineHeight: 14 },
  smFlow:          { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginTop: 4 },
  smFlowTitle:     { fontSize: 9, fontWeight: '900', color: '#9ca3af', letterSpacing: 1, marginBottom: 8 },
  smFlowLine:      { fontSize: 11, color: '#6b7280', fontWeight: '500', marginBottom: 5, lineHeight: 16 },
});

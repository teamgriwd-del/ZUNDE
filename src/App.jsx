import React, { useState, useMemo } from 'react';
import DiseaseDetection  from './components/DiseaseDetection/DiseaseDetection';
import AnimalProfile     from './components/AnimalProfile/AnimalProfile';
import HealthManagement  from './components/HealthManagement/HealthManagement';
import VetCommunication  from './components/VetCommunication/VetCommunication';
import HardwareSimulation from './components/HardwareSimulation/HardwareSimulation';
import Marketplace       from './components/Marketplace/Marketplace';
import FeedAnalyzer      from './components/FeedAnalyzer/FeedAnalyzer';
import JindaRaMambo      from './components/IntelAI/ZundeIntelAI';
import AuthPortal        from './components/IntelAI/AuthPortal';
import ErrorBoundary     from './components/ErrorBoundary';
import { HEALTH_PROTOCOLS } from './components/HealthManagement/healthData';
import {
  LayoutDashboard, Users, HeartPulse, Stethoscope, MessageSquare, Radio,
  Bell, LogOut, ShieldCheck, TrendingUp, Package, ShoppingCart, Activity,
  Truck, BarChart3, Globe, AlertTriangle, CheckCircle, ChevronRight,
  Zap, Clock, ArrowRight, Tag, Pill, Wifi, MapPin, FileText,
  RefreshCw, DollarSign, Target, Box, PhoneCall, Star, Wheat, Store
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import './App.css';

// ── seed data ──────────────────────────────────────────────────────────────
const INITIAL_ANIMALS = [
  {
    id: 101, name: 'Bessie', species: 'Cattle', breed: 'Brahman',
    birthDate: '2023-10-15', age: '2y 4m', tagId: 'ZIM-882', brandId: 'AR-MP',
    sireId: 'S-505', damId: 'D-202', birthWeight: 35, currentWeight: 420,
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
    weightHistory: [
      { month: 'Oct', weight: 35 }, { month: 'Dec', weight: 85 }, { month: 'Feb', weight: 150 },
      { month: 'Apr', weight: 210 }, { month: 'Jun', weight: 280 }, { month: 'Aug', weight: 350 },
      { month: 'Oct', weight: 420 }
    ],
    forSale: false, costToDate: 120
  },
  {
    id: 102, name: 'Thunder', species: 'Cattle', breed: 'Angus',
    birthDate: '2024-05-20', age: '1y 9m', tagId: 'ZIM-104', brandId: 'AR-MP',
    sireId: 'S-900', damId: 'D-111', birthWeight: 32, currentWeight: 380,
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800',
    weightHistory: [
      { month: 'May', weight: 32 }, { month: 'Jul', weight: 90 }, { month: 'Sep', weight: 160 },
      { month: 'Nov', weight: 240 }, { month: 'Jan', weight: 310 }, { month: 'Mar', weight: 380 }
    ],
    forSale: true, costToDate: 95
  }
];
const INITIAL_LOGS = [
  { id: 1, animalId: 101, animal: 'Bessie', action: 'FMD Vaccine (Annual)',  date: '2/15/2026, 10:30 AM' },
  { id: 2, animalId: 103, animal: 'Snowy',  action: 'Diagnostic: Healthy',  date: '2/28/2026, 2:15 PM' }
];
const INITIAL_INVENTORY = [
  { id: 1, name: 'Oxytetracycline (LA)', stock: 500,  unit: 'ml', min: 100, supplier: 'AgroChem Zim', price: 25 },
  { id: 2, name: 'Buparvaquone',         stock: 120,  unit: 'ml', min: 50,  supplier: 'VetDirect',   price: 85 },
  { id: 3, name: 'Albendazole',          stock: 1000, unit: 'ml', min: 200, supplier: 'AgroChem Zim', price: 15 }
];

// ── shared helpers ─────────────────────────────────────────────────────────
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// ── Stakeholder Map — shown on all dashboards ──────────────────────────────
const StakeholderMap = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-1">
      <Globe size={15} className="text-zunde-green" />
      <h3 className="text-sm font-black text-gray-800">How ZUNDE Connects Everyone</h3>
    </div>
    <p className="text-[11px] text-gray-400 font-medium mb-5">
      ZUNDE is a four-stakeholder ecosystem. Every role plays a specific part — here's how they all connect.
    </p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {[
        { emoji: '🌾', role: 'Farmer',      color: 'bg-green-50 border-green-200',   text: 'text-green-800',  desc: 'Registers animals, tracks health, orders medicines, and lists livestock for sale.' },
        { emoji: '💊', role: 'Supplier',     color: 'bg-orange-50 border-orange-200', text: 'text-orange-800', desc: 'Distributes vaccines, medicines, and feed to farmers. Receives orders through ZUNDE.' },
        { emoji: '🏪', role: 'Retailer',     color: 'bg-purple-50 border-purple-200', text: 'text-purple-800', desc: 'Browses certified livestock listed by farmers, places bids, and receives DVS trade certificates.' },
        { emoji: '🩺', role: 'Veterinarian', color: 'bg-blue-50 border-blue-200',     text: 'text-blue-800',   desc: 'Certifies animal health, issues movement permits, and manages regional disease outbreaks.' },
      ].map(r => (
        <div key={r.role} className={`${r.color} border rounded-xl p-3`}>
          <p className="text-xl mb-1">{r.emoji}</p>
          <p className={`text-xs font-black ${r.text} uppercase mb-1`}>{r.role}</p>
          <p className="text-[10px] text-gray-500 font-medium leading-snug">{r.desc}</p>
        </div>
      ))}
    </div>
    {/* Flow arrows */}
    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">How it flows</p>
      {[
        { from: '🌾 Farmer', arrow: '→', to: '💊 Supplier', desc: 'orders medicines & vaccines' },
        { from: '🌾 Farmer', arrow: '→', to: '🩺 Vet',      desc: 'requests health checks & movement certificates' },
        { from: '🌾 Farmer', arrow: '→', to: '🏪 Retailer', desc: 'lists animals for sale on the marketplace' },
        { from: '🏪 Retailer', arrow: '→', to: '🌾 Farmer', desc: 'places a bid / makes an offer to buy' },
        { from: '🩺 Vet', arrow: '→', to: '🏪 Retailer',  desc: 'issues official DVS movement certificate for the sale' },
      ].map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] font-medium text-gray-600">
          <span className="font-black text-gray-800 shrink-0">{f.from}</span>
          <span className="text-gray-400">{f.arrow}</span>
          <span className="font-black text-gray-800 shrink-0">{f.to}</span>
          <span className="text-gray-400 shrink-0">—</span>
          <span>{f.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const KpiCard = ({ label, value, sub, accent = 'bg-white border-gray-100', textColor = 'text-gray-900', icon: Icon, iconColor = 'text-gray-400', onClick }) => (
  <div
    onClick={onClick}
    className={`${accent} border rounded-2xl p-5 flex flex-col gap-2 ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`}
  >
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      {Icon && <Icon size={16} className={iconColor} />}
    </div>
    <p className={`text-3xl font-black leading-none ${textColor}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-400 font-medium leading-snug">{sub}</p>}
  </div>
);

const QuickAction = ({ icon: Icon, label, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-zunde-green hover:shadow-md transition group text-left"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black text-gray-800">{label}</p>
      <p className="text-[10px] text-gray-400 font-medium truncate">{desc}</p>
    </div>
    <ArrowRight size={14} className="text-gray-300 group-hover:text-zunde-green transition shrink-0" />
  </button>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-1">{children}</p>
);

// ── FARMER DASHBOARD ───────────────────────────────────────────────────────
const FarmerDashboard = ({ animals, auditLog, inventory, notifications, setActiveTab, onListAnimal }) => {
  const totalValue  = animals.reduce((acc, a) => acc + 500 + a.currentWeight * 1.5, 0);
  const forSale     = animals.filter(a => a.forSale).length;
  const lowStock    = inventory.filter(i => i.stock <= i.min);
  const critAlerts  = notifications.filter(n => n.type === 'Critical');

  // compute overdue vaccines across all animals
  const overdueVaccines = useMemo(() => {
    const rows = [];
    animals.forEach(a => {
      if (!a.birthDate) return;
      const birth = new Date(a.birthDate);
      (HEALTH_PROTOCOLS[a.species]?.vaccines || []).forEach(v => {
        const due = new Date(birth);
        due.setDate(birth.getDate() + v.age);
        if (new Date() > due) rows.push({ animal: a.name, vaccine: v.name });
      });
    });
    return rows.slice(0, 4);
  }, [animals]);

  const recentLogs = auditLog.slice(0, 4);

  return (
    <div className="p-6 bg-gray-50 space-y-6 text-left overflow-y-auto h-full">

      {/* Greeting banner */}
      <div className="bg-zunde-green rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)' }} aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-green-200 text-xs font-black uppercase tracking-[3px] mb-1">{greet()}, Farmer</p>
            <h2 className="text-2xl font-black text-white leading-tight">Here's your farm today</h2>
            <p className="text-green-200/80 text-sm font-medium mt-1">
              {animals.length} animal{animals.length !== 1 ? 's' : ''} registered · {critAlerts.length} critical alert{critAlerts.length !== 1 ? 's' : ''} · {overdueVaccines.length} overdue vaccine{overdueVaccines.length !== 1 ? 's' : ''}
            </p>
          </div>
          {critAlerts.length > 0 && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl px-5 py-3 flex items-center gap-2 shrink-0">
              <AlertTriangle size={16} className="text-red-300 animate-pulse" />
              <span className="text-sm font-black text-red-200">{critAlerts.length} Critical Alert{critAlerts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Animals"    value={animals.length}            sub="In your herd registry"                icon={Tag}         iconColor="text-zunde-green"  onClick={() => setActiveTab('profile')} />
        <KpiCard label="Herd Value"       value={`$${totalValue.toLocaleString()}`} sub="Estimated market value"       icon={DollarSign}  iconColor="text-blue-500"     />
        <KpiCard label="Overdue Vaccines" value={overdueVaccines.length}    sub={overdueVaccines.length ? 'Need immediate attention' : 'All vaccinations current'} icon={ShieldCheck} iconColor={overdueVaccines.length ? 'text-red-500' : 'text-green-500'} accent={overdueVaccines.length ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} textColor={overdueVaccines.length ? 'text-red-600' : 'text-gray-900'} onClick={() => setActiveTab('health')} />
        <KpiCard label="Listed for Sale"  value={forSale}                   sub={forSale ? 'Visible on marketplace' : 'None listed yet'} icon={ShoppingCart} iconColor="text-purple-500" onClick={() => setActiveTab('profile')} />
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Left: Priority Actions + Quick Nav */}
        <div className="col-span-1 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} className="text-yellow-500" />
              <h3 className="text-sm font-black text-gray-800">Priority Actions</h3>
            </div>
            {overdueVaccines.length === 0 && lowStock.length === 0 && critAlerts.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle size={28} className="text-zunde-green mb-2" />
                <p className="text-xs font-black text-gray-500">All good — no urgent actions</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Your farm is running smoothly</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {overdueVaccines.map((v, i) => (
                  <button key={i} onClick={() => setActiveTab('health')} className="w-full flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-left hover:bg-red-100 transition">
                    <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-red-700 truncate">{v.vaccine}</p>
                      <p className="text-[10px] text-red-500 font-medium">{v.animal} — overdue</p>
                    </div>
                    <ArrowRight size={12} className="text-red-400 shrink-0 mt-0.5" />
                  </button>
                ))}
                {lowStock.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <Package size={14} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black text-orange-700">{item.name}</p>
                      <p className="text-[10px] text-orange-500 font-medium">Low stock — {item.stock}{item.unit} left</p>
                    </div>
                  </div>
                ))}
                {critAlerts.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <AlertTriangle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black text-yellow-800">{n.title}</p>
                      <p className="text-[10px] text-yellow-600 font-medium">{n.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick navigation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <QuickAction icon={Users}       label="Herd Registry"  desc="View & manage your animals"    color="bg-zunde-green"  onClick={() => setActiveTab('profile')} />
              <QuickAction icon={HeartPulse}  label="Lifecycle"      desc="Vaccines & health protocols"   color="bg-blue-500"    onClick={() => setActiveTab('health')} />
              <QuickAction icon={Stethoscope} label="Diagnostics"    desc="AI disease checker"            color="bg-purple-500"  onClick={() => setActiveTab('disease')} />
              <QuickAction icon={MessageSquare} label="Vet Messenger" desc="Chat with a licensed vet"     color="bg-teal-500"    onClick={() => setActiveTab('vet')} />
              <QuickAction icon={Wifi}        label="IoT Monitor"    desc="Live ear tag sensor data"      color="bg-orange-500"  onClick={() => setActiveTab('iot')} />
            </div>
          </div>
        </div>

        {/* Middle: Sell Your Animals */}
        <div className="col-span-1 space-y-5">
          {/* Sell animals panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart size={15} className="text-purple-600" />
              <h3 className="text-sm font-black text-gray-800">Sell Your Animals</h3>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mb-4 leading-snug">
              Toggle any animal below to list it on the ZUNDE Marketplace. Retailers and livestock buyers will immediately see it and can place a bid. You control the listing — remove it any time.
            </p>

            {animals.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <span className="text-4xl">🐄</span>
                <p className="text-xs text-gray-400 font-medium mt-2">No animals registered yet</p>
                <button onClick={() => setActiveTab('profile')} className="mt-3 px-4 py-2 bg-zunde-green text-white rounded-xl text-xs font-black uppercase hover:bg-green-700 transition">Register an Animal</button>
              </div>
            ) : (
              <div className="space-y-3">
                {animals.map(a => (
                  <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${a.forSale ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                      <img src={a.imageUrl} className="w-full h-full object-cover" alt={a.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800">{a.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{a.species} · {a.currentWeight}kg</p>
                      {a.forSale && (
                        <p className="text-[9px] font-black text-yellow-700 mt-0.5">✓ Visible to retailers now</p>
                      )}
                    </div>
                    <button
                      onClick={() => onListAnimal(a.id)}
                      className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition ${
                        a.forSale
                          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                          : 'bg-zunde-green text-white hover:bg-green-700'
                      }`}
                    >
                      {a.forSale ? 'Unlist' : 'List for Sale'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* What happens next */}
            {animals.some(a => a.forSale) && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-[10px] font-black text-purple-700 uppercase mb-1">What happens next</p>
                <div className="space-y-1">
                  {['Retailers browse your listing on the Marketplace', 'A retailer places a bid — you receive it via Vet Messenger', 'Vet issues a DVS movement certificate for the sale'].map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-purple-600 font-medium">
                      <span className="w-4 h-4 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Medicine cabinet */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-black text-gray-800">Medicine Cabinet</h3>
              <button onClick={() => setActiveTab('health')} className="text-[10px] font-black text-zunde-green hover:underline uppercase">Manage →</button>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mb-4">Your current medicine stock. Medicines are supplied by registered ZUNDE Suppliers — contact them via Vet Messenger.</p>
            <div className="space-y-3">
              {inventory.map(item => {
                const isLow = item.stock <= item.min;
                const pct   = Math.min(100, (item.stock / 1000) * 100);
                return (
                  <div key={item.id} className={`p-3 rounded-xl ${isLow ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[11px] font-black text-gray-700 truncate">{item.name}</p>
                      {isLow && <span className="text-[9px] font-black text-red-600 animate-pulse">Low — reorder</span>}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium mb-1">
                      <span>{item.stock} {item.unit}</span>
                      <span className="text-gray-300">from {item.supplier}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isLow ? 'bg-red-500' : pct > 50 ? 'bg-zunde-green' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setActiveTab('vet')} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-[10px] font-black text-orange-700 uppercase hover:bg-orange-100 transition">
              <MessageSquare size={12} /> Order from a Supplier
            </button>
          </div>
        </div>

        {/* Right: Recent activity + alerts */}
        <div className="col-span-1 space-y-5">
          {/* Alerts */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-4">Disease Alerts Near You</h3>
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-3.5 rounded-xl border-l-4 ${n.type === 'Critical' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-400'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${n.type === 'Critical' ? 'text-red-500' : 'text-blue-500'}`} />
                    <div>
                      <p className="text-[11px] font-black text-gray-800">{n.title}</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{n.msg}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setActiveTab('disease')} className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 rounded-xl text-[11px] font-black text-gray-500 uppercase hover:bg-gray-100 hover:text-zunde-green transition">
                <Stethoscope size={12} /> Run Diagnostics
              </button>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-4">Recent Health Events</h3>
            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium text-center py-4 italic">No events recorded yet</p>
            ) : (
              <div className="space-y-2.5">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-zunde-green mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-gray-800 truncate">{log.action}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{log.animal} · {log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight trend for first animal */}
          {animals[0]?.weightHistory?.length > 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-800 mb-1">{animals[0].name}'s Weight Trend</h3>
              <p className="text-[10px] text-gray-400 font-medium mb-4">Growth in kg from birth</p>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={animals[0].weightHistory} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#1b5e20" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1b5e20" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" fontSize={9} tick={{ fill: '#bbb' }} tickLine={false} axisLine={false} />
                    <YAxis fontSize={9} tick={{ fill: '#bbb' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: 11 }} formatter={v => [`${v}kg`, 'Weight']} />
                    <Area type="monotone" dataKey="weight" stroke="#1b5e20" fill="url(#wt)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stakeholder map — full width at bottom */}
      <StakeholderMap />
    </div>
  );
};

// ── VETERINARIAN DASHBOARD ─────────────────────────────────────────────────
const VeterinarianDashboard = ({ animals, notifications, setActiveTab, currentUser }) => {
  const FARMS = [
    { name: 'Kumar Farms',       animals: 24, status: 'Verified', province: 'Mashonaland West', alert: false },
    { name: 'Moyo Livestock',    animals: 18, status: 'Verified', province: 'Mashonaland West', alert: true  },
    { name: 'ZimAgro Enterprise',animals: 45, status: 'Verified', province: 'Mashonaland West', alert: false },
    { name: 'Central Paddock',   animals: 12, status: 'Pending',  province: 'Mashonaland East', alert: false },
  ];

  return (
    <div className="p-6 bg-gray-900 space-y-6 text-left overflow-y-auto h-full">

      {/* Greeting */}
      <div className="bg-zunde-green/20 border border-zunde-green/30 rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-green-400 text-xs font-black uppercase tracking-[3px] mb-1">Authority Dashboard · {currentUser?.province || 'Mashonaland West'}</p>
            <h2 className="text-2xl font-black text-white leading-tight">{greet()}, Dr. {currentUser?.name?.split(' ').pop() || 'Officer'}</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">Provincial veterinary oversight — outbreaks, certifications, and farmer case management</p>
          </div>
          <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-2xl shrink-0 animate-pulse">
            <Globe size={16} />
            <span className="text-xs font-black uppercase tracking-widest">FMD Quarantine Active</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Outbreaks',  value: '1',   sub: 'FMD — Chegutu District',          icon: AlertTriangle, iconColor: 'text-red-500',   accent: 'bg-red-500/10 border-red-500/20',   textColor: 'text-red-400' },
          { label: 'Cert. Queue',       value: '12',  sub: 'Awaiting your sign-off',           icon: FileText,      iconColor: 'text-yellow-400', accent: 'bg-white/5 border-white/10',       textColor: 'text-white'   },
          { label: 'Farms Under Watch', value: '4',   sub: 'Mashonaland West registry',        icon: MapPin,        iconColor: 'text-blue-400',   accent: 'bg-white/5 border-white/10',       textColor: 'text-white'   },
          { label: 'Node Sync',         value: '99%', sub: 'RaMambo mesh network online',      icon: Wifi,          iconColor: 'text-green-400',  accent: 'bg-white/5 border-white/10',       textColor: 'text-white'   },
        ].map(k => (
          <div key={k.label} className={`${k.accent} border rounded-2xl p-5`}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{k.label}</p>
              <k.icon size={16} className={k.iconColor} />
            </div>
            <p className={`text-3xl font-black ${k.textColor}`}>{k.value}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Outbreak alert */}
        <div className="col-span-1 space-y-5">
          <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-400 animate-pulse" />
              <h3 className="text-sm font-black text-red-300">Active Outbreak</h3>
            </div>
            <h4 className="text-lg font-black text-white mb-1">Foot & Mouth Disease</h4>
            <p className="text-[11px] text-gray-400 font-medium mb-4">Confirmed in Chegutu District, Mashonaland West. Movement ban in effect.</p>
            <div className="space-y-2 text-[11px]">
              {[
                { k: 'Status',         v: 'CRITICAL — Active' },
                { k: 'Affected farms', v: '3 confirmed' },
                { k: 'Animals at risk',v: '~200 cattle' },
                { k: 'Restriction',    v: 'No livestock movement' },
              ].map(r => (
                <div key={r.k} className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-gray-500 font-bold">{r.k}</span>
                  <span className="text-gray-300 font-black">{r.v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab('vet')} className="mt-4 w-full py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-2">
              <PhoneCall size={13} /> Issue Emergency Advisory
            </button>
          </div>

          {/* Quick actions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: MessageSquare, label: 'Open Vet Messenger', desc: 'Chat with farmers', tab: 'vet',     color: 'bg-zunde-green'  },
                { icon: Stethoscope,  label: 'Run Diagnostics',    desc: 'AI disease checker', tab: 'disease', color: 'bg-purple-600'   },
                { icon: ShieldCheck,  label: 'Issue Certificate',  desc: 'Sign off a case',    tab: 'vet',     color: 'bg-blue-600'     },
              ].map(a => (
                <button key={a.label} onClick={() => setActiveTab(a.tab)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-zunde-green hover:bg-white/5 transition text-left">
                  <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center shrink-0`}><a.icon size={14} className="text-white" /></div>
                  <div><p className="text-[11px] font-black text-white">{a.label}</p><p className="text-[10px] text-gray-500 font-medium">{a.desc}</p></div>
                  <ArrowRight size={12} className="text-gray-600 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Farm registry */}
        <div className="col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-black text-white">Farmer Registry — {currentUser?.province || 'Mashonaland West'}</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Farms under your provincial oversight. Click a farm to open a consultation.</p>
              </div>
            </div>
            <div className="space-y-3">
              {FARMS.map((farm, i) => (
                <button key={i} onClick={() => setActiveTab('vet')} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-transparent hover:border-zunde-green transition text-left">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center font-black text-zunde-green text-sm shrink-0">{farm.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-white">{farm.name}</p>
                      {farm.alert && <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase">Alert</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">{farm.province} · {farm.animals} animals</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${farm.status === 'Verified' ? 'bg-zunde-green/20 text-green-400' : 'bg-orange-400/20 text-orange-400'}`}>{farm.status}</span>
                    <MessageSquare size={14} className="text-gray-500 hover:text-zunde-green transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── SUPPLIER DASHBOARD ─────────────────────────────────────────────────────
const SupplierDashboard = ({ inventory, setActiveTab, currentUser }) => {
  const ORDERS = [
    { id: 'ORD-441', farm: 'Moyo Livestock',    item: 'Oxytetracycline (LA)', qty: '200ml', status: 'Dispatched', urgent: false },
    { id: 'ORD-442', farm: 'ZimAgro Enterprise', item: 'FMD Vaccine',           qty: '50 doses', status: 'Pending',    urgent: true  },
    { id: 'ORD-443', farm: 'Kumar Farms',        item: 'Buparvaquone (Butalex)',qty: '100ml',    status: 'Pending',    urgent: true  },
    { id: 'ORD-444', farm: 'Central Paddock',    item: 'Albendazole Drench',    qty: '500ml',    status: 'Delivered',  urgent: false },
  ];
  const DEMAND_DATA = [
    { week: 'W1', orders: 8 }, { week: 'W2', orders: 12 }, { week: 'W3', orders: 9 },
    { week: 'W4', orders: 18 }, { week: 'W5', orders: 14 }, { week: 'W6', orders: 22 },
  ];

  const pending    = ORDERS.filter(o => o.status === 'Pending').length;
  const dispatched = ORDERS.filter(o => o.status === 'Dispatched').length;
  const delivered  = ORDERS.filter(o => o.status === 'Delivered').length;

  return (
    <div className="p-6 bg-gray-50 space-y-6 text-left overflow-y-auto h-full">

      {/* Role explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-500 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)' }} aria-hidden="true" />
          <div className="relative z-10">
            <p className="text-orange-200 text-xs font-black uppercase tracking-[3px] mb-1">{greet()}, Supplier</p>
            <h2 className="text-xl font-black text-white leading-tight">Supply Distribution Hub</h2>
            <p className="text-orange-100/80 text-sm font-medium mt-1">
              {pending} pending · {dispatched} in transit · {delivered} delivered
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Your Role on ZUNDE</p>
          <p className="text-sm font-black text-gray-800 mb-2">You are a veterinary medicine &amp; vaccine distributor</p>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3">
            Farmers across Zimbabwe register on ZUNDE to manage their herd health. When they run low on vaccines or medicines, they contact you through the platform. You fulfill the order and dispatch to the farm.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            <span className="text-lg">🌾</span><span>Farmer runs low on stock</span>
            <ArrowRight size={12} className="text-orange-400 shrink-0" />
            <span className="text-lg">💊</span><span>You fulfill &amp; dispatch</span>
            <ArrowRight size={12} className="text-orange-400 shrink-0" />
            <span className="text-lg">🐄</span><span>Animals stay healthy</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Orders',   value: pending,     sub: 'Need dispatch today',              icon: Clock,       iconColor: 'text-orange-500', accent: pending ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100', textColor: pending ? 'text-orange-600' : 'text-gray-900' },
          { label: 'In Transit',       value: dispatched,  sub: 'On the way to farmers',            icon: Truck,       iconColor: 'text-blue-500',   accent: 'bg-white border-gray-100', textColor: 'text-gray-900' },
          { label: 'Delivered',        value: delivered,   sub: 'Completed this week',              icon: CheckCircle, iconColor: 'text-green-500',  accent: 'bg-white border-gray-100', textColor: 'text-gray-900' },
          { label: 'Fulfillment Rate', value: '92%',       sub: 'Monthly on-time delivery',         icon: Target,      iconColor: 'text-purple-500', accent: 'bg-white border-gray-100', textColor: 'text-gray-900' },
        ].map(k => (
          <div key={k.label} className={`${k.accent} border rounded-2xl p-5`}>
            <div className="flex justify-between items-start mb-2"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{k.label}</p><k.icon size={16} className={k.iconColor} /></div>
            <p className={`text-3xl font-black ${k.textColor}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Orders list */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-black text-gray-800">Active Orders</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Incoming requests from farms across Zimbabwe</p>
              </div>
            </div>
            <div className="space-y-3">
              {ORDERS.map(o => (
                <div key={o.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${o.urgent && o.status === 'Pending' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Package size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-black text-gray-800">{o.farm}</p>
                      {o.urgent && o.status === 'Pending' && <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase">Urgent</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">{o.item} · {o.qty} · Order {o.id}</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase shrink-0 ${
                    o.status === 'Pending'    ? 'bg-orange-100 text-orange-700' :
                    o.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: demand chart + stock */}
        <div className="col-span-1 space-y-5">
          {/* Demand chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-1">Order Demand (6 Weeks)</h3>
            <p className="text-[11px] text-gray-400 font-medium mb-4">Volume is up 22% this week — stock accordingly</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMAND_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" fontSize={9} tick={{ fill: '#bbb' }} tickLine={false} axisLine={false} />
                  <YAxis fontSize={9} tick={{ fill: '#bbb' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: 11 }} formatter={v => [v, 'Orders']} />
                  <Area type="monotone" dataKey="orders" stroke="#f97316" fill="url(#dg)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demand insight */}
          <div className="bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
            <Truck className="absolute -bottom-4 -right-4 w-28 h-28 opacity-10 text-orange-400" aria-hidden="true" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-orange-400" /><p className="text-[11px] font-black text-orange-400 uppercase tracking-wide">Demand Spike</p></div>
              <p className="text-white text-sm font-black mb-1">Mashonaland Central</p>
              <p className="text-gray-400 text-[11px] font-medium leading-relaxed">14% increase in vaccine requirements this week. Consider pre-positioning Buparvaquone for January Disease season.</p>
            </div>
          </div>

          {/* Contact a farmer */}
          <button onClick={() => setActiveTab('vet')} className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-400 transition text-left group">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0"><MessageSquare size={16} className="text-white" /></div>
            <div><p className="text-xs font-black text-gray-800">Message a Farmer</p><p className="text-[10px] text-gray-400 font-medium">Coordinate delivery or substitutions</p></div>
            <ArrowRight size={13} className="text-gray-300 group-hover:text-orange-500 transition ml-auto" />
          </button>
        </div>
      </div>

      <StakeholderMap />
    </div>
  );
};

// ── RETAILER DASHBOARD ─────────────────────────────────────────────────────
const RetailerDashboard = ({ animals, setActiveTab, currentUser }) => {
  const listings = animals.filter(a => a.forSale);
  const PRICE_DATA = [
    { month: 'Jan', price: 480 }, { month: 'Feb', price: 510 }, { month: 'Mar', price: 495 },
    { month: 'Apr', price: 540 }, { month: 'May', price: 565 }, { month: 'Jun', price: 590 },
  ];
  const RECENT_BIDS = [
    { animal: 'Thunder', bidder: 'ZimAgro Ltd', amount: 620, time: '2h ago' },
    { animal: 'Bessie',  bidder: 'Farm Direct', amount: 850, time: '5h ago' },
  ];

  return (
    <div className="p-6 bg-gray-50 space-y-6 text-left overflow-y-auto h-full">

      {/* Role explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-700 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)' }} aria-hidden="true" />
          <div className="relative z-10">
            <p className="text-purple-300 text-xs font-black uppercase tracking-[3px] mb-1">{greet()}, Retailer</p>
            <h2 className="text-xl font-black text-white leading-tight">Livestock Marketplace</h2>
            <p className="text-purple-200/80 text-sm font-medium mt-1">
              {listings.length} active listing{listings.length !== 1 ? 's' : ''} · Market sentiment: Bullish
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Your Role on ZUNDE</p>
          <p className="text-sm font-black text-gray-800 mb-2">You are a livestock buyer &amp; trader</p>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3">
            Farmers list their animals for sale on ZUNDE. You browse verified listings — each animal comes with a certified Health Passport. You place a bid, the farmer accepts, and a DVS Vet issues an official movement certificate so you can legally transport the animal.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 flex-wrap">
            <span className="text-lg">🌾</span><span>Farmer lists</span>
            <ArrowRight size={12} className="text-purple-400 shrink-0" />
            <span className="text-lg">🏪</span><span>You bid</span>
            <ArrowRight size={12} className="text-purple-400 shrink-0" />
            <span className="text-lg">🩺</span><span>Vet certifies</span>
            <ArrowRight size={12} className="text-purple-400 shrink-0" />
            <span className="text-lg">✅</span><span>Sale complete</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Listings',    value: listings.length,                           sub: 'Verified with health passports',   icon: Tag,        iconColor: 'text-purple-500' },
          { label: 'Avg. Price / Unit',  value: listings.length ? `$${Math.round(listings.reduce((a, l) => a + 500 + l.currentWeight * 1.5, 0) / listings.length).toLocaleString()}` : '$—', sub: 'Estimated market value',          icon: DollarSign, iconColor: 'text-green-500'  },
          { label: 'Total Listing Value',value: `$${listings.reduce((a, l) => a + 500 + l.currentWeight * 1.5, 0).toLocaleString()}`, sub: 'Combined herd value on market', icon: TrendingUp, iconColor: 'text-blue-500'   },
          { label: 'Market Sentiment',   value: 'BULLISH',                                 sub: 'Prices trending upward +10%',      icon: Activity,   iconColor: 'text-yellow-500', textColor: 'text-purple-600', accent: 'bg-purple-50 border-purple-200' },
        ].map(k => (
          <div key={k.label} className={`${k.accent || 'bg-white border-gray-100'} border rounded-2xl p-5`}>
            <div className="flex justify-between items-start mb-2"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{k.label}</p><k.icon size={16} className={k.iconColor} /></div>
            <p className={`text-2xl font-black leading-none ${k.textColor || 'text-gray-900'}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Listings */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-black text-gray-800">Verified Marketplace Listings</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">All animals have a certified ZUNDE Health Passport — safe to bid</p>
              </div>
              <button onClick={() => setActiveTab('profile')} className="text-[10px] font-black text-purple-600 hover:underline uppercase">View All →</button>
            </div>
            {listings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                <ShoppingCart size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-black text-gray-400">No listings yet</p>
                <p className="text-[11px] text-gray-400 font-medium mt-1">Farmers can list animals from their Herd Registry</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(a => (
                  <button key={a.id} onClick={() => setActiveTab('profile')} className="w-full flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:shadow-md transition group text-left">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 shrink-0 relative">
                      <img src={a.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" alt={a.name} />
                      <div className="absolute top-2 left-2 bg-yellow-400 text-[8px] font-black text-gray-900 px-1.5 py-0.5 rounded-full uppercase">Certified</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-gray-900">{a.name}</h4>
                        <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">For Sale</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">{a.breed} · {a.species} · {a.age} · {a.currentWeight}kg</p>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-purple-600" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide">Verified Health Passport · Tag #{a.tagId}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Value</p>
                      <p className="text-xl font-black text-purple-700">${(500 + a.currentWeight * 1.5).toLocaleString()}</p>
                      <button className="mt-2 px-4 py-1.5 bg-purple-600 text-white text-[10px] font-black rounded-lg uppercase hover:bg-purple-700 transition">Bid</button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price trend chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-1">Cattle Price Trend (USD / head)</h3>
            <p className="text-[11px] text-gray-400 font-medium mb-4">Market pricing for Mashonaland West verified livestock, last 6 months</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRICE_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" fontSize={9} tick={{ fill: '#bbb' }} tickLine={false} axisLine={false} />
                  <YAxis fontSize={9} tick={{ fill: '#bbb' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: 11 }} formatter={v => [`$${v}`, 'Price/head']} />
                  <Area type="monotone" dataKey="price" stroke="#7c3aed" fill="url(#pg)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: recent bids + tips */}
        <div className="col-span-1 space-y-5">
          {/* Recent bids */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-4">Recent Bids</h3>
            {RECENT_BIDS.length === 0 ? (
              <p className="text-xs text-gray-400 italic font-medium text-center py-4">No bids placed yet</p>
            ) : (
              <div className="space-y-3">
                {RECENT_BIDS.map((b, i) => (
                  <div key={i} className="p-3.5 bg-purple-50 border border-purple-100 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-black text-gray-800">{b.animal}</p>
                      <p className="text-sm font-black text-purple-700">${b.amount}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">{b.bidder}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{b.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-3">How to Buy</h3>
            <div className="space-y-3">
              {[
                { n: '1', t: 'Browse Listings', d: 'All animals carry a certified ZUNDE Health Passport' },
                { n: '2', t: 'Check the Passport', d: 'View vaccination history and breed details before bidding' },
                { n: '3', t: 'Place a Bid', d: 'Your offer goes directly to the farmer via the platform' },
                { n: '4', t: 'Receive Certificate', d: 'DVS movement permit issued on confirmed sale' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">{s.n}</div>
                  <div>
                    <p className="text-[11px] font-black text-gray-800">{s.t}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact seller */}
          <button onClick={() => setActiveTab('vet')} className="w-full flex items-center gap-3 p-4 bg-purple-600 rounded-2xl text-left hover:bg-purple-700 transition group">
            <MessageSquare size={16} className="text-white shrink-0" />
            <div><p className="text-xs font-black text-white">Contact a Seller</p><p className="text-[10px] text-purple-200 font-medium">Message the farmer directly</p></div>
            <ArrowRight size={13} className="text-purple-300 ml-auto" />
          </button>
        </div>
      </div>

      <StakeholderMap />
    </div>
  );
};

// ── NAV config ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = {
  Farmer: [
    {
      section: 'Overview',
      items: [
        { tab: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard',     desc: 'Your farm at a glance' },
      ]
    },
    {
      section: 'Herd Management',
      items: [
        { tab: 'profile',     icon: Users,           label: 'Herd Registry', desc: 'Animal records & passports' },
        { tab: 'health',      icon: HeartPulse,      label: 'Lifecycle',     desc: 'Vaccines & health protocols' },
        { tab: 'disease',     icon: Stethoscope,     label: 'Diagnostics',   desc: 'AI disease checker' },
        { tab: 'feed',        icon: Wheat,           label: 'Feed Analyzer', desc: 'Livestock nutrition database' },
      ]
    },
    {
      section: 'Trade & Market',
      items: [
        { tab: 'marketplace', icon: Store,           label: 'Marketplace',   desc: 'Buy & sell livestock, feed, produce' },
        { tab: 'vet',         icon: MessageSquare,   label: 'Vet Messenger', desc: 'Chat with a licensed vet' },
      ]
    },
    {
      section: 'Monitoring',
      items: [
        { tab: 'iot',         icon: Radio,           label: 'IoT Monitor',   desc: 'Live ear tag sensor data' },
      ]
    },
  ],
  Veterinarian: [
    {
      section: 'Overview',
      items: [
        { tab: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard',     desc: 'Provincial health overview' },
      ]
    },
    {
      section: 'Clinical Tools',
      items: [
        { tab: 'profile',     icon: Users,           label: 'Herd Registry', desc: 'Animal identity & records' },
        { tab: 'health',      icon: HeartPulse,      label: 'Lifecycle',     desc: 'Vaccination & protocols' },
        { tab: 'disease',     icon: Stethoscope,     label: 'Diagnostics',   desc: 'Disease identification AI' },
        { tab: 'feed',        icon: Wheat,           label: 'Feed Analyzer', desc: 'Nutritional advice for farmers' },
      ]
    },
    {
      section: 'Authority',
      items: [
        { tab: 'vet',         icon: MessageSquare,   label: 'Case Manager',  desc: 'Farmer consultations & certs' },
        { tab: 'marketplace', icon: Store,           label: 'Marketplace',   desc: 'Monitor trade & listings' },
      ]
    },
    {
      section: 'Surveillance',
      items: [
        { tab: 'iot',         icon: Radio,           label: 'IoT Stream',    desc: 'Live herd health sensors' },
      ]
    },
  ],
  Supplier: [
    {
      section: 'Overview',
      items: [
        { tab: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard',     desc: 'Orders & fulfillment summary' },
      ]
    },
    {
      section: 'Operations',
      items: [
        { tab: 'marketplace', icon: Store,           label: 'Marketplace',   desc: 'List medicines, feed & equipment' },
        { tab: 'feed',        icon: Wheat,           label: 'Feed Database', desc: 'Nutritional specs for your products' },
        { tab: 'health',      icon: Package,         label: 'Supply Chain',  desc: 'Inventory & order management' },
        { tab: 'vet',         icon: MessageSquare,   label: 'Farmer Comms',  desc: 'Message farms you supply' },
      ]
    },
  ],
  Retailer: [
    {
      section: 'Overview',
      items: [
        { tab: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard',     desc: 'Market overview & your bids' },
      ]
    },
    {
      section: 'Buy & Trade',
      items: [
        { tab: 'marketplace', icon: Store,           label: 'Marketplace',   desc: 'Browse all livestock & produce' },
        { tab: 'profile',     icon: ShoppingCart,    label: 'Verified Stock', desc: 'Animals with health passports' },
        { tab: 'feed',        icon: Wheat,           label: 'Feed Analyzer', desc: 'Check nutrition before purchasing' },
      ]
    },
    {
      section: 'Connect',
      items: [
        { tab: 'vet',         icon: MessageSquare,   label: 'Contact Sellers', desc: 'Message farmers & suppliers' },
      ]
    },
  ],
};

const ROLE_ACCENT = {
  Farmer:      'bg-zunde-green',
  Veterinarian:'bg-gray-900',
  Supplier:    'bg-orange-600',
  Retailer:    'bg-purple-700',
};
const ROLE_ACTIVE_BG = {
  Farmer:      'bg-white/10',
  Veterinarian:'bg-white/10',
  Supplier:    'bg-white/15',
  Retailer:    'bg-white/10',
};

// ── APP ────────────────────────────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [animals,     setAnimals]     = useState(INITIAL_ANIMALS);
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [auditLog,    setAuditLog]    = useState(INITIAL_LOGS);
  const [inventory,   setInventory]   = useState(INITIAL_INVENTORY);
  const [notifications] = useState([
    { id: 1, title: 'January Disease Alert', msg: 'Chegutu Area — increased tick counts detected.', type: 'Critical', time: '1h ago' },
    { id: 2, title: 'Vaccine Recall',         msg: 'Lot #992 Oxytetracycline recalled by supplier.',  type: 'Info',     time: '4h ago' },
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const addAnimal = (newAnimal) => {
    const images = {
      Cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
      Goat:   'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
      Sheep:  'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800',
      Pig:    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    };
    const imageUrl     = images[newAnimal.species] || images.Cattle;
    const weightHistory = [{ month: 'Initial', weight: parseFloat(newAnimal.birthWeight) || 0 }];
    setAnimals(prev => [{ ...newAnimal, imageUrl, weightHistory, costToDate: 50, forSale: false }, ...prev]);
    setActiveTab('profile');
  };

  const addAuditLog    = (entry)    => setAuditLog(prev => [entry, ...prev]);
  const handleListAnimal = (id)     => setAnimals(prev => prev.map(a => a.id === id ? { ...a, forSale: !a.forSale } : a));

  if (!currentUser) return <AuthPortal onLogin={(user) => setCurrentUser(user)} />;

  const role        = currentUser.role;
  const navSections = NAV_SECTIONS[role] || NAV_SECTIONS.Farmer;
  const sidebarBg   = ROLE_ACCENT[role]  || 'bg-zunde-green';
  const activeBg    = ROLE_ACTIVE_BG[role] || 'bg-white/10';

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`w-64 flex flex-col shrink-0 ${sidebarBg} text-white relative z-20`}>

        {/* Logo */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-zunde-green font-black text-2xl shadow-lg shrink-0">R</div>
          <div>
            <span className="text-base font-black tracking-tighter block leading-none">ZUNDE</span>
            <span className="text-[9px] font-black text-yellow-400 uppercase tracking-[2px]">RaMambo</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 overflow-y-auto pb-4 space-y-5 mt-2">
          {navSections.map(sec => (
            <div key={sec.section}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[2px] px-2 mb-1.5">{sec.section}</p>
              <div className="space-y-0.5">
                {sec.items.map(item => {
                  const isActive = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${isActive ? `${activeBg} text-white` : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                    >
                      <item.icon size={16} className={isActive ? 'text-yellow-400' : ''} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black leading-none ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                        <p className={`text-[10px] font-medium leading-none mt-0.5 ${isActive ? 'text-white/60' : 'text-white/25'}`}>{item.desc}</p>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 pb-5 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shrink-0">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white leading-none truncate">{currentUser.name}</p>
              <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest leading-none mt-0.5">{role}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-red-600/20 transition text-[10px] font-black uppercase tracking-widest"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">

        {/* Notification bell */}
        <div className="absolute top-4 right-5 z-30">
          <div className="relative">
            <button
              className={`p-2.5 rounded-xl transition-all ${isNotifOpen ? `${sidebarBg} text-white shadow-lg` : 'bg-white text-gray-400 shadow-sm hover:text-gray-700 border border-gray-100'}`}
              onClick={() => setIsNotifOpen(p => !p)}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {notifications.length > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
            </button>
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 text-left z-40 animate-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Notifications</p>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-xs font-black text-gray-800">{n.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{n.msg}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab content */}
        <div className={`flex-1 ${activeTab === 'vet' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {activeTab === 'dashboard' && (
            <ErrorBoundary>
              {role === 'Farmer'       && <FarmerDashboard      animals={animals} auditLog={auditLog} inventory={inventory} notifications={notifications} setActiveTab={setActiveTab} onListAnimal={handleListAnimal} />}
              {role === 'Veterinarian' && <VeterinarianDashboard animals={animals} notifications={notifications} setActiveTab={setActiveTab} currentUser={currentUser} />}
              {role === 'Supplier'     && <SupplierDashboard     inventory={inventory} setActiveTab={setActiveTab} currentUser={currentUser} />}
              {role === 'Retailer'     && <RetailerDashboard     animals={animals} setActiveTab={setActiveTab} currentUser={currentUser} />}
            </ErrorBoundary>
          )}
          {activeTab === 'profile'     && <ErrorBoundary><AnimalProfile animals={animals} onAddAnimal={addAnimal} auditLog={auditLog} currentUser={currentUser} onListAnimal={handleListAnimal} /></ErrorBoundary>}
          {activeTab === 'health'      && <ErrorBoundary><HealthManagement animals={animals} completedTasks={completedTasks} setCompletedTasks={setCompletedTasks} auditLog={auditLog} setAuditLog={setAuditLog} inventory={inventory} setInventory={setInventory} /></ErrorBoundary>}
          {activeTab === 'disease'     && <ErrorBoundary><DiseaseDetection animals={animals} onAddAuditLog={addAuditLog} /></ErrorBoundary>}
          {activeTab === 'vet'         && <ErrorBoundary><VetCommunication animals={animals} currentUser={currentUser} /></ErrorBoundary>}
          {activeTab === 'iot'         && <ErrorBoundary><HardwareSimulation animals={animals} /></ErrorBoundary>}
          {activeTab === 'marketplace' && <ErrorBoundary><Marketplace currentUser={currentUser} animals={animals} onListAnimal={handleListAnimal} /></ErrorBoundary>}
          {activeTab === 'feed'        && <ErrorBoundary><FeedAnalyzer /></ErrorBoundary>}
        </div>

        <JindaRaMambo setActiveTab={setActiveTab} animals={animals} />
      </main>
    </div>
  );
}

export default App;

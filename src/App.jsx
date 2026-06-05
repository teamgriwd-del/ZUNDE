import React, { useState, useEffect } from 'react';
import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection';
import AnimalProfile from './components/AnimalProfile/AnimalProfile';
import HealthManagement from './components/HealthManagement/HealthManagement';
import VetCommunication from './components/VetCommunication/VetCommunication';
import HardwareSimulation from './components/HardwareSimulation/HardwareSimulation';
import JindaRaMambo from './components/IntelAI/ZundeIntelAI';
import AuthPortal from './components/IntelAI/AuthPortal';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  LayoutDashboard, Users, HeartPulse, Stethoscope, MessageSquare, Radio, 
  Search, Bell, LogOut, ShieldCheck, ChevronRight, TrendingUp, Package, ShoppingCart, Activity, FileCheck, Truck, BarChart3, Globe, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

// --- SAMPLE DATA ---
const INITIAL_ANIMALS = [
  {
    id: 101, name: "Bessie", species: "Cattle", breed: "Brahman", birthDate: "2023-10-15", age: "2y 4m",
    tagId: "ZIM-882", brandId: "AR-MP", sireId: "S-505", damId: "D-202", birthWeight: 35, currentWeight: 420,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800",
    weightHistory: [{ month: 'Oct', weight: 35 }, { month: 'Dec', weight: 85 }, { month: 'Feb', weight: 150 }, { month: 'Apr', weight: 210 }, { month: 'Jun', weight: 280 }, { month: 'Aug', weight: 350 }, { month: 'Oct', weight: 420 }],
    forSale: false,
    costToDate: 120 // Simulated feed/med cost
  },
  {
    id: 102, name: "Thunder", species: "Cattle", breed: "Angus", birthDate: "2024-05-20", age: "1y 9m",
    tagId: "ZIM-104", brandId: "AR-MP", sireId: "S-900", damId: "D-111", birthWeight: 32, currentWeight: 380,
    imageUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800",
    weightHistory: [{ month: 'May', weight: 32 }, { month: 'Jul', weight: 90 }, { month: 'Sep', weight: 160 }, { month: 'Nov', weight: 240 }, { month: 'Jan', weight: 310 }, { month: 'Mar', weight: 380 }],
    forSale: true,
    costToDate: 95
  }
];

const INITIAL_LOGS = [
  { id: 1, animalId: 101, animal: "Bessie", action: "FMD Vaccine (Annual)", date: "2/15/2026, 10:30 AM" },
  { id: 2, animalId: 103, animal: "Snowy", action: "Diagnostic: Healthy", date: "2/28/2026, 2:15 PM" }
];

const INITIAL_INVENTORY = [
    { id: 1, name: "Oxytetracycline (LA)", stock: 500, unit: "ml", min: 100, supplier: "AgroChem Zim", price: 25 },
    { id: 2, name: "Buparvaquone", stock: 120, unit: "ml", min: 50, supplier: "VetDirect", price: 85 },
    { id: 3, name: "Albendazole", stock: 1000, unit: "ml", min: 200, supplier: "AgroChem Zim", price: 15 }
];

// --- DASHBOARDS ---

const ZundeDashboard = ({ animals, auditLog, setActiveTab, currentUser, inventory, onListAnimal, notifications }) => {
  
  if (currentUser.role === 'Farmer') {
    const totalValue = animals.reduce((acc, a) => acc + 500 + (a.currentWeight * 1.5), 0);
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 text-left animate-in fade-in duration-700">
        <header className="mb-10 flex justify-between items-center">
            <div><h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Farmer Hub</h2><p className="text-zunde-green font-black uppercase tracking-widest text-[10px] mt-1">{currentUser.org} • {currentUser.province}</p></div>
            <div className="flex space-x-3">
                <div className="bg-white px-4 py-3 rounded-2xl flex items-center space-x-2 border border-gray-100 shadow-sm">
                    <RefreshCw size={14} className="text-zunde-green animate-spin-slow" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cloud Sync Active</span>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="p-8 bg-zunde-green text-white rounded-[40px] shadow-xl"><label className="text-[9px] font-black uppercase opacity-60">Total Assets</label><div className="text-5xl font-black">{animals.length}</div></div>
            <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm"><label className="text-[9px] font-black uppercase text-gray-400">Net Value (USD)</label><div className="text-3xl font-black text-gray-800">${totalValue.toLocaleString()}</div></div>
            <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm"><label className="text-[9px] font-black uppercase text-gray-400">Active Alerts</label><div className="text-3xl font-black text-red-600">{notifications.length}</div></div>
            <div className="p-8 bg-blue-600 text-white rounded-[40px] shadow-xl"><label className="text-[9px] font-black uppercase opacity-60">Health Compliance</label><div className="text-3xl font-black">98%</div></div>
        </div>

        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1 bg-white p-10 rounded-[50px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest flex items-center"><Truck size={20} className="mr-3 text-orange-500"/> Supplier Mesh</h3>
                <div className="space-y-4">
                    {inventory.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-orange-500 transition cursor-pointer">
                            <div><strong className="text-gray-800 text-sm font-bold">{item.name}</strong><p className="text-[9px] font-bold text-gray-400 uppercase">{item.supplier}</p></div>
                            <div className="text-right font-black text-orange-500">${item.price}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-span-2 bg-white p-10 rounded-[50px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest flex items-center"><Activity size={20} className="mr-3 text-zunde-green"/> Critical Notifications</h3>
                <div className="space-y-4">
                    {notifications.length === 0 ? <p className="text-gray-300 italic text-center py-10 font-bold uppercase tracking-widest text-xs">No urgent pings</p> : (
                        notifications.map(n => (
                            <div key={n.id} className={`p-5 rounded-3xl border-l-8 flex justify-between items-center ${n.type === 'Critical' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                                <div><strong className="text-sm font-black text-gray-800 uppercase">{n.title}</strong><p className="text-xs text-gray-500 font-bold">{n.msg}</p></div>
                                <span className="text-[9px] font-black text-gray-300 uppercase">{n.time}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'Veterinarian') {
      return (
        <div className="flex-1 overflow-y-auto bg-gray-900 p-12 text-left animate-in fade-in duration-700">
            <header className="mb-10 text-white flex justify-between items-center">
                <div><h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Authority Mesh</h2><p className="text-zunde-green font-black uppercase tracking-[4px] text-[10px] mt-1">Provincial Officer • {currentUser.province}</p></div>
                <div className="flex items-center space-x-3 bg-red-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-xl shadow-red-900/20"><Globe size={16}/> <span>Broadcasting Quarantine</span></div>
            </header>
            <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] text-white"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Active Outbreaks</label><div className="text-5xl font-black text-red-500 mt-2">01</div></div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] text-white"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Cert. Queue</label><div className="text-5xl font-black text-zunde-green mt-2">12</div></div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] text-white"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Node Sync</label><div className="text-5xl font-black text-blue-500 mt-2">99%</div></div>
                <div className="p-8 bg-red-600 text-white rounded-[40px] shadow-xl flex flex-col justify-between"><label className="text-[9px] font-black uppercase opacity-60">Chegutu Status</label><div className="text-2xl font-black uppercase">CRITICAL RISK</div></div>
            </div>
            <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] text-white relative overflow-hidden">
                <h3 className="text-lg font-black mb-8 uppercase tracking-widest">Regional Farmer Registry</h3>
                <div className="space-y-3 relative z-10">
                    {['Kumar Farms', 'Moyo Livestock', 'ZimAgro Enterprise', 'Central Paddock'].map((farm, i) => (
                        <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-transparent hover:border-zunde-green transition cursor-pointer" onClick={() => setActiveTab('vet')}>
                            <div className="flex items-center space-x-4"><div className="w-10 h-10 bg-gray-800 rounded-2xl flex items-center justify-center font-black text-zunde-green shadow-sm">{farm[0]}</div><strong className="text-white font-bold">{farm}</strong></div>
                            <div className="flex items-center space-x-4"><span className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">Verified Herd</span><button className="bg-white/10 p-2 rounded-xl text-white hover:bg-zunde-green transition"><MessageSquare size={16}/></button></div>
                        </div>
                    ))}
                </div>
                <BarChart3 className="absolute bottom-[-30px] right-[-30px] w-64 h-64 text-zunde-green/10" />
            </div>
        </div>
      );
  }

  if (currentUser.role === 'Supplier') {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-12 text-left animate-in fade-in duration-700">
          <header className="mb-10"><h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Supply Node Control</h2><p className="text-orange-500 font-black uppercase tracking-widest text-[10px] mt-1">{currentUser.org} • Resource Distribution</p></header>
          <div className="grid grid-cols-2 gap-8">
              <div className="p-10 bg-white border border-gray-100 rounded-[40px] shadow-sm">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center"><Package size={18} className="mr-3 text-orange-500"/> Outbound Orders</h3>
                  <div className="space-y-4">
                      {['Moyo Farms: 200ml Oxy', 'ZimAgro: 50 doses FMD', 'Kumar: 10kg Booster'].map((req, i) => (
                          <div key={i} className="flex justify-between items-center p-5 bg-orange-50 rounded-2xl border border-orange-100 hover:scale-[1.02] transition cursor-pointer">
                              <strong className="text-orange-800 text-sm font-bold">{req.split(':')[0]}</strong>
                              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{req.split(':')[1]}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="p-10 bg-gray-900 text-white rounded-[40px] shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <Truck className="absolute top-[-20px] right-[-20px] w-48 h-48 opacity-10 -rotate-12 text-orange-400" />
                  <div className="relative z-10"><label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Monthly Fulfillment</label><div className="text-6xl font-black mt-2 text-orange-400">92%</div></div>
                  <div className="relative z-10 bg-white/5 p-6 rounded-3xl border border-white/5"><div className="flex items-center space-x-3 text-sm font-black uppercase tracking-widest mb-2"><TrendingUp size={20} className="text-green-400" /> <span>Resource Demand Spike</span></div><p className="text-[10px] text-gray-400 font-bold leading-relaxed">Mashonaland Central showing 14% increase in vaccine requirements this week.</p></div>
              </div>
          </div>
      </div>
    );
  }

  if (currentUser.role === 'Retailer') {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-12 text-left animate-in fade-in duration-700">
          <header className="mb-10 flex justify-between items-center">
              <div><h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Market Mesh</h2><p className="text-purple-600 font-black uppercase tracking-widest text-[10px] mt-1">Verified Trade Hub • {currentUser.org}</p></div>
              <button className="bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-900/20">Bidding Console</button>
          </header>
          <div className="grid grid-cols-3 gap-6 mb-10 text-left">
              <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Listings</label><div className="text-4xl font-black text-purple-600">{animals.filter(a => a.forSale).length}</div></div>
              <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Avg Weight/Unit</label><div className="text-4xl font-black text-zunde-green">380kg</div></div>
              <div className="p-8 bg-purple-600 text-white rounded-[40px] shadow-xl flex flex-col justify-between"><label className="text-[9px] font-black uppercase opacity-60 tracking-widest">Sentiment</label><div className="text-2xl font-black uppercase flex items-center">BULLISH <TrendingUp size={20} className="ml-2"/></div></div>
          </div>
          <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 text-left">
              <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest flex items-center"><ShoppingCart size={24} className="mr-3 text-purple-600"/> Verified Marketplace Units</h3>
              <div className="grid grid-cols-2 gap-8">
                  {animals.filter(a => a.forSale).map(a => (
                      <div key={a.id} className="flex p-6 bg-gray-50 rounded-[40px] border-2 border-transparent hover:border-purple-600 transition group cursor-pointer" onClick={() => setActiveTab('profile')}>
                          <div className="w-40 h-40 rounded-[30px] overflow-hidden bg-gray-200 mr-8 shrink-0 relative shadow-inner">
                              <img src={a.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" alt="stock" />
                              <div className="absolute top-3 left-3 bg-yellow-400 text-zunde-green px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-sm">Certified</div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                              <h4 className="text-xl font-black text-gray-800 leading-none mb-2">{a.name}</h4>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6">{a.breed} • {a.age}</p>
                              <div className="flex items-center space-x-2"><ShieldCheck size={14} className="text-purple-600" /><span className="text-[9px] font-black uppercase text-gray-500 tracking-tighter">Verified Health Passport</span></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    );
  }
  return null;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [animals, setAnimals] = useState(INITIAL_ANIMALS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [auditLog, setAuditLog] = useState(INITIAL_LOGS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'January Disease Alert', msg: 'Chegutu Area showing increased tick counts.', type: 'Critical', time: '1h ago' },
    { id: 2, title: 'Vaccine Recall', msg: 'Lot #992 Oxytetracycline recalled by supplier.', type: 'Info', time: '4h ago' }
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const addAnimal = (newAnimal) => {
    const images = {
        'Cattle': 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
        'Goat': 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
        'Sheep': 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800',
        'Pig': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'
    };
    const imageUrl = images[newAnimal.species] || images['Cattle'];
    const weightHistory = [{ month: 'Initial', weight: parseFloat(newAnimal.birthWeight) || 0 }];
    setAnimals(prev => [{ ...newAnimal, imageUrl, weightHistory, costToDate: 50, forSale: false }, ...prev]);
    setActiveTab('profile');
  };

  const addAuditLog = (logEntry) => {
    setAuditLog(prev => [logEntry, ...prev]);
  };

  const handleListAnimal = (animalId) => {
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, forSale: !a.forSale } : a));
  };

  if (!currentUser) return <AuthPortal onLogin={(user) => setCurrentUser(user)} />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <aside className={`w-72 flex flex-col shrink-0 transition-colors duration-700 ${currentUser.role === 'Veterinarian' ? 'bg-gray-900' : 'bg-zunde-green'} text-white relative z-20`}>
        <div className="p-8 flex items-center space-x-3 text-left">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-zunde-green font-black text-3xl shadow-lg leading-none">R</div>
          <div>
              <span className="text-lg font-black tracking-tighter block leading-none">ZUNDE</span>
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[2px]">RaMambo</span>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 mt-4 text-left">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={18} /> <span>Home Node</span>
          </button>
          
          {['Farmer', 'Veterinarian', 'Retailer'].includes(currentUser.role) && (
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'profile' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Users size={18} /> <span>{currentUser.role === 'Retailer' ? 'Marketplace' : 'Herd Registry'}</span>
              </button>
          )}

          {['Farmer', 'Veterinarian'].includes(currentUser.role) && (
              <>
                <button onClick={() => setActiveTab('health')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'health' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                    <HeartPulse size={18} /> <span>Lifecycle</span>
                </button>
                <button onClick={() => setActiveTab('disease')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'disease' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                    <Stethoscope size={18} /> <span>Diagnostics</span>
                </button>
              </>
          )}

          {currentUser.role === 'Supplier' && (
              <button onClick={() => setActiveTab('health')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'health' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Package size={18} /> <span>Supply Chain</span>
              </button>
          )}

          <button onClick={() => setActiveTab('vet')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'vet' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <MessageSquare size={18} /> <span>{currentUser.role === 'Farmer' ? 'Advisory Mesh' : (currentUser.role === 'Veterinarian' ? 'Authority Portal' : 'Comm Node')}</span>
          </button>

          {['Farmer', 'Veterinarian'].includes(currentUser.role) && (
              <button onClick={() => setActiveTab('iot')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-black text-xs uppercase tracking-widest ${activeTab === 'iot' ? 'bg-white/10 text-yellow-400 shadow-xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Radio size={18} /> <span>IoT Stream</span>
              </button>
          )}
        </nav>

        <div className="p-8 border-t border-white/5 text-left">
          <div className="flex items-center space-x-4 mb-6 p-4 bg-white/5 rounded-[25px]">
            <div className="w-10 h-10 rounded-xl bg-gray-600 overflow-hidden border-2 border-zunde-green shadow-lg"><img src={currentUser.avatar} alt="user" /></div>
            <div className="flex-1 min-w-0"><div className="text-sm font-black leading-none mb-1 truncate">{currentUser.name}</div><div className="text-[9px] text-yellow-400 uppercase font-black tracking-widest">{currentUser.role}</div></div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center space-x-2 py-4 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-red-600/20 transition text-[10px] font-black uppercase tracking-widest">
            <LogOut size={16} /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        <header className="absolute top-8 right-8 z-30 flex items-center space-x-4">
             <div className="relative">
                <button className={`p-3 rounded-2xl transition-all duration-300 ${isNotifOpen ? 'bg-zunde-green text-white shadow-xl' : 'bg-white text-gray-400 shadow-sm hover:text-zunde-green border border-gray-100'}`} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                    <Bell size={20} />
                    {notifications.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                {isNotifOpen && (
                    <div className="absolute top-16 right-0 w-80 bg-white rounded-[35px] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 duration-500 p-6 text-left">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Mesh Notifications</h4>
                        <div className="space-y-4">
                            {notifications.map(n => (
                                <div key={n.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-2xl border-b-4 border-gray-100">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div><strong className="text-xs font-black text-gray-800 uppercase block">{n.title}</strong><p className="text-[10px] text-gray-500 font-bold leading-tight mt-0.5">{n.msg}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
        </header>

        {activeTab === 'dashboard' && <ErrorBoundary><ZundeDashboard animals={animals} auditLog={auditLog} setActiveTab={setActiveTab} currentUser={currentUser} inventory={inventory} onListAnimal={handleListAnimal} notifications={notifications} /></ErrorBoundary>}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'profile' && <ErrorBoundary><AnimalProfile animals={animals} onAddAnimal={addAnimal} auditLog={auditLog} currentUser={currentUser} onListAnimal={handleListAnimal} /></ErrorBoundary>}
          {activeTab === 'health' && <ErrorBoundary><HealthManagement animals={animals} completedTasks={completedTasks} setCompletedTasks={setCompletedTasks} auditLog={auditLog} setAuditLog={setAuditLog} inventory={inventory} setInventory={setInventory} /></ErrorBoundary>}
          {activeTab === 'disease' && <ErrorBoundary><DiseaseDetection animals={animals} onAddAuditLog={addAuditLog} /></ErrorBoundary>}
          {activeTab === 'vet' && <ErrorBoundary><VetCommunication animals={animals} currentUser={currentUser} /></ErrorBoundary>}
          {activeTab === 'iot' && <ErrorBoundary><HardwareSimulation animals={animals} /></ErrorBoundary>}
        </div>
        <JindaRaMambo setActiveTab={setActiveTab} animals={animals} />
      </main>
    </div>
  );
}

export default App;

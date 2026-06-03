import React, { useState } from 'react';
import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection';
import AnimalProfile from './components/AnimalProfile/AnimalProfile';
import HealthManagement from './components/HealthManagement/HealthManagement';
import VetCommunication from './components/VetCommunication/VetCommunication';
import HardwareSimulation from './components/HardwareSimulation/HardwareSimulation';
import JindaRaMambo from './components/IntelAI/ZundeIntelAI';
import { 
  LayoutDashboard, Users, HeartPulse, Stethoscope, MessageSquare, Radio, 
  Search, Bell, LogOut, ShieldCheck, ChevronRight, TrendingUp 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

// --- SAMPLE DATA ---
const INITIAL_ANIMALS = [
  {
    id: 101,
    name: "Bessie",
    species: "Cattle",
    breed: "Brahman",
    birthDate: "2023-10-15",
    age: "2y 4m",
    tagId: "ZIM-882",
    brandId: "AR-MP",
    sireId: "S-505",
    damId: "D-202",
    birthWeight: 35,
    currentWeight: 420,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800",
    weightHistory: [
        { month: 'Oct', weight: 35 }, { month: 'Dec', weight: 85 },
        { month: 'Feb', weight: 150 }, { month: 'Apr', weight: 210 },
        { month: 'Jun', weight: 280 }, { month: 'Aug', weight: 350 },
        { month: 'Oct', weight: 420 }
    ]
  },
  {
    id: 102,
    name: "Thunder",
    species: "Cattle",
    breed: "Angus",
    birthDate: "2024-05-20",
    age: "1y 9m",
    tagId: "ZIM-104",
    brandId: "AR-MP",
    sireId: "S-900",
    damId: "D-111",
    birthWeight: 32,
    currentWeight: 380,
    imageUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800",
    weightHistory: [
        { month: 'May', weight: 32 }, { month: 'Jul', weight: 90 },
        { month: 'Sep', weight: 160 }, { month: 'Nov', weight: 240 },
        { month: 'Jan', weight: 310 }, { month: 'Mar', weight: 380 }
    ]
  },
  {
    id: 103,
    name: "Snowy",
    species: "Goat",
    breed: "Boer",
    birthDate: "2025-01-10",
    age: "1y 1m",
    tagId: "G-445",
    brandId: "AR-MP",
    sireId: "Sire-X",
    damId: "Dam-Y",
    birthWeight: 4,
    currentWeight: 45,
    imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800",
    weightHistory: [
        { month: 'Jan', weight: 4 }, { month: 'Mar', weight: 12 },
        { month: 'May', weight: 22 }, { month: 'Jul', weight: 35 },
        { month: 'Sep', weight: 45 }
    ]
  },
  {
    id: 104,
    name: "Rex",
    species: "Sheep",
    breed: "Dorper",
    birthDate: "2024-11-05",
    age: "1y 3m",
    tagId: "S-009",
    brandId: "AR-MP",
    sireId: "Boss",
    damId: "Queen",
    birthWeight: 5,
    currentWeight: 65,
    imageUrl: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800",
    weightHistory: [
        { month: 'Nov', weight: 5 }, { month: 'Jan', weight: 18 },
        { month: 'Mar', weight: 35 }, { month: 'May', weight: 52 },
        { month: 'Jul', weight: 65 }
    ]
  }
];

const INITIAL_LOGS = [
  { id: 1, animalId: 101, animal: "Bessie", action: "FMD Vaccine (Annual)", date: "2/15/2026, 10:30 AM" },
  { id: 2, animalId: 103, animal: "Snowy", action: "Diagnostic: Healthy", date: "2/28/2026, 2:15 PM" },
  { id: 3, animalId: 101, animal: "Bessie", action: "Weight recorded: 420kg", date: "3/01/2026, 9:00 AM" },
  { id: 4, animalId: 102, animal: "Thunder", action: "Routine Checkup", date: "3/02/2026, 11:45 AM" }
];

const INITIAL_INVENTORY = [
    { id: 1, name: "Oxytetracycline (LA)", stock: 500, unit: "ml", min: 100 },
    { id: 2, name: "Buparvaquone", stock: 120, unit: "ml", min: 50 },
    { id: 3, name: "Albendazole", stock: 1000, unit: "ml", min: 200 },
    { id: 4, name: "FMD Vaccine", stock: 25, unit: "doses", min: 10 }
];

const ZundeDashboard = ({ animals, auditLog, setActiveTab }) => {
  const criticalCount = auditLog.filter(log => log.action.includes('Critical') || log.action.includes('Diagnostic: Suspected')).length;
  const avgHealth = animals.length > 0 ? 88 : 0;

  // Valuation calculation
  const totalValue = animals.reduce((acc, a) => {
      const base = a.species === 'Cattle' ? 500 : 100;
      return acc + base + (a.currentWeight * 1.5);
  }, 0);

  const data = [
    { name: 'Healthy', value: animals.filter(a => !auditLog.some(l => l.animalId === a.id && l.action.includes('Critical'))).length, color: '#1b5e20' },
    { name: 'Warning', value: 1, color: '#fbc02d' },
    { name: 'Critical', value: criticalCount || 0, color: '#d32f2f' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800 text-left">Operational Overview</h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest text-left">ZUNDE RaMambo • Live Intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search herd..." className="pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-zunde-green font-bold text-sm" />
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-zunde-green relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-8 text-left">
        <div className="p-6 bg-gradient-to-br from-zunde-green to-green-700 text-white rounded-2xl shadow-lg transform transition hover:scale-105 cursor-pointer" onClick={() => setActiveTab('profile')}>
          <div className="text-sm font-semibold opacity-80 uppercase mb-1">Royal Herd</div>
          <div className="text-4xl font-black">{animals.length}</div>
          <div className="text-xs mt-2 flex items-center"><ShieldCheck size={12} className="mr-1"/> RaMambo Identity Active</div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:scale-105">
          <div className="text-sm font-semibold text-gray-400 uppercase mb-1">Herd Valuation</div>
          <div className="text-4xl font-black text-zunde-green">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-green-500 mt-2 font-bold uppercase flex items-center">
            <TrendingUp size={12} className="mr-1"/> 14% vs LAST QUARTER
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:scale-105">
          <div className="text-sm font-semibold text-gray-400 uppercase mb-1">Avg Health</div>
          <div className="text-4xl font-black text-blue-600">{avgHealth}%</div>
          <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-zunde-green h-full" style={{width: `${avgHealth}%`}}></div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:scale-105">
          <div className="text-sm font-semibold text-gray-400 uppercase mb-1">Alerts</div>
          <div className="text-4xl font-black text-red-600">{criticalCount}</div>
          <div className="text-xs text-red-400 mt-2 font-bold uppercase animate-pulse">Action Required</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8 text-left">
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-tighter">Herd Condition</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4">
             {data.map(d => (
               <div key={d.name} className="text-center">
                 <div className="text-[10px] font-black text-gray-300 uppercase">{d.name}</div>
                 <div className="text-sm font-black" style={{color: d.color}}>{d.value}</div>
               </div>
             ))}
          </div>
        </div>

        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-700 uppercase tracking-tighter">RaMambo Activity Log</h3>
            <button className="text-zunde-green text-xs font-black flex items-center hover:underline uppercase" onClick={() => setActiveTab('health')}>
              View Full Audit <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {auditLog.length === 0 ? <div className="text-center py-12 text-gray-300 italic">No recent activity</div> : (
              auditLog.slice(0, 4).map(log => (
                <div key={log.id} className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition border border-transparent hover:border-green-100">
                  <div className="w-10 h-10 rounded-xl bg-zunde-green/10 flex items-center justify-center text-zunde-green mr-4 font-black">
                    {log.animal[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-gray-800 text-sm">{log.animal}</div>
                    <div className="text-xs text-gray-400 font-bold">{log.action}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{log.date.split(',')[0]}</div>
                    <div className="text-[10px] text-gray-300 font-bold">{log.date.split(',')[1]}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [animals, setAnimals] = useState(INITIAL_ANIMALS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [auditLog, setAuditLog] = useState(INITIAL_LOGS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);

  const addAnimal = (newAnimal) => {
    const images = {
        'Cattle': 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
        'Goat': 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
        'Sheep': 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800',
        'Pig': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'
    };
    const imageUrl = images[newAnimal.species] || images['Cattle'];
    const weightHistory = [{ month: 'Initial', weight: parseFloat(newAnimal.birthWeight) }];
    setAnimals([{...newAnimal, imageUrl, weightHistory}, ...animals]);
    setActiveTab('profile');
  };

  const addAuditLog = (logEntry) => {
    setAuditLog([logEntry, ...auditLog]);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* FIXED SIDEBAR */}
      <aside className="w-72 bg-zunde-green text-white flex flex-col shrink-0">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-zunde-green font-black text-2xl">R</div>
          <span className="text-xl font-black tracking-tighter text-left">ZUNDE RaMambo</span>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-bold ${activeTab === 'dashboard' ? 'bg-white/10 text-yellow-400 shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-bold ${activeTab === 'profile' ? 'bg-white/10 text-yellow-400 shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={20} /> <span>Herd Profiles</span>
          </button>

          <button 
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-bold ${activeTab === 'health' ? 'bg-white/10 text-yellow-400 shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <HeartPulse size={20} /> <span>Lifecycle</span>
          </button>

          <button 
            onClick={() => setActiveTab('disease')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-bold ${activeTab === 'disease' ? 'bg-white/10 text-yellow-400 shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Stethoscope size={20} /> <span>Diagnostics</span>
          </button>

          <button 
            onClick={() => setActiveTab('vet')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-bold ${activeTab === 'vet' ? 'bg-white/10 text-yellow-400 shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare size={20} /> <span>Advisory</span>
          </button>

          <button 
            onClick={() => setActiveTab('iot')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition font-bold ${activeTab === 'iot' ? 'bg-white/10 text-yellow-400 shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Radio size={20} /> <span>Live IoT Feed</span>
          </button>
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center space-x-3 mb-6 p-3 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gray-600 overflow-hidden border-2 border-zunde-green">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arnold" alt="user" />
            </div>
            <div>
              <div className="text-sm font-black text-left leading-none mb-1">Arnold Mapindu</div>
              <div className="text-[9px] text-yellow-400 uppercase font-black tracking-widest text-left">Admin Farmer</div>
            </div>
          </div>
          <button className="w-full flex items-center justify-center space-x-2 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-red-600/20 hover:border-red-600/20 transition text-sm font-bold uppercase tracking-tighter">
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {activeTab === 'dashboard' && (
          <ZundeDashboard animals={animals} auditLog={auditLog} setActiveTab={setActiveTab} />
        )}
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'profile' && (
            <AnimalProfile animals={animals} onAddAnimal={addAnimal} auditLog={auditLog} />
          )}
          
          {activeTab === 'health' && (
            <HealthManagement 
              animals={animals} 
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
              auditLog={auditLog}
              setAuditLog={setAuditLog}
              inventory={inventory}
              setInventory={setInventory}
            />
          )}
          
          {activeTab === 'disease' && (
            <DiseaseDetection animals={animals} onAddAuditLog={addAuditLog} />
          )}
          
          {activeTab === 'vet' && <VetCommunication animals={animals} />}
          
          {activeTab === 'iot' && <HardwareSimulation />}
        </div>

        <JindaRaMambo setActiveTab={setActiveTab} animals={animals} />
      </main>
    </div>
  );
}

export default App;

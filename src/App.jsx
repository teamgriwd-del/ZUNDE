import React, { useState } from 'react';
import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection';
import AnimalProfile from './components/AnimalProfile/AnimalProfile';
import HealthManagement from './components/HealthManagement/HealthManagement';
import VetCommunication from './components/VetCommunication/VetCommunication';
import HardwareSimulation from './components/HardwareSimulation/HardwareSimulation';
import { 
  LayoutDashboard, Users, HeartPulse, Stethoscope, MessageSquare, Radio, 
  Search, Bell, LogOut, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// --- DESIGN 1: Scoring Dashboard Style ---
const ZundeDashboard = ({ animals, auditLog, setActiveTab }) => {
  const criticalCount = auditLog.filter(log => log.action.includes('Critical') || log.action.includes('Diagnostic')).length;
  const avgHealth = animals.length > 0 ? 82 : 0; // Mock calculation

  // Chart Data
  const data = [
    { name: 'Healthy', value: animals.length || 10, color: '#1b5e20' },
    { name: 'Warning', value: 3, color: '#fbc02d' },
    { name: 'Critical', value: criticalCount || 1, color: '#d32f2f' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Operational Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search herd..." className="pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-zunde-green" />
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-zunde-green">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-br from-zunde-green to-green-700 text-white rounded-2xl shadow-lg transform transition hover:scale-105">
          <div className="text-sm font-semibold opacity-80 uppercase mb-1">Total Herd</div>
          <div className="text-4xl font-black">{animals.length}</div>
          <div className="text-xs mt-2 flex items-center"><ShieldCheck size={12} className="mr-1"/> All Systems Active</div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:scale-105">
          <div className="text-sm font-semibold text-gray-400 uppercase mb-1">Avg Health Score</div>
          <div className="text-4xl font-black text-zunde-green">{avgHealth}%</div>
          <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-zunde-green h-full" style={{width: `${avgHealth}%`}}></div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:scale-105">
          <div className="text-sm font-semibold text-gray-400 uppercase mb-1">Pending Tasks</div>
          <div className="text-4xl font-black text-blue-600">08</div>
          <div className="text-xs text-blue-400 mt-2 font-bold">4 DUE TODAY</div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:scale-105">
          <div className="text-sm font-semibold text-gray-400 uppercase mb-1">Active Alerts</div>
          <div className="text-4xl font-black text-red-600">{criticalCount}</div>
          <div className="text-xs text-red-400 mt-2 font-bold uppercase animate-pulse">Action Required</div>
        </div>
      </div>

      {/* Middle Charts Section */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Herd Status Distribution</h3>
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
                 <div className="text-xs font-bold text-gray-400 uppercase">{d.name}</div>
                 <div className="text-sm font-bold" style={{color: d.color}}>{d.value}</div>
               </div>
             ))}
          </div>
        </div>

        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-700">Recent Herd Activity</h3>
            <button className="text-zunde-green text-sm font-bold flex items-center hover:underline" onClick={() => setActiveTab('health')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {auditLog.length === 0 ? <div className="text-center py-12 text-gray-300 italic">No recent activity</div> : (
              auditLog.slice(0, 4).map(log => (
                <div key={log.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition border border-transparent hover:border-green-100">
                  <div className="w-10 h-10 rounded-full bg-zunde-green/10 flex items-center justify-center text-zunde-green mr-4 font-bold">
                    {log.animal[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{log.animal}</div>
                    <div className="text-sm text-gray-500">{log.action}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-400">{log.date.split(',')[0]}</div>
                    <div className="text-xs text-gray-400">{log.date.split(',')[1]}</div>
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
  const [animals, setAnimals] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const addAnimal = (newAnimal) => {
    setAnimals([...animals, newAnimal]);
    setActiveTab('profile');
  };

  const addAuditLog = (logEntry) => {
    setAuditLog([logEntry, ...auditLog]);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* FIXED SIDEBAR - Design Language from CHANNAB */}
      <aside className="w-72 bg-zunde-green text-white flex flex-col shrink-0">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-zunde-green font-black text-2xl">Z</div>
          <span className="text-2xl font-black tracking-tighter">ZUNDE <small className="text-[10px] font-bold opacity-60 ml-1">PRO</small></span>
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
            <div className="w-10 h-10 rounded-lg bg-gray-600"></div>
            <div>
              <div className="text-sm font-bold">Arnold Mapindu</div>
              <div className="text-[10px] opacity-50 uppercase font-black">Admin Farmer</div>
            </div>
          </div>
          <button className="w-full flex items-center justify-center space-x-2 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-red-600/20 hover:border-red-600/20 transition text-sm font-bold">
            <LogOut size={16} /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
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
            />
          )}
          
          {activeTab === 'disease' && (
            <DiseaseDetection animals={animals} onAddAuditLog={addAuditLog} />
          )}
          
          {activeTab === 'vet' && <VetCommunication animals={animals} />}
          
          {activeTab === 'iot' && <HardwareSimulation />}
        </div>
      </main>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection';
import AnimalProfile from './components/AnimalProfile/AnimalProfile';
import HealthManagement from './components/HealthManagement/HealthManagement';
import VetCommunication from './components/VetCommunication/VetCommunication';
import HardwareSimulation from './components/HardwareSimulation/HardwareSimulation';
import { LayoutDashboard, Users, HeartPulse, Stethoscope, MessageSquare, Radio } from 'lucide-react';
import './App.css';

// Small Dashboard Component for the "Sweep & Beautify" phase
const Dashboard = ({ animals, auditLog, setActiveTab }) => {
  const criticalDiseases = auditLog.filter(log => log.action.includes('Critical') || log.action.includes('Alert'));
  
  return (
    <div className="zunde-dashboard">
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('profile')}>
          <Users size={24} />
          <div className="stat-info">
            <strong>{animals.length}</strong>
            <span>Total Herd</span>
          </div>
        </div>
        <div className="stat-card urgent" onClick={() => setActiveTab('health')}>
          <HeartPulse size={24} />
          <div className="stat-info">
            <strong>{criticalDiseases.length}</strong>
            <span>Active Alerts</span>
          </div>
        </div>
      </div>

      <div className="recent-activity-box">
        <h3>Recent Herd Activity</h3>
        {auditLog.length === 0 ? <p className="hint">No activity recorded yet.</p> : (
          <ul className="activity-list">
            {auditLog.slice(0, 5).map(log => (
              <li key={log.id}>
                <span className="dot"></span>
                <div className="log-detail">
                  <strong>{log.animal}:</strong> {log.action}
                  <small>{log.date}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-btns">
          <button onClick={() => setActiveTab('disease')}>Run Diagnosis</button>
          <button onClick={() => setActiveTab('vet')}>Contact Vet</button>
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
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="logo-text">ZUNDE</h1>
            <span className="badge">PRO</span>
          </div>
          <p>Zimbabwe Enterprise Agri-Health Intelligence</p>
        </div>
      </header>

      <nav className="zunde-nav">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          <Users size={18} /> Profiles
        </button>
        <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}>
          <HeartPulse size={18} /> Health
        </button>
        <button className={activeTab === 'disease' ? 'active' : ''} onClick={() => setActiveTab('disease')}>
          <Stethoscope size={18} /> Diagnostics
        </button>
        <button className={activeTab === 'vet' ? 'active' : ''} onClick={() => setActiveTab('vet')}>
          <MessageSquare size={18} /> Advisory
        </button>
        <button className={activeTab === 'iot' ? 'active' : ''} onClick={() => setActiveTab('iot')}>
          <Radio size={18} /> IoT Feed
        </button>
      </nav>

      <main className="zunde-main">
        {activeTab === 'dashboard' && (
          <Dashboard animals={animals} auditLog={auditLog} setActiveTab={setActiveTab} />
        )}
        
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
      </main>

      <footer>
        <div className="footer-content">
          <p>&copy; 2026 ZUNDE Project - Team GRIWD | Seed Co Innovation Challenge</p>
          <div className="zim-flag">
            <div className="flag-stripe green"></div>
            <div className="flag-stripe yellow"></div>
            <div className="flag-stripe red"></div>
            <div className="flag-stripe black"></div>
            <div className="flag-stripe red"></div>
            <div className="flag-stripe yellow"></div>
            <div className="flag-stripe green"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

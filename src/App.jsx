import React, { useState } from 'react';
import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection';
import AnimalProfile from './components/AnimalProfile/AnimalProfile';
import HealthManagement from './components/HealthManagement/HealthManagement';
import VetCommunication from './components/VetCommunication/VetCommunication';
import HardwareSimulation from './components/HardwareSimulation/HardwareSimulation';
import './App.css';

function App() {
  const [animals, setAnimals] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Lifted state for cross-module data sharing
  const [completedTasks, setCompletedTasks] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const addAnimal = (newAnimal) => {
    setAnimals([...animals, newAnimal]);
    setActiveTab('profile'); // Keep on profile to see the new card
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ZUNDE</h1>
        <p>Empowering Farmers with Health Intelligence</p>
      </header>

      <nav className="zunde-nav">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profiles</button>
        <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}>Health</button>
        <button className={activeTab === 'disease' ? 'active' : ''} onClick={() => setActiveTab('disease')}>Symptom Checker</button>
        <button className={activeTab === 'vet' ? 'active' : ''} onClick={() => setActiveTab('vet')}>Vet Chat</button>
        <button className={activeTab === 'iot' ? 'active' : ''} onClick={() => setActiveTab('iot')}>IoT Feed</button>
      </nav>

      <main className="zunde-main">
        {activeTab === 'profile' && (
          <AnimalProfile 
            animals={animals} 
            onAddAnimal={addAnimal} 
            auditLog={auditLog}
          />
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
        
        {activeTab === 'disease' && <DiseaseDetection />}
        
        {activeTab === 'vet' && <VetCommunication animals={animals} />}
        
        {activeTab === 'iot' && <HardwareSimulation />}
      </main>

      <footer>
        <p>&copy; 2026 ZUNDE Project - Team GRIWD</p>
      </footer>
    </div>
  );
}

export default App;

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

  const addAnimal = (newAnimal) => {
    setAnimals([...animals, newAnimal]);
    setActiveTab('health'); // Switch to health management after adding
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
          <div className="tab-content">
            <AnimalProfile onAddAnimal={addAnimal} />
            <div className="zunde-card animal-list">
              <h3>My Animals</h3>
              {animals.length === 0 ? <p>No animals registered yet.</p> : (
                <ul>
                  {animals.map(a => (
                    <li key={a.id}>
                      <strong>{a.name}</strong> - {a.breed} ({a.species}) | Age: {a.age}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'health' && <HealthManagement animals={animals} />}
        {activeTab === 'disease' && <DiseaseDetection />}
        {activeTab === 'vet' && <VetCommunication />}
        {activeTab === 'iot' && <HardwareSimulation />}
      </main>

      <footer>
        <p>&copy; 2026 ZUNDE Project - Team GRIWD</p>
      </footer>
    </div>
  );
}

export default App;

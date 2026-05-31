import React, { useState } from 'react';
import './HealthManagement.css';

const HealthManagement = ({ animals }) => {
  const [gestationStart, setGestationStart] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState('');

  const calculateGestation = (startDate, species) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const dueDate = new Date(start);
    
    // Average gestation periods (days)
    const periods = {
      'Cattle': 283,
      'Goat': 150,
      'Sheep': 152,
      'Pig': 114
    };
    
    const days = periods[species] || 283;
    dueDate.setDate(start.getDate() + days);
    return dueDate.toDateString();
  };

  const getVaccinationSchedule = (animal) => {
    if (!animal) return [];
    // Mock schedule
    return [
      { task: "FMD Vaccine", date: "Next Month" },
      { task: "Deworming", date: "In 2 Weeks" },
      { task: "Vitamin Booster", date: "Today" }
    ];
  };

  return (
    <div className="zunde-card health-mgmt-module">
      <h3>Health Management</h3>
      
      <div className="module-section">
        <h4>Gestation Tracker</h4>
        <div className="gestation-inputs">
          <select value={selectedAnimal} onChange={(e) => setSelectedAnimal(e.target.value)}>
            <option value="">Select Animal</option>
            {animals.map(a => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
          </select>
          <input type="date" value={gestationStart} onChange={(e) => setGestationStart(e.target.value)} />
        </div>
        {selectedAnimal && gestationStart && (
          <div className="alert-box">
            Estimated Delivery: <strong>{calculateGestation(gestationStart, animals.find(a => a.id == selectedAnimal)?.species)}</strong>
          </div>
        )}
      </div>

      <div className="module-section">
        <h4>Upcoming Tasks</h4>
        <div className="task-list">
          {selectedAnimal ? (
            getVaccinationSchedule(animals.find(a => a.id == selectedAnimal)).map((t, i) => (
              <div key={i} className="task-item">
                <span>{t.task}</span>
                <span className="task-date">{t.date}</span>
              </div>
            ))
          ) : <p>Select an animal to see schedule</p>}
        </div>
      </div>
    </div>
  );
};

export default HealthManagement;

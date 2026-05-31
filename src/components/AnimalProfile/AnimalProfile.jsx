import React, { useState } from 'react';
import './AnimalProfile.css';

const AnimalProfile = ({ animals, onAddAnimal, auditLog }) => {
  const [animal, setAnimal] = useState({
    name: '',
    species: 'Cattle',
    breed: '',
    birthDate: '',
    tagId: '',
    brandId: '',
    sireId: '',
    damId: '',
    birthWeight: '',
    currentWeight: ''
  });

  const [viewHistoryId, setViewHistoryId] = useState(null);

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    return `${years}y ${months}m`;
  };

  const calculateGrowth = (birth, current) => {
    if (!birth || !current) return null;
    const diff = current - birth;
    const percent = (diff / birth) * 100;
    return { diff, percent: percent.toFixed(1) };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const age = calculateAge(animal.birthDate);
    onAddAnimal({ ...animal, id: Date.now(), age });
    setAnimal({ 
      name: '', species: 'Cattle', breed: '', birthDate: '', 
      tagId: '', brandId: '', sireId: '', damId: '', 
      birthWeight: '', currentWeight: '' 
    });
  };

  return (
    <div className="zunde-animal-system enterprise">
      <div className="profile-registration">
        <h3>Enterprise Animal Registration</h3>
        <form onSubmit={handleSubmit} className="enterprise-form">
          <div className="form-section">
            <h4>Basic Info</h4>
            <div className="form-row">
              <input type="text" placeholder="Animal Name" required value={animal.name} onChange={e => setAnimal({...animal, name: e.target.value})} />
              <select value={animal.species} onChange={e => setAnimal({...animal, species: e.target.value})}>
                <option>Cattle</option><option>Goat</option><option>Sheep</option><option>Pig</option>
              </select>
            </div>
            <div className="form-row">
              <input type="text" placeholder="Breed" required value={animal.breed} onChange={e => setAnimal({...animal, breed: e.target.value})} />
              <input type="date" required value={animal.birthDate} onChange={e => setAnimal({...animal, birthDate: e.target.value})} />
            </div>
          </div>

          <div className="form-section">
            <h4>Identity & Lineage (Zim Standard)</h4>
            <div className="form-row">
              <input type="text" placeholder="Ear Tag ID" value={animal.tagId} onChange={e => setAnimal({...animal, tagId: e.target.value})} />
              <input type="text" placeholder="Owner Brand ID" value={animal.brandId} onChange={e => setAnimal({...animal, brandId: e.target.value})} />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Sire (Father) ID" value={animal.sireId} onChange={e => setAnimal({...animal, sireId: e.target.value})} />
              <input type="text" placeholder="Dam (Mother) ID" value={animal.damId} onChange={e => setAnimal({...animal, damId: e.target.value})} />
            </div>
          </div>

          <div className="form-section">
            <h4>Performance Metrics</h4>
            <div className="form-row">
              <input type="number" placeholder="Birth Weight (kg)" value={animal.birthWeight} onChange={e => setAnimal({...animal, birthWeight: e.target.value})} />
              <input type="number" placeholder="Current Weight (kg)" value={animal.currentWeight} onChange={e => setAnimal({...animal, currentWeight: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="register-btn">Register to Herd</button>
        </form>
      </div>

      <div className="animal-grid-section">
        <h3>My Herd (Identity Cards)</h3>
        <div className="animal-grid">
          {animals.length === 0 ? <p className="empty-hint">No animals registered in the enterprise database.</p> : (
            animals.map(a => {
              const growth = calculateGrowth(a.birthWeight, a.currentWeight);
              const history = auditLog.filter(log => log.animalId === a.id);
              
              return (
                <div key={a.id} className="animal-id-card">
                  <div className="card-header">
                    <span className="tag-pill">{a.tagId || 'No Tag'}</span>
                    <span className="species-label">{a.species}</span>
                  </div>
                  
                  <div className="card-body">
                    <div className="main-info">
                      <h4>{a.name}</h4>
                      <p className="breed-text">{a.breed}</p>
                      <p className="age-text">{a.age}</p>
                    </div>

                    <div className="lineage-box">
                      <div className="parent"><span>Sire:</span> <strong>{a.sireId || 'Unknown'}</strong></div>
                      <div className="parent"><span>Dam:</span> <strong>{a.damId || 'Unknown'}</strong></div>
                    </div>

                    <div className="performance-stats">
                      <div className="stat">
                        <label>Weight</label>
                        <strong>{a.currentWeight || '--'} kg</strong>
                      </div>
                      {growth && (
                        <div className="stat">
                          <label>Growth</label>
                          <strong className="positive">+{growth.percent}%</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="history-toggle" onClick={() => setViewHistoryId(viewHistoryId === a.id ? null : a.id)}>
                      {viewHistoryId === a.id ? 'Hide History' : 'View Health History'}
                    </button>
                  </div>

                  {viewHistoryId === a.id && (
                    <div className="card-history-panel">
                      <h5>Recent Health Events</h5>
                      {history.length === 0 ? <p>No events recorded.</p> : (
                        <ul>
                          {history.slice(0, 3).map(h => (
                            <li key={h.id}>
                              <strong>{h.action}</strong>
                              <span>{h.date.split(',')[0]}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalProfile;

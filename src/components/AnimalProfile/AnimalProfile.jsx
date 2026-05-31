import React, { useState } from 'react';
import './AnimalProfile.css';

const AnimalProfile = ({ onAddAnimal }) => {
  const [animal, setAnimal] = useState({
    name: '',
    species: 'Cattle',
    breed: '',
    birthDate: ''
  });

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years}y ${months}m`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const age = calculateAge(animal.birthDate);
    onAddAnimal({ ...animal, id: Date.now(), age });
    setAnimal({ name: '', species: 'Cattle', breed: '', birthDate: '' });
  };

  return (
    <div className="zunde-card animal-profile-module">
      <h3>Animal Profile System</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Animal Name/ID</label>
          <input 
            type="text" 
            value={animal.name} 
            onChange={(e) => setAnimal({...animal, name: e.target.value})} 
            placeholder="e.g. Bessie or Tag #102"
            required 
          />
        </div>
        <div className="form-group">
          <label>Species</label>
          <select value={animal.species} onChange={(e) => setAnimal({...animal, species: e.target.value})}>
            <option>Cattle</option>
            <option>Goat</option>
            <option>Sheep</option>
            <option>Pig</option>
          </select>
        </div>
        <div className="form-group">
          <label>Breed</label>
          <input 
            type="text" 
            value={animal.breed} 
            onChange={(e) => setAnimal({...animal, breed: e.target.value})} 
            placeholder="e.g. Brahman or Boer"
            required 
          />
        </div>
        <div className="form-group">
          <label>Birth Date</label>
          <input 
            type="date" 
            value={animal.birthDate} 
            onChange={(e) => setAnimal({...animal, birthDate: e.target.value})} 
            required 
          />
        </div>
        <button type="submit" className="zunde-btn">Register Animal</button>
      </form>
    </div>
  );
};

export default AnimalProfile;

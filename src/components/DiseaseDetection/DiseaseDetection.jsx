import React, { useState } from 'react';
import { diseaseDatabase } from './diseaseData';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);

  const allSymptoms = [
    "blisters", "lameness", "fever", "loss of appetite", 
    "coughing", "nasal discharge", "lethargy", "sudden death",
    "bloody discharge", "bloating", "skin nodules", "enlarged lymph nodes"
  ];

  const handleCheckboxChange = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setDiagnosis(null);
      return;
    }

    let bestMatch = null;
    let highestMatchCount = 0;

    diseaseDatabase.forEach(disease => {
      const matchCount = disease.symptoms.filter(symp => 
        selectedSymptoms.includes(symp)
      ).length;
      
      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatch = disease;
      }
    });

    if (highestMatchCount >= 2) {
      setDiagnosis(bestMatch);
    } else {
      setDiagnosis({ 
        name: "Inconclusive", 
        prevention: "Monitor the animal closely and utilize the Zunde Vet-Farmer communication module if symptoms worsen." 
      });
    }
  };

  return (
    <div className="zunde-disease-module">
      <h2>Zunde Health: Symptom Checker</h2>
      <p className="description">Select the symptoms observed in the animal for a preliminary diagnosis.</p>
      
      <div className="symptom-selector">
        {allSymptoms.map(symptom => (
          <label key={symptom} className="symptom-label">
            <input 
              type="checkbox" 
              value={symptom} 
              checked={selectedSymptoms.includes(symptom)}
              onChange={() => handleCheckboxChange(symptom)} 
            />
            {symptom.charAt(0).toUpperCase() + symptom.slice(1).replace(/_/g, ' ')}
          </label>
        ))}
      </div>

      <button onClick={analyzeSymptoms} className="analyze-btn">
        Analyze Symptoms
      </button>

      {diagnosis && (
        <div className="results-panel">
          <h3>Diagnosis: {diagnosis.name}</h3>
          <p><strong>Action Plan:</strong> {diagnosis.prevention}</p>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;

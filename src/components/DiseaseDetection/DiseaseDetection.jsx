import React, { useState } from 'react';
import { diseaseDatabase, symptomCategories } from './diseaseData';
import './DiseaseDetection.css';

const DiseaseDetection = ({ animals = [], onAddAuditLog }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [targetAnimalId, setTargetAnimalId] = useState('');

  const handleCheckboxChange = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setDiagnosisResults([]);
      setHasAnalyzed(false);
      return;
    }

    const results = diseaseDatabase.map(disease => {
      let score = 0;
      let maxPossibleScore = 0;

      disease.symptoms.primary.forEach(s => {
        maxPossibleScore += 10;
        if (selectedSymptoms.includes(s)) score += 10;
      });

      disease.symptoms.secondary.forEach(s => {
        maxPossibleScore += 5;
        if (selectedSymptoms.includes(s)) score += 5;
      });

      const confidence = Math.round((score / maxPossibleScore) * 100);
      return { ...disease, confidence };
    })
    .filter(res => res.confidence > 20)
    .sort((a, b) => b.confidence - a.confidence);

    setDiagnosisResults(results);
    setHasAnalyzed(true);
  };

  const saveToHistory = (diseaseName) => {
    if (!targetAnimalId || !onAddAuditLog) return;
    const animal = animals.find(a => a.id == targetAnimalId);
    if (!animal) return;

    onAddAuditLog({
      id: Date.now(),
      animalId: animal.id,
      animal: animal.name,
      action: `Diagnostic: ${diseaseName}`,
      date: new Date().toLocaleString()
    });
    alert(`Diagnosis saved to ${animal.name}'s history!`);
  };

  return (
    <div className="zunde-disease-module enterprise">
      <div className="header-section">
        <h2>Zunde Health: Enterprise Symptom Checker</h2>
        <p className="description">Advanced diagnostic weighting for accurate animal health assessment.</p>
      </div>
      
      <div className="symptom-grid">
        {symptomCategories.map(cat => (
          <div key={cat.name} className="symptom-category">
            <h4>{cat.name}</h4>
            <div className="checkbox-list">
              {cat.symptoms.map(symptom => (
                <label key={symptom} className={`symptom-chip ${selectedSymptoms.includes(symptom) ? 'checked' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleCheckboxChange(symptom)} 
                  />
                  {symptom}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button onClick={analyzeSymptoms} className="analyze-btn-enterprise">
          Run Diagnostic Analysis
        </button>
        <button onClick={() => {setSelectedSymptoms([]); setHasAnalyzed(false);}} className="reset-btn">
          Clear All
        </button>
      </div>

      {hasAnalyzed && diagnosisResults.length > 0 ? (
        <div className="results-container">
          <div className="results-header-box">
            <h3>Analysis Results</h3>
            {animals.length > 0 && (
              <div className="save-selector">
                <label>Target Animal:</label>
                <select value={targetAnimalId} onChange={e => setTargetAnimalId(e.target.value)}>
                  <option value="">Select animal to link...</option>
                  {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
          </div>
          
          {diagnosisResults.map((res, index) => (
            <div key={res.id} className={`result-card ${index === 0 ? 'top-match' : ''}`}>
              <div className="result-header">
                <div className="disease-title">
                  <span className={`severity-badge ${res.severity.toLowerCase()}`}>{res.severity}</span>
                  <h4>{res.name}</h4>
                </div>
                <div className="confidence-meter">
                  <label>Confidence</label>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${res.confidence}%`}}></div>
                  </div>
                  <span>{res.confidence}%</span>
                </div>
              </div>

              {index === 0 && (
                <div className="detailed-plan">
                  <div className="plan-meta">
                    {res.quarantineRequired && <span className="alert-tag">QUARANTINE REQUIRED</span>}
                    <div className="result-actions">
                      {targetAnimalId && <button className="save-btn" onClick={() => saveToHistory(res.name)}>Save to Profile</button>}
                      {res.severity === 'Critical' && <button className="urgent-vet-btn">Contact Vet</button>}
                    </div>
                  </div>
                  <h5>Action Plan:</h5>
                  <ul>
                    {res.actionPlan.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : hasAnalyzed && (
        <div className="no-match">
          <p>No high-confidence matches found. Please refine symptom selection or consult a vet.</p>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;

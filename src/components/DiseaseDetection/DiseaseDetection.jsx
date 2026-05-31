import React, { useState } from 'react';
import { diseaseDatabase, symptomCategories } from './diseaseData';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

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

      // Weighting Logic: Primary (10), Secondary (5)
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
    .filter(res => res.confidence > 20) // Only show relevant matches
    .sort((a, b) => b.confidence - a.confidence);

    setDiagnosisResults(results);
    setHasAnalyzed(true);
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
          <h3>Analysis Results</h3>
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
                    {res.severity === 'Critical' && <button className="urgent-vet-btn">Contact Veterinarian Now</button>}
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

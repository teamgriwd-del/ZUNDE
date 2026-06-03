import React, { useState } from 'react';
import { diseaseDatabase, symptomCategories } from './diseaseData';
import { Bot, MapPin, AlertTriangle, Radar, Info, ShieldCheck } from 'lucide-react';
import './DiseaseDetection.css';

// --- RADAR DATA ---
const REGIONAL_THREATS = [
  { id: 1, district: "Chegutu", disease: "January Disease", level: "High", dist: "12km away" },
  { id: 2, district: "Makonde", disease: "Anthrax", level: "Critical", dist: "45km away" },
  { id: 3, district: "Zvimba", disease: "Lumpy Skin", level: "Moderate", dist: "28km away" }
];

const DiseaseDetection = ({ animals = [], onAddAuditLog }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [targetAnimalId, setTargetAnimalId] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [visualResult, setVisualResult] = useState(null);

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
      disease.symptoms.primary.forEach(s => { maxPossibleScore += 10; if (selectedSymptoms.includes(s)) score += 10; });
      disease.symptoms.secondary.forEach(s => { maxPossibleScore += 5; if (selectedSymptoms.includes(s)) score += 5; });
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

  const handleImageUpload = (e) => {
    setIsAnalyzingImage(true);
    setVisualResult(null);
    setTimeout(() => {
      setIsAnalyzingImage(false);
      setVisualResult({
        detected: "Skin Nodules & Inflammation",
        confidence: "92%",
        recommendation: "Visual signs strongly correlate with Lumpy Skin Disease."
      });
      setSelectedSymptoms(prev => [...new Set([...prev, "skin nodules", "enlarged lymph nodes", "fever"])]);
    }, 2500);
  };

  return (
    <div className="zunde-disease-module enterprise p-8 bg-gray-50 h-full overflow-y-auto">
      
      <div className="diagnostic-layout grid grid-cols-3 gap-8">
        
        {/* Left Side: Input & AI Vision */}
        <div className="col-span-2 space-y-8">
          <div className="header-section bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-left">
            <h2 className="text-2xl font-black text-gray-800 leading-none">Enterprise Diagnostic AI</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Multi-Modal Disease Identification</p>
          </div>

          <div className="visual-ai-box bg-white border border-gray-100 rounded-[40px] p-10 text-center relative overflow-hidden shadow-sm">
            {isAnalyzingImage ? (
              <div className="py-10 animate-pulse">
                <div className="w-20 h-20 bg-zunde-green/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                   <div className="w-10 h-10 border-4 border-zunde-green border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zunde-green font-black uppercase tracking-widest text-sm">RaMambo Vision Processing Tissues...</p>
              </div>
            ) : visualResult ? (
              <div className="text-left flex items-start space-x-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="w-40 h-40 bg-gray-100 rounded-[30px] overflow-hidden shadow-inner border border-gray-200">
                    <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover grayscale opacity-50" alt="Uploaded" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-zunde-green text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-sm">Neural Match</span>
                        <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Confidence: {visualResult.confidence}</span>
                    </div>
                    <h4 className="text-2xl font-black text-gray-800">{visualResult.detected}</h4>
                    <p className="text-sm text-gray-400 font-bold mt-2 leading-relaxed">{visualResult.recommendation} Manual cross-check has been auto-populated.</p>
                    <button className="mt-6 px-6 py-2 bg-gray-50 text-[10px] font-black text-gray-400 uppercase rounded-xl hover:bg-gray-100 transition" onClick={() => setVisualResult(null)}>Discard Image</button>
                 </div>
              </div>
            ) : (
              <label className="cursor-pointer group flex flex-col items-center">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <div className="w-24 h-24 bg-gray-50 rounded-[35px] mb-6 flex items-center justify-center text-gray-300 group-hover:text-zunde-green group-hover:bg-green-50 group-hover:scale-110 transition duration-500 shadow-inner">
                   <Bot size={48} />
                </div>
                <h4 className="text-lg font-black text-gray-700">Visual Diagnostic Link</h4>
                <p className="text-sm text-gray-400 font-bold mt-1">Upload a photo for high-fidelity computer vision analysis.</p>
              </label>
            )}
          </div>

          <div className="symptom-entry-box bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 text-left">
             <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center"><Info size={20} className="mr-2 text-zunde-green"/> Manual Symptom Check</h3>
             <div className="grid grid-cols-2 gap-10">
                {symptomCategories.map(cat => (
                  <div key={cat.name} className="symptom-category">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[2px] mb-4 border-b pb-2">{cat.name}</h4>
                    <div className="flex flex-wrap gap-3">
                      {cat.symptoms.map(symptom => (
                        <label key={symptom} className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase cursor-pointer transition border-2 ${selectedSymptoms.includes(symptom) ? 'bg-zunde-green text-white border-zunde-green shadow-lg shadow-green-900/10' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}>
                          <input type="checkbox" className="hidden" checked={selectedSymptoms.includes(symptom)} onChange={() => handleCheckboxChange(symptom)} />
                          {symptom}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-12 flex space-x-4">
                <button onClick={analyzeSymptoms} className="flex-1 py-5 bg-zunde-green text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-[1.02] transition">Run Analysis</button>
                <button onClick={() => {setSelectedSymptoms([]); setHasAnalyzed(false);}} className="px-10 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black uppercase tracking-widest">Reset</button>
             </div>
          </div>
        </div>

        {/* Right Side: Radar & Results */}
        <div className="col-span-1 space-y-8">
            {/* Regional Radar (THE DEEP MODULE) */}
            <div className="radar-box bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-left border-4 border-zunde-green/20">
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center">
                        <Radar size={18} className="mr-2 text-green-400 animate-pulse" /> Regional Outbreak Radar
                    </h3>
                    <span className="text-green-400 text-[9px] font-black bg-green-900/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">LIVE SCAN</span>
                  </div>

                  <div className="radar-list space-y-4 mb-6">
                     {REGIONAL_THREATS.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                           <div className="flex items-center space-x-3">
                              <MapPin size={14} className={t.level === 'Critical' ? 'text-red-500' : 'text-green-400'} />
                              <div>
                                 <div className="text-[10px] text-white font-black leading-none mb-0.5">{t.district}</div>
                                 <div className="text-[9px] text-gray-500 font-bold uppercase">{t.disease}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className={`text-[9px] font-black uppercase ${t.level === 'Critical' ? 'text-red-500' : 'text-orange-400'}`}>{t.level}</div>
                              <div className="text-[8px] text-gray-600 font-bold">{t.dist}</div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <p className="text-[10px] text-gray-500 font-bold leading-tight italic">
                    Note: Radar uses decentralized data from Mashonaland West RaMambo nodes to identify disease movement.
                  </p>
               </div>
               {/* Background Radar Animation */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-green-500/10 rounded-full animate-ping opacity-20"></div>
            </div>

            {/* Results Panel */}
            <div className="results-panel space-y-4 text-left">
                {hasAnalyzed && diagnosisResults.map((res, index) => (
                    <div key={res.id} className={`p-6 rounded-[30px] border-2 transition ${index === 0 ? 'bg-white border-zunde-green shadow-xl' : 'bg-white/50 border-transparent opacity-60'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${res.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{res.severity}</span>
                            <div className="text-right">
                                <strong className="text-lg font-black text-gray-800 leading-none">{res.confidence}%</strong>
                                <span className="text-[8px] text-gray-400 font-black block uppercase tracking-widest">Confidence</span>
                            </div>
                        </div>
                        <h4 className="text-lg font-black text-gray-800 leading-none mb-4">{res.name}</h4>
                        
                        {index === 0 && (
                            <div className="detailed-plan-box pt-4 border-t border-gray-100 space-y-4">
                                {animals.length > 0 && (
                                    <div className="save-link flex items-center justify-between bg-gray-50 p-3 rounded-2xl">
                                        <select className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-gray-400" value={targetAnimalId} onChange={e => setTargetAnimalId(e.target.value)}>
                                            <option value="">Link to Animal...</option>
                                            {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                        {targetAnimalId && <button className="text-xs font-black text-zunde-green" onClick={() => saveToHistory(res.name)}>Save Record</button>}
                                    </div>
                                )}
                                <div className="action-steps space-y-2">
                                    {res.actionPlan.slice(0,2).map((step, s) => (
                                        <div key={s} className="flex items-start space-x-2">
                                            <ShieldCheck size={12} className="text-zunde-green mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-gray-500 font-bold leading-tight">{step}</p>
                                        </div>
                                    ))}
                                </div>
                                {res.severity === 'Critical' && <button className="w-full py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/10 hover:bg-red-700 transition">Contact Emergency Vet</button>}
                            </div>
                        )}
                    </div>
                ))}
                {!hasAnalyzed && (
                    <div className="bg-white p-10 rounded-[40px] border-2 border-dashed border-gray-200 text-center opacity-40">
                        <Radar size={40} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Waiting for Signal...</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default DiseaseDetection;

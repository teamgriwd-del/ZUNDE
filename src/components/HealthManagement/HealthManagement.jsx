import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HEALTH_PROTOCOLS, BREED_PROFILES } from './healthData';
import { DOSAGE_RATES } from './dosageData';
import {
  Pill, Calculator, AlertCircle, History, ShieldCheck,
  HeartPulse, Package, AlertTriangle, Baby, Info, BookOpen
} from 'lucide-react';
import './HealthManagement.css';

const HealthManagement = ({ animals, completedTasks, setCompletedTasks, auditLog, setAuditLog, inventory, setInventory }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [gestationStart, setGestationStart] = useState('');
  const [selectedMeds, setSelectedMeds] = useState('Oxytetracycline (LA)');
  const [activeInfoTab, setActiveInfoTab] = useState('lifecycle');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); }, []);

  const selectedAnimal = useMemo(
    () => animals.find(a => a.id === parseInt(selectedAnimalId, 10)),
    [animals, selectedAnimalId]
  );

  const showFeedback = (msg, type = 'success') => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackMsg({ msg, type });
    feedbackTimerRef.current = setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const calculateGestation = (startDate, species) => {
    if (!startDate || !species) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;
    const dueDate = new Date(start);
    const period = HEALTH_PROTOCOLS[species]?.gestation || 283;
    dueDate.setDate(start.getDate() + period);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return {
      date: dueDate.toDateString(),
      daysRemaining: diffDays,
      isUrgent: diffDays <= 14 && diffDays > 0,
      isOverdue: diffDays < 0,
      period
    };
  };

  const getLifecycleStats = (animal) => {
    if (!animal?.birthDate) return null;
    const birth = new Date(animal.birthDate);
    if (isNaN(birth.getTime())) return null;
    const weaningDays = HEALTH_PROTOCOLS[animal.species]?.weaningAge || 210;
    const weaningDate = new Date(birth);
    weaningDate.setDate(birth.getDate() + weaningDays);
    const now = new Date();
    const ageInDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const ageYears = Math.floor(ageInDays / 365);
    const ageMonths = Math.floor((ageInDays % 365) / 30);
    return {
      weaningDate: weaningDate.toDateString(),
      isWeaned: now > weaningDate,
      daysUntilWeaning: Math.ceil((weaningDate - now) / (1000 * 60 * 60 * 24)),
      ageDisplay: ageYears > 0 ? `${ageYears}y ${ageMonths}m` : `${ageInDays}d`,
      ageInDays
    };
  };

  const calculateDosage = (medName, weight) => {
    if (!weight || weight <= 0) return '0.0';
    const med = DOSAGE_RATES[medName];
    if (!med) return '0.0';
    const dose = (weight / med.per) * med.rate;
    const capped = med.maxDose ? Math.min(dose, med.maxDose) : dose;
    return capped.toFixed(1);
  };

  const getDynamicSchedule = (animal) => {
    if (!animal?.birthDate) return [];
    const birth = new Date(animal.birthDate);
    if (isNaN(birth.getTime())) return [];
    const protocol = HEALTH_PROTOCOLS[animal.species]?.vaccines || [];
    return protocol.map(v => {
      const dueDate = new Date(birth);
      dueDate.setDate(birth.getDate() + v.age);
      const now = new Date();
      const taskId = `${animal.id}-${v.name}`;
      const isCompleted = completedTasks.includes(taskId);
      const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      const status = isCompleted ? 'Completed' : (now > dueDate ? 'Overdue' : (daysUntil <= 14 ? 'Due Soon' : 'Upcoming'));
      return { ...v, dueDate: dueDate.toDateString(), daysUntil, status, taskId };
    });
  };

  const handleCompleteTask = (taskName, taskId) => {
    if (completedTasks.includes(taskId)) return;
    if (!selectedAnimal) return;
    setCompletedTasks([...completedTasks, taskId]);
    setAuditLog([{
      id: Date.now(),
      animalId: selectedAnimal.id,
      animal: selectedAnimal.name,
      action: taskName,
      date: new Date().toLocaleString()
    }, ...auditLog]);
    showFeedback(`${taskName} marked as completed for ${selectedAnimal.name}.`);
  };

  const deductInventory = () => {
    if (!selectedAnimal?.currentWeight || selectedAnimal.currentWeight <= 0) {
      showFeedback('Animal weight is not recorded. Please update the animal profile.', 'error');
      return;
    }
    const dose = parseFloat(calculateDosage(selectedMeds, selectedAnimal.currentWeight));
    const inventoryItem = inventory.find(item => item.name === selectedMeds);
    if (!inventoryItem) {
      showFeedback(`${selectedMeds} is not in the medicine cabinet.`, 'error');
      return;
    }
    if (inventoryItem.stock < dose) {
      showFeedback(`Insufficient stock. Only ${inventoryItem.stock.toFixed(1)}ml remaining.`, 'error');
      return;
    }
    setInventory(inventory.map(item =>
      item.name === selectedMeds ? { ...item, stock: parseFloat((item.stock - dose).toFixed(1)) } : item
    ));
    setAuditLog([{
      id: Date.now(),
      animalId: selectedAnimal.id,
      animal: selectedAnimal.name,
      action: `Treatment: ${selectedMeds} (${dose}ml administered)`,
      date: new Date().toLocaleString()
    }, ...auditLog]);
    showFeedback(`${dose}ml of ${selectedMeds} administered and deducted from cabinet.`);
  };

  const gestationInfo = calculateGestation(gestationStart, selectedAnimal?.species);
  const lifecycle = getLifecycleStats(selectedAnimal);
  const schedule = getDynamicSchedule(selectedAnimal);
  const currentMedInfo = DOSAGE_RATES[selectedMeds];
  const breedInfo = BREED_PROFILES[selectedAnimal?.species]?.find(b => b.breed === selectedAnimal?.breed);

  const overdueCount = schedule.filter(s => s.status === 'Overdue').length;
  const dueSoonCount = schedule.filter(s => s.status === 'Due Soon').length;

  return (
    <div className="zunde-health-mgmt enterprise p-8 bg-gray-50 h-full overflow-y-auto">

      {/* Header */}
      <div className="health-header flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-800 leading-none">Health & Compliance</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Lifecycle Protocols · Resource Management · Breed Intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedAnimal && overdueCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-100 px-4 py-2 rounded-2xl animate-pulse">
              <AlertTriangle size={14} className="text-red-500" aria-hidden="true" />
              <span className="text-xs font-black text-red-600 uppercase">{overdueCount} Overdue</span>
            </div>
          )}
          {selectedAnimal && dueSoonCount > 0 && (
            <div className="flex items-center space-x-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl">
              <AlertCircle size={14} className="text-orange-500" aria-hidden="true" />
              <span className="text-xs font-black text-orange-600 uppercase">{dueSoonCount} Due Soon</span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <label className="text-xs font-black text-gray-400 uppercase" htmlFor="animal-select">Focus Animal:</label>
            <select
              id="animal-select"
              className="p-3 bg-gray-50 rounded-2xl border-none outline-none font-bold text-sm min-w-[200px]"
              value={selectedAnimalId}
              onChange={e => { setSelectedAnimalId(e.target.value); setGestationStart(''); }}
            >
              <option value="">Select Animal...</option>
              {animals.map(a => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`mb-6 p-4 rounded-2xl text-sm font-black flex items-center space-x-2 ${feedbackMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`} role="alert">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{feedbackMsg.msg}</span>
        </div>
      )}

      {!selectedAnimal ? (
        <div className="dashboard-grid grid grid-cols-3 gap-8">
          <div className="col-span-2 empty-state py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
            <HeartPulse size={48} className="text-gray-200 mb-4" aria-hidden="true" />
            <p className="text-gray-400 font-bold">Select an animal above to view specialized health protocols.</p>
            <p className="text-xs text-gray-300 font-bold mt-2 uppercase tracking-widest">{animals.length} animal{animals.length !== 1 ? 's' : ''} in herd</p>
          </div>
          <InventoryCabinet inventory={inventory} />
        </div>
      ) : (
        <div className="dashboard-grid grid grid-cols-3 gap-8 text-left">

          {/* Reproduction & Lifecycle */}
          <div className="health-card bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex border-b border-gray-100 mb-6">
              {['lifecycle', 'breed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveInfoTab(tab)}
                  className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest transition ${activeInfoTab === tab ? 'text-zunde-green border-b-2 border-zunde-green' : 'text-gray-300'}`}
                >
                  {tab === 'lifecycle' ? <><History size={10} className="inline mr-1" />Lifecycle</> : <><BookOpen size={10} className="inline mr-1" />Breed Info</>}
                </button>
              ))}
            </div>

            {activeInfoTab === 'lifecycle' ? (
              <>
                {lifecycle && (
                  <div className="age-display bg-gray-50 p-4 rounded-2xl mb-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">Current Age</span>
                      <strong className="text-2xl font-black text-gray-800">{lifecycle.ageDisplay}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">Weaning</span>
                      <span className={`text-sm font-black ${lifecycle.isWeaned ? 'text-zunde-green' : 'text-blue-500'}`}>
                        {lifecycle.isWeaned ? 'Complete' : `${lifecycle.daysUntilWeaning}d left`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Weaning Alert */}
                {lifecycle && !lifecycle.isWeaned && lifecycle.daysUntilWeaning <= 14 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex items-start space-x-3">
                    <Baby size={16} className="text-orange-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-black text-orange-700 uppercase">Weaning Alert</p>
                      <p className="text-[11px] text-orange-600 font-bold mt-1">
                        {selectedAnimal.name} is due for weaning in {lifecycle.daysUntilWeaning} days. Prepare separation pen and creep feed.
                      </p>
                    </div>
                  </div>
                )}

                <div className="gestation-tool mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block" htmlFor="gestation-date">Record Mating Date</label>
                  <input
                    id="gestation-date"
                    type="date"
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green"
                    value={gestationStart}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setGestationStart(e.target.value)}
                  />
                  {gestationInfo && (
                    <div className={`mt-4 p-6 rounded-3xl ${gestationInfo.isOverdue ? 'bg-red-50 text-red-700' : gestationInfo.isUrgent ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-zunde-green'}`}>
                      <span className="text-[10px] font-black uppercase block opacity-60 mb-1">
                        {gestationInfo.isOverdue ? 'Overdue — Check Animal' : gestationInfo.isUrgent ? 'Delivery Imminent' : 'Expected Delivery'}
                      </span>
                      <div className="flex justify-between items-center">
                        <strong className="text-base font-black">{gestationInfo.date}</strong>
                        <div className="text-right">
                          <strong className="text-2xl font-black leading-none">{Math.abs(gestationInfo.daysRemaining)}</strong>
                          <span className="text-[10px] font-black uppercase block">{gestationInfo.isOverdue ? 'days over' : 'days left'}</span>
                        </div>
                      </div>
                      <p className="text-[10px] opacity-60 mt-2 font-bold">{selectedAnimal.species} gestation: {gestationInfo.period} days</p>
                    </div>
                  )}
                </div>

                <div className="lifecycle-info space-y-3 pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                    <span>Weaning Age</span>
                    <span className="text-gray-800">{HEALTH_PROTOCOLS[selectedAnimal.species]?.weaningAge} days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                    <span>Gestation Period</span>
                    <span className="text-gray-800">{HEALTH_PROTOCOLS[selectedAnimal.species]?.gestation} days</span>
                  </div>
                  {lifecycle && (
                    <div className={`p-3 rounded-2xl text-center text-xs font-black uppercase tracking-widest ${lifecycle.isWeaned ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {lifecycle.isWeaned ? `${selectedAnimal.name} is Weaned` : `Weaning in ${lifecycle.daysUntilWeaning} days`}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="breed-info space-y-4">
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Breed</span>
                  <strong className="text-lg font-black text-gray-800">{selectedAnimal.breed || 'Not recorded'}</strong>
                </div>
                {breedInfo ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <span className="text-[9px] font-black text-gray-400 uppercase block">Origin</span>
                        <strong className="text-sm font-black text-gray-700">{breedInfo.origin}</strong>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <span className="text-[9px] font-black text-gray-400 uppercase block">Mature Weight</span>
                        <strong className="text-sm font-black text-gray-700">{breedInfo.mature_weight_kg}kg</strong>
                      </div>
                      {breedInfo.heat_tolerance && (
                        <div className="bg-gray-50 p-4 rounded-2xl col-span-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase block">Heat Tolerance</span>
                          <strong className={`text-sm font-black ${breedInfo.heat_tolerance === 'Excellent' ? 'text-zunde-green' : breedInfo.heat_tolerance === 'Moderate' ? 'text-orange-500' : 'text-red-500'}`}>
                            {breedInfo.heat_tolerance}
                          </strong>
                        </div>
                      )}
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                      <div className="flex items-start space-x-2">
                        <Info size={14} className="text-zunde-green mt-0.5 shrink-0" aria-hidden="true" />
                        <p className="text-[11px] font-bold text-green-800 leading-relaxed">{breedInfo.notes}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 font-bold italic">No breed profile found. Update the animal profile with the breed name.</p>
                )}
              </div>
            )}
          </div>

          {/* Medication Intelligence */}
          <div className="health-card bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center">
              <Pill size={18} className="mr-2 text-blue-500" aria-hidden="true" /> Medication Intelligence
            </h3>
            <div className="med-calc-box bg-blue-50/50 p-6 rounded-[30px] border border-blue-100/50">
              <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-3 block" htmlFor="med-select">Select Treatment</label>
              <select
                id="med-select"
                className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none shadow-sm mb-4 text-sm"
                value={selectedMeds}
                onChange={e => setSelectedMeds(e.target.value)}
              >
                {Object.keys(DOSAGE_RATES).map(m => <option key={m}>{m}</option>)}
              </select>

              {currentMedInfo && (
                <div className="bg-white/70 p-3 rounded-xl mb-4 border border-blue-100/30">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mr-2 ${
                    currentMedInfo.category === 'Antibiotic' ? 'bg-blue-100 text-blue-700' :
                    currentMedInfo.category === 'Anti-protozoal' ? 'bg-purple-100 text-purple-700' :
                    currentMedInfo.category === 'NSAID / Pain Relief' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{currentMedInfo.category}</span>
                  <p className="text-[10px] text-blue-900/60 font-bold leading-relaxed mt-2 italic">{currentMedInfo.note}</p>
                  <p className="text-[10px] text-blue-900/40 font-black mt-2 uppercase">Frequency: {currentMedInfo.frequency}</p>
                </div>
              )}

              <div className="dosage-result flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Calculator size={28} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-blue-900/40 uppercase block">Required Dosage</span>
                    <div className="flex items-baseline space-x-1">
                      <strong className="text-3xl font-black text-blue-600">{calculateDosage(selectedMeds, selectedAnimal.currentWeight)}</strong>
                      <span className="text-sm font-black text-blue-600 uppercase">ml</span>
                    </div>
                    {currentMedInfo?.maxDose && parseFloat(calculateDosage(selectedMeds, selectedAnimal.currentWeight)) >= currentMedInfo.maxDose && (
                      <p className="text-[9px] text-orange-600 font-black uppercase mt-1">Capped at max dose</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={deductInventory}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition mb-4"
              >
                Administer & Deduct Stock
              </button>

              <p className="text-[10px] font-bold text-blue-900/60 leading-relaxed bg-white/50 p-4 rounded-2xl italic">
                Calculated for {selectedAnimal.name} · {selectedAnimal.currentWeight}kg body weight
              </p>
            </div>
          </div>

          {/* Medicine Cabinet */}
          <InventoryCabinet inventory={inventory} />

          {/* Vaccination Timeline */}
          <div className="health-card bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-gray-800 flex items-center">
                <ShieldCheck size={18} className="mr-2 text-zunde-green" aria-hidden="true" /> Veterinary Protocol Timeline
              </h3>
              <div className="flex space-x-3 text-[10px] font-black uppercase">
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-zunde-green inline-block" />Completed</span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Overdue</span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Due Soon</span>
              </div>
            </div>
            {schedule.length === 0 ? (
              <p className="text-sm text-gray-400 font-bold">No vaccination protocol available for this species.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {schedule.map((task, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-[30px] border-2 transition flex items-center justify-between ${
                      task.status === 'Completed' ? 'bg-green-50 border-green-100 opacity-70' :
                      task.status === 'Overdue' ? 'bg-red-50 border-red-200' :
                      task.status === 'Due Soon' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                        task.status === 'Completed' ? 'bg-zunde-green text-white' :
                        task.status === 'Overdue' ? 'bg-red-500 text-white' :
                        task.status === 'Due Soon' ? 'bg-orange-400 text-white' :
                        'bg-white text-gray-400'
                      }`}>
                        {task.status === 'Completed' ? <ShieldCheck size={20} aria-hidden="true" /> : i + 1}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-gray-800">{task.name}</span>
                          {task.mandatory && <small className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Required</small>}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{task.dueDate}</span>
                        {task.notes && <span className="text-[10px] text-gray-300 font-bold italic">{task.notes}</span>}
                      </div>
                    </div>
                    <div className="task-action">
                      {task.status === 'Completed' ? (
                        <span className="text-[9px] font-black text-zunde-green uppercase">Done</span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.name, task.taskId)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm hover:scale-105 transition ${
                            task.status === 'Overdue' ? 'bg-red-600 text-white hover:bg-red-700' :
                            task.status === 'Due Soon' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                            'bg-white text-gray-600 hover:bg-zunde-green hover:text-white'
                          }`}
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryCabinet = ({ inventory }) => (
  <div className="col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-left">
    <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center">
      <Package size={18} className="mr-2 text-zunde-green" aria-hidden="true" /> Medicine Cabinet
    </h3>
    <div className="space-y-4">
      {inventory.map(item => {
        const pct = Math.min(100, (item.stock / 1000) * 100);
        return (
          <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black text-gray-700 leading-tight">{item.name}</span>
              {item.stock <= item.min && <AlertTriangle size={14} className="text-red-500 animate-pulse shrink-0" aria-label="Low stock" />}
            </div>
            <div className="flex justify-between items-baseline">
              <strong className={`text-lg font-black ${item.stock <= item.min ? 'text-red-500' : 'text-zunde-green'}`}>
                {item.stock.toFixed(0)} <small className="text-[10px] uppercase">{item.unit}</small>
              </strong>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Min: {item.min}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 mt-2 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${item.stock <= item.min ? 'bg-red-500' : pct > 50 ? 'bg-zunde-green' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default HealthManagement;

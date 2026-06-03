import React, { useState, useEffect } from 'react';
import { HEALTH_PROTOCOLS } from './healthData';
import { DOSAGE_RATES } from './dosageData';
import { 
    Pill, Calculator, AlertCircle, History, ShieldCheck, 
    ChevronRight, HeartPulse, Package, AlertTriangle 
} from 'lucide-react';
import './HealthManagement.css';

const HealthManagement = ({ animals, completedTasks, setCompletedTasks, auditLog, setAuditLog, inventory, setInventory }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [gestationStart, setGestationStart] = useState('');
  const [selectedMeds, setSelectedMeds] = useState('Oxytetracycline (LA)');

  const selectedAnimal = animals.find(a => a.id == selectedAnimalId);

  const calculateGestation = (startDate, species) => {
    if (!startDate || !species) return null;
    const start = new Date(startDate);
    const dueDate = new Date(start);
    const period = HEALTH_PROTOCOLS[species]?.gestation || 283;
    dueDate.setDate(start.getDate() + period);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return { date: dueDate.toDateString(), daysRemaining: diffDays, isUrgent: diffDays <= 14 && diffDays > 0 };
  };

  const getLifecycleStats = (animal) => {
    if (!animal) return null;
    const birth = new Date(animal.birthDate);
    const weaningDays = HEALTH_PROTOCOLS[animal.species]?.weaningAge || 210;
    const weaningDate = new Date(birth);
    weaningDate.setDate(birth.getDate() + weaningDays);
    const now = new Date();
    return {
      weaningDate: weaningDate.toDateString(),
      isWeaned: now > weaningDate,
      daysUntilWeaning: Math.ceil((weaningDate - now) / (1000 * 60 * 60 * 24))
    };
  };

  const calculateDosage = (medName, weight) => {
    if (!weight) return "0.0";
    const med = DOSAGE_RATES[medName];
    return ((weight / med.per) * med.rate).toFixed(1);
  };

  const getDynamicSchedule = (animal) => {
    if (!animal) return [];
    const birth = new Date(animal.birthDate);
    const protocol = HEALTH_PROTOCOLS[animal.species]?.vaccines || [];
    return protocol.map(v => {
      const dueDate = new Date(birth);
      dueDate.setDate(birth.getDate() + v.age);
      const now = new Date();
      const taskId = `${animal.id}-${v.name}`;
      const isCompleted = completedTasks.includes(taskId);
      let status = isCompleted ? "Completed" : (now > dueDate ? "Overdue" : "Upcoming");
      return { ...v, dueDate: dueDate.toDateString(), status };
    });
  };

  const handleCompleteTask = (taskName) => {
    const taskId = `${selectedAnimalId}-${taskName}`;
    if (completedTasks.includes(taskId)) return;
    setCompletedTasks([...completedTasks, taskId]);
    setAuditLog([{
      id: Date.now(),
      animalId: selectedAnimal.id,
      animal: selectedAnimal.name,
      action: taskName,
      date: new Date().toLocaleString()
    }, ...auditLog]);
  };

  const deductInventory = () => {
      const dose = parseFloat(calculateDosage(selectedMeds, selectedAnimal.currentWeight));
      const updatedInv = inventory.map(item => {
          if (item.name === selectedMeds) {
              return { ...item, stock: Math.max(0, item.stock - dose) };
          }
          return item;
      });
      setInventory(updatedInv);
      setAuditLog([{
          id: Date.now(),
          animalId: selectedAnimal.id,
          animal: selectedAnimal.name,
          action: `Treatment: ${selectedMeds} (${dose}ml admin)`,
          date: new Date().toLocaleString()
      }, ...auditLog]);
      alert(`Treatment administered. ${dose}ml deducted from RaMambo Cabinet.`);
  };

  const gestationInfo = calculateGestation(gestationStart, selectedAnimal?.species);
  const lifecycle = getLifecycleStats(selectedAnimal);
  const schedule = getDynamicSchedule(selectedAnimal);

  return (
    <div className="zunde-health-mgmt enterprise p-8 bg-gray-50 h-full overflow-y-auto">
      <div className="health-header flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-2xl font-black text-gray-800 leading-none">Health & Compliance</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Lifecycle Protocols • Resource Management</p>
        </div>
        <div className="animal-selector-large flex items-center space-x-4">
          <label className="text-xs font-black text-gray-400 uppercase">Focus Animal:</label>
          <select className="p-3 bg-gray-50 rounded-2xl border-none outline-none font-bold text-sm min-w-[200px]" value={selectedAnimalId} onChange={(e) => setSelectedAnimalId(e.target.value)}>
            <option value="">Select Animal...</option>
            {animals.map(a => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
          </select>
        </div>
      </div>

      {!selectedAnimal ? (
        <div className="dashboard-grid grid grid-cols-3 gap-8">
            <div className="col-span-2 empty-state py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
                <HeartPulse size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">Please select an animal to view specialized health protocols.</p>
            </div>
            {/* INVENTORY CABINET VIEW (Always visible) */}
            <div className="col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-left">
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center"><Package size={18} className="mr-2 text-zunde-green"/> RaMambo Medicine Cabinet</h3>
                <div className="space-y-4">
                    {inventory.map(item => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-black text-gray-700">{item.name}</span>
                                {item.stock <= item.min && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                            </div>
                            <div className="flex justify-between items-baseline">
                                <strong className={`text-lg font-black ${item.stock <= item.min ? 'text-red-500' : 'text-zunde-green'}`}>{item.stock.toFixed(0)} <small className="text-[10px] uppercase">{item.unit}</small></strong>
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Target: {item.min}+</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
                                <div className={`h-full ${item.stock <= item.min ? 'bg-red-500' : 'bg-zunde-green'}`} style={{width: `${Math.min(100, (item.stock / 1000) * 100)}%`}}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      ) : (
        <div className="dashboard-grid grid grid-cols-3 gap-8 text-left">
          {/* Reproduction & Lifecycle Card */}
          <div className="health-card bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center"><History size={18} className="mr-2 text-zunde-green"/> Reproduction & Lifecycle</h3>
            <div className="gestation-tool mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Record Mating Date</label>
              <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green" value={gestationStart} onChange={(e) => setGestationStart(e.target.value)} />
              
              {gestationInfo && (
                <div className={`mt-4 p-6 rounded-3xl flex items-center justify-between ${gestationInfo.isUrgent ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-zunde-green'}`}>
                  <div>
                    <span className="text-[10px] font-black uppercase block opacity-60">Expected Delivery</span>
                    <strong className="text-lg font-black">{gestationInfo.date}</strong>
                  </div>
                  <div className="text-right">
                    <strong className="text-2xl font-black leading-none">{gestationInfo.daysRemaining}</strong>
                    <span className="text-[10px] font-black uppercase block">Days left</span>
                  </div>
                </div>
              )}
            </div>

            <div className="lifecycle-info space-y-4 pt-6 border-t border-gray-50 mt-auto">
              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                <span>Standard Weaning Age</span>
                <span className="text-gray-800">{HEALTH_PROTOCOLS[selectedAnimal.species].weaningAge} Days</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                <span>Target Weaning Date</span>
                <span className="text-gray-800">{lifecycle.weaningDate}</span>
              </div>
              <div className={`p-3 rounded-2xl text-center text-xs font-black uppercase tracking-widest ${lifecycle.isWeaned ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {lifecycle.isWeaned ? "Animal is Weaned" : `Weaning in ${lifecycle.daysUntilWeaning} days`}
              </div>
            </div>
          </div>

          {/* Medication Intelligence Card */}
          <div className="health-card bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center"><Pill size={18} className="mr-2 text-blue-500"/> Medication Intelligence</h3>
            <div className="med-calc-box bg-blue-50/50 p-6 rounded-[30px] border border-blue-100/50">
                <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-3 block">Select Treatment</label>
                <select className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none shadow-sm mb-6 text-sm" value={selectedMeds} onChange={e => setSelectedMeds(e.target.value)}>
                    {Object.keys(DOSAGE_RATES).map(m => <option key={m}>{m}</option>)}
                </select>

                <div className="dosage-result flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <Calculator size={28} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-blue-900/40 uppercase block">Required Dosage</span>
                            <div className="flex items-baseline space-x-1">
                                <strong className="text-3xl font-black text-blue-600">{calculateDosage(selectedMeds, selectedAnimal.currentWeight)}</strong>
                                <span className="text-sm font-black text-blue-600 uppercase">ml</span>
                            </div>
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
                    Note: Calculated for {selectedAnimal.name}'s current weight ({selectedAnimal.currentWeight}kg).
                </p>
            </div>
          </div>

          {/* INVENTORY CABINET VIEW */}
          <div className="col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-left">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center"><Package size={18} className="mr-2 text-zunde-green"/> RaMambo Medicine Cabinet</h3>
              <div className="space-y-4">
                  {inventory.map(item => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition">
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-black text-gray-700">{item.name}</span>
                              {item.stock <= item.min && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                          </div>
                          <div className="flex justify-between items-baseline">
                              <strong className={`text-lg font-black ${item.stock <= item.min ? 'text-red-500' : 'text-zunde-green'}`}>{item.stock.toFixed(0)} <small className="text-[10px] uppercase">{item.unit}</small></strong>
                              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Target: {item.min}+</span>
                          </div>
                          <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
                              <div className={`h-full ${item.stock <= item.min ? 'bg-red-500' : 'bg-zunde-green'}`} style={{width: `${Math.min(100, (item.stock / 1000) * 100)}%`}}></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Vaccination Compliance Card */}
          <div className="health-card bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 col-span-3">
            <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center"><ShieldCheck size={18} className="mr-2 text-zunde-green"/> Veterinary Protocol Timeline</h3>
            <div className="grid grid-cols-2 gap-6">
              {schedule.map((task, i) => (
                <div key={i} className={`p-6 rounded-[30px] border-2 transition flex items-center justify-between ${task.status === 'Completed' ? 'bg-green-50 border-green-100 opacity-60' : (task.status === 'Overdue' ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-gray-50 border-gray-100')}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${task.status === 'Completed' ? 'bg-zunde-green text-white' : 'bg-white text-gray-400'}`}>
                        {i + 1}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2 text-left">
                            <span className="text-sm font-black text-gray-800">{task.name}</span>
                            {task.mandatory && <small className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Req</small>}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left block">{task.dueDate}</span>
                    </div>
                  </div>
                  
                  <div className="task-action">
                    {task.status === 'Completed' ? (
                      <div className="bg-white p-2 rounded-xl text-zunde-green shadow-sm"><ShieldCheck size={20} /></div>
                    ) : (
                      <button onClick={() => handleCompleteTask(task.name)} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase text-gray-600 shadow-sm hover:bg-zunde-green hover:text-white transition">Mark Done</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthManagement;

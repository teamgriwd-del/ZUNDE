import React, { useState } from 'react';
import { BREED_PROFILES } from '../HealthManagement/healthData';
import {
  PlusCircle, Search, Filter, MoreHorizontal,
  ChevronRight, Calendar, Weight, Info, History, Users, ShieldCheck, X, TrendingUp, LineChart as ChartIcon, Tag
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './AnimalProfile.css';

const AnimalProfile = ({ animals, onAddAnimal, auditLog, onListAnimal }) => {
  const [animal, setAnimal] = useState({
    name: '', species: 'Cattle', breed: '', birthDate: '', 
    tagId: '', brandId: '', sireId: '', damId: '', 
    birthWeight: '', currentWeight: '' 
  });

  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('History');

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    return `${years}y ${months}m`;
  };

  const calculateValue = (animal) => {
    const base = animal.species === 'Cattle' ? 500 : 100;
    const healthBonus = auditLog.filter(l => l.animalId === animal.id).length * 10;
    return (base + (animal.currentWeight * 1.5) + healthBonus).toLocaleString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bw = parseFloat(animal.birthWeight);
    if (!animal.name.trim()) return;
    if (!animal.birthDate) return;
    if (isNaN(bw) || bw <= 0) return;
    const age = calculateAge(animal.birthDate);
    onAddAnimal({ ...animal, id: Date.now(), age, birthWeight: bw, currentWeight: bw });
    setAnimal({
      name: '', species: 'Cattle', breed: '', birthDate: '',
      tagId: '', brandId: '', sireId: '', damId: '',
      birthWeight: '', currentWeight: ''
    });
    setIsRegistering(false);
  };

  // --- DESIGN 4: RaMambo Health Passport (Certified View) ---
  const renderPassport = () => (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md">
        <div className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="bg-zunde-green p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-2">
                        <ShieldCheck size={32} className="text-yellow-400" />
                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Health Passport</h2>
                    </div>
                    <p className="text-sm font-bold opacity-70 uppercase tracking-[4px]">Verified Digital Pedigree & Medical Record</p>
                </div>
                <button onClick={() => setIsPassportOpen(false)} className="relative z-10 bg-white/10 hover:bg-white/20 p-4 rounded-full transition"><X size={24} /></button>
                <div className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-white/5 rounded-full rotate-45"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-[#fdfcf9] text-left">
                <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-1">
                        <div className="w-full aspect-square rounded-[40px] overflow-hidden border-8 border-white shadow-xl mb-6 bg-gray-100">
                            <img src={selectedAnimal.imageUrl} className="w-full h-full object-cover" alt="Animal" />
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Market Valuation</span>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-sm font-black text-zunde-green">USD</span>
                                <strong className="text-4xl font-black text-gray-800">${calculateValue(selectedAnimal)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 space-y-10">
                        <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 border-b pb-2">Identity Details</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div><label className="text-[10px] font-black text-zunde-green uppercase block">System Name</label><strong className="text-xl font-black text-gray-800">{selectedAnimal.name}</strong></div>
                                <div><label className="text-[10px] font-black text-zunde-green uppercase block">Ear Tag ID</label><strong className="text-xl font-black text-gray-800">#{selectedAnimal.tagId}</strong></div>
                                <div><label className="text-[10px] font-black text-zunde-green uppercase block">Owner Brand</label><strong className="text-xl font-black text-gray-800">{selectedAnimal.brandId}</strong></div>
                                <div><label className="text-[10px] font-black text-zunde-green uppercase block">Breed Origin</label><strong className="text-xl font-black text-gray-800">{selectedAnimal.breed}</strong></div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 border-b pb-2">Verified Medical Audit</h3>
                            <div className="space-y-4">
                                {auditLog.filter(l => l.animalId === selectedAnimal.id).length === 0 ? <p className="italic text-gray-400 font-bold">No certified events recorded.</p> : (
                                    auditLog.filter(l => l.animalId === selectedAnimal.id).map(log => (
                                        <div key={log.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 rounded-full bg-zunde-green"></div>
                                                <strong className="text-sm font-black text-gray-800">{log.action}</strong>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{log.date}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <ShieldCheck size={16} /> <span>RaMambo Security Verified • {new Date().getFullYear()}</span>
                </div>
                <div className="flex space-x-4">
                    <button className="px-8 py-3 bg-white border-2 border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition">Print</button>
                    <button className="px-8 py-3 bg-zunde-green text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 hover:scale-105 transition">Export PDF</button>
                </div>
            </div>
        </div>
    </div>
  );

  // --- DESIGN 3: Animal List View ---
  const renderListView = () => (
    <div className="flex flex-1 gap-8 p-8 overflow-hidden h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-left">
            <h2 className="text-2xl font-black text-gray-800 leading-none">The Royal Herd</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[2px] mt-1">ZUNDE RaMambo Identity Management</p>
          </div>
          <button onClick={() => setIsRegistering(true)} className="flex items-center space-x-2 bg-zunde-green text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg transition">
            <PlusCircle size={18} /> <span>Add Animal</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide text-left">
          {animals.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
               <Users size={40} className="text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold">No animals in the enterprise database.</p>
            </div>
          ) : (
            animals.map(a => (
              <div key={a.id} onClick={() => setSelectedAnimalId(a.id)} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center cursor-pointer transition hover:shadow-xl hover:border-zunde-green/30">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden mr-6 shrink-0 relative">
                  <img src={a.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${a.name}`} className="w-full h-full object-cover transform transition group-hover:scale-110" alt="animal" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-black text-zunde-green bg-green-50 px-2 py-0.5 rounded uppercase">{a.tagId || 'NO TAG'}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">{a.species}</span>
                  </div>
                  <h4 className="text-xl font-black text-gray-800 truncate">{a.name}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-400 font-bold">{a.breed} • {a.age}</p>
                      <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                      <p className="text-xs text-zunde-green font-black">EST. VALUE: ${calculateValue(a)}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-200 group-hover:text-zunde-green transition" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-96 space-y-8 overflow-y-auto hidden xl:block text-left">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center"><TrendingUp size={18} className="mr-2 text-zunde-green" /> Herd Productivity</h3>
          <div className="space-y-6">
            {['Cattle', 'Goat', 'Sheep'].map(species => {
              const count = animals.filter(a => a.species === species).length;
              const pct = animals.length > 0 ? (count / animals.length) * 100 : 0;
              return (
                <div key={species}>
                  <div className="flex justify-between text-xs font-black text-gray-400 uppercase mb-2"><span>{species}</span><span>{count}</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-zunde-green h-full" style={{width: `${pct}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // --- DESIGN 2: Animal Detail View ---
  const renderDetailView = () => (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 h-full text-left">
      <button onClick={() => setSelectedAnimalId(null)} className="flex items-center space-x-2 text-zunde-green font-black text-sm mb-6 hover:underline">
        <ChevronRight size={16} className="rotate-180" /> <span>BACK TO HERD</span>
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex h-[450px] mb-8">
        <div className="w-2/5 relative">
          <img src={selectedAnimal.imageUrl} className="w-full h-full object-cover" alt="cow" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10">
            <h1 className="text-5xl font-black text-white leading-none">{selectedAnimal.name}</h1>
          </div>
        </div>
        <div className="w-3/5 p-12 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tag ID</span><h2 className="text-3xl font-black text-gray-800">#{selectedAnimal.tagId}</h2></div>
            <button onClick={() => setIsPassportOpen(true)} className="px-6 py-3 bg-yellow-400 text-zunde-green rounded-2xl font-black text-sm shadow-lg hover:shadow-yellow-900/20 transition">Open Passport</button>
          </div>
          <div className="flex space-x-3 mb-10">
            <span className="px-4 py-1.5 bg-green-50 text-zunde-green rounded-full text-xs font-black uppercase">{selectedAnimal.species}</span>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase">Valuation: ${calculateValue(selectedAnimal)}</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100"><div className="text-[10px] font-black text-gray-400 uppercase mb-2">Age</div><div className="text-lg font-black text-gray-800">{selectedAnimal.age}</div></div>
            <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100"><div className="text-[10px] font-black text-gray-400 uppercase mb-2">Weight</div><div className="text-lg font-black text-gray-800">{selectedAnimal.currentWeight} KG</div></div>
            <button
              onClick={() => onListAnimal && onListAnimal(selectedAnimal.id)}
              className={`p-6 rounded-[30px] border text-left transition hover:scale-105 ${selectedAnimal.forSale ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-100 hover:border-zunde-green'}`}
            >
              <div className="text-[10px] font-black text-gray-400 uppercase mb-2">Market Status</div>
              <div className={`text-sm font-black uppercase ${selectedAnimal.forSale ? 'text-yellow-600' : 'text-zunde-green'}`}>
                {selectedAnimal.forSale ? 'Listed for Sale' : 'Not for Sale'}
              </div>
              <p className="text-[9px] font-bold text-gray-300 mt-1 uppercase">{selectedAnimal.forSale ? 'Click to delist' : 'Click to list'}</p>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
        <div className="flex space-x-12 border-b-2 border-gray-50 pb-6 mb-8">
           <button onClick={() => setActiveDetailTab('History')} className={`text-sm font-black transition ${activeDetailTab === 'History' ? 'text-zunde-green border-b-4 border-zunde-green pb-6 -mb-6.5' : 'text-gray-400'}`}>Health Events</button>
           <button onClick={() => setActiveDetailTab('Performance')} className={`text-sm font-black transition ${activeDetailTab === 'Performance' ? 'text-zunde-green border-b-4 border-zunde-green pb-6 -mb-6.5' : 'text-gray-400'}`}>Performance Charts</button>
        </div>
        
        {activeDetailTab === 'History' ? (
            <div className="space-y-6">
                {auditLog.filter(log => log.animalId === selectedAnimal.id).length === 0 ? <p className="text-center py-10 text-gray-300 italic">No records found.</p> : (
                    auditLog.filter(log => log.animalId === selectedAnimal.id).map(log => (
                        <div key={log.id} className="flex items-center p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-zunde-green/20 transition">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zunde-green shadow-sm mr-6"><ShieldCheck size={24} /></div>
                            <div className="flex-1 text-left"><h5 className="font-black text-gray-800 text-lg">{log.action}</h5><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{log.date}</p></div>
                        </div>
                    ))
                )}
            </div>
        ) : (
            <div className="h-[400px] w-full p-6">
                <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center"><TrendingUp size={20} className="mr-2 text-zunde-green"/> Weight Accumulation Trend (KG)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedAnimal.weightHistory}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1b5e20" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#1b5e20" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="month" fontSize={12} fontWeight="bold" />
                        <YAxis fontSize={12} fontWeight="bold" />
                        <Tooltip />
                        <Area type="monotone" dataKey="weight" stroke="#1b5e20" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={4} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>
      {isPassportOpen && renderPassport()}
    </div>
  );

  // --- Registration Modal ---
  if (isRegistering) {
    return (
      <div className="flex-1 p-8 bg-gray-50 text-left">
        <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl p-12">
          <div className="flex justify-between items-center mb-10"><h3 className="text-3xl font-black text-gray-800">New Registration</h3><button onClick={() => setIsRegistering(false)} className="text-gray-400 hover:text-gray-600 font-black text-2xl">×</button></div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-name">Animal Name <span className="text-red-400">*</span></label>
                <input id="reg-name" type="text" placeholder="e.g. Bessie" required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.name} onChange={e => setAnimal({...animal, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-species">Species</label>
                <select id="reg-species" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={animal.species} onChange={e => setAnimal({...animal, species: e.target.value, breed: ''})}>
                  <option>Cattle</option><option>Goat</option><option>Sheep</option><option>Pig</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-breed">Breed</label>
                <select id="reg-breed" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={animal.breed} onChange={e => setAnimal({...animal, breed: e.target.value})}>
                  <option value="">Select Breed...</option>
                  {(BREED_PROFILES[animal.species] || []).map(b => <option key={b.breed} value={b.breed}>{b.breed}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-tag">Ear Tag ID</label>
                <input id="reg-tag" type="text" placeholder="TAG-XXX" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.tagId} onChange={e => setAnimal({...animal, tagId: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-dob">Birth Date <span className="text-red-400">*</span></label>
                <input id="reg-dob" type="date" required max={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.birthDate} onChange={e => setAnimal({...animal, birthDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-weight">Birth Weight (KG) <span className="text-red-400">*</span></label>
                <input id="reg-weight" type="number" min="0.1" step="0.1" required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.birthWeight} onChange={e => setAnimal({...animal, birthWeight: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-brand">Owner Brand ID</label>
                <input id="reg-brand" type="text" placeholder="AR-MP" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.brandId} onChange={e => setAnimal({...animal, brandId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="reg-sire">Sire ID (Father)</label>
                <input id="reg-sire" type="text" placeholder="S-XXX" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.sireId} onChange={e => setAnimal({...animal, sireId: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-zunde-green text-white rounded-3xl font-black uppercase shadow-xl hover:scale-[1.02] transition">Complete Herd Registration</button>
          </form>
        </div>
      </div>
    );
  }

  return selectedAnimalId ? renderDetailView() : renderListView();
};

export default AnimalProfile;

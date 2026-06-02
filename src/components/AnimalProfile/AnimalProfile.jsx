import React, { useState } from 'react';
import { 
  PlusCircle, Search, Filter, MoreHorizontal, 
  ChevronRight, Calendar, Weight, Info, History, Users, ShieldCheck 
} from 'lucide-react';
import './AnimalProfile.css';

const AnimalProfile = ({ animals, onAddAnimal, auditLog }) => {
  const [animal, setAnimal] = useState({
    name: '', species: 'Cattle', breed: '', birthDate: '', 
    tagId: '', brandId: '', sireId: '', damId: '', 
    birthWeight: '', currentWeight: '' 
  });

  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [filterType, setFilterType] = useState('All');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const age = calculateAge(animal.birthDate);
    onAddAnimal({ ...animal, id: Date.now(), age });
    setAnimal({ 
      name: '', species: 'Cattle', breed: '', birthDate: '', 
      tagId: '', brandId: '', sireId: '', damId: '', 
      birthWeight: '', currentWeight: '' 
    });
    setIsRegistering(false);
  };

  // --- DESIGN 3: Animal List View ---
  const renderListView = () => (
    <div className="flex flex-1 gap-8 p-8 overflow-hidden h-full">
      {/* Central Column: List */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setFilterType('All')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${filterType === 'All' ? 'bg-zunde-green text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              All {animals.length}
            </button>
            <button className="px-4 py-2 bg-white text-gray-500 rounded-lg font-bold text-sm hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
              High Performance
            </button>
          </div>
          <button 
            onClick={() => setIsRegistering(true)}
            className="flex items-center space-x-2 bg-zunde-green text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg transition"
          >
            <PlusCircle size={18} /> <span>Add Animal</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide text-left">
          {animals.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  <Users size={40} />
               </div>
               <p className="text-gray-400 font-bold">No animals registered in your enterprise herd.</p>
            </div>
          ) : (
            animals.map(a => (
              <div 
                key={a.id} 
                onClick={() => setSelectedAnimalId(a.id)}
                className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center cursor-pointer transition hover:shadow-xl hover:border-zunde-green/30"
              >
                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden mr-6 shrink-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-zunde-green/20 to-transparent"></div>
                  <img src={a.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${a.name}`} alt="animal" className="w-full h-full object-cover transform transition group-hover:scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-black text-zunde-green bg-green-50 px-2 py-0.5 rounded tracking-widest uppercase">{a.tagId || 'NO TAG'}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">{a.species}</span>
                  </div>
                  <h4 className="text-xl font-black text-gray-800 truncate">{a.name}</h4>
                  <p className="text-sm text-gray-400 font-bold mt-1">{a.breed} • {a.age}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="bg-zunde-green text-white px-4 py-1.5 rounded-full font-black text-lg shadow-sm">
                    85<small className="text-[10px] opacity-70 ml-0.5">/100</small>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Health Grade: A</span>
                </div>
                <div className="ml-6 text-gray-300 group-hover:text-zunde-green transition">
                  <ChevronRight size={24} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Analytics Widgets */}
      <div className="w-96 space-y-8 overflow-y-auto hidden xl:block text-left">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center">
            <Filter size={18} className="mr-2 text-zunde-green" /> Herd Composition
          </h3>
          <div className="space-y-6">
            {['Cattle', 'Goat', 'Sheep'].map(species => {
              const count = animals.filter(a => a.species === species).length;
              const pct = animals.length > 0 ? (count / animals.length) * 100 : 0;
              return (
                <div key={species}>
                  <div className="flex justify-between text-xs font-black text-gray-400 uppercase mb-2">
                    <span>{species}</span>
                    <span className="text-gray-800">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-zunde-green h-full transition-all duration-500" style={{width: `${pct}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-zunde-green p-8 rounded-3xl shadow-lg text-white">
          <h3 className="text-lg font-black mb-4">Production Insight</h3>
          <p className="text-sm opacity-80 leading-relaxed font-bold">
            Based on your herd size, the optimal weaning window for your Cattle starts in 12 days.
          </p>
          <button className="mt-6 w-full bg-white text-zunde-green py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-yellow-400 transition transform hover:scale-105">
            Optimize Feed Plan
          </button>
        </div>
      </div>
    </div>
  );

  // --- DESIGN 2: Animal Detail View ---
  const renderDetailView = () => (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 h-full text-left">
      <button 
        onClick={() => setSelectedAnimalId(null)}
        className="flex items-center space-x-2 text-zunde-green font-black text-sm mb-6 hover:underline"
      >
        <ChevronRight size={16} className="rotate-180" /> <span>BACK TO HERD</span>
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex h-[450px]">
        <div className="w-2/5 relative">
          <img src={selectedAnimal.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedAnimal.name}`} alt="cow" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10">
            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[4px] mb-2">Verified Identity</span>
            <h1 className="text-5xl font-black text-white leading-none">{selectedAnimal.name}</h1>
          </div>
        </div>
        
        <div className="w-3/5 p-12 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tag Identifier</span>
              <h2 className="text-3xl font-black text-gray-800">#{selectedAnimal.tagId || '00000'}</h2>
            </div>
            <div className="flex space-x-2">
              <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-zunde-green transition"><MoreHorizontal /></button>
              <button className="px-6 py-3 bg-zunde-green text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-green-900/20 transition">Edit Profile</button>
            </div>
          </div>

          <div className="flex space-x-3 mb-10">
            <span className="px-4 py-1.5 bg-green-50 text-zunde-green rounded-full text-xs font-black uppercase">{selectedAnimal.species}</span>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase">Active Member</span>
            <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-black uppercase">{selectedAnimal.breed}</span>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 transition hover:border-zunde-green/20">
              <div className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center"><Calendar size={12} className="mr-1"/> Age</div>
              <div className="text-lg font-black text-gray-800">{selectedAnimal.age}</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 transition hover:border-zunde-green/20">
              <div className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center"><Weight size={12} className="mr-1"/> Weight</div>
              <div className="text-lg font-black text-gray-800">{selectedAnimal.currentWeight || '--'} <small className="text-xs">KG</small></div>
            </div>
            <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 transition hover:border-zunde-green/20">
              <div className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center"><History size={12} className="mr-1"/> Status</div>
              <div className="text-lg font-black text-zunde-green">Optimal</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
        <div className="flex space-x-12 border-b-2 border-gray-50 pb-6 mb-8">
           <button className="text-sm font-black text-zunde-green border-b-4 border-zunde-green pb-6 -mb-6.5 transition">Health Events</button>
           <button className="text-sm font-black text-gray-400 hover:text-gray-600 transition">Ancestry/Family</button>
           <button className="text-sm font-black text-gray-400 hover:text-gray-600 transition">Performance Graphs</button>
        </div>
        
        <div className="space-y-6">
          {auditLog.filter(log => log.animalId === selectedAnimal.id).length === 0 ? (
            <div className="text-center py-20 text-gray-300 italic font-bold">No health records found for this animal.</div>
          ) : (
            auditLog.filter(log => log.animalId === selectedAnimal.id).map(log => (
              <div key={log.id} className="flex items-center p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-zunde-green/20 transition cursor-default">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zunde-green shadow-sm mr-6">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1">
                  <h5 className="font-black text-gray-800 text-lg">{log.action}</h5>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{log.date}</p>
                </div>
                <span className="text-[10px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase">Verified Record</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // --- Registration Modal ---
  if (isRegistering) {
    return (
      <div className="flex-1 p-8 bg-gray-50 text-left">
        <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl p-12">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black text-gray-800">New Registration</h3>
            <button onClick={() => setIsRegistering(false)} className="text-gray-400 hover:text-gray-600 font-black text-2xl">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Animal Name</label>
                <input type="text" placeholder="e.g. Bessie" required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.name} onChange={e => setAnimal({...animal, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Species</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={animal.species} onChange={e => setAnimal({...animal, species: e.target.value})}>
                  <option>Cattle</option><option>Goat</option><option>Sheep</option><option>Pig</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ear Tag ID</label>
                <input type="text" placeholder="e.g. TAG-222" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.tagId} onChange={e => setAnimal({...animal, tagId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Birth Date</label>
                <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={animal.birthDate} onChange={e => setAnimal({...animal, birthDate: e.target.value})} />
              </div>
            </div>

            <div className="pt-6">
               <button type="submit" className="w-full py-5 bg-zunde-green text-white rounded-3xl font-black text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition">Complete Herd Registration</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return selectedAnimalId ? renderDetailView() : renderListView();
};

export default AnimalProfile;

import React, { useState } from 'react';
import { ZIMBABWE_REGIONS, LOCAL_ADVISORY, EMERGENCY_HOTLINES } from './vetData';
import { Send, Plus, Search, MapPin, Phone, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import './VetCommunication.css';

const INITIAL_TICKETS = [
  { 
    id: 1, 
    status: 'Resolved', 
    category: 'Consultation', 
    animal: 'Bessie', 
    province: 'Mashonaland West',
    priority: 'Routine',
    subject: 'Vaccination Schedule',
    messages: [
        { sender: 'Farmer', text: 'When is Bessie due for her next Brucellosis shot?' },
        { sender: 'Vet', text: 'Based on her age of 2y 4m, she should have had her booster last month. I recommend a checkup next week.' }
    ]
  },
  { 
    id: 2, 
    status: 'In Progress', 
    category: 'Emergency', 
    animal: 'Thunder', 
    province: 'Mashonaland West',
    priority: 'Critical',
    subject: 'Suspected Foot & Mouth',
    messages: [
        { sender: 'Farmer', text: 'Thunder is showing blisters on his snout and is limping.' },
        { sender: 'Vet', text: 'I am dispatching a regional officer to your district now. Please isolate the animal immediately.' }
    ]
  }
];

const VetCommunication = ({ animals = [] }) => {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    category: 'Emergency',
    animalId: '',
    province: '',
    district: '',
    subject: '',
    description: ''
  });

  const [chatInput, setChatInput] = useState('');

  const [attachments, setAttachments] = useState([]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const animalName = animals.find(a => a.id == newTicket.animalId)?.name || 'General Inquiry';
    const priority = newTicket.category === 'Emergency' ? 'Critical' : 'Routine';
    
    const ticket = {
      ...newTicket,
      id: Date.now(),
      status: 'Pending',
      animal: animalName,
      priority: priority,
      messages: [{ sender: 'Farmer', text: newTicket.description, attachments: [...attachments] }]
    };

    setTickets([ticket, ...tickets]);
    setIsCreating(false);
    setNewTicket({ category: 'Emergency', animalId: '', province: '', district: '', subject: '', description: '' });
    setAttachments([]);
  };

  const simulateAttachment = () => {
    setAttachments([{ id: Date.now(), name: 'Symptom_Photo.jpg', size: '2.4MB' }]);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const updatedTickets = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, messages: [...t.messages, { sender: 'Farmer', text: chatInput }] };
      }
      return t;
    });
    setTickets(updatedTickets);
    setActiveTicket({ ...activeTicket, messages: [...activeTicket.messages, { sender: 'Farmer', text: chatInput }] });
    setChatInput('');
  };

  return (
    <div className="zunde-vet-comm enterprise zim-focused flex h-full">
      {/* Sidebar: Ticket History */}
      <div className="comm-sidebar w-80 bg-gray-50 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Consultations</h3>
            <button className="bg-zunde-green text-white p-1.5 rounded-lg hover:bg-green-700 transition" onClick={() => {setIsCreating(true); setActiveTicket(null);}}>
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-300" size={14} />
            <input type="text" placeholder="Search cases..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-xs font-bold border-transparent focus:bg-white focus:border-zunde-green outline-none" />
          </div>
        </div>
        
        <div className="ticket-list flex-1 overflow-y-auto p-4 space-y-3">
          {tickets.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-2xl cursor-pointer transition border-2 ${activeTicket?.id === t.id ? 'bg-white border-zunde-green shadow-lg' : 'bg-white border-transparent hover:border-gray-200'}`}
              onClick={() => {setActiveTicket(t); setIsCreating(false);}}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${t.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {t.priority}
                </span>
                <span className="text-[10px] text-gray-300 font-bold">#{t.id.toString().slice(-4)}</span>
              </div>
              <h4 className="text-sm font-black text-gray-800 text-left truncate">{t.subject}</h4>
              <div className="flex items-center text-[10px] text-gray-400 font-bold mt-1 uppercase">
                <MapPin size={10} className="mr-1" /> {t.province}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400">{t.animal}</span>
                <span className={`text-[9px] font-black uppercase ${t.status === 'Resolved' ? 'text-green-500' : 'text-orange-500'}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-red-50 border-t border-red-100">
           <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-3 flex items-center">
             <AlertCircle size={12} className="mr-2" /> Regional DVS Hotlines
           </h4>
           <div className="space-y-2">
             {EMERGENCY_HOTLINES.map(h => (
               <div key={h.office} className="flex justify-between items-center text-[10px] font-bold">
                 <span className="text-red-800 opacity-60">{h.office}</span>
                 <a href={`tel:${h.phone}`} className="text-red-700 hover:underline">{h.phone}</a>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {isCreating ? (
          <div className="p-12 overflow-y-auto text-left max-w-3xl mx-auto w-full">
            <div className="flex items-center space-x-4 mb-10">
                <div className="w-12 h-12 bg-green-50 text-zunde-green rounded-2xl flex items-center justify-center">
                    <Plus size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-800 leading-none">New Consultation</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Digital Veterinary Request</p>
                </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Category</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}>
                    <option>Emergency</option><option>Vaccination</option><option>Nutrition</option><option>General Advisory</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Animal</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={newTicket.animalId} onChange={e => setNewTicket({...newTicket, animalId: e.target.value})}>
                    <option value="">Select Animal</option>
                    {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Province</label>
                  <select required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={newTicket.province} onChange={e => setNewTicket({...newTicket, province: e.target.value, district: ''})}>
                    <option value="">Select Province</option>
                    {ZIMBABWE_REGIONS.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">District</label>
                  <select required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold appearance-none" value={newTicket.district} onChange={e => setNewTicket({...newTicket, district: e.target.value})}>
                    <option value="">Select District</option>
                    {(ZIMBABWE_REGIONS.districts[newTicket.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
                <input type="text" placeholder="e.g. Unusual Lethargy" required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Symptoms / Inquiry</label>
                <textarea required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold h-32" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} placeholder="Describe the situation..."></textarea>
              </div>

              <div className="flex space-x-4 pt-6">
                <button type="button" className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs" onClick={() => setIsCreating(false)}>Discard</button>
                <button type="submit" className="flex-[2] py-4 bg-zunde-green text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-900/20">Submit to Veterinary Portal</button>
              </div>
            </form>
          </div>
        ) : activeTicket ? (
          <div className="flex flex-col h-full bg-gray-50/50">
            <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center">
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-xl font-black text-gray-800 leading-none">{activeTicket.subject}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${activeTicket.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{activeTicket.priority}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">{activeTicket.animal} • {activeTicket.province}, {activeTicket.district || 'Main'}</p>
              </div>
              <div className="flex items-center space-x-2">
                 <button className="text-xs font-black text-gray-400 hover:text-gray-600 px-4 py-2 uppercase tracking-widest">Close Case</button>
              </div>
            </div>

            <div className="message-log flex-1 overflow-y-auto p-10 space-y-6">
              {activeTicket.messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'Vet' ? 'justify-start' : 'justify-end'}`}>
                   <div className={`max-w-[70%] p-5 rounded-3xl text-sm font-bold shadow-sm ${m.sender === 'Vet' ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100' : 'bg-zunde-green text-white rounded-br-none shadow-green-900/10'}`}>
                      <div className="text-[9px] font-black uppercase opacity-50 mb-2 tracking-widest">{m.sender}</div>
                      <p className="leading-relaxed">{m.text}</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border-t border-gray-100">
              <div className="flex bg-gray-50 p-2 rounded-3xl border-2 border-transparent focus-within:border-zunde-green transition shadow-inner">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message to the veterinarian..." 
                  className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-sm"
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="bg-zunde-green text-white p-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="advisory-portal p-12 overflow-y-auto text-left">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-12 rounded-[40px] border border-green-100/50 mb-12 relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-3xl font-black text-zunde-green mb-2">Zimbabwe Advisory Portal</h3>
                  <p className="text-green-800/60 font-bold uppercase tracking-widest text-sm">Official Field Intelligence & Guidance</p>
               </div>
               <ShieldCheck className="absolute top-[-20px] right-[-20px] text-green-200/30 w-48 h-48 rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-8">
              {LOCAL_ADVISORY.map(adv => (
                <div key={adv.id} className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl hover:border-zunde-green/20 transition group">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-zunde-green bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{adv.source}</span>
                    <CheckCircle className="text-gray-100 group-hover:text-zunde-green transition" size={20} />
                  </div>
                  <h4 className="text-lg font-black text-gray-800 mb-3">{adv.topic}</h4>
                  <p className="text-sm text-gray-400 font-bold leading-relaxed">{adv.advice}</p>
                  <button className="mt-6 text-xs font-black text-zunde-green uppercase tracking-widest hover:underline">Read Full Bulletin</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetCommunication;

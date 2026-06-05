import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZIMBABWE_REGIONS, LOCAL_ADVISORY, EMERGENCY_HOTLINES } from './vetData';
import {
  Send, Plus, MapPin, Phone, AlertCircle, CheckCircle,
  ShieldCheck, Video, Mic, FileText, BellRing, UserCheck, Zap, Radar,
  Clock, X
} from 'lucide-react';
import './VetCommunication.css';

const VET_AUTO_RESPONSES = {
  Emergency: [
    "HIGH PRIORITY: Your case has been flagged. A duty officer is being notified. Please isolate the animal immediately.",
    "Case registered. Expected response within 15 minutes. Do not move the animal or remove any discharge material.",
    "Emergency Protocol Initiated. Dr. T. Moyo has been dispatched. Maintain biosecurity until arrival."
  ],
  Vaccination: [
    "Vaccination request received. Please confirm the animal's current weight and last vaccination date.",
    "Your vaccination schedule has been reviewed. A certificate will be issued within 24 hours.",
    "Vaccination certified. Please collect your movement permit from the District Vet Office."
  ],
  "Trade Certification": [
    "Trade certification request received. A health inspection must be conducted before certificate issuance.",
    "Please ensure all animals for export/trade have been dipped within the last 14 days.",
    "Your export health certificate is being processed. Estimated: 2-3 working days."
  ]
};

const INITIAL_TICKETS = [
  {
    id: 1,
    status: 'Certified',
    category: 'Vaccination',
    animal: 'Bessie',
    province: 'Mashonaland West',
    priority: 'Routine',
    subject: 'Vaccination Approval — Brucellosis Booster',
    messages: [
      { sender: 'Farmer', text: 'When is Bessie due for her next Brucellosis shot?', time: '09:14' },
      { sender: 'Vet', text: 'Based on her age of 2y 4m, she should have had her booster last month. I have issued a digital certificate for treatment. Please administer S19 under licensed supervision only.', time: '09:31' }
    ],
    certificateIssued: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
  },
  {
    id: 2,
    status: 'EMERGENCY',
    category: 'Emergency',
    animal: 'Thunder',
    province: 'Mashonaland West',
    priority: 'Critical',
    subject: 'Suspected Foot & Mouth — Immediate Response',
    messages: [
      { sender: 'Farmer', text: 'Thunder is showing blisters on his snout and is limping badly. He refused feed this morning.', time: '06:42' },
      { sender: 'Vet', text: 'HIGH PRIORITY: Emergency officer dispatched. Isolate Thunder in a separate pen immediately. Do not allow any movement of animals, people, or vehicles off the property. Switch to Video Consult now for visual confirmation.', time: '06:55' }
    ],
    isVideoAvailable: true,
    createdAt: new Date().toLocaleDateString()
  }
];

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const sanitize = (str) => str.replace(/[<>]/g, '').trim().slice(0, 500);

const VetCommunication = ({ animals = [] }) => {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    category: 'Emergency', animalId: '', province: '', district: '', subject: '', description: ''
  });
  const [chatInput, setChatInput] = useState('');
  const [isVetTyping, setIsVetTyping] = useState(false);
  const [showHotlines, setShowHotlines] = useState(false);
  const [formError, setFormError] = useState('');
  const chatEndRef = useRef(null);
  const timeoutRefs = useRef([]);

  useEffect(() => {
    return () => timeoutRefs.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim()) { setFormError('Please provide a report subject.'); return; }
    setFormError('');
    const animalName = animals.find(a => a.id === parseInt(newTicket.animalId, 10))?.name || 'General Inquiry';
    const ticket = {
      ...newTicket,
      id: Date.now(),
      status: newTicket.category === 'Emergency' ? 'EMERGENCY' : 'Pending',
      animal: animalName,
      priority: newTicket.category === 'Emergency' ? 'Critical' : 'Routine',
      createdAt: new Date().toLocaleDateString(),
      messages: newTicket.description.trim()
        ? [{ sender: 'Farmer', text: sanitize(newTicket.description), time: now() }]
        : [],
      isVideoAvailable: newTicket.category === 'Emergency'
    };

    setTickets(prev => [ticket, ...prev]);
    setIsCreating(false);
    setNewTicket({ category: 'Emergency', animalId: '', province: '', district: '', subject: '', description: '' });

    const t1 = setTimeout(() => {
      const responses = VET_AUTO_RESPONSES[ticket.category] || VET_AUTO_RESPONSES['Emergency'];
      const autoMsg = { sender: 'Vet', text: responses[0], time: now() };
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, messages: [...t.messages, autoMsg] } : t));
      setActiveTicket(prev => prev?.id === ticket.id ? { ...prev, messages: [...(prev.messages || []), autoMsg] } : prev);
    }, 3000);
    timeoutRefs.current.push(t1);
  };

  const handleSendMessage = () => {
    const text = sanitize(chatInput);
    if (!text || !activeTicket) return;
    const newMsg = { sender: 'Farmer', text, time: now() };
    const updated = tickets.map(t =>
      t.id === activeTicket.id ? { ...t, messages: [...t.messages, newMsg] } : t
    );
    setTickets(updated);
    const updatedTicket = { ...activeTicket, messages: [...activeTicket.messages, newMsg] };
    setActiveTicket(updatedTicket);
    setChatInput('');

    setIsVetTyping(true);
    const delay = 1800 + Math.random() * 1500;
    const ticketId = activeTicket.id;
    const category = activeTicket.category;
    const t2 = setTimeout(() => {
      setIsVetTyping(false);
      const responses = VET_AUTO_RESPONSES[category] || VET_AUTO_RESPONSES['Emergency'];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const vetMsg = { sender: 'Vet', text: reply, time: now() };
      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, messages: [...t.messages, vetMsg] } : t
      ));
      setActiveTicket(prev => prev?.id === ticketId ? { ...prev, messages: [...(prev.messages || []), vetMsg] } : prev);
    }, delay);
    timeoutRefs.current.push(t2);
  };

  const getStatusStyle = (t) => {
    if (t.status === 'EMERGENCY') return 'bg-red-500 text-white animate-pulse';
    if (t.status === 'Certified') return 'bg-yellow-400 text-gray-900';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="zunde-vet-comm enterprise zim-focused flex h-full overflow-hidden">

      {/* SIDEBAR */}
      <div className="comm-sidebar w-96 bg-gray-900 flex flex-col border-r border-white/5">
        <div className="p-8 border-b border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-zunde-green uppercase tracking-[4px]">Tele-Health Console</h3>
            <button
              className="bg-zunde-green text-white p-2 rounded-xl hover:bg-green-700 shadow-lg transition"
              onClick={() => { setIsCreating(true); setActiveTicket(null); setFormError(''); }}
              aria-label="Create new case"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Provincial Alert */}
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-3">
            <div className="flex items-center space-x-2 text-red-400 mb-1">
              <BellRing size={14} className="animate-bounce" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-widest">Provincial Alert · Mashonaland West</span>
            </div>
            <p className="text-[11px] text-white font-bold leading-tight">Foot & Mouth outbreak confirmed in Chegutu. Restrict all livestock movement. Report any symptoms immediately.</p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 text-orange-400 mb-1">
              <AlertCircle size={14} aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-widest">Advisory · January Disease Season</span>
            </div>
            <p className="text-[11px] text-gray-300 font-bold leading-tight">Peak Theileriosis risk period. Maintain 5-5-4 dipping schedule. Contact DVS for Buparvaquone allocation.</p>
          </div>
        </div>

        <div className="ticket-list flex-1 overflow-y-auto p-6 space-y-3">
          {tickets.map(t => (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              aria-label={`Case: ${t.subject}`}
              className={`p-5 rounded-3xl cursor-pointer transition border-2 ${activeTicket?.id === t.id ? 'bg-white/10 border-zunde-green shadow-xl' : 'bg-white/5 border-transparent hover:border-white/10'}`}
              onClick={() => { setActiveTicket(t); setIsCreating(false); }}
              onKeyDown={e => e.key === 'Enter' && (setActiveTicket(t), setIsCreating(false))}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${getStatusStyle(t)}`}>
                  {t.status === 'EMERGENCY' ? '🚨 EMERGENCY' : t.status}
                </span>
                <span className="text-[9px] text-gray-600 font-bold">CASE-{String(t.id).slice(-4)}</span>
              </div>
              <h4 className="text-sm font-black text-white text-left leading-tight mt-2">{t.subject}</h4>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase">{t.animal}</span>
                <div className="flex items-center space-x-2">
                  {t.certificateIssued && <ShieldCheck size={12} className="text-yellow-400" aria-label="Certificate issued" />}
                  <span className="text-[9px] text-gray-600">{t.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* On-Duty & Hotlines */}
        <div className="p-6 bg-black/20 border-t border-white/5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-zunde-green flex items-center justify-center text-white">
              <UserCheck size={16} aria-hidden="true" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-white font-black leading-none uppercase">Dr. T. Moyo</div>
              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1" />On-Duty Officer
              </div>
            </div>
          </div>
          <button
            className="w-full py-3 bg-white/5 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-[2px] hover:bg-white/10 transition flex items-center justify-center space-x-2"
            onClick={() => setShowHotlines(!showHotlines)}
          >
            <Phone size={12} aria-hidden="true" />
            <span>Emergency Hotlines</span>
          </button>
          {showHotlines && (
            <div className="mt-3 space-y-2">
              {EMERGENCY_HOTLINES.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                  <span className="text-[9px] text-gray-400 font-bold">{h.label}</span>
                  <a href={`tel:${h.number}`} className="text-[10px] text-zunde-green font-black hover:underline">{h.number}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONSOLE */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {isCreating ? (
          <div className="p-12 max-w-2xl mx-auto w-full text-left overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-gray-800">Initialize Case</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-[3px] mt-1">Official record to Ministry Portal</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-2 text-gray-300 hover:text-gray-600 transition" aria-label="Cancel">
                <X size={20} />
              </button>
            </div>
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black" role="alert">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="case-type">Protocol Type</label>
                  <select id="case-type" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green" value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}>
                    <option>Emergency</option>
                    <option>Vaccination</option>
                    <option>Trade Certification</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="animal-link">Animal Link</label>
                  <select id="animal-link" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green" value={newTicket.animalId} onChange={e => setNewTicket({ ...newTicket, animalId: e.target.value })}>
                    <option value="">Select Animal...</option>
                    {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="province">Province</label>
                  <select id="province" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green" value={newTicket.province} onChange={e => setNewTicket({ ...newTicket, province: e.target.value })}>
                    <option value="">Select Province...</option>
                    {Object.keys(ZIMBABWE_REGIONS).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="district">District</label>
                  <select id="district" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green" value={newTicket.district} onChange={e => setNewTicket({ ...newTicket, district: e.target.value })} disabled={!newTicket.province}>
                    <option value="">Select District...</option>
                    {(ZIMBABWE_REGIONS[newTicket.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="subject">Report Subject <span className="text-red-400">*</span></label>
                <input
                  id="subject"
                  type="text"
                  required
                  maxLength={120}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green"
                  placeholder="e.g. Suspected FMD — Chegutu Farm Block A"
                  value={newTicket.subject}
                  onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="description">Initial Description</label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={500}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-zunde-green resize-none"
                  placeholder="Describe symptoms, timeline, and number of animals affected..."
                  value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                />
                <p className="text-[9px] text-gray-300 font-bold text-right">{newTicket.description.length}/500</p>
              </div>
              <button type="submit" className="w-full py-5 bg-zunde-green text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-[1.02] transition">
                Submit Official Request
              </button>
            </form>
          </div>
        ) : activeTicket ? (
          <div className="flex flex-col h-full">
            {/* Case Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="text-xl font-black text-gray-800 leading-none">{activeTicket.subject}</h4>
                  {activeTicket.status === 'EMERGENCY' && (
                    <span className="flex items-center bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                      <Zap size={10} className="mr-1" aria-hidden="true" /> LIVE EMERGENCY
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[3px]">
                  {activeTicket.animal} · {activeTicket.province || 'Mashonaland West'} · Case {String(activeTicket.id).slice(-4)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {activeTicket.isVideoAvailable && (
                  <button className="flex items-center bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition">
                    <Video size={16} className="mr-2" aria-hidden="true" /> Video Consult
                  </button>
                )}
                <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-zunde-green transition" aria-label="Voice note">
                  <Mic size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Chat */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="message-log flex-1 overflow-y-auto p-10 space-y-6" role="log" aria-label="Conversation">
                  {activeTicket.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'Vet' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] p-5 rounded-[30px] text-sm font-bold shadow-sm ${m.sender === 'Vet' ? 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100' : 'bg-zunde-green text-white rounded-br-none shadow-green-900/10'}`}>
                        <div className="flex items-center justify-between mb-2 space-x-4">
                          <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">{m.sender === 'Vet' ? 'DVS Officer' : 'Farmer'}</span>
                          <span className="text-[9px] opacity-40 font-bold flex items-center">
                            <Clock size={8} className="mr-1" aria-hidden="true" />{m.time || ''}
                          </span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {isVetTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-50 border border-gray-100 px-5 py-4 rounded-[30px] rounded-bl-none flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[10px] text-gray-400 font-bold ml-2">DVS Officer is typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex bg-white p-2 rounded-[30px] border-2 border-transparent focus-within:border-zunde-green transition shadow-sm">
                    <input
                      type="text"
                      placeholder="Type a professional message..."
                      className="flex-1 bg-transparent px-5 py-3 outline-none font-bold text-sm"
                      value={chatInput}
                      maxLength={500}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      aria-label="Message input"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="bg-zunde-green text-white px-6 rounded-2xl shadow-lg hover:scale-105 transition font-black text-xs uppercase flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                      aria-label="Send message"
                    >
                      <Send size={14} aria-hidden="true" />
                      <span>Transmit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Case Assets Sidebar */}
              <div className="w-72 bg-gray-50 p-8 text-left overflow-y-auto hidden lg:block border-l border-gray-100">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                  <FileText size={14} className="mr-2" aria-hidden="true" /> Case Assets
                </h5>

                {activeTicket.certificateIssued ? (
                  <div className="certificate-box bg-white p-6 rounded-3xl border-2 border-yellow-400/30 shadow-xl relative overflow-hidden mb-6">
                    <ShieldCheck className="absolute top-[-10px] right-[-10px] text-yellow-100 w-20 h-20" aria-hidden="true" />
                    <div className="relative z-10">
                      <span className="text-[8px] font-black text-zunde-green bg-green-50 px-2 py-0.5 rounded uppercase">Verified by DVS</span>
                      <h6 className="text-sm font-black text-gray-800 mt-4 leading-none">Diagnostic Certificate</h6>
                      <p className="text-[10px] text-gray-400 font-bold mt-2">Certified treatment plan issued for {activeTicket.animal}.</p>
                      <button className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-700 transition">Download PDF</button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 p-6 rounded-3xl text-center mb-6">
                    <p className="text-[10px] text-gray-300 font-black uppercase">Pending Certification</p>
                    <p className="text-[9px] text-gray-200 font-bold mt-1">Vet will issue once case is resolved</p>
                  </div>
                )}

                <div className="field-advisory space-y-3">
                  <h6 className="text-[10px] font-black text-zunde-green uppercase tracking-widest">Official Guideline</h6>
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-[11px] text-green-800 font-bold leading-relaxed">
                      Restrict the focus animal to a 10m radius. Disinfect all entry/exit points with 2% Virkon solution. Log all personnel entering the quarantine zone.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center space-x-2 text-blue-700 mb-1">
                      <MapPin size={12} aria-hidden="true" />
                      <span className="text-[10px] font-black uppercase">Location</span>
                    </div>
                    <p className="text-[11px] text-blue-800 font-bold">{activeTicket.province || 'Province not specified'} — {activeTicket.district || 'District not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="advisory-portal p-12 overflow-y-auto text-left">
            <div className="bg-gray-900 p-12 rounded-[50px] shadow-2xl relative overflow-hidden mb-10">
              <div className="relative z-10">
                <span className="text-zunde-green text-xs font-black uppercase tracking-[6px] block mb-4">Digital Command Center</span>
                <h3 className="text-4xl font-black text-white mb-4">Authority Hub</h3>
                <p className="text-gray-500 font-bold max-w-md leading-relaxed">
                  Official veterinary surveillance, tele-health consultations, and provincial outbreak management portal. All cases are logged with the Zimbabwe DVS.
                </p>
                <div className="flex space-x-4 mt-6">
                  <div className="bg-white/5 px-4 py-2 rounded-xl">
                    <span className="text-[9px] text-gray-500 font-black uppercase block">Active Cases</span>
                    <strong className="text-white text-lg font-black">{tickets.filter(t => t.status !== 'Certified').length}</strong>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-xl">
                    <span className="text-[9px] text-gray-500 font-black uppercase block">Certified</span>
                    <strong className="text-white text-lg font-black">{tickets.filter(t => t.certificateIssued).length}</strong>
                  </div>
                </div>
              </div>
              <Radar className="absolute bottom-[-50px] right-[-50px] text-zunde-green/10 w-80 h-80" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-10 bg-gray-50 rounded-[40px] hover:bg-gray-100 transition cursor-pointer group" onClick={() => setIsCreating(true)}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zunde-green shadow-sm mb-6 group-hover:scale-110 transition duration-500">
                  <Zap size={32} aria-hidden="true" />
                </div>
                <h4 className="text-xl font-black text-gray-800 mb-2">Initialize Emergency Case</h4>
                <p className="text-sm text-gray-400 font-bold leading-relaxed">Direct encrypted link to the Provincial Duty Officer for immediate health intervention.</p>
              </div>
              <div className="p-10 bg-gray-50 rounded-[40px] border-2 border-transparent hover:border-zunde-green transition cursor-pointer group" onClick={() => { setNewTicket(p => ({ ...p, category: 'Trade Certification' })); setIsCreating(true); }}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zunde-green shadow-sm mb-6 group-hover:scale-110 transition duration-500">
                  <ShieldCheck size={32} aria-hidden="true" />
                </div>
                <h4 className="text-xl font-black text-gray-800 mb-2">Request Trade Certificate</h4>
                <p className="text-sm text-gray-400 font-bold leading-relaxed">Official livestock health sign-off required for inter-provincial movement and sales in Zimbabwe.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetCommunication;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZIMBABWE_REGIONS, EMERGENCY_HOTLINES } from './vetData';
import {
  Send, Plus, MapPin, Phone, AlertCircle, CheckCircle,
  ShieldCheck, Video, Mic, FileText, BellRing, UserCheck, Zap, Radar,
  Clock, X, Search, ChevronDown, MoreVertical, ArrowLeft, Paperclip,
  Image, Smile, Check, CheckCheck, PhoneCall
} from 'lucide-react';
import './VetCommunication.css';

const VET_CONTACTS = [
  {
    id: 'vet-1',
    name: 'Dr. T. Moyo',
    role: 'DVS Duty Officer',
    province: 'Mashonaland West',
    avatar: 'TM',
    color: 'bg-emerald-600',
    online: true,
    speciality: 'Tick-borne Diseases'
  },
  {
    id: 'vet-2',
    name: 'Dr. R. Chikwanda',
    role: 'Regional Vet Officer',
    province: 'Harare',
    avatar: 'RC',
    color: 'bg-blue-600',
    online: true,
    speciality: 'Reproductive Health'
  },
  {
    id: 'vet-3',
    name: 'Dr. S. Ndlovu',
    role: 'Emergency Response',
    province: 'Bulawayo',
    avatar: 'SN',
    color: 'bg-purple-600',
    online: false,
    speciality: 'FMD & CBPP'
  },
  {
    id: 'vet-4',
    name: 'DVS Emergency Line',
    role: 'Ministry of Agriculture',
    province: 'National',
    avatar: '🚨',
    color: 'bg-red-600',
    online: true,
    speciality: 'All Emergencies'
  }
];

const VET_AUTO_RESPONSES = {
  Emergency: [
    "HIGH PRIORITY: Your case has been flagged. A duty officer is being notified. Please isolate the animal immediately.",
    "Case registered. Expected response within 15 minutes. Do not move the animal or remove any discharge material.",
    "Emergency Protocol Initiated. I have been dispatched. Maintain biosecurity until arrival."
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

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    vetId: 'vet-1',
    status: 'Certified',
    category: 'Vaccination',
    animal: 'Bessie',
    province: 'Mashonaland West',
    priority: 'Routine',
    subject: 'Brucellosis Booster — Bessie',
    certificateIssued: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
    messages: [
      { id: 1, sender: 'Farmer', text: 'When is Bessie due for her next Brucellosis shot?', time: '09:14', read: true },
      { id: 2, sender: 'Vet', text: 'Based on her age of 2y 4m, she should have had her booster last month. I have issued a digital certificate for treatment. Please administer S19 under licensed supervision only.', time: '09:31', read: true }
    ]
  },
  {
    id: 2,
    vetId: 'vet-4',
    status: 'EMERGENCY',
    category: 'Emergency',
    animal: 'Thunder',
    province: 'Mashonaland West',
    priority: 'Critical',
    subject: 'Suspected FMD — Thunder',
    isVideoAvailable: true,
    createdAt: new Date().toLocaleDateString(),
    messages: [
      { id: 1, sender: 'Farmer', text: 'Thunder is showing blisters on his snout and is limping badly. He refused feed this morning.', time: '06:42', read: true },
      { id: 2, sender: 'Vet', text: 'HIGH PRIORITY: Emergency officer dispatched. Isolate Thunder in a separate pen immediately. Do not allow any movement of animals, people, or vehicles off the property. Switch to Video Consult now for visual confirmation.', time: '06:55', read: true }
    ]
  }
];

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const sanitize = (str) => str.replace(/[<>]/g, '').trim().slice(0, 500);

const Avatar = ({ contact, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-11 h-11 text-sm';
  const isEmoji = contact.avatar?.length <= 2 && /\p{Emoji}/u.test(contact.avatar);
  return (
    <div className={`${sizeClass} ${contact.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-black shrink-0 relative`}>
      {isEmoji ? <span className="text-xl">{contact.avatar}</span> : contact.avatar}
      {contact.online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${contact.online ? 'bg-green-400' : 'bg-gray-400'}`} />
      )}
    </div>
  );
};

const MessageBubble = ({ msg, isOwn }) => (
  <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className={`max-w-[72%] group`}>
      <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
        isOwn
          ? 'bg-zunde-green text-white rounded-br-sm'
          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
      }`}>
        {msg.text}
      </div>
      <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
        {isOwn && (
          msg.read
            ? <CheckCheck size={12} className="text-blue-400" />
            : <Check size={12} className="text-gray-400" />
        )}
      </div>
    </div>
  </div>
);

const VetCommunication = ({ animals = [] }) => {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isVetTyping, setIsVetTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHotlines, setShowHotlines] = useState(false);
  const [formError, setFormError] = useState('');
  const [newCase, setNewCase] = useState({ category: 'Emergency', animalId: '', province: '', district: '', subject: '', description: '' });

  const chatEndRef = useRef(null);
  const timeoutRefs = useRef([]);
  const inputRef = useRef(null);

  useEffect(() => () => timeoutRefs.current.forEach(clearTimeout), []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeVet = activeConv ? VET_CONTACTS.find(v => v.id === activeConv.vetId) : null;

  const filteredConvs = conversations.filter(c =>
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.animal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConv = (conv) => {
    setActiveConvId(conv.id);
    setIsCreating(false);
    setSelectedVet(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelectVet = (vet) => {
    const existing = conversations.find(c => c.vetId === vet.id && c.status !== 'Certified');
    if (existing) { handleSelectConv(existing); return; }
    setSelectedVet(vet);
    setIsCreating(true);
    setActiveConvId(null);
    setNewCase(p => ({ ...p, category: 'Emergency', province: vet.province !== 'National' ? vet.province : '' }));
  };

  const handleSend = () => {
    const text = sanitize(chatInput);
    if (!text || !activeConv) return;
    const newMsg = { id: Date.now(), sender: 'Farmer', text, time: now(), read: false };
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setChatInput('');
    setIsVetTyping(true);
    const convId = activeConvId;
    const category = activeConv.category;
    const t = setTimeout(() => {
      setIsVetTyping(false);
      const responses = VET_AUTO_RESPONSES[category] || VET_AUTO_RESPONSES['Emergency'];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const vetMsg = { id: Date.now() + 1, sender: 'Vet', text: reply, time: now(), read: true };
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, vetMsg] } : c
      ));
    }, 1800 + Math.random() * 1500);
    timeoutRefs.current.push(t);
  };

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!newCase.subject.trim()) { setFormError('Please provide a subject.'); return; }
    setFormError('');
    const vetToUse = selectedVet || VET_CONTACTS[0];
    const animalName = animals.find(a => a.id === parseInt(newCase.animalId, 10))?.name || 'General Inquiry';
    const conv = {
      id: Date.now(),
      vetId: vetToUse.id,
      status: newCase.category === 'Emergency' ? 'EMERGENCY' : 'Pending',
      category: newCase.category,
      animal: animalName,
      province: newCase.province,
      priority: newCase.category === 'Emergency' ? 'Critical' : 'Routine',
      subject: newCase.subject,
      createdAt: new Date().toLocaleDateString(),
      isVideoAvailable: newCase.category === 'Emergency',
      messages: newCase.description.trim()
        ? [{ id: 1, sender: 'Farmer', text: sanitize(newCase.description), time: now(), read: false }]
        : []
    };
    setConversations(prev => [conv, ...prev]);
    setIsCreating(false);
    setSelectedVet(null);
    setActiveConvId(conv.id);
    setNewCase({ category: 'Emergency', animalId: '', province: '', district: '', subject: '', description: '' });
    const t = setTimeout(() => {
      const responses = VET_AUTO_RESPONSES[conv.category] || VET_AUTO_RESPONSES['Emergency'];
      const autoMsg = { id: Date.now(), sender: 'Vet', text: responses[0], time: now(), read: true };
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, messages: [...c.messages, autoMsg] } : c));
    }, 3000);
    timeoutRefs.current.push(t);
  };

  const getLastMessage = (conv) => {
    if (!conv.messages.length) return 'Start the conversation...';
    const last = conv.messages[conv.messages.length - 1];
    return (last.sender === 'Farmer' ? 'You: ' : '') + last.text;
  };

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="w-[360px] shrink-0 flex flex-col bg-white border-r border-gray-200 h-full">

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black text-gray-900">Vet Messenger</h2>
            <button
              onClick={() => { setIsCreating(true); setSelectedVet(null); setActiveConvId(null); }}
              className="w-9 h-9 bg-zunde-green text-white rounded-full flex items-center justify-center hover:bg-green-700 transition shadow-md"
              aria-label="New case"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases or animals..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-zunde-green/30"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Quick Contact Vets */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Vets</p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {VET_CONTACTS.map(vet => (
                <button
                  key={vet.id}
                  onClick={() => handleSelectVet(vet)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div className="relative">
                    <div className={`w-14 h-14 ${vet.color} rounded-full flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-110 transition`}>
                      {/\p{Emoji}/u.test(vet.avatar) ? <span className="text-2xl">{vet.avatar}</span> : vet.avatar}
                    </div>
                    <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${vet.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 text-center leading-tight max-w-[60px] truncate">{vet.name.split(' ')[1] || vet.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Banner */}
          <div className="mx-5 my-3 bg-red-50 border border-red-200 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-0.5">
              <BellRing size={12} className="text-red-500 animate-bounce shrink-0" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-wide">Alert · Mashonaland West</span>
            </div>
            <p className="text-[11px] text-red-700 font-medium leading-snug">FMD outbreak in Chegutu. Restrict all livestock movement.</p>
          </div>

          {/* Conversations */}
          <div className="px-5 pt-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Conversations</p>
          </div>
          <div className="space-y-0">
            {filteredConvs.length === 0 ? (
              <p className="text-center py-10 text-sm text-gray-400 font-medium">No conversations found</p>
            ) : filteredConvs.map(conv => {
              const vet = VET_CONTACTS.find(v => v.id === conv.vetId) || VET_CONTACTS[0];
              const isActive = conv.id === activeConvId;
              const lastMsg = getLastMessage(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 transition text-left ${isActive ? 'bg-green-50 border-r-4 border-zunde-green' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 ${vet.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                      {/\p{Emoji}/u.test(vet.avatar) ? <span className="text-xl">{vet.avatar}</span> : vet.avatar}
                    </div>
                    {conv.status === 'EMERGENCY' && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px] font-black">!</span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{vet.name}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">{conv.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium truncate">{lastMsg}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                        conv.status === 'EMERGENCY' ? 'bg-red-100 text-red-600' :
                        conv.status === 'Certified' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-600'
                      }`}>{conv.status}</span>
                      <span className="text-[10px] text-gray-400">· {conv.animal}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer — Hotlines */}
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={() => setShowHotlines(p => !p)}
            className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-zunde-green transition w-full"
          >
            <Phone size={12} />
            <span>Emergency Hotlines</span>
            <ChevronDown size={12} className={`ml-auto transition ${showHotlines ? 'rotate-180' : ''}`} />
          </button>
          {showHotlines && (
            <div className="mt-2 space-y-1.5">
              {EMERGENCY_HOTLINES.map((h, i) => (
                <div key={i} className="flex justify-between items-center px-2 py-1.5 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-medium">{h.label}</span>
                  <a href={`tel:${h.number}`} className="text-[11px] font-black text-zunde-green hover:underline flex items-center gap-1">
                    <PhoneCall size={10} />{h.number}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* CREATE CASE FORM */}
        {isCreating && (
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-xl mx-auto px-6 py-8">
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setIsCreating(false)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition">
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {selectedVet ? `Message ${selectedVet.name}` : 'New Case'}
                  </h3>
                  {selectedVet && <p className="text-xs text-gray-400 font-medium">{selectedVet.speciality} · {selectedVet.province}</p>}
                </div>
                {selectedVet && <Avatar contact={selectedVet} size="md" />}
              </div>

              {formError && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold" role="alert">{formError}</div>
              )}

              <form onSubmit={handleCreateCase} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="cc-type">Case Type</label>
                    <select id="cc-type" className="w-full p-3 bg-white rounded-xl border border-gray-200 font-medium text-sm outline-none focus:ring-2 focus:ring-zunde-green/30" value={newCase.category} onChange={e => setNewCase(p => ({ ...p, category: e.target.value }))}>
                      <option>Emergency</option>
                      <option>Vaccination</option>
                      <option>Trade Certification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="cc-animal">Animal</label>
                    <select id="cc-animal" className="w-full p-3 bg-white rounded-xl border border-gray-200 font-medium text-sm outline-none focus:ring-2 focus:ring-zunde-green/30" value={newCase.animalId} onChange={e => setNewCase(p => ({ ...p, animalId: e.target.value }))}>
                      <option value="">Select animal...</option>
                      {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="cc-province">Province</label>
                    <select id="cc-province" className="w-full p-3 bg-white rounded-xl border border-gray-200 font-medium text-sm outline-none focus:ring-2 focus:ring-zunde-green/30" value={newCase.province} onChange={e => setNewCase(p => ({ ...p, province: e.target.value, district: '' }))}>
                      <option value="">Select province...</option>
                      {Object.keys(ZIMBABWE_REGIONS).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="cc-district">District</label>
                    <select id="cc-district" className="w-full p-3 bg-white rounded-xl border border-gray-200 font-medium text-sm outline-none focus:ring-2 focus:ring-zunde-green/30" value={newCase.district} onChange={e => setNewCase(p => ({ ...p, district: e.target.value }))} disabled={!newCase.province}>
                      <option value="">Select district...</option>
                      {(ZIMBABWE_REGIONS[newCase.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="cc-subject">Subject <span className="text-red-400">*</span></label>
                  <input
                    id="cc-subject"
                    type="text"
                    required
                    maxLength={120}
                    placeholder="e.g. Suspected FMD — Chegutu Farm"
                    className="w-full p-3 bg-white rounded-xl border border-gray-200 font-medium text-sm outline-none focus:ring-2 focus:ring-zunde-green/30"
                    value={newCase.subject}
                    onChange={e => setNewCase(p => ({ ...p, subject: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="cc-desc">Initial Message</label>
                  <textarea
                    id="cc-desc"
                    rows={4}
                    maxLength={500}
                    placeholder="Describe symptoms, timeline, and animals affected..."
                    className="w-full p-3 bg-white rounded-xl border border-gray-200 font-medium text-sm outline-none focus:ring-2 focus:ring-zunde-green/30 resize-none"
                    value={newCase.description}
                    onChange={e => setNewCase(p => ({ ...p, description: e.target.value }))}
                  />
                  <p className="text-right text-[10px] text-gray-400 mt-1">{newCase.description.length}/500</p>
                </div>

                <button type="submit" className="w-full py-4 bg-zunde-green text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <Send size={16} /> Send to {selectedVet?.name || 'Duty Vet'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ACTIVE CONVERSATION */}
        {!isCreating && activeConv && (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
              <button onClick={() => setActiveConvId(null)} className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800">
                <ArrowLeft size={18} />
              </button>
              {activeVet && <Avatar contact={activeVet} size="md" />}
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 text-sm leading-none mb-0.5">{activeVet?.name}</h4>
                <p className="text-[11px] text-gray-500 font-medium">
                  {activeVet?.online ? (
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Online · {activeVet.speciality}</span>
                  ) : (
                    <span className="text-gray-400">Offline · {activeVet?.speciality}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeConv.status === 'EMERGENCY' && (
                  <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                    <Zap size={10} /> LIVE
                  </span>
                )}
                {activeConv.isVideoAvailable && (
                  <button className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition" aria-label="Video consult">
                    <Video size={18} />
                  </button>
                )}
                <button className="w-9 h-9 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 transition" aria-label="Voice call">
                  <PhoneCall size={17} />
                </button>
                <button className="w-9 h-9 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 transition" aria-label="More options">
                  <MoreVertical size={17} />
                </button>
              </div>
            </div>

            {/* Case Info Strip */}
            <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] ${
                  activeConv.status === 'EMERGENCY' ? 'bg-red-100 text-red-600' :
                  activeConv.status === 'Certified' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-600'
                }`}>{activeConv.status}</span>
                <span className="text-gray-500 font-medium">{activeConv.subject}</span>
                <span className="text-gray-400">· {activeConv.animal}</span>
                {activeConv.province && <span className="flex items-center gap-1 text-gray-400"><MapPin size={10} />{activeConv.province}</span>}
              </div>
              {activeConv.certificateIssued && (
                <div className="flex items-center gap-1 text-[10px] font-black text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={11} /> Certified
                </div>
              )}
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
              style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.3\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E"), #f0f2f5' }}
              role="log"
              aria-label="Conversation"
            >
              {/* Date separator */}
              <div className="flex justify-center">
                <span className="bg-white text-[10px] font-bold text-gray-400 px-3 py-1 rounded-full shadow-sm border border-gray-100">{activeConv.createdAt}</span>
              </div>

              {activeConv.messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender === 'Farmer'} />
              ))}

              {isVetTyping && (
                <div className="flex items-end gap-2">
                  {activeVet && <Avatar contact={activeVet} size="sm" />}
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 focus-within:border-zunde-green/50 focus-within:shadow-md transition">
                <button className="text-gray-400 hover:text-zunde-green transition shrink-0" aria-label="Attach file"><Paperclip size={18} /></button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 min-w-0"
                  value={chatInput}
                  maxLength={500}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  aria-label="Message"
                />
                <button className="text-gray-400 hover:text-zunde-green transition shrink-0" aria-label="Emoji"><Smile size={18} /></button>
                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim()}
                  className="w-9 h-9 bg-zunde-green text-white rounded-full flex items-center justify-center hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 font-medium mt-2">
                🔒 Encrypted · Logged with Zimbabwe DVS
              </p>
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {!isCreating && !activeConv && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center px-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border border-gray-100">
              <Zap size={40} className="text-zunde-green" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Vet Messenger</h3>
            <p className="text-gray-400 font-medium text-sm max-w-xs leading-relaxed mb-8">
              Connect directly with licensed veterinarians and DVS officers. Select a vet above or open a conversation.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <button
                onClick={() => { setIsCreating(true); setSelectedVet(VET_CONTACTS[0]); }}
                className="flex flex-col items-center p-5 bg-white rounded-2xl border-2 border-transparent hover:border-zunde-green shadow-sm hover:shadow-md transition group"
              >
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Zap size={24} className="text-red-500" />
                </div>
                <span className="text-sm font-black text-gray-800">Emergency</span>
                <span className="text-[10px] text-gray-400 font-medium mt-1">Immediate response</span>
              </button>
              <button
                onClick={() => { setIsCreating(true); setSelectedVet(VET_CONTACTS[1]); setNewCase(p => ({ ...p, category: 'Trade Certification' })); }}
                className="flex flex-col items-center p-5 bg-white rounded-2xl border-2 border-transparent hover:border-zunde-green shadow-sm hover:shadow-md transition group"
              >
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <ShieldCheck size={24} className="text-zunde-green" />
                </div>
                <span className="text-sm font-black text-gray-800">Certification</span>
                <span className="text-[10px] text-gray-400 font-medium mt-1">Trade & movement</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetCommunication;

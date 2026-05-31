import React, { useState } from 'react';
import { ZIMBABWE_REGIONS, LOCAL_ADVISORY, EMERGENCY_HOTLINES } from './vetData';
import './VetCommunication.css';

const VetCommunication = ({ animals = [] }) => {
  const [tickets, setTickets] = useState([
    { 
      id: 1, 
      status: 'Resolved', 
      category: 'Consultation', 
      animal: 'Bessie', 
      province: 'Mashonaland West',
      priority: 'Routine',
      subject: 'Nutrition check',
      messages: [{ sender: 'Vet', text: 'Isolation completed. Switch to high-protein lick.' }]
    }
  ]);

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

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const animalName = animals.find(a => a.id == newTicket.animalId)?.name || 'General';
    const priority = newTicket.category === 'Emergency' ? 'Critical' : 'Routine';
    
    const ticket = {
      ...newTicket,
      id: Date.now(),
      status: 'Pending',
      animal: animalName,
      priority: priority,
      messages: [{ sender: 'Farmer', text: newTicket.description }]
    };

    setTickets([ticket, ...tickets]);
    setIsCreating(false);
    setNewTicket({ category: 'Emergency', animalId: '', province: '', district: '', subject: '', description: '' });
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
    <div className="zunde-vet-comm enterprise zim-focused">
      <div className="comm-sidebar">
        <div className="sidebar-header">
          <h3>Consultations</h3>
          <button className="new-ticket-btn" onClick={() => setIsCreating(true)}>+ New Request</button>
        </div>
        
        <div className="ticket-list">
          {tickets.map(t => (
            <div 
              key={t.id} 
              className={`ticket-item ${activeTicket?.id === t.id ? 'active' : ''} ${t.priority.toLowerCase()}`}
              onClick={() => {setActiveTicket(t); setIsCreating(false);}}
            >
              <div className="ticket-meta">
                <span className="status">{t.status}</span>
                <span className="date">#{t.id.toString().slice(-4)}</span>
              </div>
              <strong>{t.subject || 'No Subject'}</strong>
              <p>{t.animal} | {t.province}</p>
            </div>
          ))}
        </div>

        <div className="emergency-section">
          <h4>Zim Vet Hotlines</h4>
          {EMERGENCY_HOTLINES.map(h => (
            <div key={h.office} className="hotline">
              <span>{h.office}</span>
              <strong>{h.phone}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="comm-main">
        {isCreating ? (
          <div className="create-ticket-form">
            <h3>Request Veterinary Assistance</h3>
            <form onSubmit={handleCreateTicket}>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}>
                    <option>Emergency</option>
                    <option>Vaccination</option>
                    <option>Nutrition</option>
                    <option>General Advisory</option>
                  </select>
                </div>
                <div className="field">
                  <label>Animal</label>
                  <select value={newTicket.animalId} onChange={e => setNewTicket({...newTicket, animalId: e.target.value})}>
                    <option value="">Select Animal</option>
                    {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Province</label>
                  <select required value={newTicket.province} onChange={e => setNewTicket({...newTicket, province: e.target.value, district: ''})}>
                    <option value="">Select Province</option>
                    {ZIMBABWE_REGIONS.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>District</label>
                  <select required value={newTicket.district} onChange={e => setNewTicket({...newTicket, district: e.target.value})}>
                    <option value="">Select District</option>
                    {(ZIMBABWE_REGIONS.districts[newTicket.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Suspected January Disease" 
                  required
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>

              <div className="field">
                <label>Description of Symptoms / Inquiry</label>
                <textarea 
                  required
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  placeholder="Describe the situation in detail..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit Request</button>
              </div>
            </form>
          </div>
        ) : activeTicket ? (
          <div className="chat-interface">
            <div className="chat-header">
              <h4>{activeTicket.subject}</h4>
              <span className={`priority-tag ${activeTicket.priority.toLowerCase()}`}>{activeTicket.priority}</span>
            </div>
            <div className="message-log">
              {activeTicket.messages.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.sender.toLowerCase()}`}>
                  <small>{m.sender}</small>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type your message to the veterinarian..." 
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <div className="advisory-portal">
            <div className="portal-hero">
              <h3>Zimbabwe Agricultural Advisory Portal</h3>
              <p>Official guidance for localized livestock management.</p>
            </div>
            <div className="advisory-grid">
              {LOCAL_ADVISORY.map(adv => (
                <div key={adv.id} className="advisory-card">
                  <span className="source">{adv.source}</span>
                  <h4>{adv.topic}</h4>
                  <p>{adv.advice}</p>
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

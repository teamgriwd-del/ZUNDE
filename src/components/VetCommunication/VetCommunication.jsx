import React, { useState } from 'react';
import './VetCommunication.css';

const VetCommunication = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Vet', text: 'Hi Arnold, I reviewed Bessie\'s symptoms. Please isolate her immediately.' },
    { id: 2, sender: 'Farmer', text: 'Okay Doc, I have moved her to the quarantine pen.' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'Farmer', text: input }]);
    setInput('');
  };

  return (
    <div className="zunde-card vet-comm-module">
      <h3>Vet-Farmer Communication</h3>
      <div className="chat-window">
        {messages.map(m => (
          <div key={m.id} className={`message ${m.sender.toLowerCase()}`}>
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a veterinarian..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default VetCommunication;

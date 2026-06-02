import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageCircle, Navigation, Search, HelpCircle } from 'lucide-react';
import { diseaseDatabase } from '../DiseaseDetection/diseaseData';
import { HEALTH_PROTOCOLS } from '../HealthManagement/healthData';
import './ZundeIntelAI.css';

const ZundeIntelAI = ({ setActiveTab, animals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: 'Hello Arnold! I am ZUNDE Intel, your AI agricultural assistant. How can I help you manage your herd today?',
      type: 'text'
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processNLP = (text) => {
    const lowerText = text.toLowerCase();
    
    // 1. Navigation Intents
    if (lowerText.includes('dashboard') || lowerText.includes('overview') || lowerText.includes('home')) {
      setActiveTab('dashboard');
      return { text: "Switching to your Dashboard overview.", type: 'nav' };
    }
    if (lowerText.includes('profile') || lowerText.includes('herd') || lowerText.includes('animal')) {
      setActiveTab('profile');
      return { text: "Opening your Herd Profiles.", type: 'nav' };
    }
    if (lowerText.includes('health') || lowerText.includes('lifecycle') || lowerText.includes('vaccine') || lowerText.includes('gestation')) {
      setActiveTab('health');
      return { text: "Navigating to Lifecycle & Health Management.", type: 'nav' };
    }
    if (lowerText.includes('diagnos') || lowerText.includes('symptom') || lowerText.includes('check') || lowerText.includes('sick')) {
      setActiveTab('disease');
      return { text: "Opening the Enterprise Diagnostic engine.", type: 'nav' };
    }
    if (lowerText.includes('vet') || lowerText.includes('chat') || lowerText.includes('advisor')) {
      setActiveTab('vet');
      return { text: "Connecting you to the Veterinary Advisory portal.", type: 'nav' };
    }
    if (lowerText.includes('iot') || lowerText.includes('sensor') || lowerText.includes('live') || lowerText.includes('feed')) {
      setActiveTab('iot');
      return { text: "Opening your Live IoT Health Feed.", type: 'nav' };
    }

    // 2. Deep Knowledge Queries (Disease)
    const matchedDisease = diseaseDatabase.find(d => lowerText.includes(d.name.toLowerCase()));
    if (matchedDisease) {
      return { 
        text: `Found information on ${matchedDisease.name}. Severity: ${matchedDisease.severity}. Action Plan: ${matchedDisease.actionPlan[0]}`,
        type: 'info' 
      };
    }

    // 3. Deep Knowledge Queries (Lifecycle)
    if (lowerText.includes('gestation')) {
      if (lowerText.includes('cow') || lowerText.includes('cattle')) return { text: `Cattle have a gestation period of ${HEALTH_PROTOCOLS.Cattle.gestation} days.`, type: 'info' };
      if (lowerText.includes('goat')) return { text: `Goats have a gestation period of ${HEALTH_PROTOCOLS.Goat.gestation} days.`, type: 'info' };
      if (lowerText.includes('sheep')) return { text: `Sheep have a gestation period of ${HEALTH_PROTOCOLS.Sheep.gestation} days.`, type: 'info' };
      if (lowerText.includes('pig')) return { text: `Pigs have a gestation period of ${HEALTH_PROTOCOLS.Pig.gestation} days.`, type: 'info' };
    }

    if (lowerText.includes('weaning')) {
      if (lowerText.includes('cow') || lowerText.includes('cattle')) return { text: `Standard weaning age for cattle is ${HEALTH_PROTOCOLS.Cattle.weaningAge} days (approx 7 months).`, type: 'info' };
    }

    // 4. Herd Status Queries
    if (lowerText.includes('how many') || lowerText.includes('total')) {
      return { text: `You currently have ${animals.length} animals in your enterprise herd.`, type: 'info' };
    }

    // 5. Default Response
    return { text: "I'm not quite sure about that. Try asking about your herd, specific diseases, or ask me to navigate to a module (e.g., 'show me the IoT feed').", type: 'help' };
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI thinking
    setTimeout(() => {
      const response = processNLP(input);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', ...response };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`zunde-ai-toggle shadow-2xl transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Bot size={28} />
        <span className="ping-online"></span>
      </button>

      {/* AI Panel */}
      <div className={`zunde-ai-panel shadow-2xl transition-all duration-500 ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="ai-header">
          <div className="flex items-center space-x-3">
            <div className="ai-avatar bg-yellow-400 text-zunde-green p-2 rounded-xl">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-black text-white leading-none">ZUNDE Intel</h3>
              <span className="text-[10px] text-green-300 font-bold uppercase tracking-widest">Active Neural Engine</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="ai-messages scrollbar-hide">
          {messages.map(m => (
            <div key={m.id} className={`ai-msg-wrapper ${m.sender}`}>
              <div className={`ai-bubble ${m.type}`}>
                {m.type === 'nav' && <Navigation size={12} className="mb-1 opacity-50" />}
                {m.type === 'info' && <Search size={12} className="mb-1 opacity-50" />}
                {m.type === 'help' && <HelpCircle size={12} className="mb-1 opacity-50" />}
                <p>{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="ai-input-area">
          <input 
            type="text" 
            placeholder="Ask ZUNDE Intel anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="focus:outline-none"
          />
          <button type="submit" className="bg-zunde-green text-white p-2 rounded-xl hover:bg-green-700 transition">
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

export default ZundeIntelAI;

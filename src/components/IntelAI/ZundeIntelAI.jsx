import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageCircle, Navigation, Search, HelpCircle, ShieldCheck } from 'lucide-react';
import { diseaseDatabase } from '../DiseaseDetection/diseaseData';
import { HEALTH_PROTOCOLS } from '../HealthManagement/healthData';
import { ZIMBABWE_REGIONS, LOCAL_ADVISORY } from '../VetCommunication/vetData';
import './ZundeIntelAI.css';

const JindaRaMambo = ({ setActiveTab, animals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: 'Mwauya nei? I am Jinda RaMambo, your loyal messenger. I am here to help you manage your ZUNDE RaMambo herd. Ask me anything in simple terms, or tell me where you want to go.',
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

  // --- KNOWLEDGE BASE TRAINING DATA ---
  const knowledgeBase = {
    greetings: ['hi', 'hello', 'mangwanani', 'maswera', 'mwauya'],
    navigation: {
      dashboard: ['home', 'dashboard', 'overview', 'main', 'start'],
      profiles: ['herd', 'animals', 'profiles', 'list', 'cow', 'goat', 'sheep', 'id', 'tag'],
      health: ['vaccine', 'health', 'lifecycle', 'born', 'pregnant', 'gestation', 'weaning', 'calendar'],
      diagnostics: ['sick', 'symptoms', 'illness', 'check', 'diagnose', 'disease', 'medicine'],
      vet: ['vet', 'doctor', 'advisor', 'expert', 'help', 'emergency', 'outbreak', 'agritex'],
      iot: ['live', 'sensor', 'feed', 'temp', 'tracker', 'gps', 'movement', 'iot']
    },
    quickTips: [
      "Follow the 5-5-4 dipping schedule to prevent January Disease.",
      "Cattle weaning should happen around 7 months (210 days).",
      "Isolate any animal with blisters or lameness immediately.",
      "Check your IoT feed for 'Perimeter Breach' alerts to prevent livestock theft."
    ]
  };

  const processNLP = (text) => {
    const lowerText = text.toLowerCase();
    
    // 1. Simple Greetings
    if (knowledgeBase.greetings.some(g => lowerText.includes(g))) {
        return { text: "Salutations! How can I serve you and your herd today?", type: 'text' };
    }

    // 2. Trained Navigation Intents
    for (const [tab, keywords] of Object.entries(knowledgeBase.navigation)) {
      if (keywords.some(k => lowerText.includes(k))) {
        const targetTab = tab === 'diagnostics' ? 'disease' : (tab === 'profiles' ? 'profile' : tab);
        setActiveTab(targetTab);
        return { text: `Understood. I am taking you to the ${tab.charAt(0).toUpperCase() + tab.slice(1)} section now.`, type: 'nav' };
      }
    }

    // 3. Deep Knowledge: Cattle Health & Regional Logic
    if (lowerText.includes('january') || lowerText.includes('tick') || lowerText.includes('theiler')) {
      return { 
        text: "January Disease (Theileriosis) is a major threat in Zimbabwe. You must follow the 5-5-4 dipping cycle and apply tick grease in the ears and under the tail. Check your Diagnostics tab for a full action plan.",
        type: 'info' 
      };
    }

    if (lowerText.includes('anthrax')) {
      const anthrax = diseaseDatabase.find(d => d.name === "Anthrax");
      return { 
        text: `DANGER: ${anthrax.actionPlan[0]} ${anthrax.actionPlan[1]} Please report this to your regional Vet office immediately via the Advisory tab.`,
        type: 'info'
      };
    }

    // 4. Deep Knowledge: Lifecycle Protocols
    if (lowerText.includes('gestation') || lowerText.includes('pregnant')) {
        let species = 'Cattle';
        if (lowerText.includes('goat')) species = 'Goat';
        if (lowerText.includes('sheep')) species = 'Sheep';
        if (lowerText.includes('pig')) species = 'Pig';
        const days = HEALTH_PROTOCOLS[species].gestation;
        return { text: `${species} have a gestation period of ${days} days. You can track individual due dates in the Lifecycle tab.`, type: 'info' };
    }

    if (lowerText.includes('wean')) {
        return { text: `For Cattle, weaning should be done at ${HEALTH_PROTOCOLS.Cattle.weaningAge} days. I can calculate the exact date for each animal if you look at their Profile.`, type: 'info' };
    }

    // 5. IoT & Security Logic
    if (lowerText.includes('thief') || lowerText.includes('stole') || lowerText.includes('where') || lowerText.includes('security')) {
        return { text: "I monitor animal movement 24/7. Check the Live IoT Feed for 'Perimeter Breach' alerts. If an animal leaves the safe zone, I will flag it in Red immediately.", type: 'info' };
    }

    // 6. Herd Analytics
    if (lowerText.includes('how many') || lowerText.includes('total') || lowerText.includes('size')) {
        return { text: `Your ZUNDE RaMambo enterprise currently manages ${animals.length} animals.`, type: 'info' };
    }

    if (lowerText.includes('help') || lowerText.includes('what can you do')) {
        return { text: "I can help you navigate (e.g. 'Show me the vet'), answer health questions (e.g. 'How to treat ticks?'), or give herd stats. I am trained on Zimbabwean farming standards.", type: 'help' };
    }

    // 7. Default for Non-Technical users
    const randomTip = knowledgeBase.quickTips[Math.floor(Math.random() * knowledgeBase.quickTips.length)];
    return { 
        text: `I'm not exactly sure how to answer that yet, but here is a tip: ${randomTip}`, 
        type: 'help' 
    };
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const response = processNLP(input);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', ...response };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`zunde-ai-toggle shadow-2xl transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
        style={{ background: '#1b5e20', border: '4px solid #fbc02d' }}
      >
        <MessageCircle size={28} />
        <span className="ping-online"></span>
      </button>

      <div className={`zunde-ai-panel shadow-2xl transition-all duration-500 ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="ai-header" style={{ background: 'linear-gradient(to bottom, #1b5e20, #2e7d32)' }}>
          <div className="flex items-center space-x-3">
            <div className="ai-avatar bg-yellow-400 text-zunde-green p-2 rounded-xl shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-white leading-none text-lg">Jinda RaMambo</h3>
              <span className="text-[9px] text-yellow-400 font-black uppercase tracking-[2px]">Royal Herd Messenger</span>
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
                {m.type === 'nav' && <Navigation size={12} className="mb-1 text-yellow-600" />}
                {m.type === 'info' && <ShieldCheck size={12} className="mb-1 text-blue-600" />}
                <p>{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="ai-input-area">
          <input 
            type="text" 
            placeholder="Ask Jinda anything (e.g. 'Show sensors')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="focus:outline-none font-bold text-sm"
          />
          <button type="submit" className="bg-zunde-green text-white p-2.5 rounded-xl hover:bg-green-700 transition shadow-lg">
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

export default JindaRaMambo;

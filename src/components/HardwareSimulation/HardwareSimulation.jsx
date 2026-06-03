import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Activity, Thermometer, Heart, MapPin, AlertTriangle, CheckCircle, 
  ShieldCheck, Zap, Signal, Map as MapIcon, Gauge, Eye
} from 'lucide-react';
import './HardwareSimulation.css';

const HardwareSimulation = ({ animals = [] }) => {
  const [history, setHistory] = useState([]);
  const [currentData, setCurrentData] = useState({
    temperature: 38.5,
    heartRate: 72,
    activity: 'Normal',
    lat: -17.3601,
    lon: 30.1918,
    status: 'Healthy',
    vitalityScore: 98,
    battery: 88,
    signal: 'Strong'
  });

  const [alerts, setAlerts] = useState([]);
  const tempBuffer = useRef([]);
  const hrBuffer = useRef([]);

  const SAFE_ZONE = { lat: -17.3601, lon: 30.1918, radius: 0.005 };

  // --- HEATMAP DATA (Simulated) ---
  const [heatmapData] = useState([
    { area: 'North Paddock', activity: 85 },
    { area: 'Water Point', activity: 60 },
    { area: 'Shade Tree', activity: 95 },
    { area: 'East Fence', activity: 20 },
    { area: 'Gate A', activity: 40 }
  ]);

  const calculateMovingAverage = (buffer, newValue, limit = 3) => {
    buffer.push(newValue);
    if (buffer.length > limit) buffer.shift();
    const sum = buffer.reduce((a, b) => a + b, 0);
    return (sum / buffer.length).toFixed(1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const rawTemp = 37.8 + Math.random() * 2.5;
      const rawHR = 65 + Math.random() * 40;
      const filteredTemp = parseFloat(calculateMovingAverage(tempBuffer.current, rawTemp));
      const filteredHR = Math.round(calculateMovingAverage(hrBuffer.current, rawHR));

      const latDrift = -17.3601 + (Math.random() - 0.5) * 0.015;
      const lonDrift = 30.1918 + (Math.random() - 0.5) * 0.015;

      let vitality = 100;
      if (filteredTemp > 39.5) vitality -= 25;
      if (filteredHR > 95) vitality -= 20;
      const dist = Math.sqrt(Math.pow(latDrift - SAFE_ZONE.lat, 2) + Math.pow(lonDrift - SAFE_ZONE.lon, 2));
      const isBreach = dist > SAFE_ZONE.radius;
      if (isBreach) vitality -= 30;
      vitality = Math.max(0, vitality);

      let status = vitality > 85 ? 'Optimal' : (vitality > 60 ? 'Caution' : 'Critical');
      let newAlerts = [];
      
      if (filteredTemp > 40.2) newAlerts.push({ id: Date.now(), type: 'Health', msg: `Fever confirmed in Focus Animal` });
      if (isBreach) newAlerts.push({ id: Date.now() + 1, type: 'Security', msg: 'Perimeter Breach Detected' });

      const newData = {
        time: new Date().toLocaleTimeString().slice(0, 8),
        temperature: filteredTemp,
        heartRate: filteredHR,
        activity: filteredHR > 95 ? 'High' : (filteredHR < 70 ? 'Low' : 'Normal'),
        lat: latDrift.toFixed(4),
        lon: lonDrift.toFixed(4),
        status: status,
        vitalityScore: vitality,
        battery: 88,
        signal: 'Strong'
      };

      setCurrentData(newData);
      setHistory(prev => [...prev.slice(-14), newData]);
      if (newAlerts.length > 0) setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="zunde-iot-dashboard enterprise high-confidence p-8 bg-gray-50 h-full overflow-y-auto">
      
      {/* 1. TOP HEADER: SYSTEM INTEGRITY */}
      <div className="iot-header flex justify-between items-center mb-8 bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
        <div className="text-left">
          <h2 className="text-2xl font-black text-gray-800 leading-none">IoT Precision Ranching</h2>
          <div className="flex items-center space-x-3 mt-2">
            <span className="flex items-center bg-green-50 text-zunde-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                <Zap size={10} className="mr-1" /> System Online
            </span>
            <span className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <Signal size={10} className="mr-1 text-blue-500" /> Mesh Strength: 98%
            </span>
          </div>
        </div>
        <div className="hardware-status-pills flex items-center space-x-4">
            <div className="text-right">
                <span className="text-[10px] font-black text-gray-300 uppercase block tracking-tighter">Focus Tag Battery</span>
                <strong className="text-sm font-black text-gray-800">{currentData.battery}%</strong>
            </div>
            <div className="w-12 h-6 bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200">
                <div className="h-full bg-green-500 transition-all duration-1000" style={{width: `${currentData.battery}%`}}></div>
            </div>
        </div>
      </div>

      <div className="iot-main-grid grid grid-cols-3 gap-8 text-left">
        
        {/* LEFT COLUMN: REAL-TIME VITALS */}
        <div className="col-span-2 space-y-8">
            
            {/* 2. VITAL TILES: SENSOR FUSION */}
            <div className="vitality-summary bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-gray-800 flex items-center">
                        <Gauge size={20} className="mr-2 text-zunde-green" /> Herd Vitality Analysis
                    </h3>
                    <div className="confidence-badge flex items-center bg-yellow-400 text-zunde-green px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <ShieldCheck size={14} className="mr-2" /> Signal Verified
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="sensor-card bg-gray-50 p-6 rounded-[30px] border border-transparent hover:border-zunde-green transition">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-white rounded-2xl text-zunde-green shadow-sm"><Thermometer size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Body Temp</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                            <strong className={`text-3xl font-black ${currentData.temperature > 39.8 ? 'text-red-500' : 'text-gray-800'}`}>{currentData.temperature}</strong>
                            <span className="text-sm font-black text-gray-400 uppercase">°C</span>
                        </div>
                    </div>

                    <div className="sensor-card bg-gray-50 p-6 rounded-[30px] border border-transparent hover:border-blue-500 transition">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm"><Heart size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Heart Rate</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                            <strong className="text-3xl font-black text-gray-800">{currentData.heartRate}</strong>
                            <span className="text-sm font-black text-gray-400 uppercase">BPM</span>
                        </div>
                    </div>

                    <div className="sensor-card bg-gray-50 p-6 rounded-[30px] border border-transparent hover:border-orange-500 transition">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-white rounded-2xl text-orange-500 shadow-sm"><Activity size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Activity</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                            <strong className="text-2xl font-black text-gray-800">{currentData.activity}</strong>
                        </div>
                    </div>
                </div>

                <div className="vitality-meter-box bg-gray-50 p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-[2px]">Herd Vitality Index</span>
                        <strong className={`text-sm font-black uppercase ${currentData.vitalityScore < 70 ? 'text-red-500' : 'text-zunde-green'}`}>{currentData.status}</strong>
                    </div>
                    <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner p-1">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${currentData.vitalityScore < 70 ? 'bg-red-500' : 'bg-zunde-green'}`} 
                            style={{width: `${currentData.vitalityScore}%`, boxShadow: '0 0 10px rgba(0,0,0,0.1)'}}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 3. HISTORICAL TREND: HIGH-SIGNAL ANALYSIS */}
            <div className="chart-section bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-gray-800">Vital Health Trends</h3>
                    <div className="flex space-x-2">
                        <button className="px-4 py-1.5 bg-zunde-green text-white text-[10px] font-black uppercase rounded-full">24 Hours</button>
                        <button className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-full">7 Days</button>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorIOT" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1b5e20" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#1b5e20" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="time" fontSize={10} fontWeight="bold" stroke="#ccc" />
                            <YAxis fontSize={10} fontWeight="bold" stroke="#ccc" />
                            <Tooltip />
                            <Area type="monotone" dataKey="temperature" stroke="#1b5e20" fillOpacity={1} fill="url(#colorIOT)" strokeWidth={4} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & SPATIAL INTELLIGENCE */}
        <div className="col-span-1 space-y-8">
            
            {/* 4. GEOFENCING: SECURITY MODULE */}
            <div className="security-card bg-gray-900 p-8 rounded-[40px] border-4 border-zunde-green/20 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center">
                            <MapIcon size={18} className="mr-2 text-zunde-green" /> Smart Geofencing
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                    </div>

                    <div className="geo-visual-center mb-8 flex justify-center">
                        <div className="w-48 h-48 rounded-full border-2 border-dashed border-zunde-green/30 flex items-center justify-center relative bg-zunde-green/5">
                            <div className="absolute inset-4 rounded-full border border-zunde-green/10"></div>
                            <div className={`animal-tracker-node w-4 h-4 rounded-full shadow-lg transition-all duration-1000 ${currentData.status === 'Perimeter Breach' ? 'bg-red-500 scale-150' : 'bg-zunde-green'}`} 
                                 style={{ 
                                    transform: `translate(${(Math.random()-0.5)*40}px, ${(Math.random()-0.5)*40}px)` 
                                 }}>
                            </div>
                            <span className="absolute bottom-[-20px] text-[8px] font-black text-gray-500 uppercase tracking-widest">Safe Zone: 500m Radius</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-12">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Latitude</span>
                            <strong className="text-white text-sm font-black">{currentData.lat}</strong>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Longitude</span>
                            <strong className="text-white text-sm font-black">{currentData.lon}</strong>
                        </div>
                    </div>
                </div>
                {/* Background Radar Sweeps */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-zunde-green/5 rounded-full"></div>
            </div>

            {/* 5. GRAZING HEATMAP: PRODUCTIVITY LOGIC */}
            <div className="heatmap-section bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center">
                    <Eye size={16} className="mr-2 text-zunde-green" /> Grazing Intensity
                </h3>
                <div className="space-y-4">
                    {heatmapData.map(d => (
                        <div key={d.area} className="group cursor-default">
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase mb-2">
                                <span>{d.area}</span>
                                <span className="text-gray-800 opacity-0 group-hover:opacity-100 transition">{d.activity}% Utilization</span>
                            </div>
                            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-zunde-green transition-all duration-500" style={{width: `${d.activity}%`, opacity: d.activity/100 + 0.2}}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. SYSTEM ALERTS PANEL */}
            <div className="alerts-panel bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">IoT System Alerts</h3>
                <div className="space-y-3">
                    {alerts.length === 0 ? (
                        <div className="flex items-center space-x-3 text-gray-300 italic py-4">
                            <CheckCircle size={16} />
                            <span className="text-xs font-bold">No hardware events.</span>
                        </div>
                    ) : (
                        alerts.map(a => (
                            <div key={a.id} className={`flex items-start space-x-3 p-4 rounded-2xl border-l-4 ${a.type === 'Security' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-orange-50 border-orange-500 text-orange-700'}`}>
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                <div>
                                    <strong className="text-[10px] font-black uppercase block leading-none mb-1">{a.type} Event</strong>
                                    <p className="text-[11px] font-bold leading-tight">{a.msg}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HardwareSimulation;

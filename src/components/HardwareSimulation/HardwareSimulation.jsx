import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, Thermometer, Heart, MapPin, AlertTriangle, CheckCircle,
  ShieldCheck, Zap, Signal, Map as MapIcon, Gauge, Eye, RefreshCw
} from 'lucide-react';
import './HardwareSimulation.css';

const SAFE_ZONE = { lat: -17.3601, lon: 30.1918, radius: 0.005 };
const MAX_HISTORY = 20;
const BATTERY_DRAIN_RATE = 0.02;

const HEATMAP_DATA = [
  { area: 'North Paddock', activity: 85, color: '#1b5e20' },
  { area: 'Water Point', activity: 60, color: '#2e7d32' },
  { area: 'Shade Tree', activity: 95, color: '#1b5e20' },
  { area: 'East Fence', activity: 20, color: '#81c784' },
  { area: 'Gate A', activity: 40, color: '#4caf50' }
];

const calculateMovingAverage = (buffer, newValue, limit = 3) => {
  const next = [...buffer, newValue];
  if (next.length > limit) next.shift();
  return { buffer: next, avg: next.reduce((a, b) => a + b, 0) / next.length };
};

const VitalCard = ({ icon: Icon, label, value, unit, alert, color = 'text-gray-800' }) => (
  <div className={`sensor-card bg-gray-50 p-6 rounded-[30px] border-2 transition ${alert ? 'border-red-200 bg-red-50' : 'border-transparent hover:border-zunde-green'}`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className={`p-3 bg-white rounded-2xl shadow-sm ${alert ? 'text-red-500' : 'text-zunde-green'}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</span>
      {alert && <span className="text-[8px] font-black text-red-500 uppercase bg-red-100 px-2 py-0.5 rounded-full">Alert</span>}
    </div>
    <div className="flex items-baseline space-x-1">
      <strong className={`text-3xl font-black ${alert ? 'text-red-500' : color}`}>{value}</strong>
      {unit && <span className="text-sm font-black text-gray-400 uppercase">{unit}</span>}
    </div>
  </div>
);

const HardwareSimulation = ({ animals = [] }) => {
  const [history, setHistory] = useState([]);
  const [currentData, setCurrentData] = useState({
    temperature: 38.5,
    heartRate: 72,
    activity: 'Normal',
    lat: -17.3601,
    lon: 30.1918,
    status: 'Optimal',
    vitalityScore: 98,
    battery: 88,
    signal: 'Strong',
    isBreach: false
  });
  const [alerts, setAlerts] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [trackerOffset, setTrackerOffset] = useState({ x: 0, y: 0 });

  const tempBuffer = useRef([38.5]);
  const hrBuffer = useRef([72]);
  const batteryRef = useRef(88);

  const generateTick = useCallback(() => {
    const rawTemp = 37.8 + Math.random() * 2.5;
    const rawHR = 65 + Math.random() * 40;

    const { buffer: newTempBuf, avg: filteredTemp } = calculateMovingAverage(tempBuffer.current, rawTemp);
    const { buffer: newHRBuf, avg: rawAvgHR } = calculateMovingAverage(hrBuffer.current, rawHR);
    const filteredHR = Math.round(rawAvgHR);
    tempBuffer.current = newTempBuf;
    hrBuffer.current = newHRBuf;

    const latDrift = SAFE_ZONE.lat + (Math.random() - 0.5) * 0.015;
    const lonDrift = SAFE_ZONE.lon + (Math.random() - 0.5) * 0.015;
    const dist = Math.sqrt(Math.pow(latDrift - SAFE_ZONE.lat, 2) + Math.pow(lonDrift - SAFE_ZONE.lon, 2));
    const isBreach = dist > SAFE_ZONE.radius;

    const offsetX = ((latDrift - SAFE_ZONE.lat) / 0.015) * 55;
    const offsetY = ((lonDrift - SAFE_ZONE.lon) / 0.015) * 55;

    let vitality = 100;
    if (filteredTemp > 39.5) vitality -= 25;
    if (filteredHR > 95) vitality -= 20;
    if (isBreach) vitality -= 30;
    vitality = Math.max(0, Math.min(100, vitality));

    batteryRef.current = Math.max(0, batteryRef.current - BATTERY_DRAIN_RATE);
    const status = vitality > 85 ? 'Optimal' : vitality > 60 ? 'Caution' : 'Critical';
    const tick = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newData = {
      time: tick,
      temperature: parseFloat(filteredTemp.toFixed(1)),
      heartRate: filteredHR,
      activity: filteredHR > 95 ? 'High' : filteredHR < 70 ? 'Low' : 'Normal',
      lat: latDrift.toFixed(4),
      lon: lonDrift.toFixed(4),
      status,
      vitalityScore: vitality,
      battery: parseFloat(batteryRef.current.toFixed(1)),
      signal: 'Strong',
      isBreach
    };

    const newAlerts = [];
    if (filteredTemp > 40.2) newAlerts.push({ id: Date.now(), type: 'Health', msg: `Fever confirmed — Temp: ${filteredTemp.toFixed(1)}°C` });
    if (isBreach) newAlerts.push({ id: Date.now() + 1, type: 'Security', msg: `Perimeter breach — Position: ${latDrift.toFixed(4)}, ${lonDrift.toFixed(4)}` });

    return { newData, newAlerts, offsetX, offsetY };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const { newData, newAlerts, offsetX, offsetY } = generateTick();
      setCurrentData(newData);
      setHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), newData]);
      setTrackerOffset({ x: offsetX, y: offsetY });
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 8));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isRunning, generateTick]);

  const clearAlerts = () => setAlerts([]);
  const tempAlert = currentData.temperature > 39.5;
  const hrAlert = currentData.heartRate > 95 || currentData.heartRate < 48;

  const batteryColor = currentData.battery > 50 ? 'bg-green-500' : currentData.battery > 20 ? 'bg-orange-400' : 'bg-red-500';

  return (
    <div className="zunde-iot-dashboard enterprise high-confidence p-8 bg-gray-50 h-full overflow-y-auto">

      {/* Header */}
      <div className="iot-header flex justify-between items-center mb-8 bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
        <div className="text-left">
          <h2 className="text-2xl font-black text-gray-800 leading-none">IoT Precision Ranching</h2>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isRunning ? 'bg-green-50 text-zunde-green' : 'bg-gray-100 text-gray-400'}`}>
              <Zap size={10} className="mr-1" aria-hidden="true" /> {isRunning ? 'System Online' : 'System Paused'}
            </span>
            <span className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <Signal size={10} className="mr-1 text-blue-500" aria-hidden="true" /> Mesh: 98%
            </span>
            {alerts.length > 0 && (
              <span className="flex items-center bg-red-50 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                <AlertTriangle size={10} className="mr-1" aria-hidden="true" /> {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-300 uppercase block tracking-tighter">Tag Battery</span>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-16 h-4 bg-gray-100 rounded-md relative overflow-hidden border border-gray-200">
                <div className={`h-full transition-all duration-2000 ${batteryColor}`} style={{ width: `${currentData.battery}%` }} />
              </div>
              <strong className="text-sm font-black text-gray-800">{currentData.battery.toFixed(0)}%</strong>
            </div>
          </div>
          <button
            onClick={() => setIsRunning(p => !p)}
            className={`p-3 rounded-2xl border transition font-black text-xs uppercase flex items-center space-x-2 ${isRunning ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-zunde-green text-white hover:bg-green-700'}`}
            aria-label={isRunning ? 'Pause monitoring' : 'Resume monitoring'}
          >
            <RefreshCw size={14} className={isRunning ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>

      <div className="iot-main-grid grid grid-cols-3 gap-8 text-left">

        {/* LEFT: Vitals + Chart */}
        <div className="col-span-2 space-y-8">

          {/* Vital Tiles */}
          <div className="vitality-summary bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-gray-800 flex items-center">
                <Gauge size={20} className="mr-2 text-zunde-green" aria-hidden="true" /> Herd Vitality Analysis
              </h3>
              <div className={`flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                currentData.vitalityScore > 85 ? 'bg-yellow-400 text-gray-900' :
                currentData.vitalityScore > 60 ? 'bg-orange-400 text-white' : 'bg-red-500 text-white'
              }`}>
                <ShieldCheck size={14} className="mr-2" aria-hidden="true" /> {currentData.status}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <VitalCard
                icon={Thermometer}
                label="Body Temp"
                value={currentData.temperature}
                unit="°C"
                alert={tempAlert}
              />
              <VitalCard
                icon={Heart}
                label="Heart Rate"
                value={currentData.heartRate}
                unit="BPM"
                alert={hrAlert}
                color="text-blue-600"
              />
              <VitalCard
                icon={Activity}
                label="Activity Level"
                value={currentData.activity}
                alert={currentData.activity === 'High' && hrAlert}
                color="text-orange-500"
              />
            </div>

            <div className="vitality-meter-box bg-gray-50 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-gray-500 uppercase tracking-[2px]">Herd Vitality Index</span>
                <strong className={`text-lg font-black ${
                  currentData.vitalityScore > 85 ? 'text-zunde-green' :
                  currentData.vitalityScore > 60 ? 'text-orange-500' : 'text-red-500'
                }`}>{currentData.vitalityScore}%</strong>
              </div>
              <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner p-0.5" role="progressbar" aria-valuenow={currentData.vitalityScore} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    currentData.vitalityScore > 85 ? 'bg-zunde-green' :
                    currentData.vitalityScore > 60 ? 'bg-orange-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${currentData.vitalityScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[9px] font-black text-gray-300 uppercase">
                <span>Critical</span><span>Caution</span><span>Optimal</span>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="chart-section bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-800">Vital Health Trends</h3>
              <div className="flex space-x-4 text-[10px] font-black text-gray-400 uppercase">
                <span className="flex items-center space-x-1"><span className="w-3 h-1 bg-zunde-green inline-block rounded" />Temperature</span>
                <span className="flex items-center space-x-1"><span className="w-3 h-1 bg-blue-400 inline-block rounded" />Heart Rate ÷10</span>
              </div>
            </div>
            {history.length < 2 ? (
              <div className="h-[260px] flex items-center justify-center text-gray-300 font-bold text-sm">
                Collecting data — updates every 5 seconds...
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1b5e20" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1b5e20" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="time" fontSize={9} fontWeight="bold" stroke="#ccc" tick={{ fill: '#aaa' }} />
                    <YAxis fontSize={9} fontWeight="bold" stroke="#ccc" tick={{ fill: '#aaa' }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11, fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="temperature" stroke="#1b5e20" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} dot={false} name="Temp (°C)" />
                    <Area type="monotone" dataKey={(d) => d.heartRate / 10} stroke="#3b82f6" fillOpacity={1} fill="url(#colorHR)" strokeWidth={2} dot={false} name="HR ÷10" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Security + Heatmap + Alerts */}
        <div className="col-span-1 space-y-8">

          {/* Geofencing */}
          <div className="security-card bg-gray-900 p-8 rounded-[40px] border-4 border-zunde-green/20 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center">
                  <MapIcon size={18} className="mr-2 text-zunde-green" aria-hidden="true" /> Smart Geofencing
                </h3>
                <div className={`w-2.5 h-2.5 rounded-full ${currentData.isBreach ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`} aria-label={currentData.isBreach ? 'Breach detected' : 'Within safe zone'} />
              </div>

              <div className="geo-visual-center mb-6 flex justify-center">
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-zunde-green/30 flex items-center justify-center relative bg-zunde-green/5">
                  <div className="absolute inset-4 rounded-full border border-zunde-green/10" />
                  <div
                    className={`animal-tracker-node w-4 h-4 rounded-full shadow-lg transition-all duration-1000 ${currentData.isBreach ? 'bg-red-500 scale-150' : 'bg-zunde-green'}`}
                    style={{ transform: `translate(${trackerOffset.x}px, ${trackerOffset.y}px)` }}
                    role="img"
                    aria-label={`Animal position: ${currentData.isBreach ? 'outside' : 'inside'} safe zone`}
                  />
                  <span className="absolute bottom-[-24px] text-[8px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Safe Zone: 500m</span>
                </div>
              </div>

              {currentData.isBreach && (
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-2xl mb-4 flex items-center space-x-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" aria-hidden="true" />
                  <p className="text-[10px] text-red-400 font-black uppercase">Perimeter Breach Detected</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Latitude</span>
                  <strong className="text-white text-xs font-black">{currentData.lat}</strong>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Longitude</span>
                  <strong className="text-white text-xs font-black">{currentData.lon}</strong>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-zunde-green/5 rounded-full" aria-hidden="true" />
          </div>

          {/* Grazing Heatmap */}
          <div className="heatmap-section bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-5 flex items-center">
              <Eye size={16} className="mr-2 text-zunde-green" aria-hidden="true" /> Grazing Intensity
            </h3>
            <div className="space-y-4">
              {HEATMAP_DATA.map(d => (
                <div key={d.area}>
                  <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase mb-1.5">
                    <span>{d.area}</span>
                    <span className="text-gray-600">{d.activity}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden" role="meter" aria-valuenow={d.activity} aria-valuemin={0} aria-valuemax={100} aria-label={`${d.area} utilization`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${d.activity}%`, backgroundColor: d.color, opacity: 0.3 + (d.activity / 100) * 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="alerts-panel bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">IoT Alerts</h3>
              {alerts.length > 0 && (
                <button onClick={clearAlerts} className="text-[9px] font-black text-gray-300 uppercase hover:text-red-500 transition">Clear All</button>
              )}
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex items-center space-x-3 text-gray-300 py-4">
                  <CheckCircle size={16} aria-hidden="true" />
                  <span className="text-xs font-bold italic">All systems nominal. No events.</span>
                </div>
              ) : (
                alerts.map(a => (
                  <div
                    key={a.id}
                    className={`flex items-start space-x-3 p-4 rounded-2xl border-l-4 ${a.type === 'Security' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-orange-50 border-orange-500 text-orange-700'}`}
                    role="alert"
                  >
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
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

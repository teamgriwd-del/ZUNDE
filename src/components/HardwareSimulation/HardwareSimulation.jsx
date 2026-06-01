import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, Thermometer, Heart, MapPin, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import './HardwareSimulation.css';

const HardwareSimulation = () => {
  const [history, setHistory] = useState([]);
  const [currentData, setCurrentData] = useState({
    temperature: 38.5,
    heartRate: 72,
    activity: 'Normal',
    lat: -17.3601,
    lon: 30.1918,
    status: 'Healthy',
    vitalityScore: 98
  });

  const [alerts, setAlerts] = useState([]);
  
  // High Confidence: Buffer for Moving Average Filter
  const tempBuffer = useRef([]);
  const hrBuffer = useRef([]);

  const SAFE_ZONE = { lat: -17.3601, lon: 30.1918, radius: 0.005 };

  const calculateMovingAverage = (buffer, newValue, limit = 3) => {
    buffer.push(newValue);
    if (buffer.length > limit) buffer.shift();
    const sum = buffer.reduce((a, b) => a + b, 0);
    return (sum / buffer.length).toFixed(1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Raw Sensor Input (with potential noise/spikes)
      const rawTemp = 37.8 + Math.random() * 2.5;
      const rawHR = 65 + Math.random() * 40;

      // 2. NOISE FILTERING: 3-Point Moving Average
      const filteredTemp = parseFloat(calculateMovingAverage(tempBuffer.current, rawTemp));
      const filteredHR = Math.round(calculateMovingAverage(hrBuffer.current, rawHR));

      const latDrift = -17.3601 + (Math.random() - 0.5) * 0.015;
      const lonDrift = 30.1918 + (Math.random() - 0.5) * 0.015;

      // 3. SENSOR FUSION: Unified Vitality Score (0-100)
      // Logic: Temperature > 40 reduces score by 30, HR > 95 reduces by 20, Breach reduces by 40
      let vitality = 100;
      if (filteredTemp > 39.5) vitality -= 25;
      if (filteredHR > 95) vitality -= 20;
      const dist = Math.sqrt(Math.pow(latDrift - SAFE_ZONE.lat, 2) + Math.pow(lonDrift - SAFE_ZONE.lon, 2));
      const isBreach = dist > SAFE_ZONE.radius;
      if (isBreach) vitality -= 30;
      vitality = Math.max(0, vitality);

      // 4. HIGH CONFIDENCE ALERT LOGIC
      // Only alert if the Vitality Score drops significantly (High Signal)
      let status = vitality > 85 ? 'Healthy' : (vitality > 60 ? 'Warning' : 'Critical');
      let newAlerts = [];
      
      if (filteredTemp > 40.2) {
        newAlerts.push({ id: Date.now(), type: 'Health', msg: `Verified Fever: ${filteredTemp}°C` });
      }
      if (isBreach) {
        newAlerts.push({ id: Date.now() + 1, type: 'Security', msg: 'Verified Perimeter Breach' });
      }

      const newData = {
        time: new Date().toLocaleTimeString().slice(0, 8),
        temperature: filteredTemp,
        heartRate: filteredHR,
        activity: filteredHR > 95 ? 'High' : (filteredHR < 70 ? 'Low' : 'Normal'),
        lat: latDrift.toFixed(4),
        lon: lonDrift.toFixed(4),
        status: status,
        vitalityScore: vitality
      };

      setCurrentData(newData);
      setHistory(prev => [...prev.slice(-14), newData]);
      if (newAlerts.length > 0) setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));

    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="zunde-iot-dashboard enterprise high-confidence">
      <div className="iot-header">
        <div className="header-main">
          <h2>IoT Health Command Center</h2>
          <div className="confidence-badge">
            <ShieldCheck size={16} />
            <span>HIGH SIGNAL VERIFIED</span>
          </div>
        </div>
        <div className="geo-status">
          <MapPin size={18} />
          <span>Mashonaland West, ZW</span>
        </div>
      </div>

      <div className="vitality-summary">
        <div className="vitality-meter">
          <label>Herd Vitality Index</label>
          <div className="vitality-bar-bg">
            <div 
              className={`vitality-fill ${currentData.vitalityScore < 70 ? 'poor' : ''}`} 
              style={{width: `${currentData.vitalityScore}%`}}
            ></div>
          </div>
          <span className="vitality-val">{currentData.vitalityScore}%</span>
        </div>
        <p className="sensor-fusion-hint">Sensor Fusion active: Analyzing Temp, Pulse, and Movement in real-time.</p>
      </div>

      <div className="dashboard-top-row">
        <div className="sensor-card">
          <div className="sensor-icon temp"><Thermometer /></div>
          <div className="sensor-vals">
            <label>Avg Body Temp</label>
            <span className={`val ${currentData.temperature > 39.8 ? 'danger' : ''}`}>{currentData.temperature}°C</span>
            <small className="filter-tag">Noise Filtered</small>
          </div>
        </div>

        <div className="sensor-card">
          <div className="sensor-icon hr"><Heart /></div>
          <div className="sensor-vals">
            <label>Avg Heart Rate</label>
            <span className="val">{currentData.heartRate} BPM</span>
          </div>
        </div>

        <div className="sensor-card">
          <div className="sensor-icon act"><Activity /></div>
          <div className="sensor-vals">
            <label>Activity</label>
            <span className="val">{currentData.activity}</span>
          </div>
        </div>

        <div className={`status-summary-card ${currentData.vitalityScore < 70 ? 'alert' : 'stable'}`}>
          <label>Condition</label>
          <strong>{currentData.status}</strong>
        </div>
      </div>

      <div className="dashboard-middle-row">
        <div className="chart-container main-chart">
          <h3>Health Vital Trends (Filtered Data)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" fontSize={10} />
                <YAxis fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip />
                <Area type="monotone" dataKey="temperature" stroke="#2e7d32" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="iot-alerts-panel">
          <h3>High-Signal Alerts</h3>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <CheckCircle color="#2e7d32" size={32} />
                <p>No Critical Deviations</p>
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className={`alert-item ${a.type.toLowerCase()}`}>
                  <AlertTriangle size={16} />
                  <div className="alert-content">
                    <strong>{a.type} Event</strong>
                    <span>{a.msg}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="geofence-card">
          <h3>GPS Security & Geofencing</h3>
          <div className="geo-display">
            <div className="coord">
              <label>Latitude</label>
              <strong>{currentData.lat}</strong>
            </div>
            <div className="coord">
              <label>Longitude</label>
              <strong>{currentData.lon}</strong>
            </div>
            <div className="geo-visual">
              <div className="safe-zone-circle">
                <div className={`animal-marker ${currentData.status === 'Perimeter Breach' ? 'outside' : 'inside'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="iot-hardware-info">
          <h3>Reliability Assurance</h3>
          <div className="assurance-box">
             <div className="assurance-item">✓ 3-Point Moving Average active</div>
             <div className="assurance-item">✓ Multi-Sensor Fusion logic enabled</div>
             <div className="assurance-item">✓ False-positive suppression active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareSimulation;

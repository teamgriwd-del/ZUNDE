import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, Thermometer, Heart, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import './HardwareSimulation.css';

const HardwareSimulation = () => {
  const [history, setHistory] = useState([]);
  const [currentData, setCurrentData] = useState({
    temperature: 38.5,
    heartRate: 72,
    activity: 'Normal',
    lat: -17.3601,
    lon: 30.1918,
    status: 'Healthy'
  });

  const [alerts, setAlerts] = useState([]);

  // Safe Zone for Geofencing (Mashonaland West example)
  const SAFE_ZONE = { lat: -17.3601, lon: 30.1918, radius: 0.005 };

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate Sensor Fluctuations
      const temp = (37.8 + Math.random() * 2.5).toFixed(1);
      const hr = Math.floor(65 + Math.random() * 40);
      const latDrift = -17.3601 + (Math.random() - 0.5) * 0.015;
      const lonDrift = 30.1918 + (Math.random() - 0.5) * 0.015;

      // 2. Geofencing Logic
      const dist = Math.sqrt(Math.pow(latDrift - SAFE_ZONE.lat, 2) + Math.pow(lonDrift - SAFE_ZONE.lon, 2));
      const isBreach = dist > SAFE_ZONE.radius;

      // 3. Status Assessment
      let status = 'Healthy';
      let newAlerts = [];
      
      if (temp > 39.8) {
        status = 'Critical: Fever';
        newAlerts.push({ id: Date.now(), type: 'Health', msg: `High Fever Detected: ${temp}°C` });
      }
      if (isBreach) {
        status = 'Perimeter Breach';
        newAlerts.push({ id: Date.now() + 1, type: 'Security', msg: 'Animal moved outside Safe Zone!' });
      }

      const newData = {
        time: new Date().toLocaleTimeString().slice(0, 8),
        temperature: parseFloat(temp),
        heartRate: hr,
        activity: hr > 95 ? 'High' : (hr < 70 ? 'Low' : 'Normal'),
        lat: latDrift.toFixed(4),
        lon: lonDrift.toFixed(4),
        status: status
      };

      setCurrentData(newData);
      setHistory(prev => [...prev.slice(-14), newData]);
      if (newAlerts.length > 0) setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));

    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="zunde-iot-dashboard enterprise">
      <div className="iot-header">
        <div className="header-main">
          <h2>IoT Health Command Center</h2>
          <span className="live-tag"><span className="pulse"></span> LIVE FEED (PROVISIONAL)</span>
        </div>
        <div className="geo-status">
          <MapPin size={18} />
          <span>Mashonaland West, ZW</span>
        </div>
      </div>

      <div className="dashboard-top-row">
        {/* Real-time Sensor Tiles */}
        <div className="sensor-card">
          <div className="sensor-icon temp"><Thermometer /></div>
          <div className="sensor-vals">
            <label>Body Temp</label>
            <span className={`val ${currentData.temperature > 39.8 ? 'danger' : ''}`}>{currentData.temperature}°C</span>
          </div>
        </div>

        <div className="sensor-card">
          <div className="sensor-icon hr"><Heart /></div>
          <div className="sensor-vals">
            <label>Heart Rate</label>
            <span className="val">{currentData.heartRate} BPM</span>
          </div>
        </div>

        <div className="sensor-card">
          <div className="sensor-icon act"><Activity /></div>
          <div className="sensor-vals">
            <label>Activity Level</label>
            <span className="val">{currentData.activity}</span>
          </div>
        </div>

        <div className={`status-summary-card ${currentData.status.includes('Critical') || currentData.status.includes('Breach') ? 'alert' : 'stable'}`}>
          <label>Overall Status</label>
          <strong>{currentData.status}</strong>
        </div>
      </div>

      <div className="dashboard-middle-row">
        {/* Historical Charts */}
        <div className="chart-container main-chart">
          <h3>Health Vital Trends (Last 15 Cycles)</h3>
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

        {/* Alerts Panel */}
        <div className="iot-alerts-panel">
          <h3>System Alerts</h3>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <CheckCircle color="#2e7d32" size={32} />
                <p>System Operating Normally</p>
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className={`alert-item ${a.type.toLowerCase()}`}>
                  <AlertTriangle size={16} />
                  <div className="alert-content">
                    <strong>{a.type} Alert</strong>
                    <span>{a.msg}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        {/* GPS Geofencing View */}
        <div className="geofence-card">
          <h3>GPS Geofencing (Mashonaland West)</h3>
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
              <span>Safe Zone Radius: 500m</span>
            </div>
          </div>
        </div>

        <div className="iot-hardware-info">
          <h3>Proteus Bridge Status</h3>
          <div className="bridge-status">
            <div className="status-indicator disconnected"></div>
            <span>Physical COMPIM: Waiting for Serial Data...</span>
          </div>
          <p className="hint">View the IOT_HARDWARE_GUIDE.md in the root directory for Proteus setup instructions.</p>
        </div>
      </div>
    </div>
  );
};

export default HardwareSimulation;

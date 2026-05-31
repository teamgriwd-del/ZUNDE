import React, { useState, useEffect } from 'react';
import './HardwareSimulation.css';

const HardwareSimulation = () => {
  const [data, setData] = useState({
    temperature: 38.5,
    activity: 'Normal',
    status: 'Healthy'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fluctuating health data
      const temp = (37.5 + Math.random() * 3).toFixed(1);
      const activityLevels = ['Low', 'Normal', 'High'];
      const activity = activityLevels[Math.floor(Math.random() * activityLevels.length)];
      
      setData({
        temperature: temp,
        activity: activity,
        status: temp > 39.5 ? 'Alert: Fever' : 'Healthy'
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="zunde-card hardware-sim-module">
      <h3>Hardware Simulation (IoT)</h3>
      <div className="sensor-display">
        <div className="sensor-tile">
          <span className="label">Body Temp</span>
          <span className={`value ${data.temperature > 39.5 ? 'danger' : ''}`}>{data.temperature}°C</span>
        </div>
        <div className="sensor-tile">
          <span className="label">Activity</span>
          <span className="value">{data.activity}</span>
        </div>
        <div className="sensor-tile">
          <span className="label">System Status</span>
          <span className={`value ${data.status.includes('Alert') ? 'danger' : 'safe'}`}>{data.status}</span>
        </div>
      </div>
      <p className="note">Live sensor feed simulated every 5 seconds.</p>
    </div>
  );
};

export default HardwareSimulation;

import React, { useState, useEffect } from 'react';
import { HEALTH_PROTOCOLS } from './healthData';
import './HealthManagement.css';

const HealthManagement = ({ animals, completedTasks, setCompletedTasks, auditLog, setAuditLog }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [gestationStart, setGestationStart] = useState('');

  const selectedAnimal = animals.find(a => a.id == selectedAnimalId);

  const calculateGestation = (startDate, species) => {
    if (!startDate || !species) return null;
    const start = new Date(startDate);
    const dueDate = new Date(start);
    const period = HEALTH_PROTOCOLS[species]?.gestation || 283;
    
    dueDate.setDate(start.getDate() + period);
    
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: dueDate.toDateString(),
      daysRemaining: diffDays,
      isUrgent: diffDays <= 14 && diffDays > 0
    };
  };

  const getLifecycleStats = (animal) => {
    if (!animal) return null;
    const birth = new Date(animal.birthDate);
    const weaningDays = HEALTH_PROTOCOLS[animal.species]?.weaningAge || 210;
    const weaningDate = new Date(birth);
    weaningDate.setDate(birth.getDate() + weaningDays);
    
    const now = new Date();
    const isWeaned = now > weaningDate;
    
    return {
      weaningDate: weaningDate.toDateString(),
      isWeaned: isWeaned,
      daysUntilWeaning: Math.ceil((weaningDate - now) / (1000 * 60 * 60 * 24))
    };
  };

  const getDynamicSchedule = (animal) => {
    if (!animal) return [];
    const birth = new Date(animal.birthDate);
    const protocol = HEALTH_PROTOCOLS[animal.species]?.vaccines || [];
    
    return protocol.map(v => {
      const dueDate = new Date(birth);
      dueDate.setDate(birth.getDate() + v.age);
      
      const now = new Date();
      const isOverdue = now > dueDate && !completedTasks.includes(`${animal.id}-${v.name}`);
      const isToday = now.toDateString() === dueDate.toDateString();
      
      let status = "Upcoming";
      if (completedTasks.includes(`${animal.id}-${v.name}`)) status = "Completed";
      else if (isOverdue) status = "Overdue";
      else if (isToday) status = "Due Today";

      return { ...v, dueDate: dueDate.toDateString(), status };
    });
  };

  const handleCompleteTask = (taskName) => {
    const taskId = `${selectedAnimalId}-${taskName}`;
    if (completedTasks.includes(taskId)) return;

    setCompletedTasks([...completedTasks, taskId]);
    setAuditLog([{
      id: Date.now(),
      animalId: selectedAnimal.id, // Linked by ID now
      animal: selectedAnimal.name,
      action: taskName,
      date: new Date().toLocaleString()
    }, ...auditLog]);
  };

  const gestationInfo = calculateGestation(gestationStart, selectedAnimal?.species);
  const lifecycle = getLifecycleStats(selectedAnimal);
  const schedule = getDynamicSchedule(selectedAnimal);

  return (
    <div className="zunde-health-mgmt enterprise">
      <div className="health-header">
        <h2>Health & Compliance Dashboard</h2>
        <div className="animal-selector-large">
          <label>Focus Animal:</label>
          <select value={selectedAnimalId} onChange={(e) => setSelectedAnimalId(e.target.value)}>
            <option value="">Select an Animal to Manage</option>
            {animals.map(a => <option key={a.id} value={a.id}>{a.name} ({a.species})</option>)}
          </select>
        </div>
      </div>

      {!selectedAnimal ? (
        <div className="empty-state">
          <p>Please select an animal to view its specialized health protocol and lifecycle tracking.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Reproduction & Lifecycle Card */}
          <div className="health-card reproduction">
            <h3>Reproduction & Lifecycle</h3>
            <div className="gestation-tool">
              <label>Record Insemination/Mating Date:</label>
              <input type="date" value={gestationStart} onChange={(e) => setGestationStart(e.target.value)} />
              
              {gestationInfo && (
                <div className={`countdown-box ${gestationInfo.isUrgent ? 'urgent' : ''}`}>
                  <span className="label">Expected Delivery</span>
                  <span className="date">{gestationInfo.date}</span>
                  <span className="days">{gestationInfo.daysRemaining} Days Remaining</span>
                </div>
              )}
            </div>

            <div className="lifecycle-info">
              <div className="info-row">
                <span>Standard Weaning Age:</span>
                <strong>{HEALTH_PROTOCOLS[selectedAnimal.species].weaningAge} Days</strong>
              </div>
              <div className="info-row">
                <span>Target Weaning Date:</span>
                <strong>{lifecycle.weaningDate}</strong>
              </div>
              <div className={`status-badge ${lifecycle.isWeaned ? 'safe' : 'info'}`}>
                {lifecycle.isWeaned ? "Animal is Weaned" : `Weaning in ${lifecycle.daysUntilWeaning} days`}
              </div>
            </div>
          </div>

          {/* Vaccination & Treatment Card */}
          <div className="health-card schedule">
            <h3>Health Protocol Compliance</h3>
            <div className="task-timeline">
              {schedule.map((task, i) => (
                <div key={i} className={`timeline-item ${task.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="task-info">
                    <span className="task-name">{task.name} {task.mandatory && <small className="req-tag">MANDATORY</small>}</span>
                    <span className="task-date">Due: {task.dueDate}</span>
                  </div>
                  <div className="task-action">
                    {task.status === 'Completed' ? (
                      <span className="done-check">✓ Completed</span>
                    ) : (
                      <button onClick={() => handleCompleteTask(task.name)} className="complete-btn">Mark Done</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log Card */}
          <div className="health-card audit">
            <h3>Recent Activity Audit</h3>
            <div className="audit-list">
              {auditLog.filter(log => log.animalId === selectedAnimal.id).length === 0 ? <p className="hint">No health actions recorded yet.</p> : (
                auditLog.filter(log => log.animalId === selectedAnimal.id).map(log => (
                  <div key={log.id} className="log-entry">
                    <span className="log-action">{log.action}</span>
                    <span className="log-date">{log.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthManagement;

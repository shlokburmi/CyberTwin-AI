import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import AttackSimulator from './components/AttackSimulator';
import ThreatAlerts from './components/ThreatAlerts';
import SecurityAssistant from './components/SecurityAssistant';
import ArchitectureFlow from './components/ArchitectureFlow';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSimulationComplete = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex h-screen bg-background text-gray-200 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'dashboard' && <Dashboard refreshKey={refreshKey} />}
            {activeTab === 'simulator' && <AttackSimulator onSimulationComplete={handleSimulationComplete} />}
            {activeTab === 'alerts' && <ThreatAlerts refreshKey={refreshKey} />}
            {activeTab === 'assistant' && <SecurityAssistant />}
            {activeTab === 'architecture' && <ArchitectureFlow />}
          </div>
        </main>
      </div>
    </div>
  );
}

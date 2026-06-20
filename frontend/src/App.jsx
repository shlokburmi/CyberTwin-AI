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
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSimulationComplete = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex h-screen bg-background text-zinc-300 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar showToast={showToast} refreshKey={refreshKey} />
        
        <main className="flex-1 overflow-auto p-6 lg:p-8 relative">
          <div className="max-w-[1400px] mx-auto pb-12">
            {activeTab === 'dashboard' && <Dashboard refreshKey={refreshKey} showToast={showToast} />}
            {activeTab === 'simulator' && <AttackSimulator onSimulationComplete={handleSimulationComplete} showToast={showToast} />}
            {activeTab === 'alerts' && <ThreatAlerts refreshKey={refreshKey} showToast={showToast} />}
            {activeTab === 'assistant' && <SecurityAssistant showToast={showToast} />}
            {activeTab === 'architecture' && <ArchitectureFlow />}
          </div>
            {/* Realism Footer */}
            <div className="mt-12 text-center pointer-events-none">
              <p className="text-[10px] text-zinc-600 font-medium tracking-widest uppercase">CyberTwin AI • Enterprise SOC Platform</p>
            </div>
        </main>

        {/* Global Toast Notification */}
        {toast && (
          <div className="absolute bottom-6 right-6 fade-in z-50">
            <div className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2
              ${toast.type === 'info' ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              ${toast.type === 'success' ? 'bg-success/10 border-success/20 text-success' : ''}
              ${toast.type === 'error' ? 'bg-critical/10 border-critical/20 text-critical' : ''}
            `}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

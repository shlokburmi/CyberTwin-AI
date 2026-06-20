import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, Shield } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function TopBar({ showToast, refreshKey }) {
  const [riskData, setRiskData] = useState({ risk_score: 0, level: 'Low' });

  useEffect(() => {
    axios.get(`${API_BASE}/risk-score`)
      .then(r => setRiskData(r.data))
      .catch(console.error);
  }, [refreshKey]);

  const getStatusConfig = () => {
    const score = riskData.risk_score;
    if (score > 75) return { label: 'Critical', dotColor: 'bg-critical', textColor: 'text-critical', borderColor: 'border-critical/30' };
    if (score > 50) return { label: 'Elevated', dotColor: 'bg-warning', textColor: 'text-warning', borderColor: 'border-warning/30' };
    if (score > 25) return { label: 'Caution', dotColor: 'bg-amber-500', textColor: 'text-amber-500', borderColor: 'border-amber-500/30' };
    return { label: 'Optimal', dotColor: 'bg-accent', textColor: 'text-accent', borderColor: 'border-border' };
  };

  const status = getStatusConfig();

  return (
    <div className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-border bg-background sticky top-0 z-10">
      {/* Search Bar */}
      <div className="relative w-64">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* System Status — Dynamic based on risk score */}
        <div className={`flex items-center gap-2 px-3 py-1 bg-card border ${status.borderColor} rounded-full transition-colors`}>
          <div className={`w-2 h-2 rounded-full ${status.dotColor} pulse-glow`} />
          <span className={`text-xs font-medium ${status.textColor}`}>System: {status.label}</span>
        </div>

        {/* Icons */}
        <button onClick={() => showToast?.('You have 3 new notifications.', 'info')} className="text-zinc-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button onClick={() => showToast?.('SOC Operator profile loaded.', 'info')} className="text-zinc-400 hover:text-white transition-colors">
          <Shield size={18} />
        </button>
      </div>
    </div>
  );
}

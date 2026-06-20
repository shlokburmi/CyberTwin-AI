import React from 'react';
import {
  Shield, AlertTriangle, MessageSquare,
  Crosshair, LayoutDashboard, GitBranch, Settings, HelpCircle, User
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'alerts', label: 'Threat Alerts', icon: <AlertTriangle size={18} /> },
    { id: 'assistant', label: 'Security Assistant', icon: <MessageSquare size={18} /> },
    { id: 'simulator', label: 'Threat Detection', icon: <Crosshair size={18} /> },
    { id: 'architecture', label: 'How It Works', icon: <GitBranch size={18} /> },
  ];

  return (
    <div className="w-[240px] bg-card border-r border-border flex flex-col shrink-0">
      {/* Header / Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
        <div className="relative">
          <Shield className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold tracking-wide text-white">
          CyberTwin AI
        </h1>
      </div>

      {/* User Profile */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <User size={16} className="text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">SOC Operator</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Access</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors relative ${
                isActive
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
              <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Links */}
      <div className="p-4 space-y-1">
        <button onClick={() => showToast('Settings panel opening...', 'info')} className="w-full flex items-center gap-3 px-2 py-2 text-zinc-400 hover:text-zinc-200 transition-colors">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button onClick={() => showToast('Connecting to support center...', 'info')} className="w-full flex items-center gap-3 px-2 py-2 text-zinc-400 hover:text-zinc-200 transition-colors">
          <HelpCircle size={18} />
          <span className="text-sm font-medium">Support</span>
        </button>
      </div>
    </div>
  );
}

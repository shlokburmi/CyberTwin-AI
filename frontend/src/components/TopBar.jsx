import React from 'react';
import { Search, Bell, Shield } from 'lucide-react';

export default function TopBar() {
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
        {/* System Status */}
        <div className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-full">
          <div className="w-2 h-2 rounded-full bg-accent pulse-glow" />
          <span className="text-xs font-medium text-gray-300">System: Optimal</span>
        </div>

        {/* Icons */}
        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Shield size={18} />
        </button>
      </div>
    </div>
  );
}

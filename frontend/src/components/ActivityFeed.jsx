import React from 'react';
import { Activity, AlertTriangle, Zap, Shield, Bot, Server, Info } from 'lucide-react';

const iconMap = {
  simulation: <Zap size={14} />,
  logs: <Server size={14} />,
  ml_engine: <Activity size={14} />,
  dl_engine: <Shield size={14} />,
  rag_engine: <Bot size={14} />,
  alert: <AlertTriangle size={14} />,
  system: <Info size={14} />,
};

const severityColors = {
  info: 'text-gray-400 border-gray-700',
  success: 'text-accent border-accent/30',
  warning: 'text-warning border-warning/30',
  danger: 'text-danger border-danger/30',
};

/**
 * ActivityFeed — Real-time cyber activity log feed.
 */
export default function ActivityFeed({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-gray-800 p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          Live Activity Feed
        </h3>
        <div className="text-center py-8 text-gray-500 text-sm">
          <Activity size={32} className="mx-auto mb-3 opacity-30" />
          <p>No activity yet. Run an attack simulation to see live events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-gray-800 p-6">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity size={16} className="text-primary" />
        Live Activity Feed
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-accent rounded-full pulse-glow" />
          <span className="text-xs text-accent font-normal">Live</span>
        </span>
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {events.map((event, idx) => {
          const colors = severityColors[event.severity] || severityColors.info;
          const icon = iconMap[event.type] || <Info size={14} />;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border bg-background/30 slide-in ${colors}`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="mt-0.5 opacity-70">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">{event.message}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
                {event.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

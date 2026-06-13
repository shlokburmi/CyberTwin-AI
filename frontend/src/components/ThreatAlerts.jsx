import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ChevronRight, ChevronDown, Filter, ChevronDown as DropdownIcon,
  Server, ShieldAlert, CheckCircle2, Shield
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

const severityConfig = {
  Critical: { border: 'border-l-danger', text: 'text-danger', bg: 'bg-danger/10' },
  High: { border: 'border-l-warning', text: 'text-warning', bg: 'bg-warning/10' },
  Medium: { border: 'border-l-accent', text: 'text-accent', bg: 'bg-accent/10' },
  Low: { border: 'border-l-primary', text: 'text-primary', bg: 'bg-primary/10' },
};

export default function ThreatAlerts({ refreshKey }) {
  const [alerts, setAlerts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  
  // Placeholder filters
  const [filterSeverity, setFilterSeverity] = useState('all');

  const fetchAlerts = () => {
    axios.get(`${API_BASE}/alerts`).then(r => setAlerts(r.data)).catch(console.error);
  };

  useEffect(() => {
    fetchAlerts();
  }, [refreshKey]);

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Active Threats</h2>
          <p className="text-gray-400 text-sm">Monitoring anomalous activities across global endpoints.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterButton label="SEVERITY" />
          <FilterButton label="ATTACK TYPE" />
          <FilterButton label="LAST 24H" />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-border bg-background/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1 pl-4">SEVERITY</div>
          <div className="col-span-1">THREAT CONTEXT</div>
          <div className="col-span-1">TARGET NODE</div>
          <div className="col-span-1">CONFIDENCE</div>
          <div className="col-span-1">TIMESTAMP</div>
          <div className="col-span-1">STATUS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {alerts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No alerts found.</div>
          ) : (
            alerts.map((alert, idx) => {
              const s = severityConfig[alert.severity] || severityConfig.Low;
              const isExpanded = expandedId === idx;
              const confidence = alert.confidence ? Math.round(alert.confidence * 100) : 0;
              
              // Map simulated attacks to the UI's status indicators
              let status = alert.status || 'OPEN';
              if (alert.severity === 'Critical') status = 'OPEN';
              if (alert.severity === 'High') status = 'INVESTIGATING';
              if (alert.severity === 'Low') status = 'AUTO-MITIGATED';

              return (
                <div key={idx} className="bg-card hover:bg-white/[0.02] transition-colors">
                  <div 
                    className={`grid grid-cols-6 gap-4 p-4 items-center cursor-pointer border-l-4 ${s.border}`}
                    onClick={() => setExpandedId(isExpanded ? null : idx)}
                  >
                    {/* Severity */}
                    <div className="col-span-1 pl-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background border border-border">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.bg.replace('bg-', 'bg-').replace('/10', '')}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${s.text}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>

                    {/* Threat Context */}
                    <div className="col-span-1">
                      <div className="text-sm font-semibold text-white mb-1">
                        {alert.type || alert.attack_type?.replace(/_/g, ' ') || 'Unknown Threat'}
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-gray-500">
                        <Server size={12} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-tight">
                          {alert.description || 'Anomalous activity detected.'}
                        </span>
                      </div>
                    </div>

                    {/* Target Node */}
                    <div className="col-span-1">
                      <div className="text-sm font-mono text-gray-300 mb-0.5">
                        {alert.affected_ips?.[0] || '10.0.0.0'}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        SRV-CLUSTER-01
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="col-span-1">
                      {confidence > 0 ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">{confidence}%</span>
                          <div className="h-1.5 w-16 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${confidence}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="col-span-1 text-sm text-gray-400">
                      {alert.timestamp}
                    </div>

                    {/* Status & Expander */}
                    <div className="col-span-1 flex items-center justify-between">
                      <StatusBadge status={status} />
                      <button className="text-gray-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div className="p-6 bg-background/30 border-t border-border">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Detection Source</div>
                            <div className="text-sm font-semibold text-white">
                              {alert.ml_result && alert.dl_result ? 'ML + DL Correlation' : 'ML Isolation Forest'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risk Score</div>
                            <div className="text-sm font-semibold text-white">{alert.risk_score || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Logs Analyzed</div>
                            <div className="text-sm font-semibold text-white">{alert.logs_analyzed || 'N/A'}</div>
                          </div>
                       </div>
                       
                       {alert.recommendation && (
                         <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg max-w-3xl">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                              <Shield size={14} /> AI Recommendation
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {alert.recommendation}
                            </p>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-card transition-colors text-sm font-medium text-gray-300">
          <Filter size={14} /> Load More Events
        </button>
      </div>
    </div>
  );
}

function FilterButton({ label }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg hover:border-gray-600 transition-colors">
      <span className="text-[10px] font-bold text-gray-300 uppercase">{label}</span>
      <DropdownIcon size={14} className="text-gray-500" />
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === 'OPEN') {
    return (
      <div className="px-3 py-1 rounded-full border border-gray-600 text-[10px] font-bold text-gray-300 tracking-wider">
        OPEN
      </div>
    );
  }
  if (status === 'INVESTIGATING') {
    return (
      <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary tracking-wider">
        INVESTIGATING
      </div>
    );
  }
  return (
    <div className="px-3 py-1 rounded-full border border-gray-600 text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
      <CheckCircle2 size={12} /> AUTO-MITIGATED
    </div>
  );
}

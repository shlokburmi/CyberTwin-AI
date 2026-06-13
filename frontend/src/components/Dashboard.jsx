import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, Server, Activity, AlertTriangle, Zap,
  Cpu, MoreHorizontal
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API_BASE = 'http://localhost:8000/api/v1';

const VECTOR_COLORS = ['#3b82f6', '#f59e0b', '#00d0b5'];

export default function Dashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const fetchData = useCallback(() => {
    axios.get(`${API_BASE}/dashboard-stats`).then(r => setStats(r.data)).catch(console.error);
    axios.get(`${API_BASE}/system-status`).then(r => setSystemStatus(r.data)).catch(console.error);
    axios.get(`${API_BASE}/alerts?severity=Critical`).then(r => setAlerts(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const riskScore = stats?.risk_score || 0;
  // Risk Score Gauge Data
  const riskGaugeData = [
    { name: 'Risk', value: riskScore },
    { name: 'Safe', value: 100 - riskScore }
  ];
  
  // Example dummy data for Threat Vectors donut
  const threatVectors = [
    { name: 'Network', value: 65 },
    { name: 'App', value: 25 },
    { name: 'Endpoint', value: 10 },
  ];

  const riskHistory = stats?.risk_history || [];

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Security Overview</h2>
          <p className="text-gray-400 text-sm">Real-time threat telemetry and system status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Last 24 Hours
          </button>
          <button className="px-4 py-2 bg-[#b6d0fc] text-[#111827] rounded-lg text-sm font-bold hover:bg-[#a5bfee] transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Risk Score */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-4 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 border border-warning/20 rounded text-[10px] font-bold text-warning uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                MEDIUM RISK
              </div>
              <h3 className="text-4xl font-bold text-white leading-tight">Overall Risk<br/>Score</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The environment is experiencing elevated probing activity. ML models have auto-mitigated {stats?.attacks_blocked || 0} known vectors in the past hour.
              </p>
            </div>
            
            {/* Circular Gauge */}
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskGaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={220}
                    endAngle={-40}
                    innerRadius={60}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    <Cell fill="#fb923c" />
                    <Cell fill="#2a3143" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{riskScore}</span>
                <span className="text-[10px] text-gray-500 font-medium">/ 100</span>
              </div>
            </div>
          </div>

          <div className="flex gap-12 mt-8 pt-6 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-white mb-1">{(stats?.total_logs_analyzed || 0).toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">EVENTS ANALYZED</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning mb-1">{stats?.attacks_blocked || 0}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AUTO-MITIGATED</div>
            </div>
          </div>
        </div>

        {/* Active Threats */}
        <div className="bg-card rounded-xl border border-border border-l-2 border-l-danger p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Active Threats</h3>
            <AlertTriangle size={18} className="text-danger" />
          </div>
          
          <div className="mb-6">
            <div className="text-5xl font-bold text-danger mb-2">{String(alerts.length).padStart(2, '0')}</div>
            <p className="text-xs text-gray-400">Critical incidents requiring attention</p>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 2).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                  <div className="text-sm font-medium text-gray-200">
                    {a.type || a.attack_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {a.affected_ips?.[0] || 'N/A'}
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-sm text-gray-500 p-3">No critical threats.</div>
            )}
          </div>
        </div>

        {/* Engine Health */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Engine Health</h3>
            <Server size={18} className="text-accent" />
          </div>
          
          <div className="space-y-4">
            <HealthRow icon={<Activity size={14}/>} label="Backend API" status="Optimal" />
            <HealthRow icon={<Cpu size={14}/>} label="ML Engine" status="Optimal" />
            <HealthRow icon={<TrendingUp size={14}/>} label="DL Engine (LSTM)" status="Optimal" />
            <HealthRow icon={<Server size={14}/>} label="RAG Engine" status="Optimal" />
          </div>
        </div>

        {/* Recent Intervention */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Intervention</h3>
            <span className="text-xs text-gray-500">2 mins ago</span>
          </div>
          
          <div className="flex-1 bg-background/40 rounded-xl p-4 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-warning" />
                <span className="text-sm font-bold text-white">{stats?.last_attack_type?.replace(/_/g, ' ') || 'No Attacks Yet'}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Distributed login attempts targeting SSH ports. Blocked automatically at edge.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-wider">
              <Zap size={12} />
              ML + DL DETECTED • 91% CONFIDENCE
            </div>
          </div>
        </div>

        {/* Risk Trend (24h) */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Risk Trend (24h)</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-gray-400">
                <div className="w-3 border-t-2 border-dashed border-gray-500" />
                Predicted
              </div>
              <div className="flex items-center gap-1.5 text-warning">
                <div className="w-3 border-t-2 border-warning" />
                Actual
              </div>
            </div>
          </div>
          
          <div className="h-48 w-full">
            {riskHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskHistory}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: '#171b26', border: '1px solid #2a3143', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="score" stroke="#fb923c" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Run simulations to generate trend data
              </div>
            )}
          </div>
        </div>

        {/* Threat Vectors */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-bold text-white mb-4">Threat Vectors</h3>
          
          <div className="relative h-40 w-full flex items-center justify-center mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatVectors}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {threatVectors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VECTOR_COLORS[index % VECTOR_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">3.2k</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            {threatVectors.map((v, i) => (
              <div key={v.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: VECTOR_COLORS[i] }} />
                <span className="text-[10px] text-gray-400 font-medium">{v.name}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

function HealthRow({ icon, label, status }) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-background rounded-md text-gray-400">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-accent">{status}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
      </div>
    </div>
  );
}

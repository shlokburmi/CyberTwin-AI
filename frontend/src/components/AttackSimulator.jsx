import React, { useState } from 'react';
import axios from 'axios';
import {
  Server, Activity, Share2, AlertTriangle, ShieldAlert,
  Loader2, Check, MoreHorizontal, UserX, Database
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

const ATTACK_TYPES = [
  {
    id: 'brute_force',
    label: 'Brute Force',
    description: 'Multi-vector authentication assault simulating credential rotation.',
    icon: <MoreHorizontal size={20} />,
    severity: 'Critical',
    confidence: '94%',
    color: 'text-danger',
    simId: 'SIM-002',
  },
  {
    id: 'credential_stuffing',
    label: 'Cred Stuffing',
    description: 'Distributed login attempts using compromised breach corpuses.',
    icon: <UserX size={20} />,
    severity: 'High',
    confidence: '88%',
    color: 'text-warning',
    simId: 'SIM-003',
  },
  {
    id: 'insider_threat',
    label: 'Insider Threat',
    description: 'Anomalous data exfiltration patterns from authenticated accounts.',
    icon: <Share2 size={20} />,
    severity: 'Medium',
    confidence: '76%',
    color: 'text-accent',
    simId: 'SIM-004',
  },
  {
    id: 'sql_injection',
    label: 'SQL Injection',
    description: 'Payload fuzzing against primary database endpoints.',
    icon: <Database size={20} />,
    severity: 'Elevated',
    confidence: '91%',
    color: 'text-primary',
    simId: 'SIM-005',
  },
];

const PIPELINE_STEPS = [
  { key: 'logs', label: 'GEN LOGS', icon: <Server size={18} /> },
  { key: 'ml', label: 'ML DETECT', icon: <Activity size={18} /> },
  { key: 'dl', label: 'DL SEQUENCE', icon: <Share2 size={18} /> },
  { key: 'risk', label: 'SCORE', icon: <Check size={18} /> },
  { key: 'alert', label: 'ALERT', icon: <AlertTriangle size={18} /> },
  { key: 'rag', label: 'RAG MITIGATE', icon: <ShieldAlert size={18} /> },
];

export default function AttackSimulator({ onSimulationComplete }) {
  const [loading, setLoading] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(2); // Default to DL SEQUENCE active for visuals if not running
  const [lastResult, setLastResult] = useState(null);

  const handleSimulate = async (attackType) => {
    setLoading(attackType);
    setLastResult(null);
    setPipelineStep(0);

    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev >= PIPELINE_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    try {
      const res = await axios.post(`${API_BASE}/simulate-attack`, { attack_type: attackType });
      clearInterval(stepInterval);
      setPipelineStep(PIPELINE_STEPS.length);
      setLastResult(res.data);
      if (onSimulationComplete) onSimulationComplete(res.data);
    } catch (err) {
      clearInterval(stepInterval);
      setPipelineStep(-1);
      console.error('Simulation failed:', err);
      setLastResult({ error: 'Simulation failed. Check backend connection.' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Simulation Core</h2>
          <p className="text-gray-400 text-sm">Configure and monitor advanced threat vector simulations.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#b6d0fc] text-[#111827] rounded-lg text-sm font-bold hover:bg-[#a5bfee] transition-colors">
          Launch Custom Sequence
        </button>
      </div>

      {/* Active Pipeline */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-accent pulse-glow" />
          <h3 className="text-sm font-bold text-white tracking-wide">Active Simulation Pipeline</h3>
        </div>

        <div className="relative flex justify-between items-center px-4 max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-[10%] right-[10%] top-6 h-px bg-border -z-10" />

          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = pipelineStep > idx;
            const isCurrent = pipelineStep === idx;
            // Highlight step 3 (DL SEQUENCE) if no active simulation to match image
            const isVisualActive = loading === null ? idx === 2 : isCurrent; 

            return (
              <div key={step.key} className="flex flex-col items-center gap-4 bg-card z-10 px-2">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                    ${isDone ? 'border-primary text-primary bg-primary/10' : 
                      isVisualActive ? 'border-accent text-accent bg-accent/10 shadow-[0_0_15px_rgba(0,208,181,0.2)]' : 
                      'border-border text-gray-500 bg-background'
                    }
                  `}
                >
                  {isVisualActive && loading ? <Loader2 size={20} className="animate-spin" /> : step.icon}
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${isVisualActive ? 'text-accent' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attack Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ATTACK_TYPES.map((attack) => {
          const isLoading = loading === attack.id;

          return (
            <button
              key={attack.id}
              onClick={() => handleSimulate(attack.id)}
              disabled={loading !== null}
              className="text-left bg-card border border-border rounded-xl p-5 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-4">
                <div className={`p-2 rounded bg-background border border-border ${attack.color}`}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : attack.icon}
                </div>
                <div className="px-2 py-1 bg-background border border-border rounded text-[10px] font-mono text-gray-400">
                  ID: {attack.simId}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{attack.label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">{attack.description}</p>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-border mt-auto">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">SEVERITY</div>
                  <div className={`text-sm font-semibold ${attack.color}`}>{attack.severity}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">CONFIDENCE</div>
                  <div className="text-sm font-semibold text-white">{attack.confidence}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Simulation Result Feedback (only shows if just ran) */}
      {lastResult && !lastResult.error && (
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-between text-sm text-accent fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span className="font-medium">Simulation completed.</span> Generated {lastResult.logs_generated} logs. Dashboard updated.
          </div>
        </div>
      )}
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';

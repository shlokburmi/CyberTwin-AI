import React, { useState } from 'react';
import axios from 'axios';
import {
  Server, Activity, Share2, AlertTriangle, ShieldAlert,
  Loader2, Check, MoreHorizontal, UserX, Database, Play, Info
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
    color: 'text-critical',
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
    color: 'text-amber',
    simId: 'SIM-004',
  },
  {
    id: 'sql_injection',
    label: 'SQL Injection',
    description: 'Payload fuzzing against primary database endpoints.',
    icon: <Database size={20} />,
    severity: 'Critical',
    confidence: '91%',
    color: 'text-critical',
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

export default function AttackSimulator({ onSimulationComplete, showToast }) {
  const [loading, setLoading] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(2); // Default visual
  const [lastResult, setLastResult] = useState(null);

  const runSimulationAction = async (attackType) => {
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
      return res.data;
    } catch (err) {
      clearInterval(stepInterval);
      setPipelineStep(-1);
      console.error('Simulation failed:', err);
      setLastResult({ error: 'Simulation failed. Check backend connection.' });
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const handleSimulate = async (attackType) => {
    if (demoRunning) return;
    await runSimulationAction(attackType);
  };

  const handleRunDemo = async () => {
    if (loading || demoRunning) return;
    setDemoRunning(true);
    setLastResult(null);
    
    try {
      showToast('Demo sequence started: Phase 1 - Brute Force', 'info');
      const r1 = await runSimulationAction('brute_force');
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      showToast('Demo sequence phase 2: SQL Injection', 'info');
      const r2 = await runSimulationAction('sql_injection');
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      showToast('Demo sequence phase 3: Insider Threat Data Exfiltration', 'warning');
      const r3 = await runSimulationAction('insider_threat');
      
      // Aggregate the results for the final view
      setLastResult({
        attack: 'Multi-Vector APT Sequence (Demo)',
        dl_result: { confidence: Math.max(r1.dl_result?.confidence||0, r2.dl_result?.confidence||0, r3.dl_result?.confidence||0) },
        risk_score: Math.max(r1.risk_score, r2.risk_score, r3.risk_score),
        recommendation: 'Critical multi-stage attack detected involving credential stuffing, database fuzzing, and data exfiltration. Immediate system lockdown and credential rotation required. ' + (r3.recommendation || '')
      });

      showToast('Demo sequence completed successfully.', 'success');
    } catch (error) {
      console.error("Demo sequence interrupted", error);
      showToast('Demo sequence failed or interrupted.', 'error');
    } finally {
      setDemoRunning(false);
    }
  };

  const handleCustomSequence = async () => {
    if (demoRunning) return;
    showToast('Launching custom sequence (Credential Stuffing)', 'info');
    await runSimulationAction('credential_stuffing');
  };

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-1">Simulation Core</h2>
          <p className="text-zinc-500 text-sm">Configure and monitor advanced threat vector simulations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRunDemo}
            disabled={loading !== null || demoRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {demoRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {demoRunning ? 'Demo in Progress...' : 'Run Full Demo'}
          </button>
          <button 
            onClick={handleCustomSequence}
            disabled={loading !== null || demoRunning}
            className="px-5 py-2.5 bg-zinc-200 text-zinc-900 rounded-lg text-sm font-bold hover:bg-white transition-colors disabled:opacity-50"
          >
            Launch Custom Sequence
          </button>
        </div>
      </div>

      {/* Active Pipeline */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-accent engine-pulse" />
          <h3 className="text-sm font-bold text-zinc-100 tracking-wide">Active Simulation Pipeline</h3>
        </div>

        <div className="relative flex justify-between items-center px-4 max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-[10%] right-[10%] top-6 h-px bg-border -z-10" />

          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = pipelineStep > idx;
            const isCurrent = pipelineStep === idx;
            const isVisualActive = loading === null ? idx === 2 : isCurrent; 

            return (
              <div key={step.key} className="flex flex-col items-center gap-4 bg-card z-10 px-2 transition-transform duration-300">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                    ${isDone ? 'border-primary text-primary bg-primary/10' : 
                      isVisualActive ? 'border-accent text-accent bg-accent/10 shadow-[0_0_15px_rgba(14,165,233,0.2)] scale-110' : 
                      'border-border text-zinc-600 bg-background'
                    }
                  `}
                >
                  {isVisualActive && loading ? <Loader2 size={20} className="animate-spin" /> : step.icon}
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${isVisualActive ? 'text-accent' : 'text-zinc-500'}`}>
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
              disabled={loading !== null || demoRunning}
              className="premium-card text-left p-5 disabled:opacity-50 disabled:cursor-not-allowed group flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-4">
                <div className={`p-2 rounded-lg bg-zinc-900 border border-border ${attack.color}`}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : attack.icon}
                </div>
                <div className="px-2 py-1 bg-zinc-900 border border-border rounded text-[10px] font-mono text-zinc-500">
                  ID: {attack.simId}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors">{attack.label}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{attack.description}</p>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-border mt-auto">
                <div>
                  <div className="text-[10px] font-bold text-zinc-600 tracking-wider mb-1">SEVERITY</div>
                  <div className={`text-sm font-semibold ${attack.color}`}>{attack.severity}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-zinc-600 tracking-wider mb-1">CONFIDENCE</div>
                  <div className="text-sm font-semibold text-zinc-200">{attack.confidence}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Structured Result Panel (Vercel Style) */}
      {lastResult && !lastResult.error && !demoRunning && (
        <div className="premium-card overflow-hidden fade-in">
          <div className="bg-zinc-900 border-b border-border p-4 flex items-center gap-2">
            <Check size={18} className="text-success" />
            <span className="font-semibold text-zinc-100">Simulation Complete</span>
            <span className="text-sm text-zinc-500 ml-auto">ID: {lastResult.attack}</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Column */}
            <div className="space-y-6 lg:border-r border-border lg:pr-8">
               <div>
                 <div className="text-xs text-zinc-500 font-medium mb-1">Detected Attack</div>
                 <div className="text-lg font-bold text-zinc-100 capitalize">{lastResult.attack.replace(/_/g, ' ')}</div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="text-xs text-zinc-500 font-medium mb-1">Confidence</div>
                   <div className="text-lg font-semibold text-zinc-200">{(lastResult.dl_result?.confidence * 100).toFixed(0)}%</div>
                 </div>
                 <div>
                   <div className="text-xs text-zinc-500 font-medium mb-1">Risk Score</div>
                   <div className="text-lg font-semibold text-zinc-200">{lastResult.risk_score}</div>
                 </div>
               </div>
               
               <div>
                 <div className="text-xs text-zinc-500 font-medium mb-1">Detection Source</div>
                 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md text-xs font-semibold">
                   ML + DL Correlation
                 </div>
               </div>
            </div>
            
            {/* Recommendations Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-4">
                <Info size={16} className="text-accent" /> Recommended Actions
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-5 border border-border">
                {lastResult.recommendation ? (
                  <ul className="space-y-3">
                    {lastResult.recommendation.split('. ').map((rec, idx) => {
                      if (!rec.trim()) return null;
                      return (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                           <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                           <span className="leading-relaxed">{rec.trim()}{rec.endsWith('.') ? '' : '.'}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="text-sm text-zinc-500">No automated actions recommended. Investigate manually.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {lastResult?.error && (
        <div className="p-4 bg-critical/10 border border-critical/20 rounded-xl text-critical text-sm fade-in">
          {lastResult.error}
        </div>
      )}
    </div>
  );
}

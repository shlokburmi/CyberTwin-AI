import React, { useState } from 'react';
import axios from 'axios';
import {
  Server, Activity, Share2, AlertTriangle, ShieldAlert,
  Loader2, Check, MoreHorizontal, UserX, Database, Play, Info
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const ATTACK_TYPES = [
  {
    id: 'brute_force',
    label: 'Brute Force',
    description: 'Repeated authentication failures detected from suspicious origin.',
    icon: <MoreHorizontal size={20} />,
    severity: 'Critical',
    confidence: '94%',
    color: 'text-critical',
    simId: 'SIM-002',
  },
  {
    id: 'credential_stuffing',
    label: 'Cred Stuffing',
    description: 'Distributed login attempts using known compromised credentials.',
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
    description: 'Malicious SQL payloads detected in application request parameters.',
    icon: <Database size={20} />,
    severity: 'Critical',
    confidence: '91%',
    color: 'text-critical',
    simId: 'SIM-005',
  },
];

// Attack-specific response playbooks — dynamic per threat type
const ATTACK_PLAYBOOKS = {
  'Brute Force Attack': {
    immediate: [
      'Block attacking IP addresses and subnet ranges.',
      'Force password reset on all targeted accounts.',
      'Enable account lockout after 5 failed attempts.',
    ],
    hardening: [
      'Enforce MFA across all user accounts.',
      'Implement progressive rate limiting on auth endpoints.',
      'Deploy CAPTCHA after consecutive failed logins.',
    ],
  },
  'Credential Stuffing': {
    immediate: [
      'Block source IPs identified in the credential stuffing attack.',
      'Force credential rotation for compromised accounts.',
      'Invalidate all active sessions from affected accounts.',
    ],
    hardening: [
      'Check credentials against known breach databases.',
      'Implement bot detection and behavioral analysis.',
      'Enforce unique password policies across services.',
    ],
  },
  'Insider Threat': {
    immediate: [
      'Suspend compromised user accounts immediately.',
      'Revoke elevated privileges for flagged users.',
      'Isolate affected endpoints from sensitive resources.',
    ],
    hardening: [
      'Deploy User and Entity Behavior Analytics (UEBA).',
      'Implement data loss prevention (DLP) policies.',
      'Conduct regular access privilege reviews.',
    ],
  },
  'SQL Injection Attempt': {
    immediate: [
      'Block attacking IPs at the WAF level.',
      'Quarantine affected database endpoints.',
      'Audit database logs for unauthorized queries.',
    ],
    hardening: [
      'Enforce parameterized queries across all endpoints.',
      'Deploy Web Application Firewall (WAF) rules.',
      'Implement strict input validation and output encoding.',
    ],
  },
  'Multi-Vector APT Sequence': {
    immediate: [
      'Activate incident response protocol — escalate to SOC Level 2.',
      'Isolate compromised endpoints from the internal network.',
      'Revoke all active sessions for affected user accounts.',
    ],
    hardening: [
      'Enforce MFA across all external and internal access points.',
      'Implement network micro-segmentation to contain lateral movement.',
      'Deploy enhanced logging and anomaly correlation across all layers.',
    ],
  },
};

const DEFAULT_PLAYBOOK = {
  immediate: [
    'Isolate affected systems from the network.',
    'Revoke active sessions for compromised accounts.',
    'Begin forensic analysis on affected endpoints.',
  ],
  hardening: [
    'Review and update security policies.',
    'Enhance monitoring and alerting thresholds.',
    'Conduct security awareness training.',
  ],
};

const PIPELINE_STEPS = [
  { key: 'logs', label: 'LOG CAPTURE', icon: <Server size={18} /> },
  { key: 'ml', label: 'ML DETECT', icon: <Activity size={18} /> },
  { key: 'dl', label: 'DL ANALYZE', icon: <Share2 size={18} /> },
  { key: 'risk', label: 'RISK SCORE', icon: <Check size={18} /> },
  { key: 'alert', label: 'ALERT', icon: <AlertTriangle size={18} /> },
  { key: 'rag', label: 'RAG MITIGATE', icon: <ShieldAlert size={18} /> },
];

export default function AttackSimulator({ onSimulationComplete, showToast }) {
  const [loading, setLoading] = useState(null);
  const [scanRunning, setScanRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(2); // Default visual
  const [lastResult, setLastResult] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);

  const runDetection = async (attackType) => {
    setLoading(attackType);
    setLastResult(null);
    setSelectedPhase(null);
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
      console.error('Detection failed:', err);
      setLastResult({ error: 'Threat detection failed. Check backend connection.' });
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const handleDetect = async (attackType) => {
    if (scanRunning) return;
    await runDetection(attackType);
  };

  const handleDeepScan = async () => {
    if (loading || scanRunning) return;
    setScanRunning(true);
    setLastResult(null);
    
    const phases = [
      { type: 'brute_force', label: 'Brute Force' },
      { type: 'sql_injection', label: 'SQL Injection' },
      { type: 'credential_stuffing', label: 'Credential Stuffing' },
      { type: 'insider_threat', label: 'Insider Threat' },
    ];

    try {
      const results = [];
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        showToast(`Deep scan phase ${i + 1}/${phases.length}: ${phase.label} Analysis`, i === phases.length - 1 ? 'warning' : 'info');
        const result = await runDetection(phase.type);
        results.push(result);
        if (i < phases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Aggregate results from all detections with per-phase breakdown
      setLastResult({
        attack: 'Multi-Vector APT Sequence',
        severity: 'Critical',
        dl_result: { confidence: Math.max(...results.map(r => r.dl_result?.confidence || 0)) },
        risk_score: Math.max(...results.map(r => r.risk_score)),
        logs_generated: results.reduce((sum, r) => sum + (r.logs_generated || 0), 0),
        ml_result: 'anomaly_detected',
        recommendation: results.map(r => r.recommendation).filter(Boolean).pop() || 'Multiple distinct threat vectors identified across authentication, database, and data exfiltration layers. Immediate containment and credential rotation required.',
        phases: results.map((r, i) => ({
          name: phases[i].label,
          attack: r.attack,
          severity: r.severity,
          confidence: r.dl_result?.confidence || 0,
          risk_score: r.risk_score,
          ml_result: r.ml_result,
          logs_generated: r.logs_generated || 0,
          recommendation: r.recommendation,
        })),
      });

      showToast('Deep scan complete — all threat vectors analyzed.', 'success');
    } catch (error) {
      console.error("Deep scan interrupted", error);
      showToast('Deep scan failed or interrupted.', 'error');
    } finally {
      setScanRunning(false);
    }
  };

  const handleTargetedScan = async () => {
    if (scanRunning) return;
    const types = [
      { id: 'brute_force', label: 'Brute Force' },
      { id: 'credential_stuffing', label: 'Credential Stuffing' },
      { id: 'insider_threat', label: 'Insider Threat' },
      { id: 'sql_injection', label: 'SQL Injection' },
    ];
    const pick = types[Math.floor(Math.random() * types.length)];
    showToast(`Targeted scan initiated — ${pick.label}`, 'info');
    await runDetection(pick.id);
  };

  // Get the playbook for the current result
  const getPlaybook = () => {
    if (!lastResult || lastResult.error) return null;
    return ATTACK_PLAYBOOKS[lastResult.attack] || DEFAULT_PLAYBOOK;
  };

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-1">Threat Detection</h2>
          <p className="text-zinc-500 text-sm">Real-time threat detection and active response monitoring.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDeepScan}
            disabled={loading !== null || scanRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {scanRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {scanRunning ? 'Scanning...' : 'Deep Scan'}
          </button>
          <button 
            onClick={handleTargetedScan}
            disabled={loading !== null || scanRunning}
            className="px-5 py-2.5 bg-zinc-200 text-zinc-900 rounded-lg text-sm font-bold hover:bg-white transition-colors disabled:opacity-50"
          >
            Targeted Scan
          </button>
        </div>
      </div>

      {/* Deep Scan Timeline */}
      {scanRunning && (
        <div className="premium-card p-6 border-accent/30 bg-accent/5 fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={16} className="animate-spin text-accent" />
            <h3 className="text-sm font-bold text-accent tracking-wide uppercase">Multi-Vector Threat Analysis in Progress</h3>
          </div>
          <div className="space-y-3 pl-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = pipelineStep > idx;
              const isCurrent = pipelineStep === idx;
              const textMap = [
                'Capturing network telemetry',
                'ML anomaly detection processing',
                'DL sequence correlation analysis',
                'Threat risk score calculated',
                'Security alert generated',
                'RAG mitigation playbook ready'
              ];
              return (
                <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${isDone || isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                  {isDone ? (
                    <Check size={16} className="text-success" />
                  ) : isCurrent ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-1 mr-1" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />
                  )}
                  <span className={`text-sm ${isDone ? 'text-zinc-300' : isCurrent ? 'text-zinc-100 font-medium' : 'text-zinc-500'}`}>
                    {textMap[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Pipeline */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-accent engine-pulse" />
          <h3 className="text-sm font-bold text-zinc-100 tracking-wide">Detection Pipeline</h3>
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
              onClick={() => handleDetect(attack.id)}
              disabled={loading !== null || scanRunning}
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
                  <div className="text-[10px] font-bold text-zinc-600 tracking-wider mb-1 flex items-center justify-end gap-1">
                    CONFIDENCE
                    <div className="relative group flex items-center cursor-help">
                      <Info size={10} className="text-zinc-500 hover:text-zinc-300" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 text-xs text-zinc-300 normal-case tracking-normal font-normal rounded shadow-xl border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-left">
                        Confidence score represents the probability assigned after ML anomaly detection and DL sequence correlation.
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-zinc-200">{attack.confidence}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Dynamic Result Panel */}
      {lastResult && !lastResult.error && !scanRunning && (() => {
        // Compute display data based on selected phase tab
        const isPhaseView = selectedPhase !== null && lastResult.phases?.[selectedPhase];
        const phase = isPhaseView ? lastResult.phases[selectedPhase] : null;
        const displayAttack = isPhaseView ? phase.attack : lastResult.attack;
        const displaySeverity = isPhaseView ? phase.severity : lastResult.severity;
        const displayConfidence = isPhaseView ? phase.confidence : lastResult.dl_result?.confidence;
        const displayRisk = isPhaseView ? phase.risk_score : lastResult.risk_score;
        const displayRecommendation = isPhaseView ? phase.recommendation : lastResult.recommendation;

        // Get playbook for the currently displayed attack
        const playbook = ATTACK_PLAYBOOKS[displayAttack] || DEFAULT_PLAYBOOK;

        return (
          <div className="premium-card overflow-hidden fade-in">
            <div className="bg-zinc-900 border-b border-border p-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-critical" />
              <span className="font-semibold text-zinc-100">Threat Detected</span>
              <span className="text-sm text-zinc-500 ml-auto">
                ID: {lastResult.alert_id ? `THR-${String(lastResult.alert_id).padStart(4, '0')}` : displayAttack}
              </span>
            </div>

            {/* Phase Tabs — only shown for deep scan results */}
            {lastResult.phases && (
              <div className="flex items-center gap-1 px-4 pt-3 pb-0 bg-zinc-900/50 border-b border-border overflow-x-auto">
                <button
                  onClick={() => setSelectedPhase(null)}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                    selectedPhase === null
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Overview
                </button>
                {lastResult.phases.map((p, i) => {
                  const sevColor = p.severity === 'Critical' ? 'border-critical text-critical' : p.severity === 'High' ? 'border-warning text-warning' : p.severity === 'Medium' ? 'border-amber-500 text-amber-500' : 'border-success text-success';
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedPhase(i)}
                      className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                        selectedPhase === i
                          ? `${sevColor} bg-zinc-800/50`
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      P{i + 1}: {p.name}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Column */}
              <div className="space-y-6 lg:border-r border-border lg:pr-8">
                 <div>
                   <div className="text-xs text-zinc-500 font-medium mb-1">Detected Attack</div>
                   <div className="text-lg font-bold text-zinc-100 capitalize">{displayAttack.replace(/_/g, ' ')}</div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <div className="text-xs text-zinc-500 font-medium mb-1">Confidence</div>
                     <div className="text-lg font-semibold text-zinc-200">{(displayConfidence * 100).toFixed(0)}%</div>
                   </div>
                   <div>
                     <div className="text-xs text-zinc-500 font-medium mb-1">Risk Score</div>
                     <div className="text-lg font-semibold text-zinc-200">{displayRisk}</div>
                   </div>
                 </div>

                 {displaySeverity && (
                   <div>
                     <div className="text-xs text-zinc-500 font-medium mb-1">Severity</div>
                     <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                       displaySeverity === 'Critical' ? 'bg-critical/10 border border-critical/20 text-critical' :
                       displaySeverity === 'High' ? 'bg-warning/10 border border-warning/20 text-warning' :
                       displaySeverity === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                       'bg-success/10 border border-success/20 text-success'
                     }`}>
                       {displaySeverity}
                     </div>
                   </div>
                 )}
                 
                 <div>
                   <div className="text-xs text-zinc-500 font-medium mb-1">Detection Source</div>
                   <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md text-xs font-semibold">
                     ML + DL Correlation
                   </div>
                 </div>

                 {/* Per-phase summary — only in Overview tab */}
                 {!isPhaseView && lastResult.phases && (
                   <div>
                     <div className="text-xs text-zinc-500 font-medium mb-2">Scan Phases</div>
                     <div className="space-y-2">
                       {lastResult.phases.map((ph, i) => {
                         const sevColor = ph.severity === 'Critical' ? 'text-critical' : ph.severity === 'High' ? 'text-warning' : ph.severity === 'Medium' ? 'text-amber-500' : 'text-success';
                         return (
                           <button
                             key={i}
                             onClick={() => setSelectedPhase(i)}
                             className="w-full flex items-center justify-between p-2 bg-zinc-900/60 rounded-lg border border-border hover:border-zinc-600 transition-colors cursor-pointer"
                           >
                             <div className="flex items-center gap-2">
                               <div className="text-[10px] font-mono text-zinc-600 w-4">P{i + 1}</div>
                               <span className="text-xs font-medium text-zinc-200">{ph.name}</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <span className={`text-[10px] font-bold ${sevColor}`}>{ph.severity}</span>
                               <span className="text-[10px] font-mono text-zinc-400">{(ph.confidence * 100).toFixed(0)}%</span>
                             </div>
                           </button>
                         );
                       })}
                     </div>
                   </div>
                 )}
              </div>
              
              {/* Incident Response Playbook — dynamic per attack type */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 text-sm font-bold text-accent mb-4">
                  <Info size={16} /> Incident Response Playbook
                  {isPhaseView && (
                    <span className="text-xs font-normal text-zinc-500 ml-1">— {phase.name}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Immediate Action */}
                  <div className="bg-zinc-900/80 border border-border rounded-lg p-4 shadow-sm hover:border-zinc-700 transition-colors">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-critical flex items-center gap-2 mb-3">
                      <AlertTriangle size={12} /> Immediate Action
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {playbook.immediate.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-critical mt-1.5 shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Hardening */}
                  <div className="bg-zinc-900/80 border border-border rounded-lg p-4 shadow-sm hover:border-zinc-700 transition-colors">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-3">
                      <ShieldAlert size={12} /> Recommended Hardening
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {playbook.hardening.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threat Context — uses actual RAG recommendation */}
                  <div className="md:col-span-2 bg-zinc-900/80 border border-border rounded-lg p-4 shadow-sm hover:border-zinc-700 transition-colors">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-2">
                      <Server size={12} /> Threat Context
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                      "{displayRecommendation || 'Threat vector identified and analyzed. Incident response team notified. Continue monitoring for additional indicators of compromise.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {lastResult?.error && (
        <div className="p-4 bg-critical/10 border border-critical/20 rounded-xl text-critical text-sm fade-in">
          {lastResult.error}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Radio, Cpu, Share2, MessageSquare, Bell } from 'lucide-react';

export default function ArchitectureFlow() {
  return (
    <div className="space-y-8 fade-in pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h2 className="text-4xl font-bold text-white mb-3">Architecture Flow</h2>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          A comprehensive visualization of the CyberTwin AI pipeline. From raw attack simulation to deep learning analysis and actionable insights via our RAG-powered Security Assistant.
        </p>
      </div>

      {/* Flow Diagram Area */}
      <div className="relative py-12 min-h-[600px] flex items-center justify-center">
        
        {/* SVG Connecting Lines (Absolute behind cards) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Sim -> ML */}
          <path d="M 28% 50% Q 33% 50% 36% 40%" fill="none" stroke="#2a3143" strokeWidth="2" strokeDasharray="6 6" />
          {/* ML -> DL */}
          <path d="M 48% 40% Q 52% 40% 55% 65%" fill="none" stroke="#2a3143" strokeWidth="2" strokeDasharray="6 6" />
          {/* DL -> Assistant (Top Right) */}
          <path d="M 69% 65% Q 75% 65% 78% 35%" fill="none" stroke="#2a3143" strokeWidth="2" strokeDasharray="6 6" />
          {/* DL -> Alert (Bottom Right) */}
          <path d="M 69% 65% Q 75% 65% 78% 85%" fill="none" stroke="#2a3143" strokeWidth="2" strokeDasharray="6 6" />
        </svg>

        {/* Nodes Grid */}
        <div className="relative z-10 w-full h-full">
          
          {/* Node 1: Attack Simulator (Left, Middle) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-64">
            <NodeCard
              icon={<Radio size={16} className="text-accent" />}
              title="Attack Simulator"
              subtitle="INGESTION LAYER"
              desc="Generates synthetic, high-fidelity threat telemetry simulating APTs to train downstream models continuously."
            />
          </div>

          {/* Node 2: ML Engine (Center-Left, Top) */}
          <div className="absolute top-[20%] left-[36%] w-64">
            <NodeCard
              icon={<Cpu size={16} className="text-primary" />}
              title="ML Engine"
              subtitle="ISOLATION FOREST"
              desc="Unsupervised learning algorithm isolating rapid, zero-day anomalies by calculating path lengths in random decision trees."
            />
          </div>

          {/* Node 3: DL Engine (Center-Right, Bottom) */}
          <div className="absolute top-[50%] left-[55%] w-64">
            <NodeCard
              icon={<Share2 size={16} className="text-purple-400" />}
              title="DL Engine"
              subtitle="LSTM NETWORK"
              desc="Long Short-Term Memory processes time-series logs to predict complex, multi-stage attack narratives over extended durations."
              hasChart
            />
          </div>

          {/* Node 4: Security Assistant (Right, Top) */}
          <div className="absolute top-[10%] right-[5%] w-64">
            <NodeCard
              icon={<MessageSquare size={16} className="text-gray-300" />}
              title="Security Assistant"
              subtitle="RAG LLM"
              desc="Retrieves contextual threat intel and generates human-readable incident summaries and remediation steps."
            />
          </div>

          {/* Node 5: Threat Alert (Right, Bottom) */}
          <div className="absolute top-[70%] right-[5%] w-64">
            <NodeCard
              icon={<Bell size={16} className="text-danger" />}
              title="Threat Alert"
              subtitle="DASHBOARD UPDATE"
              desc="Prioritized alerts pushed to the SOC dashboard with automated mitigation playbooks attached."
              highlightBorder="border-danger/30"
              highlightBg="bg-danger/5"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

function NodeCard({ icon, title, subtitle, desc, hasChart, highlightBorder, highlightBg }) {
  return (
    <div className={`bg-card border rounded-2xl p-5 shadow-lg transition-transform hover:scale-105 ${highlightBorder || 'border-border'} ${highlightBg || ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2.5 bg-background border border-border rounded-lg shadow-inner">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <div className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">{subtitle}</div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
        {desc}
      </p>
      
      {hasChart && (
        <div className="mt-6 flex items-end gap-1.5 h-12 opacity-80">
          <div className="w-full bg-gray-700 rounded-t-sm" style={{ height: '30%' }} />
          <div className="w-full bg-gray-600 rounded-t-sm" style={{ height: '45%' }} />
          <div className="w-full bg-gray-500 rounded-t-sm" style={{ height: '60%' }} />
          <div className="w-full bg-purple-500 rounded-t-sm" style={{ height: '85%' }} />
          <div className="w-full bg-purple-400 rounded-t-sm" style={{ height: '100%' }} />
        </div>
      )}
    </div>
  );
}

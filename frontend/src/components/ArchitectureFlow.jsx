import React from 'react';
import { Radio, Cpu, Share2, MessageSquare, Bell } from 'lucide-react';

export default function ArchitectureFlow() {
  return (
    <div className="space-y-8 fade-in pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h2 className="text-4xl font-bold text-zinc-100 mb-3">Architecture Flow</h2>
        <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
          A comprehensive visualization of the CyberTwin AI pipeline. From raw attack simulation to deep learning analysis and actionable insights via our RAG-powered Security Assistant.
        </p>
      </div>

      {/* Flow Diagram Area */}
      <div className="py-12">
        {/* CSS Grid for robust layout instead of absolute positioning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-center">
          
          {/* Node 1: Attack Simulator */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[260px]">
              <NodeCard
                icon={<Radio size={16} className="text-accent" />}
                title="Attack Simulator"
                subtitle="INGESTION LAYER"
                desc="Generates synthetic, high-fidelity threat telemetry simulating APTs to train downstream models continuously."
              />
            </div>
          </div>

          {/* Nodes 2 & 3: Engines */}
          <div className="flex flex-col gap-8 items-center relative">
            {/* SVG Connecting Line Vertical */}
            <div className="hidden md:block absolute left-1/2 top-[40%] bottom-[40%] w-px border-l-2 border-dashed border-border -z-10" />
            
            <div className="w-full max-w-[260px]">
              <NodeCard
                icon={<Cpu size={16} className="text-primary" />}
                title="ML Engine"
                subtitle="ISOLATION FOREST"
                desc="Unsupervised learning algorithm isolating rapid, zero-day anomalies by calculating path lengths in random decision trees."
              />
            </div>
            
            <div className="w-full max-w-[260px]">
              <NodeCard
                icon={<Share2 size={16} className="text-purple-400" />}
                title="DL Engine"
                subtitle="LSTM NETWORK"
                desc="Long Short-Term Memory processes time-series logs to predict complex, multi-stage attack narratives over extended durations."
                hasChart
              />
            </div>
          </div>

          {/* Nodes 4 & 5: Outputs */}
          <div className="flex flex-col gap-8 justify-center md:justify-start">
            <div className="w-full max-w-[260px]">
              <NodeCard
                icon={<MessageSquare size={16} className="text-zinc-300" />}
                title="Security Assistant"
                subtitle="RAG LLM"
                desc="Retrieves contextual threat intel and generates human-readable incident summaries and remediation steps."
              />
            </div>
            
            <div className="w-full max-w-[260px]">
              <NodeCard
                icon={<Bell size={16} className="text-critical" />}
                title="Threat Alert"
                subtitle="DASHBOARD UPDATE"
                desc="Prioritized alerts pushed to the SOC dashboard with automated mitigation playbooks attached."
                highlightBorder="border-critical/30"
                highlightBg="bg-critical/5"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function NodeCard({ icon, title, subtitle, desc, hasChart, highlightBorder, highlightBg }) {
  return (
    <div className={`premium-card p-5 transition-transform hover:scale-105 ${highlightBorder || 'border-border'} ${highlightBg || ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2.5 bg-zinc-900 border border-border rounded-lg shadow-inner">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-100">{title}</h3>
          <div className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">{subtitle}</div>
        </div>
      </div>
      <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
        {desc}
      </p>
      
      {hasChart && (
        <div className="mt-6 flex items-end gap-1.5 h-12 opacity-80">
          <div className="w-full bg-zinc-700 rounded-t-sm" style={{ height: '30%' }} />
          <div className="w-full bg-zinc-600 rounded-t-sm" style={{ height: '45%' }} />
          <div className="w-full bg-zinc-500 rounded-t-sm" style={{ height: '60%' }} />
          <div className="w-full bg-purple-500 rounded-t-sm" style={{ height: '85%' }} />
          <div className="w-full bg-purple-400 rounded-t-sm" style={{ height: '100%' }} />
        </div>
      )}
    </div>
  );
}

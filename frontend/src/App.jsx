import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Activity, AlertTriangle, MessageSquare, Terminal, Server } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Shield className="text-primary w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wider text-white">CyberTwin<span className="text-primary">AI</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<Activity />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<AlertTriangle />} label="Threat Alerts" isActive={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
          <NavItem icon={<MessageSquare />} label="Security Assistant" isActive={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
        </nav>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          MVP Edition
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'alerts' && <ThreatAlerts />}
        {activeTab === 'assistant' && <SecurityAssistant />}
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Dashboard() {
  const [riskData, setRiskData] = useState({ risk_score: 0, level: 'Loading...' });
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/risk-score`).then(res => setRiskData(res.data)).catch(console.error);
    axios.get(`${API_BASE}/system-status`).then(res => setSystemStatus(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <div className="bg-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">Overall Risk Score</h3>
            <Shield className={riskData.level === 'High' ? 'text-danger' : 'text-primary'} />
          </div>
          <div className="text-5xl font-bold text-white mb-2">{riskData.risk_score}</div>
          <div className={`text-sm ${riskData.level === 'High' ? 'text-danger' : 'text-primary'}`}>
            {riskData.level} Risk Level
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card p-6 rounded-xl border border-gray-800 shadow-lg">
           <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">System Health</h3>
            <Server className="text-accent" />
          </div>
          {systemStatus ? (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Backend API</span>
                <span className="text-accent">{systemStatus.backend}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ML Engine</span>
                <span className="text-accent">{systemStatus.ml_engine}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>DL Engine (LSTM)</span>
                <span className="text-accent">{systemStatus.dl_engine}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RAG Engine</span>
                <span className="text-accent">{systemStatus.rag_engine}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreatAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [mlDetect, setMlDetect] = useState(null);
  const [dlDetect, setDlDetect] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/alerts`).then(res => setAlerts(res.data)).catch(console.error);
  }, []);

  const runMlDetection = () => {
    axios.get(`${API_BASE}/threat-detection`).then(res => setMlDetect(res.data)).catch(console.error);
  };

  const runDlDetection = () => {
    axios.get(`${API_BASE}/dl-threat-analysis`).then(res => setDlDetect(res.data)).catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Active Threat Alerts</h2>
        <div className="flex gap-3">
          <button onClick={runMlDetection} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700">
            <Terminal size={18} /> Run ML
          </button>
          <button onClick={runDlDetection} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Activity size={18} /> Run DL Sequence Analysis
          </button>
        </div>
      </div>

      {dlDetect && (
        <div className="bg-primary/10 border border-primary p-4 rounded-xl flex justify-between items-center shadow-lg">
          <div>
            <h4 className="text-primary font-bold">Deep Learning Analysis: {dlDetect.threat_prediction}</h4>
            <p className="text-sm text-gray-300">Confidence Score: {(dlDetect.confidence * 100).toFixed(0)}%</p>
          </div>
          <span className={`px-3 py-1 text-white text-xs rounded-full uppercase font-bold ${dlDetect.severity === 'High' ? 'bg-danger' : 'bg-accent'}`}>{dlDetect.severity}</span>
        </div>
      )}

      {mlDetect && (
        <div className="bg-danger/10 border border-danger p-4 rounded-xl flex justify-between items-center">
          <div>
            <h4 className="text-danger font-bold">New Anomaly Detected: {mlDetect.threat}</h4>
            <p className="text-sm text-gray-300">Score: {mlDetect.risk_score} | {mlDetect.recommendation}</p>
          </div>
          <span className="px-3 py-1 bg-danger text-white text-xs rounded-full uppercase font-bold">{mlDetect.severity}</span>
        </div>
      )}

      <div className="bg-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-sm">
              <th className="p-4 font-medium">Threat Type</th>
              <th className="p-4 font-medium">Severity</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, idx) => (
              <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 text-white font-medium flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  {alert.type}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'High' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  }`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{alert.status}</td>
                <td className="p-4 text-gray-500 text-sm">{alert.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your CyberTwin RAG Assistant. Ask me a cybersecurity question.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newMsgs = [...messages, { role: 'user', content: query }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/security-assistant`, { question: query });
      setMessages([...newMsgs, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: 'Error connecting to RAG backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-card rounded-xl border border-gray-800 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-primary w-5 h-5" />
          RAG Security Assistant
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-xl ${
              msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-4 rounded-xl bg-gray-800 text-gray-400 rounded-bl-none animate-pulse">
              Retrieving knowledge...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about mitigating SQL injection..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

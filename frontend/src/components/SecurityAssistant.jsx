import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Shield, User, Copy, Loader2, Key, Database, BookOpen, AlertCircle, AlertTriangle, Brain, Search } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

const SUGGESTIONS = [
  { text: 'Prevent brute force attacks', icon: <Shield size={14} className="text-success" /> },
  { text: 'SQL injection mitigation', icon: <AlertTriangle size={14} className="text-warning" /> },
  { text: 'Explain MITRE ATT&CK', icon: <Brain size={14} className="text-purple-400" /> },
  { text: 'Credential stuffing explained', icon: <Search size={14} className="text-accent" /> },
];

export default function SecurityAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Good afternoon. System status is optimal. I am currently monitoring 4 active telemetry streams.\n\nHow can I assist you with threat analysis or remediation today?",
      timestamp: '14:02',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    const question = forcedText || query;
    if (!question.trim()) return;

    const userMsg = {
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/security-assistant`, { question: userMsg.content });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error connecting to the intelligence engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Suggestion Chips */}
      {messages.length <= 1 && (
        <div className="px-4 md:px-12 py-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto w-full">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend({ preventDefault: () => {}, target: { value: s.text } }, s.text)}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-sm text-zinc-300
                hover:border-zinc-600 hover:bg-zinc-800/50 hover:-translate-y-0.5 transition-all duration-200 text-left group shadow-sm"
            >
              <div className="p-2 rounded-lg bg-zinc-900 border border-border group-hover:bg-zinc-800 transition-colors">
                {s.icon}
              </div>
              <span className="font-medium">{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-6">
        
        {/* Session Divider */}
        <div className="flex justify-center items-center gap-4 my-8">
          <div className="h-px bg-border flex-1" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Session Started - Today, 14:02 UTC
          </span>
          <div className="h-px bg-border flex-1" />
        </div>

        {messages.map((msg, idx) => {
          const isBot = msg.role === 'assistant';
          
          return (
            <div key={idx} className={`flex gap-4 max-w-4xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                {isBot ? (
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                    <Shield size={14} className="text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <User size={14} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className={`flex items-center gap-2 px-1 ${isBot ? '' : 'justify-end'}`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {isBot ? 'CyberTwin AI' : 'Operator'}
                  </span>
                  <span className="text-[10px] font-medium text-gray-600">{msg.timestamp}</span>
                </div>
                
                <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                  isBot 
                    ? 'bg-card border border-border text-gray-200 rounded-tl-sm' 
                    : 'bg-primary text-white rounded-tr-sm'
                }`}>
                  {isBot ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            
                            if (!inline && match) {
                              return (
                                <div className="mt-4 mb-2 rounded-lg border border-border overflow-hidden bg-[#1d1f21]">
                                  <div className="flex items-center justify-between px-4 py-2 bg-[#151619] border-b border-border">
                                    <span className="text-xs text-gray-400 font-mono">Code Snippet</span>
                                    <button 
                                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                      onClick={() => navigator.clipboard.writeText(codeString)}
                                    >
                                      <Copy size={12} /> Copy
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={atomDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                    {...props}
                                  >
                                    {codeString}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            }
                            
                            return (
                              <code className="bg-background/50 text-danger px-1.5 py-0.5 rounded font-mono text-[13px]" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-4 max-w-4xl mr-auto">
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                <Loader2 size={14} className="text-primary animate-spin" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CyberTwin AI</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '150ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:px-12 bg-background border-t border-border shrink-0">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search context or ask a question..."
            disabled={loading}
            className="w-full bg-card border border-border text-white rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

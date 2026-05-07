"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Cpu, 
  Database, 
  History, 
  Layers, 
  MessageSquare, 
  Play, 
  RefreshCcw, 
  Shield, 
  Terminal,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const mockMetrics = [
  { time: '16:00', value: 120 },
  { time: '16:05', value: 132 },
  { time: '16:10', value: 101 },
  { time: '16:15', value: 134 },
  { time: '16:20', value: 490 },
  { time: '16:25', value: 850 },
  { time: '16:30', value: 920 },
  { time: '16:35', value: 940 },
];

const mockTimeline = [
  { id: 1, time: '16:22', type: 'alert', message: 'PagerDuty Alert: High Latency in api-gateway', status: 'critical' },
  { id: 2, time: '16:23', type: 'agent', message: 'Commander Initialized. Starting triage...', status: 'info' },
  { id: 3, time: '16:25', type: 'agent', message: 'Identified 500 errors in service-cart logs', status: 'warning' },
  { id: 4, time: '16:28', type: 'agent', message: 'Trace analysis suggests database connection pool exhaustion', status: 'warning' },
  { id: 5, time: '16:30', type: 'suggestion', message: 'Suggested Action: Increase DB pool size or Rollback deployment v1.2.4', status: 'action' },
];

export default function IncidentCommander() {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState('investigating');
  const [timeline, setTimeline] = useState(mockTimeline);
  const [selectedAction, setSelectedAction] = useState<{ label: string } | null>(null);
  const [approvalStep, setApprovalStep] = useState('idle');
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'integrations' | 'console'>('dashboard');
  const [isAddConnectorModalOpen, setIsAddConnectorModalOpen] = useState(false);

  const startApproval = (action: any) => {
    setSelectedAction(action);
    setApprovalStep('reviewing');
  };

  const runSafetyChecks = async () => {
    setApprovalStep('checking');
    await new Promise(r => setTimeout(r, 2000));
    setApprovalStep('executing');
    await new Promise(r => setTimeout(r, 2000));
    setApprovalStep('success');
    
    setTimeline(prev => [
      ...prev,
      { 
        id: Date.now(), 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        type: 'agent', 
        message: `Action Executed: ${selectedAction?.label}`,
        status: 'resolved' 
      }
    ]);
  };

  // Resolve incident handler – marks incident as resolved and adds entry to timeline
  const handleResolve = () => {
    setStatus('resolved');
    setTimeline(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'agent',
        message: 'Incident resolved by user',
        status: 'resolved',
      },
    ]);
  };

  // Mock Slack sync – adds a temporary sync entry
  const handleSlackSync = () => {
    setTimeline(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'agent',
        message: 'Slack sync triggered',
        status: 'info',
      },
    ]);
  };

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/incidents/INC-1/events');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
      setTimeline(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          type: 'agent', 
          message: data.message, 
          status: data.status === 'awaiting_approval' ? 'action' : 'info' 
        }
      ]);
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200/50">
            <Shield size={24} className="text-white" />
          </div>
          <span className="hidden lg:block font-bold tracking-tight text-xl text-slate-900">COMMANDER</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<Activity size={20} />} label="Active Incidents" active={currentView === 'dashboard'} count={1} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={<History size={20} />} label="History" active={currentView === 'history'} onClick={() => setCurrentView('history')} />
          <SidebarItem icon={<Cpu size={20} />} label="Integrations" active={currentView === 'integrations'} onClick={() => setCurrentView('integrations')} />
          <SidebarItem icon={<Terminal size={20} />} label="Console" active={currentView === 'console'} onClick={() => setCurrentView('console')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-sm" />
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-900">SRE Lead</p>
              <p className="text-xs text-slate-500">Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50/50 blur-[100px] -z-10 pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-red-50 border border-red-100 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Critical Incident</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">INC-2024-0503: API Latency Spike</h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleSlackSync} className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
              <MessageSquare size={16} className="text-slate-500" />
              Slack Sync
            </button>
            <button onClick={handleResolve} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200">
              Resolve Incident
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'dashboard' ? (
            <>
              <div className="px-8 border-b border-slate-200 flex gap-8 bg-white/50 backdrop-blur-sm">
                {['overview', 'analysis', 'logs'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-bold transition-colors border-b-2 capitalize ${
                      activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-wider">
                          <Activity size={16} className="text-blue-500" /> System Latency (P99)
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockMetrics}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#2563eb' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-wider">
                          <Cpu size={16} className="text-indigo-500" /> Agent Status
                        </h3>
                        <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-50 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Database size={24} className="text-blue-500" />
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900 capitalize">{status}...</p>
                          <div className="px-3 py-1 bg-blue-50 rounded-full">
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Real-time Analysis</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-wider">
                          <History size={16} className="text-slate-400" /> Live Incident Timeline
                        </h3>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                          {timeline.map((item) => (
                            <div key={item.id} className="flex gap-4 relative group">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                                  item.status === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                                  item.status === 'action' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                  'bg-slate-50 text-slate-400 border border-slate-100'
                                } z-10`}>
                                  {item.status === 'critical' ? <AlertTriangle size={14} /> : 
                                   item.status === 'action' ? <CheckCircle size={14} /> : 
                                   <ChevronRight size={14} />}
                                </div>
                                <div className="w-px h-full bg-slate-100 mt-2" />
                              </div>
                              <div className="pb-6">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.time}</span>
                                  <span className={`text-[10px] font-bold uppercase ${
                                    item.type === 'agent' ? 'text-blue-600' : 'text-slate-400'
                                  }`}>{item.type}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                          <Play size={16} className="text-blue-600" /> Recommended Actions
                        </h3>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
                          <h4 className="text-xl font-bold mb-2">Rollback to v1.2.3</h4>
                          <p className="text-sm text-blue-100 mb-6 font-medium">Memory leak detected in current version. Immediate rollback recommended for stability.</p>
                          <button onClick={() => startApproval({ label: 'Rollback to v1.2.3' })} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold transition-all hover:bg-slate-50 shadow-sm">
                            Approve & Execute
                          </button>
                        </motion.div>

                        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                          <h4 className="text-lg font-bold text-slate-900 mb-1">Scale Redis Cluster</h4>
                          <p className="text-xs text-slate-500 mb-6 font-medium">Memory usage at 94%. Scaling vertically to handle traffic surge.</p>
                          <button onClick={() => setActiveTab('analysis')} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors">
                            View Analysis
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                        <Database className="text-blue-600" /> Root Cause Analysis
                      </h3>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-700 leading-relaxed font-medium">Detected anomalous spike in database connection wait times correlated with elevated API errors.</p>
                      </div>
                      <div className="space-y-4">
                        <ReasoningStep step="1" text="Identified 503 errors in api-gateway logs via automated log analysis." />
                        <ReasoningStep step="2" text="Correlated error timing with deployment v1.2.4 using deployment event data." />
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 overflow-hidden shadow-sm">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-900">
                        <Terminal className="text-slate-400" /> Raw Telemetry
                      </h3>
                      <div className="bg-slate-50 rounded-2xl p-6 font-mono text-[11px] overflow-x-auto text-slate-600 border border-slate-200">
                        <p className="text-blue-600 mb-1">{"// Datadog Query: service.latency{host:*}"}</p>
                        <p className="mb-1 text-slate-900 font-bold">[16:20:00] 12.4% idle (Critical Threshold: 15%)</p>
                        <p className="text-red-500 font-bold">[16:20:05] ALERT: Connection Pool Exhaustion</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers size={24} className="text-slate-200" />
                    </div>
                    <p className="font-bold text-slate-900 mb-1">No Deep-Dive Logs Selected</p>
                    <p className="text-sm font-medium">Select an incident from the timeline to view correlated logs.</p>
                  </div>
                )}
              </div>
            </>
          ) : currentView === 'history' ? (
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold text-slate-900">Incident History</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'INC-2024-0501', title: 'DB Latency Spike', msg: 'Resolved by scaling connection pool. Downtime: 4m.', status: 'Resolved' },
                  { id: 'INC-2024-0489', title: 'Auth Service Failure', msg: 'Mitigated via emergency rollback to stable v1.2.2.', status: 'Resolved' }
                ].map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.id}: {item.title}</span>
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase border border-green-100">{item.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">{item.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : currentView === 'integrations' ? (
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold text-slate-900">System Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  { name: 'Datadog', icon: <Database />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { name: 'Kubernetes', icon: <Cpu />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
                  { name: 'PagerDuty', icon: <Shield />, color: 'bg-green-50 text-green-600 border-green-100' },
                  { name: 'Slack', icon: <MessageSquare />, color: 'bg-yellow-50 text-yellow-600 border-yellow-100' }
                ].map(tool => (
                  <div key={tool.name} className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center gap-6 hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group">
                    <div className={`p-4 rounded-2xl border transition-all group-hover:scale-110 ${tool.color}`}>
                      {React.cloneElement(tool.icon as React.ReactElement, { size: 32 })}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{tool.name}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Operational</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Connector Card */}
                <div onClick={() => setIsAddConnectorModalOpen(true)} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group text-center min-h-[160px]">
                  <div className="p-3 rounded-full bg-white shadow-sm border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                    <Plus size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 group-hover:text-blue-700">Add New Connector</p>
                    <p className="text-xs text-slate-500 mt-1">Configure Webhooks, APIs, etc.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Terminal size={24} className="text-slate-400" /> System Console
                </h2>
                <div className="px-3 py-1 bg-slate-100 rounded-full">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Output</span>
                </div>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 font-mono text-[11px] border border-slate-800 shadow-2xl h-[500px] overflow-y-auto relative">
                <div className="sticky top-0 right-0 bg-slate-900 pb-4 flex justify-between items-center border-b border-slate-800 mb-4">
                  <p className="text-blue-400 font-bold tracking-widest">// AI AGENT CORE REASONING</p>
                  <p className="text-slate-600">v4.2.0-stable</p>
                </div>
                <p className="text-slate-400 mb-1 leading-relaxed"><span className="text-slate-600 mr-2">[16:20:01]</span> <span className="text-blue-400">INFO:</span> Commander engine initialized in high-availability mode.</p>
                <p className="text-slate-400 mb-1 leading-relaxed"><span className="text-slate-600 mr-2">[16:20:05]</span> <span className="text-blue-400">DEBUG:</span> Querying Datadog API for metric: <span className="text-indigo-400">service.api_gateway.p99_latency</span></p>
                <p className="text-yellow-400 mb-1 leading-relaxed font-bold"><span className="text-slate-600 mr-2">[16:21:12]</span> WARN: Latency spike (850ms) detected on shard 04. Analyzing correlation...</p>
                <p className="text-slate-400 mb-1 leading-relaxed"><span className="text-slate-600 mr-2">[16:21:45]</span> <span className="text-blue-400">INFO:</span> Found correlation with Kubernetes deployment event <span className="text-indigo-400">dep-v1.2.4</span>.</p>
                <p className="text-green-400 mb-1 leading-relaxed font-bold"><span className="text-slate-600 mr-2">[16:22:10]</span> SUCCESS: Safety verification passed for rollback command.</p>
                <p className="text-blue-400 font-bold mt-4 animate-pulse">_</p>
              </div>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        <AnimatePresence>
          {isAddConnectorModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-white rounded-[32px] p-10 shadow-2xl border border-slate-100 relative">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Plus size={32} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Add New Connector
                </h2>
                <p className="text-slate-500 mb-8 font-medium">Configure a new webhook or API integration for incident triggers.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Connector Name</label>
                    <input type="text" placeholder="e.g. Sentry, Jira" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Webhook URL / API Endpoint</label>
                    <input type="text" placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium font-mono" />
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button onClick={() => setIsAddConnectorModalOpen(false)} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200">Save Connector</button>
                  <button onClick={() => setIsAddConnectorModalOpen(false)} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all">Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {approvalStep !== 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-white rounded-[32px] p-10 shadow-2xl border border-slate-100">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Shield size={32} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Action Approval
                </h2>
                <p className="text-slate-500 mb-8 font-medium">Verify safety steps for: <span className="text-blue-600 font-bold">{selectedAction?.label}</span></p>
                
                <div className="space-y-6">
                  <StepItem label="Safety Verification" status={approvalStep === 'reviewing' ? 'current' : 'complete'} />
                  <StepItem label="Pre-flight Checks" status={approvalStep === 'checking' ? 'current' : (approvalStep === 'executing' || approvalStep === 'success' ? 'complete' : 'pending')} />
                  <StepItem label="Executing Command" status={approvalStep === 'executing' ? 'current' : (approvalStep === 'success' ? 'complete' : 'pending')} />
                </div>

                <div className="mt-10 flex gap-4">
                  {approvalStep === 'reviewing' ? (
                    <>
                      <button onClick={runSafetyChecks} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200">Confirm Execute</button>
                      <button onClick={() => setApprovalStep('idle')} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all">Cancel</button>
                    </>
                  ) : approvalStep === 'success' ? (
                    <button onClick={() => setApprovalStep('idle')} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-200">Close & Return</button>
                  ) : (
                    <div className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-center animate-pulse border border-slate-100 flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Processing Action...
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, count = 0, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="hidden lg:block text-sm font-bold tracking-tight">{label}</span>
      </div>
      {count > 0 && <span className="hidden lg:flex w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full items-center justify-center shadow-lg shadow-blue-200">{count}</span>}
    </div>
  );
}

function StepItem({ label, status }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${status === 'complete' ? 'bg-blue-600 border-blue-600' : status === 'current' ? 'border-blue-500 animate-pulse' : 'border-slate-200'}`}>
        {status === 'complete' && <CheckCircle size={14} className="text-white" />}
        {status === 'current' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
      </div>
      <span className={`text-sm font-medium ${status === 'pending' ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    </div>
  );
}

function ReasoningStep({ step, text }: any) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-50 text-[10px] font-bold flex items-center justify-center text-slate-500 border border-slate-200">{step}</span>
      <p className="text-sm text-slate-600 font-medium">{text}</p>
    </div>
  );
}

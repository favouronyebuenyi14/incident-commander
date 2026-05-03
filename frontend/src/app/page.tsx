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
  Terminal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Mock data for the incident dashboard
const mockMetrics = [
  { time: '16:00', value: 120 },
  { time: '16:05', value: 132 },
  { time: '16:10', value: 101 },
  { time: '16:15', value: 134 },
  { time: '16:20', value: 490 }, // Spike!
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
  const [selectedAction, setSelectedAction] = useState(null);
  const [approvalStep, setApprovalStep] = useState('idle'); // idle, reviewing, checking, executing, success

  const startApproval = (action) => {
    setSelectedAction(action);
    setApprovalStep('reviewing');
  };

  const runSafetyChecks = async () => {
    setApprovalStep('checking');
    await new Promise(r => setTimeout(r, 2000)); // Simulate checks
    setApprovalStep('executing');
    await new Promise(r => setTimeout(r, 2000)); // Simulate execution
    setApprovalStep('success');
    
    setTimeline(prev => [
      ...prev,
      { 
        id: Date.now(), 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        type: 'agent', 
        message: `Action Executed: ${selectedAction.label}`, 
        status: 'resolved' 
      }
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
    <div className="flex h-screen bg-[#0a0a0c] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 border-r border-slate-800/50 flex flex-col bg-[#0d0d0f]">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg glow-blue">
            <Shield size={24} className="text-white" />
          </div>
          <span className="hidden lg:block font-bold tracking-tight text-xl">COMMANDER</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<Activity size={20} />} label="Active Incidents" active count={1} />
          <SidebarItem icon={<History size={20} />} label="History" />
          <SidebarItem icon={<Cpu size={20} />} label="Integrations" />
          <SidebarItem icon={<Terminal size={20} />} label="Console" />
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
            <div className="hidden lg:block">
              <p className="text-sm font-medium">SRE Lead</p>
              <p className="text-xs text-slate-500">Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] -z-10 pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Critical Incident</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-100">INC-2024-0503: API Latency Spike</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-sm transition-colors flex items-center gap-2">
              <MessageSquare size={16} />
              Slack Sync
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all glow-blue">
              Resolve Incident
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-8 border-b border-slate-800/50 flex gap-8 bg-[#0a0a0c]/50 backdrop-blur-sm">
          {['overview', 'analysis', 'logs'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium transition-colors border-b-2 capitalize ${
                activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'overview' ? (
            <>
              {/* Top Row: Metrics and Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... existing overview content ... */}
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Activity size={16} />
                  System Latency (P99)
                </h3>
                <div className="flex gap-2">
                  {['1h', '3h', '12h'].map(t => (
                    <button key={t} className={`px-2 py-1 text-xs rounded ${t === '1h' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockMetrics}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d0d0f', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 flex flex-col">
              <h3 className="text-sm font-medium text-slate-400 mb-6 flex items-center gap-2">
                <Cpu size={16} />
                Agent Status
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-blue-600/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Database size={24} className="text-blue-500" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-200 capitalize">{status}...</p>
                <p className="text-xs text-slate-500 text-center">
                  {status === 'diagnosing' ? 'Analyzing traces and logs with Llama 3...' : 
                   status === 'investigating' ? 'Gathering telemetry...' :
                   status === 'mitigating' ? 'Calculating optimal remediation...' :
                   'Awaiting human verification.'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Timeline and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass rounded-2xl p-6 overflow-hidden flex flex-col">
              <h3 className="text-sm font-medium text-slate-400 mb-6 flex items-center gap-2">
                <History size={16} />
                Live Incident Timeline
              </h3>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {timeline.map((item) => (
                  <div key={item.id} className="flex gap-4 relative group">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.status === 'critical' ? 'bg-red-500/20 text-red-500' :
                        item.status === 'action' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-slate-800 text-slate-400'
                      } z-10`}>
                        {item.status === 'critical' ? <AlertTriangle size={14} /> : 
                         item.status === 'action' ? <CheckCircle size={14} /> : 
                         <ChevronRight size={14} />}
                      </div>
                      <div className="w-0.5 h-full bg-slate-800 mt-2" />
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{item.time}</span>
                        <span className={`text-[10px] font-bold uppercase ${
                          item.type === 'agent' ? 'text-blue-400' : 'text-slate-400'
                        }`}>{item.type}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Play size={16} />
                Recommended Actions
              </h3>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/30 glow-blue"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <RefreshCcw size={20} className="text-white" />
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase">High Confidence</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Rollback to v1.2.3</h4>
                <p className="text-sm text-slate-400 mb-6">
                  Detected memory leak patterns in current deployment. Reverting to previous stable build will resolve 98% of identified latencies.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => startApproval({ label: 'Rollback to v1.2.3', confidence: 95 })}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
                  >
                    Approve & Execute
                  </button>
                  <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all">
                    Reject
                  </button>
                </div>
              </motion.div>

              {/* Approval Overlay Modal */}
              <AnimatePresence>
                {approvalStep !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl"
                    >
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="text-blue-500" />
                        Approval: {selectedAction?.label}
                      </h2>

                      <div className="space-y-6">
                        <StepItem 
                          label="Safety Verification" 
                          status={approvalStep === 'reviewing' ? 'current' : approvalStep === 'idle' ? 'pending' : 'complete'} 
                        />
                        <StepItem 
                          label="Pre-flight Infrastructure Checks" 
                          status={approvalStep === 'checking' ? 'current' : (approvalStep === 'executing' || approvalStep === 'success') ? 'complete' : 'pending'} 
                        />
                        <StepItem 
                          label="Executing Command" 
                          status={approvalStep === 'executing' ? 'current' : approvalStep === 'success' ? 'complete' : 'pending'} 
                        />
                      </div>

                      <div className="mt-8 flex gap-4">
                        {approvalStep === 'reviewing' ? (
                          <>
                            <button 
                              onClick={runSafetyChecks}
                              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold glow-blue"
                            >
                              Confirm Execution
                            </button>
                            <button 
                              onClick={() => setApprovalStep('idle')}
                              className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl"
                            >
                              Cancel
                            </button>
                          </>
                        ) : approvalStep === 'success' ? (
                          <button 
                            onClick={() => setApprovalStep('idle')}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold"
                          >
                            Close & Monitor recovery
                          </button>
                        ) : (
                          <div className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl text-center animate-pulse">
                            Processing...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 rounded-2xl glass border-slate-800/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Layers size={20} className="text-slate-400" />
                  </div>
                </div>
                <h4 className="text-base font-semibold text-slate-100 mb-1">Scale Redis Cluster</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Memory usage at 94%. Scaling vertically by +4GB to alleviate pressure.
                </p>
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all border border-slate-700/50">
                  View Analysis
                </button>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'analysis' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass rounded-2xl p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Database className="text-blue-500" />
                  Root Cause Analysis
                </h3>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-400 text-sm font-semibold uppercase mb-2">Primary Findings</p>
                  <p className="text-slate-200 leading-relaxed">
                    Detected anomalous spike in database connection wait times correlating exactly with the deployment of `api-v1.2.4`. 
                    Logs indicate `java.lang.OutOfMemoryError` in 40% of frontend pods.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">AI Reasoning Chain</h4>
                  <div className="space-y-3">
                    <ReasoningStep step="1" text="Identified 503 errors in api-gateway logs." />
                    <ReasoningStep step="2" text="Correlated error timing with v1.2.4 deployment event." />
                    <ReasoningStep step="3" text="Traced memory saturation in worker-nodes via Datadog metrics." />
                    <ReasoningStep step="4" text="Validated that database CPU remains healthy, pointing to a client-side leak." />
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-8 overflow-hidden">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                  <Terminal className="text-slate-500" />
                  Raw Telemetry Input
                </h3>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs overflow-x-auto text-slate-400 space-y-2 border border-slate-900">
                  <p className="text-blue-500">// Datadog Query: avg:system.cpu.idle</p>
                  <p>[16:20:00] 12.4% idle (Critical)</p>
                  <p>[16:21:00] 11.8% idle (Critical)</p>
                  <p className="text-purple-500 mt-4">// K8s Logs: namespace=default app=api-gateway</p>
                  <p>... ERROR: java.lang.OutOfMemoryError: Java heap space</p>
                  <p>... WARN: Connection pool exhausted (max=100)</p>
                  <p>... INFO: Health check failed for pod-xyz-789</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 animate-pulse">
              Select an incident to view deep-dive logs.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, count = 0 }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
    }`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="hidden lg:block text-sm font-medium">{label}</span>
      </div>
      {count > 0 && (
        <span className="hidden lg:flex w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full items-center justify-center glow-blue">
          {count}
        </span>
      )}
    </div>
  );
}

function StepItem({ label, status }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
        status === 'complete' ? 'bg-blue-600 border-blue-600' : 
        status === 'current' ? 'border-blue-500 animate-pulse' : 
        'border-slate-800'
      }`}>
        {status === 'complete' && <CheckCircle size={14} className="text-white" />}
        {status === 'current' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
      </div>
      <span className={`text-sm ${status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>
        {label}
      </span>
    </div>
  );
}

function ReasoningStep({ step, text }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-400 border border-slate-700">
        {step}
      </span>
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon, ShieldCheck, Globe, PenTool } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
}

const getIcon = (agent: string) => {
  switch (agent) {
    case 'CRAWLER': return <Globe size={14} className="text-blue-400" />;
    case 'VISION': return <ShieldCheck size={14} className="text-purple-400" />;
    case 'WRITER': return <PenTool size={14} className="text-green-400" />;
    default: return <TerminalIcon size={14} className="text-gray-400" />;
  }
};

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-gray-400" />
          <span className="text-xs font-mono text-gray-400">AGENT_ORCHESTRATOR_V1.log</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto font-mono text-sm space-y-2 flex-1 scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Waiting for input stream...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
            <div className="flex items-center gap-2 shrink-0 w-24">
              {getIcon(log.agent)}
              <span className={`text-xs font-bold ${
                log.agent === 'CRAWLER' ? 'text-blue-400' :
                log.agent === 'VISION' ? 'text-purple-400' :
                log.agent === 'WRITER' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {log.agent}
              </span>
            </div>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-300' :
              log.type === 'warning' ? 'text-yellow-300' :
              'text-gray-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
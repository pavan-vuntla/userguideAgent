import React, { useState, useCallback } from 'react';
import { 
  Cpu, 
  Search, 
  Settings, 
  Play, 
  Command, 
  Layers,
  FileText,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Terminal } from './components/Terminal';
import { Preview } from './components/Preview';
import { AgentState, LogEntry, AgentConfig, Screenshot } from './types';
import { generateUserGuide } from './services/gemini';
import { downloadPDF } from './utils/pdf';

const MOCK_LOG_DELAY = 800;

// Helper to create a dummy base64 image
const createMockScreenshot = (text: string, color: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f3f4f6'; // bg-gray-100
    ctx.fillRect(0, 0, 800, 450);
    
    // Header bar
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 800, 40);

    // Mock Content Layout
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(50, 80, 700, 40); // Title
    ctx.fillRect(50, 140, 200, 200); // Image area
    ctx.fillRect(280, 140, 470, 20); // Text lines
    ctx.fillRect(280, 180, 470, 20);
    ctx.fillRect(280, 220, 300, 20);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 400, 225);
  }
  return canvas.toDataURL('image/jpeg', 0.7);
};

export default function App() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<AgentState>(AgentState.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [config, setConfig] = useState<AgentConfig>({
    depth: 'deep',
    tone: 'user-friendly',
    includeScreenshots: true
  });
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((agent: string, message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + '.' + String(now.getMilliseconds()).padStart(3, '0'),
      agent,
      message,
      type
    }]);
  }, []);

  const handleSimulatedCrawl = async (targetUrl: string) => {
    addLog('SYSTEM', `Initializing agent workflow for target: ${targetUrl}`, 'info');
    await new Promise(r => setTimeout(r, MOCK_LOG_DELAY));
    
    setState(AgentState.CRAWLING);
    addLog('CRAWLER', 'Launching headless browser instance...', 'info');
    await new Promise(r => setTimeout(r, MOCK_LOG_DELAY));
    addLog('CRAWLER', `Navigating to ${targetUrl}`, 'info');
    await new Promise(r => setTimeout(r, 1200));
    addLog('CRAWLER', 'DOM content loaded successfully. Status: 200 OK', 'success');
    addLog('CRAWLER', 'Extracting interactive elements (Buttons, Inputs, Navigation)...', 'info');
    await new Promise(r => setTimeout(r, MOCK_LOG_DELAY));
    
    setState(AgentState.ANALYZING);
    addLog('VISION', 'Capturing viewport screenshots...', 'info');
    
    // Simulate screenshot capture if enabled
    const capturedScreenshots: Screenshot[] = [];
    if (config.includeScreenshots) {
       // Generate 2-3 mock screenshots
       capturedScreenshots.push({
         id: 'screenshot_home',
         description: 'Homepage Hero Section',
         data: createMockScreenshot('Homepage / Hero Section', '#3b82f6')
       });
       capturedScreenshots.push({
         id: 'screenshot_feature',
         description: 'Main Feature Dashboard',
         data: createMockScreenshot('Feature Dashboard', '#10b981')
       });
       setScreenshots(capturedScreenshots);
       addLog('VISION', `Captured ${capturedScreenshots.length} high-res snapshots.`, 'success');
       await new Promise(r => setTimeout(r, MOCK_LOG_DELAY));
    }

    addLog('VISION', 'Analyzing UI layout and hierarchy...', 'info');
    addLog('VISION', 'Detected Navigation Bar, Hero Section, Login Form.', 'success');
    
    setState(AgentState.WRITING);
    addLog('WRITER', 'Compiling gathered data into structured guide...', 'info');
    return capturedScreenshots;
  };

  const startGeneration = async () => {
    if (!url) return;
    
    setError(null);
    setLogs([]);
    setGeneratedContent('');
    setScreenshots([]);
    
    try {
      const capturedScreenshots = await handleSimulatedCrawl(url);
      
      const content = await generateUserGuide(url, config, capturedScreenshots, (chunk) => {
        setGeneratedContent(prev => prev + chunk);
      });

      addLog('WRITER', 'Guide generation complete.', 'success');
      addLog('SYSTEM', 'Workflow finished successfully.', 'success');
      setState(AgentState.COMPLETED);

    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
      addLog('SYSTEM', `Critical Error: ${err.message}`, 'error');
      setState(AgentState.ERROR);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    downloadPDF({
      title: 'User Guide',
      content: generatedContent,
      url: url,
      timestamp: new Date().toISOString(),
      screenshots: screenshots
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar / Configuration Panel */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
              <Layers size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-gray-900">WebGuide AI</h1>
          </div>
          <p className="text-xs text-gray-500 pl-1">Autonomous Documentation Agent</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* URL Input */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Search size={14} /> Target URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Settings size={14} /> Agent Config
              </label>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Analysis Depth</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig(p => ({...p, depth: 'shallow'}))}
                    className={`px-3 py-2 text-xs font-medium rounded-md border transition-all ${config.depth === 'shallow' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Quick Scan
                  </button>
                  <button
                    onClick={() => setConfig(p => ({...p, depth: 'deep'}))}
                    className={`px-3 py-2 text-xs font-medium rounded-md border transition-all ${config.depth === 'deep' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Deep Crawl
                  </button>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Writing Tone</span>
                <select
                  value={config.tone}
                  onChange={(e) => setConfig(p => ({...p, tone: e.target.value as any}))}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="technical">Technical / Developer</option>
                  <option value="user-friendly">User-Friendly / Casual</option>
                  <option value="enterprise">Enterprise / Formal</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                 <input 
                   type="checkbox" 
                   id="includeScreenshots"
                   checked={config.includeScreenshots}
                   onChange={(e) => setConfig(p => ({...p, includeScreenshots: e.target.checked}))}
                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                 />
                 <label htmlFor="includeScreenshots" className="text-sm text-gray-700">Include Screenshots</label>
              </div>
            </div>
          </div>

          {/* Agent Status Indicator */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Activity size={14} /> Agent Status
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Headless Browser</span>
                <div className={`h-2 w-2 rounded-full ${[AgentState.CRAWLING, AgentState.ANALYZING].includes(state) ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Visual Analyzer</span>
                <div className={`h-2 w-2 rounded-full ${state === AgentState.ANALYZING ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Content Engine</span>
                <div className={`h-2 w-2 rounded-full ${state === AgentState.WRITING ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={startGeneration}
            disabled={!url || state === AgentState.CRAWLING || state === AgentState.WRITING || state === AgentState.ANALYZING}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-xl shadow-gray-900/10 active:scale-95"
          >
            {state === AgentState.IDLE || state === AgentState.COMPLETED || state === AgentState.ERROR ? (
               <>
                 <Play size={16} fill="currentColor" /> Initialize Agent
               </>
            ) : (
               <>
                 <Cpu size={16} className="animate-spin" /> Processing...
               </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile only) */}
        <div className="md:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center">
          <span className="font-bold">WebGuide AI</span>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-6">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Top Half: Terminal / Logs */}
          <div className="h-1/3 min-h-[200px]">
            <Terminal logs={logs} />
          </div>

          {/* Bottom Half: Preview */}
          <div className="flex-1 min-h-0">
            <Preview 
              content={generatedContent} 
              url={url} 
              isGenerating={state === AgentState.WRITING} 
              onDownload={handleDownload}
              screenshots={screenshots}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
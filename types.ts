export enum AgentState {
  IDLE = 'IDLE',
  CRAWLING = 'CRAWLING',
  ANALYZING = 'ANALYZING',
  WRITING = 'WRITING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Screenshot {
  id: string;
  description: string;
  data: string; // Base64 data URI
}

export interface GeneratedGuide {
  title: string;
  content: string; // Markdown content
  url: string;
  timestamp: string;
  screenshots: Screenshot[];
}

export interface AgentConfig {
  depth: 'shallow' | 'deep';
  tone: 'technical' | 'user-friendly' | 'enterprise';
  includeScreenshots: boolean; // Simulation
}
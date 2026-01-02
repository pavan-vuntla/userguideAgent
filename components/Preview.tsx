import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { Screenshot } from '../types';

interface PreviewProps {
  content: string;
  url: string;
  isGenerating: boolean;
  onDownload: () => void;
  screenshots: Screenshot[];
}

export const Preview: React.FC<PreviewProps> = ({ content, url, isGenerating, onDownload, screenshots }) => {
  if (!content && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <BookOpen size={32} className="text-gray-300" />
        </div>
        <p>Generated guide will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={16} />
            Output Preview
          </h2>
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
            {url} <ExternalLink size={10} />
          </a>}
        </div>
        <button
          onClick={onDownload}
          disabled={isGenerating || !content}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export PDF
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none prose-headings:font-sans prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-600 prose-a:text-blue-600">
        <ReactMarkdown
           components={{
            code({node, className, children, ...props}) {
              return <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm`} {...props}>{children}</code>
            },
            blockquote({children}) {
               return <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-blue-50 italic text-gray-700">{children}</blockquote>
            },
            img({node, ...props}) {
              const screenshot = screenshots.find(s => s.id === props.src);
              const src = screenshot ? screenshot.data : props.src;
              return (
                <span className="block my-4">
                   <img 
                    {...props} 
                    src={src} 
                    className="rounded-lg border border-gray-200 shadow-md max-h-[300px] w-auto mx-auto object-contain bg-gray-50" 
                    alt={props.alt || 'Screenshot'}
                   />
                   {props.alt && <span className="block text-center text-xs text-gray-500 mt-2 italic">{props.alt}</span>}
                </span>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
        {isGenerating && (
          <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm animate-pulse">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Agent is writing...
          </div>
        )}
      </div>
    </div>
  );
};
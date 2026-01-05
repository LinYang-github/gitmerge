import React, { useMemo } from 'react';
import { GitNode } from '../types';
import { FileText, Folder, CheckSquare, Square } from 'lucide-react';

interface FileTreeProps {
  files: GitNode[];
  onToggle: (path: string) => void;
  onToggleAll: (select: boolean) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, onToggle, onToggleAll }) => {
  const totalFiles = files.length;
  const selectedCount = files.filter(f => f.selected).length;

  // Simple virtualized-like list or just a limited render for performance if huge
  // For this implementation, we assume a reasonable number of text files (~1000 max for a browser app)
  
  const renderItem = (file: GitNode) => (
    <div 
        key={file.path} 
        className={`flex items-center py-1.5 px-3 hover:bg-slate-800 rounded cursor-pointer group transition-colors ${file.selected ? 'text-blue-100' : 'text-slate-500'}`}
        onClick={() => onToggle(file.path)}
    >
      <div className={`mr-3 ${file.selected ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
        {file.selected ? <CheckSquare size={16} /> : <Square size={16} />}
      </div>
      <FileText size={14} className="mr-2 opacity-70" />
      <span className="text-sm font-mono truncate">{file.path}</span>
      <span className="ml-auto text-xs text-slate-600 font-mono">
        {file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}
      </span>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl flex flex-col h-[500px] shadow-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center space-x-2">
            <Folder size={18} className="text-blue-400" />
            <h3 className="font-semibold text-slate-200">Repository Files</h3>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                {selectedCount} / {totalFiles}
            </span>
        </div>
        <div className="space-x-2 text-sm">
          <button 
            onClick={() => onToggleAll(true)}
            className="px-3 py-1 hover:bg-slate-700 rounded text-slate-300 transition-colors"
          >
            Select All
          </button>
          <button 
            onClick={() => onToggleAll(false)}
            className="px-3 py-1 hover:bg-slate-700 rounded text-slate-300 transition-colors"
          >
            None
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
        {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>No text files found or tree empty.</p>
            </div>
        ) : (
            files.map(renderItem)
        )}
      </div>
    </div>
  );
};

export default FileTree;

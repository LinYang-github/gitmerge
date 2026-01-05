import React, { useState } from 'react';
import { Search, Github, Settings as SettingsIcon, GitBranch } from 'lucide-react';
import { RepoInfo } from '../types';
import { parseRepoUrl } from '../services/githubService';

interface RepoFormProps {
  onLoad: (info: RepoInfo) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
}

const RepoForm: React.FC<RepoFormProps> = ({ onLoad, isLoading, onOpenSettings }) => {
  const [url, setUrl] = useState('');
  const [manualBranch, setManualBranch] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const info = parseRepoUrl(url);
    if (!info) {
      setError('Invalid GitHub URL. Format: https://github.com/owner/repo');
      return;
    }
    
    // Override branch if manually entered
    if (manualBranch.trim()) {
        info.branch = manualBranch.trim();
    }

    onLoad(info);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        {/* URL Input */}
        <div className="relative group flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Github size={20} />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/facebook/react"
            className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-blue-500 focus:ring-0 text-white placeholder-slate-500 transition-all text-lg shadow-lg"
            disabled={isLoading}
          />
        </div>

        {/* Branch Input */}
        <div className="relative group md:w-48">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <GitBranch size={18} />
            </div>
            <input
                type="text"
                value={manualBranch}
                onChange={(e) => setManualBranch(e.target.value)}
                placeholder="Branch (default)"
                className="w-full pl-10 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-blue-500 focus:ring-0 text-white placeholder-slate-500 transition-all text-lg shadow-lg"
                disabled={isLoading}
            />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onOpenSettings}
                className="p-4 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-700 border-2 border-slate-700 hover:border-slate-600 h-full"
                title="Settings (Token)"
            >
                <SettingsIcon size={20} />
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-medium transition-all h-full ${
                isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border-2 border-slate-700'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-blue-500/20 border-2 border-blue-600 hover:border-blue-500'
                }`}
            >
                {isLoading ? (
                <span>Loading...</span>
                ) : (
                <>
                    <span>Load</span>
                    <Search size={18} />
                </>
                )}
            </button>
        </div>
      </form>
      {error && (
        <p className="mt-2 text-red-400 text-sm pl-4 animate-fadeIn">{error}</p>
      )}
    </div>
  );
};

export default RepoForm;
import React, { useState, useCallback } from 'react';
import { Download, FileCode, CheckCircle, AlertCircle, X } from 'lucide-react';
import RepoForm from './components/RepoForm';
import FileTree from './components/FileTree';
import { RepoInfo, GitNode, AppStatus, Settings as AppSettings } from './types';
import { fetchRepoDetails, fetchGitTree, fetchFileContent } from './services/githubService';
import { DEFAULT_IGNORE_EXTENSIONS } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [files, setFiles] = useState<GitNode[]>([]);
  const [mergedContent, setMergedContent] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    githubToken: '',
    ignoreExtensions: DEFAULT_IGNORE_EXTENSIONS
  });

  const handleRepoLoad = async (info: RepoInfo) => {
    setStatus(AppStatus.FETCHING_TREE);
    setError(null);
    setRepoInfo(info);
    setMergedContent(''); // Reset previous content
    
    try {
      // 1. Get branch if not provided
      let branch = info.branch;
      if (!branch) {
        const details = await fetchRepoDetails(info.owner, info.repo, settings.githubToken);
        branch = details.default_branch;
        setRepoInfo({ ...info, branch });
      }

      // 2. Get Tree (latest commit SHA of branch usually works for tree fetch, or branch name directly)
      const tree = await fetchGitTree(info.owner, info.repo, branch, settings.githubToken);

      // 3. Filter files
      const textFiles = tree.filter(node => {
        if (node.type !== 'blob') return false;
        const ext = node.path.slice(node.path.lastIndexOf('.')).toLowerCase();
        // Check exact ignored extensions
        if (settings.ignoreExtensions.includes(ext)) return false;
        // Check for specific ignored files/folders (naive)
        if (node.path.includes('.git/') || node.path.includes('node_modules/') || node.path.includes('package-lock.json') || node.path.includes('yarn.lock')) return false;
        return true;
      }).map(node => ({ ...node, selected: true }));

      setFiles(textFiles);
      setStatus(AppStatus.READY_TO_MERGE);
    } catch (err: any) {
      setError(err.message || 'Failed to load repository');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleToggleFile = (path: string) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, selected: !f.selected } : f));
  };

  const handleToggleAll = (select: boolean) => {
    setFiles(prev => prev.map(f => ({ ...f, selected: select })));
  };

  const handleMerge = async () => {
    const selectedFiles = files.filter(f => f.selected);
    if (selectedFiles.length === 0) return;

    setStatus(AppStatus.FETCHING_CONTENT);
    setProgress({ current: 0, total: selectedFiles.length });
    setError(null);

    const CONCURRENCY_LIMIT = 5;
    let completed = 0;
    const results: { path: string, content: string }[] = [];

    try {
      // Simple queue management
      for (let i = 0; i < selectedFiles.length; i += CONCURRENCY_LIMIT) {
        const chunk = selectedFiles.slice(i, i + CONCURRENCY_LIMIT);
        const chunkPromises = chunk.map(async (file) => {
            try {
                const content = await fetchFileContent(file.url, settings.githubToken);
                return { path: file.path, content };
            } catch (e) {
                return { path: file.path, content: `[Error fetching content: ${(e as Error).message}]` };
            }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
        completed += chunk.length;
        setProgress({ current: Math.min(completed, selectedFiles.length), total: selectedFiles.length });
      }

      // Build the final string
      const fullText = results.map(r => {
        return `File: ${r.path}\n${'-'.repeat(50)}\n${r.content}\n${'-'.repeat(50)}\n`;
      }).join('\n');

      setMergedContent(fullText);
      setStatus(AppStatus.COMPLETED);

    } catch (err: any) {
      setError('Error during merging process.');
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([mergedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${repoInfo?.repo}-${repoInfo?.branch}-merged.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <FileCode className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">GitMerge</h1>
                    <p className="text-xs text-slate-400">Repo to Text Converter</p>
                </div>
            </div>
            {repoInfo && (
                <div className="hidden md:block text-sm font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                    {repoInfo.owner}/{repoInfo.repo} <span className="text-blue-500">@{repoInfo.branch}</span>
                </div>
            )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Step 1: Input */}
        <section>
             <RepoForm 
                onLoad={handleRepoLoad} 
                isLoading={status === AppStatus.FETCHING_TREE} 
                onOpenSettings={() => setShowSettings(true)}
             />
        </section>

        {/* Error Display */}
        {error && (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-800/50 rounded-xl flex items-center text-red-300">
                <AlertCircle className="mr-3" />
                {error}
            </div>
        )}

        {/* Content Area */}
        {(files.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: File Selection */}
                <div className="lg:col-span-4 space-y-4">
                    <FileTree 
                        files={files} 
                        onToggle={handleToggleFile} 
                        onToggleAll={handleToggleAll} 
                    />
                    
                    <button
                        onClick={handleMerge}
                        disabled={status === AppStatus.FETCHING_CONTENT}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center space-x-2 ${
                            status === AppStatus.FETCHING_CONTENT 
                            ? 'bg-slate-800 text-slate-500 cursor-wait'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-[1.02]'
                        }`}
                    >
                        {status === AppStatus.FETCHING_CONTENT ? (
                             <span>Processing {progress.current}/{progress.total}...</span>
                        ) : (
                             <>
                                <span>Generate Merged File</span>
                                <FileCode size={20} />
                             </>
                        )}
                    </button>
                </div>

                {/* Right Column: Result or Placeholder */}
                <div className="lg:col-span-8 space-y-6">
                    {status === AppStatus.COMPLETED ? (
                        <div className="space-y-6 animate-fadeIn">
                             {/* Stats & Actions */}
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center">
                                        <CheckCircle className="text-green-500 mr-2" size={20} />
                                        Merge Complete
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Total size: {(mergedContent.length / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={downloadTxt}
                                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all font-medium"
                                    >
                                        <Download size={20} />
                                        <span>Download .txt</span>
                                    </button>
                                </div>
                             </div>

                             {/* Tabbed View: Preview or Chat */}
                             <div className="space-y-4">
                                 {/* Simple Preview */}
                                 <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
                                    <div className="p-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Preview Content</span>
                                        <span className="text-xs text-slate-500">First 5000 characters shown</span>
                                    </div>
                                    <pre className="p-4 text-xs text-slate-300 overflow-auto whitespace-pre-wrap flex-1 bg-slate-950/30">
                                        {mergedContent.slice(0, 5000)}
                                        {mergedContent.length > 5000 && '\n\n... (Content truncated in preview, download file to see all) ...'}
                                    </pre>
                                 </div>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/30">
                            {status === AppStatus.FETCHING_CONTENT ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-lg text-blue-400 font-medium">Fetching file contents...</p>
                                    <p className="text-sm">Requests are rate-limited, please wait.</p>
                                </div>
                            ) : (
                                <>
                                    <FileCode size={48} className="mb-4 opacity-50" />
                                    <p>Select files and click generate to see the result.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            GitHub Personal Access Token (Optional)
                        </label>
                        <input 
                            type="password" 
                            placeholder="ghp_..." 
                            value={settings.githubToken}
                            onChange={(e) => setSettings(prev => ({ ...prev, githubToken: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Add a token if you hit rate limits (60 req/hr) or need to access private repos.
                            The token is not stored permanently.
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-slate-800/50 flex justify-end">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
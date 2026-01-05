import { GitNode, RepoInfo } from '../types';

const BASE_URL = 'https://api.github.com';

export const parseRepoUrl = (url: string): RepoInfo | null => {
  try {
    const cleanUrl = url.replace(/\/$/, '');
    const urlObj = new URL(cleanUrl);
    
    // Support formats: github.com/owner/repo or github.com/owner/repo/tree/branch
    if (urlObj.hostname !== 'github.com') return null;
    
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    let repo = parts[1];
    
    // Remove .git suffix if present
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    let branch = '';

    if (parts.length >= 4 && parts[2] === 'tree') {
      branch = parts.slice(3).join('/');
    }

    return { owner, repo, branch };
  } catch (e) {
    return null;
  }
};

export const fetchRepoDetails = async (owner: string, repo: string, token?: string) => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) headers['Authorization'] = `token ${token}`;

  const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}`, { headers });
  if (!response.ok) {
     let errorMessage = 'Repository not found or private';
     try {
        const errorBody = await response.json();
        if (errorBody.message) errorMessage = errorBody.message;
     } catch (e) {
        // Ignore json parse error
     }
     throw new Error(errorMessage);
  }
  return response.json();
};

export const fetchGitTree = async (owner: string, repo: string, sha: string, token?: string): Promise<GitNode[]> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) headers['Authorization'] = `token ${token}`;

  const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, { headers });
  if (!response.ok) throw new Error('Failed to fetch file tree');
  
  const data = await response.json();
  if (data.truncated) {
    console.warn('Git tree truncated due to size limit.');
  }
  return data.tree;
};

export const fetchFileContent = async (url: string, token?: string): Promise<string> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) headers['Authorization'] = `token ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch blob');
  
  const data = await response.json();
  
  // GitHub API returns content in base64
  if (data.encoding === 'base64') {
    try {
        // Decode base64 to utf-8 string handling special chars
        const binaryString = atob(data.content.replace(/\s/g, ''));
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        return `[Error decoding file: ${url}]`;
    }
  }
  
  return `[Binary or non-text content]`;
};
export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
}

export interface GitNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
  selected?: boolean;
}

export interface ProcessedFile {
  path: string;
  content: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE,
  FETCHING_TREE,
  READY_TO_MERGE,
  FETCHING_CONTENT,
  COMPLETED,
  ERROR
}

export interface Settings {
  githubToken: string;
  ignoreExtensions: string[];
}

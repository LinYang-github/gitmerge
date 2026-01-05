export const GEMINI_MODEL = 'gemini-3-flash-preview';

export const DEFAULT_IGNORE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.mp4', '.mov', '.mp3', '.wav',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.lock', '-lock.json', '.pyc', '.class'
];

export const INITIAL_SYSTEM_INSTRUCTION = `You are an expert software engineer and code analysis assistant. 
The user has provided a concatenated text file containing the source code of a GitHub repository. 
Each file is clearly marked with its path.
Your goal is to answer questions about the codebase, explain architecture, find bugs, or suggest improvements based strictly on the provided context.`;

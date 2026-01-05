/**
 * Estimates the number of tokens in a text string.
 * A common heuristic for English text and code is ~4 characters per token.
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Generates an ASCII tree structure from a list of file paths.
 */
export const generateAsciiTree = (paths: string[]): string => {
  const root: any = {};

  // Build the tree object
  paths.forEach(path => {
    const parts = path.split('/');
    let current = root;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {}; // null indicates a file
      }
      current = current[part];
    });
  });

  // Convert tree object to string
  let output = 'Project Structure:\n';
  
  const renderNode = (node: any, prefix: string, isLast: boolean) => {
    const entries = Object.keys(node).sort((a, b) => {
      // Sort folders first, then files
      const aIsFolder = node[a] !== null;
      const bIsFolder = node[b] !== null;
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.localeCompare(b);
    });

    entries.forEach((name, index) => {
      const isEntryLast = index === entries.length - 1;
      const marker = isEntryLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isEntryLast ? '    ' : '│   ');
      
      output += `${prefix}${marker}${name}\n`;
      
      if (node[name] !== null) {
        renderNode(node[name], newPrefix, isEntryLast);
      }
    });
  };

  renderNode(root, '', true);
  return output + '\n' + '='.repeat(50) + '\n\n';
};

/**
 * Strips comments from code based on file extension.
 * Supports C-style (//, /* *\/) and Script-style (#).
 */
export const stripComments = (content: string, path: string): string => {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  
  // C-style comments: JS, TS, Java, C#, C++, Go, Rust, Dart, Kotlin, Scala, Swift, PHP
  const cStyleExts = ['.js', '.jsx', '.ts', '.tsx', '.java', '.cs', '.cpp', '.c', '.h', '.go', '.rs', '.dart', '.kt', '.scala', '.swift', '.php', '.css', '.scss', '.less'];
  
  // Hash-style comments: Python, Ruby, Perl, Shell, YAML, TOML
  const hashStyleExts = ['.py', '.rb', '.pl', '.sh', '.yaml', '.yml', '.toml', '.dockerfile'];

  if (cStyleExts.includes(ext)) {
    // Regex to remove block comments /* ... */ and line comments // ...
    // Note: This is a basic regex and might incorrectly match comments inside strings.
    return content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1').trim();
  } 
  
  if (hashStyleExts.includes(ext)) {
    // Remove # comments
    return content.replace(/#.*$/gm, '').trim();
  }

  // HTML/XML comments
  if (['.html', '.xml', '.svg'].includes(ext)) {
    return content.replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  return content;
};
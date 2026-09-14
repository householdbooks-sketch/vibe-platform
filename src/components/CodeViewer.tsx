'use client';

import { useState } from 'react';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

interface CodeViewerProps {
  files: FileNode[];
  activeFile?: string;
  onFileSelect: (filePath: string) => void;
}

export function CodeViewer({ files, activeFile, onFileSelect }: CodeViewerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileNode[], basePath = '') => {
    return nodes.map((node) => {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
      const isExpanded = expandedFolders.has(fullPath);

      if (node.type === 'folder') {
        return (
          <div key={fullPath}>
            <div
              className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800/50 cursor-pointer transition-colors"
              onClick={() => toggleFolder(fullPath)}
            >
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
              </svg>
              <span className="text-sm text-slate-300">{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div className="ml-4">
                {renderFileTree(node.children, fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        const isActive = activeFile === fullPath;
        const getFileIcon = (filename: string) => {
          if (filename.endsWith('.html')) return '🌐';
          if (filename.endsWith('.css')) return '🎨';
          if (filename.endsWith('.js') || filename.endsWith('.jsx')) return '⚡';
          if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return '💙';
          if (filename.endsWith('.json')) return '📋';
          return '📄';
        };

        return (
          <div
            key={fullPath}
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors ${
              isActive 
                ? 'bg-blue-600/20 text-blue-200 border-r-2 border-blue-500' 
                : 'hover:bg-slate-800/50 text-slate-300'
            }`}
            onClick={() => onFileSelect(fullPath)}
          >
            <div className="w-4 flex justify-center">
              <span className="text-xs">{getFileIcon(node.name)}</span>
            </div>
            <span className="text-sm">{node.name}</span>
          </div>
        );
      }
    });
  };

  const getActiveFileContent = () => {
    const findFile = (nodes: FileNode[], targetPath: string, currentPath = ''): FileNode | null => {
      for (const node of nodes) {
        const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
        if (fullPath === targetPath && node.type === 'file') {
          return node;
        }
        if (node.children) {
          const found = findFile(node.children, targetPath, fullPath);
          if (found) return found;
        }
      }
      return null;
    };

    return activeFile ? findFile(files, activeFile) : null;
  };

  const activeFileNode = getActiveFileContent();

  return (
    <div className="flex h-full bg-[#0B0F19]">
      {/* File Tree */}
      <div className="w-80 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Files</h3>
          <p className="text-sm text-slate-400 mt-1">Generated project structure</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No files generated yet</p>
              <p className="text-slate-500 text-xs mt-1">Start a conversation to generate code</p>
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
      </div>

      {/* Code Editor View */}
      <div className="flex-1 flex flex-col">
        {activeFileNode ? (
          <>
            {/* File Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/30">
              <div className="flex items-center gap-3">
                <span className="text-lg">{activeFileNode.name.endsWith('.html') ? '🌐' : activeFileNode.name.endsWith('.css') ? '🎨' : activeFileNode.name.endsWith('.js') ? '⚡' : '📄'}</span>
                <span className="text-slate-200 font-medium">{activeFileNode.name}</span>
                {activeFileNode.language && (
                  <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                    {activeFileNode.language}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => navigator.clipboard.writeText(activeFileNode.content || '')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-sm text-slate-200 font-mono leading-relaxed">
                <code className="block whitespace-pre-wrap">
                  {activeFileNode.content}
                </code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-slate-300 font-medium mb-2">No file selected</h3>
              <p className="text-slate-400 text-sm">
                {files.length === 0 
                  ? 'Generate some code to see files here' 
                  : 'Select a file from the tree to view its contents'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
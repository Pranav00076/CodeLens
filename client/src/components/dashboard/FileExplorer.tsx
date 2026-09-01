import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, Search, FileJson, FileText, Settings, Code, File } from 'lucide-react';
import { FileTreeNode } from '../../types/index';

interface FileExplorerProps {
  tree: FileTreeNode;
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) return <FileCode className="w-3.5 h-3.5 text-zinc-400" />;
  if (['json', 'yaml', 'yml', 'toml'].includes(ext)) return <FileJson className="w-3.5 h-3.5 text-zinc-400" />;
  if (['md', 'txt', 'rst'].includes(ext)) return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
  if (['py', 'go', 'rs', 'java', 'cpp', 'c', 'cs', 'rb', 'php'].includes(ext)) return <Code className="w-3.5 h-3.5 text-zinc-400" />;
  if (['env', 'dockerfile', 'dockerignore', 'config'].includes(fileName.toLowerCase())) return <Settings className="w-3.5 h-3.5 text-zinc-500" />;
  return <File className="w-3.5 h-3.5 text-zinc-500" />;
};

const FileTreeItem: React.FC<{
  node: FileTreeNode;
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
  searchFilter: string;
  depth?: number;
}> = ({ node, selectedFile, onSelectFile, searchFilter, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 2 || Boolean(searchFilter));

  const isDirectory = node.type === 'dir';
  const isSelected = selectedFile === node.path;

  // Filter logic
  const matchesSearch = (item: FileTreeNode): boolean => {
    if (!searchFilter) return true;
    if (item.name.toLowerCase().includes(searchFilter.toLowerCase())) return true;
    if (item.children) return item.children.some(matchesSearch);
    return false;
  };

  if (!matchesSearch(node)) return null;

  return (
    <div className="select-none">
      <div
        onClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen);
          } else {
            onSelectFile(node.path);
          }
        }}
        className={`flex items-center justify-between py-1 px-1.5 rounded-md text-xs cursor-pointer transition-colors ${
          isSelected
            ? 'bg-white/[0.08] text-white font-medium'
            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
        }`}
        style={{ paddingLeft: `${Math.max(6, depth * 12)}px` }}
      >
        <div className="flex items-center gap-1.5 truncate">
          {isDirectory ? (
            <>
              {isOpen ? (
                <ChevronDown className="w-3 h-3 text-zinc-600 shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
              )}
              {isOpen ? (
                <FolderOpen className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" />
              {getFileIcon(node.name)}
            </>
          )}
          <span className="truncate font-mono text-[11px]">{node.name}</span>
        </div>

        {!isDirectory && node.lines && (
          <span className="text-[10px] text-zinc-600 font-mono shrink-0 ml-1">
            {node.lines}L
          </span>
        )}
      </div>

      {isDirectory && isOpen && node.children && (
        <div className="space-y-0.5">
          {node.children.map((child, idx) => (
            <FileTreeItem
              key={idx}
              node={child}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              searchFilter={searchFilter}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  tree,
  selectedFile,
  onSelectFile,
}) => {
  const [filter, setFilter] = useState('');

  return (
    <div className="flex flex-col h-full">
      {/* File Search Input */}
      <div className="p-2 border-b border-white/[0.05]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full pl-8 pr-2.5 py-1 bg-[#090A0D] border border-white/[0.06] rounded-md text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 font-sans"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-[calc(100vh-250px)]">
        {tree.children && tree.children.length > 0 ? (
          tree.children.map((child, idx) => (
            <FileTreeItem
              key={idx}
              node={child}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              searchFilter={filter}
            />
          ))
        ) : (
          <div className="p-4 text-center text-xs text-zinc-600">No files</div>
        )}
      </div>
    </div>
  );
};

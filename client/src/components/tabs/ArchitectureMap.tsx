import React, { useState } from 'react';
import { Network, ArrowRight, Layers, Database, Globe, Cpu, Server, Zap, FileCode } from 'lucide-react';
import { ArchitectureInfo, ArchitectureDiagramNode } from '../../types/index';
import { Badge } from '../common/Badge';

interface ArchitectureMapProps {
  architecture: ArchitectureInfo;
  onSelectFile: (path: string) => void;
}

export const ArchitectureMap: React.FC<ArchitectureMapProps> = ({
  architecture,
  onSelectFile,
}) => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureDiagramNode | null>(
    architecture.diagramNodes[0] || null
  );

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'frontend': return <Globe className="w-4 h-4 text-zinc-300" />;
      case 'api': return <Server className="w-4 h-4 text-zinc-300" />;
      case 'service': return <Cpu className="w-4 h-4 text-zinc-300" />;
      case 'database': return <Database className="w-4 h-4 text-zinc-300" />;
      case 'external': return <Zap className="w-4 h-4 text-zinc-300" />;
      default: return <Layers className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getNodeBorder = (isSelected: boolean) => {
    if (isSelected) return 'border-white/30 bg-[#161922] shadow-sm ring-1 ring-white/10';
    return 'border-white/[0.07] bg-[#0E1015] hover:border-white/[0.15]';
  };

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0E1015] border border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Component Topology & Data Flow</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
            {architecture.dataFlow}
          </p>
        </div>
        <Badge variant="slate" size="md">{architecture.pattern}</Badge>
      </div>

      {/* Interactive Node Graph Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual Node Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Component Nodes (Click to inspect)</span>
            <span className="text-[10px] text-zinc-600 font-mono">{architecture.diagramNodes.length} nodes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {architecture.diagramNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${getNodeBorder(
                    isSelected
                  )}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-1.5 rounded-md bg-zinc-900 border border-white/[0.06]">
                      {getNodeIcon(node.type)}
                    </div>
                    {node.tech && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-white/[0.05]">
                        {node.tech}
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-xs text-white mb-0.5">{node.label}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{node.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">{node.files.length} linked file(s)</span>
                    <span className="text-zinc-300 font-medium hover:text-white flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Relationship Flow List */}
          {architecture.diagramEdges.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0B0C10] border border-white/[0.06] space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
                Connections & Request Pipeline
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                {architecture.diagramEdges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-md bg-zinc-900/60 border border-white/[0.04] text-zinc-300"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-zinc-200 font-semibold">{edge.from}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                      <span className="text-zinc-200 font-semibold">{edge.to}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-sans ml-2 shrink-0">{edge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Node Inspector Detail Panel */}
        <div className="rounded-xl bg-[#0E1015] border border-white/[0.07] p-4 space-y-3.5 h-fit sticky top-20">
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Node Inspector
          </div>

          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06]">
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{selectedNode.label}</h4>
                  <span className="text-[11px] text-zinc-400 font-mono">{selectedNode.tech || selectedNode.type}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">Purpose & Role</label>
                <p className="text-xs text-zinc-300 leading-relaxed p-2.5 rounded-lg bg-zinc-900/80 border border-white/[0.05]">
                  {selectedNode.description}
                </p>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1.5">Associated Files</label>
                <div className="space-y-1">
                  {selectedNode.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFile(file)}
                      className="w-full flex items-center justify-between p-2 rounded-md bg-zinc-900/90 hover:bg-zinc-850 border border-white/[0.05] text-xs text-left transition-colors group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono text-zinc-300 text-[11px] truncate">{file}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        Open
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-500">
              Select a component node from the graph to inspect its properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

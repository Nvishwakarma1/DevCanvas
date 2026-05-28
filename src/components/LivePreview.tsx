import { Eye } from 'lucide-react';

interface LivePreviewProps {
  fullHtml: string;
}

export default function LivePreview({ fullHtml }: LivePreviewProps) {
  return (
    <div className="flex-1 flex flex-col bg-zinc-950 min-h-0">
      {/* Live Preview Header */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-850 px-4 flex items-center justify-between flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300">Live Preview Sandbox</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">
          Isolated Sandbox
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-zinc-900 p-2 relative min-h-0">
        <iframe
          title="DevCanvas Live Preview"
          srcDoc={fullHtml}
          sandbox="allow-scripts"
          className="w-full h-full bg-stone-950 rounded-lg shadow-inner border border-zinc-800"
        />
      </div>
    </div>
  );
}

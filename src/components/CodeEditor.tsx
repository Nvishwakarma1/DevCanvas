import { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { highlightHtml } from '../utils/codeGenerator';

interface CodeEditorProps {
  code: string;
  onExport: () => void;
}

export default function CodeEditor({ code, onExport }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  // Generate mock line numbers based on code line splits
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const highlighted = highlightHtml(code);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border-b border-zinc-800 min-h-0">
      {/* Editor Control Header */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-850 px-4 flex items-center justify-between flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300">Generated Code</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
            Tailwind CSS v4
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Code Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-650 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Copy snippet to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Export Code Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:border-indigo-450 transition-all cursor-pointer"
            title="Download full standalone index.html template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Code</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="flex-1 flex overflow-y-auto font-mono text-[11px] leading-relaxed py-3">
        {/* Line Numbers Column */}
        <div className="w-10 text-right select-none text-zinc-600 border-r border-zinc-900 pr-2.5 flex flex-col">
          {lineNumbers.map((num) => (
            <div key={num} className="h-5">{num}</div>
          ))}
        </div>

        {/* Code Content Column */}
        <pre className="flex-1 pl-4 pr-6 overflow-x-auto whitespace-pre select-text">
          <code 
            dangerouslySetInnerHTML={{ __html: highlighted }}
            className="block h-full text-zinc-300"
          />
        </pre>
      </div>
    </div>
  );
}

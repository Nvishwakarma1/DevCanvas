import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2, RotateCcw } from 'lucide-react';
import { highlightHtml } from '../utils/codeGenerator';

interface CodeEditorProps {
  code: string;
  canvasCode: string;
  isManualMode: boolean;
  onChangeCode: (code: string) => void;
  onToggleManualMode: (edit: boolean) => void;
  onSyncToCanvas: () => void;
  onDiscardChanges: () => void;
  onExport: () => void;
}

export default function CodeEditor({ 
  code, 
  canvasCode, 
  isManualMode, 
  onChangeCode, 
  onToggleManualMode, 
  onSyncToCanvas, 
  onDiscardChanges, 
  onExport 
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Generate line numbers based on current code string splits
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  const isDirty = code !== canvasCode;

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (isManualMode && textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [code, isManualMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Intercept Tab key to insert double spaces instead of losing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      
      onChangeCode(newVal);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleTabChange = (edit: boolean) => {
    if (!edit && isDirty) {
      if (window.confirm("You have unsynced code changes. Switching to Preview (read-only) will discard your manual edits. Do you want to continue?")) {
        onDiscardChanges();
      }
    } else {
      onToggleManualMode(edit);
    }
  };

  const highlighted = highlightHtml(code);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border-b border-zinc-800 min-h-0">
      {/* Editor Control Header */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-850 px-4 flex items-center justify-between flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300">Code Panel</span>
          
          {/* Preview vs Edit Mode tabs */}
          <div className="flex bg-zinc-950 border border-zinc-800 rounded p-0.5 ml-2.5">
            <button
              onClick={() => handleTabChange(false)}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                !isManualMode
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                isManualMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Edit
            </button>
          </div>

          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 ml-2">
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-500 hover:border-indigo-400 transition-all cursor-pointer shadow-sm"
            title="Download full standalone index.html template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Unsynced Changes Notification Banner */}
      {isManualMode && isDirty && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-400 select-none flex-shrink-0 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Unsynced changes: code edits are not yet synced to the visual canvas.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDiscardChanges}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-350 hover:text-white transition-all cursor-pointer"
              title="Discard manual edits and reset to visual canvas layout"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Discard</span>
            </button>
            <button
              onClick={onSyncToCanvas}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all cursor-pointer shadow-sm"
              title="Parse edited HTML and sync back to visual canvas"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Sync to Canvas</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Main Content */}
      {!isManualMode ? (
        <div className="flex-1 flex overflow-y-auto font-mono text-[11px] leading-5 py-3 bg-zinc-950">
          {/* Line Numbers Column */}
          <div className="w-10 text-right select-none text-zinc-600 border-r border-zinc-900 pr-2.5 flex flex-col">
            {lineNumbers.map((num) => (
              <div key={num} className="h-5">{num}</div>
            ))}
          </div>

          {/* Code Content Column */}
          <pre className="flex-1 pl-4 pr-6 overflow-x-auto whitespace-pre select-text m-0">
            <code 
              dangerouslySetInnerHTML={{ __html: highlighted }}
              className="block h-full text-zinc-300 leading-5"
            />
          </pre>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden font-mono text-[11px] leading-5 bg-zinc-950 relative">
          {/* Synced Line Numbers Column */}
          <div 
            ref={lineNumbersRef}
            className="w-10 text-right select-none text-zinc-650 border-r border-zinc-900 pr-2.5 py-3 flex flex-col overflow-hidden bg-zinc-950 flex-shrink-0"
          >
            {lineNumbers.map((num) => (
              <div key={num} className="h-5 flex-shrink-0">{num}</div>
            ))}
          </div>

          {/* Synced Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="flex-1 pl-4 pr-6 py-3 bg-zinc-950 text-zinc-300 focus:text-white focus:outline-none resize-none overflow-auto whitespace-pre leading-5 h-full border-none focus:ring-0 selection:bg-indigo-650/40"
            placeholder="<!-- Type your custom HTML/Tailwind code here -->"
          />
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Copy, ClipboardPaste, Undo2, Redo2, CopyPlus, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  show: boolean;
  onClose: () => void;
  onAction: (action: 'undo' | 'redo' | 'copy' | 'paste' | 'duplicate' | 'delete') => void;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasClipboard: boolean;
}

export default function ContextMenu({
  x,
  y,
  show,
  onClose,
  onAction,
  hasSelection,
  canUndo,
  canRedo,
  hasClipboard
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (show) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 text-zinc-300 text-xs font-medium select-none"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => { onAction('undo'); onClose(); }}
        disabled={!canUndo}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-violet-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
      >
        <Undo2 className="w-3.5 h-3.5" />
        <span>Undo</span>
        <span className="ml-auto text-[9px] text-zinc-500">Ctrl+Z</span>
      </button>
      <button
        onClick={() => { onAction('redo'); onClose(); }}
        disabled={!canRedo}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-violet-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
      >
        <Redo2 className="w-3.5 h-3.5" />
        <span>Redo</span>
        <span className="ml-auto text-[9px] text-zinc-500">Ctrl+Y</span>
      </button>

      <div className="h-px bg-zinc-800 my-1 mx-2" />

      <button
        onClick={() => { onAction('copy'); onClose(); }}
        disabled={!hasSelection}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-violet-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>Copy</span>
        <span className="ml-auto text-[9px] text-zinc-500">Ctrl+C</span>
      </button>
      <button
        onClick={() => { onAction('paste'); onClose(); }}
        disabled={!hasClipboard}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-violet-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
      >
        <ClipboardPaste className="w-3.5 h-3.5" />
        <span>Paste</span>
        <span className="ml-auto text-[9px] text-zinc-500">Ctrl+V</span>
      </button>

      <div className="h-px bg-zinc-800 my-1 mx-2" />

      <button
        onClick={() => { onAction('duplicate'); onClose(); }}
        disabled={!hasSelection}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-violet-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
      >
        <CopyPlus className="w-3.5 h-3.5" />
        <span>Duplicate</span>
        <span className="ml-auto text-[9px] text-zinc-500">Ctrl+D</span>
      </button>
      <button
        onClick={() => { onAction('delete'); onClose(); }}
        disabled={!hasSelection}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
        <span className="ml-auto text-[9px] text-zinc-500">Del</span>
      </button>
    </div>
  );
}

import { useState } from 'react';
import { Zap, Plus, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import type { CanvasComponent, LogicBinding } from '../types/canvas';

interface LogicPanelProps {
  components: CanvasComponent[];
  selectedComponent: CanvasComponent | null;
  onUpdateLogic: (id: string, bindings: LogicBinding[]) => void;
}

const EVENT_LABELS: Record<LogicBinding['event'], string> = {
  onClick: '🖱 On Click',
  onHover: '✨ On Hover',
  onScroll: '📜 On Scroll',
};

const ACTION_LABELS: Record<LogicBinding['action'], string> = {
  toggleVisibility: '👁 Toggle Visibility',
  triggerParticles: '✦ Burst Particles',
  scrollTo: '↕ Scroll To',
  addClass: '＋ Add CSS Class',
  removeClass: '－ Remove CSS Class',
};

function genId() {
  return `bind-${Math.random().toString(36).substr(2, 7)}`;
}

export default function LogicPanel({ components, selectedComponent, onUpdateLogic }: LogicPanelProps) {
  const [expandedBindId, setExpandedBindId] = useState<string | null>(null);

  const bindings: LogicBinding[] = selectedComponent?.logicBindings || [];

  const addBinding = () => {
    if (!selectedComponent) return;
    const newBind: LogicBinding = {
      id: genId(),
      event: 'onClick',
      action: 'toggleVisibility',
      targetId: undefined,
    };
    onUpdateLogic(selectedComponent.id, [...bindings, newBind]);
    setExpandedBindId(newBind.id);
  };

  const updateBinding = (bindId: string, patch: Partial<LogicBinding>) => {
    if (!selectedComponent) return;
    onUpdateLogic(
      selectedComponent.id,
      bindings.map(b => b.id === bindId ? { ...b, ...patch } : b)
    );
  };

  const removeBinding = (bindId: string) => {
    if (!selectedComponent) return;
    onUpdateLogic(selectedComponent.id, bindings.filter(b => b.id !== bindId));
  };

  // All possible targets (excluding self)
  const targets = components.filter(c => c.id !== selectedComponent?.id);

  return (
    <aside className="w-64 bg-[#0a0a0a] border-l border-zinc-900/50 flex flex-col h-full flex-shrink-0 z-10 select-none text-[11px]">
      {/* Header */}
      <div className="p-3 border-b border-zinc-900 flex items-center gap-2 flex-shrink-0">
        <Zap className="w-4 h-4 text-amber-400" />
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">Logic Nodes</span>
          <span className="text-xs font-bold text-zinc-200">Event → Action Wiring</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto inspector-scroll p-3 space-y-3">
        {!selectedComponent ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Zap className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Select a component on the canvas to wire up logic events and actions.
            </p>
          </div>
        ) : (
          <>
            {/* Component badge */}
            <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-[10px] text-zinc-300 font-semibold truncate">{selectedComponent.type}</span>
              <span className="text-[9px] text-zinc-600 font-mono ml-auto">{selectedComponent.id.slice(0, 6)}</span>
            </div>

            {/* Binding list */}
            {bindings.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg">
                <p className="text-[10px] text-zinc-500">No logic bindings yet.</p>
                <p className="text-[9px] text-zinc-600 mt-1">Click "+ Add Rule" below.</p>
              </div>
            ) : (
              bindings.map((bind, idx) => (
                <div key={bind.id} className="border border-zinc-800 rounded-lg overflow-hidden">
                  {/* Binding header */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 cursor-pointer hover:bg-zinc-800/60 transition-colors"
                    onClick={() => setExpandedBindId(expandedBindId === bind.id ? null : bind.id)}
                  >
                    <span className="text-[9px] text-zinc-500 font-mono">#{idx + 1}</span>
                    <span className="text-[10px] font-semibold text-amber-400 truncate flex-1">
                      {EVENT_LABELS[bind.event]}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                    <span className="text-[10px] text-violet-400 truncate flex-1">
                      {ACTION_LABELS[bind.action].slice(2)}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${expandedBindId === bind.id ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Binding editor */}
                  {expandedBindId === bind.id && (
                    <div className="p-3 space-y-2.5 border-t border-zinc-800 bg-zinc-950/40">
                      {/* Event selector */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 uppercase font-semibold tracking-wider">Trigger Event</label>
                        <select
                          value={bind.event}
                          onChange={e => updateBinding(bind.id, { event: e.target.value as LogicBinding['event'] })}
                          className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500"
                        >
                          {Object.entries(EVENT_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Action selector */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 uppercase font-semibold tracking-wider">Action</label>
                        <select
                          value={bind.action}
                          onChange={e => updateBinding(bind.id, { action: e.target.value as LogicBinding['action'] })}
                          className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500"
                        >
                          {Object.entries(ACTION_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Target component */}
                      {(bind.action === 'toggleVisibility' || bind.action === 'scrollTo' || bind.action === 'addClass' || bind.action === 'removeClass') && (
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase font-semibold tracking-wider">Target Component</label>
                          <select
                            value={bind.targetId || ''}
                            onChange={e => updateBinding(bind.id, { targetId: e.target.value || undefined })}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500"
                          >
                            <option value="">— Self —</option>
                            {targets.map(c => (
                              <option key={c.id} value={c.id}>{c.type} ({c.id.slice(0, 6)})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* CSS class input */}
                      {(bind.action === 'addClass' || bind.action === 'removeClass') && (
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase font-semibold tracking-wider">CSS Class</label>
                          <input
                            type="text"
                            value={bind.cssClass || ''}
                            onChange={e => updateBinding(bind.id, { cssClass: e.target.value })}
                            placeholder="e.g. hidden, opacity-0"
                            className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500 font-mono"
                          />
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => removeBinding(bind.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 transition-colors cursor-pointer w-full justify-center mt-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove Binding
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Add binding button */}
            <button
              onClick={addBinding}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-amber-400/30 hover:border-amber-400/60 text-amber-400 hover:text-amber-300 text-[10px] font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Logic Rule
            </button>
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-zinc-900 text-[9px] text-zinc-600 text-center">
        Logic bindings are exported to the HTML output
      </div>
    </aside>
  );
}

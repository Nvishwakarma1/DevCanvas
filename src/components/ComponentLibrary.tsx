import { type ReactNode, type DragEvent } from 'react';
import { 
  Layout, 
  CreditCard, 
  Square, 
  ListTodo, 
  Grid3X3,
  HelpCircle,
  Plus
} from 'lucide-react';
import type { ComponentType } from '../types/canvas';

interface ComponentLibraryProps {
  onAddComponent: (type: ComponentType) => void;
  filterText?: string;
}

interface LibraryItem {
  type: ComponentType;
  label: string;
  description: string;
  icon: ReactNode;
}

export default function ComponentLibrary({ onAddComponent, filterText = '' }: ComponentLibraryProps) {
  const libraryItems: LibraryItem[] = [
    {
      type: 'Header',
      label: 'Navigation Header',
      description: 'Brand logo, menu links, and a call-to-action button.',
      icon: <Layout className="w-5 h-5 text-indigo-400" />
    },
    {
      type: 'Card',
      label: 'Product Card',
      description: 'Feature card with image, header, description, and button.',
      icon: <CreditCard className="w-5 h-5 text-purple-400" />
    },
    {
      type: 'Button',
      label: 'Action Button',
      description: 'Clickable button with outline/fill and text controls.',
      icon: <Square className="w-5 h-5 text-rose-400" />
    },
    {
      type: 'InputForm',
      label: 'Input Form',
      description: 'Custom subscription or contact form with inputs.',
      icon: <ListTodo className="w-5 h-5 text-emerald-400" />
    },
    {
      type: 'Grid',
      label: 'Layout Grid',
      description: 'Multi-column container to group sub-elements.',
      icon: <Grid3X3 className="w-5 h-5 text-amber-400" />
    }
  ];

  const handleDragStart = (e: DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('application/devcanvas-component', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

      const filteredItems = libraryItems.filter(item =>
        item.label.toLowerCase().includes(filterText.toLowerCase()) ||
        item.description.toLowerCase().includes(filterText.toLowerCase())
      );

      return (
        <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-zinc-855 flex flex-col gap-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Component Library
            </h2>
            <p className="text-[10px] text-zinc-500">
              Click to add to canvas, or drag and drop.
            </p>
          </div>

          {/* Library Grid List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => onAddComponent(item.type)}
            className="group relative flex items-start gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 transition-all cursor-grab active:cursor-grabbing select-none"
          >
            {/* Left Icon */}
            <div className="p-2 rounded bg-zinc-800 border border-zinc-850 group-hover:bg-zinc-750 transition-colors flex-shrink-0">
              {item.icon}
            </div>

            {/* Description Text */}
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                {item.label}
              </h3>
              <p className="text-[10px] text-zinc-500 leading-normal mt-0.5 truncate">
                {item.description}
              </p>
            </div>

            {/* Plus Indicator */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddComponent(item.type);
              }}
              className="absolute right-3 top-3.5 p-1 rounded bg-zinc-850 hover:bg-indigo-600 border border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Add to Canvas"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-500 flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
              <span className="text-xs font-semibold text-zinc-400">No components found</span>
              <span className="text-[10px] text-zinc-600">Try searching for other component types</span>
            </div>
          )}
        </div>

      {/* Sidebar Help Footer */}
      <div className="p-3 bg-zinc-900/30 border-t border-zinc-855 text-[10px] text-zinc-500 flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
        <span>Tip: Nest Cards or Buttons inside a Grid for row layouts.</span>
      </div>
    </aside>
  );
}

import { type ReactNode, type DragEvent } from 'react';
import { 
  Layout, 
  CreditCard, 
  Square, 
  ListTodo, 
  Grid3X3,
  HelpCircle,
  Plus,
  Layers,
  PanelTop,
  PanelBottom,
  Box,
  Scissors
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
      icon: <Layout className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Card',
      label: 'Product Card',
      description: 'Feature card with image, header, description, and button.',
      icon: <CreditCard className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Button',
      label: 'Action Button',
      description: 'Clickable button with outline/fill and text controls.',
      icon: <Square className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'InputForm',
      label: 'Input Form',
      description: 'Custom subscription or contact form with inputs.',
      icon: <ListTodo className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Grid',
      label: 'Layout Grid',
      description: 'Multi-column container to group sub-elements.',
      icon: <Grid3X3 className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Section',
      label: 'Page Section',
      description: 'Full-width container with title and subtitle.',
      icon: <Layers className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Navbar',
      label: 'Navigation Bar',
      description: 'Top navigation with brand and links.',
      icon: <PanelTop className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Footer',
      label: 'Page Footer',
      description: 'Bottom section with copyright and links.',
      icon: <PanelBottom className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Container',
      label: 'Custom Box Container',
      description: 'Generic customizable container block for layout nesting.',
      icon: <Box className="w-4 h-4 text-violet-400" />
    },
    {
      type: 'Breaker',
      label: 'Section Breaker Divider',
      description: 'Horizontal line divider/breaker for layout separations.',
      icon: <Scissors className="w-4 h-4 text-violet-400" />
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
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full flex-shrink-0 z-10 shadow-sm relative">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-850 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
          Component Library
        </h2>
      </div>
      
      {/* Search Input Bar */}
      <div className="px-3 pt-3">
         <div className="w-full bg-zinc-950 rounded border border-zinc-800 px-2.5 py-1.5 flex items-center group">
           <svg className="w-3.5 h-3.5 text-zinc-500 group-focus-within:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
           <input 
             type="text" 
             placeholder="Search components..." 
             value={filterText} 
             onChange={() => {}} 
             className="bg-transparent border-none text-xs text-zinc-300 px-2 w-full focus:outline-none placeholder-zinc-600 cursor-text" 
           />
         </div>
      </div>

      {/* Library list as flat, rounded rectangles */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => onAddComponent(item.type)}
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-md bg-zinc-800/40 hover:bg-zinc-700/60 border border-transparent hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing select-none"
            >
              {/* Left Lucide Icon */}
              <div className="text-zinc-400 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                {item.icon}
              </div>

              {/* Component Label */}
              <div className="flex-1 min-w-0 pr-6 flex flex-col">
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                  {item.label}
                </span>
                <span className="text-[9px] text-zinc-500 group-hover:text-zinc-400 truncate mt-0.5">
                  {item.description}
                </span>
              </div>

              {/* Plus indicator button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddComponent(item.type);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-750 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
                title="Add to Canvas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-zinc-650 border border-dashed border-zinc-800 rounded bg-zinc-950/20 mx-2">
            <span className="text-xs">No components matching filter</span>
          </div>
        )}
      </div>

      {/* Sidebar Help Footer */}
      <div className="p-3 border-t border-zinc-850 text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-zinc-550" />
        <span>Drag items onto canvas</span>
      </div>
    </aside>
  );
}

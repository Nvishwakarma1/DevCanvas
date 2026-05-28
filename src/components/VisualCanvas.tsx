import { type DragEvent, type MouseEvent } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown,
  LayoutTemplate
} from 'lucide-react';
import type { CanvasComponent, BreakpointType, ComponentProps } from '../types/canvas';

interface VisualCanvasProps {
  components: CanvasComponent[];
  selectedId: string | null;
  breakpoint: BreakpointType;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: 'up' | 'down') => void;
  onDropComponent: (type: string, parentId?: string) => void;
  onChangeBreakpoint: (b: BreakpointType) => void;
}

export default function VisualCanvas({
  components,
  selectedId,
  breakpoint,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  onDropComponent,
  onChangeBreakpoint,
}: VisualCanvasProps) {

  // Get frame width classes based on active device breakpoint
  const getBreakpointWidth = () => {
    switch (breakpoint) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const handleCanvasDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: DragEvent, parentId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData('application/devcanvas-component');
    if (type) {
      onDropComponent(type, parentId);
    }
  };

  // Helper to compile component style classes safely
  const getComponentClasses = (p: ComponentProps) => {
    const spacing = [p.paddingX, p.paddingY, p.marginX, p.marginY].filter(Boolean).join(' ');
    const design = [
      p.bgColor,
      p.textColor,
      p.textSize,
      p.fontWeight,
      p.textAlign,
      p.borderRadius,
      p.borderWidth,
      p.borderColor,
      p.shadow,
    ].filter(Boolean).join(' ');
    return `${spacing} ${design}`.trim().replace(/\s+/g, ' ');
  };

  // Render a component's action toolbar
  const renderActions = (id: string) => {
    return (
      <div className="absolute -top-3.5 right-2 z-30 flex items-center bg-indigo-600 rounded shadow-md border border-indigo-500 overflow-hidden text-white text-[10px]">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveComponent(id, 'up'); }}
          className="p-1 hover:bg-indigo-500 transition-colors border-r border-indigo-500 cursor-pointer"
          title="Move Up"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveComponent(id, 'down'); }}
          className="p-1 hover:bg-indigo-500 transition-colors border-r border-indigo-500 cursor-pointer"
          title="Move Down"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicateComponent(id); }}
          className="p-1 hover:bg-indigo-500 transition-colors border-r border-indigo-500 cursor-pointer"
          title="Duplicate Element"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteComponent(id); }}
          className="p-1 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
          title="Delete Element"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // Recursive renderer function
  const renderComponent = (c: CanvasComponent) => {
    const isSelected = selectedId === c.id;
    const p = c.props;
    const classList = getComponentClasses(p);

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      onSelectComponent(c.id);
    };

    const wrapperClasses = `relative group transition-all ${
      isSelected 
        ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950 rounded' 
        : 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-zinc-650 hover:outline-offset-1 rounded'
    }`;

    // Switch case to render component types visually
    switch (c.type) {
      case 'Header': {
        const links = p.links || ['Home', 'Features', 'Pricing', 'Contact'];
        return (
          <div key={c.id} onClick={handleClick} className={wrapperClasses}>
            {isSelected && renderActions(c.id)}
            <header className={`${classList} flex items-center justify-between w-full select-none cursor-pointer`}>
              <div className="font-bold text-xl tracking-tight">{p.logoText || 'DevCanvas'}</div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                {links.map((link, idx) => (
                  <span key={idx} className="hover:text-indigo-400 transition-colors">{link}</span>
                ))}
              </nav>
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
                {p.buttonText || 'Get Started'}
              </button>
            </header>
          </div>
        );
      }

      case 'Card': {
        return (
          <div key={c.id} onClick={handleClick} className={wrapperClasses}>
            {isSelected && renderActions(c.id)}
            <div className={`${classList} max-w-sm flex flex-col h-full select-none cursor-pointer overflow-hidden`}>
              <div className="flex flex-col">
                {p.imageUrl && (
                  <img className="w-full h-40 object-cover rounded-lg mb-3 pointer-events-none" src={p.imageUrl} alt="Card image" />
                )}
                {p.badgeText && (
                  <span className="self-start inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 mb-2">
                    {p.badgeText}
                  </span>
                )}
                <h3 className="text-lg font-bold mb-1.5">{p.title || 'Amazing Card'}</h3>
                <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
                  {p.description || 'Provide detailed descriptions of your feature or product here.'}
                </p>
              </div>
              {p.buttonText && (
                <button className="w-full py-1.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white mt-auto">
                  {p.buttonText}
                </button>
              )}
            </div>
          </div>
        );
      }

      case 'Button': {
        let variantClasses = '';
        if (p.buttonVariant === 'outline') {
          variantClasses = 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300';
        } else if (p.buttonVariant === 'ghost') {
          variantClasses = 'hover:bg-zinc-800 text-zinc-400 hover:text-white';
        } else {
          variantClasses = 'bg-indigo-600 hover:bg-indigo-700 text-white';
        }
        const isCustomBg = p.bgColor && p.bgColor !== 'bg-transparent';
        const bgStyle = isCustomBg ? p.bgColor : variantClasses;

        return (
          <div key={c.id} onClick={handleClick} className={`${wrapperClasses} inline-block`}>
            {isSelected && renderActions(c.id)}
            <button className={`px-5 py-2 text-xs font-semibold rounded cursor-pointer ${classList} ${isCustomBg ? '' : bgStyle}`}>
              {p.buttonText || 'Button Click'}
            </button>
          </div>
        );
      }

      case 'InputForm': {
        return (
          <div key={c.id} onClick={handleClick} className={wrapperClasses}>
            {isSelected && renderActions(c.id)}
            <form className={`${classList} w-full max-w-md flex flex-col gap-3 select-none cursor-pointer`} onSubmit={(e) => e.preventDefault()}>
              <h3 className="text-base font-bold border-b border-zinc-800 pb-1.5 mb-1">{p.formTitle || 'Subscribe Now'}</h3>
              
              {p.showNameField && (
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" placeholder="John Doe" disabled className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-800 bg-zinc-900/50 text-white outline-none cursor-pointer" />
                </div>
              )}

              {p.showEmailField && (
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" placeholder="john@example.com" disabled className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-800 bg-zinc-900/50 text-white outline-none cursor-pointer" />
                </div>
              )}

              {p.showMessageField && (
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Message</label>
                  <textarea rows={2} placeholder="Tell us more..." disabled className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-800 bg-zinc-900/50 text-white outline-none cursor-pointer resize-none"></textarea>
                </div>
              )}

              <button className="w-full py-2 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-all mt-1">
                {p.buttonText || 'Submit Form'}
              </button>
            </form>
          </div>
        );
      }

      case 'Grid': {
        const columns = p.columns || 3;
        const colClass = `grid-cols-1 md:grid-cols-${columns}`;
        const gapClass = p.gap || 'gap-6';

        return (
          <div
            key={c.id}
            onClick={handleClick}
            onDragOver={handleCanvasDragOver}
            onDrop={(e) => handleCanvasDrop(e, c.id)}
            className={`${wrapperClasses} p-2 border border-dashed border-zinc-800/80 rounded-lg`}
          >
            {isSelected && renderActions(c.id)}
            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mb-2 uppercase select-none">
              <span>Grid Layout ({columns} Columns)</span>
              <span>Drop Zone</span>
            </div>
            
            <div className={`grid ${colClass} ${gapClass} ${classList} w-full min-h-[100px]`}>
              {(c.children || []).length > 0 ? (
                c.children!.map((child) => renderComponent(child))
              ) : (
                <div className="col-span-full border border-dashed border-zinc-800 rounded bg-zinc-950/20 p-6 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-[10px] text-zinc-500">Grid Empty</span>
                  <p className="text-[9px] text-zinc-600 mt-0.5">Drag & drop items directly here</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <section className="flex-1 flex flex-col min-h-0 bg-zinc-950 select-none">
      
      {/* Breakpoint Switcher Top Bar */}
      <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 flex-shrink-0">
        <span className="text-xs font-semibold text-zinc-400">Visual Designer Canvas</span>
        
        {/* Breakpoints */}
        <div className="flex bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg gap-0.5 select-none">
          {[
            { value: 'desktop' as const, label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
            { value: 'tablet' as const, label: 'Tablet (768px)', icon: <Tablet className="w-4 h-4" /> },
            { value: 'mobile' as const, label: 'Mobile (375px)', icon: <Smartphone className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeBreakpoint(item.value)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                breakpoint === item.value
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Main Canvas Scroll Area */}
      <div 
        onClick={() => onSelectComponent(null)}
        className="flex-1 overflow-y-auto p-8 grid-bg-dark flex justify-center items-start min-h-0"
      >
        {/* Breakpoint Frame Wrapper */}
        <div className={`transition-all duration-300 ${getBreakpointWidth()} h-full`}>
          {breakpoint === 'desktop' ? (
            /* Root Droppable Canvas for Desktop */
            <div
              onDragOver={handleCanvasDragOver}
              onDrop={(e) => handleCanvasDrop(e)}
              className="w-full min-h-full flex flex-col gap-6"
            >
              {components.length > 0 ? (
                components.map((comp) => renderComponent(comp))
              ) : (
                /* Root Canvas Empty State */
                <div className="flex-1 min-h-[350px] border border-dashed border-zinc-800 bg-zinc-900/10 rounded-xl flex flex-col items-center justify-center p-12 text-center my-auto">
                  <LayoutTemplate className="w-12 h-12 text-zinc-700 mb-4 animate-float" />
                  <h3 className="text-sm font-semibold text-zinc-400">Your Canvas is Empty</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-[280px] leading-relaxed">
                    Click items in the Component Library or drag them directly here to start building your visual UI template.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Realistic Device Shell Frame for Mobile and Tablet */
            <div className="flex justify-center h-full">
              <div className={`relative bg-zinc-950 border-[12px] border-zinc-900 shadow-2xl rounded-[36px] flex flex-col h-full w-full overflow-hidden max-h-[85vh] ${
                breakpoint === 'mobile' ? 'max-w-[375px]' : 'max-w-[768px]'
              }`}>
                {/* Device Speaker Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-zinc-900 rounded-b-xl z-50 flex items-center justify-center">
                  <span className="w-8 h-1 rounded-full bg-zinc-800" />
                </div>

                {/* Device Inner Content (Scrollable Droppable) */}
                <div 
                  onDragOver={handleCanvasDragOver}
                  onDrop={(e) => handleCanvasDrop(e)}
                  className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 bg-stone-950 mt-1.5"
                >
                  {components.length > 0 ? (
                    components.map((comp) => renderComponent(comp))
                  ) : (
                    <div className="flex-1 border border-dashed border-zinc-900 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-zinc-900/10">
                      <LayoutTemplate className="w-10 h-10 text-zinc-700 mb-3" />
                      <h3 className="text-xs font-semibold text-zinc-400">Empty Device Frame</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
                        Drag components from the library and drop inside the device workspace.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

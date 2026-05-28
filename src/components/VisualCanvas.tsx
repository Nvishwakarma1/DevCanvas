import { type DragEvent, type MouseEvent, useState, useRef, useEffect } from 'react';
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
import type { CanvasComponent, BreakpointType, ComponentProps, PageSettings } from '../types/canvas';
import ThreeDModelViewer from './ThreeDModelViewer';
import BackgroundEngine from './BackgroundEngine';

interface SnapLine {
  type: 'h' | 'v';
  coord: number;
}

interface VisualCanvasProps {
  components: CanvasComponent[];
  selectedId: string | null;
  breakpoint: BreakpointType;
  pageSettings: PageSettings;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: 'up' | 'down') => void;
  onDropComponent: (type: string, parentId?: string) => void;
  onChangeBreakpoint: (b: BreakpointType) => void;
  onUpdateComponentProps: (id: string, newProps: Partial<ComponentProps>) => void;
}

export default function VisualCanvas({
  components,
  selectedId,
  breakpoint,
  pageSettings,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  onDropComponent,
  onChangeBreakpoint,
  onUpdateComponentProps,
}: VisualCanvasProps) {

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const domNodesRef = useRef<{[id: string]: HTMLDivElement | null}>({});
  const [, forceUpdate] = useState({});
  const [activeGuides, setActiveGuides] = useState<SnapLine[]>([]);

  // Trigger manual handles re-draw when selected node moves
  useEffect(() => {
    forceUpdate({});
  }, [components, selectedId]);

  // Track coordinates for cursor followers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

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

    const flex = [
      p.flexDirection || 'flex-col',
      p.justifyContent || 'justify-start',
      p.alignItems || 'items-center',
      p.gap || 'gap-6'
    ].filter(Boolean).join(' ');

    const lh = p.lineHeight || '';

    return `${spacing} ${design} ${flex} ${lh}`.trim().replace(/\s+/g, ' ');
  };

  // Snapping calculations engine
  const getSnapGrid = (
    draggingId: string,
    proposedLeft: number,
    proposedTop: number,
    compWidth: number,
    compHeight: number
  ) => {
    const snapThreshold = 10;
    let snappedLeft = proposedLeft;
    let snappedTop = proposedTop;
    const guides: SnapLine[] = [];

    // Filter top-level components that are NOT the dragged component
    const otherComps = components.filter(c => c.id !== draggingId);

    let verticalSnapped = false;
    let horizontalSnapped = false;

    // 1. Calculate Snapped Coordinates
    for (const other of otherComps) {
      const otherEl = domNodesRef.current[other.id];
      if (!otherEl) continue;

      const otherLeft = other.props.left !== undefined ? other.props.left : 100;
      const otherTop = other.props.top !== undefined ? other.props.top : 120;
      const otherWidth = otherEl.offsetWidth;
      const otherHeight = otherEl.offsetHeight;

      const otherRight = otherLeft + otherWidth;
      const otherCenterX = otherLeft + otherWidth / 2;
      const compCenterX = proposedLeft + compWidth / 2;
      const compRight = proposedLeft + compWidth;

      if (!verticalSnapped) {
        if (Math.abs(proposedLeft - otherLeft) < snapThreshold) {
          snappedLeft = otherLeft;
          verticalSnapped = true;
        } else if (Math.abs(compRight - otherRight) < snapThreshold) {
          snappedLeft = otherRight - compWidth;
          verticalSnapped = true;
        } else if (Math.abs(compCenterX - otherCenterX) < snapThreshold) {
          snappedLeft = otherCenterX - compWidth / 2;
          verticalSnapped = true;
        } else if (Math.abs(proposedLeft - otherRight) < snapThreshold) {
          snappedLeft = otherRight;
          verticalSnapped = true;
        } else if (Math.abs(compRight - otherLeft) < snapThreshold) {
          snappedLeft = otherLeft - compWidth;
          verticalSnapped = true;
        }
      }

      const otherBottom = otherTop + otherHeight;
      const otherCenterY = otherTop + otherHeight / 2;
      const compCenterY = proposedTop + compHeight / 2;
      const compBottom = proposedTop + compHeight;

      if (!horizontalSnapped) {
        if (Math.abs(proposedTop - otherTop) < snapThreshold) {
          snappedTop = otherTop;
          horizontalSnapped = true;
        } else if (Math.abs(compBottom - otherBottom) < snapThreshold) {
          snappedTop = otherBottom - compHeight;
          horizontalSnapped = true;
        } else if (Math.abs(compCenterY - otherCenterY) < snapThreshold) {
          snappedTop = otherCenterY - compHeight / 2;
          horizontalSnapped = true;
        } else if (Math.abs(proposedTop - otherBottom) < snapThreshold) {
          snappedTop = otherBottom;
          horizontalSnapped = true;
        } else if (Math.abs(compBottom - otherTop) < snapThreshold) {
          snappedTop = otherTop - compHeight;
          horizontalSnapped = true;
        }
      }
    }

    // 2. Accumulate matching guidelines at the snapped position
    if (verticalSnapped || horizontalSnapped) {
      const snappedCompCenterX = snappedLeft + compWidth / 2;
      const snappedCompRight = snappedLeft + compWidth;
      const snappedCompCenterY = snappedTop + compHeight / 2;
      const snappedCompBottom = snappedTop + compHeight;

      for (const other of otherComps) {
        const otherEl = domNodesRef.current[other.id];
        if (!otherEl) continue;

        const otherLeft = other.props.left !== undefined ? other.props.left : 100;
        const otherTop = other.props.top !== undefined ? other.props.top : 120;
        const otherWidth = otherEl.offsetWidth;
        const otherHeight = otherEl.offsetHeight;

        const otherRight = otherLeft + otherWidth;
        const otherCenterX = otherLeft + otherWidth / 2;
        const otherBottom = otherTop + otherHeight;
        const otherCenterY = otherTop + otherHeight / 2;

        // Check vertical alignments
        if (
          Math.abs(snappedLeft - otherLeft) < 1 ||
          Math.abs(snappedLeft - otherRight) < 1 ||
          Math.abs(snappedCompCenterX - otherCenterX) < 1 ||
          Math.abs(snappedCompRight - otherLeft) < 1 ||
          Math.abs(snappedCompRight - otherRight) < 1
        ) {
          const matchX = Math.abs(snappedLeft - otherLeft) < 1 ? otherLeft :
                         Math.abs(snappedLeft - otherRight) < 1 ? otherRight :
                         Math.abs(snappedCompCenterX - otherCenterX) < 1 ? otherCenterX :
                         Math.abs(snappedCompRight - otherLeft) < 1 ? otherLeft : otherRight;
          guides.push({ type: 'v', coord: matchX });
        }

        // Check horizontal alignments
        if (
          Math.abs(snappedTop - otherTop) < 1 ||
          Math.abs(snappedTop - otherBottom) < 1 ||
          Math.abs(snappedCompCenterY - otherCenterY) < 1 ||
          Math.abs(snappedCompBottom - otherTop) < 1 ||
          Math.abs(snappedCompBottom - otherBottom) < 1
        ) {
          const matchY = Math.abs(snappedTop - otherTop) < 1 ? otherTop :
                         Math.abs(snappedTop - otherBottom) < 1 ? otherBottom :
                         Math.abs(snappedCompCenterY - otherCenterY) < 1 ? otherCenterY :
                         Math.abs(snappedCompBottom - otherTop) < 1 ? otherTop : otherBottom;
          guides.push({ type: 'h', coord: matchY });
        }
      }
    }

    // Deduplicate
    const uniqueGuides: SnapLine[] = [];
    const seen = new Set<string>();
    for (const g of guides) {
      const key = `${g.type}-${g.coord}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueGuides.push(g);
      }
    }

    return { snappedLeft, snappedTop, guides: uniqueGuides };
  };

  // Draggable Absolute Position logic
  const handleMoveStart = (e: MouseEvent, comp: CanvasComponent) => {
    if (e.button !== 0) return; // Left click only
    const target = e.target as HTMLElement;
    if (
      target.closest('.action-btn') || 
      target.closest('.resize-handle') || 
      target.closest('.rotate-stem') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select')
    ) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialTop = comp.props.top !== undefined ? comp.props.top : 120;
    const initialLeft = comp.props.left !== undefined ? comp.props.left : 100;

    // Cache the dragged element's actual dimensions on drag start
    const compEl = domNodesRef.current[comp.id];
    const compWidth = compEl ? compEl.offsetWidth : parseInt(comp.props.width || '') || 320;
    const compHeight = compEl ? compEl.offsetHeight : parseInt(comp.props.height || '') || 120;

    const handleWindowMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const proposedLeft = Math.max(0, initialLeft + dx);
      const proposedTop = Math.max(0, initialTop + dy);

      const { snappedLeft, snappedTop, guides } = getSnapGrid(
        comp.id,
        proposedLeft,
        proposedTop,
        compWidth,
        compHeight
      );

      setActiveGuides(guides);

      onUpdateComponentProps(comp.id, {
        top: snappedTop,
        left: snappedLeft,
      });
    };

    const handleWindowMouseUp = () => {
      setActiveGuides([]); // Clear guidelines
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      // Optional: we can add a history commit here, but for now we skip to avoid refactoring props.
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Resizing transformations math
  const handleResizeStart = (e: MouseEvent, direction: string, rect: DOMRect, comp: CanvasComponent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = rect.width;
    const initialHeight = rect.height;
    const initialTop = comp.props.top !== undefined ? comp.props.top : 120;
    const initialLeft = comp.props.left !== undefined ? comp.props.left : 100;

    const handleWindowMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newTop = initialTop;
      let newLeft = initialLeft;

      if (direction.includes('r')) {
        newWidth = Math.max(50, initialWidth + dx);
      }
      if (direction.includes('l')) {
        const potentialWidth = initialWidth - dx;
        if (potentialWidth > 50) {
          newWidth = potentialWidth;
          newLeft = initialLeft + dx;
        }
      }
      if (direction.includes('b')) {
        newHeight = Math.max(30, initialHeight + dy);
      }
      if (direction.includes('t')) {
        const potentialHeight = initialHeight - dy;
        if (potentialHeight > 30) {
          newHeight = potentialHeight;
          newTop = initialTop + dy;
        }
      }

      onUpdateComponentProps(comp.id, {
        width: `${newWidth}px`,
        height: comp.type === 'ThreeDAsset' || comp.props.height !== 'auto' ? `${newHeight}px` : 'auto',
        top: Math.max(0, newTop),
        left: Math.max(0, newLeft),
      });
    };

    const handleWindowMouseUp = () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Rotation Transformations Math
  const handleRotateStart = (e: MouseEvent, rect: DOMRect, comp: CanvasComponent) => {
    e.stopPropagation();
    e.preventDefault();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const handleWindowMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const angleRad = Math.atan2(moveEvent.clientY - cy, moveEvent.clientX - cx);
      const angleDeg = Math.round(angleRad * (180 / Math.PI)) + 90;
      onUpdateComponentProps(comp.id, {
        rotation: (angleDeg + 360) % 360,
      });
    };

    const handleWindowMouseUp = () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Render element transformations overlays
  const renderTransformHandles = (c: CanvasComponent) => {
    const el = domNodesRef.current[c.id];
    if (!el) return null;
    const rect = el.getBoundingClientRect();

    const handles = [
      { dir: 'tl', style: { top: -4, left: -4, cursor: 'nwse-resize' } },
      { dir: 'tc', style: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
      { dir: 'tr', style: { top: -4, right: -4, cursor: 'nesw-resize' } },
      { dir: 'mr', style: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
      { dir: 'br', style: { bottom: -4, right: -4, cursor: 'nwse-resize' } },
      { dir: 'bc', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
      { dir: 'bl', style: { bottom: -4, left: -4, cursor: 'nesw-resize' } },
      { dir: 'ml', style: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
    ];

    return (
      <>
        {/* Selected Border outline */}
        <div 
          className="absolute border border-dashed border-indigo-500 pointer-events-none rounded z-35"
          style={{
            top: -2,
            left: -2,
            width: 'calc(100% + 4px)',
            height: 'calc(100% + 4px)'
          }}
        />

        {/* Rotate stem handle */}
        <div
          onMouseDown={(e) => handleRotateStart(e, rect, c)}
          className="absolute left-1/2 w-0.5 h-6 bg-indigo-500 z-40 -top-6 -translate-x-1/2 cursor-alias rotate-stem flex items-center justify-center"
          title="Drag to Rotate"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-650 border border-white hover:bg-white transition-colors" />
        </div>

        {/* Resize handle points */}
        {handles.map((h) => (
          <div
            key={h.dir}
            onMouseDown={(e) => handleResizeStart(e, h.dir, rect, c)}
            className="absolute w-2 h-2 bg-indigo-600 border border-white rounded-full z-40 shadow shadow-indigo-950 resize-handle hover:bg-indigo-300 transition-colors"
            style={h.style as any}
          />
        ))}
      </>
    );
  };

  // Render a component's action toolbar
  const renderActions = (id: string) => {
    return (
      <div className="absolute -top-3.5 right-2 z-30 flex items-center bg-indigo-600 rounded shadow-md border border-indigo-500 overflow-hidden text-white text-[10px] action-btn select-none">
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
  const renderComponent = (c: CanvasComponent, isNested = false) => {
    const isSelected = selectedId === c.id;
    const p = c.props;
    const classList = getComponentClasses(p);

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      onSelectComponent(c.id);
    };

    // Absolute or Nested position style binding
    const layoutStyle: React.CSSProperties = isNested 
      ? {
          position: 'relative',
          width: p.width || '105%',
          height: p.height || 'auto',
          transform: p.rotation ? `rotate(${p.rotation}deg)` : undefined,
          zIndex: isSelected ? 40 : 10,
        }
      : {
          position: 'absolute',
          top: p.top !== undefined ? `${p.top}px` : '120px',
          left: p.left !== undefined ? `${p.left}px` : '100px',
          width: p.width || '320px',
          height: p.height || 'auto',
          transform: p.rotation ? `rotate(${p.rotation}deg)` : undefined,
          zIndex: isSelected ? 40 : 10,
        };

    const wrapperClasses = `group transition-shadow ${
      isSelected 
        ? 'ring-1 ring-indigo-500 rounded shadow-2xl shadow-indigo-500/10' 
        : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-zinc-700 hover:outline-offset-1 rounded'
    }`;

    // Switch case to render component types visually
    const renderNode = () => {
      switch (c.type) {
        case 'Header': {
          const links = p.links || ['Home', 'Features', 'Pricing', 'Contact'];
          return (
            <header className={`${classList} flex items-center justify-between w-full h-full select-none cursor-grab active:cursor-grabbing`}>
              <div className="font-bold text-lg tracking-tight">{p.logoText || 'DevCanvas'}</div>
              <nav className="hidden md:flex items-center gap-4 text-xs font-semibold">
                {links.map((link, idx) => (
                  <span key={idx} className="hover:text-indigo-400 transition-colors">{link}</span>
                ))}
              </nav>
              <button className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-650 text-white hover:bg-indigo-700 transition-all pointer-events-none">
                {p.buttonText || 'Get Started'}
              </button>
            </header>
          );
        }

        case 'Card': {
          return (
            <div className={`${classList} flex flex-col h-full select-none cursor-grab active:cursor-grabbing overflow-hidden`}>
              {p.imageUrl && (
                <img className="w-full h-32 object-cover rounded-lg mb-2.5 pointer-events-none" src={p.imageUrl} alt="Card image" />
              )}
              {p.badgeText && (
                <span className="self-start inline-block px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/15 text-indigo-400 mb-1.5">
                  {p.badgeText}
                </span>
              )}
              <h3 className="text-sm font-bold mb-1">{p.title || 'Amazing Card'}</h3>
              <p className="text-zinc-400 text-[10px] mb-2.5 leading-relaxed">
                {p.description || 'Provide detailed descriptions of your feature or product here.'}
              </p>
              {p.buttonText && (
                <button className="w-full py-1 text-[10px] font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white mt-auto pointer-events-none">
                  {p.buttonText}
                </button>
              )}
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
            <button className={`px-4 py-2.5 text-xs font-semibold rounded cursor-grab active:cursor-grabbing w-full h-full ${classList} ${isCustomBg ? '' : bgStyle}`}>
              {p.buttonText || 'Button Click'}
            </button>
          );
        }

        case 'InputForm': {
          return (
            <form className={`${classList} w-full h-full flex flex-col gap-2 select-none cursor-grab active:cursor-grabbing`} onSubmit={(e) => e.preventDefault()}>
              <h3 className="text-sm font-bold border-b border-zinc-800 pb-1 mb-1">{p.formTitle || 'Subscribe Now'}</h3>
              
              {p.showNameField && (
                <div>
                  <label className="block text-[8px] font-semibold text-zinc-500 uppercase mb-0.5">Full Name</label>
                  <input type="text" placeholder="John Doe" disabled className="w-full px-2.5 py-1 text-[10px] rounded border border-zinc-800 bg-zinc-900/50 text-white outline-none cursor-grab" />
                </div>
              )}

              {p.showEmailField && (
                <div>
                  <label className="block text-[8px] font-semibold text-zinc-500 uppercase mb-0.5">Email Address</label>
                  <input type="email" placeholder="john@example.com" disabled className="w-full px-2.5 py-1 text-[10px] rounded border border-zinc-800 bg-zinc-900/50 text-white outline-none cursor-grab" />
                </div>
              )}

              {p.showMessageField && (
                <div>
                  <label className="block text-[8px] font-semibold text-zinc-500 uppercase mb-0.5">Message</label>
                  <textarea rows={2} placeholder="Tell us more..." disabled className="w-full px-2.5 py-1 text-[10px] rounded border border-zinc-800 bg-zinc-900/50 text-white outline-none cursor-grab resize-none"></textarea>
                </div>
              )}

              <button className="w-full py-1.5 text-[10px] font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white mt-1 pointer-events-none">
                {p.buttonText || 'Submit Form'}
              </button>
            </form>
          );
        }

        case 'Grid': {
          const columns = p.columns || 3;
          const rows = p.rows || 1;
          const colClass = `grid-cols-1 md:grid-cols-${columns}`;
          const rowClass = rows > 1 ? `grid-rows-${rows}` : '';
          const gapClass = p.gap || 'gap-6';

          return (
            <div
              onDragOver={handleCanvasDragOver}
              onDrop={(e) => handleCanvasDrop(e, c.id)}
              className="p-2 border border-dashed border-zinc-800/80 rounded-lg w-full h-full cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between text-[8px] text-zinc-550 font-mono mb-1.5 uppercase select-none pointer-events-none">
                <span>Grid Layout ({columns} Columns)</span>
                <span>Drop Zone</span>
              </div>
              
              <div className={`grid ${colClass} ${rowClass} ${gapClass} ${classList} w-full h-full min-h-[80px]`}>
                {(c.children || []).length > 0 ? (
                  c.children!.map((child) => renderComponent(child, true))
                ) : (
                  <div className="col-span-full border border-dashed border-zinc-800 rounded bg-zinc-950/20 p-4 flex flex-col items-center justify-center text-center select-none pointer-events-none h-full min-h-[80px]">
                    <span className="text-[9px] text-zinc-500">Grid Empty</span>
                    <p className="text-[8px] text-zinc-650 mt-0.5">Drag items here</p>
                  </div>
                )}
              </div>
            </div>
          );
        }

        case 'ThreeDAsset': {
          return (
            <div className="w-full h-full cursor-grab active:cursor-grabbing bg-zinc-950/20 rounded-xl overflow-hidden">
              <ThreeDModelViewer
                modelUrl={p.modelUrl || ''}
                autoRotate={!!p.modelAutoRotate}
                scale={p.modelScale || 1.5}
                interactive={!!p.modelInteractive}
              />
            </div>
          );
        }

        case 'Section': {
          return (
            <section className={`${classList} flex flex-col items-center justify-center w-full h-full select-none cursor-grab active:cursor-grabbing text-center`}>
              <h2 className="text-3xl font-bold mb-4">{p.sectionTitle || 'Section Title'}</h2>
              <p className="text-sm max-w-2xl mx-auto opacity-80">{p.subtitle || 'Subtitle text goes here.'}</p>
            </section>
          );
        }

        case 'Navbar': {
          const links = p.links || ['Home', 'About', 'Services', 'Contact'];
          return (
            <nav className={`${classList} flex items-center justify-between w-full h-full select-none cursor-grab active:cursor-grabbing`}>
              <div className="font-bold text-xl tracking-tight">{p.logoText || 'BrandLogo'}</div>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                {links.map((link, idx) => (
                  <span key={idx} className="hover:opacity-75 transition-opacity">{link}</span>
                ))}
              </div>
              {p.buttonText && (
                <button className="px-4 py-2 text-sm font-semibold rounded bg-white text-zinc-950 hover:bg-zinc-200 transition-all pointer-events-none">
                  {p.buttonText}
                </button>
              )}
            </nav>
          );
        }

        case 'Footer': {
          const links = p.links || ['Privacy Policy', 'Terms of Service', 'Contact Us'];
          return (
            <footer className={`${classList} flex flex-col items-center justify-center w-full h-full select-none cursor-grab active:cursor-grabbing text-center gap-6`}>
              <div className="font-bold text-2xl tracking-tight">{p.logoText || 'BrandLogo'}</div>
              <p className="text-sm opacity-80 max-w-md mx-auto">{p.description || 'Building amazing experiences on the web.'}</p>
              <div className="flex items-center justify-center gap-4 text-xs font-medium w-full">
                {links.map((link, idx) => (
                  <span key={idx} className="hover:opacity-75 transition-opacity underline-offset-4 hover:underline">{link}</span>
                ))}
              </div>
              <div className="text-xs opacity-50 mt-4">{p.copyrightText || '© 2026 DevCanvas. All rights reserved.'}</div>
            </footer>
          );
        }

        default:
          return null;
      }
    };

    return (
      <div 
        key={c.id} 
        ref={el => { domNodesRef.current[c.id] = el; }}
        style={layoutStyle}
        onClick={handleClick} 
        onMouseDown={(e) => !isNested && handleMoveStart(e, c)}
        className={wrapperClasses}
      >
        {isSelected && renderActions(c.id)}
        {renderNode()}
        {isSelected && renderTransformHandles(c)}
      </div>
    );
  };

  const canvasCursorClass = (pageSettings.cursorPreset === 'neon-crosshair' || pageSettings.cursorPreset === 'glowing-circle')
    ? 'cursor-none'
    : '';

  const customCursorStyle = pageSettings.cursorPreset === 'custom' && pageSettings.customCursorUrl
    ? { cursor: `url(${pageSettings.customCursorUrl}) 16 16, auto` }
    : {};

  // Custom Neon Follower cursor overlays
  const renderCursorFollower = () => {
    if (pageSettings.cursorPreset === 'default' || pageSettings.cursorPreset === 'custom') return null;

    if (pageSettings.cursorPreset === 'glowing-circle') {
      return (
        <div
          className="absolute pointer-events-none z-[999] w-6 h-6 rounded-full border border-indigo-500 bg-indigo-500/20 blur-[0.5px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          style={{ left: mousePos.x + 'px', top: mousePos.y + 'px' }}
        />
      );
    }

    if (pageSettings.cursorPreset === 'neon-crosshair') {
      return (
        <div
          className="absolute pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 text-emerald-450"
          style={{ left: mousePos.x + 'px', top: mousePos.y + 'px' }}
        >
          <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
      );
    }

    return null;
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
        onMouseMove={handleMouseMove}
        style={customCursorStyle}
        className={`flex-1 overflow-y-auto p-8 relative flex justify-center items-start min-h-0 ${canvasCursorClass}`}
      >
        {/* Interactive Background Engine */}
        <BackgroundEngine preset={pageSettings.bgPreset} />

        {/* Cursor follower overlay */}
        {renderCursorFollower()}

        {/* Breakpoint Frame Wrapper */}
        <div className={`transition-all duration-300 ${getBreakpointWidth()} h-full`}>
          {breakpoint === 'desktop' ? (
            /* Root Droppable Canvas for Desktop */
            <div
              onDragOver={handleCanvasDragOver}
              onDrop={(e) => handleCanvasDrop(e)}
              className="w-full min-h-full relative overflow-y-auto min-h-[600px] border border-zinc-900/30 rounded-xl"
            >
              {/* Snap alignment guidelines */}
              {activeGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="absolute border-red-500 pointer-events-none z-[9999]"
                  style={{
                    borderStyle: 'dashed',
                    borderWidth: guide.type === 'h' ? '1.5px 0 0 0' : '0 0 0 1.5px',
                    top: guide.type === 'h' ? `${guide.coord}px` : '0px',
                    left: guide.type === 'v' ? `${guide.coord}px` : '0px',
                    width: guide.type === 'h' ? '100%' : '1.5px',
                    height: guide.type === 'v' ? '100%' : '1.5px',
                  }}
                />
              ))}

              {components.length > 0 ? (
                components.map((comp) => renderComponent(comp))
              ) : (
                /* Root Canvas Empty State */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none select-none">
                  <LayoutTemplate className="w-12 h-12 text-zinc-800 mb-4 animate-float" />
                  <h3 className="text-sm font-semibold text-zinc-500">Your Canvas is Empty</h3>
                  <p className="text-xs text-zinc-650 mt-1 max-w-[280px] leading-relaxed">
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
                  className="flex-1 relative overflow-y-auto px-4 py-8 bg-stone-950 mt-1.5 min-h-[450px]"
                >
                  {/* Snap alignment guidelines */}
                  {activeGuides.map((guide, idx) => (
                    <div
                      key={idx}
                      className="absolute border-red-500 pointer-events-none z-[9999]"
                      style={{
                        borderStyle: 'dashed',
                        borderWidth: guide.type === 'h' ? '1.5px 0 0 0' : '0 0 0 1.5px',
                        top: guide.type === 'h' ? `${guide.coord}px` : '0px',
                        left: guide.type === 'v' ? `${guide.coord}px` : '0px',
                        width: guide.type === 'h' ? '100%' : '1.5px',
                        height: guide.type === 'v' ? '100%' : '1.5px',
                      }}
                    />
                  ))}

                  {components.length > 0 ? (
                    components.map((comp) => renderComponent(comp))
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900/10 pointer-events-none">
                      <LayoutTemplate className="w-10 h-10 text-zinc-800 mb-3" />
                      <h3 className="text-xs font-semibold text-zinc-500">Empty Device Frame</h3>
                      <p className="text-[10px] text-zinc-650 mt-1 max-w-[200px] leading-relaxed">
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

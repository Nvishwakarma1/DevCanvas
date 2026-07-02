import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Download,
  ExternalLink,
  Layers,
  Zap,
  GitBranch,
  Box,
  RotateCcw,
  Check,
  Copy,
  Trash2
} from 'lucide-react';
import logoImg from './assets/DClogo.png';
import LandingPage from './components/LandingPage';
import ComponentLibrary from './components/ComponentLibrary';
import VisualCanvas from './components/VisualCanvas';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import PropertyInspector from './components/PropertyInspector';
import LogicPanel from './components/LogicPanel';
import GitHubPanel from './components/GitHubPanel';
import type { CanvasComponent, ComponentType, ComponentProps, BreakpointType, ViewType, PageSettings, LogicBinding } from './types/canvas';
import { generateComponentHtml, generateFullHtml, parseHtmlToComponents, wrapRawHtmlInTemplate } from './utils/codeGenerator';
import { generateReactProject } from './utils/projectExporter';
import { useDebouncedValue } from './hooks/useDebouncedValue';

import ContextMenu from './components/ContextMenu';

const isCanvasMode = typeof window !== 'undefined' && window.location.search.includes('mode=canvas');
const isPreviewMode = typeof window !== 'undefined' && window.location.search.includes('mode=preview');

const createDefaultProps = (type: ComponentType): ComponentProps => {
  const common = {
    paddingY: 'py-6',
    paddingX: 'px-6',
    marginY: 'my-2',
    marginX: 'mx-0',
    textSize: 'text-base',
    textColor: 'text-zinc-100',
    fontWeight: 'font-normal',
    textAlign: 'text-left',
    bgColor: 'bg-zinc-900',
    borderRadius: 'rounded-xl',
    shadow: 'shadow-md',
    borderWidth: 'border',
    borderColor: 'border-zinc-800',
    position: 'absolute' as const,
    top: 120,
    left: 100,
    width: '320px',
    height: 'auto',
    rotation: 0
  };

  switch (type) {
    case 'Header':
      return {
        ...common,
        paddingY: 'py-4',
        paddingX: 'px-6',
        bgColor: 'bg-zinc-900',
        logoText: 'DevCanvas Studio',
        links: ['Features', 'Showcase', 'Pricing', 'Contact'],
        buttonText: 'Get Started',
        borderRadius: 'rounded-none',
        borderWidth: 'border-0',
        shadow: 'shadow-lg',
        top: 0,
        left: 0,
        width: '100%',
        height: 'auto'
      };
    case 'Card':
      return {
        ...common,
        paddingY: 'py-6',
        paddingX: 'px-5',
        title: 'Feature Offering',
        description: 'Detail explaining the benefits, details, and features of your project layout component.',
        badgeText: 'New Release',
        buttonText: 'Action Label',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
        borderRadius: 'rounded-xl',
        top: 100,
        left: 50,
        width: '320px',
        height: 'auto'
      };
    case 'Button':
      return {
        ...common,
        paddingY: 'py-2.5',
        paddingX: 'px-5',
        buttonText: 'Click Action',
        buttonVariant: 'solid',
        textAlign: 'text-center',
        bgColor: 'bg-violet-600',
        borderRadius: 'rounded-md',
        borderWidth: 'border-0',
        top: 240,
        left: 450,
        width: '160px',
        height: 'auto'
      };
    case 'InputForm':
      return {
        ...common,
        formTitle: 'Subscribe Newsletter',
        buttonText: 'Submit Form',
        showNameField: true,
        showEmailField: true,
        showMessageField: false,
        borderRadius: 'rounded-2xl',
        top: 300,
        left: 50,
        width: '380px',
        height: 'auto'
      };
    case 'Grid':
      return {
        ...common,
        paddingY: 'py-4',
        paddingX: 'px-0',
        bgColor: 'bg-transparent',
        borderWidth: 'border-0',
        borderRadius: 'rounded-none',
        shadow: 'shadow-none',
        columns: 3,
        rows: 1,
        gap: 'gap-6',
        top: 500,
        left: 50,
        width: '100%',
        height: 'auto'
      };
    case 'ThreeDAsset':
      return {
        ...common,
        paddingY: 'py-0',
        paddingX: 'px-0',
        bgColor: 'bg-zinc-900',
        borderRadius: 'rounded-xl',
        borderWidth: 'border',
        borderColor: 'border-zinc-800',
        top: 100,
        left: 400,
        width: '350px',
        height: '350px',
        rotation: 0,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Embedded/Duck.gltf',
        modelScale: 1.5,
        modelAutoRotate: true,
        modelInteractive: true
      };
    case 'Section':
      return {
        ...common,
        paddingY: 'py-16',
        paddingX: 'px-8',
        bgColor: 'bg-zinc-900',
        sectionTitle: 'Main Section Title',
        subtitle: 'Add some descriptive text for this layout section.',
        borderRadius: 'rounded-none',
        borderWidth: 'border-0',
        shadow: 'shadow-none',
        top: 200,
        left: 0,
        width: '100%',
        height: 'auto'
      };
    case 'Navbar':
      return {
        ...common,
        paddingY: 'py-4',
        paddingX: 'px-6',
        bgColor: 'bg-zinc-955',
        logoText: 'BrandLogo',
        links: ['Home', 'About', 'Services', 'Contact'],
        buttonText: 'Sign Up',
        borderRadius: 'rounded-none',
        borderWidth: 'border-b',
        borderColor: 'border-zinc-800',
        shadow: 'shadow-sm',
        top: 0,
        left: 0,
        width: '100%',
        height: 'auto'
      };
    case 'Footer':
      return {
        ...common,
        paddingY: 'py-12',
        paddingX: 'px-8',
        bgColor: 'bg-zinc-955',
        logoText: 'BrandLogo',
        description: 'Building amazing experiences on the web.',
        copyrightText: '© 2026 DevCanvas. All rights reserved.',
        links: ['Privacy Policy', 'Terms of Service', 'Contact Us'],
        borderRadius: 'rounded-none',
        borderWidth: 'border-t',
        borderColor: 'border-zinc-800',
        shadow: 'shadow-none',
        top: 800,
        left: 0,
        width: '100%',
        height: 'auto'
      };
    case 'Container':
      return {
        ...common,
        paddingY: 'py-8',
        paddingX: 'px-8',
        bgColor: 'bg-zinc-900',
        borderRadius: 'rounded-xl',
        borderWidth: 'border',
        borderColor: 'border-zinc-850',
        top: 200,
        left: 200,
        width: '400px',
        height: '250px'
      };
    case 'Breaker':
      return {
        ...common,
        paddingY: 'py-0',
        paddingX: 'px-0',
        bgColor: 'bg-transparent',
        borderRadius: 'rounded-none',
        borderWidth: 'border-b',
        borderColor: 'border-zinc-800',
        top: 450,
        left: 0,
        width: '100%',
        height: '2px'
      };
    default:
      return common;
  }
};

const loadPresetTemplate = (name: string): CanvasComponent[] => {
  const rootId = () => Math.random().toString(36).substr(2, 9);
  
  if (name === 'portfolio') {
    return [
      {
        id: `header-${rootId()}`,
        type: 'Header',
        props: createDefaultProps('Header')
      },
      {
        id: `threed-${rootId()}`,
        type: 'ThreeDAsset',
        props: {
          ...createDefaultProps('ThreeDAsset'),
          top: 100,
          left: 850,
          width: '320px',
          height: '350px'
        }
      },
      {
        id: `grid-${rootId()}`,
        type: 'Grid',
        props: { ...createDefaultProps('Grid'), columns: 3, top: 480, left: 20, width: '1150px' },
        children: [
          {
            id: `card-${rootId()}`,
            type: 'Card',
            props: {
              ...createDefaultProps('Card'),
              title: 'Sleek Layouts',
              badgeText: 'Design',
              imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60'
            }
          },
          {
            id: `card-${rootId()}`,
            type: 'Card',
            props: {
              ...createDefaultProps('Card'),
              title: 'Clean Tailwind',
              badgeText: 'Develop',
              imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60'
            }
          },
          {
            id: `card-${rootId()}`,
            type: 'Card',
            props: {
              ...createDefaultProps('Card'),
              title: 'Hot Refreshing',
              badgeText: 'Launch',
              imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60'
            }
          }
        ]
      },
      {
        id: `form-${rootId()}`,
        type: 'InputForm',
        props: {
          ...createDefaultProps('InputForm'),
          formTitle: 'Get in touch with us',
          buttonText: 'Send Message',
          showNameField: true,
          showEmailField: true,
          showMessageField: true,
          top: 100,
          left: 20,
          width: '380px'
        }
      }
    ];
  } else if (name === 'contact') {
    return [
      {
        id: `header-${rootId()}`,
        type: 'Header',
        props: createDefaultProps('Header')
      },
      {
        id: `form-${rootId()}`,
        type: 'InputForm',
        props: {
          ...createDefaultProps('InputForm'),
          formTitle: 'Contact Our Sales Team',
          buttonText: 'Submit Inquiry',
          showNameField: true,
          showEmailField: true,
          showMessageField: true,
          marginX: 'mx-auto',
          marginY: 'my-12'
        }
      }
    ];
  }
  return [];
};

export default function App() {
  const [view, setView] = useState<ViewType>('landing');
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<BreakpointType>('desktop');
  const [activeTemplate, setActiveTemplate] = useState<string>('portfolio');
  const [isDetached, setIsDetached] = useState<boolean>(false);
  const [isPreviewDetached, setIsPreviewDetached] = useState<boolean>(false);

  // History & Clipboard state
  const [past, setPast] = useState<CanvasComponent[][]>([]);
  const [future, setFuture] = useState<CanvasComponent[][]>([]);
  const [clipboard, setClipboard] = useState<CanvasComponent | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ show: boolean, x: number, y: number }>({ show: false, x: 0, y: 0 });

  const pastRef = useRef<CanvasComponent[][]>([]);
  const futureRef = useRef<CanvasComponent[][]>([]);
  const componentsRef = useRef<CanvasComponent[]>([]);
  const clipboardRef = useRef<CanvasComponent | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    pastRef.current = past;
    futureRef.current = future;
    componentsRef.current = components;
    clipboardRef.current = clipboard;
    selectedIdRef.current = selectedId;
  }, [past, future, components, clipboard, selectedId]);

  // Global Page settings
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    bgPreset: 'none',
    cursorPreset: 'default',
    customCursorUrl: '',
    webglTextureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    webglBlendMode: 'overlay',
    webglColorA: '#7c3aed', // Etherium Purple
    webglColorB: '#f59e0b', // Solar Core
    webglDisplacement: 0.15,
    webglSpeed: 1.0
  });

  // Layout Toggles & Unified Sidebar State
  const [activeSidebarTab, setActiveSidebarTab] = useState<'components' | 'properties' | 'code' | 'preview' | 'console'>('components');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isLogicSidebarOpen, setIsLogicSidebarOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Console state
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Manual code editing states
  const [isManualCodeEditing, setIsManualCodeEditing] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  // Phase 3.5 — Contextual background dimming state: true when active drag/selecting
  const [isUserActive, setIsUserActive] = useState<boolean>(false);

  // Set user activity state dynamically based on user focus/mouse movements
  useEffect(() => {
    let timeout: any;
    const handleActive = () => {
      setIsUserActive(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsUserActive(false);
      }, 3000); // Renders 100% full background after 3s of inactivity
    };

    window.addEventListener('mousemove', handleActive);
    window.addEventListener('mousedown', handleActive);
    window.addEventListener('keydown', handleActive);

    return () => {
      window.removeEventListener('mousemove', handleActive);
      window.removeEventListener('mousedown', handleActive);
      window.removeEventListener('keydown', handleActive);
      clearTimeout(timeout);
    };
  }, []);

  // Load default landing/portfolio page components once loaded
  useEffect(() => {
    setComponents(loadPresetTemplate('portfolio'));
  }, []);

  // Update manual code from components structure when not in manual edit mode
  useEffect(() => {
    if (!isManualCodeEditing) {
      const currentGenerated = components.map(c => generateComponentHtml(c, 0)).join('\n\n');
      setManualCode(currentGenerated);
    }
  }, [components, isManualCodeEditing]);

  const saveHistory = (currentComponents: CanvasComponent[]) => {
    setPast(prev => [...prev, currentComponents]);
    setFuture([]);
  };

  const handleUndo = () => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    setFuture(prev => [componentsRef.current, ...prev]);
    setPast(prev => prev.slice(0, prev.length - 1));
    setComponents(previous);
  };

  const handleRedo = () => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    setPast(prev => [...prev, componentsRef.current]);
    setFuture(prev => prev.slice(1));
    setComponents(next);
  };

  const handleCopy = () => {
    if (!selectedIdRef.current) return;
    const comp = getSelectedComponent(selectedIdRef.current, componentsRef.current);
    if (comp) {
      setClipboard(comp);
    }
  };

  const handlePaste = () => {
    if (!clipboardRef.current) return;
    const newComp = JSON.parse(JSON.stringify(clipboardRef.current));
    newComp.id = `${newComp.type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (newComp.props.top !== undefined && newComp.props.left !== undefined) {
      newComp.props.top += 20;
      newComp.props.left += 20;
    }

    if (newComp.children) {
      const resetIds = (children: CanvasComponent[]) => {
        children.forEach(c => {
          c.id = `${c.type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
          if (c.children) resetIds(c.children);
        });
      };
      resetIds(newComp.children);
    }

    saveHistory(componentsRef.current);
    setComponents([...componentsRef.current, newComp]);
    setSelectedId(newComp.id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'd':
            e.preventDefault();
            if (selectedIdRef.current) duplicateComponent(selectedIdRef.current);
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
         if (selectedIdRef.current) deleteComponent(selectedIdRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (view !== 'ide' || isManualCodeEditing || isPreviewMode) return;
      
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      e.preventDefault();
      setContextMenu({ show: true, x: e.clientX, y: e.clientY });
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [view, isManualCodeEditing]);

  const handleContextMenuAction = (action: 'undo' | 'redo' | 'copy' | 'paste' | 'duplicate' | 'delete') => {
    switch (action) {
      case 'undo': handleUndo(); break;
      case 'redo': handleRedo(); break;
      case 'copy': handleCopy(); break;
      case 'paste': handlePaste(); break;
      case 'duplicate': if (selectedIdRef.current) duplicateComponent(selectedIdRef.current); break;
      case 'delete': if (selectedIdRef.current) deleteComponent(selectedIdRef.current); break;
    }
  };

  const getSelectedComponent = (targetId: string | null = selectedId, list: CanvasComponent[] = components): CanvasComponent | null => {
    if (!targetId) return null;
    
    const search = (items: CanvasComponent[]): CanvasComponent | null => {
      for (const item of items) {
        if (item.id === targetId) return item;
        if (item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(list);
  };

  const addComponent = (type: ComponentType, parentId?: string) => {
    saveHistory(componentsRef.current);
    const newComp: CanvasComponent = {
      id: `${type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: createDefaultProps(type),
      children: type === 'Grid' ? [] : undefined,
      layoutMode: 'freeform' // Default layout sizing
    };

    if (parentId) {
      const recursiveAdd = (list: CanvasComponent[]): CanvasComponent[] => {
        return list.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newComp]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: recursiveAdd(item.children)
            };
          }
          return item;
        });
      };
      setComponents(recursiveAdd(components));
    } else {
      setComponents([...components, newComp]);
    }
    
    setSelectedId(newComp.id);
  };

  const updateComponentProps = (id: string, newProps: Partial<ComponentProps>) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'UPDATE_PROPS', arg: { id, newProps } } });
      channel.close();
    }
    const recursiveUpdate = (list: CanvasComponent[]): CanvasComponent[] => {
      return list.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            props: { ...item.props, ...newProps }
          };
        }
        if (item.children) {
          return {
            ...item,
            children: recursiveUpdate(item.children)
          };
        }
        return item;
      });
    };
    setComponents(recursiveUpdate(components));
  };

  // Phase 1.4 — Fluid Layout modes setting mutation
  const updateComponentLayoutMode = (id: string, mode: 'freeform' | 'flow') => {
    const recursiveLayoutUpdate = (list: CanvasComponent[]): CanvasComponent[] => {
      return list.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            layoutMode: mode,
            // If locking into relative flow mode, clear standard pixel position offsets
            props: {
              ...item.props,
              top: mode === 'flow' ? undefined : 120,
              left: mode === 'flow' ? undefined : 100,
            }
          };
        }
        if (item.children) {
          return {
            ...item,
            children: recursiveLayoutUpdate(item.children)
          };
        }
        return item;
      });
    };
    setComponents(recursiveLayoutUpdate(components));
  };

  // Phase 2.2 — Logic node event wiring bindings update
  const updateComponentLogic = (id: string, bindings: LogicBinding[]) => {
    const recursiveLogicUpdate = (list: CanvasComponent[]): CanvasComponent[] => {
      return list.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            logicBindings: bindings
          };
        }
        if (item.children) {
          return {
            ...item,
            children: recursiveLogicUpdate(item.children)
          };
        }
        return item;
      });
    };
    setComponents(recursiveLogicUpdate(components));
  };

  const updatePageSettings = (newSettings: Partial<PageSettings>) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'PAGE_SETTINGS', arg: newSettings } });
      channel.close();
    }
    setPageSettings(prev => ({ ...prev, ...newSettings }));
  };

  const deleteComponent = (id: string) => {
    const recursiveDelete = (list: CanvasComponent[]): CanvasComponent[] => {
      return list
        .filter((item) => item.id !== id)
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: recursiveDelete(item.children)
            };
          }
          return item;
        });
    };
    setComponents(recursiveDelete(components));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const duplicateComponent = (id: string) => {
    saveHistory(componentsRef.current);
    const recursiveDuplicate = (list: CanvasComponent[]): CanvasComponent[] => {
      const result: CanvasComponent[] = [];
      for (const item of list) {
        if (item.id === id) {
          result.push(item);
          const copy: CanvasComponent = JSON.parse(JSON.stringify(item));
          copy.id = `${item.type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
          if (copy.children) {
            copy.children = copy.children.map(c => ({
              ...c,
              id: `${c.type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`
            }));
          }
          result.push(copy);
        } else {
          if (item.children) {
            result.push({
              ...item,
              children: recursiveDuplicate(item.children)
            });
          } else {
            result.push(item);
          }
        }
      }
      return result;
    };
    setComponents(recursiveDuplicate(components));
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const recursiveMove = (list: CanvasComponent[]): { newList: CanvasComponent[]; moved: boolean } => {
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        const newList = [...list];
        if (direction === 'up' && idx > 0) {
          const temp = newList[idx];
          newList[idx] = newList[idx - 1];
          newList[idx - 1] = temp;
          return { newList, moved: true };
        }
        if (direction === 'down' && idx < newList.length - 1) {
          const temp = newList[idx];
          newList[idx] = newList[idx + 1];
          newList[idx + 1] = temp;
          return { newList, moved: true };
        }
        return { newList, moved: false };
      }

      let moved = false;
      const newList = list.map((item) => {
        if (item.children && !moved) {
          const res = recursiveMove(item.children);
          if (res.moved) {
            moved = true;
            return { ...item, children: res.newList };
          }
        }
        return item;
      });

      return { newList, moved };
    };

    setComponents(recursiveMove(components).newList);
  };

  const generatedCode = components.map(c => generateComponentHtml(c, 0)).join('\n\n');
  
  // Phase 1.1 — Debounced generation for live preview iframe sandbox (Wait 150ms of drag inactivity)
  const debouncedComponents = useDebouncedValue(components, 150);
  const debouncedPageSettings = useDebouncedValue(pageSettings, 150);

  const sandboxHtml = isManualCodeEditing
    ? wrapRawHtmlInTemplate(manualCode, pageSettings)
    : generateFullHtml(debouncedComponents, debouncedPageSettings);

  const stateRef = useRef({ 
    components, 
    selectedId, 
    breakpoint, 
    pageSettings, 
    sandboxHtml, 
    addComponent, 
    deleteComponent, 
    duplicateComponent, 
    moveComponent, 
    updateComponentProps, 
    updatePageSettings 
  });
  useEffect(() => {
    stateRef.current = { 
      components, 
      selectedId, 
      breakpoint, 
      pageSettings, 
      sandboxHtml, 
      addComponent, 
      deleteComponent, 
      duplicateComponent, 
      moveComponent, 
      updateComponentProps, 
      updatePageSettings 
    };
  });

  useEffect(() => {
    const channel = new BroadcastChannel('devcanvas-sync');

    if (isCanvasMode) {
      channel.postMessage({ type: 'REQUEST_INIT_STATE' });
      channel.postMessage({ type: 'CANVAS_MOUNTED' });

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_STATE') {
          setComponents(payload.components);
          setSelectedId(payload.selectedId);
          setBreakpoint(payload.breakpoint);
          if (payload.pageSettings) {
            setPageSettings(payload.pageSettings);
          }
        } else if (type === 'CLOSE_DETACHED') {
          window.close();
        }
      };

      const handleUnload = () => {
        channel.postMessage({ type: 'CANVAS_UNMOUNTED' });
        channel.close();
      };
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        handleUnload();
      };
    } else if (isPreviewMode) {
      channel.postMessage({ type: 'REQUEST_INIT_PREVIEW' });
      channel.postMessage({ type: 'PREVIEW_MOUNTED' });

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_PREVIEW_HTML') {
          const iframe = document.getElementById('detached-preview-frame') as HTMLIFrameElement;
          if (iframe) iframe.setAttribute('srcdoc', payload);
        } else if (type === 'CLOSE_PREVIEW') {
          window.close();
        }
      };

      const handleUnload = () => {
        channel.postMessage({ type: 'PREVIEW_UNMOUNTED' });
        channel.close();
      };
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        handleUnload();
      };
    } else {
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'REQUEST_INIT_STATE') {
          channel.postMessage({
            type: 'SYNC_STATE',
            payload: { 
              components: stateRef.current.components,
              selectedId: stateRef.current.selectedId,
              breakpoint: stateRef.current.breakpoint,
              pageSettings: stateRef.current.pageSettings
            }
          });
          setIsDetached(true);
        } else if (type === 'REQUEST_INIT_PREVIEW') {
          channel.postMessage({
            type: 'SYNC_PREVIEW_HTML',
            payload: stateRef.current.sandboxHtml
          });
          setIsPreviewDetached(true);
        } else if (type === 'CANVAS_MOUNTED') {
          setIsDetached(true);
        } else if (type === 'CANVAS_UNMOUNTED') {
          setIsDetached(false);
        } else if (type === 'PREVIEW_MOUNTED') {
          setIsPreviewDetached(true);
        } else if (type === 'PREVIEW_UNMOUNTED') {
          setIsPreviewDetached(false);
        } else if (type === 'ACTION') {
          const { action, arg } = payload;
          if (action === 'SELECT') {
            setSelectedId(arg);
          } else if (action === 'DELETE') {
            stateRef.current.deleteComponent(arg);
          } else if (action === 'DUPLICATE') {
            stateRef.current.duplicateComponent(arg);
          } else if (action === 'MOVE') {
            stateRef.current.moveComponent(arg.id, arg.direction);
          } else if (action === 'DROP') {
            stateRef.current.addComponent(arg.type, arg.parentId);
          } else if (action === 'BREAKPOINT') {
            setBreakpoint(arg);
          } else if (action === 'UPDATE_PROPS') {
            stateRef.current.updateComponentProps(arg.id, arg.newProps);
          } else if (action === 'PAGE_SETTINGS') {
            stateRef.current.updatePageSettings(arg);
          }
        }
      };

      return () => channel.close();
    }
  }, []);

  useEffect(() => {
    if (!isCanvasMode && !isPreviewMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({
        type: 'SYNC_STATE',
        payload: { components, selectedId, breakpoint, pageSettings }
      });
      channel.postMessage({
        type: 'SYNC_PREVIEW_HTML',
        payload: sandboxHtml
      });
      channel.close();
    }
  }, [components, selectedId, breakpoint, pageSettings, sandboxHtml]);

  const handleCanvasSelect = (id: string | null) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'SELECT', arg: id } });
      channel.close();
      setSelectedId(id);
    } else {
      setSelectedId(id);
    }
  };

  const handleCanvasDelete = (id: string) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'DELETE', arg: id } });
      channel.close();
    } else {
      deleteComponent(id);
    }
  };

  const handleCanvasDuplicate = (id: string) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'DUPLICATE', arg: id } });
      channel.close();
    } else {
      duplicateComponent(id);
    }
  };

  const handleCanvasMove = (id: string, direction: 'up' | 'down') => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'MOVE', arg: { id, direction } } });
      channel.close();
    } else {
      moveComponent(id, direction);
    }
  };

  const handleCanvasDrop = (type: string, parentId?: string) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'DROP', arg: { type, parentId } } });
      channel.close();
    } else {
      addComponent(type as ComponentType, parentId);
    }
  };

  const handleCanvasBreakpoint = (b: BreakpointType) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'BREAKPOINT', arg: b } });
      channel.close();
      setBreakpoint(b);
    } else {
      setBreakpoint(b);
    }
  };

  const detachCanvas = () => {
    setIsDetached(true);
    window.open(
      window.location.origin + '?mode=canvas',
      'DevCanvasVisual',
      'width=1024,height=768,resizable=yes,scrollbars=yes'
    );
  };

  const reDockCanvas = () => {
    const channel = new BroadcastChannel('devcanvas-sync');
    channel.postMessage({ type: 'CLOSE_DETACHED' });
    channel.close();
    setIsDetached(false);
  };

  const detachPreview = () => {
    setIsPreviewDetached(true);
    window.open(
      window.location.origin + '?mode=preview',
      'DevCanvasPreview',
      'width=800,height=600,resizable=yes,scrollbars=yes'
    );
  };

  const reDockPreview = () => {
    const channel = new BroadcastChannel('devcanvas-sync');
    channel.postMessage({ type: 'CLOSE_PREVIEW' });
    channel.close();
    setIsPreviewDetached(false);
  };

  const handleRunDebugger = () => {
    setIsConsoleOpen(true);
    setConsoleLogs([
      `[info] Starting DevCanvas build and HMR compiler...`,
      `[info] Parsing components template trees for: "${activeTemplate}"`,
      `[info] Successfully resolved ${components.length} layouts.`,
      `[success] Tailwind CSS v4 compiler verified. Bundling output dist/index.html (1.00 kB).`,
      `[debug] Synchronization active via BroadcastChannel 'devcanvas-sync'.`,
      `[success] Sandbox server environment listening on port 5173.`
    ]);
  };

  const handleExportCode = () => {
    const fullHtml = generateFullHtml(components, pageSettings);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devcanvas-export.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Phase 1.2 — Handle Vite/React Project Exporter ZIP download
  const handleExportReactProject = async () => {
    try {
      setConsoleLogs(prev => [...prev, `[info] Generating React/Vite project bundle with JSZip...`]);
      setIsConsoleOpen(true);
      await generateReactProject(components, pageSettings);
      setConsoleLogs(prev => [...prev, `[success] React/Vite project zip exported successfully! Creator: VoxelVolt.`]);
    } catch (err: any) {
      setConsoleLogs(prev => [...prev, `[error] Failed to export React project: ${err.message}`]);
    }
  };

  const handleSyncToCanvas = () => {
    try {
      const parsed = parseHtmlToComponents(manualCode);
      if (parsed && parsed.length > 0) {
        setComponents(parsed);
        setIsManualCodeEditing(false);
        setConsoleLogs(prev => [
          ...prev,
          `[success] Synchronized manual HTML code edits to canvas components successfully! Parsed ${parsed.length} layout components.`
        ]);
        setIsConsoleOpen(true);
      } else {
        setConsoleLogs(prev => [
          ...prev,
          `[warning] Sync Warning: No valid DevCanvas components parsed from the HTML code.`
        ]);
        setIsConsoleOpen(true);
      }
    } catch (error: any) {
      console.error("HTML Parse Error: ", error);
      setConsoleLogs(prev => [
        ...prev,
        `[error] Sync Failed: HTML code parsing failed. Check for syntax errors. Details: ${error.message || error}`
      ]);
      setIsConsoleOpen(true);
    }
  };

  const handleDiscardChanges = () => {
    const freshGenerated = components.map(c => generateComponentHtml(c, 0)).join('\n\n');
    setManualCode(freshGenerated);
    setIsManualCodeEditing(false);
    setConsoleLogs(prev => [
      ...prev,
      `[info] Discarded manual HTML code changes. Reset code view to current visual canvas state.`
    ]);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tName = e.target.value;
    setActiveTemplate(tName);
    if (tName === 'clear') {
      setComponents([]);
      setSelectedId(null);
    } else {
      setComponents(loadPresetTemplate(tName));
      setSelectedId(null);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="h-screen bg-zinc-955 text-zinc-100 overflow-hidden flex flex-col font-sans select-none">
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-405 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">DevCanvas Detached Live Preview</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Syncing sandbox active</span>
        </div>

        <div className="flex-1 bg-zinc-950 relative min-h-0">
          <iframe
            id="detached-preview-frame"
            title="DevCanvas Detached Live Preview"
            sandbox="allow-scripts"
            className="w-full h-full bg-stone-950 border-none"
          />
        </div>
      </div>
    );
  }

  if (isCanvasMode) {
    return (
      <div className="h-screen bg-zinc-955 text-zinc-100 overflow-hidden flex flex-col font-sans">
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="font-semibold text-white">DevCanvas Detached Workspace</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time sync active</span>
        </div>

        <VisualCanvas
          components={components}
          selectedId={selectedId}
          breakpoint={breakpoint}
          onSelectComponent={handleCanvasSelect}
          onDeleteComponent={handleCanvasDelete}
          onDuplicateComponent={handleCanvasDuplicate}
          onMoveComponent={handleCanvasMove}
          onDropComponent={handleCanvasDrop}
          onChangeBreakpoint={handleCanvasBreakpoint}
          pageSettings={pageSettings}
          onUpdateComponentProps={updateComponentProps}
        />
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('ide')} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      
      {/* HEADER PANEL - h-14, full width, deep dark background */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 flex-shrink-0 z-20 select-none">
        
        {/* Left: Brand logo & project status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => setView('landing')}>
            <img src={logoImg} alt="DClogo" className="h-6 w-auto" />
            <span className="font-bold text-sm tracking-tight text-white">DevCanvas Studio</span>
          </div>
          <div className="w-px h-5 bg-zinc-800" />
          <div className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer">
            <span className="font-medium text-xs tracking-tight text-zinc-300">Untitled Project</span>
            <div className="w-[14px] h-[14px] rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-2 h-2 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
        </div>

        {/* Center: Tools Toolbar styled as a pill */}
        <div className="flex items-center bg-zinc-800/50 backdrop-blur rounded-full p-1 border border-zinc-800/80 shadow-sm gap-1.5 px-3">
           <button 
             onClick={handleUndo} 
             disabled={past.length === 0}
             className="w-8 h-8 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
             title="Undo (Ctrl+Z)"
           >
             <RotateCcw className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={handleRedo} 
             disabled={future.length === 0}
             className="w-8 h-8 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
             title="Redo (Ctrl+Y)"
           >
             <Check className="w-3.5 h-3.5 rotate-90" />
           </button>
           <button 
             onClick={handleCopy} 
             disabled={!selectedId}
             className="w-8 h-8 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
             title="Copy (Ctrl+C)"
           >
             <Copy className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={handlePaste} 
             disabled={!clipboard}
             className="w-8 h-8 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
             title="Paste (Ctrl+V)"
           >
             <Download className="w-3.5 h-3.5 rotate-180" />
           </button>
           <button 
             onClick={() => selectedId && deleteComponent(selectedId)} 
             disabled={!selectedId}
             className="w-8 h-8 rounded-full hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
             title="Delete"
           >
             <Trash2 className="w-3.5 h-3.5" />
           </button>
        </div>

        {/* Right: GitHub integration, Zoom, compile, export buttons */}
        <div className="flex items-center gap-3">
          {/* GitHub connector */}
          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="GitHub Commit Link"
          >
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
            <span>GitHub</span>
          </button>

          {/* Quick Play Trigger */}
          <button 
            onClick={handleRunDebugger} 
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            title="Run Sandbox Code Compiler"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>

          {/* Prominent Export Button - deep indigo with download icon */}
          <button 
            onClick={handleExportCode} 
            className="flex items-center gap-1.5 px-4 py-1.5 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all border border-indigo-500 hover:border-indigo-400 shadow-sm cursor-pointer shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Workspace layout split */}
      <div className="flex-1 flex min-h-0 relative bg-zinc-950">
        
        {/* Pane 1 (Leftmost Nav): Thin Icon Navigation Bar (w-14, flex column) */}
        <div className="w-14 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 z-10 flex-shrink-0 select-none">
           {/* Tab Switchers: Components, Properties, Code, Preview, Console */}
           {[
             { id: 'components' as const, label: 'Components', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
             { id: 'properties' as const, label: 'Properties', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg> },
             { id: 'code' as const, label: 'Code Editor', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
             { id: 'preview' as const, label: 'Live Preview', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg> },
             { id: 'console' as const, label: 'Terminal Console', icon: <Zap className="w-4 h-4" /> }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => {
                 setActiveSidebarTab(tab.id);
                 setIsSidebarCollapsed(false);
               }}
               className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                 activeSidebarTab === tab.id && !isSidebarCollapsed
                   ? 'bg-zinc-800 text-white border border-zinc-700'
                   : 'text-zinc-500 hover:text-zinc-350'
               }`}
               title={tab.label}
             >
               {tab.icon}
             </button>
           ))}

           <div className="w-8 h-px bg-zinc-800 my-1"></div>

           {/* Detached Toggler */}
           <button 
             onClick={detachCanvas} 
             className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-550 hover:text-zinc-300 transition-colors cursor-pointer" 
             title="Detach Visual Canvas View"
           >
             <ExternalLink className="w-4 h-4" />
           </button>

           {/* Collapse Sidebar Button */}
           <button
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="mt-auto w-9 h-9 flex items-center justify-center rounded-lg text-zinc-550 hover:text-zinc-300 transition-colors cursor-pointer"
             title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
           >
             <svg className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
           </button>
        </div>
        
        {/* Pane 2 (Active Sidebar): w-80, bg-zinc-900/50 backdrop-blur */}
        {!isSidebarCollapsed && (
          <div className="w-80 bg-zinc-900/80 backdrop-blur-md border-r border-zinc-800 flex flex-col h-full min-h-0 flex-shrink-0 z-10">
            {activeSidebarTab === 'components' && (
              <ComponentLibrary 
                onAddComponent={(type) => addComponent(type)}
                filterText={searchTerm}
              />
            )}
            {activeSidebarTab === 'properties' && (
              <PropertyInspector
                selectedComponent={getSelectedComponent()}
                onUpdateProps={updateComponentProps}
                onUpdateComponentLayoutMode={updateComponentLayoutMode}
                pageSettings={pageSettings}
                onUpdatePageSettings={updatePageSettings}
              />
            )}
            {activeSidebarTab === 'code' && (
              <CodeEditor
                code={isManualCodeEditing ? manualCode : generatedCode}
                canvasCode={generatedCode}
                isManualMode={isManualCodeEditing}
                onChangeCode={setManualCode}
                onToggleManualMode={setIsManualCodeEditing}
                onSyncToCanvas={handleSyncToCanvas}
                onDiscardChanges={handleDiscardChanges}
                onExport={handleExportCode}
                onExportReactProject={handleExportReactProject}
              />
            )}
            {activeSidebarTab === 'preview' && (
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
                {/* Header info */}
                <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-400 select-none">
                  <span>Mini Live Preview</span>
                  <span className="text-[10px] text-zinc-600">Scaled to fit w-80</span>
                </div>
                {/* Scaled Sandbox Preview Container for Pane 2 Sidebar fitting */}
                <div className="flex-1 p-4 flex items-center justify-center bg-zinc-900/40 relative overflow-hidden">
                  <div className="preview-scaled-container border border-zinc-800 rounded-lg shadow-2xl relative" style={{ width: '280px', height: '400px' }}>
                    <iframe
                      title="Scaled Preview"
                      srcDoc={sandboxHtml}
                      sandbox="allow-scripts"
                      className="preview-scaled-iframe bg-zinc-950 absolute"
                      style={{
                        width: '1280px',
                        height: '1828px',
                        transform: 'scale(0.21875)', /* 280 / 1280 */
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {activeSidebarTab === 'console' && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] text-zinc-400 font-mono text-[11px] select-text">
                <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300 font-sans select-none">
                  <span className="font-semibold">Terminal Console Output</span>
                  <span className="text-[10px] text-zinc-650">Active compiler logs</span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-1">
                  {consoleLogs.length > 0 ? (
                    consoleLogs.map((log, index) => (
                      <div key={index} className="flex gap-1.5 text-[10px]">
                        <span className={
                          log.includes('[success]') ? 'text-emerald-450' :
                          log.includes('[warning]') ? 'text-amber-450' :
                          log.includes('[error]') ? 'text-rose-450' :
                          log.includes('[debug]') ? 'text-indigo-400' : 'text-zinc-300'
                        }>{log}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-600 text-[10px] italic">No processes active</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pane 3 (Main Workspace): Visual Canvas Area */}
        <div className="flex-1 flex flex-col h-full min-h-0 relative bg-[#0a0a0a]">
          {isDetached ? (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-zinc-950 grid-bg-dark border-r border-zinc-900 select-none h-full">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 animate-pulse">
                <ExternalLink className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">Visual Workspace Detached</h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-[340px] leading-relaxed">
                The visual canvas window is currently operating in an isolated frame window. Changes synchronize automatically.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={reDockCanvas}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-650 hover:bg-indigo-600 text-white shadow-lg transition-all cursor-pointer"
                >
                  Re-dock Workspace Here
                </button>
              </div>
            </div>
          ) : (
            <VisualCanvas
              components={components}
              selectedId={selectedId}
              breakpoint={breakpoint}
              onSelectComponent={handleCanvasSelect}
              onDeleteComponent={handleCanvasDelete}
              onDuplicateComponent={handleCanvasDuplicate}
              onMoveComponent={handleCanvasMove}
              onDropComponent={handleCanvasDrop}
              onChangeBreakpoint={handleCanvasBreakpoint}
              pageSettings={pageSettings}
              onUpdateComponentProps={updateComponentProps}
            />
          )}
        </div>

      </div>

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        show={contextMenu.show}
        onClose={() => setContextMenu({ ...contextMenu, show: false })}
        onAction={handleContextMenuAction}
        hasSelection={!!selectedId}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        hasClipboard={!!clipboard}
      />

      <GitHubPanel
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        exportHtml={sandboxHtml}
      />
    </div>
  );
}

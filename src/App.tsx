import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Download,
  ExternalLink,
  Layers
} from 'lucide-react';
import logoImg from './assets/DClogo.png';
import LandingPage from './components/LandingPage';
import ComponentLibrary from './components/ComponentLibrary';
import VisualCanvas from './components/VisualCanvas';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import PropertyInspector from './components/PropertyInspector';
import type { CanvasComponent, ComponentType, ComponentProps, BreakpointType, ViewType, PageSettings } from './types/canvas';
import { generateComponentHtml, generateFullHtml, parseHtmlToComponents, wrapRawHtmlInTemplate } from './utils/codeGenerator';

import ContextMenu from './components/ContextMenu';

// Check if this window is running as a detached visual canvas or live preview tab
const isCanvasMode = typeof window !== 'undefined' && window.location.search.includes('mode=canvas');
const isPreviewMode = typeof window !== 'undefined' && window.location.search.includes('mode=preview');

// Default initial values helper for newly added components
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
        bgColor: 'bg-indigo-600',
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
        bgColor: 'bg-zinc-950',
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
        bgColor: 'bg-zinc-950',
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
    default:
      return common;
  }
};

// PRESET TEMPLATES
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
    customCursorUrl: ''
  });

  // Layout Toggles
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [isCodePaneOpen, setIsCodePaneOpen] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Console state
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Manual code editing states
  const [isManualCodeEditing, setIsManualCodeEditing] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

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

  // Global Keyboard Shortcuts
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

  // Global Context Menu Right Click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't show context menu on landing page, in preview, or during manual code edit
      if (view !== 'ide' || isManualCodeEditing || isPreviewMode) return;
      
      // Also exclude text inputs/textareas from custom context menu
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

  // Sync state selectors
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

  // Add Component (Appends to target container or root list)
  const addComponent = (type: ComponentType, parentId?: string) => {
    saveHistory(componentsRef.current);
    const newComp: CanvasComponent = {
      id: `${type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: createDefaultProps(type),
      children: type === 'Grid' ? [] : undefined
    };

    if (parentId) {
      // Nest within grid container
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
      // Append to top level root list
      setComponents([...components, newComp]);
    }
    
    setSelectedId(newComp.id);
  };

  // Update properties on styling inspector changes
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

  // Update Page Settings and broadcast to other tabs
  const updatePageSettings = (newSettings: Partial<PageSettings>) => {
    if (isCanvasMode) {
      const channel = new BroadcastChannel('devcanvas-sync');
      channel.postMessage({ type: 'ACTION', payload: { action: 'PAGE_SETTINGS', arg: newSettings } });
      channel.close();
    }
    setPageSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Delete component and reset selection if target is deleted
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

  // Duplicate target component (deep clones component tree)
  const duplicateComponent = (id: string) => {
    saveHistory(componentsRef.current);
    const recursiveDuplicate = (list: CanvasComponent[]): CanvasComponent[] => {
      const result: CanvasComponent[] = [];
      for (const item of list) {
        if (item.id === id) {
          result.push(item);
          // Deep copy
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

  // Move component up or down within sibling arrays
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

  // Generate HTML for editor, full HTML for Iframe sandbox
  const generatedCode = components.map(c => generateComponentHtml(c, 0)).join('\n\n');
  const sandboxHtml = isManualCodeEditing
    ? wrapRawHtmlInTemplate(manualCode, pageSettings)
    : generateFullHtml(components, pageSettings);

  // Keep state reference up-to-date for BroadcastChannel single-event listeners
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

  // Cross-tab Synchronization using BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('devcanvas-sync');

    if (isCanvasMode) {
      // Detached canvas sends a signal that it is open and needs the initial state
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
      // Detached preview window sends a signal and waits for HTML updates
      channel.postMessage({ type: 'REQUEST_INIT_PREVIEW' });
      channel.postMessage({ type: 'PREVIEW_MOUNTED' });

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_PREVIEW_HTML') {
          // Update local document source state
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
      // Main window listens to actions from canvas tab or mounts from preview tab
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

  // Main window broadcasts changes to detached windows when state changes
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

  // Action Dispatcher for Canvas (handles both normal and detached windows)
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

  // Detach / Dock controls
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

  // Run Compiler & Debug logs
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

  // Export full standalone index.html
  const handleExportCode = () => {
    const fullHtml = generateFullHtml(components);
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

  // Sync edited manual HTML code back to canvas components data tree
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

  // Discard manual edits and reset to visual canvas components state
  const handleDiscardChanges = () => {
    const freshGenerated = components.map(c => generateComponentHtml(c, 0)).join('\n\n');
    setManualCode(freshGenerated);
    setIsManualCodeEditing(false);
    setConsoleLogs(prev => [
      ...prev,
      `[info] Discarded manual HTML code changes. Reset code view to current visual canvas state.`
    ]);
  };

  // Template select trigger
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

  // DETACHED PREVIEW MODE RENDER
  if (isPreviewMode) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col font-sans select-none">
        {/* Top Mini Header */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">DevCanvas Detached Live Preview</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Syncing sandbox active</span>
        </div>

        {/* Dynamic Iframe Container */}
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

  // DETACHED CANVAS VIEW RENDER
  if (isCanvasMode) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col font-sans">
        {/* Top Mini Header */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-semibold text-white">DevCanvas Detached Workspace</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time sync active</span>
        </div>

        {/* Visual Canvas Panel */}
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
    <div className="flex flex-col h-screen bg-[#181818] text-zinc-100 overflow-hidden font-sans">
      
      {/* SIMPLIFIED IDE HEADER (No bloated menus, activity bars, or mock window controls) */}
      <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-md select-none">
        
        {/* Left: Exit, Logo, Search */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            title="Exit to Landing Page"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Exit</span>
          </button>
          
          <div className="h-4 w-px bg-zinc-850" />
          
          <div className="flex items-center gap-2">
            <img src={logoImg} className="w-6 h-6 rounded object-contain shadow shadow-indigo-500/20" alt="DevCanvas Logo" />
            <span className="font-bold text-sm tracking-tight text-white">DevCanvas</span>
          </div>

          <div className="h-4 w-px bg-zinc-850" />

          {/* Component Explorer Search */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-400 gap-1.5 w-44 lg:w-52 hover:border-zinc-700 transition-colors">
            <svg className="w-3 h-3 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-zinc-200 focus:outline-none text-[10px] w-full placeholder-zinc-650"
            />
          </div>
        </div>

        {/* Center: Layout Toggles */}
        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 gap-0.5 text-xs text-zinc-500">
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className={`px-3 py-1 text-[11px] font-semibold rounded transition-all cursor-pointer ${isLeftSidebarOpen ? 'bg-zinc-800 text-white shadow-sm font-bold' : 'hover:text-zinc-350'}`}
            title="Toggle Component Explorer Sidebar"
          >
            Explorer
          </button>
          <button
            onClick={() => setIsCodePaneOpen(!isCodePaneOpen)}
            className={`px-3 py-1 text-[11px] font-semibold rounded transition-all cursor-pointer ${isCodePaneOpen ? 'bg-zinc-800 text-white shadow-sm font-bold' : 'hover:text-zinc-350'}`}
            title="Toggle Code & Preview Editor Panel"
          >
            Code Panel
          </button>
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`px-3 py-1 text-[11px] font-semibold rounded transition-all cursor-pointer ${isRightSidebarOpen ? 'bg-zinc-800 text-white shadow-sm font-bold' : 'hover:text-zinc-350'}`}
            title="Toggle CSS Properties Sidebar"
          >
            Inspector
          </button>
          <button
            onClick={() => {
              setIsConsoleOpen(!isConsoleOpen);
              if (!isConsoleOpen && consoleLogs.length === 0) {
                handleRunDebugger();
              }
            }}
            className={`px-3 py-1 text-[11px] font-semibold rounded transition-all cursor-pointer ${isConsoleOpen ? 'bg-zinc-800 text-white shadow-sm font-bold' : 'hover:text-zinc-350'}`}
            title="Toggle Debug Console Drawer"
          >
            Console
          </button>
        </div>

        {/* Right: Presets, Detach Canvas/Preview, Export */}
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 text-xs">
            <span className="text-zinc-550 font-semibold uppercase text-[8px] tracking-wider">Template:</span>
            <select
              value={activeTemplate}
              onChange={handleTemplateChange}
              className="bg-transparent text-zinc-300 font-medium outline-none pr-3 cursor-pointer"
            >
              <option value="portfolio">Landing Showcase</option>
              <option value="contact">Simple Contact Form</option>
              <option value="clear">Reset/Empty Canvas</option>
            </select>
          </div>

          {/* Detach Canvas */}
          {isDetached ? (
            <button
              onClick={reDockCanvas}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-all cursor-pointer"
              title="Dock Canvas Back"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Dock Canvas</span>
            </button>
          ) : (
            <button
              onClick={detachCanvas}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-350 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Detach Canvas to a new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Detach Canvas</span>
            </button>
          )}

          {/* Detach Preview */}
          {isPreviewDetached ? (
            <button
              onClick={reDockPreview}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-all cursor-pointer"
              title="Dock Preview Back"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Dock Preview</span>
            </button>
          ) : (
            <button
              onClick={detachPreview}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-350 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Detach Preview to a new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Detach Preview</span>
            </button>
          )}

          {/* Export Layout */}
          <button
            onClick={handleExportCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-500 transition-all cursor-pointer shadow-md"
            title="Download full layout as single HTML file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Workspace splits layout */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Left Component Library (collapsible) */}
        {isLeftSidebarOpen && (
          <ComponentLibrary 
            onAddComponent={(type) => addComponent(type)}
            filterText={searchTerm}
          />
        )}

        {/* Center Panel (Visual Canvas + Collapsible Console) */}
        <div className="flex-1 flex flex-col h-full min-h-0">
          
          <div className="flex-1 relative min-h-0 flex flex-col">
            {isDetached ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-950 grid-bg-dark border-r border-zinc-900 select-none">
                <div className="w-16 h-16 rounded-2xl bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center text-indigo-405 mb-6 animate-pulse">
                  <ExternalLink className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Visual Canvas is Detached</h3>
                <p className="text-xs text-zinc-400 mt-2 max-w-[340px] leading-relaxed">
                  The Visual Designer Canvas is active in a separate browser tab. Real-time updates and properties synchronization are working.
                </p>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={reDockCanvas}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    Re-dock Canvas Here
                  </button>
                  <button
                    onClick={detachCanvas}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    Refocus Detached Tab
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

          {/* Console Drawer (collapsible output block) */}
          {isConsoleOpen && (
            <div className="h-48 bg-zinc-900 border-t border-zinc-800 flex flex-col flex-shrink-0 font-mono text-[11px] text-zinc-400">
              <div className="h-8 bg-zinc-950 border-b border-zinc-900/60 px-4 flex items-center justify-between select-none">
                <span className="font-semibold text-white">Terminal Console Output</span>
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto bg-zinc-950 space-y-1 select-text">
                {consoleLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-zinc-650">[{new Date().toLocaleTimeString()}]</span>
                    <span className={
                      log.includes('[success]') ? 'text-emerald-450' :
                      log.includes('[debug]') ? 'text-indigo-400' : 'text-zinc-300'
                    }>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Split Panel (collapsible) */}
        {isCodePaneOpen && (
          <div className="w-[420px] xl:w-[480px] border-l border-zinc-850 flex flex-col h-full min-h-0 flex-shrink-0 z-10 shadow-md">
            <CodeEditor
              code={isManualCodeEditing ? manualCode : generatedCode}
              canvasCode={generatedCode}
              isManualMode={isManualCodeEditing}
              onChangeCode={setManualCode}
              onToggleManualMode={setIsManualCodeEditing}
              onSyncToCanvas={handleSyncToCanvas}
              onDiscardChanges={handleDiscardChanges}
              onExport={handleExportCode}
            />
            {isPreviewDetached ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 border-t border-zinc-850 select-none">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Live Preview Detached</h4>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
                  Rendering in a separate browser tab. Real-time visual updates are active.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={reDockPreview}
                    className="px-3 py-1 rounded text-[10px] font-bold bg-indigo-650 hover:bg-indigo-600 text-white cursor-pointer"
                  >
                    Re-dock Preview
                  </button>
                  <button
                    onClick={detachPreview}
                    className="px-3 py-1 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Refocus Tab
                  </button>
                </div>
              </div>
            ) : (
              <LivePreview fullHtml={sandboxHtml} />
            )}
          </div>
        )}

        {/* Far Right Sidebar: Style & Properties Inspector (collapsible) */}
        {isRightSidebarOpen && (
          <PropertyInspector
            selectedComponent={getSelectedComponent()}
            onUpdateProps={updateComponentProps}
            pageSettings={pageSettings}
            onUpdatePageSettings={updatePageSettings}
          />
        )}

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
    </div>
  );
}

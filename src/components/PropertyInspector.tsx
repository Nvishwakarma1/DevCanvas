import { useState } from 'react';
import { 
  Sliders, 
  Type, 
  Palette, 
  Layers, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Grid as GridIcon,
  HelpCircle,
  Eye,
  Settings,
  ShieldAlert,
  FolderOpen
} from 'lucide-react';
import type { CanvasComponent, ComponentProps, PageSettings } from '../types/canvas';
import AccordionSection from './AccordionSection';
import GlslEditor from './GlslEditor';

interface PropertyInspectorProps {
  selectedComponent: CanvasComponent | null;
  onUpdateProps: (id: string, newProps: Partial<ComponentProps>) => void;
  pageSettings: PageSettings;
  onUpdatePageSettings: (newSettings: Partial<PageSettings>) => void;
  /** Phase 1.4 — Callback to trigger layout mode change */
  onUpdateComponentLayoutMode?: (id: string, mode: 'freeform' | 'flow') => void;
}

export default function PropertyInspector({ 
  selectedComponent, 
  onUpdateProps,
  pageSettings,
  onUpdatePageSettings,
  onUpdateComponentLayoutMode
}: PropertyInspectorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');

  if (!selectedComponent) {
    return (
      <aside className="w-64 bg-[#0a0a0a] border-l border-zinc-900/50 flex flex-col h-full flex-shrink-0 select-none z-10 shadow-sm">
        <div className="p-3 border-b border-zinc-900 flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Global Settings</span>
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Canvas Page Settings
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto inspector-scroll p-4 space-y-6">
          {/* Background Engine */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-violet-400" /> Background Engine
            </label>
            <select
              value={pageSettings.bgPreset}
              onChange={(e) => onUpdatePageSettings({ bgPreset: e.target.value as any })}
              className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500"
            >
              <option value="none">Solid Stone Dark (Default)</option>
              <option value="aurora-webgl">Liquid Aurora WebGL Shader</option>
              <option value="particles">Three.js Particle Swarm</option>
              <option value="animated-gradient">Neon Fluid Gradient</option>
              <option value="mouse-trail">Mouse Orbiting Trail</option>
            </select>
            <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
              Select an interactive background renderer to run behind your layout components on the canvas and in exported code.
            </p>
            {pageSettings.bgPreset === 'aurora-webgl' && (
              <div className="space-y-3 mt-3 p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg">
                <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider block">Shader Engine Uniforms</span>
                
                {/* Texture URL */}
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase block">Texture Image URL</label>
                  <input
                    type="text"
                    value={pageSettings.webglTextureUrl || ''}
                    onChange={(e) => onUpdatePageSettings({ webglTextureUrl: e.target.value })}
                    className="w-full px-2 py-1 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:border-violet-500"
                    placeholder="https://unsplash.com/..."
                  />
                </div>

                {/* Blend Mode */}
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase block">Blend Mode (GLSL)</label>
                  <select
                    value={pageSettings.webglBlendMode || 'overlay'}
                    onChange={(e) => onUpdatePageSettings({ webglBlendMode: e.target.value as any })}
                    className="w-full px-2 py-1 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="none">None (Texture Warp Only)</option>
                    <option value="multiply">Multiply (Texture x Overlay)</option>
                    <option value="screen">Screen (Lighten Blend)</option>
                    <option value="overlay">Overlay (High Contrast Blend)</option>
                  </select>
                </div>

                {/* Gradient Colors */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-medium uppercase block">Gradient A</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={pageSettings.webglColorA || '#6366f1'}
                        onChange={(e) => onUpdatePageSettings({ webglColorA: e.target.value })}
                        className="w-6 h-6 border-0 p-0 bg-transparent cursor-pointer rounded-sm overflow-hidden"
                      />
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">{pageSettings.webglColorA || '#6366f1'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-medium uppercase block">Gradient B</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={pageSettings.webglColorB || '#ec4899'}
                        onChange={(e) => onUpdatePageSettings({ webglColorB: e.target.value })}
                        className="w-6 h-6 border-0 p-0 bg-transparent cursor-pointer rounded-sm overflow-hidden"
                      />
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">{pageSettings.webglColorB || '#ec4899'}</span>
                    </div>
                  </div>
                </div>

                {/* Displacement Strength */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 font-medium uppercase">
                    <span>Displacement</span>
                    <span className="font-mono text-violet-400">{pageSettings.webglDisplacement ?? 0.15}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={pageSettings.webglDisplacement ?? 0.15}
                    onChange={(e) => onUpdatePageSettings({ webglDisplacement: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Flow Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 font-medium uppercase">
                    <span>Flow Speed</span>
                    <span className="font-mono text-violet-400">{pageSettings.webglSpeed ?? 1.0}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={pageSettings.webglSpeed ?? 1.0}
                    onChange={(e) => onUpdatePageSettings({ webglSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Phase 2.4 — GLSL fragment shader editor */}
                <GlslEditor
                  customGlsl={pageSettings.customGlslFragment}
                  onApply={(glsl) => onUpdatePageSettings({ customGlslFragment: glsl })}
                  onReset={() => onUpdatePageSettings({ customGlslFragment: undefined })}
                />
              </div>
            )}

            {/* Custom Background Color Picker Overlay */}
            <div className="space-y-1.5 pt-2.5 border-t border-zinc-900">
              <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Custom Artboard Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={pageSettings.customBgColor || '#ffffff'}
                  onChange={(e) => onUpdatePageSettings({ customBgColor: e.target.value })}
                  className="w-8 h-8 border border-zinc-800 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={pageSettings.customBgColor || ''}
                  onChange={(e) => onUpdatePageSettings({ customBgColor: e.target.value })}
                  placeholder="e.g. #ffffff or transparent"
                  className="flex-grow px-2 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Custom Cursors */}
          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-500" /> Interactive Cursor
            </label>
            <select
              value={pageSettings.cursorPreset}
              onChange={(e) => onUpdatePageSettings({ cursorPreset: e.target.value as any })}
              className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500"
            >
              <option value="default">System Default Pointer</option>
              <option value="neon-crosshair">Neon Target Crosshair</option>
              <option value="glowing-circle">Glowing Circle Follower</option>
              <option value="custom">Custom Image Asset Url</option>
            </select>

            {pageSettings.cursorPreset === 'custom' && (
              <div className="space-y-1.5 mt-2">
                <label className="text-[9px] text-zinc-400 font-semibold uppercase">Cursor URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/cursor.png"
                  value={pageSettings.customCursorUrl}
                  onChange={(e) => onUpdatePageSettings({ customCursorUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            )}
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Define custom cursor states or interactive cursor followers that overlay the live page output.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/40 border-t border-zinc-850 text-center text-[10px] text-zinc-550 font-mono">
          Click any canvas element to edit
        </div>
      </aside>
    );
  }

  const { type, id, props, layoutMode = 'freeform' } = selectedComponent;

  const updateProp = (key: keyof ComponentProps, value: any) => {
    onUpdateProps(id, { [key]: value });
  };

  const bgColors = [
    { name: 'Transparent', value: 'bg-transparent' },
    { name: 'Slate Dark', value: 'bg-zinc-900' },
    { name: 'Slate Deep', value: 'bg-zinc-950' },
    { name: 'Slate Card', value: 'bg-zinc-900/50' },
    { name: 'Purple Accent', value: 'bg-violet-950/20' },
    { name: 'Solar Accent', value: 'bg-amber-950/20' },
    { name: 'Rose Accent', value: 'bg-rose-950/20' },
    { name: 'Purple Solid', value: 'bg-violet-600' },
    { name: 'Solar Solid', value: 'bg-amber-500' },
    { name: 'Rose Solid', value: 'bg-rose-600' },
  ];

  const textColors = [
    { name: 'White', value: 'text-white' },
    { name: 'Zinc Light', value: 'text-zinc-100' },
    { name: 'Zinc Muted', value: 'text-zinc-400' },
    { name: 'Zinc Dark', value: 'text-zinc-500' },
    { name: 'Purple', value: 'text-violet-400' },
    { name: 'Solar', value: 'text-amber-400' },
    { name: 'Rose', value: 'text-rose-400' },
  ];

  const borderColors = [
    { name: 'Muted', value: 'border-zinc-800' },
    { name: 'Active', value: 'border-zinc-700' },
    { name: 'Purple', value: 'border-violet-500' },
    { name: 'Solar', value: 'border-amber-450' },
    { name: 'Rose', value: 'border-rose-500' },
    { name: 'Transparent', value: 'border-transparent' },
  ];

  const toggleLayoutMode = () => {
    if (onUpdateComponentLayoutMode) {
      const targetMode = layoutMode === 'freeform' ? 'flow' : 'freeform';
      onUpdateComponentLayoutMode(id, targetMode);
    }
  };

  return (
    <aside className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full flex-shrink-0 z-10 shadow-sm text-xs select-none">
      {/* Component Header Badge */}
      <div className="p-4 border-b border-zinc-805 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
            Selected Component
          </span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {type}
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
          {id.slice(0, 6)}
        </span>
      </div>

      {/* Segmented Controls for Tabs */}
      <div className="p-2 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
        <div className="flex bg-zinc-950 p-1 rounded-lg gap-1 border border-zinc-850">
          {(['content', 'style', 'layout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === tab 
                  ? 'bg-zinc-800 text-white shadow-sm rounded-md border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Scroll Content */}
      <div className="flex-1 overflow-y-auto inspector-scroll p-3 space-y-3">
        {activeTab === 'content' && (
          <div className="space-y-3">
            <AccordionSection id="node_properties" title="Content Attributes" icon={<FolderOpen className="w-3 h-3" />} accentColor="violet">
              {/* Header Specific content */}
              {(type === 'Header' || type === 'Navbar' || type === 'Footer') && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">Brand Logo Text</label>
                  <input
                    type="text"
                    value={props.logoText || ''}
                    onChange={(e) => updateProp('logoText', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* General Text Title */}
              {(type === 'Card' || type === 'InputForm' || type === 'Section') && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">
                    {type === 'Section' ? 'Section Title' : type === 'InputForm' ? 'Form Title' : 'Title'}
                  </label>
                  <input
                    type="text"
                    value={type === 'Section' ? props.sectionTitle || '' : type === 'InputForm' ? props.formTitle || '' : props.title || ''}
                    onChange={(e) => updateProp(type === 'Section' ? 'sectionTitle' : type === 'InputForm' ? 'formTitle' : 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* Subtitles & Descriptions */}
              {(type === 'Card' || type === 'Section' || type === 'Footer') && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">
                    {type === 'Section' ? 'Subtitle' : 'Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={type === 'Section' ? props.subtitle || '' : props.description || ''}
                    onChange={(e) => updateProp(type === 'Section' ? 'subtitle' : 'description', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              )}

              {/* Button Action Trigger text */}
              {(type === 'Header' || type === 'Card' || type === 'Button' || type === 'InputForm' || type === 'Navbar') && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">Button Text</label>
                  <input
                    type="text"
                    value={props.buttonText || ''}
                    onChange={(e) => updateProp('buttonText', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* Card Image input url */}
              {type === 'Card' && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">Card Image URL</label>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    onChange={(e) => updateProp('imageUrl', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 text-[10px]"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              )}

              {/* Form Toggles properties */}
              {type === 'InputForm' && (
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-450 uppercase font-bold tracking-wider block">Fields Visibility</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'showNameField' as const, label: 'Include Full Name Input' },
                      { key: 'showEmailField' as const, label: 'Include Email Input' },
                      { key: 'showMessageField' as const, label: 'Include Custom Message Area' },
                    ].map(f => (
                      <label key={f.key} className="flex items-center gap-2 text-zinc-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!props[f.key]}
                          onChange={(e) => updateProp(f.key, e.target.checked)}
                          className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Badge properties */}
              {type === 'Card' && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">Badge Indicator</label>
                  <input
                    type="text"
                    value={props.badgeText || ''}
                    onChange={(e) => updateProp('badgeText', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500"
                    placeholder="New / Featured"
                  />
                </div>
              )}

              {/* Footer copyright */}
              {type === 'Footer' && (
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-medium uppercase">Copyright Label</label>
                  <input
                    type="text"
                    value={props.copyrightText || ''}
                    onChange={(e) => updateProp('copyrightText', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* ThreeD model settings content options */}
              {type === 'ThreeDAsset' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-semibold uppercase">3D GLTF/GLB Asset URL</label>
                    <input
                      type="text"
                      value={props.modelUrl || ''}
                      onChange={(e) => updateProp('modelUrl', e.target.value)}
                      className="w-full px-2 py-1 text-[10px] bg-zinc-950 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:border-violet-500 font-mono"
                      placeholder="e.g. https://path/to/model.glb"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-zinc-400 font-semibold uppercase">
                      <span>Model Scale</span>
                      <span className="text-violet-400 font-mono">{props.modelScale ?? 1.5}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={props.modelScale ?? 1.5}
                      onChange={(e) => updateProp('modelScale', parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!props.modelAutoRotate}
                        onChange={(e) => updateProp('modelAutoRotate', e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      Enable Auto Orbit Rotation
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!props.modelInteractive}
                        onChange={(e) => updateProp('modelInteractive', e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      Mouse Orbit Controls Enable
                    </label>
                  </div>

                  {/* Phase 2.1 — Interactive 3D Model Logic Bindings */}
                  <div className="space-y-2 pt-3 border-t border-zinc-900">
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">Interactive 3D Bindings</span>
                    <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!props.model3DBindings?.scrollToRotateY}
                        onChange={(e) => updateProp('model3DBindings', { ...props.model3DBindings, scrollToRotateY: e.target.checked })}
                        className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      Scroll to Rotate Y
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!props.model3DBindings?.mouseToRotateX}
                        onChange={(e) => updateProp('model3DBindings', { ...props.model3DBindings, mouseToRotateX: e.target.checked })}
                        className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      Mouse Coordinate to Rotate X
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!props.model3DBindings?.mouseToScale}
                        onChange={(e) => updateProp('model3DBindings', { ...props.model3DBindings, mouseToScale: e.target.checked })}
                        className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      Mouse Distance to Dynamic Scale
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!props.model3DBindings?.scrollToPositionZ}
                        onChange={(e) => updateProp('model3DBindings', { ...props.model3DBindings, scrollToPositionZ: e.target.checked })}
                        className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      Scroll to Translate Z
                    </label>
                  </div>
                </div>
              )}
            </AccordionSection>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-3">
            {/* Phase 1.4 — Fluid Layout modes selector */}
            <AccordionSection id="style_layout_mode" title="Layout Sizing Engine" icon={<Sliders className="w-3 h-3" />} accentColor="violet">
              <div className="space-y-2">
                <div className="flex bg-zinc-950 border border-zinc-800/80 rounded p-0.5">
                  <button
                    onClick={toggleLayoutMode}
                    className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      layoutMode === 'freeform'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Absolute Freeform
                  </button>
                  <button
                    onClick={toggleLayoutMode}
                    className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      layoutMode === 'flow'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Relative Document Flow
                  </button>
                </div>
                <p className="text-[9px] text-zinc-500 leading-normal">
                  {layoutMode === 'freeform' 
                    ? 'Uses exact left/top coordinate pixel offsets. Best for custom overlay panels.'
                    : 'Locks element into the relative HTML document stack. Allows automatic flex vertical layout placement.'}
                </p>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-semibold uppercase">Width</label>
                  <input
                    type="text"
                    value={props.width || ''}
                    onChange={(e) => updateProp('width', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    placeholder="e.g. 100% / 320px"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-semibold uppercase">Height</label>
                  <input
                    type="text"
                    value={props.height || ''}
                    onChange={(e) => updateProp('height', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    placeholder="e.g. auto / 250px"
                  />
                </div>
              </div>

              {/* Precise coordinates (hidden if flow mode) */}
              {layoutMode === 'freeform' && (
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-900">
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-500 font-semibold uppercase">Left offset (X)</label>
                    <input
                      type="number"
                      value={props.left ?? 100}
                      onChange={(e) => updateProp('left', parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-500 font-semibold uppercase">Top offset (Y)</label>
                    <input
                      type="number"
                      value={props.top ?? 120}
                      onChange={(e) => updateProp('top', parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-500 font-semibold uppercase">Rotation</label>
                    <input
                      type="number"
                      value={props.rotation ?? 0}
                      onChange={(e) => updateProp('rotation', parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </AccordionSection>

            {/* Colors Swatches */}
            <AccordionSection id="style_colors" title="Themes & Color Swatches" icon={<Palette className="w-3 h-3" />} accentColor="violet">
              {/* Background Color */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider block">Background Color</span>
                <div className="grid grid-cols-5 gap-1">
                  {bgColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateProp('bgColor', color.value)}
                      className={`h-5 rounded border cursor-pointer ${color.value} ${
                        props.bgColor === color.value 
                          ? 'border-violet-500 ring-1 ring-violet-500/50' 
                          : 'border-zinc-850 hover:border-zinc-500'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                <span className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider block">Text Color</span>
                <div className="grid grid-cols-7 gap-1">
                  {textColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateProp('textColor', color.value)}
                      className={`h-5 rounded border cursor-pointer flex items-center justify-center bg-zinc-950 ${color.value} ${
                        props.textColor === color.value 
                          ? 'border-violet-500 ring-1 ring-violet-500/50' 
                          : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                      title={color.name}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Color */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                <span className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider block">Border Color</span>
                <div className="grid grid-cols-6 gap-1">
                  {borderColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateProp('borderColor', color.value)}
                      className={`h-5 rounded border cursor-pointer bg-zinc-900/60 ${color.value} ${
                        props.borderColor === color.value 
                          ? 'border-violet-500 ring-1 ring-violet-500/50' 
                          : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </AccordionSection>

            {/* Typography */}
            {type !== 'ThreeDAsset' && (
              <AccordionSection id="style_typography" title="Typography & Fonts" icon={<Type className="w-3 h-3" />} accentColor="violet">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Text Size</label>
                    <select
                      value={props.textSize}
                      onChange={(e) => updateProp('textSize', e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                    >
                      <option value="text-xs">Extra Small</option>
                      <option value="text-sm">Small</option>
                      <option value="text-base">Regular Base</option>
                      <option value="text-lg">Large</option>
                      <option value="text-xl">Extra Large</option>
                      <option value="text-2xl">2X Large</option>
                      <option value="text-3xl">3X Large</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Font Weight</label>
                    <select
                      value={props.fontWeight}
                      onChange={(e) => updateProp('fontWeight', e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                    >
                      <option value="font-normal">Normal Regular</option>
                      <option value="font-semibold">Semi Bold</option>
                      <option value="font-bold">Bold Weight</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Align Text</label>
                    <div className="flex bg-zinc-950 border border-zinc-850 rounded p-0.5">
                      {[
                        { val: 'text-left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                        { val: 'text-center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
                        { val: 'text-right', icon: <AlignRight className="w-3.5 h-3.5" /> },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => updateProp('textAlign', item.val)}
                          className={`flex-1 py-1 rounded flex justify-center cursor-pointer ${
                            props.textAlign === item.val ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Line Height</label>
                    <select
                      value={props.lineHeight || 'leading-normal'}
                      onChange={(e) => updateProp('lineHeight', e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                    >
                      <option value="leading-none">None</option>
                      <option value="leading-tight">Tight</option>
                      <option value="leading-normal">Normal</option>
                      <option value="leading-relaxed">Relaxed</option>
                      <option value="leading-loose">Loose</option>
                    </select>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* Borders & Shadows */}
            <AccordionSection id="style_borders" title="Borders & Shadow Effect" icon={<Layers className="w-3 h-3" />} accentColor="violet">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Border Radius</label>
                  <select
                    value={props.borderRadius}
                    onChange={(e) => updateProp('borderRadius', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="rounded-none">None (Sharp)</option>
                    <option value="rounded-sm">Rounded Small</option>
                    <option value="rounded-md">Rounded Medium</option>
                    <option value="rounded-lg">Rounded Large</option>
                    <option value="rounded-xl">Rounded XL</option>
                    <option value="rounded-2xl">Rounded 2XL</option>
                    <option value="rounded-full">Fully Circular</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Border Width</label>
                  <select
                    value={props.borderWidth}
                    onChange={(e) => updateProp('borderWidth', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="border-0">No Border</option>
                    <option value="border">Thin (1px)</option>
                    <option value="border-2">Thick (2px)</option>
                    <option value="border-4">Extra Thick (4px)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-1.5 border-t border-zinc-900">
                <label className="text-[9px] text-zinc-500 font-semibold uppercase">Drop Shadow Preset</label>
                <select
                  value={props.shadow}
                  onChange={(e) => updateProp('shadow', e.target.value)}
                  className="w-full px-3 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                >
                  <option value="shadow-none">No Drop Shadow</option>
                  <option value="shadow-sm">Small Shadow</option>
                  <option value="shadow">Medium Shadow</option>
                  <option value="shadow-md">Large Shadow</option>
                  <option value="shadow-lg">Extra Large Shadow</option>
                  <option value="shadow-2xl">Full Heavy Glow Shadow</option>
                </select>
              </div>
            </AccordionSection>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-3">
            {/* Padding & Margin */}
            <AccordionSection id="layout_spacing" title="Padding & Margin Spacing" icon={<Sliders className="w-3 h-3" />} accentColor="violet">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Padding Horizontal</label>
                  <select
                    value={props.paddingX}
                    onChange={(e) => updateProp('paddingX', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="px-0">px-0 (None)</option>
                    <option value="px-2">px-2 (8px)</option>
                    <option value="px-4">px-4 (16px)</option>
                    <option value="px-6">px-6 (24px)</option>
                    <option value="px-8">px-8 (32px)</option>
                    <option value="px-12">px-12 (48px)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Padding Vertical</label>
                  <select
                    value={props.paddingY}
                    onChange={(e) => updateProp('paddingY', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="py-0">py-0 (None)</option>
                    <option value="py-2">py-2 (8px)</option>
                    <option value="py-4">py-4 (16px)</option>
                    <option value="py-6">py-6 (24px)</option>
                    <option value="py-8">py-8 (32px)</option>
                    <option value="py-12">py-12 (48px)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Margin Horizontal</label>
                  <select
                    value={props.marginX}
                    onChange={(e) => updateProp('marginX', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="mx-0">mx-0 (None)</option>
                    <option value="mx-2">mx-2 (8px)</option>
                    <option value="mx-4">mx-4 (16px)</option>
                    <option value="mx-6">mx-6 (24px)</option>
                    <option value="mx-8">mx-8 (32px)</option>
                    <option value="mx-auto">mx-auto (Centered)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Margin Vertical</label>
                  <select
                    value={props.marginY}
                    onChange={(e) => updateProp('marginY', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="my-0">my-0 (None)</option>
                    <option value="my-2">my-2 (8px)</option>
                    <option value="my-4">my-4 (16px)</option>
                    <option value="my-6">my-6 (24px)</option>
                    <option value="my-8">my-8 (32px)</option>
                  </select>
                </div>
              </div>
            </AccordionSection>

            {/* Grid settings */}
            {type === 'Grid' && (
              <AccordionSection id="layout_grid_cols" title="Grid Multi-Column Settings" icon={<GridIcon className="w-3 h-3" />} accentColor="violet">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Columns (Desktop)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={props.columns || 3}
                      onChange={(e) => updateProp('columns', parseInt(e.target.value) || 3)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={props.rows || 1}
                      onChange={(e) => updateProp('rows', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-1.5 border-t border-zinc-900">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Layout Gap Spacing</label>
                  <select
                    value={props.gap || 'gap-6'}
                    onChange={(e) => updateProp('gap', e.target.value)}
                    className="w-full px-3 py-1 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                  >
                    <option value="gap-0">gap-0 (None)</option>
                    <option value="gap-2">gap-2 (8px)</option>
                    <option value="gap-4">gap-4 (16px)</option>
                    <option value="gap-6">gap-6 (24px)</option>
                    <option value="gap-8">gap-8 (32px)</option>
                    <option value="gap-12">gap-12 (48px)</option>
                  </select>
                </div>
              </AccordionSection>
            )}

            {/* Flexbox options */}
            {type !== 'ThreeDAsset' && (
              <AccordionSection id="layout_flexbox" title="Flexbox Container Auto Flow" icon={<Layers className="w-3 h-3" />} accentColor="violet">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-550 font-semibold uppercase block">Flow Direction</label>
                    <div className="flex bg-zinc-950 border border-zinc-850 rounded p-0.5">
                      {[
                        { val: 'flex-row', label: 'Row (Horizontal)' },
                        { val: 'flex-col', label: 'Col (Vertical)' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => updateProp('flexDirection', item.val)}
                          className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                            props.flexDirection === item.val ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {item.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-zinc-900">
                    <label className="text-[9px] text-zinc-550 font-semibold uppercase">Justify Items Alignment</label>
                    <select
                      value={props.justifyContent || 'justify-start'}
                      onChange={(e) => updateProp('justifyContent', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                    >
                      <option value="justify-start">start (Left)</option>
                      <option value="justify-end">end (Right)</option>
                      <option value="justify-center">center (Middle)</option>
                      <option value="justify-between">between (Spaced)</option>
                      <option value="justify-around">around (Evenly Spaced)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-550 font-semibold uppercase">Cross Axis alignment</label>
                    <select
                      value={props.alignItems || 'items-center'}
                      onChange={(e) => updateProp('alignItems', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none"
                    >
                      <option value="items-start">start (Top)</option>
                      <option value="items-end">end (Bottom)</option>
                      <option value="items-center">center (Centered)</option>
                      <option value="items-stretch">stretch (Full Width)</option>
                    </select>
                  </div>
                </div>
              </AccordionSection>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-950 border-t border-zinc-900 text-center text-[10px] text-zinc-650 font-mono">
        Active Node ID: {id}
      </div>
    </aside>
  );
}

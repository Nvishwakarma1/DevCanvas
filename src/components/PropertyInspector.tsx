import { useState } from 'react';
import { 
  Sliders, 
  Type, 
  Palette, 
  Layers, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Grid
} from 'lucide-react';
import type { CanvasComponent, ComponentProps } from '../types/canvas';

interface PropertyInspectorProps {
  selectedComponent: CanvasComponent | null;
  onUpdateProps: (id: string, newProps: Partial<ComponentProps>) => void;
}

export default function PropertyInspector({ selectedComponent, onUpdateProps }: PropertyInspectorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');

  if (!selectedComponent) {
    return (
      <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col items-center justify-center p-6 text-center select-none flex-shrink-0">
        <Sliders className="w-12 h-12 text-zinc-700 mb-4 animate-float" />
        <h3 className="text-sm font-semibold text-zinc-400">No Component Selected</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
          Click any component on the visual canvas to edit its properties, spacing, and styles.
        </p>
      </aside>
    );
  }

  const { type, id, props } = selectedComponent;

  const updateProp = (key: keyof ComponentProps, value: any) => {
    onUpdateProps(id, { [key]: value });
  };

  // Color theme swatch list
  const bgColors = [
    { name: 'Transparent', value: 'bg-transparent' },
    { name: 'Slate Dark', value: 'bg-zinc-900' },
    { name: 'Slate Deep', value: 'bg-zinc-950' },
    { name: 'Slate Card', value: 'bg-zinc-900/50' },
    { name: 'Indigo Accent', value: 'bg-indigo-950/20' },
    { name: 'Emerald Accent', value: 'bg-emerald-950/20' },
    { name: 'Rose Accent', value: 'bg-rose-950/20' },
    { name: 'Indigo solid', value: 'bg-indigo-600' },
    { name: 'Emerald solid', value: 'bg-emerald-600' },
    { name: 'Rose solid', value: 'bg-rose-600' },
  ];

  const textColors = [
    { name: 'White', value: 'text-white' },
    { name: 'Zinc Light', value: 'text-zinc-100' },
    { name: 'Zinc Muted', value: 'text-zinc-400' },
    { name: 'Zinc Dark', value: 'text-zinc-500' },
    { name: 'Indigo', value: 'text-indigo-400' },
    { name: 'Emerald', value: 'text-emerald-400' },
    { name: 'Rose', value: 'text-rose-400' },
  ];

  const borderColors = [
    { name: 'Muted', value: 'border-zinc-800' },
    { name: 'Active', value: 'border-zinc-700' },
    { name: 'Indigo', value: 'border-indigo-500' },
    { name: 'Emerald', value: 'border-emerald-500' },
    { name: 'Rose', value: 'border-rose-500' },
    { name: 'Transparent', value: 'border-transparent' },
  ];

  return (
    <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full flex-shrink-0">
      {/* Component Header Badge */}
      <div className="p-4 border-b border-zinc-855 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            Selected Node
          </span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {type} Container
          </span>
        </div>
        <span className="text-[9px] text-zinc-500 font-mono">
          ID: {id.slice(0, 6)}
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-zinc-900/50 border-b border-zinc-855 px-1.5 py-1.5 gap-1 flex-shrink-0 select-none">
        {(['content', 'style', 'layout'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* ================= TAB 1: CONTENT ================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Header Content Fields */}
            {type === 'Header' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Logo Brand Text</label>
                  <input
                    type="text"
                    value={props.logoText || ''}
                    onChange={(e) => updateProp('logoText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Button CTA Text</label>
                  <input
                    type="text"
                    value={props.buttonText || ''}
                    onChange={(e) => updateProp('buttonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Navigation Links</label>
                  {(props.links || ['Home', 'Features', 'Pricing', 'Contact']).map((link, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...(props.links || ['Home', 'Features', 'Pricing', 'Contact'])];
                        newLinks[idx] = e.target.value;
                        updateProp('links', newLinks);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                    />
                  ))}
                </div>
              </>
            )}

            {/* Card Content Fields */}
            {type === 'Card' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Card Title</label>
                  <input
                    type="text"
                    value={props.title || ''}
                    onChange={(e) => updateProp('title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Badge Tag</label>
                  <input
                    type="text"
                    value={props.badgeText || ''}
                    onChange={(e) => updateProp('badgeText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Leave empty to hide"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Image Source URL</label>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    onChange={(e) => updateProp('imageUrl', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Description Text</label>
                  <textarea
                    rows={4}
                    value={props.description || ''}
                    onChange={(e) => updateProp('description', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Button CTA Text</label>
                  <input
                    type="text"
                    value={props.buttonText || ''}
                    onChange={(e) => updateProp('buttonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            {/* Button Content Fields */}
            {type === 'Button' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Button Display Text</label>
                  <input
                    type="text"
                    value={props.buttonText || ''}
                    onChange={(e) => updateProp('buttonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Button Preset Style</label>
                  <select
                    value={props.buttonVariant || 'solid'}
                    onChange={(e) => updateProp('buttonVariant', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="solid">Indigo Filled (Primary)</option>
                    <option value="outline">Outline Border (Secondary)</option>
                    <option value="ghost">Ghost Translucent (Tertiary)</option>
                  </select>
                </div>
              </>
            )}

            {/* Input Form Content Fields */}
            {type === 'InputForm' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Form Title</label>
                  <input
                    type="text"
                    value={props.formTitle || ''}
                    onChange={(e) => updateProp('formTitle', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Submit Button Text</label>
                  <input
                    type="text"
                    value={props.buttonText || ''}
                    onChange={(e) => updateProp('buttonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2 border-t border-zinc-800 pt-3 mt-3">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Enable Fields</label>
                  
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!props.showNameField}
                      onChange={(e) => updateProp('showNameField', e.target.checked)}
                      className="rounded border-zinc-800 text-indigo-600 focus:ring-indigo-500 bg-zinc-950"
                    />
                    <span>Full Name Input</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!props.showEmailField}
                      onChange={(e) => updateProp('showEmailField', e.target.checked)}
                      className="rounded border-zinc-800 text-indigo-600 focus:ring-indigo-500 bg-zinc-950"
                    />
                    <span>Email Address Input</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!props.showMessageField}
                      onChange={(e) => updateProp('showMessageField', e.target.checked)}
                      className="rounded border-zinc-800 text-indigo-600 focus:ring-indigo-500 bg-zinc-950"
                    />
                    <span>Message Textarea</span>
                  </label>
                </div>
              </>
            )}

            {/* Grid layout settings can fit here or in Layout Tab */}
            {type === 'Grid' && (
              <div className="p-3 bg-zinc-950 rounded border border-zinc-850 flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">GRID LAYOUT NOTE</span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Grids contain sub-components. Switch to the <strong>Layout Tab</strong> to change columns, or the <strong>Style Tab</strong> to adjust colors/border shapes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: STYLE ================= */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            
            {/* Background Color Swatches */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-zinc-500" /> Background Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {bgColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateProp('bgColor', color.value)}
                    className={`h-7 rounded border relative transition-all cursor-pointer ${
                      color.value === 'bg-transparent' ? 'border-dashed border-zinc-700 bg-zinc-950' : color.value
                    } ${
                      props.bgColor === color.value 
                        ? 'ring-2 ring-indigo-500 border-white' 
                        : 'border-zinc-800 hover:border-zinc-650'
                    }`}
                    title={color.name}
                  >
                    {color.value === 'bg-transparent' && (
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-zinc-600">Ø</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Colors */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Border Color</label>
              <div className="grid grid-cols-6 gap-2">
                {borderColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateProp('borderColor', color.value)}
                    className={`h-7 rounded border relative transition-all cursor-pointer ${
                      color.value === 'border-transparent' ? 'border-dashed border-zinc-700 bg-zinc-950' : 'bg-zinc-800'
                    } ${
                      props.borderColor === color.value 
                        ? 'ring-2 ring-indigo-500 border-white' 
                        : 'border-zinc-800 hover:border-zinc-650'
                    }`}
                    title={color.name}
                  >
                    <span className={`absolute inset-0.5 rounded-sm border ${color.value}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Section (only if not Grid) */}
            {type !== 'Grid' && (
              <div className="space-y-4 border-t border-zinc-800 pt-3">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-zinc-500" /> Typography
                </label>

                {/* Text Size */}
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Text Size</label>
                  <select
                    value={props.textSize}
                    onChange={(e) => updateProp('textSize', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="text-xs">Extra Small (12px)</option>
                    <option value="text-sm">Small (14px)</option>
                    <option value="text-base">Base (16px)</option>
                    <option value="text-lg">Large (18px)</option>
                    <option value="text-xl">Extra Large (20px)</option>
                    <option value="text-2xl">2X Large (24px)</option>
                    <option value="text-3xl">3X Large (30px)</option>
                  </select>
                </div>

                {/* Text Alignment & Weights */}
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Alignment</label>
                    <div className="flex bg-zinc-950 border border-zinc-800 p-0.5 rounded gap-0.5">
                      {[
                        { val: 'text-left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                        { val: 'text-center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
                        { val: 'text-right', icon: <AlignRight className="w-3.5 h-3.5" /> }
                      ].map((align) => (
                        <button
                          key={align.val}
                          onClick={() => updateProp('textAlign', align.val)}
                          className={`flex-1 py-1 flex items-center justify-center rounded transition-all cursor-pointer ${
                            props.textAlign === align.val ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                          }`}
                        >
                          {align.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase">Weight</label>
                    <div className="flex bg-zinc-950 border border-zinc-800 p-0.5 rounded gap-0.5">
                      {[
                        { val: 'font-normal', label: 'N' },
                        { val: 'font-semibold', label: 'SB' },
                        { val: 'font-bold', label: 'B' }
                      ].map((weight) => (
                        <button
                          key={weight.val}
                          onClick={() => updateProp('fontWeight', weight.val)}
                          className={`flex-1 py-1 text-[10px] font-bold flex items-center justify-center rounded transition-all cursor-pointer ${
                            props.fontWeight === weight.val ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                          }`}
                        >
                          {weight.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-500 font-semibold uppercase">Text Color</label>
                  <div className="grid grid-cols-7 gap-1">
                    {textColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateProp('textColor', color.value)}
                        className={`h-6 rounded border flex items-center justify-center text-[10px] font-bold cursor-pointer bg-zinc-950 ${
                          props.textColor === color.value 
                            ? 'border-indigo-500 text-white' 
                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                        title={color.name}
                      >
                        <span className={color.value}>A</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Border Details Section */}
            <div className="space-y-4 border-t border-zinc-800 pt-3">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" /> Border & Shadows
              </label>

              {/* Border Width */}
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-semibold uppercase">Border Width</label>
                <select
                  value={props.borderWidth}
                  onChange={(e) => updateProp('borderWidth', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="border-0">None (0px)</option>
                  <option value="border">Thin (1px)</option>
                  <option value="border-2">Medium (2px)</option>
                  <option value="border-4">Thick (4px)</option>
                </select>
              </div>

              {/* Rounded Corners */}
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-semibold uppercase">Rounded Corners</label>
                <select
                  value={props.borderRadius}
                  onChange={(e) => updateProp('borderRadius', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="rounded-none">Square (0px)</option>
                  <option value="rounded-sm">Rounded SM (2px)</option>
                  <option value="rounded">Rounded MD (4px)</option>
                  <option value="rounded-md">Rounded LG (6px)</option>
                  <option value="rounded-lg">Rounded XL (8px)</option>
                  <option value="rounded-xl">Rounded 2XL (12px)</option>
                  <option value="rounded-2xl">Rounded 3XL (16px)</option>
                  <option value="rounded-full">Circle/Pill</option>
                </select>
              </div>

              {/* Shadow depth */}
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-semibold uppercase">Shadow Depth</label>
                <select
                  value={props.shadow}
                  onChange={(e) => updateProp('shadow', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="shadow-none">No Shadow</option>
                  <option value="shadow-sm">Small Shadow</option>
                  <option value="shadow">Medium Shadow</option>
                  <option value="shadow-md">Large Shadow</option>
                  <option value="shadow-lg">X-Large Shadow</option>
                  <option value="shadow-2xl">Glow Depth (2XL)</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: LAYOUT ================= */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            
            {/* Component Paddings */}
            <div className="space-y-4">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" /> Padding (Inner Space)
              </label>

              {/* Padding Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-zinc-500 font-semibold uppercase">
                  <span>Vertical Padding</span>
                  <span className="font-mono text-indigo-400">{props.paddingY}</span>
                </div>
                <select
                  value={props.paddingY}
                  onChange={(e) => updateProp('paddingY', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="py-0">None (0px)</option>
                  <option value="py-1">Extra Compact (4px)</option>
                  <option value="py-2">Compact (8px)</option>
                  <option value="py-3">Small (12px)</option>
                  <option value="py-4">Standard (16px)</option>
                  <option value="py-6">Medium (24px)</option>
                  <option value="py-8">Relaxed (32px)</option>
                  <option value="py-12">Large (48px)</option>
                  <option value="py-16">Extra Large (64px)</option>
                </select>
              </div>

              {/* Padding X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-zinc-500 font-semibold uppercase">
                  <span>Horizontal Padding</span>
                  <span className="font-mono text-indigo-400">{props.paddingX}</span>
                </div>
                <select
                  value={props.paddingX}
                  onChange={(e) => updateProp('paddingX', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="px-0">None (0px)</option>
                  <option value="px-2">Compact (8px)</option>
                  <option value="px-4">Standard (16px)</option>
                  <option value="px-6">Medium (24px)</option>
                  <option value="px-8">Relaxed (32px)</option>
                  <option value="px-12">Large (48px)</option>
                  <option value="px-16">Extra Large (64px)</option>
                </select>
              </div>
            </div>

            {/* Component Margins */}
            <div className="space-y-4 border-t border-zinc-800 pt-3">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" /> Margin (Outer Space)
              </label>

              {/* Margin Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-zinc-500 font-semibold uppercase">
                  <span>Vertical Margin</span>
                  <span className="font-mono text-indigo-400">{props.marginY}</span>
                </div>
                <select
                  value={props.marginY}
                  onChange={(e) => updateProp('marginY', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="my-0">None (0px)</option>
                  <option value="my-2">Compact (8px)</option>
                  <option value="my-4">Standard (16px)</option>
                  <option value="my-6">Medium (24px)</option>
                  <option value="my-8">Relaxed (32px)</option>
                  <option value="my-12">Large (48px)</option>
                </select>
              </div>

              {/* Margin X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-zinc-500 font-semibold uppercase">
                  <span>Horizontal Margin</span>
                  <span className="font-mono text-indigo-400">{props.marginX}</span>
                </div>
                <select
                  value={props.marginX}
                  onChange={(e) => updateProp('marginX', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="mx-0">None (0px)</option>
                  <option value="mx-2">Small (8px)</option>
                  <option value="mx-4">Medium (16px)</option>
                  <option value="mx-auto">Auto (Center Element)</option>
                </select>
              </div>
            </div>

            {/* Grid Columns Setting */}
            {type === 'Grid' && (
              <div className="space-y-3 border-t border-zinc-800 pt-3">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5 text-zinc-500" /> Grid Columns
                </label>
                
                <div className="flex bg-zinc-950 border border-zinc-800 p-0.5 rounded gap-0.5">
                  {[1, 2, 3, 4].map((col) => (
                    <button
                      key={col}
                      onClick={() => updateProp('columns', col)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                        props.columns === col ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      {col} Col{col > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

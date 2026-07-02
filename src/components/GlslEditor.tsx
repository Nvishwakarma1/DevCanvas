import { useState, useRef } from 'react';
import { Code2, RotateCcw, Play, AlertTriangle } from 'lucide-react';
import { auroraFragmentShader } from '../webgl/shaders/auroraShader';

interface GlslEditorProps {
  customGlsl?: string;
  onApply: (glsl: string) => void;
  onReset: () => void;
}

// Basic GLSL syntax highlighter
function highlightGlsl(code: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const keywords = ['void', 'float', 'vec2', 'vec3', 'vec4', 'int', 'bool', 'sampler2D', 'mat2', 'mat3', 'mat4',
    'uniform', 'varying', 'attribute', 'in', 'out', 'return', 'if', 'else', 'for', 'while', 'break', 'continue',
    'precision', 'highp', 'mediump', 'lowp'];
  const builtins = ['gl_FragColor', 'gl_Position', 'gl_FragCoord', 'texture2D', 'mix', 'clamp', 'step', 'smoothstep',
    'length', 'dot', 'cross', 'normalize', 'reflect', 'refract', 'sin', 'cos', 'tan', 'atan', 'pow', 'exp', 'log',
    'sqrt', 'abs', 'floor', 'ceil', 'fract', 'mod', 'min', 'max', 'sign', 'radians', 'degrees', 'vUv', 'vPosition'];

  const lines = code.split('\n');
  return lines.map(line => {
    // Comment
    if (line.trimStart().startsWith('//')) {
      return `<span style="color:#71717a">${esc(line)}</span>`;
    }

    let result = esc(line);

    // Numbers
    result = result.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f59e0b">$1</span>');

    // Builtins
    builtins.forEach(b => {
      result = result.replace(new RegExp(`\\b${b}\\b`, 'g'), `<span style="color:#34d399">${b}</span>`);
    });

    // Keywords
    keywords.forEach(k => {
      result = result.replace(new RegExp(`\\b${k}\\b`, 'g'), `<span style="color:#c084fc">${k}</span>`);
    });

    // Preprocessor
    result = result.replace(/(#\w+)/g, '<span style="color:#fb923c">$1</span>');

    return result;
  }).join('\n');
}

export default function GlslEditor({ customGlsl, onApply, onReset }: GlslEditorProps) {
  const [code, setCode] = useState(customGlsl || auroraFragmentShader);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isModified = code !== auroraFragmentShader;

  const handleApply = () => {
    setError(null);
    // Basic GLSL validation: check for void main()
    if (!code.includes('void main()') && !code.includes('void main ()')) {
      setError('Error: Fragment shader must contain a "void main()" function.');
      return;
    }
    if (!code.includes('gl_FragColor')) {
      setError('Warning: Shader does not set gl_FragColor — output may be transparent.');
    }
    onApply(code);
  };

  const handleReset = () => {
    setCode(auroraFragmentShader);
    setError(null);
    onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      setCode(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  const highlighted = highlightGlsl(code);

  return (
    <div className="space-y-2 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(e => !e)}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-400 uppercase tracking-wider hover:text-violet-300 transition-colors cursor-pointer"
        >
          <Code2 className="w-3 h-3" />
          GLSL Shader Editor
          <span className="text-[9px] text-zinc-600 normal-case font-normal ml-1">{isExpanded ? '▲ collapse' : '▼ expand'}</span>
        </button>
        {isModified && (
          <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            modified
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <p className="text-[9px] text-zinc-500 leading-relaxed">
            Write a custom GLSL fragment shader. Available uniforms: <code className="text-violet-400">u_time, u_mouse, u_scroll, u_resolution, u_texture, u_overlayColorA, u_overlayColorB, u_displacement, u_speed, u_blendMode</code>
          </p>

          {/* Editor area */}
          <div className="relative rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 font-mono text-[10px] leading-5">
            {/* Syntax highlight layer */}
            <pre
              className="absolute inset-0 p-2 pointer-events-none overflow-auto whitespace-pre select-none"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            {/* Editable textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="relative z-10 w-full h-56 p-2 bg-transparent text-transparent caret-violet-400 focus:outline-none resize-none overflow-auto whitespace-pre selection:bg-violet-600/30"
              style={{ caretColor: '#c084fc' }}
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-1.5 p-2 bg-rose-950/30 border border-rose-800/40 rounded text-[10px] text-rose-400">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer flex-1 justify-center"
            >
              <Play className="w-3 h-3" />
              Apply Shader
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

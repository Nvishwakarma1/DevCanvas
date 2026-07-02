import JSZip from 'jszip';
import type { CanvasComponent, PageSettings, ComponentType } from '../types/canvas';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toComponentName = (type: ComponentType): string => type; // Already PascalCase

function generatePropsInterface(type: ComponentType): string {
  switch (type) {
    case 'Header':
    case 'Navbar':
      return `interface ${type}Props {
  logoText?: string;
  links?: string[];
  buttonText?: string;
}`;
    case 'Card':
      return `interface CardProps {
  title?: string;
  description?: string;
  badgeText?: string;
  imageUrl?: string;
  buttonText?: string;
}`;
    case 'Button':
      return `interface ButtonProps {
  text?: string;
  variant?: 'solid' | 'outline' | 'ghost';
}`;
    case 'InputForm':
      return `interface InputFormProps {
  formTitle?: string;
  buttonText?: string;
  showNameField?: boolean;
  showEmailField?: boolean;
  showMessageField?: boolean;
}`;
    case 'Section':
      return `interface SectionProps {
  sectionTitle?: string;
  subtitle?: string;
}`;
    case 'Footer':
      return `interface FooterProps {
  logoText?: string;
  description?: string;
  copyrightText?: string;
  links?: string[];
}`;
    case 'Grid':
      return `interface GridProps {
  columns?: number;
  gap?: string;
  children?: React.ReactNode;
}`;
    default:
      return `interface ${type}Props {}`;
  }
}

function generateComponentTsx(type: ComponentType): string {
  const propsInterface = generatePropsInterface(type);
  const name = toComponentName(type);

  switch (type) {
    case 'Header':
      return `import React from 'react';

${propsInterface}

export default function Header({ logoText = 'DevCanvas', links = ['Features', 'Pricing', 'Contact'], buttonText = 'Get Started' }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
      <div className="font-bold text-xl tracking-tight text-white">{logoText}</div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        {links.map((link, i) => (
          <a key={i} href="#" className="hover:text-white transition-colors">{link}</a>
        ))}
      </nav>
      <a href="#" className="px-4 py-2 text-sm font-semibold rounded-md bg-violet-600 text-white hover:bg-violet-500 transition-colors">
        {buttonText}
      </a>
    </header>
  );
}
`;
    case 'Card':
      return `import React from 'react';

${propsInterface}

export default function Card({ title = 'Feature Card', description = 'Describe your feature here.', badgeText, imageUrl, buttonText }: CardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-md">
      {imageUrl && <img className="w-full h-48 object-cover" src={imageUrl} alt={title} />}
      <div className="p-5 flex flex-col flex-1">
        {badgeText && (
          <span className="self-start px-2.5 py-0.5 rounded text-xs font-semibold bg-violet-500/10 text-violet-400 mb-3">{badgeText}</span>
        )}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed flex-1">{description}</p>
        {buttonText && (
          <button className="mt-4 w-full py-2 text-sm font-semibold rounded-md bg-violet-600 text-white hover:bg-violet-500 transition-colors">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
`;
    case 'Button':
      return `import React from 'react';

${propsInterface}

export default function Button({ text = 'Click Here', variant = 'solid' }: ButtonProps) {
  const cls = variant === 'outline'
    ? 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
    : variant === 'ghost'
    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    : 'bg-violet-600 text-white hover:bg-violet-500';

  return (
    <button className={\`px-5 py-2.5 rounded-md font-semibold text-sm transition-colors \${cls}\`}>
      {text}
    </button>
  );
}
`;
    case 'InputForm':
      return `import React from 'react';

${propsInterface}

export default function InputForm({ formTitle = 'Contact Us', buttonText = 'Submit', showNameField = true, showEmailField = true, showMessageField = false }: InputFormProps) {
  return (
    <form className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
      <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3">{formTitle}</h3>
      {showNameField && (
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
          <input type="text" placeholder="John Doe" className="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
        </div>
      )}
      {showEmailField && (
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
          <input type="email" placeholder="you@example.com" className="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
        </div>
      )}
      {showMessageField && (
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Message</label>
          <textarea rows={3} placeholder="Your message..." className="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none" />
        </div>
      )}
      <button type="submit" className="w-full py-2.5 text-sm font-semibold rounded-md bg-violet-600 text-white hover:bg-violet-500 transition-colors mt-1">
        {buttonText}
      </button>
    </form>
  );
}
`;
    case 'Section':
      return `import React from 'react';

${propsInterface}

export default function Section({ sectionTitle = 'Section Title', subtitle = 'Add a descriptive subtitle here.' }: SectionProps) {
  return (
    <section className="py-16 px-8 flex flex-col items-center justify-center text-center bg-zinc-900">
      <h2 className="text-3xl font-bold text-white mb-4">{sectionTitle}</h2>
      <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">{subtitle}</p>
    </section>
  );
}
`;
    case 'Navbar':
      return `import React from 'react';

${propsInterface}

export default function Navbar({ logoText = 'BrandLogo', links = ['Home', 'About', 'Services', 'Contact'], buttonText }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
      <div className="font-bold text-xl tracking-tight text-white">{logoText}</div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        {links.map((link, i) => (
          <a key={i} href="#" className="hover:text-white transition-colors">{link}</a>
        ))}
      </div>
      {buttonText && (
        <button className="px-4 py-2 text-sm font-semibold rounded-md bg-white text-zinc-950 hover:bg-zinc-100 transition-colors">
          {buttonText}
        </button>
      )}
    </nav>
  );
}
`;
    case 'Footer':
      return `import React from 'react';

${propsInterface}

export default function Footer({ logoText = 'BrandLogo', description = 'Building amazing experiences on the web.', copyrightText, links = ['Privacy Policy', 'Terms', 'Contact'] }: FooterProps) {
  return (
    <footer className="py-12 px-8 bg-zinc-950 border-t border-zinc-800 flex flex-col items-center text-center gap-6">
      <div className="font-bold text-2xl tracking-tight text-white">{logoText}</div>
      <p className="text-zinc-400 text-sm max-w-md leading-relaxed">{description}</p>
      <div className="flex items-center gap-6 text-xs font-medium text-zinc-500">
        {links.map((link, i) => (
          <a key={i} href="#" className="hover:text-zinc-300 transition-colors underline-offset-4 hover:underline">{link}</a>
        ))}
      </div>
      {copyrightText && <p className="text-xs text-zinc-600 mt-2">{copyrightText}</p>}
    </footer>
  );
}
`;
    case 'Grid':
      return `import React from 'react';

${propsInterface}

export default function Grid({ columns = 3, gap = 'gap-6', children }: GridProps) {
  return (
    <div className={\`grid grid-cols-1 md:grid-cols-\${columns} \${gap} w-full\`}>
      {children}
    </div>
  );
}
`;
    default:
      return `import React from 'react';\n\nexport default function ${name}() {\n  return <div className="p-4">// ${name} Component</div>;\n}\n`;
  }
}

function buildAppTsx(components: CanvasComponent[]): string {
  const usedTypes = [...new Set(components.map(c => c.type).filter(t => t !== 'ThreeDAsset'))];
  const imports = usedTypes.map(t => `import ${t} from './components/${t}';`).join('\n');

  const renderComponents = (comps: CanvasComponent[], indent = '      '): string =>
    comps.map(c => {
      if (c.type === 'ThreeDAsset') return `${indent}{/* 3D Asset - install @react-three/fiber and @react-three/drei */}`;
      const p = c.props;
      const propsStr = buildPropsStr(c);
      if (c.type === 'Grid' && c.children?.length) {
        const childrenJsx = renderComponents(c.children, indent + '  ');
        return `${indent}<Grid columns={${p.columns || 3}} gap="${p.gap || 'gap-6'}">\n${childrenJsx}\n${indent}</Grid>`;
      }
      return `${indent}<${c.type} ${propsStr}/>`;
    }).join('\n');

  return `import React from 'react';
${imports}
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative font-sans">
      {/* Components */}
${renderComponents(components)}
    </div>
  );
}
`;
}

function buildPropsStr(c: CanvasComponent): string {
  const p = c.props;
  const parts: string[] = [];
  if (p.logoText) parts.push(`logoText="${p.logoText}"`);
  if (p.title) parts.push(`title="${p.title}"`);
  if (p.description) parts.push(`description="${p.description}"`);
  if (p.buttonText) parts.push(`buttonText="${p.buttonText}"`);
  if (p.formTitle) parts.push(`formTitle="${p.formTitle}"`);
  if (p.sectionTitle) parts.push(`sectionTitle="${p.sectionTitle}"`);
  if (p.subtitle) parts.push(`subtitle="${p.subtitle}"`);
  if (p.badgeText) parts.push(`badgeText="${p.badgeText}"`);
  if (p.imageUrl) parts.push(`imageUrl="${p.imageUrl}"`);
  if (p.copyrightText) parts.push(`copyrightText="${p.copyrightText}"`);
  if (p.showNameField !== undefined) parts.push(`showNameField={${p.showNameField}}`);
  if (p.showEmailField !== undefined) parts.push(`showEmailField={${p.showEmailField}}`);
  if (p.showMessageField !== undefined) parts.push(`showMessageField={${p.showMessageField}}`);
  if (p.links?.length) parts.push(`links={${JSON.stringify(p.links)}}`);
  return parts.join(' ');
}

// ─── Main Export Function ─────────────────────────────────────────────────────

export async function generateReactProject(
  components: CanvasComponent[],
  _pageSettings?: PageSettings
): Promise<void> {
  const zip = new JSZip();

  // package.json
  zip.file('package.json', JSON.stringify({
    name: 'devcanvas-project',
    version: '0.1.0',
    author: 'VoxelVolt',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -b && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0'
    },
    devDependencies: {
      '@vitejs/plugin-react': '^6.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      tailwindcss: '^4.0.0',
      '@tailwindcss/vite': '^4.0.0',
      vite: '^8.0.0',
      typescript: '^6.0.0'
    }
  }, null, 2));

  // vite.config.ts
  zip.file('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`);

  // tsconfig.json
  zip.file('tsconfig.json', JSON.stringify({
    files: [],
    references: [{ path: './tsconfig.app.json' }]
  }, null, 2));

  zip.file('tsconfig.app.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true
    },
    include: ['src']
  }, null, 2));

  // index.html
  zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevCanvas Export — VoxelVolt</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  // src/main.tsx
  zip.file('src/main.tsx', `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`);

  // src/index.css
  zip.file('src/index.css', `@import "tailwindcss";

@layer base {
  body {
    background-color: #09090b;
    color: #f4f4f5;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}
`);

  // src/App.tsx
  zip.file('src/App.tsx', buildAppTsx(components));

  // Generate unique component files
  const usedTypes = [...new Set(components.flatMap(c => {
    const types: ComponentType[] = [c.type];
    if (c.children) c.children.forEach(ch => types.push(ch.type));
    return types;
  }))].filter(t => t !== 'ThreeDAsset');

  for (const type of usedTypes) {
    zip.file(`src/components/${type}.tsx`, generateComponentTsx(type));
  }

  // README.md
  zip.file('README.md', `# DevCanvas Export — VoxelVolt

Generated by **DevCanvas Studio**.

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

## Structure

- \`src/App.tsx\` — Main app entry with your canvas layout
- \`src/components/\` — Individual UI components
- Styled with Tailwind CSS v4

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
`);

  // Generate and download zip
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'devcanvas-react-project.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

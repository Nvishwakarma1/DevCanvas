import type { CanvasComponent } from '../types/canvas';

export function generateComponentHtml(component: CanvasComponent, indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);
  const p = component.props;

  // Build spacing & design styles
  const spacingClasses = [
    p.paddingX,
    p.paddingY,
    p.marginX,
    p.marginY,
  ].filter(Boolean).join(' ');

  const designClasses = [
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

  const allStyleClasses = `${spacingClasses} ${designClasses}`.trim().replace(/\s+/g, ' ');

  switch (component.type) {
    case 'Header': {
      const linksHtml = (p.links || ['Home', 'Features', 'Pricing', 'Contact']).map(link => 
        `<a href="#" class="hover:text-indigo-400 transition-colors">${link}</a>`
      ).join(`\n${indent}    `);

      return `${indent}<header class="${allStyleClasses} flex items-center justify-between w-full">
${indent}  <div class="font-bold text-xl tracking-tight">${p.logoText || 'DevCanvas'}</div>
${indent}  <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
${indent}    ${linksHtml}
${indent}  </nav>
${indent}  <a href="#" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
${indent}    ${p.buttonText || 'Get Started'}
${indent}  </a>
${indent}</header>`;
    }

    case 'Card': {
      const badgeHtml = p.badgeText ? `\n${indent}    <span class="self-start inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 mb-3">${p.badgeText}</span>` : '';
      const imgHtml = p.imageUrl ? `\n${indent}    <img class="w-full h-48 object-cover rounded-lg mb-4" src="${p.imageUrl}" alt="${p.title || 'Card Image'}">` : '';
      const btnHtml = p.buttonText ? `\n${indent}    <button class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors mt-auto">${p.buttonText}</button>` : '';

      return `${indent}<div class="${allStyleClasses} max-w-sm overflow-hidden flex flex-col h-full">
${indent}  <div class="flex flex-col">${imgHtml}${badgeHtml}
${indent}    <h3 class="text-xl font-bold mb-2">${p.title || 'Amazing Product'}</h3>
${indent}    <p class="text-zinc-400 text-sm mb-4 leading-relaxed">${p.description || 'Provide detailed descriptions of your feature or product here. Customize styles to fit your aesthetic.'}</p>
${indent}  </div>${btnHtml}
${indent}</div>`;
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

      return `${indent}<button class="inline-flex items-center justify-center px-5 py-2.5 font-medium transition-colors ${allStyleClasses} ${isCustomBg ? '' : bgStyle}">
${indent}  ${p.buttonText || 'Click Here'}
${indent}</button>`;
    }

    case 'InputForm': {
      const nameField = p.showNameField ? `\n${indent}    <div>
${indent}      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
${indent}      <input type="text" placeholder="John Doe" class="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
${indent}    </div>` : '';
      const emailField = p.showEmailField ? `\n${indent}    <div>
${indent}      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
${indent}      <input type="email" placeholder="john@example.com" class="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
${indent}    </div>` : '';
      const messageField = p.showMessageField ? `\n${indent}    <div>
${indent}      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Message</label>
${indent}      <textarea rows="3" placeholder="Tell us how we can help..." class="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
${indent}    </div>` : '';

      return `${indent}<form class="${allStyleClasses} w-full max-w-md flex flex-col gap-4" onsubmit="event.preventDefault()">
${indent}  <h3 class="text-lg font-bold border-b border-zinc-800 pb-2 mb-2">${p.formTitle || 'Subscribe Now'}</h3>${nameField}${emailField}${messageField}
${indent}  <button type="submit" class="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors mt-2">
${indent}    ${p.buttonText || 'Submit Form'}
${indent}  </button>
${indent}</form>`;
    }

    case 'Grid': {
      const colClass = `grid-cols-1 md:grid-cols-${p.columns || 3}`;
      const gapClass = p.gap || 'gap-6';
      
      const childrenHtml = (component.children || []).map(child => 
        generateComponentHtml(child, indentLevel + 1)
      ).join('\n');

      return `${indent}<div class="grid ${colClass} ${gapClass} ${allStyleClasses} w-full">
${childrenHtml}
${indent}</div>`;
    }

    default:
      return '';
  }
}

export function generateFullHtml(components: CanvasComponent[]): string {
  const bodyHtml = components.map(c => generateComponentHtml(c, 2)).join('\n\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevCanvas Generated App</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0c0a09; /* stone-950 */
    }
  </style>
</head>
<body class="text-zinc-100 min-h-screen p-8 flex flex-col items-center gap-8 justify-start">
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function highlightTagContent(content: string): string {
  const match = content.match(/^(\/?[\w-]+)/);
  if (!match) return escapeHtml(content);
  
  const tagName = match[1];
  const rest = content.slice(tagName.length);
  let result = `<span class="editor-tag">${escapeHtml(tagName)}</span>`;
  
  const attrRegex = /(\s+)([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let lastIndex = 0;
  let attrMatch;
  
  while ((attrMatch = attrRegex.exec(rest)) !== null) {
    const precedingWhitespace = attrMatch[1];
    const attrName = attrMatch[2];
    const attrVal = attrMatch[3] !== undefined ? attrMatch[3] : attrMatch[4];
    
    result += escapeHtml(rest.slice(lastIndex, attrMatch.index));
    
    result += precedingWhitespace;
    result += `<span class="editor-attr">${escapeHtml(attrName)}</span>`;
    result += '=';
    result += `<span class="editor-val">&quot;${escapeHtml(attrVal)}&quot;</span>`;
    
    lastIndex = attrRegex.lastIndex;
  }
  
  result += escapeHtml(rest.slice(lastIndex));
  return result;
}

export function highlightHtml(html: string): string {
  let idx = 0;
  let output = '';
  
  while (idx < html.length) {
    const char = html[idx];
    
    if (html.slice(idx, idx + 4) === '<!--') {
      const endIdx = html.indexOf('-->', idx);
      if (endIdx !== -1) {
        const comment = html.slice(idx, endIdx + 3);
        output += `<span class="editor-comm">${escapeHtml(comment)}</span>`;
        idx = endIdx + 3;
        continue;
      }
    }
    
    if (char === '<') {
      output += '<span class="editor-tag">&lt;</span>';
      idx++;
      let tagContent = '';
      while (idx < html.length && html[idx] !== '>') {
        tagContent += html[idx];
        idx++;
      }
      
      output += highlightTagContent(tagContent);
      
      if (idx < html.length && html[idx] === '>') {
        output += '<span class="editor-tag">&gt;</span>';
        idx++;
      }
      continue;
    }
    
    output += escapeHtml(char);
    idx++;
  }
  
  return output;
}

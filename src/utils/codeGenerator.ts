import type { CanvasComponent, PageSettings } from '../types/canvas';

export function generateComponentHtml(component: CanvasComponent, indentLevel = 0, isAbsolute = true): string {
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
    p.lineHeight,
  ].filter(Boolean).join(' ');

  // Add Flexbox styling classes
  const flexClasses = [
    p.flexDirection || 'flex-col',
    p.justifyContent || 'justify-start',
    p.alignItems || 'items-center',
    p.gap || 'gap-6'
  ].filter(Boolean).join(' ');

  const allStyleClasses = `${spacingClasses} ${designClasses} ${flexClasses}`.trim().replace(/\s+/g, ' ');

  // Absolute or Flow positioning box inline style properties
  const positionStyles = isAbsolute ? [
    `position: absolute;`,
    p.top !== undefined ? `top: ${p.top}px;` : `top: 120px;`,
    p.left !== undefined ? `left: ${p.left}px;` : `left: 100px;`,
    p.width ? `width: ${p.width};` : `width: 320px;`,
    p.height ? `height: ${p.height};` : `height: auto;`,
    p.rotation ? `transform: rotate(${p.rotation}deg);` : '',
  ].filter(Boolean).join(' ') : [
    p.width ? `width: ${p.width};` : '',
    p.height ? `height: ${p.height};` : '',
    p.rotation ? `transform: rotate(${p.rotation}deg);` : '',
  ].filter(Boolean).join(' ');

  const inlineStyleAttr = positionStyles ? ` style="${positionStyles}"` : '';

  switch (component.type) {
    case 'Header': {
      const linksHtml = (p.links || ['Home', 'Features', 'Pricing', 'Contact']).map(link => 
        `<a href="#" class="hover:text-violet-400 transition-colors">${link}</a>`
      ).join(`\n${indent}    `);

      return `${indent}<header class="${allStyleClasses} flex items-center justify-between w-full"${inlineStyleAttr}>
${indent}  <div class="font-bold text-xl tracking-tight">${p.logoText || 'DevCanvas'}</div>
${indent}  <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
${indent}    ${linksHtml}
${indent}  </nav>
${indent}  <a href="#" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-violet-650 text-white hover:bg-violet-750 transition-colors">
${indent}    ${p.buttonText || 'Get Started'}
${indent}  </a>
${indent}</header>`;
    }

    case 'Card': {
      const badgeHtml = p.badgeText ? `\n${indent}    <span class="self-start inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-violet-500/10 text-violet-400 mb-3">${p.badgeText}</span>` : '';
      const imgHtml = p.imageUrl ? `\n${indent}    <img class="w-full h-48 object-cover rounded-lg mb-4" src="${p.imageUrl}" alt="${p.title || 'Card Image'}">` : '';
      const btnHtml = p.buttonText ? `\n${indent}    <button class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors mt-auto">${p.buttonText}</button>` : '';

      return `${indent}<div class="${allStyleClasses} max-w-sm overflow-hidden flex flex-col h-full"${inlineStyleAttr}>
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
        variantClasses = 'bg-violet-600 hover:bg-violet-700 text-white';
      }
      
      const isCustomBg = p.bgColor && p.bgColor !== 'bg-transparent';
      const bgStyle = isCustomBg ? p.bgColor : variantClasses;

      return `${indent}<button class="inline-flex items-center justify-center px-5 py-2.5 font-medium transition-colors ${allStyleClasses} ${isCustomBg ? '' : bgStyle}"${inlineStyleAttr}>
${indent}  ${p.buttonText || 'Click Here'}
${indent}</button>`;
    }

    case 'InputForm': {
      const nameField = p.showNameField ? `\n${indent}    <div>
${indent}      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
${indent}      <input type="text" placeholder="John Doe" class="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
${indent}    </div>` : '';
      const emailField = p.showEmailField ? `\n${indent}    <div>
${indent}      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
${indent}      <input type="email" placeholder="john@example.com" class="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
${indent}    </div>` : '';
      const messageField = p.showMessageField ? `\n${indent}    <div>
${indent}      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Message</label>
${indent}      <textarea rows="3" placeholder="Tell us how we can help..." class="w-full px-3 py-2 text-sm rounded border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-1 focus:ring-violet-500"></textarea>
${indent}    </div>` : '';

      return `${indent}<form class="${allStyleClasses} w-full max-w-md flex flex-col gap-4" onsubmit="event.preventDefault()"${inlineStyleAttr}>
${indent}  <h3 class="text-lg font-bold border-b border-zinc-800 pb-2 mb-2">${p.formTitle || 'Subscribe Now'}</h3>${nameField}${emailField}${messageField}
${indent}  <button type="submit" class="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded bg-violet-650 text-white hover:bg-violet-750 transition-colors mt-2">
${indent}    ${p.buttonText || 'Submit Form'}
${indent}  </button>
${indent}</form>`;
    }

    case 'Grid': {
      const colClass = `grid-cols-1 md:grid-cols-${p.columns || 3}`;
      const rowClass = p.rows && p.rows > 1 ? `grid-rows-${p.rows}` : '';
      const gapClass = p.gap || 'gap-6';
      
      const childrenHtml = (component.children || []).map(child => 
        generateComponentHtml(child, indentLevel + 1, false)
      ).join('\n');

      return `${indent}<div class="grid ${colClass} ${rowClass} ${gapClass} ${allStyleClasses} w-full"${inlineStyleAttr}>
${childrenHtml}
${indent}</div>`;
    }

    case 'Section': {
      return `${indent}<section class="${allStyleClasses} flex flex-col items-center justify-center w-full text-center"${inlineStyleAttr}>
${indent}  <h2 class="text-3xl font-bold mb-4">${p.sectionTitle || 'Section Title'}</h2>
${indent}  <p class="text-sm max-w-2xl mx-auto opacity-80">${p.subtitle || 'Subtitle text goes here.'}</p>
${indent}</section>`;
    }

    case 'Navbar': {
      const linksHtml = (p.links || ['Home', 'About', 'Services', 'Contact']).map(link => 
        `<a href="#" class="hover:opacity-75 transition-opacity">${link}</a>`
      ).join(`\n${indent}    `);

      const btnHtml = p.buttonText ? `\n${indent}  <button class="px-4 py-2 text-sm font-semibold rounded bg-white text-zinc-950 hover:bg-zinc-200 transition-all">${p.buttonText}</button>` : '';

      return `${indent}<nav class="${allStyleClasses} flex items-center justify-between w-full"${inlineStyleAttr}>
${indent}  <div class="font-bold text-xl tracking-tight">${p.logoText || 'BrandLogo'}</div>
${indent}  <div class="hidden md:flex items-center gap-6 text-sm font-medium">
${indent}    ${linksHtml}
${indent}  </div>${btnHtml}
${indent}</nav>`;
    }

    case 'Footer': {
      const linksHtml = (p.links || ['Privacy Policy', 'Terms of Service', 'Contact Us']).map(link => 
        `<a href="#" class="hover:opacity-75 transition-opacity underline-offset-4 hover:underline">${link}</a>`
      ).join(`\n${indent}    `);

      return `${indent}<footer class="${allStyleClasses} flex flex-col items-center justify-center w-full text-center gap-6"${inlineStyleAttr}>
${indent}  <div class="font-bold text-2xl tracking-tight">${p.logoText || 'BrandLogo'}</div>
${indent}  <p class="text-sm opacity-80 max-w-md mx-auto">${p.description || 'Building amazing experiences on the web.'}</p>
${indent}  <div class="flex items-center justify-center gap-4 text-xs font-medium w-full">
${indent}    ${linksHtml}
${indent}  </div>
${indent}  <div class="text-xs opacity-50 mt-4">${p.copyrightText || '© 2026 DevCanvas. All rights reserved.'}</div>
${indent}</footer>`;
    }

    case 'ThreeDAsset': {
      const url = p.modelUrl || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Embedded/Duck.gltf';
      const scale = p.modelScale || 1.5;
      const autoRotate = p.modelAutoRotate ? 'true' : 'false';
      const interactive = p.modelInteractive ? 'true' : 'false';

      return `${indent}<div class="threed-container bg-zinc-950/20 rounded-xl overflow-hidden shadow-lg border border-zinc-800"${inlineStyleAttr}
${indent}  data-url="${url}"
${indent}  data-scale="${scale}"
${indent}  data-autorotate="${autoRotate}"
${indent}  data-interactive="${interactive}">
${indent}</div>`;
    }

    case 'Container': {
      const childrenHtml = (component.children || []).map(child => 
        generateComponentHtml(child, indentLevel + 1, false)
      ).join('\n');
      return `${indent}<div class="${allStyleClasses} w-full min-h-[100px]"${inlineStyleAttr}>\n${childrenHtml}\n${indent}</div>`;
    }

    case 'Breaker': {
      return `${indent}<div class="w-full flex items-center justify-center py-2">\n${indent}  <div class="w-full ${allStyleClasses}"${inlineStyleAttr}></div>\n${indent}</div>`;
    }

    default:
      return '';
  }
}

export function wrapRawHtmlInTemplate(bodyHtml: string, pageSettings?: PageSettings): string {
  const bgPreset = pageSettings?.bgPreset || 'none';
  const cursorPreset = pageSettings?.cursorPreset || 'default';
  const customCursorUrl = pageSettings?.customCursorUrl || '';

  const hasThreeD = bodyHtml.includes('data-url=') || bodyHtml.includes('threed-container');

  // CDNs required for standalone three rendering
  const threeScripts = hasThreeD ? `
  <!-- Three.js + GLTFLoader CDN for standalone 3D graphics -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>` : '';

  // Background Mesh gradient CSS
  const animatedBgStyle = bgPreset === 'animated-gradient' ? `
    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.15); }
    }
    .mesh-blob-1 {
      position: fixed; top: -10%; left: -10%; width: 70vw; height: 70vh;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
      filter: blur(100px); z-index: -10; pointer-events: none;
      animation: pulse 9s infinite alternate;
    }
    .mesh-blob-2 {
      position: fixed; bottom: -10%; right: -10%; width: 70vw; height: 75vh;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
      filter: blur(100px); z-index: -10; pointer-events: none;
      animation: pulse 11s infinite alternate 2s;
    }
    .mesh-blob-3 {
      position: fixed; top: 35%; left: 35%; width: 50vw; height: 50vh;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%);
      filter: blur(90px); z-index: -10; pointer-events: none;
      animation: pulse 13s infinite alternate 4s;
    }
  ` : '';

  // Standalone custom cursors CSS
  const cursorStyle = (cursorPreset === 'neon-crosshair' || cursorPreset === 'glowing-circle')
    ? '    body { cursor: none; }\n'
    : cursorPreset === 'custom' && customCursorUrl
    ? `    body { cursor: url(${customCursorUrl}) 16 16, auto; }\n`
    : '';

  const artboardBg = pageSettings?.customBgColor || '#0c0a09';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevCanvas Standalone Design</title>
  
  <!-- Tailwind CSS v4 CDN -->
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  
  <!-- Custom Design System Tokens config -->
  <style type="text/tailwindcss">
    @theme {
      --color-zinc-955: #0a0a0a;
      --color-zinc-950: #0a0a0a;
      --color-indigo-500: #6366f1;
    }
  </style>

  <!-- Google Fonts Connection -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- FontAwesome for fallback icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: ${artboardBg};
      color: white;
      overflow-x: hidden;
      margin: 0;
      min-height: 100vh;
    }
${animatedBgStyle}
${cursorStyle}
  </style>${threeScripts}
</head>
<body class="min-h-screen relative">

  <!-- Background Layer -->
  ${bgPreset === 'animated-gradient' ? `
  <div class="mesh-blob-1"></div>
  <div class="mesh-blob-2"></div>
  <div class="mesh-blob-3"></div>
  ` : ''}

  <!-- Canvas elements container -->
  <div id="devcanvas-root" class="relative w-full h-screen p-8">
${bodyHtml}
  </div>

  <script>
    // ==========================================
    // 3D GLTF Asset Standalone WebGL Viewers
    // ==========================================
    document.querySelectorAll('.threed-container').forEach(container => {
      const url = container.dataset.url;
      const scale = parseFloat(container.dataset.scale) || 1.0;
      const autoRotate = container.dataset.autorotate === 'true';
      const interactive = container.dataset.interactive === 'true';

      if (!url) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.z = 2.5;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 8, 5);
      scene.add(dirLight);
      const point = new THREE.PointLight(0xffffff, 0.5);
      point.position.set(-5, -5, -5);
      scene.add(point);

      let model;
      const loader = new THREE.GLTFLoader();
      loader.load(url, (gltf) => {
        model = gltf.scene;
        
        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        model.scale.set(scale, scale, scale);
        scene.add(model);
      }, undefined, (err) => {
        console.error("Three.js standalone loader error:", err);
        const errTag = document.createElement('div');
        errTag.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#09090b;color:#f43f5e;font-family:sans-serif;font-size:11px;text-align:center;padding:12px;';
        errTag.innerHTML = '⚠️ Failed to render 3D model';
        container.appendChild(errTag);
      });

      let controls;
      if (interactive) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.enablePan = true;
      }

      const animate = () => {
        requestAnimationFrame(animate);
        if (autoRotate && model) {
          model.rotation.y += 0.008;
        }
        if (controls) controls.update();
        renderer.render(scene, camera);
      };
      animate();

      new ResizeObserver(() => {
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }).observe(container);
    });

    // ==========================================
    // Interactive Background Engine Script
    // ==========================================
    const bgPreset = "${bgPreset}";
    if (bgPreset === "particles") {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-10;pointer-events:none;background:#0c0a09;';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;

      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });

      const mouse = { x: -1000, y: -1000 };
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });

      class Particle {
        constructor() {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.vx = (Math.random() - 0.5) * 0.8;
          this.vy = (Math.random() - 0.5) * 0.8;
          this.radius = Math.random() * 2 + 1;
          this.color = 'rgba(99, 102, 241, ' + (Math.random() * 0.18 + 0.12) + ')';
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > w) this.vx *= -1;
          if (this.y < 0 || this.y > h) this.vy *= -1;

          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 3.5;
            this.y -= Math.sin(angle) * force * 3.5;
          }
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      const list = [];
      const count = Math.min(100, Math.floor((w * h) / 10000));
      for (let i = 0; i < count; i++) list.push(new Particle());

      const frame = () => {
        ctx.clearRect(0, 0, w, h);
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const dist = Math.sqrt(Math.pow(list[i].x - list[j].x, 2) + Math.pow(list[i].y - list[j].y, 2));
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(list[i].x, list[i].y);
              ctx.lineTo(list[j].x, list[j].y);
              ctx.stroke();
            }
          }
        }

        list.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(frame);
      };
      frame();
    } else if (bgPreset === "mouse-trail") {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-10;pointer-events:none;background:#0c0a09;';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;
      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });

      class Spark {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          const a = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 0.5;
          this.vx = Math.cos(a) * speed;
          this.vy = Math.sin(a) * speed;
          this.size = Math.random() * 3 + 1;
          const colors = ['rgba(99, 102, 241, ', 'rgba(16, 185, 129, ', 'rgba(244, 63, 94, '];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.life = 0;
          this.maxLife = Math.random() * 40 + 20;
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += 0.02;
          this.life++;
        }
        draw() {
          const op = Math.max(0, 1 - this.life / this.maxLife);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color + op + ')';
          ctx.fill();
        }
      }

      const sparks = [];
      window.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 3; i++) {
          sparks.push(new Spark(e.clientX, e.clientY));
        }
      });

      const frame = () => {
        ctx.clearRect(0, 0, w, h);
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.update();
          s.draw();
          if (s.life >= s.maxLife) sparks.splice(i, 1);
        }
        requestAnimationFrame(frame);
      };
      frame();
    }

    // ==========================================
    // Interactive Cursor Customization Script
    // ==========================================
    const cursorPreset = "${cursorPreset}";
    const customCursorUrl = "${customCursorUrl}";
    if (cursorPreset !== "default") {
      if (cursorPreset !== "custom") {
        const customCursor = document.createElement('div');
        customCursor.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);';
        document.body.appendChild(customCursor);

        if (cursorPreset === "glowing-circle") {
          customCursor.style.cssText += 'width:24px;height:24px;border-radius:50%;border:1.5px solid #6366f1;background:rgba(99,102,241,0.2);filter:blur(0.5px);transition:transform 0.075s ease-out;';
        } else if (cursorPreset === "neon-crosshair") {
          customCursor.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="animation:spin 5s linear infinite;"><circle cx="12" cy="12" r="8" stroke-dasharray="4 2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.5" fill="#10b981"/></svg>';
          
          const sTag = document.createElement('style');
          sTag.textContent = '@keyframes spin { 100% { transform: rotate(360deg); } }';
          document.head.appendChild(sTag);
        }

        window.addEventListener('mousemove', (e) => {
          customCursor.style.left = e.clientX + 'px';
          customCursor.style.top = e.clientY + 'px';
        });
      }
    }
  </script>
</body>
</html>`;
}

export function generateFullHtml(components: CanvasComponent[], pageSettings?: PageSettings): string {
  const bodyContent = components.map(c => generateComponentHtml(c, 2)).join('\n');
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevCanvas Export</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    
    <style type="text/tailwindcss">
        @theme {
            --color-zinc-955: #0a0a0a;
            --color-zinc-950: #0a0a0a;
            --color-indigo-500: #6366f1;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0a0a0a;
            color: #f4f4f5;
            min-height: 100vh;
            margin: 0;
            overflow-x: hidden;
        }
    </style>
</head>
<body class="antialiased bg-zinc-955 text-zinc-100">
    <div id="devcanvas-root" class="w-full h-full min-h-screen">
        ${bodyContent}
    </div>
</body>
</html>`;

  return fullHtml;
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

export function parseHtmlToComponents(html: string): CanvasComponent[] {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const root = doc.body;
  const components: CanvasComponent[] = [];

  const detectType = (el: Element): any | null => {
    const tagName = el.tagName;
    const classes = el.getAttribute('class') || '';
    if (tagName === 'SECTION') return 'Section';
    if (tagName === 'NAV') return 'Navbar';
    if (tagName === 'FOOTER') return 'Footer';
    if (tagName === 'HEADER' || el.querySelector('header') || (classes.includes('flex') && el.querySelector('nav'))) return 'Header';
    if (tagName === 'FORM' || (classes.includes('max-w-md') && el.querySelector('input'))) return 'InputForm';
    if (classes.includes('grid')) return 'Grid';
    if (classes.includes('threed-container') || el.querySelector('.threed-container')) return 'ThreeDAsset';
    if (classes.includes('max-w-sm') && el.querySelector('img')) return 'Card';
    if (tagName === 'BUTTON' || classes.includes('inline-flex')) return 'Button';
    return null;
  };

  const parseProps = (el: Element, type: string): any => {
    const style = el.getAttribute('style') || '';
    const topMatch = style.match(/top:\s*(\d+)px/);
    const leftMatch = style.match(/left:\s*(\d+)px/);
    const widthMatch = style.match(/width:\s*([^;]+)/);
    const heightMatch = style.match(/height:\s*([^;]+)/);
    const rotationMatch = style.match(/rotate\((\d+)deg\)/);

    const classes = el.getAttribute('class') || '';
    const paddingYMatch = classes.match(/(py-\d+|py-0)/);
    const paddingXMatch = classes.match(/(px-\d+|px-0)/);
    const marginYMatch = classes.match(/(my-\d+|my-0)/);
    const marginXMatch = classes.match(/(mx-\d+|mx-0|mx-auto)/);
    const textSizeMatch = classes.match(/(text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl)/);
    const textColorMatch = classes.match(/(text-\w+-\d+|text-white|text-black|text-transparent)/);
    const fontWeightMatch = classes.match(/(font-normal|font-semibold|font-bold)/);
    const textAlignMatch = classes.match(/(text-left|text-center|text-right)/);
    const bgColorMatch = classes.match(/(bg-\w+-\d+|bg-transparent|bg-white|bg-black)/);
    const borderRadiusMatch = classes.match(/(rounded-none|rounded-sm|rounded-md|rounded-lg|rounded-xl|rounded-2xl|rounded-full|rounded)/);
    const borderWidthMatch = classes.match(/(border-0|border-2|border-4|border)/);
    const borderColorMatch = classes.match(/(border-\w+-\d+|border-transparent)/);
    const shadowMatch = classes.match(/(shadow-none|shadow-sm|shadow-md|shadow-lg|shadow-2xl|shadow)/);

    const flexDirectionMatch = classes.match(/(flex-row|flex-col)/);
    const justifyContentMatch = classes.match(/(justify-start|justify-end|justify-center|justify-between|justify-around)/);
    const alignItemsMatch = classes.match(/(items-start|items-end|items-center|items-stretch)/);
    const gapMatch = classes.match(/(gap-\d+|gap-0)/);
    const lineHeightMatch = classes.match(/(leading-none|leading-tight|leading-normal|leading-relaxed|leading-loose)/);

    const props: any = {
      paddingY: paddingYMatch ? paddingYMatch[0] : 'py-6',
      paddingX: paddingXMatch ? paddingXMatch[0] : 'px-6',
      marginY: marginYMatch ? marginYMatch[0] : 'my-2',
      marginX: marginXMatch ? marginXMatch[0] : 'mx-0',
      textSize: textSizeMatch ? textSizeMatch[0] : 'text-base',
      textColor: textColorMatch ? textColorMatch[0] : 'text-zinc-100',
      fontWeight: fontWeightMatch ? fontWeightMatch[0] : 'font-normal',
      textAlign: textAlignMatch ? textAlignMatch[0] : 'text-left',
      bgColor: bgColorMatch ? bgColorMatch[0] : 'bg-zinc-900',
      borderRadius: borderRadiusMatch ? borderRadiusMatch[0] : 'rounded-xl',
      shadow: shadowMatch ? shadowMatch[0] : 'shadow-md',
      borderWidth: borderWidthMatch ? borderWidthMatch[0] : 'border',
      borderColor: borderColorMatch ? borderColorMatch[0] : 'border-zinc-800',
      position: style.includes('position: absolute') ? 'absolute' : 'relative',
      top: topMatch ? parseInt(topMatch[1]) : undefined,
      left: leftMatch ? parseInt(leftMatch[1]) : undefined,
      width: widthMatch ? widthMatch[1].trim() : '320px',
      height: heightMatch ? heightMatch[1].trim() : 'auto',
      rotation: rotationMatch ? parseInt(rotationMatch[1]) : 0,
      lineHeight: lineHeightMatch ? lineHeightMatch[0] : 'leading-normal'
    };

    const rowMatch = classes.match(/grid-rows-(\d+)/);
    const colMatch = classes.match(/grid-cols-(\d+)/);
    if (rowMatch) props.rows = parseInt(rowMatch[1]);
    if (colMatch) props.columns = parseInt(colMatch[1]);

    if (flexDirectionMatch) props.flexDirection = flexDirectionMatch[0];
    if (justifyContentMatch) props.justifyContent = justifyContentMatch[0];
    if (alignItemsMatch) props.alignItems = alignItemsMatch[0];
    if (gapMatch) props.gap = gapMatch[0];

    if (type === 'Header') {
      const logoEl = el.querySelector('.font-bold') || el.querySelector('div');
      props.logoText = logoEl ? logoEl.textContent?.trim() || '' : 'DevCanvas';
      const btn = el.querySelector('a, button');
      props.buttonText = btn ? btn.textContent?.trim() || '' : 'Get Started';
    } else if (type === 'Card') {
      const titleEl = el.querySelector('h3');
      props.title = titleEl ? titleEl.textContent?.trim() || '' : 'Amazing Card';
      const descEl = el.querySelector('p');
      props.description = descEl ? descEl.textContent?.trim() || '' : '';
      const badgeEl = el.querySelector('span');
      props.badgeText = badgeEl ? badgeEl.textContent?.trim() || '' : '';
      const imgEl = el.querySelector('img');
      props.imageUrl = imgEl ? imgEl.getAttribute('src') || '' : '';
      const btn = el.querySelector('button');
      props.buttonText = btn ? btn.textContent?.trim() || '' : '';
    } else if (type === 'Button') {
      props.buttonText = el.textContent?.trim() || 'Button Click';
    } else if (type === 'InputForm') {
      const titleEl = el.querySelector('h3');
      props.formTitle = titleEl ? titleEl.textContent?.trim() || '' : '';
      const btn = el.querySelector('button');
      props.buttonText = btn ? btn.textContent?.trim() || '' : '';
      props.showNameField = classes.includes('name') || el.innerHTML.includes('Full Name');
      props.showEmailField = classes.includes('email') || el.innerHTML.includes('Email Address');
      props.showMessageField = classes.includes('message') || el.innerHTML.includes('Message');
    } else if (type === 'ThreeDAsset') {
      const inner = el.classList.contains('threed-container') ? el : el.querySelector('.threed-container');
      if (inner) {
        props.modelUrl = inner.getAttribute('data-url') || '';
        props.modelScale = parseFloat(inner.getAttribute('data-scale') || '1.5');
        props.modelAutoRotate = inner.getAttribute('data-autorotate') === 'true';
        props.modelInteractive = inner.getAttribute('data-interactive') === 'true';
      }
    } else if (type === 'Section') {
      const titleEl = el.querySelector('h2');
      props.sectionTitle = titleEl ? titleEl.textContent?.trim() || '' : '';
      const subEl = el.querySelector('p');
      props.subtitle = subEl ? subEl.textContent?.trim() || '' : '';
    } else if (type === 'Navbar') {
      const logoEl = el.querySelector('.font-bold');
      props.logoText = logoEl ? logoEl.textContent?.trim() || '' : '';
      const btn = el.querySelector('button');
      props.buttonText = btn ? btn.textContent?.trim() || '' : '';
      const links = Array.from(el.querySelectorAll('a')).map(a => a.textContent?.trim() || '');
      if (links.length > 0) props.links = links;
    } else if (type === 'Footer') {
      const logoEl = el.querySelector('.font-bold');
      props.logoText = logoEl ? logoEl.textContent?.trim() || '' : '';
      const descEl = el.querySelector('p:not(.text-xs)');
      props.description = descEl ? descEl.textContent?.trim() || '' : '';
      const links = Array.from(el.querySelectorAll('a')).map(a => a.textContent?.trim() || '');
      if (links.length > 0) props.links = links;
      const crEl = el.querySelector('.text-xs.opacity-50');
      props.copyrightText = crEl ? crEl.textContent?.trim() || '' : '';
    }

    return props;
  };

  const parseNode = (el: Element): CanvasComponent | null => {
    const type = detectType(el);
    if (!type) return null;
    const props = parseProps(el, type);

    const component: CanvasComponent = {
      id: `${type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props
    };

    if (type === 'Grid') {
      const children: CanvasComponent[] = [];
      el.querySelectorAll(':scope > *').forEach((child) => {
        const childNode = parseNode(child);
        if (childNode) children.push(childNode);
      });
      component.children = children;
    }

    return component;
  };

  root.querySelectorAll(':scope > *').forEach((element) => {
    const component = parseNode(element);
    if (component) components.push(component);
  });

  return components;
}

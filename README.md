# DevCanvas 🎨🚀
> The Modern, Responsive Visual Web Development IDE for Frontend Engineers

**DevCanvas** is a web-based visual designer and code synchronizer that lets frontend developers build, style, inspect, and export responsive templates visually.

Designed with premium developer aesthetics (dark mode, glowing ambient highlights, and seamless layout tabs), DevCanvas allows side-by-side editing across multiple browser windows using cross-tab BroadcastChannel synchronizations.

---

## 🌟 Key Features

- **Visual Canvas Panel**: Click, edit, and arrange pre-built components (Header, Product Cards, Action Buttons, Input Forms, Layout Grids).
- **Multi-Device Breakpoint Sandbox**: Switch between Desktop (100%), Tablet (768px), and Mobile (375px) with realistic hardware borders, notch speakers, and margins.
- **Detached Multi-Window Layout**:
  - **Detach Canvas**: Open the visual designer canvas in a separate browser tab to focus on a dual-monitor editing experience.
  - **Detach Preview**: Open the live sandbox preview in a separate tab to monitor live layout compiling side-by-side.
  - State selections, breakpoint scaling, and element drops synchronize instantly between windows using cross-tab `BroadcastChannel` communication.
- **Unified Controls Header**: Collapsible sidebar panels (Component Explorer, CSS Style Inspector, Splitted Code Editor, Debug Terminal Output) to maximize coding screen space.
- **Tailwind CSS v4 live compiler**: Instantly translates canvas elements, spacing, typography, and color variables into clean, production-ready, semantic HTML styled with Tailwind CSS v4.

---

## 🛠️ Technology Stack

- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Sync APIs**: HTML5 `BroadcastChannel`

---

## 📂 Project Structure

```bash
adjustdesigndd/
├── index.html            # Entry layout containing Inter Font imports and SEO tags
├── vite.config.ts        # Vite configuration loaded with @tailwindcss/vite plugin
├── src/
│   ├── main.tsx          # Mounts React DOM root nodes
│   ├── index.css         # Tailwind base imports, scrollbars, glowing animations, and syntax classes
│   ├── App.tsx           # Main orchestrator router, sync logic, preset templates, and file downloads
│   ├── types/
│   │   └── canvas.ts     # TypeScript interface definitions for components, spacing, and inspectors
│   ├── utils/
│   │   └── codeGenerator.ts  # HTML generators and custom regex-based code syntax highlight formatter
│   └── components/
│       ├── LandingPage.tsx   # Premium dark landing page with micro-animations & demo sandbox
│       ├── ComponentLibrary.tsx  # Draggable/clickable components selector with search filtering
│       ├── VisualCanvas.tsx  # Breakpoint device frame renderer with drag-over dropzones
│       ├── CodeEditor.tsx    # Mock editor highlighting HTML tags, classes, and strings
│       ├── LivePreview.tsx   # Isolated Iframe preview container loading Tailwind CDN
│       └── PropertyInspector.tsx # Spacing slider panels, background themes, and font color weights
```

---

## 🚀 Quick Start (Local Setup)

To spin up the development server on your system:

### 1. Install Dependencies
Run the package installations from the project root directory:
```bash
npm install
```

### 2. Launch Development Server
Start the local Vite HMR server:
```bash
npm run dev
```
Open your browser to the local URL (usually `http://localhost:5173`) to experience the visual IDE.

### 3. Verify Code Compilation
Run compiler test to bundle and verify TypeScript typing checks:
```bash
npm run build
```
This outputs production assets under `dist/` (including compiling semantic CSS bundles in milliseconds).

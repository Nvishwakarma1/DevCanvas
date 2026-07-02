export type ComponentType = 'Header' | 'Card' | 'Button' | 'InputForm' | 'Grid' | 'ThreeDAsset' | 'Section' | 'Navbar' | 'Footer' | 'Container' | 'Breaker';

export interface ComponentProps {
  // Spacing (Tailwind classes or pure names mapping to values)
  paddingY: string;
  paddingX: string;
  marginY: string;
  marginX: string;

  // Typography
  textSize: string;
  textColor: string;
  fontWeight: string;
  textAlign: string;
  lineHeight?: string;

  // Colors & Design
  bgColor: string;
  borderRadius: string;
  shadow: string;
  borderWidth: string;
  borderColor: string;

  // Absolute positioning box
  position?: 'absolute' | 'relative';
  top?: number;
  left?: number;
  width?: string;
  height?: string;
  rotation?: number;

  // Content values
  logoText?: string;
  links?: string[];
  title?: string;
  description?: string;
  buttonText?: string;
  buttonVariant?: 'solid' | 'outline' | 'ghost';
  imageUrl?: string;
  badgeText?: string;
  copyrightText?: string;
  sectionTitle?: string;
  subtitle?: string;
  
  // Form properties
  formTitle?: string;
  showNameField?: boolean;
  showEmailField?: boolean;
  showMessageField?: boolean;

  // Layout / Flexbox
  columns?: number; // for Grid (1 to 12)
  rows?: number; // for Grid (1 to 12)
  gap?: string;
  flexDirection?: 'flex-row' | 'flex-col';
  justifyContent?: 'justify-start' | 'justify-end' | 'justify-center' | 'justify-between' | 'justify-around';
  alignItems?: 'items-start' | 'items-end' | 'items-center' | 'items-stretch';

  // 3D Elements
  modelUrl?: string;
  modelScale?: number;
  modelAutoRotate?: boolean;
  modelInteractive?: boolean;

  // Phase 2.1 — Interactive 3D Logic Bindings
  model3DBindings?: {
    scrollToRotateY?: boolean;
    mouseToRotateX?: boolean;
    mouseToScale?: boolean;
    scrollToPositionZ?: boolean;
  };
}

// Phase 2.2 — Visual Logic Node event→action binding
export interface LogicBinding {
  id: string;
  event: 'onClick' | 'onHover' | 'onScroll';
  action: 'toggleVisibility' | 'triggerParticles' | 'scrollTo' | 'addClass' | 'removeClass';
  targetId?: string;
  /** Optional CSS class to add/remove for addClass/removeClass action */
  cssClass?: string;
}

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: CanvasComponent[];
  /** Phase 1.4 — Fluid Layout Mode: 'freeform' uses absolute pos, 'flow' uses relative/document flow */
  layoutMode?: 'freeform' | 'flow';
  /** Phase 2.2 — Visual Logic Nodes: event→action bindings for this component */
  logicBindings?: LogicBinding[];
}

export type ViewType = 'landing' | 'ide';
export type BreakpointType = 'desktop' | 'tablet' | 'mobile';

export interface PageSettings {
  bgPreset: 'none' | 'particles' | 'animated-gradient' | 'mouse-trail' | 'aurora-webgl';
  cursorPreset: 'default' | 'neon-crosshair' | 'glowing-circle' | 'custom';
  customCursorUrl: string;
  webglTextureUrl?: string;
  webglBlendMode?: 'none' | 'multiply' | 'screen' | 'overlay';
  webglColorA?: string;
  webglColorB?: string;
  webglDisplacement?: number;
  webglSpeed?: number;
  /** Custom background color overlay for the Artboard */
  customBgColor?: string;
  /** Phase 2.4 — GLSL Shader Editor: custom fragment shader source */
  customGlslFragment?: string;
}

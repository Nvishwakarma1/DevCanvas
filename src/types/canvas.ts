export type ComponentType = 'Header' | 'Card' | 'Button' | 'InputForm' | 'Grid' | 'ThreeDAsset' | 'Section' | 'Navbar' | 'Footer';

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
}

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: CanvasComponent[];
}

export type ViewType = 'landing' | 'ide';
export type BreakpointType = 'desktop' | 'tablet' | 'mobile';

export interface PageSettings {
  bgPreset: 'none' | 'particles' | 'animated-gradient' | 'mouse-trail';
  cursorPreset: 'default' | 'neon-crosshair' | 'glowing-circle' | 'custom';
  customCursorUrl: string;
}


export type ComponentType = 'Header' | 'Card' | 'Button' | 'InputForm' | 'Grid';

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

  // Colors & Design
  bgColor: string;
  borderRadius: string;
  shadow: string;
  borderWidth: string;
  borderColor: string;

  // Content values
  logoText?: string;
  links?: string[];
  title?: string;
  description?: string;
  buttonText?: string;
  buttonVariant?: 'solid' | 'outline' | 'ghost';
  imageUrl?: string;
  badgeText?: string;
  
  // Form properties
  formTitle?: string;
  showNameField?: boolean;
  showEmailField?: boolean;
  showMessageField?: boolean;

  // Layout
  columns?: number; // for Grid (1 to 4)
  gap?: string;
}

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: CanvasComponent[];
}

export type ViewType = 'landing' | 'ide';
export type BreakpointType = 'desktop' | 'tablet' | 'mobile';

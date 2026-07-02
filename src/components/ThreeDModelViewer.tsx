import { Suspense, useRef, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { AlertCircle } from 'lucide-react';
import { useMouseScroll } from '../webgl/hooks/useMouseScroll';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeDErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ThreeD Model Viewer crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Phase 2.1 — 3D interaction binding types
interface Model3DBindings {
  scrollToRotateY?: boolean;
  mouseToRotateX?: boolean;
  mouseToScale?: boolean;
  scrollToPositionZ?: boolean;
}

interface ModelProps {
  url: string;
  autoRotate: boolean;
  scale: number;
  bindings?: Model3DBindings;
}

function Model({ url, autoRotate, scale, bindings }: ModelProps) {
  const gltf = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const updateInteraction = useMouseScroll();
  // Track base scale for mouse-to-scale binding
  const baseScale = useRef(scale);

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Auto-rotate (base behavior)
    if (autoRotate && !bindings?.scrollToRotateY) {
      ref.current.rotation.y += delta * 0.4;
    }

    // Phase 2.1 — Apply interactive bindings if any are enabled
    if (bindings && (bindings.scrollToRotateY || bindings.mouseToRotateX || bindings.mouseToScale || bindings.scrollToPositionZ)) {
      const { mouse, scroll } = updateInteraction(delta);

      if (bindings.scrollToRotateY) {
        // Map scroll (0→1) to full Y rotation
        ref.current.rotation.y = scroll * Math.PI * 4;
      }

      if (bindings.mouseToRotateX) {
        // Map mouse Y (-1→1) to X tilt rotation
        const target = mouse.y * 0.6;
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, target, 0.08);
      }

      if (bindings.mouseToScale) {
        // Mouse distance from center drives scale (0.8 → 1.2)
        const dist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const targetScale = baseScale.current * (0.9 + dist * 0.2);
        const currentScale = ref.current.scale.x;
        const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.08);
        ref.current.scale.setScalar(lerpedScale);
      } else {
        // Maintain base scale if no binding
        ref.current.scale.setScalar(baseScale.current);
      }

      if (bindings.scrollToPositionZ) {
        // Map scroll to Z position (-1 → +1)
        const targetZ = (scroll - 0.5) * 2.0;
        ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.06);
      }
    }
  });

  return (
    <primitive
      ref={ref}
      object={gltf.scene}
      scale={scale}
      position={[0, 0, 0]}
    />
  );
}

function SpinnerBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 1.5;
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      {/* Phase 3.1 — Etherium Purple wireframe spinner */}
      <meshBasicMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

interface ThreeDModelViewerProps {
  modelUrl: string;
  autoRotate: boolean;
  scale: number;
  interactive: boolean;
  /** Phase 2.1 — Scroll/mouse interaction bindings */
  bindings?: Model3DBindings;
}

export default function ThreeDModelViewer({
  modelUrl,
  autoRotate,
  scale,
  interactive,
  bindings,
}: ThreeDModelViewerProps) {
  const defaultUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Embedded/Duck.gltf';
  const url = modelUrl || defaultUrl;

  // Show binding indicator badge
  const hasBindings = bindings && Object.values(bindings).some(Boolean);

  const errorFallback = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-4 border border-rose-900/30 rounded-xl text-center select-none">
      <AlertCircle className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
      <span className="text-[11px] font-bold text-rose-400">Failed to render 3D asset</span>
      <p className="text-[9px] text-zinc-500 mt-1 max-w-[220px]">
        Verify the URL points directly to a valid .gltf, .glb, or .obj asset. CORS policies must allow fetching.
      </p>
    </div>
  );

  return (
    <ThreeDErrorBoundary fallback={errorFallback}>
      <div className="w-full h-full relative bg-zinc-950/40 rounded-xl overflow-hidden">
        <Canvas camera={{ position: [0, 0, 2.5], fof: 45 } as any}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          
          <Suspense fallback={<SpinnerBox />}>
            <Center>
              <Model url={url} autoRotate={autoRotate} scale={scale} bindings={bindings} />
            </Center>
          </Suspense>

          {interactive && <OrbitControls enableZoom={true} enablePan={true} />}
        </Canvas>

        {/* Info badges */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {hasBindings && (
            <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded text-[8px] text-amber-400 font-mono pointer-events-none select-none">
              ⚡ Bound
            </div>
          )}
          <div className="bg-black/60 backdrop-blur-md border border-zinc-800 px-2 py-0.5 rounded text-[8px] text-zinc-500 font-mono pointer-events-none select-none">
            3D Canvas Sandbox
          </div>
        </div>
      </div>
    </ThreeDErrorBoundary>
  );
}

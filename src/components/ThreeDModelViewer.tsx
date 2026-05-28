import { Suspense, useRef, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { AlertCircle } from 'lucide-react';

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

interface ModelProps {
  url: string;
  autoRotate: boolean;
  scale: number;
}

function Model({ url, autoRotate, scale }: ModelProps) {
  const gltf = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * 0.4;
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
      <meshBasicMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

interface ThreeDModelViewerProps {
  modelUrl: string;
  autoRotate: boolean;
  scale: number;
  interactive: boolean;
}

export default function ThreeDModelViewer({
  modelUrl,
  autoRotate,
  scale,
  interactive
}: ThreeDModelViewerProps) {
  const defaultUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Embedded/Duck.gltf';
  const url = modelUrl || defaultUrl;

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
              <Model url={url} autoRotate={autoRotate} scale={scale} />
            </Center>
          </Suspense>

          {interactive && <OrbitControls enableZoom={true} enablePan={true} />}
        </Canvas>
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md border border-zinc-800 px-2 py-0.5 rounded text-[8px] text-zinc-500 font-mono pointer-events-none select-none">
          3D Canvas Sandbox
        </div>
      </div>
    </ThreeDErrorBoundary>
  );
}

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AuroraShaderMesh from './AuroraShaderMesh';
import type { PageSettings } from '../../types/canvas';

interface WebGLCanvasProps {
  settings?: PageSettings;
  /** Phase 3.5 — When true, reduces canvas opacity for IDE focus mode */
  dimmed?: boolean;
}

export default function WebGLCanvas({ settings, dimmed = false }: WebGLCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        overflow: 'hidden',
        // Phase 3.5 — Smooth opacity transition for IDE activity dimming
        opacity: dimmed ? 0.42 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {isVisible && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
          }}
          frameloop="always" 
        >
          <Suspense fallback={null}>
            <AuroraShaderMesh settings={settings} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

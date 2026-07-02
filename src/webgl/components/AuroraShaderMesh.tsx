import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, ShaderMaterial, Mesh, Color, RepeatWrapping, MathUtils, TextureLoader, CanvasTexture, Texture } from 'three';
import { auroraVertexShader, auroraFragmentShader } from '../shaders/auroraShader';
// Phase 2.4 — Custom GLSL support: settings.customGlslFragment overrides the default shader
import { useMouseScroll } from '../hooks/useMouseScroll';
import type { PageSettings } from '../../types/canvas';

interface AuroraShaderMeshProps {
  settings?: PageSettings;
}

export default function AuroraShaderMesh({ settings }: AuroraShaderMeshProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<Mesh>(null);
  const updateInteraction = useMouseScroll();
  const { size, viewport } = useThree();

  // Track the current rotation states for smooth inertia (framerate independent)
  const currentRotation = useRef({ x: 0, y: 0 });

  // State to hold the loaded texture. Initialized to null.
  const [texture, setTexture] = useState<Texture | null>(null);

  // Resolve texture URL (fallback to premium Unsplash abstract artwork)
  const textureUrl = settings?.webglTextureUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  // Load texture inside a useEffect to avoid Suspense issues
  useEffect(() => {
    let active = true;
    const loader = new TextureLoader();
    
    // Set crossOrigin to anonymous for CORS compliance
    loader.setCrossOrigin('anonymous');

    loader.load(
      textureUrl,
      (tex) => {
        if (!active) {
          tex.dispose();
          return;
        }
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;
        setTexture(tex);
        console.log('WebGL Visual Engine: Texture loaded successfully.');
      },
      undefined,
      (err) => {
        console.error('WebGL Visual Engine: Failed to load texture, generating fallback gradient.', err);
        if (!active) return;
        
        // Procedurally generate a fallback gradient texture to prevent crashes
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 0, 128);
          grad.addColorStop(0, '#111827'); // dark gray
          grad.addColorStop(1, '#1f2937');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 128, 128);
        }
        const fallbackTex = new CanvasTexture(canvas);
        fallbackTex.wrapS = RepeatWrapping;
        fallbackTex.wrapT = RepeatWrapping;
        setTexture(fallbackTex);
      }
    );

    return () => {
      active = false;
    };
  }, [textureUrl]);

  // Memoize uniforms to prevent reconstruction on every render
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new Vector2(0, 0) },
      u_mouseVelocity: { value: new Vector2(0, 0) },
      u_scroll: { value: 0 },
      u_resolution: { value: new Vector2(size.width, size.height) },
      u_texture: { value: null },
      u_overlayColorA: { value: new Color('#6366f1') },
      u_overlayColorB: { value: new Color('#ec4899') },
      u_displacement: { value: 0.15 },
      u_speed: { value: 1.0 },
      u_blendMode: { value: 3 }
    }),
    []
  );

  // Strict Resource Disposal Hook to prevent GPU Memory Leaks
  useEffect(() => {
    return () => {
      console.log('WebGL Visual Engine: Explicit resource cleanup triggered.');
      if (meshRef.current) {
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    // Get smooth interaction values (dampened position & velocity)
    const { mouse, scroll, mouseVelocity } = updateInteraction(delta);

    // Update time and interaction uniforms
    materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.u_mouse.value.copy(mouse);
    materialRef.current.uniforms.u_mouseVelocity.value.copy(mouseVelocity);
    materialRef.current.uniforms.u_scroll.value = scroll;
    
    // Bind loaded texture to uniform
    if (texture) {
      materialRef.current.uniforms.u_texture.value = texture;
    }
    
    // Update color uniforms dynamically from hex inputs
    materialRef.current.uniforms.u_overlayColorA.value.set(settings?.webglColorA || '#6366f1');
    materialRef.current.uniforms.u_overlayColorB.value.set(settings?.webglColorB || '#ec4899');
    
    // Update float configuration uniforms
    materialRef.current.uniforms.u_displacement.value = settings?.webglDisplacement ?? 0.15;
    materialRef.current.uniforms.u_speed.value = settings?.webglSpeed ?? 1.0;
    
    // Map blend mode string to integer config
    const blendModeMap = {
      none: 0,
      multiply: 1,
      screen: 2,
      overlay: 3
    };
    materialRef.current.uniforms.u_blendMode.value = blendModeMap[settings?.webglBlendMode || 'overlay'];
    
    // Adjust resolution in case of window resize
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height);

    // EXACT INERTIA & INTERACTION TILT MATH:
    // targetRotation = target * maxTilt;
    // currentRotation = lerp(currentRotation, targetRotation, dampeningFactor);
    // Framerate-independent interpolation factor: 1 - exp(-decayRate * delta)
    const maxTilt = 0.08;
    const decayRate = 5.0; // k decay rate constant
    
    const targetRotationX = -mouse.y * maxTilt;
    const targetRotationY = mouse.x * maxTilt;
    
    const lerpFactor = 1.0 - Math.exp(-decayRate * delta);
    
    currentRotation.current.x = MathUtils.lerp(currentRotation.current.x, targetRotationX, lerpFactor);
    currentRotation.current.y = MathUtils.lerp(currentRotation.current.y, targetRotationY, lerpFactor);

    // Apply smooth inertia rotations
    meshRef.current.rotation.x = currentRotation.current.x;
    meshRef.current.rotation.y = currentRotation.current.y;
  });

  return (
    <mesh ref={meshRef}>
      {/* Cover viewport with overflow padding to prevent edge clipping during tilt */}
      <planeGeometry args={[viewport.width * 1.3, viewport.height * 1.3, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={auroraVertexShader}
        // Phase 2.4 — Use custom GLSL if provided, otherwise fall back to default aurora shader
        fragmentShader={settings?.customGlslFragment || auroraFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}

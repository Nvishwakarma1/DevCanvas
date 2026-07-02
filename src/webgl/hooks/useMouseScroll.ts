import { useEffect, useRef } from 'react';
import { Vector2, MathUtils } from 'three';

export function useMouseScroll() {
  const targetMouse = useRef(new Vector2(0, 0));
  const currentMouse = useRef(new Vector2(0, 0));
  const lastMouse = useRef(new Vector2(0, 0));
  const mouseVelocity = useRef(new Vector2(0, 0));
  
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const lastScroll = useRef(0);
  const scrollVelocity = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -1 to 1
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetScroll.current = maxScroll > 0 ? scrollY / maxScroll : 0;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Update logic to be called inside useFrame
  const update = (delta: number) => {
    // Standard Decay rate (k value). Higher = faster tracking.
    const decayRate = 6.0;
    // Framerate-independent interpolation factor: lerpFactor = 1.0 - exp(-decayRate * delta)
    const lerpFactor = 1.0 - Math.exp(-decayRate * (delta || 0.016));
    
    // Linearly interpolate positions
    currentMouse.current.x = MathUtils.lerp(currentMouse.current.x, targetMouse.current.x, lerpFactor);
    currentMouse.current.y = MathUtils.lerp(currentMouse.current.y, targetMouse.current.y, lerpFactor);
    
    currentScroll.current = MathUtils.lerp(currentScroll.current, targetScroll.current, lerpFactor);

    // Calculate instantaneous velocity: change per second
    const dt = delta || 0.016;
    const rawMouseVelocityX = (currentMouse.current.x - lastMouse.current.x) / dt;
    const rawMouseVelocityY = (currentMouse.current.y - lastMouse.current.y) / dt;
    const rawScrollVelocity = (currentScroll.current - lastScroll.current) / dt;

    // Smooth velocity values using exponential decay
    const velocityDecay = 4.0;
    const velLerpFactor = 1.0 - Math.exp(-velocityDecay * dt);
    
    mouseVelocity.current.x = MathUtils.lerp(mouseVelocity.current.x, rawMouseVelocityX, velLerpFactor);
    mouseVelocity.current.y = MathUtils.lerp(mouseVelocity.current.y, rawMouseVelocityY, velLerpFactor);
    scrollVelocity.current = MathUtils.lerp(scrollVelocity.current, rawScrollVelocity, velLerpFactor);

    // Save previous state for next frame calculation
    lastMouse.current.copy(currentMouse.current);
    lastScroll.current = currentScroll.current;

    return {
      mouse: currentMouse.current,
      scroll: currentScroll.current,
      mouseVelocity: mouseVelocity.current,
      scrollVelocity: scrollVelocity.current
    };
  };

  return update;
}

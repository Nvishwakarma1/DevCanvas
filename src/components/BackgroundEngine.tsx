import { useEffect, useRef } from 'react';

interface BackgroundEngineProps {
  preset: 'none' | 'particles' | 'animated-gradient' | 'mouse-trail';
}

export default function BackgroundEngine({ preset }: BackgroundEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    if (preset === 'none' || preset === 'animated-gradient') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class for particle swarm
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      baseX: number;
      baseY: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.color = `rgba(${Math.floor(Math.random() * 40 + 99)}, ${Math.floor(
          Math.random() * 40 + 102
        )}, 241, ${Math.random() * 0.2 + 0.15})`;
        this.baseX = this.x;
        this.baseY = this.y;
      }

      update() {
        if (preset === 'particles') {
          // Normal floating drift
          this.x += this.vx;
          this.y += this.vy;

          // Bounce boundaries
          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;

          // Avoid mouse interaction
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 4;
            this.y -= Math.sin(angle) * force * 4;
          }
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
      }
    }

    // Spark class for mouse-trail
    class Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 3 + 1;
        const colors = [
          'rgba(99, 102, 241, ', // Indigo
          'rgba(16, 185, 129, ', // Emerald
          'rgba(244, 63, 94, '   // Rose
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 0;
        this.maxLife = Math.random() * 40 + 20;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02; // gravity effect
        this.life++;
      }

      draw(c: CanvasRenderingContext2D) {
        const opacity = Math.max(0, 1 - this.life / this.maxLife);
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = this.color + opacity + ')';
        c.fill();
      }
    }

    const particles: Particle[] = [];
    const sparks: Spark[] = [];

    if (preset === 'particles') {
      const count = Math.min(100, Math.floor((width * height) / 10000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.active = true;

      if (preset === 'mouse-trail') {
        for (let i = 0; i < 3; i++) {
          sparks.push(new Spark(x, y));
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
    };

    // Attach mouse listeners to window to capture drag/moves over canvas
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (preset === 'particles') {
        // Draw connections
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dist = Math.sqrt(
              Math.pow(particles[i].x - particles[j].x, 2) +
                Math.pow(particles[i].y - particles[j].y, 2)
            );
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        particles.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      } else if (preset === 'mouse-trail') {
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.update();
          s.draw(ctx);
          if (s.life >= s.maxLife) {
            sparks.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [preset]);

  if (preset === 'none') return null;

  if (preset === 'animated-gradient') {
    return (
      <div className="absolute inset-0 w-full h-full -z-10 bg-zinc-950 overflow-hidden pointer-events-none select-none">
        {/* Animated Neon Mesh Blob Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-900/15 blur-[120px] animate-[pulse_8s_infinite]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[85%] rounded-full bg-emerald-950/15 blur-[130px] animate-[pulse_10s_infinite_2s]" />
        <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] rounded-full bg-rose-950/10 blur-[110px] animate-[pulse_12s_infinite_4s]" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10 pointer-events-none bg-stone-950/40"
    />
  );
}

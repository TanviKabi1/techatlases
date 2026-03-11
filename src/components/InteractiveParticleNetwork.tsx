import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  wasAttracted: boolean;
}

const COLORS = ["#3aa6ff", "#06b6d4", "#8b5cf6"];
const CONNECTION_DIST = 140;
const CURSOR_RADIUS = 150;
const ATTRACTION_STRENGTH = 0.015;
const SCATTER_STRENGTH = 0.08;
const SCATTER_COOLDOWN = 300; // ms after cursor leaves before scattering
const MAX_PARTICLES = 120;

const InteractiveParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const lastActiveRef = useRef<number>(0);
  const animRef = useRef<number>(0);

  const createParticle = useCallback((x: number, y: number): Particle => ({
    x,
    y,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.6 + 0.4,
    wasAttracted: false,
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    for (let i = 0; i < 70; i++) {
      particlesRef.current.push(createParticle(Math.random() * w, Math.random() * h));
    }

    const onResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
      lastActiveRef.current = Date.now();
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (particlesRef.current.length < MAX_PARTICLES) {
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push(
            createParticle(cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 40)
          );
        }
      }
    };

    window.addEventListener("resize", onResize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onClick);

    const draw = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const now = Date.now();
      const cursorJustLeft = !mouse.active && (now - lastActiveRef.current) < SCATTER_COOLDOWN;

      // Update positions
      for (const p of particles) {
        if (mouse.active) {
          // Cursor attraction
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS && dist > 0) {
            p.vx += (dx / dist) * ATTRACTION_STRENGTH;
            p.vy += (dy / dist) * ATTRACTION_STRENGTH;
            p.wasAttracted = true;
          }
        } else if (p.wasAttracted) {
          // Scatter: push particle away from where cursor was, toward a random direction
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Add random scatter force + repulsion from last cursor position
          const angle = Math.random() * Math.PI * 2;
          const randomForce = 0.3 + Math.random() * 0.5;
          p.vx += Math.cos(angle) * randomForce * SCATTER_STRENGTH;
          p.vy += Math.sin(angle) * randomForce * SCATTER_STRENGTH;
          
          if (dist > 0 && dist < CURSOR_RADIUS * 2) {
            p.vx += (dx / dist) * SCATTER_STRENGTH * 0.5;
            p.vy += (dy / dist) * SCATTER_STRENGTH * 0.5;
          }

          // Also repel from nearby particles to break clusters
          for (const other of particles) {
            if (other === p) continue;
            const odx = p.x - other.x;
            const ody = p.y - other.y;
            const odist = Math.sqrt(odx * odx + ody * ody);
            if (odist < 50 && odist > 0) {
              p.vx += (odx / odist) * SCATTER_STRENGTH * 0.3;
              p.vy += (ody / odist) * SCATTER_STRENGTH * 0.3;
            }
          }

          p.wasAttracted = false;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;
        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;
      }

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = 0.15 * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(58, 166, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw cursor connections
      if (mouse.active) {
        for (const p of particles) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS) {
            const opacity = 0.3 * (1 - dist / CURSOR_RADIUS);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
        // Cursor glow
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 6);
        g.addColorStop(0, "rgba(6, 182, 212, 0.6)");
        g.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Draw particles
      for (const p of particles) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, p.color);
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.globalAlpha = p.alpha * 0.4;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 5 }}
    />
  );
};

export default InteractiveParticleNetwork;

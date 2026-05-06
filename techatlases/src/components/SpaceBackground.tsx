import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  const themeColors = useMemo(() => {
    if (!theme || !theme.colors) return [];
    return [
      `hsla(${theme.colors.primary} /`,
      `hsla(${theme.colors.secondary} /`,
      `hsla(${theme.colors.accent} /`
    ];
  }, [theme]);

  const starColor = theme?.isDark ? "hsla(230 100% 95% /" : "hsla(230 100% 50% /";

  useEffect(() => {
    if (!theme || !theme.colors || themeColors.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: Array<{ x: number; y: number; size: number; speed: number; opacity: number }> = [];
    const nebulae: Array<{ x: number; y: number; radius: number; color: string; opacity: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    // Nebulae
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 200 + 100,
        color: themeColors[i % themeColors.length],
        opacity: Math.random() * 0.04 + 0.02,
      });
    }

    const draw = () => {
      if (theme.isDark) {
        ctx.fillStyle = `hsl(${theme.colors.background})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Brighter solar system gradient
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, `hsl(${theme.colors.background})`);
        grad.addColorStop(0.5, `hsla(${theme.colors.primary} / 0.1)`);
        grad.addColorStop(1, `hsla(${theme.colors.secondary} / 0.1)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Nebulae
      for (const n of nebulae) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, `${n.color} ${n.opacity})`);
        grad.addColorStop(1, `${n.color} 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
      }

      // Stars
      for (const s of stars) {
        const twinkle = Math.sin(Date.now() * 0.001 * s.speed + s.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${starColor} ${s.opacity * twinkle})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [theme, themeColors, starColor]);


  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default SpaceBackground;

import React, { useEffect, useRef } from 'react';
import { WeatherSeasonState } from '../types';

interface FloatingParticlesProps {
  weather: WeatherSeasonState;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  vy: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayPhase: number;
  rotation: number;
  vRot: number;
  size: number;
  baseAlpha: number;
  emoji: string;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!weather.activeAnimation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let isRunning = true;

    // Handle high-DPI displays (Retina, mobile screens)
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for optimal battery/performance

    const updateCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    // Determine particle count based on density and viewport width
    const densityMultiplier =
      weather.particlesDensity === 'low' ? 0.6 : weather.particlesDensity === 'high' ? 1.5 : 1.0;
    const baseCount = width < 640 ? 12 : width < 1024 ? 18 : 24;
    const count = Math.max(6, Math.floor(baseCount * densityMultiplier));

    const emojiList =
      weather.emojis && weather.emojis.length > 0 ? weather.emojis : ['🌸', '✨', '🍃'];

    // Initialize particles
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const baseX = Math.random() * width;
      return {
        x: baseX,
        y: Math.random() * height,
        baseX,
        vy: 20 + Math.random() * 35, // 20px - 55px per second
        swaySpeed: 0.8 + Math.random() * 1.4, // Oscillations per second
        swayAmplitude: 15 + Math.random() * 25, // Lateral drift pixels
        swayPhase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.5,
        vRot: (Math.random() - 0.5) * 0.4, // Gentle angular velocity
        size: 18 + Math.floor(Math.random() * 14), // 18px to 32px
        baseAlpha: 0.5 + Math.random() * 0.35,
        emoji: emojiList[i % emojiList.length],
      };
    });

    // Main 60-120fps render loop with subpixel accuracy
    const render = (currentTime: number) => {
      if (!isRunning) return;

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Clamp dt to max 0.05s (50ms) to prevent massive jumps when returning from background
      const dt = Math.min(rawDt, 0.05);

      ctx.clearRect(0, 0, width, height);

      const timeSec = currentTime / 1000;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update physics
        p.y += p.vy * dt;
        p.x = p.baseX + Math.sin(timeSec * p.swaySpeed + p.swayPhase) * p.swayAmplitude;
        p.rotation += p.vRot * dt;

        // Smooth opacity fading at top and bottom bounds
        let alpha = p.baseAlpha;
        if (p.y < 60) {
          alpha = p.baseAlpha * Math.max(0, p.y / 60);
        } else if (p.y > height - 80) {
          alpha = p.baseAlpha * Math.max(0, (height - p.y) / 80);
        }

        // Recycle particle when it exits viewport bottom
        if (p.y > height + 40) {
          p.y = -35;
          p.baseX = Math.random() * width;
          p.x = p.baseX;
          p.vy = 20 + Math.random() * 35;
          p.size = 18 + Math.floor(Math.random() * 14);
          p.emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        }

        // Render emoji onto canvas
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause animation when tab is inactive to save 100% of GPU/CPU resources
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isRunning = true;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updateCanvasSize();
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [weather.activeAnimation, weather.particlesDensity, weather.emojis]);

  if (!weather.activeAnimation) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none"
      aria-hidden="true"
      style={{
        width: '100vw',
        height: '100vh',
        willChange: 'transform',
      }}
    />
  );
};

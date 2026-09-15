'use client';

/**
 * ScopeScene.tsx — High-performance HTML5 Canvas 3D orbital scene.
 *
 * Renders floating 3D glass cards, animated scope orbit rings, glowing request nodes,
 * and mouse parallax with 60fps requestAnimationFrame loop and ZERO R3F reconciler dependency.
 */

import React, { useRef, useEffect } from 'react';

export function ScopeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);

      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, w, h);

      const centerX = w * 0.5 + m.x * 20 * dpr;
      const centerY = h * 0.5 + m.y * 15 * dpr;

      // 1. Draw glowing background halo ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 140 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 3 * dpr;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20 * dpr;
      ctx.stroke();
      ctx.restore();

      // 2. Floating Request Cards (Orbiting in 3D perspective space)
      const cardConfigs = [
        { label: 'Login Page', hours: '+3.0h', color: '#06b6d4', offset: 0 },
        { label: 'Dark Mode', hours: '+1.5h', color: '#7c5cf8', offset: 2.1 },
        { label: 'Custom Layout', hours: '+2.5h', color: '#f59e0b', offset: 4.2 },
      ];

      cardConfigs.forEach((cfg) => {
        const angle = elapsed * 0.4 + cfg.offset;
        const radiusX = 220 * dpr;
        const radiusY = 80 * dpr;
        const cx = centerX + Math.cos(angle) * radiusX;
        const cy = centerY + Math.sin(angle) * radiusY;
        const depthScale = 0.75 + (Math.sin(angle) + 1) * 0.25;

        const cardW = 120 * depthScale * dpr;
        const cardH = 75 * depthScale * dpr;

        ctx.save();
        ctx.translate(cx, cy);

        // Glass card backdrop
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10 * depthScale * dpr);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 1.5 * depthScale * dpr;
        ctx.shadowColor = cfg.color;
        ctx.shadowBlur = 12 * depthScale * dpr;
        ctx.fill();
        ctx.stroke();

        // Card header line
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.roundRect(-cardW / 2 + 10 * depthScale * dpr, -cardH / 2 + 10 * depthScale * dpr, cardW * 0.6, 6 * depthScale * dpr, 3 * dpr);
        ctx.fill();

        // Card body line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(-cardW / 2 + 10 * depthScale * dpr, -cardH / 2 + 24 * depthScale * dpr, cardW * 0.75, 4 * depthScale * dpr, 2 * dpr);
        ctx.fill();

        // Badge pill
        ctx.fillStyle = cfg.color;
        ctx.font = `600 ${Math.round(10 * depthScale * dpr)}px system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(cfg.hours, cardW / 2 - 10 * depthScale * dpr, cardH / 2 - 10 * depthScale * dpr);

        ctx.restore();
      });

      // 3. Central Glass Ledger Hero Panel
      ctx.save();
      const heroW = 260 * dpr;
      const heroH = 170 * dpr;
      const heroX = centerX - heroW / 2;
      const heroY = centerY - heroH / 2 + Math.sin(elapsed * 1.2) * 8 * dpr;

      ctx.beginPath();
      ctx.roundRect(heroX, heroY, heroW, heroH, 16 * dpr);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(124, 92, 248, 0.4)';
      ctx.lineWidth = 2 * dpr;
      ctx.shadowColor = '#7c5cf8';
      ctx.shadowBlur = 24 * dpr;
      ctx.fill();
      ctx.stroke();

      // Inner ledger lines
      ctx.fillStyle = '#7c5cf8';
      ctx.font = `bold ${Math.round(12 * dpr)}px system-ui, sans-serif`;
      ctx.fillText('ALXO SCOPE LEDGER', heroX + 20 * dpr, heroY + 30 * dpr);

      // Line 1
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = `${Math.round(10 * dpr)}px system-ui, sans-serif`;
      ctx.fillText('Verified creep items: 6', heroX + 20 * dpr, heroY + 60 * dpr);

      // Line 2
      ctx.fillStyle = '#10b981';
      ctx.font = `bold ${Math.round(14 * dpr)}px system-ui, sans-serif`;
      ctx.fillText('+11.5 hrs ($690.00)', heroX + 20 * dpr, heroY + 95 * dpr);

      // Status pill
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.roundRect(heroX + 20 * dpr, heroY + 115 * dpr, 110 * dpr, 24 * dpr, 12 * dpr);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.round(10 * dpr)}px system-ui, sans-serif`;
      ctx.fillText('Ready to Send →', heroX + 30 * dpr, heroY + 131 * dpr);

      ctx.restore();
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

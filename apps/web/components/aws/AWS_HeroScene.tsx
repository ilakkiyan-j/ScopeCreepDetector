'use client';

/**
 * AWS_HeroScene.tsx — High-performance 3D Node Network scene for AWS Architecture.
 *
 * Uses native HTML5 WebGL/Canvas 2D rendering with 60fps requestAnimationFrame,
 * interactive pointer parallax, animated data pulses, and zero dependency on R3F reconciler internals.
 */

import React, { useRef, useEffect } from 'react';

interface NodeData {
  id: string;
  label: string;
  color: string;
  glow: string;
  xRatio: number;
  yRatio: number;
  baseRadius: number;
}

const NODES: NodeData[] = [
  { id: 'browser',  label: 'User Browser', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)',  xRatio: 0.10, yRatio: 0.50, baseRadius: 15 },
  { id: 'amplify',  label: 'AWS Amplify',  color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)',  xRatio: 0.26, yRatio: 0.35, baseRadius: 16 },
  { id: 'cognito',  label: 'Amazon Cognito',color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', xRatio: 0.26, yRatio: 0.65, baseRadius: 16 },
  { id: 'lambda',   label: 'AWS Lambda API',color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)',  xRatio: 0.48, yRatio: 0.50, baseRadius: 18 },
  { id: 'bedrock',  label: 'Amazon Bedrock',color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)',  xRatio: 0.74, yRatio: 0.28, baseRadius: 17 },
  { id: 'dynamodb', label: 'DynamoDB',     color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)',  xRatio: 0.88, yRatio: 0.50, baseRadius: 17 },
  { id: 's3',       label: 'Amazon S3',    color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)',  xRatio: 0.74, yRatio: 0.72, baseRadius: 16 },
];

const EDGES: Array<[number, number]> = [
  [0, 1], // Browser -> Amplify
  [0, 2], // Browser -> Cognito
  [1, 3], // Amplify -> Lambda
  [2, 3], // Cognito -> Lambda
  [3, 4], // Lambda -> Bedrock
  [3, 5], // Lambda -> DynamoDB
  [3, 6], // Lambda -> S3
];

export default function AWS_HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    window.addEventListener('mousemove', onPointerMove);

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);

      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // Node coordinate calculation with subtle float and mouse tilt
      const computedNodes = NODES.map((node, i) => {
        const floatY = Math.sin(elapsed * 1.5 + i * 1.2) * 6 * dpr;
        const floatX = Math.cos(elapsed * 1.2 + i * 0.8) * 4 * dpr;
        const tiltX = m.x * 15 * dpr;
        const tiltY = m.y * 10 * dpr;
        const x = node.xRatio * width + floatX + tiltX;
        const y = node.yRatio * height + floatY + tiltY;
        return { ...node, x, y };
      });

      // 1. Draw Edges with cyan glow
      EDGES.forEach(([fromIdx, toIdx], edgeIdx) => {
        const n1 = computedNodes[fromIdx];
        const n2 = computedNodes[toIdx];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        ctx.restore();

        // Animated data pulse travelling along edge
        const speed = 0.4 + edgeIdx * 0.1;
        const pulseT = ((elapsed * speed) % 1);
        const px = n1.x + (n2.x - n1.x) * pulseT;
        const py = n1.y + (n2.y - n1.y) * pulseT;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
        ctx.restore();
      });

      // 2. Draw Nodes
      computedNodes.forEach((node) => {
        const r = node.baseRadius * dpr;

        // Outer glow aura
        ctx.save();
        const grad = ctx.createRadialGradient(node.x, node.y, r * 0.4, node.x, node.y, r * 2.2);
        grad.addColorStop(0, node.glow);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Node core circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12 * dpr;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
        ctx.restore();

        // Node text label
        ctx.save();
        ctx.font = `600 ${Math.round(11 * dpr)}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4 * dpr;
        ctx.fillText(node.label, node.x, node.y + r + 14 * dpr);
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onPointerMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-slate-950/80 backdrop-blur-md border border-border/40">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

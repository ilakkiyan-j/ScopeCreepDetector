'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ScopeScene — the ALXO 3D brand moment.
 *
 * Narrative: a scope plane (grid = the agreement) with conversation fragments
 * drifting above it; after a beat, a request crosses the agreement and the X
 * forms at the crossing point — the brand mark, animated.
 *
 * Colour values are read from the theme tokens at runtime so light/dark stays
 * token-true. The canvas is only mounted on md+ viewports without reduced
 * motion (see HeroScene), keeps dpr clamped [1,2], and is a handful of draw
 * calls (points + grid + ~8 meshes).
 */

interface BrandColors {
  ink: string;
  accent: string;
  fg: string;
  muted: string;
  bg: string;
}

function tripletToRgb(raw: string): string {
  const parts = raw
    .trim()
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length !== 3) return '';
  return `rgb(${parts.join(',')})`;
}

function useBrandColors(): BrandColors {
  const [colors, setColors] = useState<BrandColors>(() => ({
    ink: '#4338ca',
    accent: '#06b6d4',
    fg: '#0f172a',
    muted: '#64748b',
    bg: '#f8fafc',
  }));

  useEffect(() => {
    const compute = () => {
      const root = document.documentElement;
      const read = (name: string, fallback: string) => {
        const raw = getComputedStyle(root).getPropertyValue(name);
        const rgb = tripletToRgb(raw);
        return rgb || fallback;
      };
      setColors({
        ink: read('--brand-ink', '#4338ca'),
        accent: read('--brand-accent', '#06b6d4'),
        fg: read('--foreground', '#0f172a'),
        muted: read('--muted-foreground', '#64748b'),
        bg: read('--background', '#f8fafc'),
      });
    };
    compute();
    const root = document.documentElement;
    const observer = new MutationObserver(compute);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

const CLOUD_COUNT = 140;

function FragmentCloud({ color, opacity = 0.5 }: { color: string; opacity?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(CLOUD_COUNT * 3);
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const r = 4.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() * 2 - 1) * 3.6;
      arr[i * 3] = r * Math.cos(theta);
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = r * Math.sin(theta) * 0.6;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = 0.05 * Math.sin(state.clock.elapsedTime * 0.15) - 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.055}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function ScopeSceneInner({ colors }: { colors: BrandColors }) {
  const xGroup = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    const progress = THREE.MathUtils.clamp((t - 1.6) / 1.8, 0, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    if (xGroup.current) {
      xGroup.current.scale.setScalar(ease);
      xGroup.current.position.y = 1.15 + Math.sin(t * 0.85) * 0.08;
      xGroup.current.rotation.y = t * 0.06;
    }

    if (ring.current) {
      const s = 0.6 + progress * 1.1;
      ring.current.scale.setScalar(s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = progress * 0.55;
    }

    if (core.current) {
      const m = core.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + progress * 0.75;
    }

    const cam = state.camera;
    cam.position.x += (pointer.current.x * 1.1 - cam.position.x) * Math.min(delta * 1.6, 1);
    cam.position.y += (2.6 + pointer.current.y * 0.7 - cam.position.y) * Math.min(delta * 1.6, 1);
    cam.lookAt(0, 0.35, 0);
  });

  return (
    <>
      <fog attach="fog" args={[colors.bg, 13, 26]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 6]} intensity={1.4} />

      {/* Original agreement — the scope plane */}
      <gridHelper args={[20, 14, colors.accent, colors.muted]} position={[0, -2.7, 0]} />

      {/* Conversation fragments */}
      <FragmentCloud color={colors.fg} />

      {/* The X — a request crossing the agreement */}
      <group ref={xGroup} position={[0, 1.15, 0]} rotation={[0.32, 0, 0]}>
        <mesh>
          <boxGeometry args={[4.4, 0.16, 0.16]} />
          <meshStandardMaterial color={colors.ink} emissive={colors.ink} emissiveIntensity={0.25} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[4.4, 0.16, 0.16]} />
          <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.4} />
        </mesh>
        {/* Ghost X, mirrored behind for depth */}
        <mesh position={[0, 0, -0.6]} scale={1.9}>
          <boxGeometry args={[4.4, 0.07, 0.07]} />
          <meshBasicMaterial color={colors.fg} transparent opacity={0.08} />
        </mesh>
        <mesh position={[0, 0, -0.6]} scale={1.9} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[4.4, 0.07, 0.07]} />
          <meshBasicMaterial color={colors.fg} transparent opacity={0.08} />
        </mesh>
      </group>

      {/* Halo + core at the crossing point */}
      <mesh ref={ring} position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.02, 12, 48]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0} />
      </mesh>
      <mesh ref={core} position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0} />
      </mesh>
    </>
  );
}

export function ScopeScene() {
  const colors = useBrandColors();

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 2.6, 10], fov: 42 }}
      className="touch-none"
    >
      <ScopeSceneInner colors={colors} />
    </Canvas>
  );
}
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BrandColors { ink: string; accent: string; fg: string; muted: string; bg: string; }

function tripletToRgb(raw: string) {
  const values = raw.trim().split(/\s+/).filter(Boolean);
  return values.length === 3 ? `rgb(${values.join(',')})` : '';
}

function useBrandColors(): BrandColors {
  const [colors, setColors] = useState<BrandColors>({ ink: '#4338ca', accent: '#06b6d4', fg: '#0f172a', muted: '#64748b', bg: '#f8fafc' });
  useEffect(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement);
      const read = (name: string, fallback: string) => tripletToRgb(style.getPropertyValue(name)) || fallback;
      setColors({ ink: read('--brand-ink', '#4338ca'), accent: read('--brand-accent', '#06b6d4'), fg: read('--foreground', '#0f172a'), muted: read('--muted-foreground', '#64748b'), bg: read('--background', '#f8fafc') });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return colors;
}

function GlassPanel({ colors }: { colors: BrandColors }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 0.55) * 0.06;
    group.current.rotation.y = -0.28 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
  });
  return <group ref={group} position={[-3.4, 0.3, -1.2]} rotation={[0.06, -0.28, 0]}>
    <mesh><boxGeometry args={[3.8, 2.6, 0.08]} /><meshPhysicalMaterial color={colors.bg} transparent opacity={0.28} roughness={0.18} metalness={0.1} clearcoat={1} /></mesh>
    <mesh position={[-0.8, 0.72, 0.06]}><boxGeometry args={[1.4, 0.14, 0.04]} /><meshBasicMaterial color={colors.fg} transparent opacity={0.55} /></mesh>
    <mesh position={[-0.3, 0.38, 0.06]}><boxGeometry args={[2.4, 0.07, 0.04]} /><meshBasicMaterial color={colors.muted} transparent opacity={0.3} /></mesh>
    <mesh position={[-0.5, 0.08, 0.06]}><boxGeometry args={[2.0, 0.07, 0.04]} /><meshBasicMaterial color={colors.muted} transparent opacity={0.2} /></mesh>
    <mesh position={[-0.8, -0.22, 0.06]}><boxGeometry args={[1.4, 0.07, 0.04]} /><meshBasicMaterial color={colors.muted} transparent opacity={0.2} /></mesh>
  </group>;
}

function RequestCard({ offset, color, scale = 1 }: { offset: number; color: string; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.3 + offset;
    ref.current.position.set(Math.cos(t) * 4.8 + 0.8, Math.sin(t * 1.3) * 1.6 - 0.2, Math.sin(t) * 0.6 - 1.4);
    ref.current.rotation.set(0.08 * Math.sin(t), -t * 0.15, 0.1 * Math.cos(t));
  });
  return <group ref={ref} scale={scale}>
    <mesh><boxGeometry args={[1.15, 0.76, 0.12]} /><meshPhysicalMaterial color={color} transparent opacity={0.25} roughness={0.25} clearcoat={0.8} /></mesh>
    <mesh position={[-0.17, 0.14, 0.07]}><boxGeometry args={[0.64, 0.06, 0.02]} /><meshBasicMaterial color={color} transparent opacity={0.7} /></mesh>
    <mesh position={[-0.1, -0.06, 0.07]}><boxGeometry args={[0.77, 0.045, 0.02]} /><meshBasicMaterial color={color} transparent opacity={0.38} /></mesh>
    <mesh position={[-0.25, -0.22, 0.07]}><boxGeometry args={[0.45, 0.045, 0.02]} /><meshBasicMaterial color={color} transparent opacity={0.28} /></mesh>
  </group>;
}

function ScopeOrbit({ colors }: { colors: BrandColors }) {
  const crossing = useRef<THREE.Group>(null);
  const ledger = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => { pointer.current = { x: event.clientX / window.innerWidth * 2 - 1, y: -(event.clientY / window.innerHeight) * 2 + 1 }; };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const phase = (Math.sin(t * 0.36) + 1) / 2;
    if (crossing.current) {
      crossing.current.position.x = THREE.MathUtils.lerp(-4.2, 3.2, phase);
      crossing.current.position.y = -0.3 + Math.sin(t * 0.72) * 0.12;
      crossing.current.rotation.z = -0.1 + Math.sin(t * 0.45) * 0.05;
    }
    if (ledger.current) {
      const reveal = THREE.MathUtils.smoothstep(phase, 0.57, 0.88);
      ledger.current.scale.setScalar(0.82 + reveal * 0.18);
      ledger.current.position.x = 3.4;
      ledger.current.position.y = -0.5;
      ledger.current.visible = reveal > 0.015;
      ledger.current.traverse((child) => { if (child instanceof THREE.Mesh && 'opacity' in child.material) (child.material as THREE.Material & { opacity: number }).opacity = reveal * 0.85; });
    }
    if (halo.current) {
      const pulse = 0.75 + Math.sin(t * 2.4) * 0.1;
      halo.current.scale.setScalar(pulse);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + phase * 0.18;
    }
    const camera = state.camera;
    camera.position.x += (pointer.current.x * 0.5 - camera.position.x) * Math.min(delta * 1.4, 1);
    camera.position.y += (1.1 + pointer.current.y * 0.3 - camera.position.y) * Math.min(delta * 1.4, 1);
    camera.lookAt(0, 0, 0);
  });
  return <>
    <fog attach="fog" args={[colors.bg, 12, 24]} /><ambientLight intensity={1.2} /><directionalLight position={[4, 5, 6]} intensity={1.4} color={colors.accent} /><pointLight position={[-4, 1, 3]} intensity={0.8} color={colors.ink} />
    <GlassPanel colors={colors} />
    <RequestCard offset={0.3} color={colors.muted} scale={0.85} /><RequestCard offset={2.5} color={colors.fg} scale={0.75} /><RequestCard offset={4.45} color={colors.accent} scale={0.65} />
    <mesh ref={halo} position={[0, 0, -2.5]} rotation={[0, 0, 0]}><torusGeometry args={[0.7, 0.02, 16, 48]} /><meshBasicMaterial color={colors.accent} transparent opacity={0.2} /></mesh>
    <group ref={crossing}><mesh><boxGeometry args={[1.2, 0.78, 0.14]} /><meshPhysicalMaterial color={colors.accent} transparent opacity={0.4} roughness={0.2} clearcoat={0.9} /></mesh><mesh position={[-0.16, 0.14, 0.08]}><boxGeometry args={[0.62, 0.05, 0.02]} /><meshBasicMaterial color={colors.fg} transparent opacity={0.6} /></mesh><mesh position={[-0.12, -0.08, 0.08]}><boxGeometry args={[0.7, 0.04, 0.02]} /><meshBasicMaterial color={colors.fg} transparent opacity={0.38} /></mesh></group>
    <group ref={ledger}><mesh><boxGeometry args={[1.6, 1.0, 0.14]} /><meshPhysicalMaterial color={colors.ink} transparent opacity={0} roughness={0.2} clearcoat={0.9} /></mesh><mesh position={[-0.28, 0.25, 0.09]}><boxGeometry args={[0.72, 0.07, 0.02]} /><meshBasicMaterial color={colors.bg} transparent opacity={0} /></mesh><mesh position={[-0.1, 0.02, 0.09]}><boxGeometry args={[1.0, 0.045, 0.02]} /><meshBasicMaterial color={colors.bg} transparent opacity={0} /></mesh><mesh position={[-0.38, -0.28, 0.09]}><boxGeometry args={[0.5, 0.1, 0.02]} /><meshBasicMaterial color={colors.accent} transparent opacity={0} /></mesh></group>
  </>;
}

export function ScopeScene() {
  const colors = useBrandColors();
  return <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.1, 10], fov: 42 }} className="touch-none"><ScopeOrbit colors={colors} /></Canvas>;
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BrandColors {
  ink: string;
  accent: string;
  fg: string;
  muted: string;
  bg: string;
  primary: string;
}

function tripletToRgb(raw: string) {
  const values = raw.trim().split(/\s+/).filter(Boolean);
  return values.length === 3 ? `rgb(${values.join(',')})` : '';
}

function useBrandColors(): BrandColors {
  const [colors, setColors] = useState<BrandColors>({
    ink: '#4338ca',
    accent: '#06b6d4',
    fg: '#0f172a',
    muted: '#64748b',
    bg: '#f8fafc',
    primary: '#4338ca',
  });

  useEffect(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement);
      const read = (name: string, fallback: string) =>
        tripletToRgb(style.getPropertyValue(name)) || fallback;
      setColors({
        ink: read('--brand-ink', '#4338ca'),
        accent: read('--brand-accent', '#06b6d4'),
        fg: read('--foreground', '#0f172a'),
        muted: read('--muted-foreground', '#64748b'),
        bg: read('--background', '#f8fafc'),
        primary: read('--primary', '#4338ca'),
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}

/**
 * 3D Particle Starfield / Cyber Constellation
 */
function ParticleField({ color }: { color: string }) {
  const count = 350;
  const mesh = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
      scl[i] = Math.random() * 0.08 + 0.02;
    }
    return [pos, scl];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * 0.08;
    mesh.current.rotation.y = t * 0.3;
    mesh.current.rotation.x = Math.sin(t * 0.5) * 0.05;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(scales, 1));
    return geo;
  }, [positions, scales]);

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.07}
        color={color}
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Orbiting Scope Ledger Nodes
 */
function OrbitingNode({
  radius,
  speed,
  yOffset,
  initialAngle,
  color,
  size = [0.4, 0.28, 0.04],
}: {
  radius: number;
  speed: number;
  yOffset: number;
  initialAngle: number;
  color: string;
  size?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed + initialAngle;
    groupRef.current.position.set(
      Math.cos(t) * radius,
      yOffset + Math.sin(t * 2) * 0.22,
      Math.sin(t) * radius * 0.75
    );
    groupRef.current.rotation.y = -t + Math.PI / 2;
    groupRef.current.rotation.x = Math.sin(t) * 0.2;
    groupRef.current.rotation.z = Math.cos(t * 1.5) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Node Body */}
      <mesh>
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.7}
          roughness={0.15}
          metalness={0.4}
          clearcoat={1}
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Mini indicator light */}
      <mesh position={[size[0] * 0.3, size[1] * 0.25, size[2] * 0.6]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/**
 * Multi-Axis Concentric Gimbal Rings
 */
function GimbalRings({ accentColor, inkColor }: { accentColor: string; inkColor: string }) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.35;
      ring1.current.rotation.y = t * 0.22;
    }
    if (ring2.current) {
      ring2.current.rotation.y = -t * 0.4;
      ring2.current.rotation.z = t * 0.18;
    }
    if (ring3.current) {
      ring3.current.rotation.x = Math.sin(t * 0.3) * 0.5;
      ring3.current.rotation.z = -t * 0.28;
    }
  });

  return (
    <group>
      {/* Outer Ring */}
      <mesh ref={ring1}>
        <torusGeometry args={[2.4, 0.022, 16, 80]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.45}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Middle Ring */}
      <mesh ref={ring2}>
        <torusGeometry args={[1.9, 0.02, 16, 70]} />
        <meshStandardMaterial
          color={inkColor}
          emissive={inkColor}
          emissiveIntensity={0.5}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      {/* Inner Ring */}
      <mesh ref={ring3}>
        <torusGeometry args={[1.45, 0.018, 16, 60]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

/**
 * The Central Holographic Scope Vault Core
 */
function ScopeVaultCore({
  colors,
  pointer,
  isInteracting,
}: {
  colors: BrandColors;
  pointer: { current: { x: number; y: number } };
  isInteracting: boolean;
}) {
  const coreRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const speedMult = isInteracting ? 2.5 : 1;

    if (coreRef.current) {
      // Mouse Parallax reaction
      const targetRotX = -pointer.current.y * 0.45;
      const targetRotY = pointer.current.x * 0.55;
      coreRef.current.rotation.x += (targetRotX - coreRef.current.rotation.x) * Math.min(delta * 2.5, 1);
      coreRef.current.rotation.y += (targetRotY - coreRef.current.rotation.y) * Math.min(delta * 2.5, 1);
      coreRef.current.position.y = Math.sin(t * 0.8) * 0.12;
    }

    if (crystalRef.current) {
      crystalRef.current.rotation.x += delta * 0.4 * speedMult;
      crystalRef.current.rotation.y += delta * 0.55 * speedMult;
      const pulse = 1 + Math.sin(t * 2.4) * 0.04;
      crystalRef.current.scale.setScalar(pulse);
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.25 * speedMult;
      wireframeRef.current.rotation.z += delta * 0.3 * speedMult;
    }

    if (beaconRef.current) {
      beaconRef.current.intensity = 1.4 + Math.sin(t * 3.2) * 0.5 + (isInteracting ? 1.0 : 0);
    }
  });

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      {/* Central Faceted Crystalline Polyhedron */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[0.95, 0]} />
        <meshPhysicalMaterial
          color={colors.accent}
          emissive={colors.ink}
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.45}
          thickness={1.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wireframe Outer Shell */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1.25, 0]} />
        <meshBasicMaterial
          color={colors.accent}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Core Glow Beacon */}
      <pointLight
        ref={beaconRef}
        color={colors.accent}
        intensity={1.8}
        distance={6}
      />

      {/* Gyroscope Gimbal Rings */}
      <GimbalRings accentColor={colors.accent} inkColor={colors.ink} />

      {/* Orbiting Scope Verification Data Nodes */}
      <OrbitingNode
        radius={2.7}
        speed={0.45}
        yOffset={0.35}
        initialAngle={0}
        color={colors.accent}
        size={[0.5, 0.32, 0.05]}
      />
      <OrbitingNode
        radius={2.4}
        speed={0.38}
        yOffset={-0.45}
        initialAngle={Math.PI * 0.7}
        color={colors.ink}
        size={[0.42, 0.26, 0.05]}
      />
      <OrbitingNode
        radius={3.1}
        speed={0.52}
        yOffset={0.15}
        initialAngle={Math.PI * 1.4}
        color={colors.accent}
        size={[0.46, 0.28, 0.05]}
      />
      <OrbitingNode
        radius={2.1}
        speed={0.32}
        yOffset={-0.1}
        initialAngle={Math.PI * 1.85}
        color={colors.primary}
        size={[0.38, 0.24, 0.05]}
      />
    </group>
  );
}

/**
 * Interactive 3D World Container with Dynamic Lighting & Camera Parallax
 */
function SignInSceneWorld({ colors }: { colors: BrandColors }) {
  const pointer = useRef({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      // Normalize pointer [-1, 1]
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame((state, delta) => {
    const camera = state.camera;
    const targetX = pointer.current.x * 0.8;
    const targetY = 0.2 + pointer.current.y * 0.5;
    camera.position.x += (targetX - camera.position.x) * Math.min(delta * 2, 1);
    camera.position.y += (targetY - camera.position.y) * Math.min(delta * 2, 1);
    camera.lookAt(0, 0, 0);

    if (lightRef.current) {
      const t = state.clock.elapsedTime * 0.8;
      lightRef.current.position.x = Math.sin(t) * 4;
      lightRef.current.position.z = Math.cos(t) * 4;
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 8, 7]} intensity={1.6} color={colors.accent} />
      <pointLight ref={lightRef} position={[4, 2, 4]} intensity={1.5} color={colors.accent} />
      <pointLight position={[-5, -3, -2]} intensity={1.2} color={colors.ink} />

      <ParticleField color={colors.accent} />

      <group
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
        onPointerEnter={() => setIsInteracting(true)}
        onPointerLeave={() => setIsInteracting(false)}
      >
        <ScopeVaultCore
          colors={colors}
          pointer={pointer}
          isInteracting={isInteracting}
        />
      </group>
    </>
  );
}

export function SignIn3DScene() {
  const colors = useBrandColors();

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.3, 7.8], fov: 42 }}
      className="touch-none w-full h-full"
    >
      <SignInSceneWorld colors={colors} />
    </Canvas>
  );
}

export default SignIn3DScene;

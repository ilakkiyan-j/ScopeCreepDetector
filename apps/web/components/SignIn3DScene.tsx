'use client';

/**
 * SignIn3DScene.tsx — Pure Three.js WebGL scene (no React Three Fiber).
 *
 * Preserves all original visuals: particle starfield, central octahedron +
 * icosahedron wireframe shell, three concentric gimbal rings, four orbiting
 * data-node boxes, pulsing beacon light, and mouse-parallax camera.
 * Reads CSS brand tokens so it adapts to light / dark mode.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── Brand color helper ────────────────────────────────────────────────────────

function readCSSColor(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  return parts.length === 3 ? `rgb(${parts.join(',')})` : fallback;
}

function getBrandColors() {
  return {
    accent:  readCSSColor('--brand-accent', '#06b6d4'),
    ink:     readCSSColor('--brand-ink',    '#4338ca'),
    primary: readCSSColor('--primary',      '#4338ca'),
  };
}

// ── Scene component ───────────────────────────────────────────────────────────

export function SignIn3DScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', touchAction: 'none',
    });

    // ── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.3, 7.8);

    // ── Read brand colors ────────────────────────────────────────────────────
    const colors = getBrandColors();
    const accentColor  = new THREE.Color(colors.accent);
    const inkColor     = new THREE.Color(colors.ink);
    const primaryColor = new THREE.Color(colors.primary);

    // ── Lights ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));

    const dirLight = new THREE.DirectionalLight(accentColor, 1.6);
    dirLight.position.set(6, 8, 7);
    scene.add(dirLight);

    const orbitLight = new THREE.PointLight(accentColor, 1.5, 20);
    orbitLight.position.set(4, 2, 4);
    scene.add(orbitLight);

    const inkLight = new THREE.PointLight(inkColor, 1.2, 20);
    inkLight.position.set(-5, -3, -2);
    scene.add(inkLight);

    // Beacon light (inside core, pulses)
    const beacon = new THREE.PointLight(accentColor, 1.8, 6);
    scene.add(beacon);

    // ── Particle field ───────────────────────────────────────────────────────
    const PARTICLE_COUNT = 350;
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      size: 0.07, color: accentColor, transparent: true, opacity: 0.45,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(particles);

    // ── Core group (octahedron + wireframe) ───────────────────────────────────
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Central octahedron
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.95, 0),
      new THREE.MeshPhongMaterial({
        color: accentColor, emissive: inkColor, emissiveIntensity: 0.4,
        shininess: 120, specular: accentColor, transparent: true, opacity: 0.88,
        side: THREE.DoubleSide,
      })
    );
    coreGroup.add(crystal);

    // Icosahedron wireframe shell
    const wireMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 0),
      new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true, transparent: true, opacity: 0.35 })
    );
    coreGroup.add(wireMesh);

    // ── Gimbal rings ─────────────────────────────────────────────────────────
    const makeRing = (radius: number, tube: number, segments: number, color: THREE.Color) =>
      new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 16, segments),
        new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.5, metalness: 0.85, roughness: 0.2,
        })
      );

    const ring1 = makeRing(2.4, 0.022, 80, accentColor);
    const ring2 = makeRing(1.9, 0.020, 70, inkColor);
    const ring3 = makeRing(1.45, 0.018, 60, accentColor);
    coreGroup.add(ring1, ring2, ring3);

    // ── Orbiting data-node boxes ─────────────────────────────────────────────
    const NODE_CONFIGS = [
      { r: 2.7, spd: 0.45, yOff: 0.35,  angle: 0,                 color: accentColor,  size: [0.5, 0.32, 0.05] as const },
      { r: 2.4, spd: 0.38, yOff: -0.45, angle: Math.PI * 0.7,    color: inkColor,     size: [0.42, 0.26, 0.05] as const },
      { r: 3.1, spd: 0.52, yOff: 0.15,  angle: Math.PI * 1.4,    color: accentColor,  size: [0.46, 0.28, 0.05] as const },
      { r: 2.1, spd: 0.32, yOff: -0.1,  angle: Math.PI * 1.85,   color: primaryColor, size: [0.38, 0.24, 0.05] as const },
    ];

    const orbitNodes = NODE_CONFIGS.map(({ color, size }) => {
      const g = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(size[0], size[1], size[2]),
        new THREE.MeshPhongMaterial({
          color, transparent: true, opacity: 0.7,
          shininess: 80, specular: color, emissive: color, emissiveIntensity: 0.25,
        })
      );
      g.add(body);

      // Mini indicator light
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      dot.position.set(size[0] * 0.3, size[1] * 0.25, size[2] * 0.6);
      g.add(dot);

      scene.add(g);
      return g;
    });

    // ── Pointer tracking ─────────────────────────────────────────────────────
    const pointer = { x: 0, y: 0 };
    const camPos  = { x: 0, y: 0.3 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Theme change observer (re-read CSS colors) ────────────────────────────
    // (We set colors once on mount; full re-render on theme change would
    //  require a restart — acceptable given dark-mode is default.)

    // ── Animation loop ───────────────────────────────────────────────────────
    let animId: number;
    const t0 = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t  = (performance.now() - t0) / 1000;
      const dt = 0.016; // approximate

      // Crystal spin + pulse scale
      crystal.rotation.x += dt * 0.4;
      crystal.rotation.y += dt * 0.55;
      const pulse = 1 + Math.sin(t * 2.4) * 0.04;
      crystal.scale.setScalar(pulse);

      // Wireframe counter-rotation
      wireMesh.rotation.x -= dt * 0.25;
      wireMesh.rotation.z += dt * 0.3;

      // Core group: mouse parallax + float
      const targetRotX = -pointer.y * 0.45;
      const targetRotY =  pointer.x * 0.55;
      coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.08;
      coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.08;
      coreGroup.position.y  = Math.sin(t * 0.8) * 0.12;

      // Beacon pulse
      beacon.intensity = 1.4 + Math.sin(t * 3.2) * 0.5;
      beacon.position.copy(coreGroup.position);

      // Gimbal ring rotations
      ring1.rotation.x = t * 0.35;
      ring1.rotation.y = t * 0.22;
      ring2.rotation.y = -t * 0.4;
      ring2.rotation.z = t * 0.18;
      ring3.rotation.x = Math.sin(t * 0.3) * 0.5;
      ring3.rotation.z = -t * 0.28;

      // Orbit nodes
      NODE_CONFIGS.forEach(({ r, spd, yOff, angle }, i) => {
        const a = t * spd + angle;
        orbitNodes[i].position.set(
          Math.cos(a) * r,
          yOff + Math.sin(a * 2) * 0.22,
          Math.sin(a) * r * 0.75
        );
        orbitNodes[i].rotation.y = -a + Math.PI / 2;
        orbitNodes[i].rotation.x = Math.sin(a) * 0.2;
        orbitNodes[i].rotation.z = Math.cos(a * 1.5) * 0.15;
      });

      // Orbit light sweep
      const lt = t * 0.8;
      orbitLight.position.x = Math.sin(lt) * 4;
      orbitLight.position.z = Math.cos(lt) * 4;

      // Particles drift
      particles.rotation.y = t * 0.08 * 0.3;
      particles.rotation.x = Math.sin(t * 0.08 * 0.5) * 0.05;

      // Camera parallax
      const targetCamX = pointer.x * 0.8;
      const targetCamY = 0.2 + pointer.y * 0.5;
      camPos.x += (targetCamX - camPos.x) * 0.05;
      camPos.y += (targetCamY - camPos.y) * 0.05;
      camera.position.x = camPos.x;
      camera.position.y = camPos.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 touch-none" />;
}

export default SignIn3DScene;

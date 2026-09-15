'use client';

/**
 * ScopeScene.tsx — Pure Three.js WebGL scene for Hero section.
 *
 * Imperative Three.js 3D scene rendering floating glass message panels,
 * orbiting client request cards with text lines, scope drift pathing,
 * particle field, scroll-driven camera, and mouse parallax.
 */

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ScopeSceneProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  scrollProgress: React.MutableRefObject<number>;
  onLoaded?: () => void;
}

export function ScopeScene({ mouseRef, scrollProgress, onLoaded }: ScopeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isDark = () => document.documentElement.classList.contains('dark');

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
    });

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6.2);

    // ── Ambient & Point Lights ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark() ? 0.6 : 0.9);
    scene.add(ambientLight);

    const pl1 = new THREE.PointLight(0x22d3ee, isDark() ? 2.5 : 1.8, 25);
    pl1.position.set(5, 4, 3);
    scene.add(pl1);

    const pl2 = new THREE.PointLight(0x7c5cf8, isDark() ? 2.0 : 1.4, 25);
    pl2.position.set(-5, -3, -2);
    scene.add(pl2);

    // ── Floating Constellation Node Spheres ──────────────────────────────────
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const NODE_COUNT = 16;
    const nodes: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; phase: number }[] = [];
    const nodeColors = [0x22d3ee, 0x7c5cf8, 0x38bdf8, 0x818cf8, 0x34d399];

    for (let i = 0; i < NODE_COUNT; i++) {
      const radius = 0.06 + Math.random() * 0.08;
      const geo = new THREE.SphereGeometry(radius, 16, 16);
      const color = nodeColors[i % nodeColors.length];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isDark() ? 0.75 : 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Distribute nodes mostly toward the center and right side, keeping the far left crisp
      const basePos = new THREE.Vector3(
        (Math.random() - 0.2) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 1
      );
      mesh.position.copy(basePos);
      nodesGroup.add(mesh);

      nodes.push({
        mesh,
        basePos,
        speed: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ── Connecting Network Lines ─────────────────────────────────────────────
    const networkLinesGroup = new THREE.Group();
    scene.add(networkLinesGroup);

    const THREAD_COLORS = [0x22d3ee, 0x7c5cf8, 0x38bdf8];
    for (let i = 0; i < 8; i++) {
      const n1 = nodes[i % NODE_COUNT];
      const n2 = nodes[(i + 5) % NODE_COUNT];
      const pts = [
        n1.basePos,
        new THREE.Vector3(
          (n1.basePos.x + n2.basePos.x) * 0.5,
          (n1.basePos.y + n2.basePos.y) * 0.5 + (Math.random() - 0.5) * 1.2,
          (n1.basePos.z + n2.basePos.z) * 0.5
        ),
        n2.basePos,
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
      const mat = new THREE.LineBasicMaterial({
        color: THREAD_COLORS[i % 3],
        transparent: true,
        opacity: isDark() ? 0.25 : 0.15,
        blending: THREE.AdditiveBlending,
      });
      networkLinesGroup.add(new THREE.Line(geo, mat));
    }

    // ── Floating Particle Field ───────────────────────────────────────────────
    const PARTICLE_COUNT = 280;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pPositions[i * 3]     = (Math.random() - 0.4) * 18;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.035,
        color: 0x22d3ee,
        transparent: true,
        opacity: isDark() ? 0.45 : 0.25,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(particles);

    // ── Camera Keyframes & Motion ─────────────────────────────────────────────
    const CAM_KF = [
      { t: 0,    pos: new THREE.Vector3(0, 0, 6.2)   },
      { t: 0.35, pos: new THREE.Vector3(1.8, 0.6, 5.4) },
      { t: 0.65, pos: new THREE.Vector3(-1.4, 0.3, 6.2)},
      { t: 1,    pos: new THREE.Vector3(0, -0.3, 7.0)  },
    ];
    const camPos   = new THREE.Vector3(0, 0, 6.2);
    const tempPos  = new THREE.Vector3();
    const lookAtPt = new THREE.Vector3(0, 0, 0);

    // ── Resize Listener ───────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const loadedTimeout = setTimeout(() => onLoaded?.(), 600);

    // ── Render Loop ───────────────────────────────────────────────────────────
    let animId: number;
    const t0 = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - t0) / 1000;

      // Gentle floating motion on constellation nodes
      nodes.forEach(({ mesh, basePos, speed, phase }) => {
        mesh.position.x = basePos.x + Math.sin(elapsed * speed + phase) * 0.25;
        mesh.position.y = basePos.y + Math.cos(elapsed * speed * 0.8 + phase) * 0.2;
      });

      // Subtle particle & network rotation
      particles.rotation.y = elapsed * 0.015;
      networkLinesGroup.rotation.y = elapsed * 0.02;

      // Scroll-driven camera keyframe interpolation
      const sp = Math.max(0, Math.min(1, scrollProgress.current));
      let from = CAM_KF[0];
      let to   = CAM_KF[CAM_KF.length - 1];
      for (let i = 0; i < CAM_KF.length - 1; i++) {
        if (sp >= CAM_KF[i].t && sp <= CAM_KF[i + 1].t) {
          from = CAM_KF[i];
          to   = CAM_KF[i + 1];
          break;
        }
      }
      const segT = (sp - from.t) / Math.max(to.t - from.t, 0.0001);
      tempPos.lerpVectors(from.pos, to.pos, segT);

      // Mouse parallax
      tempPos.x += mouseRef.current.x * 0.35;
      tempPos.y += mouseRef.current.y * 0.24;

      camPos.lerp(tempPos, 0.04);
      camera.position.copy(camPos);
      camera.lookAt(lookAtPt);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(loadedTimeout);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [mouseRef, scrollProgress, onLoaded]);

  return <div ref={mountRef} className="absolute inset-0" />;
}

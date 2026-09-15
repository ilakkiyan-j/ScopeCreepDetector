'use client';

/**
 * ScopeScene.tsx — Pure Three.js WebGL scene (no React Three Fiber).
 *
 * Uses imperative Three.js in a useEffect to avoid the R3F reconciler
 * incompatibility with Next.js 14 App Router. Achieves identical visual
 * quality: crystal cluster, orbit nodes, connection lines, particle field,
 * scroll-driven camera, mouse parallax, additive-blend glow.
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

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
    });

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55, mount.clientWidth / mount.clientHeight, 0.1, 100
    );
    camera.position.set(0, 0, 5.5);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0f172a, 0.5));
    const pl1 = new THREE.PointLight(0x22d3ee, 3.5, 18);
    pl1.position.set(3, 4, 3);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x7c5cf8, 2.2, 18);
    pl2.position.set(-4, -2, -3);
    scene.add(pl2);
    const pl3 = new THREE.PointLight(0xffffff, 0.9, 18);
    pl3.position.set(0, 6, 0);
    scene.add(pl3);

    // ── Crystal Cluster ───────────────────────────────────────────────────────
    const SHARDS = [
      { pos: [0, 0, 0] as const,        rot: [0, 0, 0] as const,          sc: [0.82, 2.0, 0.82] as const,  color: 0x22d3ee, spd: 0.006  },
      { pos: [0.7, -0.4, 0.3] as const, rot: [0.4, 0.8, 0.2] as const,   sc: [0.5, 1.45, 0.46] as const,  color: 0xa78bfa, spd: 0.009  },
      { pos: [-0.8, 0.1, -0.2] as const,rot: [-0.3, 1.1, 0.5] as const,  sc: [0.46, 1.35, 0.41] as const, color: 0x818cf8, spd: 0.007  },
      { pos: [0.2, 0.9, -0.4] as const, rot: [0.6, 0.3, -0.4] as const,  sc: [0.36, 1.15, 0.32] as const, color: 0x22d3ee, spd: 0.011  },
      { pos: [-0.4, -0.8, 0.5] as const,rot: [-0.5, -0.6, 0.3] as const, sc: [0.33, 1.05, 0.3] as const,  color: 0x6366f1, spd: 0.0085 },
      { pos: [1.1, 0.3, -0.6] as const, rot: [0.2, -0.9, 0.7] as const,  sc: [0.29, 0.88, 0.26] as const, color: 0x34d399, spd: 0.0095 },
    ];

    const octGeo = new THREE.OctahedronGeometry(1, 0);
    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    const shardGroups: THREE.Group[] = SHARDS.map((cfg) => {
      const g = new THREE.Group();
      g.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      g.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
      g.scale.set(cfg.sc[0], cfg.sc[1], cfg.sc[2]);

      // Solid phong shard
      g.add(new THREE.Mesh(octGeo, new THREE.MeshPhongMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.6,
        shininess: 130,
        specular: new THREE.Color(cfg.color),
        side: THREE.DoubleSide,
      })));

      // Wireframe edge overlay
      g.add(new THREE.Mesh(octGeo, new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      })));

      // Additive glow shell (BackSide, slightly larger)
      const glowMesh = new THREE.Mesh(octGeo, new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      glowMesh.scale.setScalar(1.35);
      g.add(glowMesh);

      clusterGroup.add(g);
      return g;
    });

    // ── Orbit Nodes ───────────────────────────────────────────────────────────
    const NODE_CONFIGS = [
      { r: 2.4, spd: 0.38, off: 0,    color: 0x22d3ee },
      { r: 2.1, spd: 0.51, off: 2.1,  color: 0xa78bfa },
      { r: 2.7, spd: 0.30, off: 4.2,  color: 0x6366f1 },
      { r: 1.9, spd: 0.62, off: 1.05, color: 0x34d399 },
      { r: 2.5, spd: 0.44, off: 3.14, color: 0x22d3ee },
      { r: 3.0, spd: 0.25, off: 5.2,  color: 0x818cf8 },
    ];
    const nodeGeo = new THREE.SphereGeometry(0.048, 8, 8);
    const orbitNodes = NODE_CONFIGS.map(({ color }) => {
      const mesh = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      scene.add(mesh);
      return mesh;
    });

    // ── Connection Lines ──────────────────────────────────────────────────────
    const linesGroup = new THREE.Group();
    scene.add(linesGroup);
    const LINE_COLORS = [0x22d3ee, 0xa78bfa, 0x6366f1];
    for (let i = 0; i < 12; i++) {
      const t1 = (i / 12) * Math.PI * 2;
      const t2 = ((i + 3) / 12) * Math.PI * 2;
      const r1 = 1.5 + Math.random() * 1.5;
      const r2 = 1.5 + Math.random() * 1.5;
      const pts = [
        new THREE.Vector3(Math.cos(t1) * r1, (Math.random() - 0.5) * 1.2, Math.sin(t1) * r1),
        new THREE.Vector3(0, (Math.random() - 0.5) * 0.4, 0),
        new THREE.Vector3(Math.cos(t2) * r2, (Math.random() - 0.5) * 1.2, Math.sin(t2) * r2),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(
        new THREE.CatmullRomCurve3(pts).getPoints(24)
      );
      linesGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: LINE_COLORS[i % 3],
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })));
    }

    // ── Particle Field ────────────────────────────────────────────────────────
    const PARTICLE_COUNT = 300;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pPositions[i * 3]     = (Math.random() - 0.5) * 18;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      size: 0.025,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.38,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(particles);

    // ── Camera keyframes ──────────────────────────────────────────────────────
    const CAM_KF = [
      { t: 0,    pos: new THREE.Vector3(0, 0, 5.5)   },
      { t: 0.35, pos: new THREE.Vector3(2.5, 1, 4.5) },
      { t: 0.65, pos: new THREE.Vector3(-1.5, 0.5, 6)},
      { t: 1,    pos: new THREE.Vector3(0, -0.5, 7)  },
    ];
    const camPos    = new THREE.Vector3(0, 0, 5.5);
    const tempPos   = new THREE.Vector3();
    const lookAtPt  = new THREE.Vector3(0, 0, 0);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Signal loaded ─────────────────────────────────────────────────────────
    const loadedTimeout = setTimeout(() => onLoaded?.(), 700);

    // ── Render loop ───────────────────────────────────────────────────────────
    let animId: number;
    const t0 = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - t0) / 1000;

      // Cluster idle rotation + float
      clusterGroup.rotation.y = elapsed * 0.08;
      clusterGroup.position.y = Math.sin(elapsed * 0.42) * 0.06;

      // Per-shard rotation
      shardGroups.forEach((g, i) => {
        g.rotation.y += SHARDS[i].spd;
        g.rotation.x += SHARDS[i].spd * 0.5;
      });

      // Orbit nodes
      NODE_CONFIGS.forEach(({ r, spd, off }, i) => {
        const t = elapsed * spd + off;
        orbitNodes[i].position.set(
          Math.cos(t) * r,
          Math.sin(t * 0.7) * (r * 0.3),
          Math.sin(t) * r
        );
      });

      // Lines & particles drift
      linesGroup.rotation.y = elapsed * 0.055;
      particles.rotation.y  = elapsed * 0.015;
      particles.rotation.x  = Math.sin(elapsed * 0.01) * 0.05;

      // Pulsing point light
      pl1.intensity = 3.5 + Math.sin(elapsed * 1.4) * 0.6;
      pl2.intensity = 2.2 + Math.sin(elapsed * 0.9 + 1.2) * 0.5;

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
      tempPos.x += mouseRef.current.x * 0.45;
      tempPos.y += mouseRef.current.y * 0.32;

      camPos.lerp(tempPos, 0.038);
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

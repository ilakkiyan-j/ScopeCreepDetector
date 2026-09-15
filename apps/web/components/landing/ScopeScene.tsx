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
    renderer.toneMappingExposure = 1.25;
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

    // ── Lights ────────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pl1 = new THREE.PointLight(0x22d3ee, 3.2, 20);
    pl1.position.set(4, 4, 3);
    scene.add(pl1);

    const pl2 = new THREE.PointLight(0x7c5cf8, 2.5, 20);
    pl2.position.set(-4, -2, -2);
    scene.add(pl2);

    // ── Helper to build a 3D message card ─────────────────────────────────────
    function createMessageCard({
      width = 1.8,
      height = 1.1,
      cardColor = 0x22d3ee,
      lineColor = 0x94a3b8,
      badgeColor = 0xf43f5e,
      hasBadge = true,
    }) {
      const cardGroup = new THREE.Group();

      // Card glass panel geometry & material
      const cardGeo = new THREE.BoxGeometry(width, height, 0.06);
      const cardMat = new THREE.MeshPhongMaterial({
        color: isDark() ? 0x0f172a : 0xffffff,
        transparent: true,
        opacity: isDark() ? 0.65 : 0.85,
        shininess: 90,
        specular: new THREE.Color(cardColor),
        side: THREE.DoubleSide,
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardGroup.add(cardMesh);

      // Card border wireframe overlay
      const borderMat = new THREE.MeshBasicMaterial({
        color: cardColor,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const borderMesh = new THREE.Mesh(cardGeo, borderMat);
      cardGroup.add(borderMesh);

      // Header title bar line
      const headerGeo = new THREE.BoxGeometry(width * 0.45, 0.07, 0.03);
      const headerMat = new THREE.MeshBasicMaterial({
        color: cardColor,
        transparent: true,
        opacity: 0.85,
      });
      const headerMesh = new THREE.Mesh(headerGeo, headerMat);
      headerMesh.position.set(-width * 0.22, height * 0.28, 0.04);
      cardGroup.add(headerMesh);

      // Simulated chat message text lines
      const lineLengths = [0.75, 0.6, 0.4];
      lineLengths.forEach((len, idx) => {
        const lineGeo = new THREE.BoxGeometry(width * len, 0.045, 0.03);
        const lineMat = new THREE.MeshBasicMaterial({
          color: lineColor,
          transparent: true,
          opacity: isDark() ? 0.6 : 0.4,
        });
        const lineMesh = new THREE.Mesh(lineGeo, lineMat);
        lineMesh.position.set(-width * (0.45 - len * 0.5), height * 0.08 - idx * 0.16, 0.04);
        cardGroup.add(lineMesh);
      });

      // Scope creep warning badge dot
      if (hasBadge) {
        const badgeGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const badgeMat = new THREE.MeshBasicMaterial({
          color: badgeColor,
          transparent: true,
          opacity: 0.9,
        });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(width * 0.38, height * 0.3, 0.05);
        cardGroup.add(badgeMesh);
      }

      return { group: cardGroup, cardMat, borderMat };
    }

    // ── Create 3 Floating Message Cards ───────────────────────────────────────
    const cardsData = [
      { offset: 0.2,  radius: 3.2, yAmp: 0.8, color: 0x22d3ee, badge: 0xf43f5e, hasBadge: true },
      { offset: 2.1,  radius: 2.8, yAmp: 0.6, color: 0xa78bfa, badge: 0x10b981, hasBadge: false },
      { offset: 4.2,  radius: 3.5, yAmp: 0.9, color: 0x34d399, badge: 0xf43f5e, hasBadge: true },
    ];

    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);

    const cardInstances = cardsData.map((cfg) => {
      const cardObj = createMessageCard({
        width: 1.7,
        height: 1.05,
        cardColor: cfg.color,
        lineColor: isDark() ? 0x94a3b8 : 0x64748b,
        badgeColor: cfg.badge,
        hasBadge: cfg.hasBadge,
      });
      cardsGroup.add(cardObj.group);
      return { ...cardObj, cfg };
    });

    // ── Create Main Scope Agreement Panel (Left) ─────────────────────────────
    const mainPanelObj = createMessageCard({
      width: 2.4,
      height: 1.6,
      cardColor: 0x7c5cf8,
      lineColor: isDark() ? 0xc084fc : 0x6366f1,
      badgeColor: 0x22d3ee,
      hasBadge: true,
    });
    mainPanelObj.group.position.set(-2.8, 0.2, -0.5);
    mainPanelObj.group.rotation.set(0.08, 0.22, -0.04);
    scene.add(mainPanelObj.group);

    // ── Create Scope Ledger Verified Panel (Right) ───────────────────────────
    const ledgerPanelObj = createMessageCard({
      width: 2.2,
      height: 1.4,
      cardColor: 0x10b981,
      lineColor: 0x10b981,
      badgeColor: 0x10b981,
      hasBadge: false,
    });
    ledgerPanelObj.group.position.set(2.9, -0.3, -0.4);
    ledgerPanelObj.group.rotation.set(0.06, -0.25, 0.03);
    scene.add(ledgerPanelObj.group);

    // ── Connecting Curved Thread Lines ───────────────────────────────────────
    const threadLinesGroup = new THREE.Group();
    scene.add(threadLinesGroup);
    const THREAD_COLORS = [0x22d3ee, 0x7c5cf8, 0x10b981];
    for (let i = 0; i < 6; i++) {
      const t1 = (i / 6) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(-3.0, (Math.random() - 0.5) * 1.5, -0.8),
        new THREE.Vector3(0, (Math.random() - 0.5) * 0.8, 0),
        new THREE.Vector3(3.0, (Math.random() - 0.5) * 1.5, -0.8),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
      const mat = new THREE.LineBasicMaterial({
        color: THREAD_COLORS[i % 3],
        transparent: true,
        opacity: isDark() ? 0.25 : 0.18,
        blending: THREE.AdditiveBlending,
      });
      threadLinesGroup.add(new THREE.Line(geo, mat));
    }

    // ── Floating Particle Field ───────────────────────────────────────────────
    const PARTICLE_COUNT = 220;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pPositions[i * 3]     = (Math.random() - 0.5) * 16;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.03,
        color: 0x22d3ee,
        transparent: true,
        opacity: isDark() ? 0.45 : 0.3,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(particles);

    // ── Camera Keyframes & Motion ─────────────────────────────────────────────
    const CAM_KF = [
      { t: 0,    pos: new THREE.Vector3(0, 0, 6.2)   },
      { t: 0.35, pos: new THREE.Vector3(2.2, 0.8, 5.2) },
      { t: 0.65, pos: new THREE.Vector3(-1.8, 0.4, 6.4)},
      { t: 1,    pos: new THREE.Vector3(0, -0.4, 7.2)  },
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

      // Rotate and bob orbiting message cards
      cardInstances.forEach(({ group, cfg }, idx) => {
        const t = elapsed * 0.35 + cfg.offset;
        group.position.set(
          Math.cos(t) * cfg.radius,
          Math.sin(t * 1.2) * cfg.yAmp + Math.sin(elapsed * 0.5 + idx) * 0.15,
          Math.sin(t) * 0.8 - 0.5
        );
        group.rotation.set(
          0.06 * Math.sin(t),
          -t * 0.2 + idx * 0.4,
          0.08 * Math.cos(t * 0.8)
        );
      });

      // Subtle float on main panels
      mainPanelObj.group.position.y = 0.2 + Math.sin(elapsed * 0.48) * 0.08;
      ledgerPanelObj.group.position.y = -0.3 + Math.sin(elapsed * 0.52 + 1.2) * 0.08;

      // Particle & line drift
      particles.rotation.y = elapsed * 0.02;
      threadLinesGroup.rotation.y = elapsed * 0.03;

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
      tempPos.x += mouseRef.current.x * 0.4;
      tempPos.y += mouseRef.current.y * 0.28;

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

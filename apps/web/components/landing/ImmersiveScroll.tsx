'use client';

import { useEffect, useRef } from 'react';
import { scrollProgress, scrollVelocity, activeAct } from '@/lib/scrollBridge';

/**
 * ImmersiveScrollDriver
 *
 * Drives high-performance GSAP ScrollTrigger timelines, scroll velocity calculations,
 * multi-plane depth parallax, magnetic cursor physics, and blur-to-sharp storytelling transitions.
 */
export function ImmersiveScrollDriver() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    /* ── Scroll progress & velocity tracking ── */
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let velocityRaf: number;

    const updateScrollMetrics = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const currentScrollY = window.scrollY;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);

      scrollProgress.current = scrollable > 0 ? Math.min(Math.max(currentScrollY / scrollable, 0), 1) : 0;

      // Instantaneous normalized velocity (pixels per frame / 20)
      const rawVelocity = (currentScrollY - lastScrollY) / (dt / 16);
      scrollVelocity.current = Math.max(-10, Math.min(10, rawVelocity / 15));

      lastScrollY = currentScrollY;
      lastTime = now;
    };

    // Smoothly decay velocity when scrolling stops
    const decayVelocity = () => {
      scrollVelocity.current *= 0.88;
      if (Math.abs(scrollVelocity.current) < 0.001) scrollVelocity.current = 0;
      velocityRaf = requestAnimationFrame(decayVelocity);
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    velocityRaf = requestAnimationFrame(decayVelocity);
    updateScrollMetrics();

    /* ── GSAP Timelines & Storytelling Transitions ── */
    let ctx: { revert?: () => void } = {};
    (async () => {
      try {
        const gsap = (await import('gsap')).gsap;
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          /* ─ Hero Entrance Sequence ─ */
          const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          heroTl
            .from('[data-gsap="hero-line"]', {
              y: 70,
              opacity: 0,
              skewY: 3,
              filter: 'blur(8px)',
              duration: 1.1,
              stagger: 0.12,
              delay: 0.2,
            })
            .from(
              '[data-gsap="hero-sub"]',
              {
                y: 28,
                opacity: 0,
                filter: 'blur(6px)',
                duration: 0.9,
                ease: 'power3.out',
              },
              '-=0.7'
            )
            .from(
              '[data-gsap="hero-cta"]',
              {
                y: 20,
                opacity: 0,
                scale: 0.96,
                duration: 0.8,
                stagger: 0.08,
                ease: 'back.out(1.4)',
              },
              '-=0.6'
            );

          /* ─ Hero Scroll-Out Parallax (Scrubbed Depth) ─ */
          gsap.to('[data-gsap="hero-content"]', {
            scrollTrigger: {
              trigger: '[data-gsap="hero-content"]',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
            y: 90,
            opacity: 0.15,
            scale: 0.94,
            filter: 'blur(4px)',
          });

          /* ─ Section Headings (Blur-to-sharp + Skew entrance) ─ */
          document.querySelectorAll('[data-gsap="section-heading"]').forEach((el) => {
            gsap.from(el, {
              scrollTrigger: {
                trigger: el,
                start: 'top 86%',
                toggleActions: 'play none none none',
              },
              y: 50,
              opacity: 0,
              skewY: 2.5,
              filter: 'blur(10px)',
              duration: 1.0,
              ease: 'power4.out',
            });
          });

          /* ─ Multi-plane Parallax Depth Elements ─ */
          document.querySelectorAll('[data-gsap-depth]').forEach((el) => {
            const depth = parseFloat((el as HTMLElement).dataset.gsapDepth || '0.2');
            gsap.to(el, {
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
              y: () => depth * 140,
              ease: 'none',
            });
          });

          /* ─ Stat Counters (Dynamic count-up with spring pop) ─ */
          document.querySelectorAll('[data-gsap="stat"]').forEach((el) => {
            const target = el as HTMLElement;
            const endVal = parseFloat(target.dataset.value ?? '0');
            const prefix = target.dataset.prefix ?? '';
            const suffix = target.dataset.suffix ?? '';

            gsap.fromTo(
              target,
              { innerText: '0', scale: 0.85, opacity: 0 },
              {
                scrollTrigger: {
                  trigger: target,
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                },
                innerText: endVal,
                scale: 1,
                opacity: 1,
                duration: 1.6,
                ease: 'power3.out',
                snap: { innerText: endVal < 10 ? 0.1 : 1 },
                onUpdate() {
                  const v = parseFloat(target.innerText);
                  target.innerText = `${prefix}${endVal < 10 ? v.toFixed(0) : Math.round(v)}${suffix}`;
                },
              }
            );
          });

          /* ─ Feature Cards (3D Depth Stagger + Scale) ─ */
          document.querySelectorAll('[data-gsap="feature-card"]').forEach((el, i) => {
            gsap.from(el, {
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
              y: 55,
              opacity: 0,
              scale: 0.92,
              filter: 'blur(6px)',
              duration: 0.85,
              ease: 'power3.out',
              delay: (i % 3) * 0.1,
            });
          });

          /* ─ Step Cards (Alternating Horizontal 3D Slide) ─ */
          document.querySelectorAll('[data-gsap="step-card"]').forEach((el, i) => {
            gsap.from(el, {
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
              x: i % 2 === 0 ? -45 : 45,
              opacity: 0,
              filter: 'blur(5px)',
              duration: 0.85,
              ease: 'power3.out',
              delay: i * 0.08,
            });
          });

          /* ─ Generic Fade-Up Elements ─ */
          document.querySelectorAll('[data-gsap="fade-up"]').forEach((el) => {
            gsap.from(el, {
              scrollTrigger: {
                trigger: el,
                start: 'top 86%',
                toggleActions: 'play none none none',
              },
              y: 35,
              opacity: 0,
              filter: 'blur(6px)',
              duration: 0.85,
              ease: 'power3.out',
            });
          });

          /* ─ Final CTA Block Zoom & Aura ─ */
          gsap.from('[data-gsap="cta-block"]', {
            scrollTrigger: {
              trigger: '[data-gsap="cta-block"]',
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
            scale: 0.93,
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'power4.out',
          });

          /* ─ Magnetic Button Interaction Physics ─ */
          document.querySelectorAll<HTMLElement>('[data-gsap-magnetic]').forEach((btn) => {
            const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
            const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });

            const onMouseMove = (e: MouseEvent) => {
              const rect = btn.getBoundingClientRect();
              const relX = e.clientX - (rect.left + rect.width / 2);
              const relY = e.clientY - (rect.top + rect.height / 2);
              // Constrain max movement to 18px
              xTo(relX * 0.28);
              yTo(relY * 0.28);
            };

            const onMouseLeave = () => {
              xTo(0);
              yTo(0);
            };

            btn.addEventListener('mousemove', onMouseMove);
            btn.addEventListener('mouseleave', onMouseLeave);
          });
        });
      } catch {
        // Fallback: smooth scrolling still active
      }
    })();

    return () => {
      window.removeEventListener('scroll', updateScrollMetrics);
      cancelAnimationFrame(velocityRaf);
      if (ctx.revert) ctx.revert();
    };
  }, []);

  return null;
}

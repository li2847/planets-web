/**
 * Level2.jsx — 4-Screen Narrative Scroll (v4: clean, tuned)
 *
 * Changes from v3:
 *   • Glitch / aberration completely removed — clean visuals only
 *   • Screen 1: blur=true FadeContent entrance + body text (narrative.screen2)
 *               slides up via CSS animation (.l2-s1-body)
 *   • Screens 2 & 3: ScrollReveal clears blur in first ~20% of viewport travel
 *                     (wordAnimationEnd="top 60%", rotationEnd="top 60%")
 *                     Image AnimatedContent: distance 44→22, duration 0.9→1.3 (smoother)
 *   • Screen 4: ScrollReveal on confirmText + FadeContent for the button
 *   • useEffect([key]): parallax backgrounds only, no aberration
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PLANETS } from '../data/planets';
import ScrollFloat     from './ScrollFloat';
import ScrollReveal    from './ScrollReveal';
import AnimatedContent from './AnimatedContent';
import FadeContent     from './FadeContent';

gsap.registerPlugin(ScrollTrigger);

const NAV_LABELS = ['Kepler-452b', 'TOI-1452b', 'Proxima b'];

export default function Level2() {
  const wrapRef = useRef(null);
  const [planetIndex, setPlanetIndex] = useState(0);
  const [key, setKey]                 = useState(0);

  const planet         = PLANETS[planetIndex];
  const { narrative }  = planet;

  // ── Reset scroll + refresh ScrollTriggers after sections remount ──────────
  useEffect(() => {
    if (key === 0) return;
    if (wrapRef.current) wrapRef.current.scrollTop = 0;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [key]);

  // ── Background parallax (screens 2 & 3) ──────────────────────────────────
  // Background image moves at ~30% of scroll speed to create depth.
  // .l2-bg-layer has inset:-12% so there is always headroom — no empty edge.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const kills = [];
    wrap.querySelectorAll('.l2-planet-bg').forEach((bg) => {
      const section = bg.closest('.l2-section');
      if (!section) return;
      kills.push(
        ScrollTrigger.create({
          trigger: section,
          scroller: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          animation: gsap.fromTo(
            bg,
            { yPercent: -14 },
            { yPercent: 14, ease: 'none' }
          ),
        })
      );
    });

    return () => kills.forEach((k) => k?.kill?.());
  }, [key]);

  // ── l2-enter from level1.js ───────────────────────────────────────────────
  useEffect(() => {
    const handleEnter = (e) => {
      const idx = e.detail?.planetIndex ?? 0;
      setPlanetIndex(idx);
      setKey((k) => k + 1);
    };
    window.addEventListener('l2-enter', handleEnter);
    return () => window.removeEventListener('l2-enter', handleEnter);
  }, []);

  // ── Top-nav planet switch ─────────────────────────────────────────────────
  const switchPlanet = useCallback((idx) => {
    if (idx === planetIndex) return;
    setPlanetIndex(idx);
    setKey((k) => k + 1);
  }, [planetIndex]);

  // ── Back / confirm ────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    window.dispatchEvent(new CustomEvent('l2-confirm'));
  }, []);

  return (
    <div ref={wrapRef} id="l2-snap-container" className="l2-wrap">

      {/* FIXED CHROME ─────────────────────────────────────────────────────── */}
      <div className="l2-chrome">
        <button type="button" className="l2-back-btn" onClick={handleBack} aria-label="返回">
          ← 返回
        </button>
        <nav className="l2-planet-nav" aria-label="行星切换">
          {PLANETS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`l2-nav-item${i === planetIndex ? ' is-active' : ''}`}
              onClick={() => switchPlanet(i)}
            >
              {NAV_LABELS[i]}
            </button>
          ))}
        </nav>
      </div>

      {/* ── SCREEN 1 · Opening title + Chapter I body ──────────────────────
       *
       *  Entrance: FadeContent with blur=true fades the whole section in with
       *  a blur-to-clear effect as soon as Level 2 opens (element already in
       *  viewport, ScrollTrigger fires immediately).
       *
       *  Body text: .l2-s1-body uses a CSS animation (l2-s1-body-in) so it
       *  slides up cleanly without conflicting with FadeContent's GSAP opacity.
       */}
      <section className="l2-section l2-s1" key={`s1-${key}`}>
        <FadeContent
          duration={900}
          threshold={0.05}
          initialOpacity={0}
          blur={true}
          className="l2-s1-inner"
        >
          <p className="l2-planet-id-label">{planet.id}</p>

          <ScrollFloat
            scrollContainerRef={wrapRef}
            containerClassName="l2-float-heading"
            textClassName="l2-float-text"
            animationDuration={1.2}
            ease="back.inOut(2)"
            scrollStart="top bottom"
            scrollEnd="center center"
            stagger={0.025}
          >
            {narrative.floatTitle}
          </ScrollFloat>

          {/* Body text slides up via CSS animation, no GSAP conflict */}
          <div className="l2-s1-body">
            <p className="l2-reveal-text">{narrative.screen2}</p>
          </div>

          <p className="l2-s1-hint">向下滚动 ↓</p>
        </FadeContent>
      </section>

      {/* ── SCREEN 2 · Chapter I · image + narrative ───────────────────────
       *
       *  ScrollReveal tuning: wordAnimationEnd="top 60%" means the blur clears
       *  once the text's top edge reaches 60% from the viewport top — roughly
       *  within the first 20% of viewport travel after entry.
       *  rotationEnd matches so both animations finish together.
       *
       *  AnimatedContent: distance reduced to 22, duration increased to 1.3
       *  for a more measured, cinematic rise.
       */}
      <section className="l2-section l2-s2" key={`s2-${key}`}>
        <div className="l2-bg-layer" aria-hidden="true">
          <div className="l2-planet-bg" style={{ backgroundImage: `url(${planet.image})` }} />
        </div>

        <div className="l2-content-col">
          <p className="l2-chapter-label">CHAPTER I · ARRIVAL</p>

          <AnimatedContent
            distance={22}
            direction="vertical"
            duration={1.3}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={0.98}
            threshold={0.1}
            delay={0.08}
            className="l2-image-wrap"
          >
            <div className="l2-img-placeholder bg-gray-800 rounded-lg" />
          </AnimatedContent>

          <ScrollReveal
            scrollContainerRef={wrapRef}
            enableBlur
            baseOpacity={0}
            baseRotation={3}
            blurStrength={10}
            scrub={1.5}
            rotationEnd="top 70%"
            wordAnimationStart="top bottom+=8%"
            wordAnimationEnd="top 70%"
            textClassName="l2-reveal-text"
          >
            {narrative.screen2}
          </ScrollReveal>
        </div>
      </section>

      {/* ── SCREEN 3 · Chapter II · image + narrative ─────────────────────── */}
      <section className="l2-section l2-s3" key={`s3-${key}`}>
        <div className="l2-bg-layer l2-bg-layer--dimmer" aria-hidden="true">
          <div className="l2-planet-bg" style={{ backgroundImage: `url(${planet.image})` }} />
        </div>

        <div className="l2-content-col">
          <p className="l2-chapter-label">CHAPTER II · DISCOVERY</p>

          <AnimatedContent
            distance={22}
            direction="vertical"
            duration={1.3}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={0.98}
            threshold={0.1}
            delay={0.08}
            className="l2-image-wrap"
          >
            <div className="l2-img-placeholder bg-gray-800 rounded-lg" />
          </AnimatedContent>

          <ScrollReveal
            scrollContainerRef={wrapRef}
            enableBlur
            baseOpacity={0}
            baseRotation={-3}
            blurStrength={10}
            scrub={1.5}
            rotationEnd="top 70%"
            wordAnimationStart="top bottom+=8%"
            wordAnimationEnd="top 70%"
            textClassName="l2-reveal-text"
          >
            {narrative.screen3}
          </ScrollReveal>
        </div>
      </section>

      {/* ── SCREEN 4 · Epilogue + confirm ─────────────────────────────────────
       *
       *  narrative.confirmText holds the closing paragraph added to planets.js.
       *  Same ScrollReveal params as screens 2 & 3 for consistent feel.
       *  The button fades in via FadeContent once it enters view.
       */}
      <section className="l2-section l2-s4" key={`s4-${key}`}>
        <div className="l2-confirm-col">

          <ScrollReveal
            scrollContainerRef={wrapRef}
            enableBlur
            baseOpacity={0}
            baseRotation={2}
            blurStrength={10}
            scrub={1.5}
            rotationEnd="top 70%"
            wordAnimationStart="top bottom+=8%"
            wordAnimationEnd="top 70%"
            textClassName="l2-confirm-text"
          >
            {narrative.confirmText}
          </ScrollReveal>

          <FadeContent
            duration={800}
            threshold={0.05}
            initialOpacity={0}
            blur={false}
            className="l2-btn-wrap"
          >
            <p className="l2-confirm-hint">{planet.tagline}</p>
            <button type="button" className="l2-confirm-btn" onClick={handleBack}>
              确认迁徙
            </button>
          </FadeContent>

        </div>
      </section>

    </div>
  );
}

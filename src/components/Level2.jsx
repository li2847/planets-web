/**
 * Level2.jsx — 异星幻梦录 · THE GREAT ILLUSION
 *
 * 4-Chapter Narrative Scroll
 *   Screen 1 (s1): Series title + floatTitle + Chapter I (text only)
 *   Screen 2 (s2): Chapter II  + image placeholder + ScrollReveal text
 *   Screen 3 (s3): Chapter III + image placeholder + ScrollReveal text
 *   Screen 4 (s4): Chapter IV  + closing ScrollReveal + confirm button
 *
 * Interaction preserved:
 *   • FadeContent blur→clear entrance on Screen 1
 *   • ScrollReveal word-by-word blur-to-clear on Screens 2, 3, 4
 *   • AnimatedContent parallax image rise on Screens 2 & 3
 *   • Background parallax (planet image at 30% scroll speed)
 *
 * Per-planet theming:
 *   data-planet="kepler"  → emerald green accent
 *   data-planet="toi"     → deep blue / aurora accent
 *   data-planet="proxima" → warm amber / orange accent
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

  const planet              = PLANETS[planetIndex];
  const { narrative, level2Images } = planet;

  // ── Reset scroll + refresh ScrollTriggers after sections remount ──────────
  useEffect(() => {
    if (key === 0) return;
    if (wrapRef.current) wrapRef.current.scrollTop = 0;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [key]);

  // ── Background parallax (screens 1 & 4 only) ─────────────────────────────
  // Screens 2+3 share a single seamless BG wrapper — no per-section parallax
  // there so the image scrolls as one continuous starfield.
  // .l2-bg-layer has inset:-12% so GSAP parallax (±14%) has no empty-edge.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const kills = [];
    // Only parallax the bg layers that live directly inside a .l2-section
    // (i.e., s1 and s4). The shared .l2-s23-wrap BG is excluded on purpose.
    wrap.querySelectorAll('.l2-section > .l2-bg-layer .l2-planet-bg').forEach((bg) => {
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
  // handleBack: 顶部 "← 返回" 按钮 —— 行为不变，仍回 Level 1
  const handleBack = useCallback(() => {
    window.dispatchEvent(new CustomEvent('l2-confirm'));
  }, []);

  // handleEnterLevel3: 第 4 屏 "确认迁徙" 按钮 —— 进入对应行星的 Level 3
  // 把当前 planetIndex 透传出去，level3.js 用它选 PLANETS[idx].planetTheme
  // 并写到 #level-3 的 data-planet，供未来 per-planet 主题/文案使用。
  const handleEnterLevel3 = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('l3-enter', { detail: { planetIndex } })
    );
  }, [planetIndex]);

  return (
    <div
      ref={wrapRef}
      id="l2-snap-container"
      className="l2-wrap"
      data-planet={planet.planetTheme}
    >

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

      {/* ── SCREEN 1 · Chapter I label → Planet ID → Float title → Body ──────
       *
       *  Full-bleed PAGE1.png landscape behind the text (parallax via GSAP).
       *  Entrance: FadeContent blur=true fades the whole section on open.
       *  Body text: .l2-s1-body CSS animation slides up independently.
       */}
      <section className="l2-section l2-s1" key={`s1-${key}`}>
        <div className="l2-bg-layer" aria-hidden="true">
          <div className="l2-planet-bg l2-planet-bg--vivid"
               style={{ backgroundImage: `url(${level2Images.page1})` }} />
        </div>
        <FadeContent
          duration={900}
          threshold={0.05}
          initialOpacity={0}
          blur={true}
          className="l2-s1-inner"
        >
          {/* Chapter I label — topmost element */}
          <p className="l2-chapter-label l2-s1-ch-label">
            CHAPTER&nbsp;Ⅰ&nbsp;·&nbsp;{narrative.ch1Label}
          </p>

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
            <p className="l2-reveal-text">{narrative.ch1}</p>
          </div>

          <p className="l2-s1-hint">向下滚动 ↓</p>
        </FadeContent>
      </section>

      {/* ── SCREEN 2 · BG.png + PAGE2.png ───────────────────────────────────── */}
      <section className="l2-section l2-s2" key={`s2-${key}`}>
        <div className="l2-bg-layer" aria-hidden="true">
          <div
            className="l2-planet-bg l2-planet-bg--vivid"
            style={{ backgroundImage: `url(${level2Images.bg})` }}
          />
        </div>

        <div className="l2-content-col">
            <p className="l2-chapter-label l2-s2-ch-label">
              CHAPTER&nbsp;Ⅱ&nbsp;·&nbsp;{narrative.ch2Label}
            </p>

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
              <img
                className="l2-content-img l2-content-img--s2"
                src={level2Images.page2}
                alt={`${planet.id} — Chapter II`}
              />
            </AnimatedContent>

            <ScrollReveal
              scrollContainerRef={wrapRef}
              containerClassName="l2-s2-body-wrap"
              enableBlur
              baseOpacity={0}
              baseRotation={3}
              blurStrength={10}
              scrub={1.5}
              rotationEnd="top 80%"
              wordAnimationStart="top bottom+=8%"
              wordAnimationEnd="top 80%"
              textClassName="l2-reveal-text l2-s2-body-text"
            >
              {narrative.ch2}
            </ScrollReveal>
          </div>
      </section>

      {/* ── SCREEN 3 · BG1.png + PAGE3.png ──────────────────────────────────── */}
      <section className="l2-section l2-s3" key={`s3-${key}`}>
        <div className="l2-bg-layer" aria-hidden="true">
          <div
            className="l2-planet-bg l2-planet-bg--vivid"
            style={{ backgroundImage: `url(${level2Images.bg1})` }}
          />
        </div>

        <div className="l2-content-col">
            <p className="l2-chapter-label l2-s3-ch-label">
              CHAPTER&nbsp;Ⅲ&nbsp;·&nbsp;{narrative.ch3Label}
            </p>

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
              <img
                className="l2-content-img l2-content-img--s3"
                src={level2Images.page3}
                alt={`${planet.id} — Chapter III`}
              />
            </AnimatedContent>

            <ScrollReveal
              scrollContainerRef={wrapRef}
              containerClassName="l2-s3-body-wrap"
              enableBlur
              baseOpacity={0}
              baseRotation={-3}
              blurStrength={10}
              scrub={1.5}
              rotationEnd="top 80%"
              wordAnimationStart="top bottom+=8%"
              wordAnimationEnd="top 80%"
              textClassName="l2-reveal-text l2-s3-body-text"
            >
              {narrative.ch3}
            </ScrollReveal>
          </div>
      </section>

      {/* ── SCREEN 4 · Chapter IV · Closing narrative + confirm ───────────────
       *
       *  Full-bleed PAGE4.png as background (parallax via GSAP).
       *  ScrollReveal on ch4 text. The button fades in via FadeContent.
       */}
      <section className="l2-section l2-s4" key={`s4-${key}`}>
        <div className="l2-bg-layer l2-bg-layer--dimmer" aria-hidden="true">
          <div className="l2-planet-bg l2-planet-bg--vivid"
               style={{ backgroundImage: `url(${level2Images.page4})` }} />
        </div>
        <div className="l2-confirm-col">

          <p className="l2-chapter-label l2-s4-ch-label">
            CHAPTER&nbsp;Ⅳ&nbsp;·&nbsp;{narrative.ch4Label}
          </p>

          <ScrollReveal
            scrollContainerRef={wrapRef}
            containerClassName="l2-s4-body-wrap"
            enableBlur
            baseOpacity={0}
            baseRotation={2}
            blurStrength={10}
            scrub={1.5}
            rotationEnd="top 70%"
            wordAnimationStart="top bottom+=8%"
            wordAnimationEnd="top 70%"
            textClassName="l2-confirm-text l2-s4-body-text"
          >
            {narrative.ch4}
          </ScrollReveal>

          <FadeContent
            duration={800}
            threshold={0.05}
            initialOpacity={0}
            blur={false}
            className="l2-btn-wrap"
          >
            <p className="l2-confirm-hint">{planet.tagline}</p>
            <button type="button" className="l2-confirm-btn" onClick={handleEnterLevel3}>
              几天后
            </button>
          </FadeContent>

        </div>
      </section>

    </div>
  );
}

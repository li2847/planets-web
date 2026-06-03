/**
 * Level2.jsx — 异星幻梦录 · THE GREAT ILLUSION
 *
 * v6 · 电影级时间轴重构
 * ─────────────────────────────────────────────────────────────
 *  舞台模型（取代旧的纵向叠 section 流式滚动）：
 *    .l2-wrap           ← 真实滚动容器（overflow-y: scroll）
 *      └─ .l2-chrome    ← 固定顶部导航 + 返回
 *      └─ .l2-stage-spacer (height: 500vh)   ← 仅提供滚动距离
 *           └─ .l2-stage  (position: sticky; top: 0; height: 100vh; overflow: hidden)
 *                ├─ .l2-section.l2-s1  (absolute, inset:0, height:100vh)
 *                ├─ .l2-section.l2-s2  (默认 opacity:0; scale:0.8)
 *                ├─ .l2-section.l2-s3  (默认 opacity:0; scale:0.8)
 *                ├─ .l2-section.l2-s4  (默认 opacity:0; scale:0.8)
 *                └─ .l2-gate-container (z-index:99, 飞船大门覆盖在所有 section 之上)
 *                     ├─ .l2-gate.l2-gate--right   底层
 *                     └─ .l2-gate.l2-gate--left    上层（盖在 RIGHT 上面）
 *
 *  GSAP Timeline（scrub）：均匀节奏「停留 = 过渡」，每段 1 个时间单位
 *    [0 → 1]  飞船大门对开（保留戏剧感）
 *    [1 → 2]  停留 Screen 1
 *    [2 → 3]  s1 → s2 呼吸式渐变（scale 0.98 ↔ 1.02 + opacity cross-fade）
 *    [3 → 4]  停留 Screen 2
 *    [4 → 5]  s2 → s3 渐变
 *    [5 → 6]  停留 Screen 3
 *    [6 → 7]  s3 → s4 渐变
 *    [7 → 8]  停留 Screen 4（阅读 + 点确认）
 *
 *  Per-planet theming（保留）：
 *    data-planet="kepler"  → 翡翠
 *    data-planet="toi"     → 极光蓝
 *    data-planet="proxima" → 琥珀红
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PLANETS } from '../data/planets';
import ScrollFloat     from './ScrollFloat';
import ScrollReveal    from './ScrollReveal';
import FadeContent     from './FadeContent';

gsap.registerPlugin(ScrollTrigger);

const NAV_LABELS = ['Kepler-452b', 'TOI-1452b', 'Proxima b'];

export default function Level2() {
  const wrapRef   = useRef(null);
  const spacerRef = useRef(null);   // 作为所有 ScrollReveal 的 triggerRef
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

  // ── Cinematic Timeline (gates + hyperspace zoom transitions) ──────────────
  // 取代旧的 yPercent 纵向推进 & 每屏 BG 视差。所有 section 在同一舞台叠加，
  // 由 ScrollTrigger(scrub) 驱动一个统一的时间轴：0 段开门 → 1/2/3 段跃迁。
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let handleL2Exit = null;

    const ctx = gsap.context(() => {
      const stage     = wrap.querySelector('.l2-stage');
      const spacer    = wrap.querySelector('.l2-stage-spacer');
      const leftGate  = wrap.querySelector('.l2-gate--left');
      const rightGate = wrap.querySelector('.l2-gate--right');
      const s1 = wrap.querySelector('.l2-s1');
      const s2 = wrap.querySelector('.l2-s2');
      const s3 = wrap.querySelector('.l2-s3');
      const s4 = wrap.querySelector('.l2-s4');
      const s2BgLayer = s2?.querySelector('.l2-bg-layer');
      const s2Image = wrap.querySelector('.l2-content-img--s2');
      const s3ImageWrap = s3?.querySelector('.l2-image-wrap');
      const s3Image = wrap.querySelector('.l2-content-img--s3');
      if (!stage || !spacer || !s1 || !s2 || !s3 || !s4) return;

      // 初始状态 — 保证刷新/切星球后从干净的视觉起点开始
      gsap.set(s1, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%' });
      gsap.set([s2, s3, s4], {
        autoAlpha: 0,
        scale: 0.98,
        transformOrigin: '50% 50%',
      });
      // Stage-2 背景镜头初始态：偏转 + 偏移 + 高模糊，滚动时归中并对焦
      if (s2BgLayer) {
        gsap.set(s2BgLayer, {
          filter: 'blur(20px)',
          xPercent: -8,
          rotateY: -8,
          scale: 1.04,
          transformOrigin: '50% 50%',
        });
      }
      // Stage-2 中央目标延迟捕获：在对焦达到 80% 前保持不可见
      if (s2Image) {
        gsap.set(s2Image, { autoAlpha: 0, scale: 0.84, rotation: 0 });
      }
      if (s3ImageWrap) {
        gsap.set(s3ImageWrap, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%' });
      }
      if (s3Image) {
        gsap.set(s3Image, { autoAlpha: 0, scale: 0.78, rotation: 0, transformOrigin: '50% 50%' });
      }
      if (leftGate)  gsap.set(leftGate,  { xPercent: 0 });
      if (rightGate) gsap.set(rightGate, { xPercent: 0 });
      let s2FloatTween = null;
      const startS2Float = () => {
        if (!s2Image) return;
        s2FloatTween?.kill();
        s2FloatTween = gsap.fromTo(
          s2Image,
          { rotation: -3 },
          {
            rotation: 3,
            duration: 2,
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true,
          }
        );
      };
      const stopS2Float = () => {
        if (!s2Image) return;
        s2FloatTween?.kill();
        s2FloatTween = null;
        gsap.set(s2Image, { rotation: 0 });
      };
      const revealS2Image = () => {
        if (!s2Image) return;
        gsap.fromTo(
          s2Image,
          { autoAlpha: 0, scale: 0.84 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
            onStart: startS2Float,
          }
        );
      };
      const revealS3ImageBurst = () => {
        if (!s3Image) return;
        gsap.to(s3Image, {
          keyframes: [
            { autoAlpha: 1, scale: 0.82, rotation: 0, duration: 0.45, ease: 'power2.in' },
            { autoAlpha: 1, scale: 1.00, rotation: 0, duration: 0.5, ease: 'power3.out' },
            { autoAlpha: 1, scale: 1.00, rotation: 0, duration: 0.45, ease: 'back.out(2.2)' },
          ],
          overwrite: 'auto',
        });
      };


      const GATE_DURATION   = 1;
      const REVEAL_DURATION = 1;  // 文字从模糊逐渐清晰的滚动时长
      const HOLD_DURATION   = 1;  // 文字清晰后纯停留，再继续滑才切屏
      const JUMP_DURATION   = 1;  // 屏间渐变过渡时长

      // 每屏节奏：Gate → [文字reveal] → [纯hold] → [过渡] → 下一屏
      let _t = 0;
      const gateEnd     = (_t += GATE_DURATION);    // 1   大门全开
      const s1RevealEnd = (_t += REVEAL_DURATION);  // 2   S1 文字全亮
      const s1HoldEnd   = (_t += HOLD_DURATION);    // 3   S1 停留结束
      const s12End      = (_t += JUMP_DURATION);    // 4   S2 入场完成
      const s2RevealEnd = (_t += REVEAL_DURATION);  // 5   S2 文字全亮
      const s2HoldEnd   = (_t += HOLD_DURATION);    // 6   S2 停留结束
      const s23End      = (_t += JUMP_DURATION);    // 7   S3 入场完成
      const s3RevealEnd = (_t += REVEAL_DURATION);  // 8   S3 文字全亮
      const s3HoldEnd   = (_t += HOLD_DURATION);    // 9   S3 停留结束
      const s34End      = (_t += JUMP_DURATION);    // 10  S4 入场完成
      const s4RevealEnd = (_t += REVEAL_DURATION);  // 11  S4 文字全亮
      const timelineEnd = (_t += HOLD_DURATION);    // 12  S4 停留（读文 + 点确认）

      const tl = gsap.timeline({
        defaults: { ease: 'power1.inOut' },
        scrollTrigger: {
          trigger:  spacer,
          scroller: wrap,
          start:    'top top',
          end:      '+=600%',   // 滚动距离减半：手感提速到原来的 2 倍
          scrub:    1,
          invalidateOnRefresh: true,
        },
      });

      // ── 阶段 0 → 1：飞船大门对开 ─────────────────────────────────────
      if (leftGate) {
        tl.to(leftGate,  { xPercent: -100, duration: GATE_DURATION, ease: 'power3.in' }, 0);
      }
      if (rightGate) {
        tl.to(rightGate, { xPercent:  100, duration: GATE_DURATION, ease: 'power3.in' }, 0);
      }

      // ── 文字倾斜进入（主 timeline 驱动，与 ScrollReveal 对焦同步）─────
      // 每屏文字初始 3° 倾斜，随 scrub 在 reveal 期归零，配合逐字对焦效果。
      const s1Text = wrap.querySelector('.l2-s1 .scroll-reveal');
      const s2Text = wrap.querySelector('.l2-s2 .scroll-reveal');
      const s3Text = wrap.querySelector('.l2-s3 .scroll-reveal');
      const s4Text = wrap.querySelector('.l2-s4 .scroll-reveal');

      [s1Text, s2Text, s3Text, s4Text].forEach((el) => {
        if (el) gsap.set(el, { rotate: 3, transformOrigin: '0% 50%' });
      });
      if (s1Text) tl.to(s1Text, { rotate: 0, ease: 'power1.out', duration: REVEAL_DURATION }, gateEnd);
      if (s2Text) tl.to(s2Text, { rotate: 0, ease: 'power1.out', duration: REVEAL_DURATION }, s12End);
      if (s3Text) tl.to(s3Text, { rotate: 0, ease: 'power1.out', duration: REVEAL_DURATION }, s23End);
      if (s4Text) tl.to(s4Text, { rotate: 0, ease: 'power1.out', duration: REVEAL_DURATION }, s34End);

      // ── 屏间渐变（文字停留结束后触发，用户多滑一段才切屏）────────────
      tl.to(s1, { autoAlpha: 0, scale: 1.02, duration: JUMP_DURATION }, s1HoldEnd)
        .to(s2, { autoAlpha: 1, scale: 1.00, duration: JUMP_DURATION }, s1HoldEnd);
      // Stage-2 背景：先左右摇摆，再回到正中，同时逐步清晰
      if (s2BgLayer) {
        tl.to(
          s2BgLayer,
          { xPercent: 3.5, rotateY: 5, duration: REVEAL_DURATION * 0.55, ease: 'none' },
          s12End
        );
        tl.to(
          s2BgLayer,
          { xPercent: 0, rotateY: 0, scale: 1, duration: REVEAL_DURATION * 0.45, ease: 'none' },
          s12End + REVEAL_DURATION * 0.55
        );
        tl.to(
          s2BgLayer,
          { filter: 'blur(0px)', duration: REVEAL_DURATION, ease: 'none' },
          s12End
        );
      }
      // Stage-2 目标延迟捕获：对焦 80% 后才出现，并开始失重漂浮
      if (s2Image) tl.call(revealS2Image, [], s12End + REVEAL_DURATION * 0.8);

      tl.to(s2, { autoAlpha: 0, scale: 1.02, duration: JUMP_DURATION }, s2HoldEnd)
        .to(s3, { autoAlpha: 1, scale: 1.00, duration: JUMP_DURATION }, s2HoldEnd);
      // Stage-3 中央元素弹射出现（自动触发，不要求继续滚轮）
      if (s3Image) tl.call(revealS3ImageBurst, [], s23End + 0.03);
      // 切出 Stage-2 时停止无限循环，避免后台泄漏
      tl.call(stopS2Float, [], s2HoldEnd);

      tl.to(s3, { autoAlpha: 0, scale: 1.02, duration: JUMP_DURATION }, s3HoldEnd)
        .to(s4, { autoAlpha: 1, scale: 1.00, duration: JUMP_DURATION }, s3HoldEnd);

      // 延长时间轴到 timelineEnd，确保 S4 停留期完整映射到滚动距离
      tl.to({}, { duration: HOLD_DURATION }, s4RevealEnd);

      handleL2Exit = () => stopS2Float();
      window.addEventListener('l2-exit', handleL2Exit);
    }, wrap);

    // 让新建的 ScrollTrigger 计算到正确的 scroller 尺寸
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      if (handleL2Exit) {
        window.removeEventListener('l2-exit', handleL2Exit);
      }
      ctx.revert();
    };
  }, [key]);

  // ── l2-enter from level1.js ───────────────────────────────────────────────
  useEffect(() => {
    const handleEnter = (e) => {
      const idx = e.detail?.planetIndex ?? 0;
      // Keep planet state in sync before Level-2 fades in,
      // preventing first-frame flash of default Kepler assets.
      flushSync(() => {
        setPlanetIndex(idx);
        setKey((k) => k + 1);
      });
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

      {/* ── SCROLL SPACER · 提供更长滚动距离，舞台 sticky 在内部 ───────── */}
      <div className="l2-stage-spacer" ref={spacerRef} key={`stage-${key}`}>
        <div className="l2-stage">

          {/* ── SCREEN 1 · Chapter I label → Planet ID → Float title → Body ── */}
          <section className="l2-section l2-s1">
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

              <ScrollReveal
                scrollContainerRef={wrapRef}
                triggerRef={spacerRef}
                containerClassName="l2-s1-body"
                enableBlur
                baseOpacity={0}
                baseRotation={0}
                blurStrength={10}
                scrub
                start="8% top"
                end="15% top"
                textClassName="l2-reveal-text"
              >
                {narrative.ch1}
              </ScrollReveal>

              <p className="l2-s1-hint">向下滚动 ↓</p>
            </FadeContent>
          </section>

          {/* ── SCREEN 2 · BG.png（与 Screen 3 共享）+ PAGE2.png ──────────── */}
          <section className="l2-section l2-s2">
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

              <div className="l2-image-wrap">
                <img
                  className="l2-content-img l2-content-img--s2"
                  src={level2Images.page2}
                  alt={`${planet.id} — Chapter II`}
                />
              </div>

              <ScrollReveal
                scrollContainerRef={wrapRef}
                triggerRef={spacerRef}
                containerClassName="l2-s2-body-wrap"
                enableBlur
                baseOpacity={0}
                baseRotation={0}
                blurStrength={10}
                scrub
                start="31% top"
                end="38% top"
                textClassName="l2-reveal-text l2-s2-body-text"
              >
                {narrative.ch2}
              </ScrollReveal>
            </div>
          </section>

          {/* ── SCREEN 3 · BG2.png + PAGE3.png ───────────────────────────── */}
          <section className="l2-section l2-s3">
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

              <div className="l2-image-wrap">
                <img
                  className="l2-content-img l2-content-img--s3"
                  src={level2Images.page3}
                  alt={`${planet.id} — Chapter III`}
                />
              </div>

              <ScrollReveal
                scrollContainerRef={wrapRef}
                triggerRef={spacerRef}
                containerClassName="l2-s3-body-wrap"
                enableBlur
                baseOpacity={0}
                baseRotation={0}
                blurStrength={10}
                scrub
                start="54% top"
                end="62% top"
                textClassName="l2-reveal-text l2-s3-body-text"
              >
                {narrative.ch3}
              </ScrollReveal>
            </div>
          </section>

          {/* ── SCREEN 4 · Chapter IV · 收尾文案 + 确认按钮 ──────────────── */}
          <section className="l2-section l2-s4">
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
                triggerRef={spacerRef}
                containerClassName="l2-s4-body-wrap"
                enableBlur
                baseOpacity={0}
                baseRotation={0}
                blurStrength={10}
                scrub
                start="77% top"
                end="85% top"
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

          {/* ── 飞船大门 · LEFT 在 RIGHT 上面 ─────────────────────────────
           *
           *  z-index: 99 让大门覆盖在所有 section 之上（顶部 chrome 是 200，仍可用）。
           *  pointer-events: none 让透明区域不挡按钮。开场二门紧贴合拢，
           *  GSAP 控制 xPercent ±100 双向滑出。
           */}
          <div className="l2-gate-container" aria-hidden="true">
            <div
              className="l2-gate l2-gate--right"
              style={{ backgroundImage: `url(${level2Images.right})` }}
            />
            <div
              className="l2-gate l2-gate--left"
              style={{ backgroundImage: `url(${level2Images.left})` }}
            />
          </div>

        </div>
      </div>

    </div>
  );
}

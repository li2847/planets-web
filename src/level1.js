/**
 * THE SECOND CRADLE — Level 1 Carousel Logic
 *
 * Converted from the original script.js (CDN globals) to an ES module.
 *
 * Public API:
 *   bootLevel1()        — initializes the GSAP scene and returns a controller:
 *     {
 *       switchTo(dir),       // 'next' | 'prev' — advances activeIndex
 *       goToLevel2(),        // returns true if accepted, false if rejected
 *       goBackToLevel1(),
 *       getActiveIndex(),
 *       getNarrativeLevel(),
 *       isAnimating(),
 *     }
 *
 *   initLevel1()        — kept as a thin alias for legacy callers; just calls
 *                         bootLevel1() and ignores the controller. New code
 *                         should call bootLevel1() and wire its own buttons.
 *
 * Level 2 communication (window CustomEvents):
 *   Dispatches 'l2-enter' { detail: { planetIndex } } on goToLevel2().
 *   Dispatches 'l2-exit'  on goBackToLevel1().
 *   Listens for 'l2-confirm' (sent by Level2.jsx) → triggers goBackToLevel1().
 */
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

import { PLANETS } from './data/planets';

/** Level 1 UI scatter directions for the enter-Level-2 animation. */
const LEVEL1_SCATTER_DEFS = [
    { sel: "#level-1 .brand",              x: -85,  y: -95 },
    { sel: "#level-1 .tagline",            x: 100,  y: -45 },
    { sel: "#level-1 .coord-box",          x: -115, y: 95  },
    { sel: "#level-1 .headline",           x: 0,    y: -110 },
    { sel: "#level-1 .annotation",         x: 120,  y: 35  },
    { sel: "#level-1 .nav-btn--prev",      x: -140, y: 55  },
    { sel: "#level-1 .nav-btn--next",      x: 140,  y: 55  },
    { sel: "#level-1 .side-planet--left",  x: -160, y: 90  },
    { sel: "#level-1 .side-planet--right", x: 160,  y: 90  },
    { sel: "#level-1 .migrate-cta",        x: 0,    y: 130 },
];

/**
 * bootLevel1 — initializes the GSAP scene and returns a controller.
 *
 * Returns null if required DOM elements are missing (e.g. called too early).
 */
export function bootLevel1() {
    /* ── DOM references ─────────────────────────────────────────────────── */
    const scene           = document.getElementById("scene");
    const planetIdEl      = document.getElementById("planet-id");
    const planetTitleEl   = document.getElementById("planet-title");
    const taglineEl       = document.getElementById("tagline");
    const coordDataEl     = document.getElementById("coord-data");
    const annotationTxtEl = document.getElementById("annotation-text");

    const headlineInner   = document.getElementById("headline-inner");
    const annotationInner = document.getElementById("annotation-inner");
    const planetStage     = document.getElementById("planet-stage");

    const slotA    = document.getElementById("slot-a");
    const slotB    = document.getElementById("slot-b");
    const slotAImg = document.getElementById("slot-a-img");
    const slotBImg = document.getElementById("slot-b-img");

    const planetLeft      = document.getElementById("planet-left");
    const planetRight     = document.getElementById("planet-right");
    const planetLeftImg   = document.getElementById("planet-left-img");
    const planetRightImg  = document.getElementById("planet-right-img");

    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const glowEl  = document.querySelector(".planet__glow");

    if (!scene || !planetStage || !slotA || !slotB) {
        console.warn(
            "[level1] Required DOM elements not found — aborting init.",
            { scene, planetStage, slotA, slotB },
        );
        return null;
    }

    [slotAImg, slotBImg].forEach((imgEl) => imgEl.classList.add("planet__img"));

    /* ── State ──────────────────────────────────────────────────────────── */
    const state = {
        index: 0,
        active:   { slot: slotA, img: slotAImg },
        incoming: { slot: slotB, img: slotBImg },
        isAnimating: false,
        tl: null,
        narrativeLevel: 1,
        levelTransitioning: false,
        planetBreatheTween: null,
    };

    /* ── Helpers ────────────────────────────────────────────────────────── */
    function lockPlanetStage() {
        if (state.narrativeLevel >= 2) return;
        gsap.set(planetStage, { x: 0, y: 0, clearProps: "x,y" });
    }

    function renderCoords(planet) {
        coordDataEl.innerHTML = planet.coords
            .map(({ k, v }) => `<li><span>${k}</span>: ${v}</li>`)
            .join("");
    }

    /* ── 距离数字滚动动画（按星球 id 配置）─────────────────────────── */
    const DIST_ANIM = {
        "KEPLER-452B":        { from: 1350, to: 1400, duration: 2800, decimals: 0, suffix: " 光年" },
        "TOI-1452 B":         { from: 50,   to: 100,  duration: 2400, decimals: 0, suffix: " 光年" },
        "PROXIMA CENTAURI B": { from: 3.74, to: 4.24, duration: 2000, decimals: 2, suffix: " 光年" },
    };
    let _distRafId = null;

    function runDistCountUp(planet) {
        if (_distRafId !== null) {
            cancelAnimationFrame(_distRafId);
            _distRafId = null;
        }
        const cfg = DIST_ANIM[planet.id];
        if (!cfg) return;
        const el = annotationTxtEl.querySelector(".sc-dist-num");
        if (!el) {
            console.warn("[level1] .sc-dist-num element not found in annotation HTML for", planet.id);
            return;
        }
        const { from, to, duration, decimals, suffix } = cfg;
        const startTs = performance.now();
        const fmt = (v) => (decimals > 0 ? v.toFixed(decimals) : String(Math.round(v))) + suffix;
        const easeOut = (t) => 1 - (1 - t) ** 3;
        el.textContent = fmt(from);
        function tick(now) {
            const t = Math.min((now - startTs) / duration, 1);
            el.textContent = fmt(from + (to - from) * easeOut(t));
            _distRafId = t < 1 ? requestAnimationFrame(tick) : null;
        }
        _distRafId = requestAnimationFrame(tick);
    }

    function writeTextFor(planet) {
        planetIdEl.textContent    = planet.id;
        planetTitleEl.textContent = planet.title;
        taglineEl.textContent     = planet.tagline;
        annotationTxtEl.innerHTML = planet.annotation;
        renderCoords(planet);
        runDistCountUp(planet);
    }

    function stopPlanetCornerBreathing() {
        if (state.planetBreatheTween) {
            state.planetBreatheTween.kill();
            state.planetBreatheTween = null;
        }
    }

    function startPlanetCornerBreathing() {
        if (state.narrativeLevel < 2) return;
        stopPlanetCornerBreathing();
        state.planetBreatheTween = gsap.to(planetStage, {
            scale: "+=0.042",
            repeat: -1,
            yoyo: true,
            duration: 3.1,
            ease: "sine.inOut",
        });
    }

    function updateSidePlanets(currentIndex) {
        const n = PLANETS.length;
        const prev = PLANETS[(currentIndex - 1 + n) % n];
        const next = PLANETS[(currentIndex + 1) % n];
        planetLeftImg.src  = prev.image;
        planetRightImg.src = next.image;
    }

    function preload() {
        PLANETS.forEach((p) => {
            const img = new Image();
            img.src = p.image;
        });
    }

    /* ── Intro animation ────────────────────────────────────────────────── */
    function intro() {
        lockPlanetStage();
        gsap.set([slotA, slotB], { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0, filter: "blur(0px)" });
        gsap.set(slotA, { opacity: 1 });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".brand",        { y: -18, opacity: 0, duration: 0.8 }, 0)
          .from(taglineEl,       { x: 24,  opacity: 0, duration: 0.8 }, 0.1)
          .from(headlineInner,   { y: 28,  opacity: 0, duration: 1.0 }, 0.15)
          .from(slotA,           { scale: 0.72, opacity: 0, duration: 1.3, ease: "power4.out" }, 0.2)
          .from(".coord-box",    { opacity: 0, duration: 0.8, clearProps: "transform,opacity" }, 0.55)
          .from(annotationInner, { x: 28, opacity: 0, duration: 0.8 }, 0.55)
          .from([planetLeft, planetRight], {
              scale: 0.6,
              opacity: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: "back.out(1.3)",
          }, 0.7)
          .from(".nav-btn", { opacity: 0, y: 14, duration: 0.5, stagger: 0.08 }, 1.0);
    }

    /* ── Carousel switch ────────────────────────────────────────────────── */
    function switchTo(dir) {
        if (state.narrativeLevel !== 1) return;
        if (state.isAnimating) return;
        lockPlanetStage();

        const n = PLANETS.length;
        const nextIndex =
            dir === "next"
                ? (state.index + 1) % n
                : (state.index - 1 + n) % n;

        if (nextIndex === state.index) return;

        const nextPlanet = PLANETS[nextIndex];
        const sign = dir === "next" ? 1 : -1;
        const ww = window.innerWidth;

        state.isAnimating = true;
        scene.classList.add("is-switching");

        state.incoming.img.src = nextPlanet.image;
        gsap.set(state.incoming.slot, {
            x: sign * ww * 0.62,
            y: 0,
            scale: 0.2,
            rotation: sign * 18,
            opacity: 0,
            filter: "blur(14px)",
        });
        state.incoming.slot.classList.add("is-active");

        const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
                lockPlanetStage();
                state.active.slot.classList.remove("is-active");
                gsap.set(state.active.slot, {
                    x: 0, y: 0, scale: 1, rotation: 0,
                    opacity: 0, filter: "blur(0px)",
                });
                state.active.img.src = "";

                const tmp = state.active;
                state.active   = state.incoming;
                state.incoming = tmp;
                state.index    = nextIndex;

                scene.classList.remove("is-switching");
                state.isAnimating = false;
            },
        });
        state.tl = tl;

        /* 2A. Side planets fade out */
        tl.to([planetLeft, planetRight], {
            opacity: 0, scale: 0.82, filter: "blur(6px)",
            duration: 0.28, ease: "power2.in",
        }, 0);

        /* 2B. Active planet exits */
        tl.to(state.active.slot, {
            motionPath: {
                path: [
                    { x: 0,                 y: 0 },
                    { x: -sign * ww * 0.26, y: 0 },
                    { x: -sign * ww * 0.66, y: 0 },
                ],
                curviness: 1.5,
                autoRotate: false,
            },
            scale: 0.2,
            rotation: -sign * 24,
            opacity: 0,
            filter: "blur(12px)",
            duration: 1.1,
            ease: "power2.inOut",
        }, 0);

        /* 2C. Incoming planet enters */
        tl.to(state.incoming.slot, {
            motionPath: {
                path: [
                    { x: sign * ww * 0.62, y: 0 },
                    { x: sign * ww * 0.24, y: 0 },
                    { x: 0,                y: 0 },
                ],
                curviness: 1.5,
                autoRotate: false,
            },
            scale: 1,
            rotation: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power3.out",
        }, 0.32);

        /* 2D. Glow flash */
        tl.to(".planet__glow", { opacity: 0.35, duration: 0.55, ease: "power2.in" }, 0)
          .to(".planet__glow", { opacity: 1,    duration: 0.6,  ease: "power2.out" }, 0.55);

        /* 2E. Title blur-in */
        tl.to(planetTitleEl, { opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power2.in" }, 0);

        /* 2F. Mid-point text swap (instant) */
        tl.add(() => {
            writeTextFor(nextPlanet);
            updateSidePlanets(nextIndex);
            glowEl.style.background = nextPlanet.glowBg;
        }, 0.55);

        tl.fromTo(
            planetTitleEl,
            { opacity: 0, filter: "blur(10px)" },
            { opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out", clearProps: "filter,opacity" },
            0.58,
        );

        /* 2G. Side planets fade in */
        tl.fromTo(
            [planetLeft, planetRight],
            { opacity: 0, scale: 0.82, filter: "blur(6px)" },
            { opacity: 0.95, scale: 1, filter: "blur(0px)", duration: 0.65, stagger: 0.08, ease: "power3.out", clearProps: "filter" },
            0.75,
        );
    }

    /* ── Level transition: Level 1 → Level 2 ───────────────────────────── */
    function goToLevel2() {
        if (state.narrativeLevel !== 1) return false;
        if (state.levelTransitioning || state.isAnimating) return false;

        const lv2 = document.getElementById("level-2");
        if (!lv2) return false;

        state.levelTransitioning = true;
        scene.classList.add("is-entering-level-2");

        const scatteredEls = LEVEL1_SCATTER_DEFS
            .map((def) => document.querySelector(def.sel))
            .filter(Boolean);

        lv2.removeAttribute("hidden");
        lv2.setAttribute("aria-hidden", "false");
        gsap.set(lv2, { opacity: 0 });

        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            onComplete: () => {
                state.levelTransitioning = false;
                state.narrativeLevel     = 2;
                scatteredEls.forEach((el) => {
                    el.setAttribute("aria-hidden", "true");
                    el.style.pointerEvents = "none";
                });
                planetStage.classList.add("is-level2-anchor");
                planetStage.style.zIndex       = "5";
                planetStage.style.pointerEvents = "none";
                startPlanetCornerBreathing();
                // #level-2 is overflow:hidden; the inner React scroll container
                // (#l2-snap-container) handles the scroll. Reset it here as well
                // as in the Level2.jsx l2-enter handler (belt-and-suspenders).
                const innerScroll = document.getElementById("l2-snap-container");
                if (innerScroll) innerScroll.scrollTop = 0;

                // Notify React Level 2 component — triggers planet/key state update
                window.dispatchEvent(
                    new CustomEvent("l2-enter", { detail: { planetIndex: state.index } })
                );
            },
        });

        LEVEL1_SCATTER_DEFS.forEach((def, i) => {
            const el = document.querySelector(def.sel);
            if (!el) return;
            tl.to(el, { opacity: 0, x: def.x, y: def.y, duration: 0.9 }, i * 0.035);
        });

        // 星球直接淡出消失，不再移动缩小
        tl.to(planetStage, { opacity: 0, duration: 0.45, ease: "power2.in" }, 0);

        tl.to(lv2, { opacity: 1, duration: 0.95, ease: "power2.out" }, 0.32);

        return true;
    }

    /* ── Level transition: Level 2 → Level 1 ───────────────────────────── */
    function goBackToLevel1() {
        if (state.narrativeLevel !== 2) return;
        if (state.levelTransitioning) return;

        const lv2 = document.getElementById("level-2");
        if (!lv2) return;

        state.levelTransitioning = true;

        // Notify React Level 2 component (it can clean up ScrollTriggers etc.)
        window.dispatchEvent(new CustomEvent("l2-exit"));

        // Reset the inner React scroll container (not #level-2 which is overflow:hidden)
        const innerScroll = document.getElementById("l2-snap-container");
        if (innerScroll) innerScroll.scrollTop = 0;

        const scatteredEls = LEVEL1_SCATTER_DEFS
            .map((def) => document.querySelector(def.sel))
            .filter(Boolean);

        stopPlanetCornerBreathing();

        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            onComplete: () => {
                state.levelTransitioning = false;
                state.narrativeLevel     = 1;
                lv2.setAttribute("hidden", "");
                lv2.setAttribute("aria-hidden", "true");
                gsap.set(lv2, { opacity: 0 });
                planetStage.classList.remove("is-level2-anchor");
                planetStage.style.zIndex        = "";
                planetStage.style.pointerEvents = "";
                // GSAP が書き込んだ top / left / transform / margin-top を全て消して
                // CSS に完全に委ねる。これをしないと次回カルーセル操作時に
                // lockPlanetStage() が x,y しか消さず位置がズレたままになる。
                gsap.set(planetStage, { clearProps: "transform,top,left,marginTop,opacity" });
                scatteredEls.forEach((el) => {
                    el.removeAttribute("aria-hidden");
                    el.style.pointerEvents = "";
                });
                scene.classList.remove("is-entering-level-2");
            },
        });

        tl.to(lv2, { opacity: 0, duration: 0.65, ease: "power2.in" }, 0);

        // 星球直接淡入出现，不再从角落飞回中央
        tl.to(planetStage, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0.55);

        LEVEL1_SCATTER_DEFS.forEach((def, i) => {
            const el = document.querySelector(def.sel);
            if (!el) return;
            tl.to(el, { opacity: 1, x: 0, y: 0, duration: 0.88, ease: "power2.out", clearProps: "opacity" }, 0.12 + i * 0.03);
        });
    }

    /* ── Planet-stage click ripple ──────────────────────────────────────── */
    /* This stays inside level1.js because it's purely a Level 1 visual effect
     * tightly coupled to the planetStage element & PLANETS color data. */
    function planetStageClick() {
        if (goToLevel2()) return;
        if (state.levelTransitioning || state.narrativeLevel !== 1) return;

        const ripple = document.createElement("div");
        ripple.className = "planet__ripple";
        ripple.style.borderColor = PLANETS[state.index].rippleColor;
        planetStage.appendChild(ripple);
        gsap.fromTo(
            ripple,
            { scale: 0.85, opacity: 0.65 },
            {
                scale: 2.8,
                opacity: 0,
                duration: 1.1,
                ease: "power2.out",
                onComplete: () => ripple.remove(),
            }
        );
    }
    planetStage.addEventListener("click", planetStageClick);

    /* ── Startup ────────────────────────────────────────────────────────── */
    preload();
    writeTextFor(PLANETS[0]);
    updateSidePlanets(0);
    glowEl.style.background = PLANETS[0].glowBg;
    intro();

    /* ── Public controller (wired by main.jsx to the DOM buttons) ───────── */
    return {
        switchTo,
        goToLevel2,
        goBackToLevel1,
        getActiveIndex:    () => state.index,
        getNarrativeLevel: () => state.narrativeLevel,
        isAnimating:       () => state.isAnimating || state.levelTransitioning,
    };
}

/**
 * Legacy alias — older callers used initLevel1() and ignored the return value.
 * New code should prefer bootLevel1() and wire its own DOM buttons via the
 * returned controller (see src/main.jsx).
 */
export function initLevel1() {
    return bootLevel1();
}

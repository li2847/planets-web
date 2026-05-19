/**
 * THE SECOND CRADLE — main.jsx
 *
 * THIS FILE IS THE CONTROL CENTER for the whole site.
 * Everything you can click in Level 1 is wired up RIGHT HERE.
 *
 * ── What lives where ────────────────────────────────────────────────────────
 *
 *   src/data/planets.js           PLANETS array (single source of truth)
 *   src/level1.js                 bootLevel1() — GSAP carousel + Level 2 transition
 *   src/components/Level2.jsx     React 4-screen narrative (mounted into #level-2)
 *   src/main.jsx (this file)      Boots both, wires DOM clicks, handles diagnostics
 *
 * ── Click bindings (all in ONE place — wireLevel1Buttons below) ─────────────
 *
 *   #btn-prev                  →  level1.switchTo('next')
 *   #btn-next                  →  level1.switchTo('prev')
 *   #btn-confirm-migration     →  level1.goToLevel2()
 *   ArrowLeft / ArrowRight     →  level1.switchTo('next' | 'prev')
 *   window 'l2-confirm' event  →  level1.goBackToLevel1()  (sent by Level2.jsx)
 *
 *   ※ Arrow semantics are intentionally inverted: "next button" displays the
 *     PREVIOUS planet because the carousel reads right-to-left visually.
 *     This matches the original script.js behaviour — do NOT swap unless
 *     the visual carousel direction is also changed.
 *
 * ── Why the user's previous "click does nothing" bug happened ──────────────
 *
 *   pages/LevelOne.jsx was created as an EMPTY file.  main.jsx was therefore
 *   importing from an empty module → initLevel1 was undefined → the carousel
 *   never booted → all buttons appeared dead.  The fix: pages/LevelOne.jsx now
 *   re-exports bootLevel1, AND main.jsx wires the buttons EXPLICITLY HERE so
 *   any future stub-file regression is immediately visible.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

// CSS for Level 2 (loaded once here so Level2.jsx stays free of side-effect CSS)
import './components/level2.css';

// Pages
import { bootLevel1 } from './pages/LevelOne';
import LevelTwo       from './pages/LevelTwo';
import { bootLevel3 } from './level3';

// Galaxy starfield background for Level 1
import Galaxy from './components/Galaxy/Galaxy';

// Level 3 · Stage-2 React islands
import OrbitImages from './components/OrbitImages';
import Level3TextReveals from './components/Level3TextReveals';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Run `fn` once the DOM is parsed and ready.  Vite injects <script type=module>
 * which is deferred, so usually the DOM is already complete by the time this
 * file executes — but this guard makes initialization order bulletproof.
 */
function whenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/**
 * Mount the React Level 2 tree into <section id="level-2">.
 * #level-2 stays [hidden] until level1.goToLevel2() removes the attribute.
 */
function mountLevel2() {
  const host = document.getElementById('level-2');
  if (!host) {
    console.error('[main] #level-2 host element not found in HTML.');
    return;
  }
  ReactDOM.createRoot(host).render(
    <React.StrictMode>
      <LevelTwo />
    </React.StrictMode>
  );
}

/**
 * Mount the OrbitImages React island into <div id="l3-orbit-mount">.
 * This is a Level-3 Stage-2 component (the orbital ring of placeholder images
 * floating above the focus area). Static skeleton siblings (focus placeholder
 * + text area) live in plain HTML inside .l3-scene-2; only the orbit needs
 * React because the motion-driven offset-path animation is non-trivial in
 * vanilla JS. Mounting at boot time is fine — the orbit itself sits inside
 * .l3-scene-2 which is opacity:0/pointer-events:none until a future Stage-2
 * scroll-enter animation reveals it.
 */
function mountLevel3OrbitImages() {
  const host = document.getElementById('l3-orbit-mount');
  if (!host) {
    console.warn('[main] #l3-orbit-mount not found — skipping Level 3 OrbitImages.');
    return;
  }

  // 4 placeholder images — picsum random/grayscale; replace with real assets
  // when the scene's narrative content is finalized.
  const orbitImages = [
    'https://picsum.photos/200/200?grayscale&random=1',
    'https://picsum.photos/200/200?grayscale&random=2',
    'https://picsum.photos/200/200?grayscale&random=3',
    'https://picsum.photos/200/200?grayscale&random=4',
  ];

  ReactDOM.createRoot(host).render(
    <React.StrictMode>
      <OrbitImages
        images={orbitImages}
        shape="ellipse"
        radiusX={650}                             /* 横向再放宽，让轨道明显环绕长方形主元素 */
        radiusY={150}
        duration={50}
        itemSize={220}                            /* 放大轨道占位图，与放大后的中心主元素保持比例 */
        rotation={0}
        responsive={true}
        showPath={true}
        pathColor="rgba(255,255,255,0.22)"
        pathWidth={1.5}
        depth={true}                              /* fake-3D 遮挡：下半圆轨道项盖在主元素上，上半圆被主元素挡住 */
        centerContent={
          <div className="focus-element-placeholder">主元素占位</div>
        }
      />
    </React.StrictMode>
  );
}

/**
 * Mount Level-3 narrative text as small React islands.
 * The outer layout nodes stay in index.html so level3.js can keep controlling
 * their position in the master scene timeline; React only owns the text reveal.
 */
function mountLevel3TextReveals() {
  const slots = [
    ['.elem-caption-placeholder', 'ch1'],
    ['.focus-text-area', 'ch2'],
    ['.l3-s3-text-col', 'ch3'],
    ['.l3-s4-text-col', 'ch4'],
  ];

  slots.forEach(([selector, slot]) => {
    const host = document.querySelector(`#level-3 ${selector}`);
    if (!host) {
      console.warn(`[main] Level 3 text host not found: ${selector}`);
      return;
    }

    ReactDOM.createRoot(host).render(
      <React.StrictMode>
        <Level3TextReveals slot={slot} />
      </React.StrictMode>
    );
  });
}

/**
 * Mount the Galaxy starfield into <div id="galaxy-bg-root">.
 * This is purely a background visual layer — pointer-events:none in CSS
 * ensures it never intercepts clicks on Level 1 planets/buttons.
 */
function mountGalaxyBackground() {
  const host = document.getElementById('galaxy-bg-root');
  if (!host) {
    console.warn('[main] #galaxy-bg-root not found — skipping starfield.');
    return;
  }
  ReactDOM.createRoot(host).render(
    <React.StrictMode>
      <Galaxy
        starSpeed={0}
        density={0.3}
        hueShift={30}
        speed={0.6}
        glowIntensity={0.1}
        saturation={0.05}
        twinkleIntensity={0.3}
        rotationSpeed={0.05}
        mouseInteraction={false}
        mouseRepulsion={false}
        transparent={false}
      />
    </React.StrictMode>
  );
}

/**
 * Wire all Level 1 DOM buttons + keyboard + cross-level events to the
 * controller returned by bootLevel1().  This is the SINGLE place where
 * activeIndex changes are triggered from user input.
 */
function wireLevel1Buttons(level1) {
  const btnPrev    = document.getElementById('btn-prev');
  const btnNext    = document.getElementById('btn-next');
  const btnConfirm = document.getElementById('btn-confirm-migration');

  // ── Sanity check: surface any missing element so the dev console says so
  const missing = [];
  if (!btnPrev)    missing.push('#btn-prev');
  if (!btnNext)    missing.push('#btn-next');
  if (!btnConfirm) missing.push('#btn-confirm-migration');
  if (missing.length) {
    console.warn('[main] Missing buttons:', missing.join(', '));
  }

  // ── Arrow buttons ─────────────────────────────────────────────────────────
  // Inverted on purpose — see header comment.
  btnNext?.addEventListener('click', () => {
    console.debug('[main] btn-next click → switchTo("prev")');
    level1.switchTo('prev');
  });
  btnPrev?.addEventListener('click', () => {
    console.debug('[main] btn-prev click → switchTo("next")');
    level1.switchTo('next');
  });

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (level1.getNarrativeLevel() !== 1) return;
    if (e.key === 'ArrowRight')      level1.switchTo('prev');
    else if (e.key === 'ArrowLeft')  level1.switchTo('next');
  });

  // ── Confirm Migration button (Level 1 → Level 2) ─────────────────────────
  btnConfirm?.addEventListener('click', () => {
    console.debug(
      '[main] btn-confirm-migration click → goToLevel2()',
      'activeIndex=', level1.getActiveIndex(),
    );
    const accepted = level1.goToLevel2();
    if (!accepted) {
      console.warn('[main] goToLevel2 was rejected — current state:',
        { narrativeLevel: level1.getNarrativeLevel(), animating: level1.isAnimating() });
    }
  });

  // ── Confirm Migration button on Level 2 (Level 2 → Level 1) ──────────────
  // Level2.jsx dispatches this when its in-component button is clicked.
  window.addEventListener('l2-confirm', () => {
    console.debug('[main] l2-confirm received → goBackToLevel1()');
    level1.goBackToLevel1();
  });
}

/* ── Bootstrap sequence ──────────────────────────────────────────────────── */

whenReady(() => {
  // 0. Mount the Galaxy starfield background (purely visual, no interaction).
  mountGalaxyBackground();

  // 1. Mount React Level 2 first (so #l2-snap-container exists when level1
  //    later resets its scrollTop on goToLevel2 onComplete).
  mountLevel2();

  // 1b. Mount the Level-3 Stage-2 OrbitImages React island. Safe to mount at
  //     boot: its parent .l3-scene-2 is opacity:0/pointer-events:none until
  //     the future Stage-2 scroll-enter animation reveals it.
  mountLevel3OrbitImages();
  mountLevel3TextReveals();

  // 2. Boot the GSAP scene → returns the controller.
  const level1 = bootLevel1();
  if (!level1) {
    console.error('[main] bootLevel1() returned null — Level 1 cannot run.');
    return;
  }

  // 3. Wire all Level 1 buttons to the controller.
  wireLevel1Buttons(level1);

  // 4. Boot Level 3 scroll-engine skeleton (Stage-1 only).
  //    Pure event-listener setup; does NOT create any ScrollTrigger yet (lazy
  //    init on first 'l3-enter'). Entry is wired from Level 2's "确认迁徙"
  //    button → dispatch('l3-enter', { detail: { planetIndex } }).
  const level3 = bootLevel3();

  // 5. Expose controllers on window for in-browser debugging only.
  //    Strip this in production by removing the next block.
  if (import.meta.env.DEV) {
    window.__level1 = level1;
    if (level3) window.__level3 = level3;
    console.info(
      '[main] Boot complete. Try in console:\n' +
      '  __level1.switchTo("next")\n' +
      '  __level1.goToLevel2()\n' +
      '  __level1.getActiveIndex()\n' +
      '  __level3.show(0|1|2)   // open the corresponding planet\'s Level 3\n' +
      '  __level3.hide()'
    );
  }
});

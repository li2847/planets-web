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
  // 1. Mount React Level 2 first (so #l2-snap-container exists when level1
  //    later resets its scrollTop on goToLevel2 onComplete).
  mountLevel2();

  // 2. Boot the GSAP scene → returns the controller.
  const level1 = bootLevel1();
  if (!level1) {
    console.error('[main] bootLevel1() returned null — Level 1 cannot run.');
    return;
  }

  // 3. Wire all Level 1 buttons to the controller.
  wireLevel1Buttons(level1);

  // 4. Expose the controller on window for in-browser debugging only.
  //    Strip this in production by removing the next line.
  if (import.meta.env.DEV) {
    window.__level1 = level1;
    console.info(
      '[main] Boot complete. Try in console:\n' +
      '  __level1.switchTo("next")\n' +
      '  __level1.goToLevel2()\n' +
      '  __level1.getActiveIndex()'
    );
  }
});

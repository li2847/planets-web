/**
 * pages/LevelOne.jsx — Level 1 orbital carousel page
 *
 * Level 1 is a vanilla-GSAP scene rendered into static HTML in index.html
 * (#level-1).  No React tree — but bootLevel1() returns a controller object
 * that main.jsx uses to wire up DOM buttons.
 *
 * ── Public controller API (returned by bootLevel1) ──────────────────────────
 *     switchTo(dir)            // 'next' | 'prev' — animates planet swap
 *     goToLevel2()             // true if accepted, false if rejected
 *     goBackToLevel1()
 *     getActiveIndex()         // current PLANETS index (was: activeIndex)
 *     getNarrativeLevel()      // 1 or 2 (was: setLevel target value)
 *     isAnimating()            // true if a transition is in flight
 *
 * ── Cross-level transitions (custom window events) ─────────────────────────
 *
 *  L1 → L2:
 *    controller.goToLevel2()
 *      → removes [hidden] on #level-2 (GSAP fade-in)
 *      → window.dispatchEvent( CustomEvent('l2-enter', { detail: { planetIndex } }) )
 *      → Level2.jsx receives → setPlanetIndex → reset scroll → bump key
 *
 *  L2 → L1:
 *    Level2.jsx confirm button
 *      → window.dispatchEvent( CustomEvent('l2-confirm') )
 *      → main.jsx listener → controller.goBackToLevel1()
 *      → GSAP fades out #level-2, restores [hidden]
 */
export { bootLevel1, initLevel1 } from '../level1';

/**
 * pages/LevelTwo.jsx — Level 2 narrative-scroll page
 *
 * The implementation lives in src/components/Level2.jsx.
 * This file is the pages-layer re-export so main.jsx can import all
 * levels from src/pages/ uniformly.
 *
 * ── What Level2 owns ────────────────────────────────────────────────────────
 *   • Internal scroll container (#l2-snap-container / .l2-wrap)
 *   • 4-screen vertical narrative: ScrollFloat → ScrollReveal × 2 → button
 *   • GSAP ScrollTrigger instances (re-created on each l2-enter via key bump)
 *   • planetIndex state (set from the l2-enter event detail)
 *
 * ── What Level2 does NOT own ────────────────────────────────────────────────
 *   • Visibility of #level-2 — controlled by level1.js via [hidden] + GSAP
 *   • The global GSAP timeline (state.tl in level1.js)
 *   • Planet switching in Level 1 (left/right arrows in level1.js)
 *
 * ── Variables the user asked about ─────────────────────────────────────────
 *   setLevel   → not needed; level transitions are event-based (see LevelOne.jsx)
 *   timeline   → state.tl inside level1.js; Level2 never needs a reference to it
 */
export { default } from '../components/Level2';

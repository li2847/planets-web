/**
 * THE SECOND CRADLE — Level 3 Scroll Engine (Skeleton · Stage-1 & Stage-2)
 *
 * 第三级共有 4 屏 × 3 套（每个行星一套）。3 套行星共用同一份 HTML 容器，
 * 通过 #level-3[data-planet="kepler|toi|proxima"] 区分主题与内容（当前是
 * 占位骨架阶段，三者占位内容一致；填真实内容时按 planetIndex 切换即可）。
 *
 * ── 滚动总览（timeline 归一到 0–1，scrub:true 1:1 联动滚动）─────────────
 *
 *     滚动:   0       30%        55%        75%       100%
 *             │        │          │          │         │
 *     Stage-1 ├──phase-1──┤
 *                       ├──phase-2──┤
 *     ─────────────────────────────┤
 *     cross:                       ├crossfade┤
 *     Stage-2                                ├── dwell ───┤
 *
 *   · Stage-1 (0 → 0.55)
 *       phase-1 (0    → 0.30): main scale 1→0.5；side x:100→0 + opacity 0→1
 *       phase-2 (0.30 → 0.55): main 再缩到 0.42、side 缩到 0.85；caption y:24→0 + opacity 0→1
 *   · Slide hand-off (0.55 → 0.75)  ← "Level 2 风格"的纵向接力，非 crossfade
 *       .stage-1-wrapper yPercent  0 → -100   （整层向上滑出视口顶）
 *       .l3-scene-2      yPercent 100 → 0     （整层从视口底向上滑入）
 *       两者步调相同，中点正好"一半 stage-1 顶部 + 一半 stage-2 底部"无缝拼合。
 *   · Stage-2 dwell (0.75 → 1.00)
 *       目前不动；这段滚动预算留给未来 Stage-2 自身动画
 *       （用一个空 tween 把 timeline 撑到 1.0，让 scrub 映射完整）
 *
 * ── Stage-1 三件元素 ────────────────────────────────────────────────────
 *     .elem-main-placeholder      屏幕正中心（GSAP scale）
 *     .elem-side-placeholder      主元素右侧（GSAP x / scale / opacity）
 *     .elem-caption-placeholder   屏幕下方（GSAP y / opacity）
 *
 * ── Stage-2 容器（内容由 React 岛 + 纯 HTML 拼出，本文件只控外层 opacity）
 *     .l3-scene-2                 整屏 wrapper（z-index 7，叠在 stage-1 之上）
 *       ├─ .l3-orbit-area         #l3-orbit-mount 挂载 <OrbitImages />
 *       └─ .l3-focus-content      focus 色块 + 文案区
 *
 * ── 关键设计原则 ────────────────────────────────────────────────────────
 *  1. 「懒初始化」: ScrollTrigger 不在页面加载时就创建，因为此时 #level-3
 *     还是 hidden（display:none），scroller 高度为 0，eager 创建会让 GSAP
 *     拿到错乱的尺寸，并且任何让透明滚动层在 hidden 状态下渲染的 CSS
 *     都会把 Level 2 的滚轮事件吃掉。
 *     现在只在第一次 'l3-enter' 后调一次 initEngineOnce()。
 *
 *  2. 「不动 Level 1 / Level 2 源码」: 本文件不修改 level1.js 与
 *     Level2.jsx 的现有逻辑；它只:
 *       · 监听 window 'l3-enter'  →  显示 #level-3, 淡出 #level-2 & #planet-stage
 *       · 监听 window 'l3-exit'   →  反向操作（dev 入口）
 *
 *  3. 「per-planet」: 进入时把 PLANETS[planetIndex].planetTheme 写到
 *     #level-3 的 data-planet 上（kepler / toi / proxima），未来可通过
 *     CSS 选择器 #level-3[data-planet="kepler"] .xxx 给三套行星上不同色调。
 *
 *  4. 「屏幕角落星球」: 进入 Level 3 时把 #planet-stage 一起淡出 —— 它在
 *     Level 2 模式下被锚在屏幕左上角并循环呼吸；在 Level 3 不需要它。
 *     退出 Level 3 时把它的 opacity 还原。
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PLANETS } from './data/planets';

gsap.registerPlugin(ScrollTrigger);

export function bootLevel3() {
    /* ── DOM refs（注意：现在不预先创建任何 ScrollTrigger）─────────────── */
    const lv3           = document.getElementById('level-3');
    const lv2           = document.getElementById('level-2');
    const planetStage   = document.getElementById('planet-stage');
    const scroller      = document.getElementById('scroll-manager-container');
    const fakeContent   = document.getElementById('scroll-manager-fake-content');
    const stage1Wrapper = lv3?.querySelector('.stage-1-wrapper');
    const stage2El      = lv3?.querySelector('.l3-scene-2');
    const mainEl        = lv3?.querySelector('.elem-main-placeholder');
    const sideEl        = lv3?.querySelector('.elem-side-placeholder');
    const captionEl     = lv3?.querySelector('.elem-caption-placeholder');
    const backBtn       = document.getElementById('l3-back-btn');

    if (!lv3 || !scroller || !fakeContent || !mainEl || !sideEl || !captionEl
        || !stage1Wrapper || !stage2El) {
        console.warn('[level3] Required DOM elements not found — aborting init.', {
            lv3, scroller, fakeContent, mainEl, sideEl, captionEl, stage1Wrapper, stage2El,
        });
        return null;
    }

    /* ── 懒初始化：ScrollTrigger 只在第一次进入 Level 3 时创建一次 ─────── */
    let initialized = false;
    let stageTL = null;

    function initEngineOnce() {
        if (initialized) return;
        initialized = true;

        /* ── 初始视觉态 ─────────────────────────────────────────────────
         * xPercent/yPercent 把 "left:50%/top:50% + 自身居中" 这套定位
         * 完整交给 GSAP，scrub 反算到位时也不会冲掉 transform。
         * stage1Wrapper / stage2El 的初始 opacity 在这里固定（不依赖
         * CSS 的 opacity:0，避免和 GSAP 的 inline style 冲突）。 */
        gsap.set(mainEl, {
            xPercent: -50, yPercent: -50,
            scale: 1,
            transformOrigin: '50% 50%',
        });
        gsap.set(sideEl, {
            yPercent: -50,
            // x:500 起步：让侧栏从屏幕右侧明显滑入，而不是看起来"从主元素旁边冒出"
            x: 500, opacity: 0,
            scale: 1,
        });
        gsap.set(captionEl, {
            xPercent: -50,
            y: 24, opacity: 0,
        });
        // Stage-1 留在原位（yPercent:0）；Stage-2 预先平移到视口下方（yPercent:100）
        // —— 这样滚动开始时 stage-2 完全在屏外（哪怕 .l3-scene-2 的 CSS opacity:0
        // 失效也不会闪一下），等接力滑动时再被翻上来。两层 opacity 一直保持 1，
        // 不做淡入淡出，只做位移，跟 Level 2 一节滚到下一节的感觉一致。
        gsap.set(stage1Wrapper, { yPercent: 0,   opacity: 1 });
        gsap.set(stage2El,      { yPercent: 100, opacity: 1 });

        /* ── 主时间轴（scrub:true，timeline 归一到 0–1） ─────────────── */
        stageTL = gsap.timeline({
            scrollTrigger: {
                trigger: fakeContent,
                scroller: scroller,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                invalidateOnRefresh: true,
                // markers: true,  // 调试时打开
            },
        });

        // ── Stage-1 phase-1 (0 → 0.30)：主元素缩到 0.5；侧栏从右滑入 ──
        stageTL.to(mainEl, { scale: 0.5,         ease: 'none', duration: 0.30 }, 0);
        stageTL.to(sideEl, { x: 0, opacity: 1,    ease: 'none', duration: 0.30 }, 0);

        // ── Stage-1 phase-2 (0.30 → 0.55)：主+侧再缩；文案淡入 ──
        stageTL.to(mainEl,    { scale: 0.42,      ease: 'none', duration: 0.25 }, 0.30);
        stageTL.to(sideEl,    { scale: 0.85,      ease: 'none', duration: 0.25 }, 0.30);
        stageTL.to(captionEl, { y: 0, opacity: 1, ease: 'none', duration: 0.25 }, 0.30);

        // ── Slide hand-off (0.55 → 0.75)：Stage-1 上滑出顶，Stage-2 从底上滑入 ──
        // 两条同步，ease:'none' 保持跟滚动 1:1，与 Level 2 节间滚动手感对齐。
        stageTL.to(stage1Wrapper, { yPercent: -100, ease: 'none', duration: 0.20 }, 0.55);
        stageTL.to(stage2El,      { yPercent: 0,    ease: 'none', duration: 0.20 }, 0.55);

        // ── Stage-2 dwell (0.75 → 1.00)：留 25% 滚动预算给 Stage-2，
        //    当前不放任何动画；用一个空 tween 把 timeline 撑到 1.0，
        //    让 scrub 映射保持完整（否则 timeline 最长到 0.75 就结束，
        //    scroll 后面的 25% 都会停在 0.75 状态，看起来一样但语义不清）。 ──
        stageTL.to({}, { duration: 0.25 }, 0.75);

        console.debug('[level3] Master ScrollTrigger initialized (Stage-1 + Stage-2).');
    }

    /* ── 显示 / 隐藏 ────────────────────────────────────────────────────
     * show() 做几件事：
     *   1. 给 #level-3 打上 data-planet="kepler|toi|proxima"
     *   2. 把 #level-2 淡出并加 [hidden]（让出滚轮控制权）
     *   3. 把 #planet-stage 淡出（用户不想看到左上角的星球）
     *   4. 把 #level-3 取消 [hidden]、opacity 拉到 1
     *   5. 复位 scroller.scrollTop = 0，再 lazy-init + refresh ScrollTrigger
     */
    function show(planetIndex = 0) {
        const planet = PLANETS[planetIndex] ?? PLANETS[0];
        lv3.dataset.planet = planet.planetTheme;       // kepler / toi / proxima

        // 1) 先把 Level 2 淡出（如果当前可见）
        if (lv2 && !lv2.hasAttribute('hidden')) {
            gsap.to(lv2, {
                opacity: 0,
                duration: 0.45,
                ease: 'power2.in',
                onComplete: () => {
                    lv2.setAttribute('hidden', '');
                    lv2.setAttribute('aria-hidden', 'true');
                    gsap.set(lv2, { opacity: 0 });
                },
            });
        }

        // 2) 把屏幕左上角的星球角标淡出
        if (planetStage) {
            gsap.to(planetStage, { opacity: 0, duration: 0.4, ease: 'power2.in' });
        }

        // 3) 显示 #level-3：取消 hidden，覆盖 .narrative-level 默认 opacity:0
        lv3.removeAttribute('hidden');
        lv3.setAttribute('aria-hidden', 'false');
        gsap.fromTo(lv3,
            { opacity: 0 },
            { opacity: 1, duration: 0.55, ease: 'power2.out' }
        );
        lv3.style.pointerEvents = 'auto';

        // 4) 复位滚动 + lazy-init + refresh
        scroller.scrollTop = 0;
        initEngineOnce();
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    function hide() {
        if (lv3.hasAttribute('hidden')) return;
        gsap.to(lv3, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => {
                lv3.setAttribute('hidden', '');
                lv3.setAttribute('aria-hidden', 'true');
                lv3.style.opacity = '';
                lv3.style.pointerEvents = '';
                scroller.scrollTop = 0;
            },
        });
        // 让屏幕左上角星球重新可见（以备未来 L3 → L2 的返回路径）
        if (planetStage) {
            gsap.to(planetStage, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        }
    }

    /* ── 事件接线 ──────────────────────────────────────────────────────── */
    // 记住进入 L3 时携带的 planetIndex，返回时透传给 L2，保证回到的是同一颗行星。
    let lastPlanetIndex = 0;

    window.addEventListener('l3-enter', (e) => {
        const idx = e?.detail?.planetIndex ?? 0;
        lastPlanetIndex = idx;
        show(idx);
    });
    window.addEventListener('l3-exit', () => hide());

    // 左上角"← 返回"按钮：退出 L3 → 唤起 L2（带上原 planetIndex）
    // 派发顺序：先 l3-exit 启动 L3 淡出，再 l2-enter 让 L2 立刻接管；两者动画时
    // 相近(L3:0.35s 淡出 / L2:进入逻辑)，肉眼上是平滑的关卡切换。
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('l3-exit'));
            window.dispatchEvent(
                new CustomEvent('l2-enter', { detail: { planetIndex: lastPlanetIndex } })
            );
        });
    } else {
        console.warn('[level3] #l3-back-btn not found — back button is non-functional.');
    }

    /* ── Dev / 公开 API ───────────────────────────────────────────────── */
    return {
        show,                                           // __level3.show(0|1|2)
        hide,
        refresh: () => ScrollTrigger.refresh(),
        getScrollTrigger: () => stageTL?.scrollTrigger,
        isInitialized: () => initialized,
    };
}

/**
 * THE SECOND CRADLE — Level 3 Scroll Engine (4-Screen · Stage-1 ~ Stage-4)
 *
 * 第三级共有 4 屏 × 3 套（每个行星一套）。3 套行星共用同一份 HTML 容器，
 * 通过 #level-3[data-planet="kepler|toi|proxima"] 区分主题色，并由 show()
 * 按 PLANETS[idx].narrativeL3 切换 React 文本岛内容，并把背景图写入 CSS 变量。
 *
 * ── 滚动总览（timeline 归一到 0–1，scrub:true 1:1 联动滚动）─────────────
 *
 *     滚动:   0      0.18     0.30   0.40    0.55     0.65     0.80    0.90   1.00
 *             │       │         │      │      │        │        │       │      │
 *     Stage-1 ├─ph-1──┤
 *                     ├──ph-2──┤
 *                              ├hand1┤
 *     Stage-2                  ├──── hand1 + dwell ────┤
 *                                            ├ hand2 ┤
 *     Stage-3                                ├──── hand2 + dwell ────┤
 *                                                              ├hand3┤
 *     Stage-4                                                  ├── hand3 + dwell ──┤
 *
 *   · Stage-1 (0 → 0.30)
 *       phase-1 (0    → 0.18): main scale 1→0.65 + x:0→-183；side x:500→-272 + opacity 0→1
 *       phase-2 (0.18 → 0.30)：main 再缩到 0.546、侧栏到 0.91；文案容器轻微上移
 *   · Hand-off-1 (0.30 → 0.40): stage-1 yPercent 0→-100、stage-2 yPercent 100→0
 *   · Stage-2 dwell (0.40 → 0.55): 留给轨道自转 + 阅读
 *   · Hand-off-2 (0.55 → 0.65): stage-2 yPercent 0→-100、stage-3 yPercent 100→0
 *   · Stage-3 dwell (0.65 → 0.80): 第三屏阅读（场景 + 心情段）
 *   · Hand-off-3 (0.80 → 0.90): stage-3 yPercent 0→-100、stage-4 yPercent 100→0
 *   · Stage-4 dwell (0.90 → 1.00): 第四屏阅读（蔚蓝的乡愁）
 *
 *   两个相邻 stage 的 yPercent 同步反向：一个上滑出顶、一个从底滑入，
 *   中点正好"一半上半屏旧场景 + 一半下半屏新场景"，与 Level 2 节间滚动手感一致。
 *
 * ── Stage-1 三件元素 ────────────────────────────────────────────────────
 *     .elem-main-placeholder      屏幕正中心（GSAP scale + x 同步）
 *     .elem-side-placeholder      主元素右侧（GSAP x / scale / opacity）
 *     .elem-caption-placeholder   屏幕下方（GSAP y / opacity）
 *
 * ── Stage-2 容器（内容由 React 岛 + 纯 HTML 拼出，本文件只控外层位移）
 *     .l3-scene-2                 整屏 wrapper（z-index 7）
 *       ├─ .l3-orbit-area         #l3-orbit-mount 挂载 <OrbitImages />
 *       └─ .focus-text-area       focus 色块 + 文案区
 *
 * ── Stage-3 / Stage-4（z-index 8 / 9，本文件负责 yPercent 滑入 + 文案注入）
 *     .l3-scene-3 · 全屏行星背景 + 右侧文字（章节标签 + 场景段 + 心情段）
 *     .l3-scene-4 · 全屏行星背景 + 居中正文（蔚蓝的乡愁，三颗行星共用文案）
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
    const stage3El      = lv3?.querySelector('.l3-scene-3');
    const stage4El      = lv3?.querySelector('.l3-scene-4');
    const mainEl        = lv3?.querySelector('.elem-main-placeholder');
    const sideEl        = lv3?.querySelector('.elem-side-placeholder');
    const captionEl     = lv3?.querySelector('.elem-caption-placeholder');
    // 第二～四屏文字块：整块随主时间轴渐入（blur+opacity+y），无旋转、不切词，避免观感「歪」
    const focusTextEl   = lv3?.querySelector('.focus-text-area');
    const s3TextCol     = lv3?.querySelector('.l3-s3-text-col');
    const s4TextCol     = lv3?.querySelector('.l3-s4-text-col');
    const backBtn       = document.getElementById('l3-back-btn');

    if (!lv3 || !scroller || !fakeContent || !mainEl || !sideEl || !captionEl
        || !stage1Wrapper || !stage2El || !stage3El || !stage4El) {
        console.warn('[level3] Required DOM elements not found — aborting init.', {
            lv3, scroller, fakeContent, mainEl, sideEl, captionEl,
            stage1Wrapper, stage2El, stage3El, stage4El,
        });
        return null;
    }

    /* ── per-planet 背景注入 ──────────────────────────────────────────────
     * 文本内容现在由 React island <Level3TextReveals /> 渲染，并使用
     * React Bits <ScrollReveal /> 管理交互；这里仅负责写入背景图变量。 */
    function applyPlanetContent(planet) {
        if (planet.image) {
            lv3.style.setProperty('--l3-planet-image', `url(${planet.image})`);
        }
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
        // 容器本身始终 opacity:1；文字 opacity/blur 由独立的逐词 ScrollTrigger 管理。
        // y 由主时间轴控制（容器轻微上移入场）。
        gsap.set(captionEl,   { xPercent: -50, y: 24, opacity: 1 });
        gsap.set(focusTextEl, { xPercent: -50, y: 18, opacity: 1 });
        gsap.set(s3TextCol,   { y: 18, opacity: 1 });
        gsap.set(s4TextCol,   { y: 18, opacity: 1 });

        // Stage-1 留在原位；Stage-2 / 3 / 4 预先在视口下方等候切屏滑入。
        gsap.set(stage1Wrapper, { yPercent: 0,   opacity: 1 });
        gsap.set(stage2El,      { yPercent: 100, opacity: 1 });
        gsap.set(stage3El,      { yPercent: 100, opacity: 1 });
        gsap.set(stage4El,      { yPercent: 100, opacity: 1 });

        /* ── 主时间轴（scrub:true，timeline 归一到 0–1）
         * 只负责元素缩放/位移和四屏 hand-off；文本 opacity/blur 已拆给
         * React Bits <ScrollReveal />，避免文字动画拖住场景滚动。── */
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

        // ── Stage-1 phase-1 (0 → 0.18)：主元素缩到 0.6 + 同步左移；侧栏从右一路滑到"成对居中"位 ──
        //
        // ★ 停驻时再略大一点：phase-1→0.65，phase-2 main→0.546、侧→0.91；x 略调保持主+侧成组居中。
        stageTL.to(mainEl, { scale: 0.65, x: -183,     ease: 'none', duration: 0.18 }, 0);
        stageTL.to(sideEl, { x: -272,      opacity: 1, ease: 'none', duration: 0.18 }, 0);

        // ── Stage-1 phase-2 (0.18 → 0.30)：主+侧微缩，caption y 滑入
        // opacity/blur 由独立 ScrollTrigger 管理，这里只做 y 位移
        stageTL.to(mainEl,    { scale: 0.546, ease: 'none', duration: 0.12 }, 0.18);
        stageTL.to(sideEl,    { scale: 0.91,  ease: 'none', duration: 0.12 }, 0.18);
        stageTL.to(captionEl, { y: 0,         ease: 'none', duration: 0.12 }, 0.18);

        // ── Hand-off-1 (0.30 → 0.40)：Stage-1 上滑出顶，Stage-2 从底滑入 ──
        stageTL.to(stage1Wrapper, { yPercent: -100, ease: 'none', duration: 0.10 }, 0.30);
        stageTL.to(stage2El,      { yPercent: 0,    ease: 'none', duration: 0.10 }, 0.30);

        // focusTextEl y 滑入（紧跟 hand-off-1 完成）
        stageTL.to(focusTextEl, { y: 0, ease: 'none', duration: 0.05 }, 0.38);

        // ── Stage-2 dwell (0.45 → 0.55)──
        stageTL.to({}, { duration: 0.10 }, 0.45);

        // ── Hand-off-2 (0.55 → 0.65)：Stage-2 上滑出顶，Stage-3 从底滑入 ──
        stageTL.to(stage2El, { yPercent: -100, ease: 'none', duration: 0.10 }, 0.55);
        stageTL.to(stage3El, { yPercent: 0,    ease: 'none', duration: 0.10 }, 0.55);

        stageTL.to(s3TextCol, { y: 0, ease: 'none', duration: 0.05 }, 0.63);

        // ── Stage-3 dwell (0.70 → 0.80)──
        stageTL.to({}, { duration: 0.10 }, 0.70);

        // ── Hand-off-3 (0.80 → 0.90)：Stage-3 上滑出顶，Stage-4 从底滑入 ──
        stageTL.to(stage3El, { yPercent: -100, ease: 'none', duration: 0.10 }, 0.80);
        stageTL.to(stage4El, { yPercent: 0,    ease: 'none', duration: 0.10 }, 0.80);

        stageTL.to(s4TextCol, { y: 0, ease: 'none', duration: 0.05 }, 0.88);

        // ── Stage-4 dwell (0.93 → 1.00)──
        stageTL.to({}, { duration: 0.07 }, 0.93);

        console.debug('[level3] Master ScrollTrigger initialized (Stage-1 ~ Stage-4).');
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

        // 0) 注入这颗行星的全屏背景图（CSS 变量）。
        // 文本内容由 React island 在 #level-3 显示后渲染，避免 hidden 状态下
        // 创建 ScrollTrigger 拿到错误尺寸。
        applyPlanetContent(planet);

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
        scroller.scrollTop = 0;
        window.dispatchEvent(
            new CustomEvent('l3-content-change', { detail: { planetIndex } })
        );
        gsap.fromTo(lv3,
            { opacity: 0 },
            { opacity: 1, duration: 0.55, ease: 'power2.out' }
        );
        lv3.style.pointerEvents = 'auto';

        // 4) lazy-init + refresh
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

    /* 反向恢复 #level-2 —— 对称地撤销 show() 里给 #level-2 做的隐藏动作。
       show() 里干了：opacity→0、setAttribute('hidden')、setAttribute('aria-hidden','true')。
       这里反过来：remove hidden、aria-hidden=false、opacity 从 0 淡入到 1。
       注意：#planet-stage 的位置(L2 角标位)是 L1→L2 时设的，L2→L3→L2 期间没动过，
       所以这里不需要重新摆位置；hide() 已经把它的 opacity 拉回 1 了。 */
    function restoreLevel2() {
        if (!lv2) return;
        if (!lv2.hasAttribute('hidden')) return;     // 已经可见就不重复触发
        lv2.removeAttribute('hidden');
        lv2.setAttribute('aria-hidden', 'false');
        gsap.fromTo(lv2,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
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

    // 左上角"← 返回"按钮：退出 L3 → 让 #level-2 重新可见 → 通知 React L2 更新 planetIndex
    // 派发顺序：
    //   1) l3-exit         → hide() 启动 L3 淡出 (0.35s)
    //   2) restoreLevel2() → 摘掉 [hidden] / opacity:0 → 1 淡入 (0.5s)
    //      ★ 必须做这一步：show() 里曾给 #level-2 加 [hidden]+opacity:0，
    //        光靠 'l2-enter' 只触发 React 状态更新，DOM 节点依旧是 hidden 的
    //   3) l2-enter        → Level2.jsx 刷新 planetIndex / 重建 ScrollTrigger
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('l3-exit'));
            restoreLevel2();
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

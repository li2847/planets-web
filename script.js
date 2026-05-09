/* =========================================================
   THE SECOND CRADLE · GSAP Orbital Carousel
   逻辑约定：
   - 数组顺序：[Kepler-452b, TOI-1452 b, Proxima Centauri b]
   - 点击 ▶ (next) → 中央星球向左滑出，右侧邻星滑入中心
   - 点击 ◀ (prev) → 中央星球向右滑出，左侧邻星滑入中心
   - 为防止「同一行星同时在中央和侧边出现」：
       1. 切换瞬间先把两侧邻星快速 fade out
       2. 等主星球移出中心区域后再更新侧边图片
       3. 最后再 fade in 新的侧邻星
   ========================================================= */

gsap.registerPlugin(MotionPathPlugin);
if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ---------------- 数据 ---------------- */
const PLANETS = [
    {
        id: "KEPLER-452B",
        title: "THE ELDER COUSIN",
        tagline: "它比地球老，像地球的未来",
        image: "images/KEPLER-452B.png",
        // 色温：稳重青色
        glowBg: "radial-gradient(circle at center, rgba(37,244,238,0.35) 0%, rgba(37,244,238,0.15) 35%, rgba(37,244,238,0.05) 55%, transparent 70%)",
        rippleColor: "rgba(37,244,238,0.75)",
        coords: [
            { k: "RA",            v: "19h 44m 00.9s (296.0037°) | 赤经" },
            { k: "DEC",           v: "+44° 27' 28\" (44.2776°) | 赤纬" },
            { k: "Constellation", v: "Cygnus（天鹅座）" },
            { k: "Distance",      v: "~1400 light-years" },
            { k: "Host Star",     v: "Kepler-452" },
        ],
        annotation:
            '<p>外号「地球表哥」：首颗类太阳恒星宜居带内的超级地球，与地球相似度极高。</p><p style="margin-top:0.8rem">它已在宜居带内运行约 <b>60&nbsp;亿年</b>，宿主恒星 Kepler-452 比太阳更年长、光度更高。</p>',
        ml2: {
            heroVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4",
            missionVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4",
            solutionVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4",
        },
    },
    {
        id: "TOI-1452 B",
        title: "THE OCEAN WORLD",
        tagline: "冰与水交织的深海星球",
        image: "images/TOI-1452 B.png",
        // 色温：深蓝白，呼应深海
        glowBg: "radial-gradient(circle at center, rgba(100,190,255,0.35) 0%, rgba(100,190,255,0.15) 35%, rgba(100,190,255,0.05) 55%, transparent 70%)",
        rippleColor: "rgba(100,190,255,0.75)",
        coords: [
            { k: "RA",            v: "19h 20m 59.6s (290.2483°) | 赤经" },
            { k: "DEC",           v: "+73° 11' 44\" (73.1956°) | 赤纬" },
            { k: "Constellation", v: "Draco（天龙座）" },
            { k: "Distance",      v: "~100 light-years" },
            { k: "Host Star",     v: "TOI-1452" },
        ],
        annotation:
            '<p>外号「深蓝摇篮」：半径约地球 <b>1.67</b> 倍，密度暗示其表面可能覆盖一层极深的液态水海洋。</p><p style="margin-top:0.8rem">它是罕见的「海洋世界」候选星，距离近、母星昏暗，是搜寻生命迹象的理想目标。</p>',
        ml2: {
            heroVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4",
            missionVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4",
            solutionVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4",
        },
    },
    {
        id: "PROXIMA CENTAURI B",
        title: "THE NEAREST NEIGHBOR",
        tagline: "与我们仅一步之遥的红矮星伴侣",
        image: "images/PROXIMA CENTAURI B.png",
        // 色温：橘红，呼应红矮星高温耀斑
        glowBg: "radial-gradient(circle at center, rgba(255,100,50,0.35) 0%, rgba(255,100,50,0.15) 35%, rgba(255,100,50,0.05) 55%, transparent 70%)",
        rippleColor: "rgba(255,110,60,0.75)",
        coords: [
            { k: "RA",            v: "14h 29m 42.9s (217.4289°) | 赤经" },
            { k: "DEC",           v: "-62° 40' 46\" (-62.6794°) | 赤纬" },
            { k: "Constellation", v: "Centaurus（半人马座）" },
            { k: "Distance",      v: "~4.24 light-years" },
            { k: "Host Star",     v: "Proxima Centauri" },
        ],
        annotation:
            '<p>外号「近邻行星」：距太阳仅 <b>4.24</b> 光年，围绕红矮星Proxima Centauri 运行，位于其宜居带内。</p><p style="margin-top:0.8rem">它每 11.2 天绕母星一圈，强烈的耀斑辐射是目前已知的最大挑战。</p>',
        ml2: {
            heroVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4",
            missionVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4",
            solutionVideo:
                "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4",
        },
    },
];

/** 进入 / 退出第二幕时 #level-1 UI 散开位移（仅用于 GSAP，不修改 level-1 样式表） */
const LEVEL1_SCATTER_DEFS = [
    { sel: "#level-1 .brand", x: -85, y: -95 },
    { sel: "#level-1 .tagline", x: 100, y: -45 },
    { sel: "#level-1 .coord-box", x: -115, y: 95 },
    { sel: "#level-1 .headline", x: 0, y: -110 },
    { sel: "#level-1 .annotation", x: 120, y: 35 },
    { sel: "#level-1 .nav-btn--prev", x: -140, y: 55 },
    { sel: "#level-1 .nav-btn--next", x: 140, y: 55 },
    { sel: "#level-1 .side-planet--left", x: -160, y: 90 },
    { sel: "#level-1 .side-planet--right", x: 160, y: 90 },
    { sel: "#level-1 .migrate-cta", x: 0, y: 130 },
];

/* ---------------- Level 2 · 4-Screen Vertical Stack ---------------- */

/** Populate all Level 2 screens with the selected planet's narrative data. */
function updateLevel2Content(planetIndex) {
    const planet = PLANETS[planetIndex];
    if (!planet) return;

    const idEl        = document.getElementById("l2-s1-id");
    const titleEl     = document.getElementById("l2-s1-title");
    const taglineEl   = document.getElementById("l2-s1-tagline");
    const annotEl     = document.getElementById("l2-s1-annotation");
    const s2ChapterEl = document.getElementById("l2-s2-chapter");
    const s2TextEl    = document.getElementById("l2-s2-text");
    const s3ChapterEl = document.getElementById("l2-s3-chapter");
    const s3TextEl    = document.getElementById("l2-s3-text");

    if (idEl)        idEl.textContent      = planet.id;
    if (titleEl)     titleEl.textContent   = planet.title;
    if (taglineEl)   taglineEl.textContent = planet.tagline;
    if (annotEl)     annotEl.innerHTML     = planet.annotation;

    const dist    = planet.coords.find((c) => c.k === "Distance");
    const host    = planet.coords.find((c) => c.k === "Host Star");
    const constel = planet.coords.find((c) => c.k === "Constellation");

    if (s2ChapterEl) s2ChapterEl.textContent = "CHAPTER I · ARRIVAL";
    if (s2TextEl && dist)             s2TextEl.textContent  = `距离 · ${dist.v}`;
    if (s3ChapterEl) s3ChapterEl.textContent = "CHAPTER II · DISCOVERY";
    if (s3TextEl && host && constel)  s3TextEl.textContent  = `${host.v}  ·  ${constel.v}`;
}

/** Remove the scroll listener that drives the stacking animation. */
function killLevel2Stacking() {
    if (state.l2ScrollHandler && state.l2Scroller) {
        state.l2Scroller.removeEventListener("scroll", state.l2ScrollHandler);
        state.l2ScrollHandler = null;
        state.l2Scroller      = null;
    }
}

/**
 * Attach a passive scroll listener to #level-2 that maps scroll progress to
 * per-screen translateY + blur/opacity — producing the "stacking card" effect.
 *
 * Layout contract (set in CSS):
 *   #l2-screens  → position: sticky; top: 0; height: 100vh  (visible layer)
 *   #l2-sp-1/2/3 → each 100vh (invisible scroll distance provider)
 *   Total scroll: 300vh → 3 transitions
 */
function initLevel2Stacking() {
    killLevel2Stacking();

    const scroller = document.getElementById("level-2");
    const s1 = document.getElementById("l2-s1");
    const s2 = document.getElementById("l2-s2");
    const s3 = document.getElementById("l2-s3");
    const s4 = document.getElementById("l2-s4");

    if (!scroller || !s1 || !s2 || !s3 || !s4) return;

    const screens = [s1, s2, s3, s4];

    // Initial state: screens 2-4 start below viewport
    gsap.set(s1, { y: 0, filter: "blur(0px)", opacity: 1 });
    gsap.set([s2, s3, s4], { y: "100vh", filter: "blur(0px)", opacity: 1 });

    function onL2Scroll() {
        const maxScroll = scroller.scrollHeight - scroller.clientHeight;
        if (maxScroll <= 0) return;

        const scrolled  = scroller.scrollTop;
        const stepSize  = maxScroll / 3; // one step per transition

        for (let i = 1; i < screens.length; i++) {
            const start = (i - 1) * stepSize;
            const end   = i * stepSize;
            const t     = Math.max(0, Math.min(1, (scrolled - start) / (end - start)));

            // Slide the incoming screen up from below
            gsap.set(screens[i], { y: `${(1 - t) * 100}vh` });
            // Apply dynamic blur + opacity reduction to the outgoing screen
            gsap.set(screens[i - 1], {
                filter:  `blur(${t * 8}px)`,
                opacity: 1 - t * 0.35,
            });
        }
    }

    scroller.addEventListener("scroll", onL2Scroll, { passive: true });
    state.l2ScrollHandler = onL2Scroll;
    state.l2Scroller      = scroller;
}

/**
 * 从第二幕返回第一幕：隐藏顶栏、收起 #level-2、复原 #level-1 UI 与中央星球位形。
 */
function goBackToLevel1() {
    if (state.narrativeLevel !== 2) return;
    if (state.levelTransitioning) return;
    if (!gsap || !gsap.timeline) return;

    const lv2 = document.getElementById("level-2");
    if (!lv2) return;

    state.levelTransitioning = true;
    killLevel2Stacking();

    lv2.scrollTop = 0;

    const scatteredEls = [];
    LEVEL1_SCATTER_DEFS.forEach((def) => {
        const el = document.querySelector(def.sel);
        if (el) scatteredEls.push(el);
    });

    stopPlanetCornerBreathing();

    const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
            state.levelTransitioning = false;
            state.narrativeLevel = 1;
            lv2.setAttribute("hidden", "");
            lv2.setAttribute("aria-hidden", "true");
            gsap.set(lv2, { opacity: 0 });
            planetStage.classList.remove("is-level2-anchor");
            planetStage.style.zIndex = "";
            planetStage.style.pointerEvents = "";
            scatteredEls.forEach((el) => {
                el.removeAttribute("aria-hidden");
                el.style.pointerEvents = "";
            });
            scene.classList.remove("is-entering-level-2");
        },
    });

    tl.to(
        lv2,
        {
            opacity: 0,
            duration: 0.65,
            ease: "power2.in",
        },
        0,
    );

    tl.to(
        planetStage,
        {
            top: "93%",
            left: "50%",
            xPercent: -50,
            yPercent: -50,
            scale: 1,
            marginTop: 50,
            duration: 1.15,
            ease: "power3.inOut",
        },
        0.06,
    );

    LEVEL1_SCATTER_DEFS.forEach((def, i) => {
        const el = document.querySelector(def.sel);
        if (!el) return;
        tl.to(
            el,
            {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.88,
                ease: "power2.out",
                clearProps: "opacity",
            },
            0.12 + i * 0.03,
        );
    });
}

/* ---------------- DOM ---------------- */
const scene           = document.getElementById("scene");
const planetIdEl      = document.getElementById("planet-id");
const planetTitleEl   = document.getElementById("planet-title");
const taglineEl       = document.getElementById("tagline");
const coordDataEl     = document.getElementById("coord-data");
const annotationTxtEl = document.getElementById("annotation-text");
const headlineIdEl    = planetIdEl.parentElement;

const headlineInner   = document.getElementById("headline-inner");
const annotationInner = document.getElementById("annotation-inner");
const planetStage     = document.getElementById("planet-stage");

const slotA = document.getElementById("slot-a");
const slotB = document.getElementById("slot-b");
const slotAImg = document.getElementById("slot-a-img");
const slotBImg = document.getElementById("slot-b-img");

const planetLeft      = document.getElementById("planet-left");
const planetRight     = document.getElementById("planet-right");
const planetLeftImg   = document.getElementById("planet-left-img");
const planetRightImg  = document.getElementById("planet-right-img");

const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

[slotAImg, slotBImg].forEach((imgEl) => {
    imgEl.classList.add("planet__img");
});

function lockPlanetStage() {
    // 进入 level-2 后由叙事时间轴接管 planet-stage 的位移/缩放，禁止复位
    if (state.narrativeLevel >= 2) return;
    // 中央视觉锚点只由 CSS 决定；GSAP 只允许运动内部 slot
    gsap.set(planetStage, { x: 0, y: 0, clearProps: "x,y" });
}

/* ---------------- 状态 ---------------- */
const state = {
    index: 0,
    active:   { slot: slotA, img: slotAImg },
    incoming: { slot: slotB, img: slotBImg },
    isAnimating: false,
    tl: null,
    /** 叙事阶段：1 = 首屏行星展台，2+ = 已进入后续章节 */
    narrativeLevel: 1,
    levelTransitioning: false,
    planetBreatheTween: null,
    /** Level 2 stacking scroll state */
    l2ScrollHandler: null,
    l2Scroller: null,
};

/* ---------------- 渲染 ---------------- */
function renderCoords(planet) {
    coordDataEl.innerHTML = planet.coords
        .map(({ k, v }) => `<li><span>${k}</span>: ${v}</li>`)
        .join("");
}

function writeTextFor(planet) {
    planetIdEl.textContent    = planet.id;
    planetTitleEl.textContent = planet.title;
    taglineEl.textContent     = planet.tagline;
    annotationTxtEl.innerHTML = planet.annotation;
    renderCoords(planet);
}

function stopPlanetCornerBreathing() {
    if (state.planetBreatheTween) {
        state.planetBreatheTween.kill();
        state.planetBreatheTween = null;
    }
}

/** 星球落位左上角后的轻微呼吸缩放 */
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

/* 根据当前 index 更新两侧邻星的图片 */
function updateSidePlanets(currentIndex) {
    const n = PLANETS.length;
    const prev = PLANETS[(currentIndex - 1 + n) % n];
    const next = PLANETS[(currentIndex + 1) % n];
    planetLeftImg.src  = prev.image;
    planetRightImg.src = next.image;
}

/* ---------------- 预加载 ---------------- */
function preload() {
    PLANETS.forEach((p) => {
        const img = new Image();
        img.src = p.image;
    });
}

/* ---------------- 入场 ---------------- */
function intro() {
    lockPlanetStage();
    gsap.set([slotA, slotB], { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0, filter: "blur(0px)" });
    gsap.set(slotA, { opacity: 1 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".brand",        { y: -18, opacity: 0, duration: 0.8 }, 0)
      .from(taglineEl,       { x: 24,  opacity: 0, duration: 0.8 }, 0.1)
      .from(headlineInner,   { y: 28,  opacity: 0, duration: 1.0 }, 0.15)
      .from(slotA,           { scale: 0.72, opacity: 0, duration: 1.3, ease: "power4.out" }, 0.2)
      .from(".coord-box",    { opacity: 0, duration: 0.8,  clearProps: "transform,opacity" }, 0.55)
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

/* ---------------- 切换 ---------------- */
function switchTo(dir) {
    if (state.narrativeLevel !== 1) return;
    if (state.isAnimating) return;
    if (!gsap || !gsap.timeline) return;
    lockPlanetStage();

    const n = PLANETS.length;
    const nextIndex =
        dir === "next"
            ? (state.index + 1) % n
            : (state.index - 1 + n) % n;

    if (nextIndex === state.index) return;

    const nextPlanet = PLANETS[nextIndex];
    const sign = dir === "next" ? 1 : -1; // +1 → 出场向左
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    state.isAnimating = true;
    scene.classList.add("is-switching");

    // 主标题：blur+opacity 浮现动画（见 2E-title 段落）
    // 其余 UI 文字：在动画中点由 writeTextFor 瞬间切换，零动画

    /* 1. 准备入场槽位：先把下一颗图片塞入 incoming，放到远端起点，隐形 */
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

    /* 2. 组装时间线 */
    const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
            lockPlanetStage();
            /* 清理：旧 slot 彻底复位并清空 src，下次使用时再塞新图 */
            state.active.slot.classList.remove("is-active");
            gsap.set(state.active.slot, {
                x: 0, y: 0, scale: 1, rotation: 0,
                opacity: 0, filter: "blur(0px)",
            });
            state.active.img.src = ""; // 关键：避免旧图残留造成「出现两次」

            /* 交换引用 */
            const tmp = state.active;
            state.active = state.incoming;
            state.incoming = tmp;
            state.index = nextIndex;

            scene.classList.remove("is-switching");
            state.isAnimating = false;
        },
    });
    state.tl = tl;

    /* ----- 2A. 两侧邻星：立刻快速 fade out（防重影） ----- */
    tl.to([planetLeft, planetRight], {
        opacity: 0,
        scale: 0.82,
        filter: "blur(6px)",
        duration: 0.28,
        ease: "power2.in",
    }, 0);

    /* ----- 2B. 主星球出场：沿弧形轨道向 (sign 反向) 缩小淡出 ----- */
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

    /* ----- 2C. 主星球入场：从 (sign 方向) 弧形放大滑入 -----
       t=0.32 起步：侧星 0.28s 消失后再出发，彻底杜绝重叠跳帧  */
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

    /* ----- 2D. 星球光晕微闪 ----- */
    tl.to(".planet__glow", {
        opacity: 0.35,
        duration: 0.55,
        ease: "power2.in",
    }, 0)
      .to(".planet__glow", {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
    }, 0.55);

    /* ----- 2E-title. 主标题：blur + opacity 浮现 ----- */
    tl.to(planetTitleEl, {
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.25,
        ease: "power2.in",
    }, 0);

    /* ----- 2E-instant. 其余 UI：在动画中点瞬间切换，零动画 -----
       writeTextFor 同时更新 ID / tagline / coords / annotation，
       完全不参与任何 GSAP 动画，点击即得。
       同步切换光晕色温（此时 glow opacity 0.35，颜色跳变不可见）  */
    tl.add(() => {
        writeTextFor(nextPlanet);
        updateSidePlanets(nextIndex);
        document.querySelector(".planet__glow").style.background = nextPlanet.glowBg;
    }, 0.55);

    /* 主标题从隐身态浮现：1.2s expo.out，高级缓降感 */
    tl.fromTo(planetTitleEl,
        { opacity: 0, filter: "blur(10px)" },
        {
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "expo.out",
            clearProps: "filter,opacity",
        },
        0.58,
    );

    /* ----- 2F. 新的两侧邻星 fade in ----- */
    tl.fromTo([planetLeft, planetRight],
        { opacity: 0, scale: 0.82, filter: "blur(6px)" },
        {
            opacity: 0.95,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "filter",
        },
        0.75,
    );
}

/**
 * 进入第二叙事层：#level-1 UI 向四周散开并淡出；中央星球移至左上缩小作第二幕背景；#level-2 移除 hidden 后淡入。
 * @returns {boolean} 是否成功开始过渡（已处于后续章节或忙碌时返回 false）
 */
function goToLevel2() {
    if (state.narrativeLevel !== 1) return false;
    if (state.levelTransitioning || state.isAnimating) return false;
    if (!gsap || !gsap.timeline) return false;

    const lv2 = document.getElementById("level-2");
    if (!lv2) return false;

    killLevel2Stacking();

    state.levelTransitioning = true;
    scene.classList.add("is-entering-level-2");

    const scatteredEls = [];
    LEVEL1_SCATTER_DEFS.forEach((def) => {
        const el = document.querySelector(def.sel);
        if (el) scatteredEls.push(el);
    });

    gsap.set(planetStage, { transformOrigin: "50% 50%" });

    lv2.removeAttribute("hidden");
    lv2.setAttribute("aria-hidden", "false");
    gsap.set(lv2, { opacity: 0 });

    const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
            state.levelTransitioning = false;
            state.narrativeLevel = 2;
            scatteredEls.forEach((el) => {
                el.setAttribute("aria-hidden", "true");
                el.style.pointerEvents = "none";
            });
            planetStage.classList.add("is-level2-anchor");
            planetStage.style.zIndex = "5";
            planetStage.style.pointerEvents = "none";
            startPlanetCornerBreathing();
            lv2.scrollTop = 0;
            updateLevel2Content(state.index);
            initLevel2Stacking();
        },
    });

    LEVEL1_SCATTER_DEFS.forEach((def, i) => {
        const el = document.querySelector(def.sel);
        if (!el) return;
        tl.to(
            el,
            {
                opacity: 0,
                x: def.x,
                y: def.y,
                duration: 0.9,
                ease: "power2.inOut",
            },
            i * 0.035,
        );
    });

    tl.fromTo(
        planetStage,
        {
            top: "93%",
            left: "50%",
            xPercent: -50,
            yPercent: -50,
            scale: 1,
            marginTop: 50,
        },
        {
            top: "14%",
            left: "8%",
            xPercent: -50,
            yPercent: -50,
            scale: 0.22,
            marginTop: 0,
            duration: 1.25,
            ease: "power3.inOut",
        },
        0.05,
    );

    tl.to(
        lv2,
        {
            opacity: 1,
            duration: 0.95,
            ease: "power2.out",
        },
        0.32,
    );

    return true;
}

/* ---------------- 事件 ----------------
   按钮与方向语义对调：
   - 点击 ▶（右箭头）= 下一颗，中央向左滑出，新球从右侧进入
   - 点击 ◀（左箭头）= 上一颗，中央向右滑出，新球从左侧进入
*/
btnNext.addEventListener("click", () => switchTo("prev"));
btnPrev.addEventListener("click", () => switchTo("next"));

document.addEventListener("keydown", (e) => {
    if (state.narrativeLevel !== 1) return;
    if (e.key === "ArrowRight") switchTo("prev");
    else if (e.key === "ArrowLeft") switchTo("next");
});

const btnConfirmMigration = document.getElementById("btn-confirm-migration");
if (btnConfirmMigration) {
    btnConfirmMigration.addEventListener("click", () => goToLevel2());
}

const l2ConfirmBtn = document.getElementById("l2-s4-confirm");
if (l2ConfirmBtn) {
    l2ConfirmBtn.addEventListener("click", () => {
        // TODO: Advance to Level 3 (The Realization · Days Later)
        goBackToLevel1();
    });
}

/* ---------------- 涟漪（Whimsy Injector）---------------- */
const glowEl = document.querySelector(".planet__glow");
planetStage.addEventListener("click", () => {
    if (goToLevel2()) return;
    if (state.levelTransitioning || state.narrativeLevel !== 1) return;
    const ripple = document.createElement("div");
    ripple.className = "planet__ripple";
    // 涟漪颜色跟随当前星球色温
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
        },
    );
});

/* ---------------- 启动 ---------------- */
preload();
writeTextFor(PLANETS[0]);
updateSidePlanets(0);
// 初始化第一颗星球的光晕色温
glowEl.style.background = PLANETS[0].glowBg;
intro();

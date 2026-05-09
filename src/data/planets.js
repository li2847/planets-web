/**
 * THE SECOND CRADLE — Shared planet data
 * Imported by both level1.js (GSAP carousel) and Level2.jsx (React narrative).
 */
export const PLANETS = [
    {
        id: "KEPLER-452B",
        title: "THE ELDER COUSIN",
        tagline: "它比地球老，像地球的未来",
        image: "images/KEPLER-452B.png",
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
        // Narrative for Level 2
        narrative: {
            floatTitle: "地球的远古回响",
            screen2:
                "它比地球老了十亿年，在相同的轨道上，见证了我们尚未经历的一切。首颗类太阳恒星宜居带内的超级地球，与地球相似度极高。",
            screen3:
                "它已在宜居带内运行约 60 亿年，宿主恒星 Kepler-452 比太阳更年长、光度更高。在那里，一天的光线比我们的更炽热，一年的季节比我们的更漫长。",
            confirmText:
                "当你仰望那片遥远的星光，它也在以同样的目光凝视着你。这颗比地球年长十亿年的星球，见证了无数个文明的起落——也许，下一个，将由你续写。",
        },
    },
    {
        id: "TOI-1452 B",
        title: "THE OCEAN WORLD",
        tagline: "冰与水交织的深海星球",
        image: "images/TOI-1452 B.png",
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
        narrative: {
            floatTitle: "深蓝色的静谧",
            screen2:
                "整颗星球覆盖着无边无际的深海。半径约地球 1.67 倍，密度暗示其表面可能覆盖一层极深的液态水海洋。",
            screen3:
                "「海洋世界」候选星，距离近、母星昏暗，是搜寻生命迹象的理想目标。在那片静水之下，或许存在着我们无法想象的生命形态。",
            confirmText:
                "深海之下没有喧嚣，只有无声的存在。冰与水交织的世界，在漫长的宇宙时光中安静等待——等待第一双脚步，踏上它沉默的岸边。",
        },
    },
    {
        id: "PROXIMA CENTAURI B",
        title: "THE NEAREST NEIGHBOR",
        tagline: "与我们仅一步之遥的红矮星伴侣",
        image: "images/PROXIMA CENTAURI B.png",
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
        narrative: {
            floatTitle: "红矮星下的余晖",
            screen2:
                "距太阳仅 4.24 光年，是人类目前能够触及的最近星球。围绕红矮星 Proxima Centauri 运行，位于其宜居带内。",
            screen3:
                "它每 11.2 天绕母星一圈，强烈的耀斑辐射是目前已知的最大挑战。那片红色的星光笼罩下，是永恒的黄昏，也是新的黎明。",
            confirmText:
                "从这里出发，只需跨越四光年。那是一颗用红色黄昏洗礼万物的星球，离你如此之近，近到你几乎能感受到它炽热的呼吸。迁徙不是逃离，而是抵达。",
        },
    },
];

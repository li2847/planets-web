/**
 * THE SECOND CRADLE — Shared planet data
 * Imported by both level1.js (GSAP carousel) and Level2.jsx (React narrative).
 *
 * Level 2 narrative structure (per planet):
 *   floatTitle  — large ScrollFloat heading on Screen 1
 *   ch1Label / ch1 — Chapter I  (Screen 1 body, no image)
 *   ch2Label / ch2 — Chapter II  (Screen 2, with image)
 *   ch3Label / ch3 — Chapter III (Screen 3, with image)
 *   ch4Label / ch4 — Chapter IV  (Screen 4, closing + confirm)
 *
 * Level 3 narrative structure (per planet) — narrativeL3:
 *   ch1Label / ch1 — Chapter I   (Screen 1 placeholder · scene of death)
 *   ch2Label / ch2 — Chapter II  (Screen 2 placeholder · planet decay)
 *   ch3Label / ch3 — Chapter III (Screen 3 · final demise · text on right)
 *                    数组形式，包含两段：场景描写 + 「你...」心情描写
 *   ch4Label / ch4 — Chapter IV  (Screen 4 · 蔚蓝的乡愁 · 三颗行星完全相同的"思乡"段)
 *
 *   注：当前 Level 3 屏幕 1/2 仍是骨架占位，但章节文字已经放进数据里，
 *       将来要把第一/二屏内容改成真文案时直接读 narrativeL3.ch1 / ch2 即可。
 *
 * planetTheme — CSS data-attribute value for per-planet color theming
 */

/* 三颗行星共用的 Chapter IV「蔚蓝的乡愁」文案 —— 提到这是统一的"地球乡愁"，
   不写在 narrativeL3 各自字段里能避免重复，避免后续改动一处忘改其它两处。
   数组形式，每个元素一段，渲染时各自一个 ScrollReveal 段落，均居中显示。 */
const HOMESICK_CH4 = [
    '你想起地球上会缓缓沉落的黄昏落日，黑夜降临后，总会迎来崭新的清晨。怀念家乡干净澄澈、带着泥土原生气息的清风，想念故土森林生生不息、自在运转的自然生态。',
    '越奔赴远方，越懂故土无可替代，地球只有一个，值得我们好好珍惜守护',
];

/* 三颗行星共用的章节标签（取自 TOI 用户提供的命名，三颗都吻合"毁灭→消亡→乡愁"主题） */
const L3_CHAPTER_LABELS = {
    ch1Label: '死亡',
    ch2Label: '腐败',
    ch3Label: '消亡',
    ch4Label: '怀念',
};
export const PLANETS = [
    {
        id: "KEPLER-452B",
        title: "THE ELDER COUSIN",
        tagline: "翡翠色的交响森林",
        image: "images/KEPLER-452B.png",
        planetTheme: "kepler",
        glowBg: "radial-gradient(circle at center, rgba(37,244,238,0.35) 0%, rgba(37,244,238,0.15) 35%, rgba(37,244,238,0.05) 55%, transparent 70%)",
        rippleColor: "rgba(37,244,238,0.75)",
        coords: [
            { k: "RA",            v: "19h 44m 00.9s (296.0037°) | 赤经" },
            { k: "DEC",           v: "+44° 27' 28\" (44.2776°) | 赤纬" },
            { k: "Constellation", v: "Cygnus（天鹅座）" },
            { k: "Distance",      v: "~1400 light-years" },
            { k: "Host Star",     v: "Kepler-452" },
        ],
        annotation: `
<div class="story-container">
  <p class="sc-header">外号 <span class="sc-nickname sc-accent">"地球表哥"</span></p>
  <p class="sc-distance"><span class="sc-dist-prefix">距地球约 </span><span class="sc-dist-num sc-accent">1400 光年</span></p>
  <p class="sc-landscape">地表被<span class="sc-hl">茂密的常绿森林</span>覆盖，翡翠色山峦与澄澈山涧交错，巨型阔叶树与奇花遍布，林间自带自然共鸣的韵律。</p>
  <p class="sc-risk"><span class="sc-risk-label">风险：</span><span class="sc-risk-desc">以人类现有技术<span class="sc-hl">几乎无法抵达</span>，即使以光速航行也需要 1400 年。当你抵达时，宿主恒星已进入演化晚期，光度持续升高，宜居带正在向外推移，这颗「地球表哥」<span class="sc-hl">可能已变成一片干旱的荒原</span>。</span></p>
</div>`,
        narrative: {
            floatTitle: "翡翠色的交响森林",
            ch1Label: "降 落",
            ch1: "舱门开启，满眼都是翡翠色山峦，山体被茂密森林覆盖，林间有青绿色缓坡，坡上长满绒状青苔藓，山涧流淌着澄澈的淡绿色溪水，岸边生着巨型阔叶树与淡粉色杯状奇花。",
            ch2Label: "初 见",
            ch2: "你走进森林，听见轻柔的蹄声，循声发现一只鹿。它通体呈浅棕色，脊背有淡淡的浅褐色斑纹，头顶长着对称的短角，正低头轻嗅着地面的青草，偶尔抬蹄轻踏，叶片发出细碎的声响。",
            ch3Label: "相 依",
            ch3: "灵鹿不慎从缓坡滑落，恰好跌在你身前，身体微微颤抖。你取出医疗胶小心翼翼为它处理蹄尖伤口，它温顺地蹭着你的指尖，全程没有挣扎，眼神里满是依赖。",
            ch4Label: "共 生",
            ch4: "伤口愈合后，灵鹿停在你身侧，你带着它走到山涧边。灵鹿围着花丛跳跃轻嗅，你坐在青苔藓坡上看着它，心中满是惆怅，这般安稳，就这样一直下去也不错。",
        },
        narrativeL3: {
            ...L3_CHAPTER_LABELS,
            ch1: "林间声学频谱趋于直线。那只断羽的小翠鸟挂在距离地面两米的枯枝上，喙部由于极端脱水而张开，喉管内部组织已经干涸破裂。它的羽毛失去了所有光泽，呈现出一种铁锈般的灰色。",
            ch2: "翡翠色的森林在短时间内转变为焦黄色。植物维管束系统发生物理性爆裂，巨型叶片大面积腐烂脱落，地面堆积了数米厚的、正在自燃冒烟的腐殖质沼泽。水体由清澈变为油腻的墨绿色。",
            ch3: [
                "酸雨彻底瓦解了土壤的肥力，整片大陆变成了一座巨大的、正在缓慢坍塌的白色墓园。",
                "你靠着舱壁，听着舱外森林死寂、枯枝崩塌的轻响，心底满是沉沉的无力。周遭只剩死寂墓园，天地辽阔，再也没有一处能让你安稳落脚。",
            ],
            ch4: HOMESICK_CH4,
        },
    },
    {
        id: "TOI-1452 B",
        title: "THE OCEAN WORLD",
        tagline: "深蓝色的极光之海",
        image: "images/TOI-1452-B.png",
        planetTheme: "toi",
        glowBg: "radial-gradient(circle at center, rgba(100,190,255,0.35) 0%, rgba(100,190,255,0.15) 35%, rgba(100,190,255,0.05) 55%, transparent 70%)",
        rippleColor: "rgba(100,190,255,0.75)",
        coords: [
            { k: "RA",            v: "19h 20m 59.6s (290.2483°) | 赤经" },
            { k: "DEC",           v: "+73° 11' 44\" (73.1956°) | 赤纬" },
            { k: "Constellation", v: "Draco（天龙座）" },
            { k: "Distance",      v: "~100 light-years" },
            { k: "Host Star",     v: "TOI-1452" },
        ],
        annotation: `
<div class="story-container">
  <p class="sc-header">外号 <span class="sc-nickname sc-accent">"深蓝摇篮"</span></p>
  <p class="sc-distance"><span class="sc-dist-prefix">距地球约 </span><span class="sc-dist-num sc-accent">100 光年</span></p>
  <p class="sc-landscape">地表几乎被<span class="sc-hl">极深的液态水海洋</span>覆盖，仅存少量礁石山与类海藻浮岛，海面泛着荧光，<span class="sc-hl">极光常年横跨天穹</span>。</p>
  <p class="sc-risk"><span class="sc-risk-label">风险：</span><span class="sc-risk-desc">距离适中，是<span class="sc-hl">较有希望抵达</span>的海洋行星之一。当你抵达时，行星正处于极光风暴的活跃期，海面风浪极大，浮岛设施极易受损，着陆平台的稳定性<span class="sc-hl">面临严峻考验</span>。</span></p>
</div>`,
        narrative: {
            floatTitle: "深蓝色的极光之海",
            ch1Label: "降 落",
            ch1: "着陆在淡蓝色类海藻浮岛上，远处有低矮的蓝色礁石山，礁石附着发光的淡紫色海苔，岛边浅水区生着半透明柱状海草，深蓝色海面泛着荧光，极光横跨天穹。",
            ch2Label: "初 见",
            ch2: "你在浮岛边缘漫步，靠近礁石山时，发现了一只「暖核狐」。它通体淡蓝色，尾巴像珊瑚般分叉，周身泛着暖光，四肢带蹼，正蹲在礁石旁舔食发光海苔。",
            ch3Label: "相 依",
            ch3: "极光风岚骤然袭来，你急忙抱起暖核狐，躲进浮岛边缘的类海藻避风棚，它安静地蜷缩在你怀里传递暖意。",
            ch4Label: "共 生",
            ch4: "风暴平息，极光依旧温柔，海面泛着荧光。你带着暖核狐在浮岛漫步，它在类海藻上奔跑戏水，你看着它，心中生出惆怅，这样相依相伴，一直下去就好。",
        },
        narrativeL3: {
            ...L3_CHAPTER_LABELS,
            ch1: "平台边缘检测到极高热能残留。暖核狐原本站立的地方只留下一圈深褐色的灼痕以及几根碳化的毛发。海面上浮现出大量因磁场风暴导致内脏破裂的发光海洋生物残骸。",
            ch2: "荧光海水转变为铅灰色且粘稠的胶质。海面结出大片狰狞的盐晶。气温跌至零下180摄氏度，空气中的水蒸气直接凝华成无数细小的冰针，在狂风中疯狂切割着一切表面。",
            ch3: [
                "海洋彻底死寂，海浪在冲击平台的瞬间被冻结成扭曲的冰刺。大气层开始逃逸，天空颜色由蓝转黑。整颗星球变成了一颗被冰雪与盐晶包裹的、不再旋转的死球。",
                "你靠着舱壁，听着舱外冰针呼啸、寒风暴裂的刺耳声响，心底只剩彻骨的无力。满眼皆是冰封死境，茫茫宇宙，再也没有你可以栖身的归宿。",
            ],
            ch4: HOMESICK_CH4,
        },
    },
    {
        id: "PROXIMA CENTAURI B",
        title: "THE NEAREST NEIGHBOR",
        tagline: "琥珀色的永恒午后",
        image: "images/PROXIMA-CENTAURI-B.png",
        planetTheme: "proxima",
        glowBg: "radial-gradient(circle at center, rgba(255,100,50,0.35) 0%, rgba(255,100,50,0.15) 35%, rgba(255,100,50,0.05) 55%, transparent 70%)",
        rippleColor: "rgba(255,110,60,0.75)",
        coords: [
            { k: "RA",            v: "14h 29m 42.9s (217.4289°) | 赤经" },
            { k: "DEC",           v: "-62° 40' 46\" (-62.6794°) | 赤纬" },
            { k: "Constellation", v: "Centaurus（半人马座）" },
            { k: "Distance",      v: "~4.24 light-years" },
            { k: "Host Star",     v: "Proxima Centauri" },
        ],
        annotation: `
<div class="story-container">
  <p class="sc-header">外号 <span class="sc-nickname sc-accent">"近邻行星"</span></p>
  <p class="sc-distance"><span class="sc-dist-prefix">距地球仅 </span><span class="sc-dist-num sc-accent">4.24 光年</span></p>
  <p class="sc-landscape">地表被<span class="sc-hl">红色砂岩矮山与溪流</span>覆盖，暗红色母星永不落下，<span class="sc-hl">将天地染成琥珀色</span>，只有微弱的明暗变化。</p>
  <p class="sc-risk"><span class="sc-risk-label">风险：</span><span class="sc-risk-desc">理论上是<span class="sc-hl">最容易抵达</span>的系外行星之一，但以当前技术，即使借助激光帆推进，也需要数千年航行。抵达时，行星正可能处于母星耀斑活动的高峰期，<span class="sc-hl">辐射环境极不稳定</span>。</span></p>
</div>`,
        narrative: {
            floatTitle: "琥珀色的永恒午后",
            ch1Label: "降 落",
            ch1: "舱门开启，目之所及皆是连绵的琥珀色矮山，山体由红色砂岩构成，山脚下蜿蜒着窄细的淡琥珀色溪流，岸边丛生着暗紫色地衣与针状石松。",
            ch2Label: "初 见",
            ch2: "沿着溪流前行，你在矮山背阴处，偶然看见一只「流光兔」。它通体淡琥珀色，背生蝉翼般的光翅，正低头舔饮溪水。",
            ch3Label: "相 依",
            ch3: "这里的重力略大于地球，你攀过矮山坡时渐渐乏力，不小心踩滑，那只流光兔立刻用脑袋轻轻蹭你的裤腿，引你站稳身形。",
            ch4Label: "共 生",
            ch4: "暮色渐暗，琥珀色矮山与溪流泛着微光。流光兔围着你轻跳，你蹲在溪边看着它，心中生出惆怅，这样安稳相伴，一直下去也好。",
        },
        narrativeL3: {
            ...L3_CHAPTER_LABELS,
            ch1: "营地外的音频采集器显示低频波动完全停止。流光兔的尸体横卧在紫色苔藓边缘，半透明的翅膀碎裂成细小的晶体颗粒，随风卷入红砂中。尸体周围的地面出现了一圈放射状的焦痕。",
            ch2: "红矮星的辐射强度持续攀升，原本暖橙色的大气层被电离成病态的暗紫色。地表出现大面积地层塌陷，强碱性液体顺着裂缝喷涌而出，将红砂腐蚀成黑色泥浆，不断冒出带毒的烟雾。",
            ch3: [
                "紫色苔藓成片焦黑、碳化，化作黑色灰烬形成遮天蔽日的灰烬云。",
                "你靠着舱壁，听着舱外灰烬翻飞、大地灼烧的轰鸣，浑身透着无力的疲惫。满目皆是荒芜焦土，世间偌大，再也没有属于你的容身之所。",
            ],
            ch4: HOMESICK_CH4,
        },
    },
];

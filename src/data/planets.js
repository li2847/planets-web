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
 * planetTheme — CSS data-attribute value for per-planet color theming
 */
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
            ch2: "你走进森林，听见琴韵般的声响，循声发现一只灵鹿。它通体翡翠色，脊背有淡蓝色斑纹，正站在巨型阔叶树旁，蹄子轻踏地面时，叶片便发出清脆回响。",
            ch3Label: "相 依",
            ch3: "灵鹿不慎从缓坡滑落，恰好跌在你身前，身体微微颤抖。你取出医疗胶小心翼翼为它处理蹄尖伤口，它温顺地蹭着你的指尖，全程没有挣扎，眼神里满是依赖。",
            ch4Label: "共 生",
            ch4: "伤口愈合后，灵鹿停在你身侧，你带着它走到山涧边。灵鹿围着花丛跳跃轻嗅，你坐在青苔藓坡上看着它，心中满是惆怅，这般安稳，就这样一直下去也不错。",
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
    },
];

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  baseColors,
  contourLines,
  diagonalHatch,
  escapeXml,
  fonts,
  hash,
  mix,
  mulberry32,
  paperDefs,
  sealMark,
  textureRect
} from "./visual-system.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const details = JSON.parse(await readFile(path.join(root, "data", "section-details.json"), "utf8"));
const routes = JSON.parse(await readFile(path.join(root, "data", "routes.json"), "utf8")).routes;
const outputDir = path.join(root, "assets", "section-images");

await mkdir(outputDir, { recursive: true });

for (const route of routes) {
  const routeDetails = details[route.id] ?? [];
  for (const [index, detail] of routeDetails.entries()) {
    const fileName = `${route.id}-${String(index + 1).padStart(2, "0")}.svg`;
    await writeFile(path.join(outputDir, fileName), sectionSvg(route, detail, index));
  }
}

console.log(`Wrote ${routes.reduce((total, route) => total + (details[route.id]?.length ?? 0), 0)} section images.`);

function sectionSvg(route, detail, index) {
  const width = 1800;
  const height = 1120;
  const seed = hash(`${route.id}-${index}-${detail.imageQuery}`);
  const rand = mulberry32(seed);
  const color = route.color;
  const accent = route.accent;
  const theme = inferTheme(detail.imageQuery, detail.themes);
  const order = String(index + 1).padStart(2, "0");
  const caption = detail.imageCaption ?? `${route.title}分段视觉`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(caption)}">
  <defs>
    ${paperDefs({ id: "paper", color, accent, seed })}
    <clipPath id="frameClip">
      <rect x="64" y="64" width="1672" height="992" rx="28"/>
    </clipPath>
    <linearGradient id="wash" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${mix(accent, baseColors.paperLight, 0.76)}"/>
      <stop offset="0.52" stop-color="${mix(color, baseColors.paper, 0.86)}"/>
      <stop offset="1" stop-color="${mix(color, baseColors.paperDeep, 0.56)}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#paper)"/>
  <g opacity="0.72">
    ${diagonalHatch({ width, height, color, opacity: 0.055, gap: 42 })}
    ${contourLines({ width, height, color: accent, opacity: 0.1, step: 150, bend: 74 })}
  </g>
  <g clip-path="url(#frameClip)">
    <rect x="64" y="64" width="1672" height="992" fill="url(#wash)"/>
    ${renderTheme(theme, width, height, color, accent, rand)}
    ${routeLine(width, height, color, accent, rand)}
    <rect x="64" y="64" width="1672" height="992" fill="${baseColors.ink}" opacity="0.035"/>
  </g>
  <rect x="64" y="64" width="1672" height="992" rx="28" fill="none" stroke="${baseColors.paperLight}" stroke-opacity="0.52" stroke-width="3"/>
  <rect x="88" y="88" width="1624" height="944" rx="20" fill="none" stroke="${baseColors.ink}" stroke-opacity="0.1" stroke-width="1.5"/>
  <g transform="translate(112 100)">
    ${sealMark({ x: 0, y: 0, size: 72, text: "段", sub: order, rotate: -3 })}
    <text x="92" y="30" fill="${baseColors.ink}" fill-opacity="0.62" font-family="${fonts.kai}" font-size="23" font-weight="900">${escapeXml(route.shortName)} / 第 ${order} 段</text>
    <text x="92" y="70" fill="${color}" font-family="${fonts.serif}" font-size="44" font-weight="900">${escapeXml(detail.nodes?.[0]?.name ?? route.title)}</text>
  </g>
  <text x="1688" y="994" text-anchor="end" fill="${baseColors.paperLight}" fill-opacity="0.72" font-family="${fonts.latin}" font-size="18" font-weight="900" letter-spacing="4">ROADTRIP CHINA</text>
  ${textureRect(width, height, 0.22)}
</svg>
`;
}

function inferTheme(query, themes) {
  const text = `${query} ${(themes ?? []).join(" ")}`.toLowerCase();
  if (/coast|sea|beach|海|湾|港|island|舟山|xiamen|taiwan|hualien/.test(text)) return "water";
  if (/river|canal|yangtze|lake|湖|江|河|运河|fuxian|洞庭|三峡/.test(text)) return "river";
  if (/desert|dunhuang|turpan|gobi|戈壁|沙|柴达木|taklamakan|ruoqiang|mangya/.test(text)) return "desert";
  if (/city|beijing|shanghai|xian|古城|城市|南京|杭州|luoyang|harbin/.test(text)) return "city";
  if (/forest|mohe|kanas|yichun|森林|喀纳斯|heihe/.test(text)) return "forest";
  if (/karst|guilin|yangshuo|libo|huangguoshu|喀斯特|桂林|阳朔|瀑布/.test(text)) return "karst";
  if (/plateau|tibet|lhasa|ngari|kekexili|高原|阿里|藏|gannan|xiahe|litang/.test(text)) return "plateau";
  return "mountain";
}

function renderTheme(theme, width, height, color, accent, rand) {
  if (theme === "water") return waterScene(width, height, color, accent, rand);
  if (theme === "river") return riverScene(width, height, color, accent, rand);
  if (theme === "desert") return desertScene(width, height, color, accent, rand);
  if (theme === "city") return cityScene(width, height, color, accent, rand);
  if (theme === "forest") return forestScene(width, height, color, accent, rand);
  if (theme === "karst") return karstScene(width, height, color, accent, rand);
  if (theme === "plateau") return plateauScene(width, height, color, accent, rand);
  return mountainScene(width, height, color, accent, rand);
}

function mountainScene(width, height, color, accent, rand) {
  return [
    sunDisk(rand, accent),
    mountainRange(width, height, mix(accent, "#5a6f77", 0.42), 520, 0.62, rand),
    mountainRange(width, height, mix(color, "#37454c", 0.38), 660, 0.88, rand),
    `<path d="M64 806 C360 730 560 824 850 762 C1160 696 1400 806 1736 736 L1736 1056 L64 1056Z" fill="${mix(color, "#3f3f35", 0.42)}" opacity="0.86"/>`
  ].join("\n    ");
}

function plateauScene(width, height, color, accent, rand) {
  return [
    sunDisk(rand, mix(accent, "#f2c66d", 0.38)),
    mountainRange(width, height, mix(accent, "#9aa59b", 0.55), 500, 0.48, rand),
    `<path d="M64 720 C380 650 610 706 890 654 C1160 603 1430 690 1736 620 L1736 1056 L64 1056Z" fill="${mix(accent, "#b8a778", 0.48)}" opacity="0.86"/>`,
    `<path d="M64 872 C380 808 650 890 960 824 C1260 760 1450 850 1736 790 L1736 1056 L64 1056Z" fill="${mix(color, "#6b6854", 0.42)}"/>`
  ].join("\n    ");
}

function desertScene(width, height, color, accent, rand) {
  return [
    sunDisk(rand, mix(accent, "#f1bb61", 0.34)),
    `<path d="M64 690 C310 585 520 682 748 618 C988 550 1215 614 1466 552 C1598 519 1668 530 1736 506 L1736 1056 L64 1056Z" fill="${mix(accent, "#d6aa64", 0.35)}" opacity="0.9"/>`,
    `<path d="M64 810 C360 740 574 814 900 742 C1200 676 1400 758 1736 682 L1736 1056 L64 1056Z" fill="${mix(color, "#c78b47", 0.4)}" opacity="0.86"/>`,
    `<path d="M64 930 C400 858 690 940 1020 850 C1290 776 1510 858 1736 800 L1736 1056 L64 1056Z" fill="${mix(color, "#6a4d30", 0.34)}"/>`
  ].join("\n    ");
}

function waterScene(width, height, color, accent, rand) {
  return [
    sunDisk(rand, mix(accent, "#cddfb8", 0.42)),
    mountainRange(width, height, mix(accent, "#7397a0", 0.56), 540, 0.48, rand),
    `<path d="M64 684 C330 642 560 714 858 672 C1136 634 1438 692 1736 650 L1736 1056 L64 1056Z" fill="${mix(color, "#8eb9c7", 0.55)}" opacity="0.84"/>`,
    ...Array.from({ length: 7 }, (_, i) => `<path d="M${120 + i * 230} ${820 + (i % 2) * 32} C${230 + i * 230} ${792 + (i % 3) * 20} ${320 + i * 230} 850 ${450 + i * 230} 812" fill="none" stroke="${baseColors.paperLight}" stroke-width="6" opacity="0.45"/>`)
  ].join("\n    ");
}

function riverScene(width, height, color, accent, rand) {
  return [
    sunDisk(rand, mix(accent, "#d6e6d3", 0.38)),
    mountainRange(width, height, mix(accent, "#6f897b", 0.58), 512, 0.45, rand),
    `<path d="M32 895 C280 744 448 840 644 720 C842 600 1018 720 1210 638 C1390 562 1565 590 1768 470 L1768 1056 L32 1056Z" fill="${mix(color, "#6ca1a4", 0.52)}" opacity="0.82"/>`,
    `<path d="M46 944 C300 815 486 900 704 770 C900 656 1044 760 1250 690 C1450 620 1608 660 1744 560" fill="none" stroke="${baseColors.paperLight}" stroke-width="20" opacity="0.32"/>`
  ].join("\n    ");
}

function cityScene(width, height, color, accent, rand) {
  const buildings = Array.from({ length: 19 }, (_, i) => {
    const x = 72 + i * 88;
    const h = 120 + rand() * 270;
    return `<rect x="${x}" y="${748 - h}" width="${54 + rand() * 44}" height="${h}" rx="4" fill="${mix(i % 2 ? color : accent, "#3a3f42", 0.38)}" opacity="${0.68 + rand() * 0.18}"/>`;
  }).join("\n    ");
  return `${sunDisk(rand, mix(accent, "#e5c17c", 0.36))}
    ${buildings}
    <path d="M64 810 C300 770 540 850 812 805 C1138 752 1418 828 1736 780 L1736 1056 L64 1056Z" fill="${mix(color, "#7f8c8d", 0.46)}"/>`;
}

function forestScene(width, height, color, accent, rand) {
  const trees = Array.from({ length: 42 }, (_, i) => {
    const x = 42 + i * 42 + rand() * 16;
    const y = 665 + rand() * 190;
    const h = 120 + rand() * 190;
    return `<path d="M${x} ${y} L${x + 35} ${y - h} L${x + 70} ${y}Z" fill="${mix(i % 2 ? color : accent, "#203829", 0.36)}" opacity="0.82"/>`;
  }).join("\n    ");
  return `${sunDisk(rand, mix(accent, "#d8dfb0", 0.46))}
    ${mountainRange(width, height, mix(accent, "#7c8f88", 0.58), 500, 0.42, rand)}
    ${trees}
    <path d="M64 860 C320 800 590 890 910 820 C1230 750 1460 830 1736 770 L1736 1056 L64 1056Z" fill="${mix(color, "#25392e", 0.42)}"/>`;
}

function karstScene(width, height, color, accent, rand) {
  const peaks = Array.from({ length: 10 }, (_, index) => {
    const x = 64 + index * 178;
    const peak = 400 + rand() * 130;
    return `<path d="M${x} 782 C${x + 38} ${peak} ${x + 95} ${peak - 30} ${x + 142} 782Z" fill="${mix(index % 2 ? color : accent, "#6d7c6b", 0.44)}" opacity="${0.65 + rand() * 0.2}"/>`;
  }).join("\n    ");
  return `${sunDisk(rand, mix(accent, "#d6e2ba", 0.42))}
    ${peaks}
    <path d="M64 840 C330 790 552 862 830 812 C1110 762 1420 844 1736 790 L1736 1056 L64 1056Z" fill="${mix(color, "#6f735f", 0.44)}"/>`;
}

function mountainRange(width, height, fill, baseline, amp, rand) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const x = 64 + ((width - 128) / 9) * i;
    const y = baseline - (90 + rand() * 260) * amp;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return `<path d="M64 ${baseline} L${points.join(" L")} L1736 ${baseline} L1736 ${height} L64 ${height}Z" fill="${fill}" opacity="0.74"/>`;
}

function routeLine(width, height, color, accent, rand) {
  const y = 835 + rand() * 88;
  const d = `M180 ${y.toFixed(1)} C400 ${(y - 108).toFixed(1)} 560 ${(y + 88).toFixed(1)} 770 ${(y - 20).toFixed(1)} S1130 ${(y - 160).toFixed(1)} 1328 ${(y - 52).toFixed(1)} S1540 ${(y + 38).toFixed(1)} 1644 ${(y - 82).toFixed(1)}`;
  return `<path d="${d}" fill="none" stroke="${mix(color, baseColors.paperLight, 0.64)}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" opacity="0.74" filter="url(#assetShadow)"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/>
    <path d="${d}" fill="none" stroke="${accent}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16 18" opacity="0.58"/>`;
}

function sunDisk(rand, color) {
  const cx = 360 + rand() * 260;
  const cy = 210 + rand() * 70;
  const r = 86 + rand() * 54;
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="0.52"/>`;
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  baseColors,
  escapeXml,
  fonts,
  hash,
  mix,
  paperDefs,
  textureRect
} from "./visual-system.mjs";

const routeData = JSON.parse(await readFile(new URL("../data/routes.json", import.meta.url), "utf8"));
const outputDir = new URL("../assets/route-logos/", import.meta.url);

await mkdir(outputDir, { recursive: true });

const routeGlyphs = {
  "silk-canal": "丝",
  coastal: "海",
  yangtze: "江",
  "east-west": "横",
  "south-north": "纵",
  "western-vertical": "西",
  "central-vertical": "中",
  "south-china": "霞"
};

for (const route of routeData.routes) {
  await writeFile(new URL(`${route.id}.svg`, outputDir), buildLogo(route), "utf8");
}

console.log(`Generated ${routeData.routes.length} route sign logos in assets/route-logos`);

function buildLogo(route) {
  const color = route.color;
  const glyph = routeGlyphs[route.id] ?? route.shortName.slice(0, 1);
  const order = String(route.order).padStart(2, "0");
  const seed = hash(`route-sign-${route.id}`);
  const shortSize = route.shortName.length >= 5 ? 29 : route.shortName.length >= 4 ? 32 : 35;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 128" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(route.shortName)}路线签牌</title>
  <desc id="desc">行车中国第${route.order}条路线：${escapeXml(route.title)}。</desc>
  <defs>
    ${paperDefs({ id: "paper", color, accent: color, seed })}
    <linearGradient id="paperClean" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${baseColors.paperLight}"/>
      <stop offset="1" stop-color="${mix(color, baseColors.paper, 0.93)}"/>
    </linearGradient>
  </defs>
  <rect x="5" y="5" width="350" height="118" rx="21" fill="url(#paperClean)" filter="url(#assetShadow)"/>
  <rect x="8.5" y="8.5" width="343" height="111" rx="18" fill="none" stroke="${color}" stroke-width="5"/>
  <rect x="20" y="20" width="76" height="76" rx="16" fill="${color}"/>
  <rect x="29" y="29" width="58" height="58" rx="11" fill="none" stroke="${baseColors.paperLight}" stroke-width="3.2" opacity="0.78"/>
  <text x="58" y="69" text-anchor="middle" fill="${baseColors.paperLight}" font-family="${fonts.kai}" font-size="42" font-weight="900">${escapeXml(glyph)}</text>
  <text x="112" y="52" fill="${baseColors.ink}" font-family="${fonts.serif}" font-size="${shortSize}" font-weight="900">${escapeXml(route.shortName)}</text>
  <path d="M113 77H244" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
  <text x="303" y="83" text-anchor="middle" fill="${color}" font-family="${fonts.latin}" font-size="24" font-weight="900" letter-spacing="1.2">${order}</text>
  <text x="113" y="101" fill="${baseColors.ink}" fill-opacity="0.58" font-family="${fonts.sans}" font-size="13" font-weight="900">${escapeXml(route.kicker)}</text>
  ${textureRect(360, 128, 0.16)}
</svg>
`;
}

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { baseColors, escapeXml, fonts, hash, mix, textureRect, uniqueColors } from "./visual-system.mjs";

const topicData = JSON.parse(await readFile(new URL("../data/special-topics.json", import.meta.url), "utf8"));
const articleData = JSON.parse(await readFile(new URL("../data/topic-articles.json", import.meta.url), "utf8"));
const routeData = JSON.parse(await readFile(new URL("../data/routes.json", import.meta.url), "utf8"));
const outputDir = new URL("../assets/topic-covers/", import.meta.url);

await mkdir(outputDir, { recursive: true });

const routeById = new Map(routeData.routes.map((route) => [route.id, route]));

const topicProfiles = {
  "northern-xinjiang": {
    label: "北疆",
    glyph: "疆",
    motif: "mountain-lake",
    colors: ["#0b4f8f", "#2ebf9f", "#c8ddd8", "#10243a"],
    line: "天山 / 冷湖 / 林海"
  },
  "tarim-kunlun-oasis": {
    label: "南疆",
    glyph: "漠",
    motif: "oasis",
    colors: ["#d55d34", "#0a756d", "#d9e7df", "#2d1d16"],
    line: "塔里木 / 绿洲 / 昆仑"
  },
  "hexi-corridor": {
    label: "河西",
    glyph: "廊",
    motif: "corridor",
    colors: ["#bc2f26", "#263f84", "#d5e0dd", "#171b22"],
    line: "关城 / 绿洲 / 祁连"
  },
  "gannan-gateway": {
    label: "甘南",
    glyph: "寺",
    motif: "gateway",
    colors: ["#166a58", "#a83150", "#cbded5", "#172a31"],
    line: "寺院 / 草原 / 高原门廊"
  },
  "western-sichuan-highlands": {
    label: "川西",
    glyph: "岭",
    motif: "mountain-pass",
    colors: ["#253f8a", "#d55638", "#5aa38a", "#101923"],
    line: "康定 / 理塘 / 大渡河"
  },
  "taihang-eight-passes": {
    label: "太行",
    glyph: "陉",
    motif: "temple-river",
    colors: ["#8f2b24", "#15191e", "#cbd7d4", "#dae6e3"],
    line: "八陉 / 古道 / 山门"
  },
  "xu-xiake-guangxi": {
    label: "广西",
    glyph: "喀",
    motif: "karst",
    colors: ["#10877c", "#b6315a", "#c8ddd3", "#253f32"],
    line: "峰林 / 江水 / 洞穴"
  },
  "xu-xiake-yunnan": {
    label: "云南",
    glyph: "滇",
    motif: "sun-mountain",
    colors: ["#b6315a", "#125c73", "#d7dde2", "#1d2528"],
    line: "滇西 / 山径 / 霞客"
  }
};

const legacyTopicLabels = {
  "beibu-gulf-ports": "北部湾",
  "border-endpoints": "边境端点",
  "coastal-border-ports": "边海口岸",
  "gannan-qinghai-gateway": "甘南青海",
  "great-river-sources": "大河源头",
  "guizhou-guangxi-karst": "黔桂喀斯特",
  "hengduan-chuanzang-window": "横断川藏",
  "hengduan-chuanzang": "横断川藏",
  "hexi-qilian-corridor": "河西祁连",
  "huanghe-ancient-capitals": "黄河古都",
  "jianghan-three-gorges": "江汉三峡",
  "jiangnan-water-and-sea": "江南水海",
  "jiangnan-water-sea": "江南水海",
  "northeast-border-forest": "东北林海",
  "northeast-border-rivers": "东北界河",
  "plateau-source-wilds": "高原源野",
  "southeast-coast-strait": "东南海峡",
  "southwest-karst": "西南喀斯特",
  "tianshan-north-south": "天山南北",
  "western-grand-loop": "西部大环",
  "xu-xiake-southwest-corridor": "霞客西南",
  "xu-xiake-yunnan-finale": "云南终章",
  "yellow-river-capitals": "黄河古都",
  "yunnan-xiake-finale": "霞客滇西"
};

for (const topic of topicData.topics) {
  await writeFile(new URL(`${topic.id}.svg`, outputDir), buildCover(topic), "utf8");
}

const activeTopicIds = new Set(topicData.topics.map((topic) => topic.id));
const existingCoverIds = (await readdir(outputDir))
  .filter((name) => name.endsWith(".svg"))
  .map((name) => name.replace(/\.svg$/, ""));
const legacyCoverIds = existingCoverIds.filter((id) => !activeTopicIds.has(id));

for (const id of legacyCoverIds) {
  await writeFile(new URL(`${id}.svg`, outputDir), buildLegacyCover(id), "utf8");
}

console.log(`Generated ${topicData.topics.length} active topic covers and ${legacyCoverIds.length} legacy covers in assets/topic-covers`);

function buildCover(topic) {
  const article = articleData[topic.id];
  const routeColors = topic.routeIds
    .map((id) => routeById.get(id))
    .flatMap((route) => route ? [route.color, route.accent] : [])
    .filter(Boolean);
  const routePalette = uniqueColors(routeColors);
  const profile = profileForTopic(topic, routePalette);
  const [primary, secondary, , deep] = profile.colors;
  const seed = hash(`topic-cover-refined-${topic.id}`);
  const subtitle = profile.line ?? topic.kicker.split("、").slice(0, 3).join(" / ");
  const caption = article?.caption ?? topic.deck;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(topic.title)}专题标识</title>
  <desc id="desc">${escapeXml(caption)}</desc>
  <defs>
    ${coverDefs(seed)}
    <clipPath id="coverClip">
      <path d="M18 18C128 8 246 22 338 15C445 7 532 16 622 12V394C510 410 420 393 316 404C206 416 103 397 18 406Z"/>
    </clipPath>
  </defs>
  <rect width="640" height="420" fill="#f7f2e7"/>
  <g clip-path="url(#coverClip)">
    <rect x="18" y="12" width="604" height="398" fill="url(#coverPaper)"/>
    <path d="M-24 305C104 226 205 285 326 224C438 167 514 192 664 122V430H-24Z" fill="${mix(secondary, "#f7f2e7", 0.68)}" opacity="0.42"/>
    <path d="M-18 344C112 294 236 340 360 288C470 242 550 264 666 226V430H-18Z" fill="${mix(primary, "#f7f2e7", 0.76)}" opacity="0.34"/>
    <path d="M52 306C112 282 184 319 252 290S385 260 460 282S584 282 628 250" fill="none" stroke="${mix(deep, "#f7f2e7", 0.36)}" stroke-opacity="0.32" stroke-width="3" stroke-linecap="round"/>
    ${contourField(primary, secondary)}
    ${routeRibbons(topic.routeIds, 46, 48)}
    <text x="490" y="305" text-anchor="middle" fill="${mix(deep, "#f7f2e7", 0.32)}" fill-opacity="0.15" font-family="${fonts.kai}" font-size="152" font-weight="900">${escapeXml(profile.glyph)}</text>
  </g>
  <path d="M18 18C128 8 246 22 338 15C445 7 532 16 622 12" fill="none" stroke="${mix(primary, "#f7f2e7", 0.34)}" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round"/>
  <path d="M18 406C103 397 206 416 316 404C420 393 510 410 622 394" fill="none" stroke="${mix(secondary, "#f7f2e7", 0.34)}" stroke-opacity="0.42" stroke-width="3" stroke-linecap="round"/>
  <text x="48" y="112" fill="${mix(primary, baseColors.ink, 0.2)}" font-family="${fonts.kai}" font-size="18" font-weight="900" letter-spacing="5">专题成卷</text>
  <text x="46" y="198" fill="${baseColors.ink}" font-family="${fonts.serif}" font-size="84" font-weight="900">${escapeXml(profile.label)}</text>
  <text x="49" y="242" fill="${mix(deep, baseColors.ink, 0.34)}" font-family="${fonts.serif}" font-size="23" font-weight="900">${escapeXml(subtitle)}</text>
  <text x="50" y="356" fill="${mix(primary, baseColors.ink, 0.1)}" font-family="${fonts.sans}" font-size="13" font-weight="900" letter-spacing="1.2">TOPIC / ${String(topic.routeIds.length).padStart(2, "0")} ROUTES</text>
  ${sealStamp({ x: 535, y: 52, text: profile.glyph, sub: String(topic.routeIds.length) })}
  ${textureRect(640, 420, 0.16)}
</svg>
`;
}

function buildLegacyCover(id) {
  const colorSeed = hash(`legacy-topic-${id}`);
  const routes = routeData.routes;
  const first = routes[colorSeed % routes.length];
  const second = routes[(colorSeed >>> 3) % routes.length];
  const label = legacyTopicLabels[id] ?? titleFromId(id);
  const fakeTopic = {
    id,
    title: label,
    kicker: "专题存档",
    deck: `${label}专题封面存档。`,
    routeIds: [first.id, second.id]
  };
  const colors = uniqueColors([first.color, second.color, first.accent, second.accent]);
  const profile = profileForTopic(fakeTopic, colors);
  const motif = inferLegacyMotif(id);
  topicProfiles[id] = { ...profile, label: label.slice(0, 4), glyph: label.slice(0, 1), motif, line: "专题存档" };
  return buildCover(fakeTopic).replace(`${escapeXml(label)}专题标识`, `${escapeXml(label)}存档标识`);
}

function profileForTopic(topic, routePalette) {
  const existing = topicProfiles[topic.id];
  if (existing) return existing;

  const [first = "#c9652c", second = "#246b68", third = "#c8ddd8", fourth = "#1d2528"] = routePalette;
  return {
    label: topic.title.split(/[：:]/)[0].replace("的", "").slice(0, 4),
    glyph: topic.title.slice(0, 1),
    motif: inferLegacyMotif(topic.id),
    colors: [first, second, third, mix(fourth, baseColors.ink, 0.58)],
    line: topic.kicker.split("、").slice(0, 3).join(" / ")
  };
}

function coverDefs(seed) {
  return `
    <linearGradient id="coverPaper" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fbf7ed"/>
      <stop offset="0.55" stop-color="#f2eee3"/>
      <stop offset="1" stop-color="#e6eee9"/>
    </linearGradient>
    <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence baseFrequency="0.68" numOctaves="2" seed="${seed % 97}" type="fractalNoise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.16"/>
      </feComponentTransfer>
    </filter>`;
}

function routeRibbons(routeIds, x, y) {
  return routeIds.map((id, index) => {
    const route = routeById.get(id);
    const color = route?.color ?? "#fffaf0";
    const yy = y + index * 13;
    return `<path d="M${x} ${yy}H${x + 74 + index * 18}" fill="none" stroke="${color}" stroke-opacity="0.72" stroke-width="3.2" stroke-linecap="round"/>`;
  }).join("\n    ");
}

function contourField(primary, secondary) {
  return Array.from({ length: 7 }, (_, index) => {
    const y = 150 + index * 28;
    const color = index % 2 ? secondary : primary;
    return `<path d="M318 ${y}C368 ${y - 32} 420 ${y + 22} 472 ${y - 7}S574 ${y - 26} 626 ${y + 8}" fill="none" stroke="${color}" stroke-opacity="0.13" stroke-width="1.5" stroke-linecap="round"/>`;
  }).join("\n    ");
}

function sealStamp({ x, y, text, sub }) {
  return `<g transform="rotate(4 ${x + 30} ${y + 30})">
    <rect x="${x}" y="${y}" width="60" height="60" rx="12" fill="#a73a2b" opacity="0.9"/>
    <rect x="${x + 8}" y="${y + 8}" width="44" height="44" rx="8" fill="none" stroke="#fff4e6" stroke-opacity="0.72" stroke-width="2"/>
    <text x="${x + 30}" y="${y + 36}" text-anchor="middle" fill="#fff7eb" font-family="${fonts.kai}" font-size="28" font-weight="900">${escapeXml(text)}</text>
    <text x="${x + 30}" y="${y + 50}" text-anchor="middle" fill="#fff7eb" fill-opacity="0.76" font-family="${fonts.latin}" font-size="8" font-weight="900">${escapeXml(sub)}</text>
  </g>`;
}

function inferLegacyMotif(id) {
  if (/coast|gulf|port|strait|sea|water/.test(id)) return "gateway";
  if (/river|jiang|yellow|source|three-gorges/.test(id)) return "oasis";
  if (/karst|guangxi|guizhou|southwest/.test(id)) return "karst";
  if (/gannan|plateau|chuanzang|hengduan|tianshan|sichuan/.test(id)) return "mountain-pass";
  if (/capital|taihang/.test(id)) return "temple-river";
  if (/yunnan|xiake/.test(id)) return "sun-mountain";
  if (/corridor|hexi|qilian/.test(id)) return "corridor";
  return "mountain-lake";
}

function titleFromId(id) {
  return id
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

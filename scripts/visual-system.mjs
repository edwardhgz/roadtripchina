export const fonts = {
  sans: "'PingFang SC','Hiragino Sans GB','Noto Sans CJK SC','Microsoft YaHei',Arial,sans-serif",
  serif: "'Songti SC','STSong','Source Han Serif SC','Noto Serif CJK SC','SimSun',serif",
  kai: "'Kaiti SC','STKaiti','FZKai-Z03S','KaiTi','Songti SC','STSong','Noto Serif CJK SC',serif",
  reading: "'STFangsong','FangSong','FangSong_GB2312','仿宋','仿宋_GB2312','Songti SC','STSong','Noto Serif CJK SC',serif",
  latin: "'Avenir Next',Avenir,Arial,sans-serif"
};

export const baseColors = {
  paper: "#fcf7ec",
  paperLight: "#fffaf0",
  paperDeep: "#eadcc4",
  ink: "#20231f",
  muted: "#66685f",
  cinnabar: "#9f3525",
  seal: "#7f271e",
  gold: "#9d7338",
  mountain: "#4d625c"
};

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function hexToRgb(value) {
  const normalized = value.replace("#", "");
  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
}

export function mix(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const mixed = a.map((channel, index) => Math.round(channel * (1 - amount) + b[index] * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function uniqueColors(colors) {
  return [...new Set(colors.filter(Boolean))];
}

export function paperDefs({ id = "paper", color = "#c9652c", accent = "#246b68", seed = 7 } = {}) {
  return `
    <linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${baseColors.paperLight}"/>
      <stop offset="0.48" stop-color="${mix(color, baseColors.paper, 0.9)}"/>
      <stop offset="1" stop-color="${mix(accent, baseColors.paperDeep, 0.82)}"/>
    </linearGradient>
    <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence baseFrequency="0.74" numOctaves="2" seed="${seed % 97}" type="fractalNoise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.13"/>
      </feComponentTransfer>
    </filter>
    <filter id="assetShadow" x="-18%" y="-18%" width="136%" height="136%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#2f261a" flood-opacity="0.16"/>
    </filter>`;
}

export function textureRect(width, height, opacity = 0.55) {
  return `<rect width="${width}" height="${height}" fill="#3b3020" filter="url(#paperGrain)" opacity="${opacity}"/>`;
}

export function contourLines({ width, height, color = baseColors.mountain, opacity = 0.16, step = 130, bend = 58 }) {
  return Array.from({ length: Math.ceil(height / step) + 4 }, (_, index) => {
    const y = -step + index * step;
    const d = `M-${width * 0.08} ${y} C${width * 0.18} ${y - bend} ${width * 0.32} ${y + bend} ${width * 0.52} ${y} S${width * 0.82} ${y - bend} ${width * 1.08} ${y + bend * 0.25}`;
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.2" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
  }).join("\n  ");
}

export function diagonalHatch({ width, height, color = baseColors.gold, opacity = 0.08, gap = 34 }) {
  return Array.from({ length: Math.ceil((width + height) / gap) }, (_, index) => {
    const x = index * gap - height;
    return `<path d="M${x} ${height} L${x + height} 0" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="${opacity}"/>`;
  }).join("\n  ");
}

export function sealMark({ x, y, size = 52, text = "行", sub = "", rotate = 0 }) {
  const subText = sub
    ? `<text x="${x + size / 2}" y="${y + size * 0.78}" text-anchor="middle" fill="#fff2df" font-family="${fonts.latin}" font-size="${size * 0.14}" font-weight="900" letter-spacing="0.8">${escapeXml(sub)}</text>`
    : "";
  return `<g transform="rotate(${rotate} ${x + size / 2} ${y + size / 2})">
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.14}" fill="${baseColors.cinnabar}"/>
    <rect x="${x + size * 0.1}" y="${y + size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.1}" fill="none" stroke="#fff2df" stroke-opacity="0.72" stroke-width="${Math.max(1.2, size * 0.035)}"/>
    <text x="${x + size / 2}" y="${y + size * 0.6}" text-anchor="middle" fill="#fff7e8" font-family="${fonts.kai}" font-size="${size * 0.46}" font-weight="900">${escapeXml(text)}</text>
    ${subText}
  </g>`;
}

export function routeGlyph(kind, { color, accent, x = 0, y = 0, scale = 1, light = "#fffaf0" }) {
  const shared = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const motifs = {
    "silk-canal": `
      <path d="M15 74 C46 34 80 97 116 62 S184 31 222 75" ${shared} stroke="${accent}" stroke-width="8"/>
      <path d="M17 101 C68 68 119 124 222 92" ${shared} stroke="${color}" stroke-width="5.4" stroke-dasharray="18 13"/>
      <path d="M48 42 C80 25 116 26 152 44" ${shared} stroke="${color}" stroke-width="3.4" opacity="0.55"/>
      <circle cx="15" cy="74" r="5.8" fill="${color}"/>
      <circle cx="222" cy="75" r="5.8" fill="${accent}"/>`,
    coastal: `
      <path d="M17 91 C43 63 69 113 97 89 S154 63 183 88 S230 114 254 88" ${shared} stroke="${color}" stroke-width="7"/>
      <path d="M34 49 C61 22 93 28 119 55 C141 78 171 81 196 58 C215 42 237 41 254 53" ${shared} stroke="${accent}" stroke-width="5"/>
      <path d="M105 38 L158 13 L194 39" ${shared} stroke="${color}" stroke-width="4.4" opacity="0.74"/>`,
    yangtze: `
      <path d="M5 88 C47 40 91 119 136 77 S207 36 274 88" ${shared} stroke="${color}" stroke-width="8"/>
      <path d="M36 60 C76 55 104 88 136 77 S205 55 244 59" ${shared} stroke="${accent}" stroke-width="5"/>
      <path d="M123 101 C153 86 177 101 207 88" ${shared} stroke="${accent}" stroke-width="4" opacity="0.62"/>
      <circle cx="5" cy="88" r="5.4" fill="${accent}"/>
      <circle cx="274" cy="88" r="7" fill="${accent}"/>`,
    "east-west": `
      <path d="M10 74 H256" ${shared} stroke="${color}" stroke-width="8"/>
      <path d="M230 51 L260 74 L230 97" ${shared} stroke="${color}" stroke-width="6.4"/>
      <path d="M21 46 H100 M31 104 H162" ${shared} stroke="${accent}" stroke-width="5"/>
      <circle cx="28" cy="74" r="7.2" fill="${accent}"/>
      <circle cx="260" cy="74" r="5.2" fill="${light}" stroke="${color}" stroke-width="4"/>`,
    "south-north": `
      <path d="M132 18 V135" ${shared} stroke="${color}" stroke-width="8"/>
      <path d="M113 42 L132 16 L151 42" ${shared} stroke="${color}" stroke-width="5.5"/>
      <path d="M92 135 H172" ${shared} stroke="${accent}" stroke-width="6"/>
      <path d="M65 79 H199" ${shared} stroke="${accent}" stroke-width="4.4" stroke-dasharray="13 12"/>
      <circle cx="132" cy="16" r="5" fill="${accent}"/>
      <circle cx="132" cy="135" r="5" fill="${color}"/>`,
    "western-vertical": `
      <path d="M5 126 L62 52 L111 102 L161 29 L255 126" ${shared} stroke="${color}" stroke-width="7"/>
      <path d="M62 52 L111 102 L161 29" ${shared} stroke="${light}" stroke-width="2.8" opacity="0.9"/>
      <path d="M129 139 C137 102 153 69 181 36" ${shared} stroke="${accent}" stroke-width="5" stroke-dasharray="14 10"/>
      <path d="M24 151 H268" ${shared} stroke="${accent}" stroke-width="3.8" opacity="0.58"/>`,
    "central-vertical": `
      <path d="M52 126 C88 80 119 83 134 33 C151 82 183 81 220 126" ${shared} stroke="${color}" stroke-width="7"/>
      <path d="M17 89 H254 M47 57 H224 M75 136 H194" ${shared} stroke="${accent}" stroke-width="4.5"/>
      <path d="M134 33 V150" ${shared} stroke="${color}" stroke-width="3.4" stroke-dasharray="9 11" opacity="0.68"/>
      <circle cx="134" cy="33" r="6.2" fill="${accent}"/>`,
    "south-china": `
      <path d="M8 128 C31 79 59 51 87 126 C112 67 149 35 179 126 C204 85 232 82 263 128" ${shared} stroke="${color}" stroke-width="7"/>
      <path d="M48 142 C91 116 142 153 217 108" ${shared} stroke="${accent}" stroke-width="5" stroke-dasharray="14 10"/>
      <path d="M69 53 C85 40 101 40 116 54" ${shared} stroke="${accent}" stroke-width="4" opacity="0.72"/>
      <circle cx="179" cy="126" r="5" fill="${accent}"/>`
  };

  return `<g transform="translate(${x} ${y}) scale(${scale})">${motifs[kind] ?? motifs["silk-canal"]}</g>`;
}

export function projectForSvg(boundsValue, width, height, padding) {
  const padded = {
    west: boundsValue.west - 1,
    south: boundsValue.south - 0.8,
    east: boundsValue.east + 1,
    north: boundsValue.north + 0.8
  };
  const spanLon = padded.east - padded.west;
  const spanLat = padded.north - padded.south;
  const scale = Math.min((width - padding * 2) / spanLon, (height - padding * 2) / spanLat);
  const mapWidth = spanLon * scale;
  const mapHeight = spanLat * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return ([lon, lat]) => {
    const x = offsetX + (lon - padded.west) * scale;
    const y = offsetY + (padded.north - lat) * scale;
    return [Number(x.toFixed(1)), Number(y.toFixed(1))];
  };
}

export function svgPath(coords, project) {
  return coords
    .map((coord, index) => {
      const [x, y] = project(coord);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

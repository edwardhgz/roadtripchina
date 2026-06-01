import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  baseColors,
  escapeXml,
  fonts,
  hash,
  mix,
  textureRect
} from "./visual-system.mjs";

const routes = JSON.parse(await readFile(new URL("../data/routes.json", import.meta.url), "utf8")).routes;
const analysis = JSON.parse(await readFile(new URL("../data/route-analysis.json", import.meta.url), "utf8"));
const outputDir = new URL("../assets/crossing-maps/", import.meta.url);
const tileSize = 256;
const tileCache = new Map();

await mkdir(outputDir, { recursive: true });

const routeById = new Map(routes.map((route) => [route.id, route]));
const aliases = new Map([
  ["江南水网", ["杭州", "绍兴", "宁波", "舟山", "无锡", "常州"]],
  ["珠江口", ["深圳", "珠海", "广州", "香港"]],
  ["关中西缘", ["宝鸡", "西安"]],
  ["滇中湖盆", ["昆明", "抚仙湖", "玉溪"]],
  ["三门峡附近", ["三门峡", "洛阳"]],
  ["神农架附近", ["神农架", "宜昌"]],
  ["宜昌附近", ["宜昌", "神农架"]],
  ["德钦高原边缘", ["德钦", "理塘", "康定"]],
  ["理塘高原边缘", ["理塘", "德钦", "康定"]]
]);

let count = 0;

for (const route of routes) {
  const crossings = analysis[route.id]?.crossings ?? [];
  for (const [index, crossing] of crossings.entries()) {
    const target = routeById.get(crossing.with);
    if (!target) continue;
    const file = new URL(`${route.id}-${String(index + 1).padStart(2, "0")}.svg`, outputDir);
    await writeFile(file, await crossingMapSvg(route, target, crossing, index), "utf8");
    count += 1;
  }
}

console.log(`Generated ${count} crossing zoom maps in assets/crossing-maps`);

async function crossingMapSvg(route, target, crossing, index) {
  const width = 720;
  const height = 450;
  const seed = hash(`${route.id}-${target.id}-${crossing.place}-${index}`);
  const anchors = resolveAnchors(crossing.place, route, target);
  const focus = focusPoints(route, target, anchors);
  const bounds = paddedBounds(focus, route, target);
  const viewport = mapViewport(bounds, width, height, 34);
  const project = viewport.project;
  const sourceSegments = geometrySegments(route, bounds);
  const targetSegments = geometrySegments(target, bounds);
  const labelPoints = anchors.length ? anchors : focus.slice(0, 2).map((coordinate, i) => ({
    name: i === 0 ? route.shortName : target.shortName,
    coordinate
  }));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(crossing.place)}交汇局部图</title>
  <desc id="desc">${escapeXml(route.shortName)}与${escapeXml(target.shortName)}在${escapeXml(crossing.place)}附近的局部示意地图。</desc>
  <defs>
    <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fbf7ed"/>
      <stop offset="0.58" stop-color="${mix(route.color, baseColors.paper, 0.94)}"/>
      <stop offset="1" stop-color="${mix(target.color, "#e0ebe5", 0.9)}"/>
    </linearGradient>
    <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence baseFrequency="0.7" numOctaves="2" seed="${seed % 97}" type="fractalNoise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.13"/>
      </feComponentTransfer>
    </filter>
    <clipPath id="mapClip">
      <path d="M18 22C145 12 268 24 376 17C494 10 604 17 702 14V420C572 437 461 422 344 432C216 444 107 426 18 434Z"/>
    </clipPath>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#paper)"/>
  <g clip-path="url(#mapClip)">
    <rect x="18" y="14" width="684" height="420" fill="#f8f3e8"/>
    ${await tileLayer(viewport)}
    <rect width="${width}" height="${height}" fill="#f8f3e8" opacity="0.36"/>
    <rect width="${width}" height="${height}" fill="${baseColors.ink}" opacity="0.035"/>
    <path d="M-20 338C116 278 236 322 358 270C482 217 590 240 742 188V462H-20Z" fill="${mix(target.color, "#f7f2e7", 0.78)}" opacity="0.14"/>
    <path d="M-36 382C96 330 238 376 374 326C488 284 596 306 748 260V464H-36Z" fill="${mix(route.color, "#f7f2e7", 0.82)}" opacity="0.13"/>
    ${graticule(bounds, project)}
    ${routeSegments(sourceSegments, project, route.color, 7.5, false)}
    ${routeSegments(targetSegments, project, target.color, 6.5, false)}
    ${routeSegments(branchSegments(route, bounds), project, route.color, 4.2, true)}
    ${routeSegments(branchSegments(target, bounds), project, target.color, 3.8, true)}
    ${anchorDots(labelPoints, project, route, target)}
  </g>
  <path d="M18 22C145 12 268 24 376 17C494 10 604 17 702 14" fill="none" stroke="${mix(route.color, "#f7f2e7", 0.32)}" stroke-width="3" stroke-linecap="round"/>
  <path d="M18 434C107 426 216 444 344 432C461 422 572 437 702 420" fill="none" stroke="${mix(target.color, "#f7f2e7", 0.36)}" stroke-width="3" stroke-linecap="round" opacity="0.82"/>
  ${legend(route, target, crossing)}
  <text x="${width - 34}" y="${height - 22}" text-anchor="end" fill="#545c5c" fill-opacity="0.72" font-family="${fonts.sans}" font-size="11" font-weight="800">© OpenStreetMap contributors · 行政区划底图</text>
  ${textureRect(width, height, 0.12)}
</svg>
`;
}

function resolveAnchors(place, route, target) {
  const candidates = placeTokens(place).flatMap((token) => aliases.get(token) ?? [token]);
  const markers = [...(route.markers ?? []), ...(target.markers ?? []), ...routes.flatMap((item) => item.markers ?? [])];
  const seen = new Set();
  const anchors = [];

  for (const token of candidates) {
    const marker = markers.find((item) => item.name === token || item.name.includes(token) || token.includes(item.name));
    if (!marker) continue;
    const key = `${marker.name}-${marker.lon}-${marker.lat}`;
    if (seen.has(key)) continue;
    seen.add(key);
    anchors.push({ name: marker.name, coordinate: [marker.lon, marker.lat] });
  }

  return anchors;
}

function placeTokens(place) {
  return place
    .replaceAll("一带", "")
    .replaceAll("附近", "")
    .replaceAll("高原边缘", "")
    .split(/[、，,与和]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function focusPoints(route, target, anchors) {
  const anchorCoords = anchors.map((anchor) => anchor.coordinate);
  const base = anchorCoords.length ? centroid(anchorCoords) : closestPair(route, target);
  return [
    ...anchorCoords,
    nearestCoordinate(route, base),
    nearestCoordinate(target, base)
  ];
}

function paddedBounds(points, route, target) {
  const value = boundsFor(points);
  const lonSpan = Math.max(value.east - value.west, 1.6);
  const latSpan = Math.max(value.north - value.south, 1.1);
  const expanded = {
    west: value.west - lonSpan * 0.58,
    east: value.east + lonSpan * 0.58,
    south: value.south - latSpan * 0.7,
    north: value.north + latSpan * 0.7
  };
  const routePoint = nearestCoordinate(route, centroid(points));
  const targetPoint = nearestCoordinate(target, centroid(points));
  return boundsFor([routePoint, targetPoint, [expanded.west, expanded.south], [expanded.east, expanded.north]]);
}

function geometryCoordinates(route) {
  return [
    ...(route.geometry?.main?.coordinates ?? []),
    ...(route.geometry?.branch?.coordinates ?? [])
  ];
}

function nearestCoordinate(route, coordinate) {
  return geometryCoordinates(route).reduce((best, item) => (
    distance(item, coordinate) < distance(best, coordinate) ? item : best
  ), geometryCoordinates(route)[0]);
}

function closestPair(route, target) {
  const a = sample(geometryCoordinates(route), 130);
  const b = sample(geometryCoordinates(target), 130);
  let best = [a[0], b[0]];
  let bestDistance = Infinity;
  for (const first of a) {
    for (const second of b) {
      const current = distance(first, second);
      if (current < bestDistance) {
        bestDistance = current;
        best = [first, second];
      }
    }
  }
  return centroid(best);
}

function sample(coordinates, max) {
  if (coordinates.length <= max) return coordinates;
  const step = Math.ceil(coordinates.length / max);
  return coordinates.filter((_, index) => index % step === 0);
}

function boundsFor(points) {
  const lons = points.map(([lon]) => lon);
  const lats = points.map(([, lat]) => lat);
  return {
    west: Math.min(...lons),
    south: Math.min(...lats),
    east: Math.max(...lons),
    north: Math.max(...lats)
  };
}

function centroid(points) {
  return [
    points.reduce((sum, [lon]) => sum + lon, 0) / points.length,
    points.reduce((sum, [, lat]) => sum + lat, 0) / points.length
  ];
}

function distance([lon1, lat1], [lon2, lat2]) {
  return (lon1 - lon2) ** 2 + (lat1 - lat2) ** 2;
}

function mapViewport(bounds, width, height, padding) {
  const zoom = chooseTileZoom(bounds);
  const nw = lonLatToWorld([bounds.west, bounds.north], zoom);
  const se = lonLatToWorld([bounds.east, bounds.south], zoom);
  const worldLeft = nw.x;
  const worldTop = nw.y;
  const worldRight = se.x;
  const worldBottom = se.y;
  const spanX = Math.max(worldRight - worldLeft, 1);
  const spanY = Math.max(worldBottom - worldTop, 1);
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY);
  const mapWidth = spanX * scale;
  const mapHeight = spanY * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return {
    zoom,
    scale,
    offsetX,
    offsetY,
    worldLeft,
    worldTop,
    worldRight,
    worldBottom,
    project: (coordinate) => {
      const world = lonLatToWorld(coordinate, zoom);
      return {
        x: offsetX + (world.x - worldLeft) * scale,
        y: offsetY + (world.y - worldTop) * scale
      };
    }
  };
}

function chooseTileZoom(bounds) {
  for (let zoom = 8; zoom >= 4; zoom -= 1) {
    const nw = lonLatToWorld([bounds.west, bounds.north], zoom);
    const se = lonLatToWorld([bounds.east, bounds.south], zoom);
    if (se.x - nw.x <= 1200 && se.y - nw.y <= 850) return zoom;
  }
  return 4;
}

function lonLatToWorld([lon, lat], zoom) {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sinLat = Math.sin((clamped * Math.PI) / 180);
  const scale = tileSize * 2 ** zoom;
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  };
}

async function tileLayer(viewport) {
  const maxTile = 2 ** viewport.zoom;
  const tileWidth = tileSize * viewport.scale;
  const minTileX = Math.max(0, Math.floor(viewport.worldLeft / tileSize) - 1);
  const maxTileX = Math.min(maxTile - 1, Math.floor(viewport.worldRight / tileSize) + 1);
  const minTileY = Math.max(0, Math.floor(viewport.worldTop / tileSize) - 1);
  const maxTileY = Math.min(maxTile - 1, Math.floor(viewport.worldBottom / tileSize) + 1);
  const images = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      const href = await tileDataUrl(viewport.zoom, x, y);
      if (!href) continue;
      images.push(`<image href="${href}" x="${(viewport.offsetX + (x * tileSize - viewport.worldLeft) * viewport.scale).toFixed(2)}" y="${(viewport.offsetY + (y * tileSize - viewport.worldTop) * viewport.scale).toFixed(2)}" width="${(tileWidth + 0.8).toFixed(2)}" height="${(tileWidth + 0.8).toFixed(2)}" preserveAspectRatio="none" opacity="0.96"/>`);
    }
  }

  return `<g>${images.join("\n    ")}</g>`;
}

async function tileDataUrl(z, x, y) {
  const key = `${z}/${x}/${y}`;
  if (tileCache.has(key)) return tileCache.get(key);

  const url = `https://tile.openstreetmap.org/${key}.png`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Roadtrip-China-local-preview/1.0"
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const dataUrl = `data:image/png;base64,${bytes.toString("base64")}`;
    tileCache.set(key, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn(`Could not fetch tile ${key}: ${error.message}`);
    tileCache.set(key, "");
    return "";
  }
}

function geometrySegments(route, bounds) {
  return [
    ...segmentsWithin(route.geometry?.main?.coordinates ?? [], bounds)
  ];
}

function branchSegments(route, bounds) {
  return segmentsWithin(route.geometry?.branch?.coordinates ?? [], bounds);
}

function segmentsWithin(coordinates, bounds) {
  const expanded = expandBounds(bounds, 0.24);
  const segments = [];
  let current = [];
  coordinates.forEach((coordinate, index) => {
    const keep = inBounds(coordinate, expanded)
      || inBounds(coordinates[index - 1] ?? coordinate, expanded)
      || inBounds(coordinates[index + 1] ?? coordinate, expanded);
    if (keep) {
      current.push(coordinate);
    } else if (current.length) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
  });
  if (current.length > 1) segments.push(current);
  return segments;
}

function expandBounds(bounds, amount) {
  const lon = Math.max(bounds.east - bounds.west, 0.6);
  const lat = Math.max(bounds.north - bounds.south, 0.6);
  return {
    west: bounds.west - lon * amount,
    east: bounds.east + lon * amount,
    south: bounds.south - lat * amount,
    north: bounds.north + lat * amount
  };
}

function inBounds([lon, lat], bounds) {
  return lon >= bounds.west && lon <= bounds.east && lat >= bounds.south && lat <= bounds.north;
}

function routeSegments(segments, project, color, width, dashed) {
  return segments.map((segment) => {
    const d = segment.map((coordinate, index) => {
      const point = project(coordinate);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${dashed ? 0.72 : 0.94}"${dashed ? ' stroke-dasharray="12 10"' : ""}/>`;
  }).join("\n    ");
}

function graticule(bounds, project) {
  const lines = [];
  const lonStep = chooseStep(bounds.east - bounds.west);
  const latStep = chooseStep(bounds.north - bounds.south);
  for (let lon = Math.ceil(bounds.west / lonStep) * lonStep; lon <= bounds.east; lon += lonStep) {
    const a = project([lon, bounds.south]);
    const b = project([lon, bounds.north]);
    lines.push(`<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}" stroke="#66736f" stroke-opacity="0.12" stroke-width="1"/>`);
  }
  for (let lat = Math.ceil(bounds.south / latStep) * latStep; lat <= bounds.north; lat += latStep) {
    const a = project([bounds.west, lat]);
    const b = project([bounds.east, lat]);
    lines.push(`<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}" stroke="#66736f" stroke-opacity="0.12" stroke-width="1"/>`);
  }
  return `<g>${lines.join("\n    ")}</g>`;
}

function chooseStep(span) {
  if (span <= 2) return 0.5;
  if (span <= 5) return 1;
  if (span <= 10) return 2;
  return 4;
}

function anchorDots(anchors, project, route, target) {
  return anchors.map((anchor, index) => {
    const point = project(anchor.coordinate);
    const labelX = Math.min(point.x + 12, 584);
    const labelY = Math.max(point.y - 12, 26 + index * 22);
    const color = index % 2 ? target.color : route.color;
    return `<g>
      <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="7.2" fill="#fffaf0" stroke="${color}" stroke-width="3"/>
      <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3.2" fill="${color}"/>
      <text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" fill="#20231f" paint-order="stroke" stroke="#fffaf0" stroke-width="4" font-family="${fonts.sans}" font-size="17" font-weight="900">${escapeXml(anchor.name)}</text>
    </g>`;
  }).join("\n    ");
}

function legend(route, target, crossing) {
  return `<g transform="translate(40 40)">
    <rect x="0" y="0" width="300" height="82" rx="14" fill="#fffaf0" fill-opacity="0.88" stroke="#d8cdbc" stroke-width="1"/>
    <text x="18" y="30" fill="#20231f" font-family="${fonts.serif}" font-size="25" font-weight="900">${escapeXml(crossing.place)}</text>
    <path d="M20 54H76" stroke="${route.color}" stroke-width="7" stroke-linecap="round"/>
    <text x="88" y="59" fill="#313a3c" font-family="${fonts.sans}" font-size="14" font-weight="900">${escapeXml(route.shortName)}</text>
    <path d="M172 54H228" stroke="${target.color}" stroke-width="7" stroke-linecap="round"/>
    <text x="240" y="59" fill="#313a3c" font-family="${fonts.sans}" font-size="14" font-weight="900">${escapeXml(target.shortName)}</text>
  </g>`;
}

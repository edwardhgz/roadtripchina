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
  paperDefs,
  routeGlyph,
  sealMark,
  textureRect
} from "./visual-system.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceDir = path.join(root, "路线图");
const dataDir = path.join(root, "data");
const thumbnailDir = path.join(root, "assets", "route-thumbnails");
const metaPath = path.join(dataDir, "route-meta.json");
const outputPath = path.join(dataDir, "routes.json");

const meta = JSON.parse(await readFile(metaPath, "utf8"));

function parseCoordinates(kml) {
  const match = kml.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
  if (!match) return [];

  return match[1]
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => {
      const [lon, lat] = item.split(",").map(Number);
      return [Number(lon.toFixed(5)), Number(lat.toFixed(5))];
    });
}

function haversine([lon1, lat1], [lon2, lat2]) {
  const radius = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * radius * Math.asin(Math.sqrt(a));
}

function routeDistance(coords) {
  let km = 0;
  for (let index = 1; index < coords.length; index += 1) {
    km += haversine(coords[index - 1], coords[index]);
  }
  return Math.round(km);
}

function bounds(coords) {
  const lons = coords.map(([lon]) => lon);
  const lats = coords.map(([, lat]) => lat);
  return {
    west: Math.min(...lons),
    south: Math.min(...lats),
    east: Math.max(...lons),
    north: Math.max(...lats)
  };
}

function projectForSvg(boundsValue, width, height, padding) {
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

function svgPath(coords, project) {
  return coords
    .map((coord, index) => {
      const [x, y] = project(coord);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

function thumbnailSvg(route) {
  const width = 1400;
  const height = 900;
  const project = projectForSvg(route.bounds, width, height, 118);
  const mainPath = svgPath(route.geometry.main.coordinates, project);
  const branchPath = svgPath(route.geometry.branch.coordinates, project);
  const mainStart = project(route.geometry.main.start);
  const mainEnd = project(route.geometry.main.end);
  const branchStart = project(route.geometry.branch.start);
  const branchEnd = project(route.geometry.branch.end);
  const seed = hash(`route-thumbnail-${route.id}`);
  const order = String(route.order).padStart(2, "0");
  const titleParts = route.shortName.length > 2
    ? [route.shortName.slice(0, 2), route.shortName.slice(2)]
    : [route.shortName, "之路"];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${route.title}">
  <defs>
    ${paperDefs({ id: "paper", color: route.color, accent: route.accent, seed })}
    <linearGradient id="inkWash" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${mix(route.color, baseColors.ink, 0.45)}" stop-opacity="0.28"/>
      <stop offset="0.52" stop-color="${mix(route.accent, baseColors.paper, 0.36)}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${mix(route.accent, baseColors.ink, 0.5)}" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#paper)"/>
  <rect width="${width}" height="${height}" fill="url(#inkWash)"/>
  <g opacity="0.8">
    ${diagonalHatch({ width, height, color: route.color, opacity: 0.07, gap: 38 })}
    ${contourLines({ width, height, color: route.accent, opacity: 0.16, step: 128, bend: 72 })}
  </g>
  <text x="82" y="260" fill="${baseColors.ink}" fill-opacity="0.07" font-family="${fonts.serif}" font-size="168" font-weight="900" writing-mode="vertical-rl">${escapeXml(titleParts.join(""))}</text>
  <text x="1296" y="730" text-anchor="end" fill="${baseColors.ink}" fill-opacity="0.08" font-family="${fonts.latin}" font-size="54" font-weight="900" letter-spacing="7">ROUTE ${order}</text>
  <g transform="translate(978 86)">
    ${sealMark({ x: 0, y: 0, size: 82, text: "路", sub: order, rotate: 2 })}
  </g>
  <g transform="translate(1060 86)">
    <text x="0" y="28" fill="${baseColors.ink}" fill-opacity="0.68" font-family="${fonts.kai}" font-size="25" font-weight="900">${escapeXml(route.kicker)}</text>
    <text x="0" y="64" fill="${route.color}" font-family="${fonts.serif}" font-size="36" font-weight="900">${escapeXml(route.title)}</text>
  </g>
  <g transform="translate(128 628)" opacity="0.82">
    ${routeGlyph(route.id, { color: route.color, accent: route.accent, x: 0, y: 0, scale: 1.1, light: baseColors.paperLight })}
  </g>
  <g fill="none" filter="url(#assetShadow)">
    <path d="${mainPath}" stroke="${mix(route.color, baseColors.paperLight, 0.72)}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>
    <path d="${branchPath}" stroke="${mix(route.color, baseColors.paperLight, 0.72)}" stroke-width="25" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="28 30" opacity="0.76"/>
    <path d="${mainPath}" stroke="${route.color}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${branchPath}" stroke="${route.color}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24 26" opacity="0.92"/>
  </g>
  <g fill="${baseColors.paperLight}" stroke="${baseColors.ink}" stroke-opacity="0.18" stroke-width="3.5">
    <circle cx="${mainStart[0]}" cy="${mainStart[1]}" r="13"/>
    <circle cx="${mainEnd[0]}" cy="${mainEnd[1]}" r="13"/>
    <circle cx="${branchStart[0]}" cy="${branchStart[1]}" r="10"/>
    <circle cx="${branchEnd[0]}" cy="${branchEnd[1]}" r="10"/>
  </g>
  <path d="M72 76H1328V824H72Z" fill="none" stroke="${baseColors.paperLight}" stroke-opacity="0.42" stroke-width="2"/>
  ${textureRect(width, height, 0.24)}
</svg>
`;
}

function perpendicularDistance(point, start, end) {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1);
  }

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  const projectedX = x1 + t * dx;
  const projectedY = y1 + t * dy;
  return Math.hypot(x - projectedX, y - projectedY);
}

function simplifyDouglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let splitIndex = 0;
  const last = points.length - 1;

  for (let index = 1; index < last; index += 1) {
    const distance = perpendicularDistance(points[index], points[0], points[last]);
    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = index;
    }
  }

  if (maxDistance <= tolerance) {
    return [points[0], points[last]];
  }

  const left = simplifyDouglasPeucker(points.slice(0, splitIndex + 1), tolerance);
  const right = simplifyDouglasPeucker(points.slice(splitIndex), tolerance);
  return left.slice(0, -1).concat(right);
}

function simplify(points) {
  const stride = points.length > 25000 ? 3 : points.length > 10000 ? 2 : 1;
  const thinned = points.filter((_, index) => index % stride === 0 || index === points.length - 1);
  return simplifyDouglasPeucker(thinned, 0.01);
}

async function readRouteFile(fileName) {
  const kml = await readFile(path.join(sourceDir, fileName), "utf8");
  const coordinates = parseCoordinates(kml);
  const simplified = simplify(coordinates);

  return {
    file: fileName,
    pointCount: coordinates.length,
    displayPointCount: simplified.length,
    distanceKm: routeDistance(coordinates),
    start: coordinates[0],
    end: coordinates.at(-1),
    bounds: bounds(coordinates),
    coordinates: simplified
  };
}

const routes = [];

for (const item of meta) {
  const main = await readRouteFile(item.mainFile);
  const branch = await readRouteFile(item.branchFile);

  routes.push({
    ...item,
    stats: {
      mainKm: main.distanceKm,
      branchKm: branch.distanceKm,
      totalKm: main.distanceKm + branch.distanceKm,
      mainPoints: main.pointCount,
      branchPoints: branch.pointCount
    },
    bounds: {
      west: Math.min(main.bounds.west, branch.bounds.west),
      south: Math.min(main.bounds.south, branch.bounds.south),
      east: Math.max(main.bounds.east, branch.bounds.east),
      north: Math.max(main.bounds.north, branch.bounds.north)
    },
    geometry: {
      main,
      branch
    }
  });
}

routes.sort((a, b) => a.order - b.order);

await mkdir(dataDir, { recursive: true });
await mkdir(thumbnailDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2)}\n`);

for (const route of routes) {
  await writeFile(path.join(thumbnailDir, `${route.id}.svg`), thumbnailSvg(route));
}

console.log(`Wrote ${path.relative(root, outputPath)} and ${routes.length} route thumbnails.`);

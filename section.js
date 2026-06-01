const svgNS = "http://www.w3.org/2000/svg";
const tileSize = 256;
const miniViewBox = { width: 420, height: 260 };
const mapLayers = {
  admin: {
    url: ({ z, x, y }) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  }
};
const params = new URLSearchParams(window.location.search);
const routeId = params.get("route") ?? "silk-canal";
const segmentIndex = Number(params.get("segment") ?? 0);

const state = {
  route: null,
  segment: null,
  index: 0,
  mapZoomDelta: 0,
  mapPan: { x: 0, y: 0 }
};

const elements = {
  backToRoute: document.querySelector("#backToRoute"),
  sectionRouteName: document.querySelector("#sectionRouteName"),
  sectionTitle: document.querySelector("#sectionTitle"),
  sectionDeck: document.querySelector("#sectionDeck"),
  sectionFacts: document.querySelector("#sectionFacts"),
  sectionImage: document.querySelector("#sectionImage"),
  sectionImageCaption: document.querySelector("#sectionImageCaption"),
  sectionImageCredit: document.querySelector("#sectionImageCredit"),
  sectionOverview: document.querySelector("#sectionOverview"),
  sectionNodes: document.querySelector("#sectionNodes"),
  sectionRhythm: document.querySelector("#sectionRhythm"),
  sectionEssay: document.querySelector("#sectionEssay"),
  sectionEssayBlock: document.querySelector("#sectionEssay")?.closest(".copy-block"),
  sectionOverviewMap: document.querySelector("#sectionOverviewMap"),
  sectionMapCaption: document.querySelector("#sectionMapCaption"),
  sectionMapZoomOut: document.querySelector("#sectionMapZoomOut"),
  sectionMapZoomIn: document.querySelector("#sectionMapZoomIn"),
  sectionThemes: document.querySelector("#sectionThemes"),
  sectionNavCards: document.querySelector("#sectionNavCards")
};

init();

elements.sectionMapZoomOut.addEventListener("click", () => {
  state.mapZoomDelta = Math.max(-2, state.mapZoomDelta - 1);
  if (state.route && state.segment) renderOverviewMap(state.route, state.segment, state.index);
});

elements.sectionMapZoomIn.addEventListener("click", () => {
  state.mapZoomDelta = Math.min(4, state.mapZoomDelta + 1);
  if (state.route && state.segment) renderOverviewMap(state.route, state.segment, state.index);
});

attachMapDrag(elements.sectionOverviewMap, {
  getPan: () => state.mapPan,
  render: () => {
    if (state.route && state.segment) renderOverviewMap(state.route, state.segment, state.index);
  },
  width: miniViewBox.width,
  height: miniViewBox.height
});

async function init() {
  try {
    const [routeResponse, articleResponse, detailResponse] = await Promise.all([
      fetch("./data/routes.json?v=20260601-research"),
      fetch("./data/route-articles.json?v=20260601-research"),
      fetch("./data/section-details.json?v=20260601-research")
    ]);
    const data = await routeResponse.json();
    const articles = await articleResponse.json();
    const details = await detailResponse.json();
    const routes = data.routes.map((route) => ({
      ...route,
      article: articles[route.id]
    }));
    const route = routes.find((item) => item.id === routeId) ?? routes[0];
    const segment = route.segments[segmentIndex] ?? route.segments[0];
    const index = route.segments.indexOf(segment);
    const detail = details[route.id]?.[index];
    state.route = route;
    state.segment = segment;
    state.index = index;

    renderSection(route, segment, index, detail);
  } catch (error) {
    elements.sectionTitle.textContent = "分段数据加载失败";
    elements.sectionDeck.textContent = "请返回首页重新进入，或稍后再试。";
    console.error(error);
  }
}

function renderSection(route, segment, index, detail) {
  document.title = `${segment.name} | ${route.title} | 行车中国`;
  document.documentElement.style.setProperty("--active", route.color);
  document.documentElement.style.setProperty("--theme", route.color);
  document.documentElement.style.setProperty("--theme-accent", route.accent);

  elements.backToRoute.href = `route.html?route=${encodeURIComponent(route.id)}`;
  elements.sectionRouteName.textContent = `${route.shortName} / 第 ${String(index + 1).padStart(2, "0")} 段`;
  elements.sectionTitle.textContent = segment.name;
  elements.sectionDeck.textContent = `${segment.range}。${segment.copy}`;
  elements.sectionFacts.replaceChildren(
    fact(route.title),
    fact(segment.range),
    fact(index === route.segments.length - 1 ? "支线或收束段" : "可独立分段")
  );

  renderImage(route, detail, index);
  renderCopy(route, segment, index, detail);
  renderNodes(route, segment, index, detail);
  renderOverviewMap(route, segment, index);
  renderThemes(route, segment, index, detail);
  renderNavigation(route, index);
}

function renderImage(route, detail, index) {
  const image = detail
    ? {
        url: `assets/section-images/${route.id}-${String(index + 1).padStart(2, "0")}.svg?v=20260601-research`,
        alt: `${route.title}：${detail.imageCaption}`,
        caption: detail.imageCaption,
        credit: "行车中国分段视觉",
        sourceUrl: "#"
      }
    : route.article?.image;

  if (!image) return;

  elements.sectionImage.src = image.url;
  elements.sectionImage.alt = image.alt;
  elements.sectionImageCaption.textContent = image.caption;
  elements.sectionImageCredit.textContent = image.credit;
  elements.sectionImageCredit.href = image.sourceUrl;
}

function renderCopy(route, segment, index, detail) {
  if (detail) {
    elements.sectionOverview.replaceChildren(...detail.overview.map(paragraph));
    elements.sectionRhythm.replaceChildren(...detail.rhythm.map(paragraph));
    renderEssay(detail.essay);
    return;
  }

  const previous = route.segments[index - 1];
  const next = route.segments[index + 1];
  const transitionIn = previous ? `从“${previous.name}”转入这里，路线的重心会继续变化。` : "这是整条路线的开场段，先立起全线的地理气质。";
  const transitionOut = next ? `走完这一段之后，下一章会进入“${next.name}”。` : "走到这里，整条路线的主题会逐渐收束。";

  elements.sectionOverview.replaceChildren(
    paragraph(`${segment.name}是${route.title}里的一个独立章节。它不按每日行程来理解，而是按地理变化、城市节点和路线主题来组织：${segment.copy}`),
    paragraph(`${transitionIn}${transitionOut}如果只走全线中的一部分，这一段可以作为单独旅行的骨架；如果走全程，它则是前后章节之间的转场。`)
  );
  elements.sectionRhythm.replaceChildren(
    paragraph("这一段适合作为章节而不是天数来规划：先确定起止城市，再围绕沿途节点停留。")
  );
  renderEssay([]);
}

function renderEssay(essay = []) {
  elements.sectionEssayBlock.hidden = !essay.length;
  elements.sectionEssay.replaceChildren(...essay.map(paragraph));
}

function renderNodes(route, segment, index, detail) {
  const nodes = detail?.nodes ?? nodesForSegment(route, segment, index);
  elements.sectionNodes.replaceChildren(
    ...nodes.map((node, nodeIndex) => {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = node.name;
      const copy = document.createElement("span");
      copy.textContent = node.copy ?? nodeCopy(node, segment, nodeIndex);
      item.append(name, copy);
      return item;
    })
  );
}

function nodesForSegment(route, segment, index) {
  const explicit = route.markers.filter((marker) => segment.range.includes(marker.name));
  if (explicit.length >= 2) return explicit;

  const stops = route.markers;
  const segmentCount = route.segments.length;
  const start = Math.floor((index / segmentCount) * stops.length);
  const end = Math.max(start + 2, Math.ceil(((index + 1) / segmentCount) * stops.length));
  return stops.slice(start, end);
}

function nodeCopy(node, segment, index) {
  const kind = node.type === "branch" ? "支线节点" : node.type === "shared" ? "主支线共用节点" : "主线节点";
  if (index === 0) return `${kind}，适合作为“${segment.name}”的进入点。`;
  return `${kind}，帮助这一段从路线主题落到具体地点。`;
}

function renderThemes(route, segment, index, detail) {
  const seeds = detail?.themes ?? [
    segment.name,
    ...segment.range.split(/\s*[-/]\s*/),
    ...route.highlights.slice(index, index + 4)
  ];
  const unique = [...new Set(seeds.map((item) => item.trim()).filter(Boolean))].slice(0, 8);
  elements.sectionThemes.replaceChildren(...unique.map(listItem));
}

function renderNavigation(route, index) {
  const items = [
    { label: "上一段", segment: route.segments[index - 1], index: index - 1 },
    { label: "下一段", segment: route.segments[index + 1], index: index + 1 }
  ].filter((item) => item.segment);

  elements.sectionNavCards.replaceChildren(
    ...items.map((item) => {
      const link = document.createElement("a");
      link.href = `section.html?route=${encodeURIComponent(route.id)}&segment=${item.index}`;
      const label = document.createElement("span");
      label.textContent = item.label;
      const title = document.createElement("strong");
      title.textContent = item.segment.name;
      const range = document.createElement("small");
      range.textContent = item.segment.range;
      link.append(label, title, range);
      return link;
    })
  );
}

function renderOverviewMap(route, segment, index) {
  const svg = elements.sectionOverviewMap;
  const main = route.geometry.main.coordinates;
  const branch = route.geometry.branch.coordinates;
  const trace = segmentTrace(route, segment, index);
  const focusBounds = sectionFocusBounds(trace.coordinates);
  const project = miniMapProjection(focusBounds, miniViewBox.width, miniViewBox.height, 26);
  const viewport = miniMapViewport(focusBounds, miniViewBox.width, miniViewBox.height, 26);

  svg.replaceChildren();
  svg.append(svgRect("mini-map-bg", 0, 0, miniViewBox.width, miniViewBox.height));
  svg.append(createMiniTileLayer(viewport));
  svg.append(svgRect("mini-tile-scrim", 0, 0, miniViewBox.width, miniViewBox.height));
  svg.append(svgPath(main, project, "mini-route-path is-main", route.color));
  svg.append(svgPath(branch, project, "mini-route-path is-branch", route.color));
  svg.append(svgPath(trace.coordinates, project, "mini-route-highlight", route.color));

  elements.sectionMapCaption.textContent = `高亮：第 ${String(index + 1).padStart(2, "0")} 段 / ${segment.name}`;
}

function createMiniTileLayer(viewport) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "tile-layer mini-tile-layer");
  const source = mapLayers.admin;
  const maxTile = 2 ** viewport.zoom;
  const tileWidth = tileSize * viewport.scale;
  const minTileX = Math.max(0, Math.floor(viewport.worldLeft / tileSize) - 1);
  const maxTileX = Math.min(maxTile - 1, Math.floor(viewport.worldRight / tileSize) + 1);
  const minTileY = Math.max(0, Math.floor(viewport.worldTop / tileSize) - 1);
  const maxTileY = Math.min(maxTile - 1, Math.floor(viewport.worldBottom / tileSize) + 1);

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      const image = document.createElementNS(svgNS, "image");
      image.setAttribute("href", source.url({ z: viewport.zoom, x, y }));
      image.setAttribute("x", (viewport.offsetX + (x * tileSize - viewport.worldLeft) * viewport.scale).toFixed(2));
      image.setAttribute("y", (viewport.offsetY + (y * tileSize - viewport.worldTop) * viewport.scale).toFixed(2));
      image.setAttribute("width", (tileWidth + 0.8).toFixed(2));
      image.setAttribute("height", (tileWidth + 0.8).toFixed(2));
      image.setAttribute("preserveAspectRatio", "none");
      group.append(image);
    }
  }

  return group;
}

function segmentTrace(route, segment, index) {
  const lineKey = isBranchSegment(route, segment, index) ? "branch" : "main";
  const coords = route.geometry[lineKey].coordinates;
  const markers = markersForSegment(route, segment, lineKey);

  if (markers.length >= 2) {
    const startIndex = nearestCoordinateIndex(coords, [markers[0].lon, markers[0].lat]);
    const endIndex = nearestCoordinateIndex(coords, [markers.at(-1).lon, markers.at(-1).lat]);
    const from = Math.min(startIndex, endIndex);
    const to = Math.max(startIndex, endIndex);
    return { lineKey, coordinates: coords.slice(from, to + 1) };
  }

  const siblingSegments = route.segments.filter((item, itemIndex) => isBranchSegment(route, item, itemIndex) === (lineKey === "branch"));
  const localIndex = Math.max(0, siblingSegments.indexOf(segment));
  const start = Math.floor((localIndex / Math.max(1, siblingSegments.length)) * (coords.length - 1));
  const end = Math.max(start + 2, Math.floor(((localIndex + 1) / Math.max(1, siblingSegments.length)) * (coords.length - 1)));
  return { lineKey, coordinates: coords.slice(start, Math.min(coords.length, end + 1)) };
}

function isBranchSegment(route, segment, index) {
  if (segment.name.includes("支线") || segment.range.includes("支线")) return true;
  const branchMatches = markersForSegment(route, segment, "branch");
  const mainMatches = markersForSegment(route, segment, "main");
  return branchMatches.length > mainMatches.length && branchMatches.length >= 2;
}

function markersForSegment(route, segment, lineKey) {
  return route.markers
    .filter((marker) => {
      const onLine = lineKey === "branch" ? marker.type === "branch" || marker.type === "shared" : marker.type !== "branch";
      return onLine && markerMentioned(segment.range, marker.name);
    })
    .sort((a, b) => markerOrder(segment.range, a.name) - markerOrder(segment.range, b.name));
}

function markerMentioned(range, name) {
  if (range.includes(name) || name.includes(range)) return true;
  return rangeTokens(range).some((token) => token.length >= 2 && (name.includes(token) || token.includes(name)));
}

function markerOrder(range, name) {
  const exact = range.indexOf(name);
  if (exact >= 0) return exact;
  const token = rangeTokens(range).find((item) => item.length >= 2 && (name.includes(item) || item.includes(name)));
  return token ? range.indexOf(token) : Number.MAX_SAFE_INTEGER;
}

function rangeTokens(range) {
  return range
    .split(/[\s/、，,·.-]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function nearestCoordinateIndex(coords, target) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  coords.forEach((coord, index) => {
    const distance = haversine(coord, target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function sectionFocusBounds(coordinates) {
  const bounds = boundsForCoordinates(coordinates);
  const lonSpan = Math.max(0.1, bounds.east - bounds.west);
  const latSpan = Math.max(0.1, bounds.north - bounds.south);
  const lonPad = clamp(lonSpan * 0.35, 0.7, 3.2);
  const latPad = clamp(latSpan * 0.35, 0.55, 2.4);
  return {
    west: Math.max(70, bounds.west - lonPad),
    south: Math.max(15, bounds.south - latPad),
    east: Math.min(136, bounds.east + lonPad),
    north: Math.min(55, bounds.north + latPad)
  };
}

function boundsForCoordinates(coordinates) {
  const lons = coordinates.map(([lon]) => lon);
  const lats = coordinates.map(([, lat]) => lat);
  return {
    west: Math.min(...lons),
    south: Math.min(...lats),
    east: Math.max(...lons),
    north: Math.max(...lats)
  };
}

function miniMapProjection(bounds, width, height, padding) {
  const viewport = miniMapViewport(bounds, width, height, padding);
  return viewport.project;
}

function miniMapViewport(bounds, width, height, padding) {
  const zoomScale = 1.32 ** state.mapZoomDelta;
  const padded = {
    west: bounds.west - 1,
    south: bounds.south - 0.8,
    east: bounds.east + 1,
    north: bounds.north + 0.8
  };
  const zoom = chooseMiniZoom(padded);
  const nw = lonLatToWorld([padded.west, padded.north], zoom);
  const se = lonLatToWorld([padded.east, padded.south], zoom);
  const worldLeft = nw.x;
  const worldTop = nw.y;
  const worldRight = se.x;
  const worldBottom = se.y;
  const spanX = worldRight - worldLeft;
  const spanY = worldBottom - worldTop;
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY) * zoomScale;
  const mapWidth = spanX * scale;
  const mapHeight = spanY * scale;
  const offsetX = (width - mapWidth) / 2 + state.mapPan.x;
  const offsetY = (height - mapHeight) / 2 + state.mapPan.y;

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

function chooseMiniZoom(bounds) {
  for (let zoom = 8; zoom >= 3; zoom -= 1) {
    const nw = lonLatToWorld([bounds.west, bounds.north], zoom);
    const se = lonLatToWorld([bounds.east, bounds.south], zoom);
    if (se.x - nw.x <= 900 && se.y - nw.y <= 620) return zoom;
  }
  return 3;
}

function lonLatToWorld([lon, lat], zoom) {
  const sinLat = Math.sin((clamp(lat, -85.05112878, 85.05112878) * Math.PI) / 180);
  const scale = tileSize * 2 ** zoom;
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function attachMapDrag(svg, options) {
  let pointerId = null;
  let lastPoint = null;
  let frame = null;

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    lastPoint = { x: event.clientX, y: event.clientY };
    svg.setPointerCapture(pointerId);
    svg.classList.add("is-dragging");
  });

  svg.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId || !lastPoint) return;
    const rect = svg.getBoundingClientRect();
    const deltaX = ((event.clientX - lastPoint.x) * options.width) / rect.width;
    const deltaY = ((event.clientY - lastPoint.y) * options.height) / rect.height;
    lastPoint = { x: event.clientX, y: event.clientY };
    const pan = options.getPan();
    pan.x = clamp(pan.x + deltaX, -options.width * 0.9, options.width * 0.9);
    pan.y = clamp(pan.y + deltaY, -options.height * 0.9, options.height * 0.9);
    event.preventDefault();
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = null;
        options.render();
      });
    }
  });

  const stopDrag = (event) => {
    if (event.pointerId !== pointerId) return;
    svg.classList.remove("is-dragging");
    if (svg.hasPointerCapture(pointerId)) svg.releasePointerCapture(pointerId);
    pointerId = null;
    lastPoint = null;
  };

  svg.addEventListener("pointerup", stopDrag);
  svg.addEventListener("pointercancel", stopDrag);
  svg.addEventListener("lostpointercapture", () => {
    pointerId = null;
    lastPoint = null;
    svg.classList.remove("is-dragging");
  });
}

function svgRect(className, x, y, width, height) {
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("class", className);
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  return rect;
}

function svgPath(coords, project, className, color) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("class", className);
  path.setAttribute("d", pathData(coords, project));
  path.setAttribute("stroke", color);
  return path;
}

function pathData(coords, project) {
  return coords
    .map((coord, index) => {
      const point = project(coord);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
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

function fact(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function paragraph(text) {
  const node = document.createElement("p");
  node.textContent = text;
  return node;
}

function listItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

const svgNS = "http://www.w3.org/2000/svg";
const tileSize = 256;
const viewBox = { width: 1000, height: 620, padding: 52 };
const mapLayers = {
  admin: {
    attribution: "© OpenStreetMap contributors",
    url: ({ z, x, y }) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  },
  satellite: {
    attribution: "Imagery © Esri",
    url: ({ z, x, y }) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
  }
};

const params = new URLSearchParams(window.location.search);
const topicId = params.get("topic") ?? "northern-xinjiang";

const state = {
  topic: null,
  routes: [],
  traces: [],
  basemap: "admin",
  zoomDelta: 0,
  mapPan: { x: 0, y: 0 }
};

const elements = {
  topicKicker: document.querySelector("#topicKicker"),
  topicTitle: document.querySelector("#topicTitle"),
  topicDeck: document.querySelector("#topicDeck"),
  topicFacts: document.querySelector("#topicFacts"),
  topicCover: document.querySelector("#topicCover"),
  topicCoverCaption: document.querySelector("#topicCoverCaption"),
  topicBody: document.querySelector("#topicBody"),
  topicRoutes: document.querySelector("#topicRoutes"),
  topicFragments: document.querySelector("#topicFragments"),
  topicCrossing: document.querySelector("#topicCrossing"),
  topicMap: document.querySelector("#topicMap"),
  topicMapCaption: document.querySelector("#topicMapCaption"),
  topicMapAttribution: document.querySelector("#topicMapAttribution"),
  topicMapSummary: document.querySelector("#topicMapSummary"),
  topicMapLegend: document.querySelector("#topicMapLegend"),
  topicMapZoomOut: document.querySelector("#topicMapZoomOut"),
  topicMapZoomIn: document.querySelector("#topicMapZoomIn"),
  topicBasemapAdmin: document.querySelector("#topicBasemapAdmin"),
  topicBasemapSatellite: document.querySelector("#topicBasemapSatellite")
};

init();

elements.topicMapZoomOut.addEventListener("click", () => {
  state.zoomDelta = Math.max(-2, state.zoomDelta - 1);
  renderTopicMap();
});

elements.topicMapZoomIn.addEventListener("click", () => {
  state.zoomDelta = Math.min(4, state.zoomDelta + 1);
  renderTopicMap();
});

elements.topicBasemapAdmin.addEventListener("click", () => {
  state.basemap = "admin";
  renderTopicMap();
});

elements.topicBasemapSatellite.addEventListener("click", () => {
  state.basemap = "satellite";
  renderTopicMap();
});

window.addEventListener("resize", () => renderTopicMap());
attachMapDrag(elements.topicMap, {
  getPan: () => state.mapPan,
  render: renderTopicMap,
  width: viewBox.width,
  height: viewBox.height
});

async function init() {
  try {
    const [routeResponse, topicResponse, articleResponse] = await Promise.all([
      fetch("./data/routes.json?v=20260601-research"),
      fetch("./data/special-topics.json?v=20260601-research"),
      fetch("./data/topic-articles.json?v=20260601-research")
    ]);
    const routeData = await routeResponse.json();
    const topicData = await topicResponse.json();
    const articleData = await articleResponse.json();
    const routes = routeData.routes;
    const topic = topicData.topics.find((item) => item.id === topicId) ?? topicData.topics[0];
    const article = articleData[topic.id];

    renderTopic(topic, article, routes);
  } catch (error) {
    elements.topicTitle.textContent = "专题文章加载失败";
    elements.topicDeck.textContent = "请返回特别专题重新进入，或稍后再试。";
    console.error(error);
  }
}

function renderTopic(topic, article, routes) {
  const firstRoute = routes.find((route) => topic.routeIds.includes(route.id)) ?? routes[0];
  state.topic = topic;
  state.routes = routes;
  state.traces = topicTraces(topic, routes);
  document.title = `${topic.title} | 特别专题 | 行车中国`;
  document.documentElement.style.setProperty("--active", firstRoute.color);
  document.documentElement.style.setProperty("--theme", firstRoute.color);
  document.documentElement.style.setProperty("--theme-accent", firstRoute.accent);
  document.documentElement.style.setProperty("--topic-color", firstRoute.color);
  document.documentElement.style.setProperty("--topic-accent", firstRoute.accent);

  elements.topicKicker.textContent = topic.kicker;
  elements.topicTitle.textContent = article?.headline ?? topic.title;
  elements.topicDeck.textContent = article?.deck ?? topic.deck;
  elements.topicFacts.replaceChildren(
    fact(`${topic.routeIds.length} 条相关路线`),
    fact(`${topic.fragments.length} 个专题片段`),
    fact("可跳转到分段页")
  );

  elements.topicCover.src = `assets/topic-covers/${topic.id}.svg?v=20260601-research`;
  elements.topicCover.alt = `${topic.title}封面图`;
  elements.topicCoverCaption.textContent = article?.caption ?? topic.deck;
  elements.topicBody.replaceChildren(...articleBlocks(article));
  elements.topicRoutes.replaceChildren(...topic.routeIds.map((routeId) => routeLink(routeId, routes)));
  elements.topicFragments.replaceChildren(...topic.fragments.map((fragment) => fragmentLink(fragment, routes)));
  elements.topicCrossing.textContent = topic.crossing;
  elements.topicMapSummary.textContent = "";
  elements.topicMapSummary.hidden = true;
  elements.topicMapLegend.replaceChildren(...state.traces.map(traceLegendLink));
  renderTopicMap();
}

function renderTopicMap() {
  if (!state.topic || !state.traces.length) return;

  const coords = state.traces.flatMap((trace) => trace.coordinates);
  const focusBounds = boundsForCoordinates(coords);
  const bounds = expandedTopicBounds(focusBounds);
  const viewport = mapViewport(bounds);
  const project = viewport.project;
  const focusSample = sampleCoordinates(coords, 180);

  elements.topicBasemapAdmin.classList.toggle("is-active", state.basemap === "admin");
  elements.topicBasemapSatellite.classList.toggle("is-active", state.basemap === "satellite");
  elements.topicMapCaption.textContent = state.topic.title;
  elements.topicMapAttribution.textContent = `${mapLayers[state.basemap].attribution} · 专题路线片段`;

  elements.topicMap.replaceChildren();
  elements.topicMap.append(svgRect("map-bg", 0, 0, viewBox.width, viewBox.height));
  elements.topicMap.append(createTileLayer(viewport));
  elements.topicMap.append(createTileScrim());
  elements.topicMap.append(createGraticule(project, bounds));

  renderFadedContextRoutes(project, focusSample);

  state.traces.forEach((trace) => {
    elements.topicMap.append(topicPath(trace.coordinates, project, trace.route.color, "topic-segment-path"));
  });
}

function articleSection(section) {
  const block = document.createElement("section");
  if (section.className) block.className = section.className;
  const title = document.createElement("h2");
  title.textContent = section.title;
  block.append(title);

  section.paragraphs.forEach((paragraphText) => {
    const copy = document.createElement("p");
    copy.textContent = paragraphText;
    block.append(copy);
  });

  return block;
}

function articleBlocks(article) {
  const sections = [...(article?.sections ?? [])];
  if (article?.longEssay?.length) {
    sections.push({
      title: "风土与历史地理",
      className: "topic-longread",
      paragraphs: article.longEssay
    });
  }
  return sections.map(articleSection);
}

function routeLink(routeId, routes) {
  const route = routes.find((item) => item.id === routeId);
  const link = document.createElement("a");
  link.className = "topic-route-ref";
  link.href = `route.html?route=${encodeURIComponent(routeId)}`;
  link.style.setProperty("--topic-route-color", route?.color ?? "var(--theme)");
  if (route) {
    link.append(routeBadgeImage(route, "route-ref-badge"));
    const title = document.createElement("span");
    title.textContent = route.title;
    link.append(title);
  } else {
    link.textContent = routeId;
  }
  return link;
}

function fragmentLink(fragment, routes) {
  const route = routes.find((item) => item.id === fragment.route);
  const link = document.createElement("a");
  link.className = "topic-fragment-ref";
  link.href = `section.html?route=${encodeURIComponent(fragment.route)}&segment=${fragment.segment}`;

  const title = document.createElement("strong");
  title.textContent = `${route?.shortName ?? fragment.route} · ${fragment.label}`;

  const role = document.createElement("span");
  role.textContent = fragment.role;

  if (route) link.append(routeBadgeImage(route, "route-mini-badge"));
  link.append(title, role);
  return link;
}

function traceLegendLink(trace) {
  const link = document.createElement("a");
  link.className = "topic-legend-ref";
  link.href = `section.html?route=${encodeURIComponent(trace.route.id)}&segment=${trace.fragment.segment}`;
  link.style.setProperty("--topic-route-color", trace.route.color);

  const title = document.createElement("strong");
  title.textContent = `${trace.route.shortName} · ${trace.fragment.label}`;
  const role = document.createElement("span");
  role.textContent = trace.fragment.role;

  link.append(routeBadgeImage(trace.route, "route-mini-badge"), title, role);
  return link;
}

function topicTraces(topic, routes) {
  return topic.fragments
    .map((fragment) => {
      const route = routes.find((item) => item.id === fragment.route);
      const segment = route?.segments[fragment.segment];
      if (!route || !segment) return null;
      return {
        fragment,
        route,
        segment,
        coordinates: segmentTrace(route, {
          ...segment,
          name: fragment.label ?? segment.name,
          range: fragment.range ?? segment.range
        }, fragment.segment).coordinates
      };
    })
    .filter((trace) => trace?.coordinates.length > 1);
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

function expandedTopicBounds(bounds) {
  const lonSpan = bounds.east - bounds.west;
  const latSpan = bounds.north - bounds.south;
  const lonPad = clamp(lonSpan * 0.24, 1.3, 5.2);
  const latPad = clamp(latSpan * 0.24, 1, 4.1);
  return {
    west: Math.max(70, bounds.west - lonPad),
    south: Math.max(15, bounds.south - latPad),
    east: Math.min(136, bounds.east + lonPad),
    north: Math.min(55, bounds.north + latPad)
  };
}

function mapViewport(bounds) {
  const zoomScale = 1.32 ** state.zoomDelta;
  const padded = {
    west: bounds.west - 1,
    south: bounds.south - 0.8,
    east: bounds.east + 1,
    north: bounds.north + 0.8
  };
  const zoom = chooseZoom(padded);
  const nw = lonLatToWorld([padded.west, padded.north], zoom);
  const se = lonLatToWorld([padded.east, padded.south], zoom);
  const worldLeft = nw.x;
  const worldTop = nw.y;
  const worldRight = se.x;
  const worldBottom = se.y;
  const spanX = worldRight - worldLeft;
  const spanY = worldBottom - worldTop;
  const innerWidth = viewBox.width - viewBox.padding * 2;
  const innerHeight = viewBox.height - viewBox.padding * 2;
  const scale = Math.min(innerWidth / spanX, innerHeight / spanY) * zoomScale;
  const mapWidth = spanX * scale;
  const mapHeight = spanY * scale;
  const offsetX = (viewBox.width - mapWidth) / 2 + state.mapPan.x;
  const offsetY = (viewBox.height - mapHeight) / 2 + state.mapPan.y;

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

function chooseZoom(bounds) {
  for (let zoom = 8; zoom >= 3; zoom -= 1) {
    const nw = lonLatToWorld([bounds.west, bounds.north], zoom);
    const se = lonLatToWorld([bounds.east, bounds.south], zoom);
    if (se.x - nw.x <= 1200 && se.y - nw.y <= 900) return zoom;
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

function createTileLayer(viewport) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "tile-layer");
  const source = mapLayers[state.basemap];
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

function createTileScrim() {
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("class", `tile-scrim ${state.basemap === "satellite" ? "is-satellite" : ""}`);
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", viewBox.width);
  rect.setAttribute("height", viewBox.height);
  return rect;
}

function createGraticule(project, bounds) {
  const group = document.createElementNS(svgNS, "g");
  const lonStart = Math.ceil(bounds.west / 5) * 5;
  const lonEnd = Math.floor(bounds.east / 5) * 5;
  const latStart = Math.ceil(bounds.south / 5) * 5;
  const latEnd = Math.floor(bounds.north / 5) * 5;

  for (let lon = lonStart; lon <= lonEnd; lon += 5) {
    const start = project([lon, bounds.south]);
    const end = project([lon, bounds.north]);
    group.append(svgLine(start.x, start.y, end.x, end.y, "graticule"));
  }

  for (let lat = latStart; lat <= latEnd; lat += 5) {
    const start = project([bounds.west, lat]);
    const end = project([bounds.east, lat]);
    group.append(svgLine(start.x, start.y, end.x, end.y, "graticule"));
  }

  return group;
}

function topicPath(coordinates, project, color, className) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("class", className);
  path.setAttribute("d", pathData(coordinates, project));
  path.setAttribute("stroke", color);
  return path;
}

function renderFadedContextRoutes(project, focusSample) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "topic-context-routes");

  state.routes.forEach((route) => {
    appendFadedRouteLine(group, route.geometry.main.coordinates, project, focusSample, route.color, false);
    appendFadedRouteLine(group, route.geometry.branch.coordinates, project, focusSample, route.color, true);
  });

  elements.topicMap.append(group);
}

function appendFadedRouteLine(group, coordinates, project, focusSample, color, isBranch) {
  const chunkSize = isBranch ? 10 : 12;
  for (let index = 0; index < coordinates.length - 1; index += chunkSize - 1) {
    const chunk = coordinates.slice(index, Math.min(coordinates.length, index + chunkSize));
    if (chunk.length < 2) continue;
    const midpoint = chunk[Math.floor(chunk.length / 2)];
    const distance = nearestDistance(midpoint, focusSample);
    const opacity = contextOpacity(distance, isBranch);
    if (opacity < 0.035) continue;

    const path = topicPath(chunk, project, color, `topic-context-path is-fade ${isBranch ? "is-branch" : ""}`);
    path.style.opacity = opacity.toFixed(3);
    path.style.setProperty("stroke-width", isBranch ? "3.2" : "4.1");
    group.append(path);
  }
}

function contextOpacity(distanceKm, isBranch) {
  const maxDistance = 760;
  const nearness = clamp(1 - distanceKm / maxDistance, 0, 1);
  const opacity = 0.5 * nearness ** 1.35;
  return isBranch ? opacity * 0.72 : opacity;
}

function sampleCoordinates(coordinates, targetCount) {
  if (coordinates.length <= targetCount) return coordinates;
  const step = Math.ceil(coordinates.length / targetCount);
  return coordinates.filter((_, index) => index % step === 0);
}

function nearestDistance(coordinate, focusSample) {
  return focusSample.reduce((best, focus) => Math.min(best, haversine(coordinate, focus)), Infinity);
}

function pathData(coordinates, project) {
  return coordinates
    .map((coordinate, index) => {
      const point = project(coordinate);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
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

function svgLine(x1, y1, x2, y2, className) {
  const node = document.createElementNS(svgNS, "line");
  node.setAttribute("class", className);
  node.setAttribute("x1", x1);
  node.setAttribute("y1", y1);
  node.setAttribute("x2", x2);
  node.setAttribute("y2", y2);
  return node;
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function routeLogoSrc(route) {
  return `assets/route-logos/${route.id}.svg?v=20260601-research`;
}

function routeBadgeImage(route, className = "route-ref-badge") {
  const image = document.createElement("img");
  image.className = className;
  image.src = routeLogoSrc(route);
  image.alt = route.shortName;
  return image;
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

function fact(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

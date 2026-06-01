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
const routeId = params.get("route") ?? "silk-canal";

const state = {
  route: null,
  routes: [],
  topics: [],
  basemap: "admin",
  showBranch: true,
  zoomDelta: 0,
  mapPan: { x: 0, y: 0 }
};

const elements = {
  routeLogo: document.querySelector("#routeLogo"),
  routeKicker: document.querySelector("#routeKicker"),
  routeTitle: document.querySelector("#routeTitle"),
  routeDeck: document.querySelector("#routeDeck"),
  routeMeta: document.querySelector("#routeMeta"),
  routeArticleSection: document.querySelector("#routeArticleSection"),
  routeArticleTitle: document.querySelector("#routeArticleTitle"),
  routeArticleBody: document.querySelector("#routeArticleBody"),
  firstSectionLink: document.querySelector("#firstSectionLink"),
  routeDetailMap: document.querySelector("#routeDetailMap"),
  routeMapCaption: document.querySelector("#routeMapCaption"),
  routeMapAttribution: document.querySelector("#routeMapAttribution"),
  routeToggleBranch: document.querySelector("#routeToggleBranch"),
  routeMapZoomOut: document.querySelector("#routeMapZoomOut"),
  routeMapZoomIn: document.querySelector("#routeMapZoomIn"),
  routeBasemapAdmin: document.querySelector("#routeBasemapAdmin"),
  routeBasemapSatellite: document.querySelector("#routeBasemapSatellite"),
  terminalArc: document.querySelector("#terminalArc"),
  mainLabel: document.querySelector("#mainLabel"),
  branchLabel: document.querySelector("#branchLabel"),
  routeOverview: document.querySelector("#routeOverview"),
  roadSpineSummary: document.querySelector("#roadSpineSummary"),
  primaryRoads: document.querySelector("#primaryRoads"),
  expresswayRoads: document.querySelector("#expresswayRoads"),
  localRoadNote: document.querySelector("#localRoadNote"),
  terminalStart: document.querySelector("#terminalStart"),
  terminalEnd: document.querySelector("#terminalEnd"),
  terminalBranch: document.querySelector("#terminalBranch"),
  geoBlocks: document.querySelector("#geoBlocks"),
  segmentTitle: document.querySelector("#segmentTitle"),
  segmentsList: document.querySelector("#segmentsList"),
  crossingsList: document.querySelector("#crossingsList"),
  relatedTopicGrid: document.querySelector("#relatedTopicGrid")
};

init();

async function init() {
  try {
    const [routeResponse, articleResponse, analysisResponse, topicResponse] = await Promise.all([
      fetch("./data/routes.json?v=20260601-research"),
      fetch("./data/route-articles.json?v=20260601-research"),
      fetch("./data/route-analysis.json?v=20260601-research"),
      fetch("./data/special-topics.json?v=20260601-research")
    ]);
    const routeData = await routeResponse.json();
    const articles = await articleResponse.json();
    const analysis = await analysisResponse.json();
    const topicData = await topicResponse.json();
    state.routes = routeData.routes.map((route) => ({
      ...route,
      article: articles[route.id],
      analysis: analysis[route.id]
    }));
    state.route = state.routes.find((route) => route.id === routeId) ?? state.routes[0];
    state.topics = topicData.topics ?? [];

    attachEvents();
    renderRoutePage();
  } catch (error) {
    elements.routeTitle.textContent = "路线数据加载失败";
    elements.routeDeck.textContent = "请返回总览重新进入，或稍后再试。";
    console.error(error);
  }
}

function attachEvents() {
  elements.routeToggleBranch.addEventListener("click", () => {
    state.showBranch = !state.showBranch;
    renderMap();
  });

  elements.routeMapZoomOut.addEventListener("click", () => {
    state.zoomDelta = Math.max(-2, state.zoomDelta - 1);
    renderMap();
  });

  elements.routeMapZoomIn.addEventListener("click", () => {
    state.zoomDelta = Math.min(4, state.zoomDelta + 1);
    renderMap();
  });

  elements.routeBasemapAdmin.addEventListener("click", () => {
    state.basemap = "admin";
    renderMap();
  });

  elements.routeBasemapSatellite.addEventListener("click", () => {
    state.basemap = "satellite";
    renderMap();
  });

  window.addEventListener("resize", () => renderMap());
  attachMapDrag(elements.routeDetailMap, {
    getPan: () => state.mapPan,
    render: renderMap,
    width: viewBox.width,
    height: viewBox.height
  });
}

function renderRoutePage() {
  const route = state.route;
  const analysis = route.analysis;
  const article = route.article ?? {};

  document.title = `${route.title} | 行车中国`;
  document.documentElement.style.setProperty("--active", route.color);
  document.documentElement.style.setProperty("--theme", route.color);
  document.documentElement.style.setProperty("--theme-accent", route.accent);

  elements.routeLogo.src = routeLogoSrc(route);
  elements.routeLogo.alt = `${route.title}徽章`;
  elements.routeKicker.textContent = route.kicker;
  elements.routeTitle.textContent = route.title;
  elements.routeDeck.textContent = article.deck ?? route.tagline;
  elements.routeMeta.replaceChildren(
    metaItem(`${String(route.order).padStart(2, "0")} 号路线`),
    metaItem(`全程 ${formatKm(route.stats.totalKm)} 公里`),
    metaItem(`${route.segments.length} 个分段`)
  );
  elements.firstSectionLink.href = `section.html?route=${encodeURIComponent(route.id)}&segment=0`;
  elements.firstSectionLink.textContent = `进入第一段：${route.segments[0]?.name ?? route.shortName}`;

  elements.terminalArc.textContent = analysis.terminals.arc;
  elements.mainLabel.textContent = route.mainLabel;
  elements.branchLabel.textContent = route.branchLabel;
  elements.routeOverview.textContent = route.overview;
  renderRouteArticle(article);
  elements.roadSpineSummary.textContent = analysis.roadSpine.summary;
  elements.primaryRoads.replaceChildren(...analysis.roadSpine.primary.map(roadChip));
  elements.expresswayRoads.replaceChildren(...analysis.roadSpine.expressways.map(roadChip));
  elements.localRoadNote.textContent = analysis.roadSpine.local;
  elements.terminalStart.textContent = analysis.terminals.start;
  elements.terminalEnd.textContent = analysis.terminals.end;
  elements.terminalBranch.textContent = analysis.terminals.branch;
  elements.geoBlocks.replaceChildren(...analysis.geoBlocks.map(geoBlock));
  elements.crossingsList.replaceChildren(...analysis.crossings.map(crossingCard));
  renderSegments(route);
  renderRelatedTopics(route);
  renderMap();
}

function renderRouteArticle(article = {}) {
  const sections = article.sections ?? [];
  elements.routeArticleSection.hidden = !sections.length;
  if (!sections.length) {
    elements.routeArticleBody.replaceChildren();
    return;
  }

  elements.routeArticleTitle.textContent = article.headline ?? "沿线风土与历史地理";
  elements.routeArticleBody.replaceChildren(
    ...sections.map((section) => {
      const block = document.createElement("section");
      const title = document.createElement("h3");
      title.textContent = section.title;
      block.append(title);
      (section.paragraphs ?? []).forEach((paragraphText) => {
        block.append(paragraph(paragraphText));
      });
      return block;
    })
  );
}

function renderSegments(route) {
  elements.segmentTitle.textContent = `${route.title}分段`;
  elements.segmentsList.replaceChildren(
    ...route.segments.map((segment, index) => {
      const link = document.createElement("a");
      link.className = "segment-card";
      link.href = `section.html?route=${encodeURIComponent(route.id)}&segment=${index}`;

      const order = document.createElement("span");
      order.textContent = `${String(index + 1).padStart(2, "0")} · ${segment.range}`;
      const title = document.createElement("h3");
      title.textContent = segment.name;
      const copy = document.createElement("p");
      copy.textContent = segment.copy;

      link.append(order, title, copy);
      return link;
    })
  );
}

function renderRelatedTopics(route) {
  const related = state.topics.filter((topic) => topic.routeIds.includes(route.id));
  elements.relatedTopicGrid.replaceChildren(...related.map(topicCard));
}

function renderMap() {
  const route = state.route;
  const viewport = mapViewport(route.bounds);
  const project = viewport.project;

  elements.routeToggleBranch.classList.toggle("is-active", state.showBranch);
  elements.routeBasemapAdmin.classList.toggle("is-active", state.basemap === "admin");
  elements.routeBasemapSatellite.classList.toggle("is-active", state.basemap === "satellite");
  elements.routeMapCaption.textContent = route.title;
  elements.routeMapAttribution.textContent = `${mapLayers[state.basemap].attribution} · 路线轨迹`;

  elements.routeDetailMap.replaceChildren();
  elements.routeDetailMap.append(createBackground());
  elements.routeDetailMap.append(createTileLayer(viewport));
  elements.routeDetailMap.append(createTileScrim());
  elements.routeDetailMap.append(createGraticule(project, route.bounds));
  drawRoute(route, project, true);
  drawMarkers(route, project);
}

function createBackground() {
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("class", "map-bg");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", viewBox.width);
  rect.setAttribute("height", viewBox.height);
  return rect;
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
    group.append(line(start.x, start.y, end.x, end.y, "graticule"));
  }

  for (let lat = latStart; lat <= latEnd; lat += 5) {
    const start = project([bounds.west, lat]);
    const end = project([bounds.east, lat]);
    group.append(line(start.x, start.y, end.x, end.y, "graticule"));
  }

  return group;
}

function drawRoute(route, project) {
  elements.routeDetailMap.append(routePath(route.geometry.main.coordinates, project, {
    color: route.color,
    width: 6,
    opacity: 1,
    isBranch: false
  }));

  if (state.showBranch) {
    elements.routeDetailMap.append(routePath(route.geometry.branch.coordinates, project, {
      color: route.color,
      width: 4.2,
      opacity: 0.9,
      isBranch: true
    }));
  }
}

function routePath(coordinates, project, options) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("class", "route-path");
  path.setAttribute("d", pathData(coordinates, project));
  path.setAttribute("stroke", options.color);
  path.setAttribute("stroke-width", options.width);
  path.setAttribute("opacity", options.opacity);
  if (options.isBranch) path.setAttribute("stroke-dasharray", "10 10");
  return path;
}

function drawMarkers(route, project) {
  const group = document.createElementNS(svgNS, "g");
  const placedLabels = [];

  orderedRouteStops(route).forEach((marker) => {
    if (!state.showBranch && marker.type === "branch") return;
    const point = project([marker.lon, marker.lat]);
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("class", `marker-dot ${marker.type === "branch" ? "is-branch" : ""}`);
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
    dot.setAttribute("r", marker.type === "shared" ? 6.5 : 5.5);
    dot.style.setProperty("fill", marker.type === "branch" ? "#fffdf8" : route.color);
    dot.style.setProperty("stroke", route.color);
    group.append(dot);

    const box = labelBox(point, marker.name);
    if (canPlaceLabel(box, placedLabels)) {
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("class", "marker-label");
      label.setAttribute("x", Math.min(point.x + 10, viewBox.width - box.width - 8));
      label.setAttribute("y", Math.max(point.y - 9, 20));
      label.textContent = marker.name;
      group.append(label);
      placedLabels.push(box);
    }
  });

  elements.routeDetailMap.append(group);
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

function pathData(coordinates, project) {
  return coordinates
    .map((coordinate, index) => {
      const point = project(coordinate);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function line(x1, y1, x2, y2, className) {
  const node = document.createElementNS(svgNS, "line");
  node.setAttribute("class", className);
  node.setAttribute("x1", x1);
  node.setAttribute("y1", y1);
  node.setAttribute("x2", x2);
  node.setAttribute("y2", y2);
  return node;
}

function orderedRouteStops(route) {
  const stops = route.markers ?? [];
  const mainStops = stops
    .filter((stop) => stop.type !== "branch")
    .map((stop) => ({
      ...stop,
      progress: nearestProgress(route.geometry.main.coordinates, [stop.lon, stop.lat])
    }))
    .sort((a, b) => a.progress - b.progress);
  const branchStops = stops
    .filter((stop) => stop.type === "branch")
    .map((stop) => ({
      ...stop,
      progress: nearestProgress(route.geometry.branch.coordinates, [stop.lon, stop.lat])
    }))
    .sort((a, b) => a.progress - b.progress);
  if (!branchStops.length) return mainStops;
  const anchorProgress = nearestProgress(route.geometry.main.coordinates, route.geometry.branch.start);
  const closestMainIndex = mainStops.reduce((bestIndex, stop, index) => {
    const best = mainStops[bestIndex];
    return Math.abs(stop.progress - anchorProgress) < Math.abs(best.progress - anchorProgress)
      ? index
      : bestIndex;
  }, 0);
  const insertIndex = Math.min(mainStops.length, closestMainIndex + 1);
  return [...mainStops.slice(0, insertIndex), ...branchStops, ...mainStops.slice(insertIndex)];
}

function nearestProgress(coordinates, target) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  coordinates.forEach((coordinate, index) => {
    const distance = haversineDistance(coordinate, target);
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  });
  return coordinates.length > 1 ? bestIndex / (coordinates.length - 1) : 0;
}

function haversineDistance([lon1, lat1], [lon2, lat2]) {
  const radius = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}

function labelBox(point, text) {
  const width = text.length * 15 + 16;
  const x = Math.min(point.x + 8, viewBox.width - width - 8);
  const y = Math.max(point.y - 26, 6);
  return { x, y, width, height: 22 };
}

function canPlaceLabel(box, placed) {
  return !placed.some((other) => {
    return (
      box.x < other.x + other.width &&
      box.x + box.width > other.x &&
      box.y < other.y + other.height &&
      box.y + box.height > other.y
    );
  });
}

function roadChip(road) {
  const item = document.createElement("article");
  item.className = "road-chip";
  const code = document.createElement("strong");
  code.textContent = road.code;
  const name = document.createElement("span");
  name.textContent = road.name;
  const role = document.createElement("p");
  role.textContent = road.role;
  item.append(code, name, role);
  return item;
}

function geoBlock(block, index) {
  const item = document.createElement("article");
  item.className = "geo-block";
  const order = document.createElement("span");
  order.textContent = String(index + 1).padStart(2, "0");
  const title = document.createElement("h4");
  title.textContent = block.name;
  const range = document.createElement("small");
  range.textContent = block.range;
  const copy = document.createElement("p");
  copy.textContent = block.copy;
  item.append(order, title, range, copy);
  return item;
}

function crossingCard(crossing, index) {
  const target = state.routes.find((item) => item.id === crossing.with);
  const card = document.createElement("article");
  card.className = "crossing-card";
  if (target) {
    card.style.setProperty("--crossing-color", target.color);
  }

  const map = document.createElement("figure");
  map.className = "crossing-map";
  const image = document.createElement("img");
  image.src = `assets/crossing-maps/${state.route.id}-${String(index + 1).padStart(2, "0")}.svg?v=20260601-research`;
  image.alt = `${crossing.place}：${state.route.shortName}与${target?.shortName ?? crossing.withName}交汇局部图`;
  map.append(image);

  const content = document.createElement("div");
  content.className = "crossing-copy";
  if (target) {
    content.append(routeBadgeImage(target, "route-mini-badge"));
  }
  const place = document.createElement("h4");
  place.textContent = crossing.place;
  const label = document.createElement("span");
  label.textContent = crossing.withName;
  const copy = document.createElement("p");
  copy.textContent = crossing.copy;
  const link = document.createElement("a");
  link.href = target ? `route.html?route=${encodeURIComponent(target.id)}` : "#";
  link.textContent = target ? `转入${target.shortName}` : crossing.withName;
  content.append(place, label, copy, link);
  card.append(map, content);
  return card;
}

function topicCard(topic) {
  const card = document.createElement("article");
  card.className = "topic-card is-related";
  const topicRoutes = topic.routeIds
    .map((routeId) => state.routes.find((route) => route.id === routeId))
    .filter(Boolean);
  const primary = topicRoutes[0] ?? currentRoute();
  const secondary = topicRoutes[1] ?? primary;
  card.style.setProperty("--topic-color", primary.color);
  card.style.setProperty("--topic-accent", secondary.color ?? primary.accent);
  card.style.setProperty("--topic-dark", primary.accent ?? "var(--ink)");
  const coverLink = document.createElement("a");
  coverLink.className = "topic-card-cover";
  coverLink.href = `topic.html?topic=${encodeURIComponent(topic.id)}`;
  const cover = document.createElement("img");
  cover.src = `assets/topic-covers/${topic.id}.svg?v=20260601-research`;
  cover.alt = `${topic.title}封面图`;
  coverLink.append(cover);
  const kicker = document.createElement("span");
  kicker.className = "topic-kicker";
  kicker.textContent = topic.kicker;
  const title = document.createElement("h3");
  title.textContent = topic.title;
  const deck = document.createElement("p");
  deck.textContent = topic.deck;
  const routeList = document.createElement("div");
  routeList.className = "topic-route-list";
  routeList.append(...topic.routeIds.map(topicRouteBadgeLink));
  const action = document.createElement("div");
  action.className = "topic-actions";
  const link = document.createElement("a");
  link.href = `topic.html?topic=${encodeURIComponent(topic.id)}`;
  link.textContent = "阅读专题";
  action.append(link);
  card.append(coverLink, kicker, title, deck, routeList, action);
  return card;
}

function topicRouteBadgeLink(routeId) {
  const route = state.routes.find((item) => item.id === routeId);
  const link = document.createElement("a");
  link.className = "route-badge-link";
  link.href = `route.html?route=${encodeURIComponent(routeId)}`;
  link.style.setProperty("--topic-route-color", route?.color ?? "var(--theme)");
  if (route) {
    link.append(routeBadgeImage(route, "route-mini-badge"));
    link.setAttribute("aria-label", route.title);
  } else {
    link.textContent = routeId;
  }
  return link;
}

function metaItem(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function paragraph(text) {
  const node = document.createElement("p");
  node.textContent = text;
  return node;
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

function formatKm(value) {
  return Number(value).toLocaleString("zh-CN");
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

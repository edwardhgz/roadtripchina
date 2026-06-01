const svgNS = "http://www.w3.org/2000/svg";
const viewBox = { width: 1000, height: 620, padding: 52 };
const tileSize = 256;
const mapLayers = {
  admin: {
    label: "区划",
    attribution: "© OpenStreetMap contributors",
    url: ({ z, x, y }) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  },
  satellite: {
    label: "卫星",
    attribution: "Imagery © Esri",
    url: ({ z, x, y }) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
  }
};

const state = {
  routes: [],
  specialTopics: [],
  selectedId: "silk-canal",
  showBranch: true,
  mapMode: "all",
  basemap: "admin",
  zoomDelta: 0,
  mapPan: { x: 0, y: 0 },
  mapDragSuppressUntil: 0
};

const elements = {
  routeMap: document.querySelector("#routeMap"),
  routePills: document.querySelector("#routePills"),
  routeCards: document.querySelector("#routeCards"),
  routeCount: document.querySelector("#routeCount"),
  totalDistance: document.querySelector("#totalDistance"),
  mapCaption: document.querySelector("#mapCaption"),
  mapAttribution: document.querySelector("#mapAttribution"),
  fitSelected: document.querySelector("#fitSelected"),
  fitAll: document.querySelector("#fitAll"),
  toggleBranch: document.querySelector("#toggleBranch"),
  mapZoomOut: document.querySelector("#mapZoomOut"),
  mapZoomIn: document.querySelector("#mapZoomIn"),
  basemapAdmin: document.querySelector("#basemapAdmin"),
  basemapSatellite: document.querySelector("#basemapSatellite"),
  storyKicker: document.querySelector("#storyKicker"),
  storyTitle: document.querySelector("#storyTitle"),
  storyTagline: document.querySelector("#storyTagline"),
  factRow: document.querySelector("#factRow"),
  storyOverview: document.querySelector("#storyOverview"),
  mainLabel: document.querySelector("#mainLabel"),
  branchLabel: document.querySelector("#branchLabel"),
  roadSpineSummary: document.querySelector("#roadSpineSummary"),
  primaryRoads: document.querySelector("#primaryRoads"),
  expresswayRoads: document.querySelector("#expresswayRoads"),
  localRoadNote: document.querySelector("#localRoadNote"),
  geoBlocks: document.querySelector("#geoBlocks"),
  terminalArc: document.querySelector("#terminalArc"),
  terminalStart: document.querySelector("#terminalStart"),
  terminalEnd: document.querySelector("#terminalEnd"),
  terminalBranch: document.querySelector("#terminalBranch"),
  crossingsList: document.querySelector("#crossingsList"),
  specialTopics: document.querySelector("#specialTopics"),
  highlightsList: document.querySelector("#highlightsList"),
  stopsList: document.querySelector("#stopsList"),
  segmentTitle: document.querySelector("#segmentTitle"),
  segments: document.querySelector("#segments"),
  routeLogo: document.querySelector("#routeLogo"),
  articleHeadline: document.querySelector("#articleHeadline"),
  articleDeck: document.querySelector("#articleDeck"),
  routeHomeMeta: document.querySelector("#routeHomeMeta"),
  routeFirstSection: document.querySelector("#routeFirstSection"),
  articleNote: document.querySelector("#articleNote"),
  bestFor: document.querySelector("#bestFor"),
  season: document.querySelector("#season"),
  notesList: document.querySelector("#notesList")
};

init();

async function init() {
  try {
    const [routeResponse, topicResponse] = await Promise.all([
      fetch("./data/routes.json?v=20260601-research"),
      fetch("./data/special-topics.json?v=20260601-research")
    ]);
    const data = await routeResponse.json();
    const topics = await topicResponse.json();
    state.routes = data.routes;
    state.specialTopics = topics.topics ?? [];
    renderStaticShell();
    render();
  } catch (error) {
    elements.routeMap.innerHTML = "";
    const message = document.createElementNS(svgNS, "text");
    message.setAttribute("x", "500");
    message.setAttribute("y", "310");
    message.setAttribute("text-anchor", "middle");
    message.setAttribute("class", "marker-label");
    message.textContent = "路线暂时没有载入，请回到首页稍后再试。";
    elements.routeMap.append(message);
    console.error(error);
  }
}

function renderStaticShell() {
  elements.routeCount.textContent = state.routes.length;
  elements.totalDistance.textContent = formatKm(sum(state.routes.map((route) => route.stats.totalKm)));

  elements.routePills.replaceChildren(...state.routes.map(createPill));
  elements.routeCards.replaceChildren(...state.routes.map(createCard));

  elements.fitSelected.addEventListener("click", () => {
    state.mapMode = "selected";
    resetMapPan();
    render();
  });

  elements.fitAll.addEventListener("click", () => {
    state.mapMode = "all";
    resetMapPan();
    render();
  });

  elements.toggleBranch.addEventListener("click", () => {
    state.showBranch = !state.showBranch;
    render();
  });

  elements.mapZoomOut.addEventListener("click", () => {
    state.zoomDelta = Math.max(-2, state.zoomDelta - 1);
    renderMap();
  });

  elements.mapZoomIn.addEventListener("click", () => {
    state.zoomDelta = Math.min(4, state.zoomDelta + 1);
    renderMap();
  });

  elements.basemapAdmin.addEventListener("click", () => {
    state.basemap = "admin";
    render();
  });

  elements.basemapSatellite.addEventListener("click", () => {
    state.basemap = "satellite";
    render();
  });

  window.addEventListener("resize", () => renderMap());
  attachMapDrag(elements.routeMap, {
    getPan: () => state.mapPan,
    setSuppress: () => {
      state.mapDragSuppressUntil = Date.now() + 250;
    },
    render: renderMap,
    width: viewBox.width,
    height: viewBox.height
  });
}

function createPill(route) {
  const button = document.createElement("button");
  button.className = "route-pill";
  button.type = "button";
  button.dataset.routeId = route.id;
  button.style.setProperty("--active", route.color);
  button.textContent = route.shortName;
  button.addEventListener("click", () => selectRoute(route.id));
  return button;
}

function createCard(route) {
  const card = document.createElement("a");
  card.className = "route-card";
  card.href = `route.html?route=${encodeURIComponent(route.id)}`;
  card.dataset.routeId = route.id;
  card.dataset.order = String(route.order).padStart(2, "0");
  card.style.setProperty("--card-color", route.color);
  card.style.setProperty("--card-accent", route.accent);
  card.style.setProperty("--card-image", `url("${route.image}")`);

  const top = document.createElement("div");
  top.className = "route-card-top";

  const logo = document.createElement("img");
  logo.className = "card-logo";
  logo.src = routeLogoSrc(route);
  logo.alt = "";

  const kicker = document.createElement("small");
  kicker.textContent = route.kicker;
  top.append(logo, kicker);

  const content = document.createElement("div");
  content.className = "route-card-body";
  const title = document.createElement("h3");
  title.textContent = route.title;
  const copy = document.createElement("p");
  copy.textContent = route.tagline;

  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.append(metaItem(`主线 ${formatKm(route.stats.mainKm)} 公里`));
  meta.append(metaItem(`支线 ${formatKm(route.stats.branchKm)} 公里`));

  content.append(title, copy, meta);
  card.append(top, content);
  return card;
}

function metaItem(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function selectRoute(routeId) {
  state.selectedId = routeId;
  state.mapMode = "selected";
  resetMapPan();
  render();
}

function render() {
  const selected = currentRoute();
  document.documentElement.style.setProperty("--active", selected.color);
  document.documentElement.style.setProperty("--theme", selected.color);
  document.documentElement.style.setProperty("--theme-accent", selected.accent);
  elements.mapCaption.textContent = state.mapMode === "all" ? "八线山河全图" : selected.title;
  elements.mapAttribution.textContent = `${mapLayers[state.basemap].attribution} · 路线轨迹`;

  document.querySelectorAll("[data-route-id]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.routeId === selected.id);
  });

  elements.fitSelected.classList.toggle("is-active", state.mapMode === "selected");
  elements.fitAll.classList.toggle("is-active", state.mapMode === "all");
  elements.toggleBranch.classList.toggle("is-active", state.showBranch);
  elements.basemapAdmin.classList.toggle("is-active", state.basemap === "admin");
  elements.basemapSatellite.classList.toggle("is-active", state.basemap === "satellite");

  renderMap();
  renderSpecialTopics(selected);
}

function renderStory(route) {
  elements.storyKicker.textContent = route.kicker;
  elements.storyTitle.textContent = route.title;
  elements.storyTagline.textContent = route.tagline;
  elements.storyOverview.textContent = route.overview;
  elements.mainLabel.textContent = route.mainLabel;
  elements.branchLabel.textContent = route.branchLabel;
  elements.segmentTitle.textContent = `${route.title}分段`;
  elements.highlightsList.replaceChildren(...route.highlights.map(listItem));
  elements.stopsList.replaceChildren(...orderedRouteStops(route).map((stop) => stopListItem(stop, route)));
  renderRouteAnalysis(route);

  elements.factRow.replaceChildren(
    fact(`主线 ${formatKm(route.stats.mainKm)} 公里`),
    fact(`支线 ${formatKm(route.stats.branchKm)} 公里`),
    fact(`合计 ${formatKm(route.stats.totalKm)} 公里`),
    fact(`${route.geometry.main.displayPointCount + route.geometry.branch.displayPointCount} 个地图折点`)
  );

  elements.segments.replaceChildren(
    ...route.segments.map((segment, index) => {
      const article = document.createElement("a");
      article.className = "segment-card";
      article.href = `section.html?route=${encodeURIComponent(route.id)}&segment=${index}`;

      const order = document.createElement("span");
      order.textContent = `${String(index + 1).padStart(2, "0")} · ${segment.range}`;
      const title = document.createElement("h3");
      title.textContent = segment.name;
      const copy = document.createElement("p");
      copy.textContent = segment.copy;

      article.append(order, title, copy);
      return article;
    })
  );

  elements.bestFor.replaceChildren(...route.bestFor.map(listItem));
  elements.season.textContent = route.season;
  elements.notesList.replaceChildren(...route.notes.map(listItem));
}

function renderRouteAnalysis(route) {
  const analysis = route.analysis;
  if (!analysis) {
    elements.roadSpineSummary.textContent = "这条线的道路骨架仍在整理中。";
    elements.primaryRoads.replaceChildren();
    elements.expresswayRoads.replaceChildren();
    elements.localRoadNote.textContent = "";
    elements.geoBlocks.replaceChildren();
    elements.terminalArc.textContent = "";
    elements.terminalStart.textContent = "";
    elements.terminalEnd.textContent = "";
    elements.terminalBranch.textContent = "";
    elements.crossingsList.replaceChildren();
    return;
  }

  elements.roadSpineSummary.textContent = analysis.roadSpine.summary;
  elements.primaryRoads.replaceChildren(...analysis.roadSpine.primary.map(roadChip));
  elements.expresswayRoads.replaceChildren(...analysis.roadSpine.expressways.map(roadChip));
  elements.localRoadNote.textContent = analysis.roadSpine.local;
  elements.geoBlocks.replaceChildren(...analysis.geoBlocks.map(geoBlock));
  elements.terminalArc.textContent = analysis.terminals.arc;
  elements.terminalStart.textContent = analysis.terminals.start;
  elements.terminalEnd.textContent = analysis.terminals.end;
  elements.terminalBranch.textContent = analysis.terminals.branch;
  elements.crossingsList.replaceChildren(...analysis.crossings.map((crossing) => crossingCard(crossing, route)));
  renderSpecialTopics(route);
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

function crossingCard(crossing, route) {
  const target = state.routes.find((item) => item.id === crossing.with);
  const card = document.createElement("article");
  card.className = "crossing-card";

  const place = document.createElement("h4");
  place.textContent = crossing.place;
  const copy = document.createElement("p");
  copy.textContent = crossing.copy;

  const link = document.createElement("a");
  link.href = "#article";
  link.textContent = target ? `转入${target.shortName}` : crossing.withName;
  link.dataset.routeJump = crossing.with;
  link.setAttribute("aria-label", `从${route.title}转入${crossing.withName}`);
  link.addEventListener("click", (event) => {
    if (!target) return;
    event.preventDefault();
    selectRoute(target.id);
    document.querySelector("#article")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const label = document.createElement("span");
  label.textContent = crossing.withName;

  card.append(place, label, copy, link);
  return card;
}

function renderSpecialTopics(selectedRoute) {
  if (!elements.specialTopics) return;

  elements.specialTopics.replaceChildren(
    ...state.specialTopics.map((topic) => topicCard(topic, selectedRoute))
  );
}

function topicCard(topic, selectedRoute) {
  const card = document.createElement("article");
  card.className = "topic-card";
  card.classList.toggle("is-related", topic.routeIds.includes(selectedRoute.id));
  const topicRoutes = topic.routeIds
    .map((routeId) => state.routes.find((route) => route.id === routeId))
    .filter(Boolean);
  const primary = topicRoutes[0] ?? selectedRoute;
  const secondary = topicRoutes[1] ?? selectedRoute;
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
  routeList.append(...topic.routeIds.map(topicRouteButton));

  const actions = document.createElement("div");
  actions.className = "topic-actions";
  const articleLink = document.createElement("a");
  articleLink.href = `topic.html?topic=${encodeURIComponent(topic.id)}`;
  articleLink.textContent = "阅读专题";
  actions.append(articleLink);

  card.append(coverLink, kicker, title, deck, routeList, actions);
  return card;
}

function topicRouteButton(routeId) {
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

function topicFragmentLink(fragment) {
  const route = state.routes.find((item) => item.id === fragment.route);
  const link = document.createElement("a");
  link.href = `section.html?route=${encodeURIComponent(fragment.route)}&segment=${fragment.segment}`;

  const label = document.createElement("strong");
  label.textContent = `${route?.shortName ?? fragment.route} · ${fragment.label}`;

  const role = document.createElement("span");
  role.textContent = fragment.role;

  link.append(label, role);
  return link;
}

function renderArticle(route) {
  const article = route.article ?? {};

  elements.routeLogo.src = routeLogoSrc(route);
  elements.routeLogo.alt = `${route.title}徽章`;
  elements.articleHeadline.textContent = route.title;
  elements.articleDeck.textContent = article.deck ?? route.tagline;
  elements.articleNote.textContent = article.sideNote ?? route.kicker;
  elements.routeFirstSection.href = firstSectionHref(route);
  elements.routeFirstSection.textContent = `进入第一段：${route.segments[0]?.name ?? route.shortName}`;

  elements.routeHomeMeta.replaceChildren(
    routeMetaItem(`${String(route.order).padStart(2, "0")} 号路线`),
    routeMetaItem(`全程 ${formatKm(route.stats.totalKm)} 公里`),
    routeMetaItem(`${route.segments.length} 个分段`)
  );
}

function routeMetaItem(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
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

function firstSectionHref(route) {
  return `section.html?route=${encodeURIComponent(route.id)}&segment=0`;
}

function fact(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function listItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function stopListItem(stop, route) {
  const item = document.createElement("li");
  item.style.setProperty("--stop-color", route.color);

  const name = document.createElement("span");
  name.className = "stop-name";
  name.textContent = stop.name;

  const kind = document.createElement("span");
  kind.className = "stop-kind";
  kind.textContent = stop.type === "branch" ? "支线" : stop.type === "shared" ? "共用" : "主线";

  item.append(name, kind);
  return item;
}

function renderMap() {
  const selected = currentRoute();
  const mapBounds = state.mapMode === "all" ? boundsForRoutes(state.routes) : selected.bounds;
  const viewport = mapViewport(mapBounds);
  const project = viewport.project;

  elements.routeMap.replaceChildren();
  elements.routeMap.append(createBackground());
  elements.routeMap.append(createTileLayer(viewport));
  elements.routeMap.append(createTileScrim());
  elements.routeMap.append(createGraticule(project, mapBounds));

  if (state.mapMode === "all") {
    state.routes.forEach((route) => drawRoute(route, project, false));
    return;
  }

  const dimmed = state.routes.filter((route) => route.id !== selected.id);
  dimmed.forEach((route) => drawRoute(route, project, false));
  drawRoute(selected, project, true);
  drawMarkers(selected, project);
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

function line(x1, y1, x2, y2, className) {
  const node = document.createElementNS(svgNS, "line");
  node.setAttribute("class", className);
  node.setAttribute("x1", x1);
  node.setAttribute("y1", y1);
  node.setAttribute("x2", x2);
  node.setAttribute("y2", y2);
  return node;
}

function drawRoute(route, project, isSelected) {
  const group = document.createElementNS(svgNS, "g");
  const isAllMode = state.mapMode === "all";
  const opacity = isAllMode ? 0.82 : isSelected ? 1 : 0.22;
  const mainWidth = isAllMode ? 4.2 : isSelected ? 5.8 : 2.6;
  const branchWidth = isAllMode ? 2.8 : isSelected ? 4.2 : 2.2;
  const branchOpacity = isAllMode ? 0.68 : isSelected ? 0.9 : 0.18;

  group.append(routePath(route.geometry.main.coordinates, project, {
    color: route.color,
    width: mainWidth,
    opacity,
    isBranch: false
  }));

  if (state.showBranch) {
    group.append(routePath(route.geometry.branch.coordinates, project, {
      color: route.color,
      width: branchWidth,
      opacity: branchOpacity,
      isBranch: true
    }));
  }

  group.append(hitPath(route.geometry.main.coordinates, project, route.id));
  if (state.showBranch) {
    group.append(hitPath(route.geometry.branch.coordinates, project, route.id));
  }

  elements.routeMap.append(group);
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

function hitPath(coordinates, project, routeId) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("class", "route-hit");
  path.setAttribute("d", pathData(coordinates, project));
  path.addEventListener("click", () => {
    if (Date.now() < state.mapDragSuppressUntil) return;
    selectRoute(routeId);
  });
  return path;
}

function pathData(coordinates, project) {
  return coordinates
    .map((coordinate, index) => {
      const point = project(coordinate);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function drawMarkers(route, project) {
  const markers = routeStops(route).length
    ? routeStops(route)
    : [
        endpointMarker("主线起点", route.geometry.main.start, "main"),
        endpointMarker("主线终点", route.geometry.main.end, "main"),
        endpointMarker("支线起点", route.geometry.branch.start, "branch"),
        endpointMarker("支线终点", route.geometry.branch.end, "branch")
      ];

  const group = document.createElementNS(svgNS, "g");
  const placedLabels = [];

  markers.forEach((marker) => {
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

  elements.routeMap.append(group);
}

function routeStops(route) {
  return route.markers?.length ? route.markers : [];
}

function orderedRouteStops(route) {
  const stops = routeStops(route);
  if (!stops.length) return [];

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

  return [
    ...mainStops.slice(0, insertIndex),
    ...branchStops,
    ...mainStops.slice(insertIndex)
  ];
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

function endpointMarker(name, coordinate, type) {
  return { name, lon: coordinate[0], lat: coordinate[1], type };
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function boundsForRoutes(routes) {
  return routes.reduce(
    (memo, route) => ({
      west: Math.min(memo.west, route.bounds.west),
      south: Math.min(memo.south, route.bounds.south),
      east: Math.max(memo.east, route.bounds.east),
      north: Math.max(memo.north, route.bounds.north)
    }),
    { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity }
  );
}

function currentRoute() {
  return state.routes.find((route) => route.id === state.selectedId) ?? state.routes[0];
}

function attachMapDrag(svg, options) {
  let pointerId = null;
  let lastPoint = null;
  let moved = false;
  let frame = null;

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    lastPoint = { x: event.clientX, y: event.clientY };
    moved = false;
    svg.setPointerCapture(pointerId);
    svg.classList.add("is-dragging");
  });

  svg.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId || !lastPoint) return;
    const rect = svg.getBoundingClientRect();
    const deltaX = ((event.clientX - lastPoint.x) * options.width) / rect.width;
    const deltaY = ((event.clientY - lastPoint.y) * options.height) / rect.height;
    lastPoint = { x: event.clientX, y: event.clientY };
    if (Math.abs(deltaX) > 0.6 || Math.abs(deltaY) > 0.6) moved = true;
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
    if (moved) options.setSuppress?.();
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

function resetMapPan() {
  state.mapPan.x = 0;
  state.mapPan.y = 0;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function formatKm(value) {
  return Number(value).toLocaleString("zh-CN");
}

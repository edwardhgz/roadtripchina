import { loadPagePhotos, photoUrl, primaryPhoto, setPhotoImage } from "./page-photos.js?v=20260601-design-2";

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

const chinaOutline = [
  {
    name: "海南",
    type: "island",
    coordinates: [[109.475, 18.198], [108.655, 18.508], [108.626, 19.368], [109.119, 19.821], [110.212, 20.101], [110.787, 20.078], [111.01, 19.696], [110.571, 19.256], [110.339, 18.678], [109.475, 18.198]]
  },
  {
    name: "大陆",
    type: "mainland",
    coordinates: [[80.26, 42.35], [80.18, 42.92], [80.866, 43.18], [79.966, 44.918], [81.947, 45.317], [82.459, 45.54], [83.18, 47.33], [85.164, 47.001], [85.72, 47.453], [85.768, 48.456], [86.599, 48.549], [87.36, 49.215], [87.751, 49.297], [88.014, 48.599], [88.854, 48.069], [90.281, 47.694], [90.971, 46.888], [90.586, 45.72], [90.946, 45.286], [92.134, 45.115], [93.481, 44.975], [94.689, 44.352], [95.307, 44.241], [95.762, 43.319], [96.349, 42.726], [97.452, 42.749], [99.516, 42.525], [100.846, 42.664], [101.833, 42.515], [103.312, 41.907], [104.522, 41.908], [104.965, 41.597], [106.129, 42.134], [107.745, 42.482], [109.244, 42.519], [110.412, 42.871], [111.13, 43.407], [111.83, 43.743], [111.668, 44.073], [111.348, 44.457], [111.873, 45.102], [112.436, 45.012], [113.464, 44.809], [114.46, 45.34], [115.985, 45.727], [116.718, 46.388], [117.422, 46.673], [118.874, 46.805], [119.663, 46.693], [119.773, 47.048], [118.867, 47.747], [118.064, 48.067], [117.296, 47.698], [116.309, 47.853], [115.743, 47.727], [115.485, 48.135], [116.192, 49.135], [116.679, 49.889], [117.879, 49.511], [119.288, 50.143], [119.279, 50.583], [120.182, 51.644], [120.738, 51.964], [120.726, 52.516], [120.177, 52.754], [121.003, 53.251], [122.246, 53.432], [123.571, 53.459], [125.068, 53.161], [125.946, 52.793], [126.564, 51.784], [126.939, 51.354], [127.287, 50.74], [127.657, 49.76], [129.398, 49.441], [130.582, 48.73], [130.987, 47.79], [132.507, 47.789], [133.374, 48.183], [135.026, 48.478], [134.501, 47.578], [134.112, 47.212], [133.77, 46.117], [133.097, 45.144], [131.883, 45.321], [131.025, 44.968], [131.289, 44.112], [131.145, 42.93], [130.634, 42.903], [130.64, 42.395], [129.994, 42.985], [129.597, 42.425], [128.052, 41.994], [128.208, 41.467], [127.344, 41.503], [126.869, 41.817], [126.182, 41.107], [125.08, 40.57], [124.266, 39.928], [122.868, 39.638], [122.131, 39.17], [121.055, 38.897], [121.586, 39.361], [121.377, 39.75], [122.169, 40.422], [121.64, 40.946], [120.769, 40.593], [119.64, 39.898], [119.023, 39.252], [118.043, 39.204], [117.533, 38.738], [118.06, 38.061], [118.878, 37.897], [118.912, 37.448], [119.703, 37.156], [120.823, 37.87], [121.711, 37.481], [122.358, 37.454], [122.52, 36.931], [121.104, 36.651], [120.637, 36.111], [119.665, 35.61], [119.151, 34.91], [120.228, 34.36], [120.62, 33.377], [121.229, 32.46], [121.908, 31.692], [121.892, 30.949], [121.264, 30.676], [121.504, 30.143], [122.092, 29.833], [121.938, 29.018], [121.684, 28.226], [121.126, 28.136], [120.395, 27.053], [119.585, 25.741], [118.657, 24.547], [117.282, 23.625], [115.891, 22.783], [114.764, 22.668], [114.153, 22.224], [113.807, 22.548], [113.241, 22.051], [111.844, 21.55], [110.785, 21.397], [110.444, 20.341], [109.89, 20.282], [109.628, 21.008], [109.864, 21.395], [108.523, 21.715], [108.05, 21.552], [107.043, 21.812], [106.567, 22.218], [106.725, 22.794], [105.811, 22.977], [105.329, 23.352], [104.477, 22.819], [103.505, 22.704], [102.707, 22.709], [102.17, 22.465], [101.652, 22.318], [101.803, 21.174], [101.27, 21.202], [101.18, 21.437], [101.15, 21.85], [100.417, 21.559], [99.983, 21.743], [99.241, 22.118], [99.532, 22.949], [98.899, 23.143], [98.66, 24.063], [97.605, 23.897], [97.725, 25.084], [98.672, 25.919], [98.712, 26.744], [98.683, 27.509], [98.246, 27.747], [97.912, 28.336], [97.327, 28.262], [96.249, 28.411], [96.587, 28.831], [96.118, 29.453], [95.405, 29.032], [94.566, 29.277], [93.413, 28.641], [92.503, 27.897], [91.697, 27.772], [91.259, 28.041], [90.731, 28.065], [90.016, 28.296], [89.476, 28.043], [88.814, 27.299], [88.73, 28.087], [88.12, 27.877], [86.955, 27.974], [85.823, 28.204], [85.012, 28.643], [84.235, 28.84], [83.899, 29.32], [83.337, 29.464], [82.328, 30.115], [81.526, 30.423], [81.111, 30.183], [79.721, 30.883], [78.739, 31.516], [78.458, 32.618], [79.176, 32.484], [79.209, 32.994], [78.811, 33.506], [78.912, 34.322], [77.837, 35.494], [76.193, 35.898], [75.897, 36.667], [75.158, 37.133], [74.98, 37.42], [74.83, 37.99], [74.865, 38.379], [74.258, 38.607], [73.929, 38.506], [73.675, 39.431], [73.96, 39.66], [73.822, 39.894], [74.777, 40.366], [75.468, 40.562], [76.526, 40.428], [76.904, 41.066], [78.187, 41.185], [78.544, 41.582], [80.119, 42.124], [80.26, 42.35]]
  },
  {
    name: "台湾",
    type: "island",
    coordinates: [[121.778, 24.394], [121.176, 22.791], [120.747, 21.971], [120.22, 22.815], [120.106, 23.556], [120.695, 24.538], [121.495, 25.295], [121.951, 24.998], [121.778, 24.394]]
  }
];

const chinaArtLines = [
  {
    className: "china-art-line is-plateau",
    coordinates: [[74.4, 37.8], [81.4, 35.5], [88.9, 32.2], [96.7, 29.2], [102.8, 27.2], [106.2, 24.8]]
  },
  {
    className: "china-art-line is-yellow-river",
    coordinates: [[96.2, 35.4], [101.6, 36.3], [104.0, 36.0], [106.8, 37.6], [110.6, 39.5], [112.6, 34.9], [116.2, 35.0], [119.1, 37.4]]
  },
  {
    className: "china-art-line is-yangtze",
    coordinates: [[91.3, 32.9], [96.8, 32.0], [101.8, 30.8], [106.5, 29.6], [111.2, 30.6], [116.4, 30.7], [121.7, 31.2]]
  },
  {
    className: "china-art-line is-mountain",
    coordinates: [[103.0, 34.2], [107.4, 33.8], [111.1, 34.4], [114.8, 33.7], [119.1, 33.6]]
  },
  {
    className: "china-art-line is-hu-line",
    coordinates: [[127.6, 49.7], [121.6, 45.0], [114.8, 39.8], [108.5, 34.6], [101.9, 29.6], [98.4, 24.9]]
  }
];

const state = {
  routes: [],
  specialTopics: [],
  pagePhotos: new Map(),
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
    const [routeResponse, topicResponse, photoPages] = await Promise.all([
      fetch("./data/routes.json?v=20260601-design-2"),
      fetch("./data/special-topics.json?v=20260601-design-2"),
      loadPagePhotos()
    ]);
    const data = await routeResponse.json();
    const topics = await topicResponse.json();
    state.routes = data.routes;
    state.specialTopics = topics.topics ?? [];
    state.pagePhotos = photoPages;
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
  renderAtlasPhoto();

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
  const photo = primaryPhoto(state.pagePhotos, `route-${route.id}`);
  card.style.setProperty("--card-image", `url("${photo ? photoUrl(photo) : route.image}")`);

  const media = document.createElement("figure");
  media.className = "route-card-photo";
  const photoImage = document.createElement("img");
  if (!setPhotoImage(photoImage, photo, `${route.title}沿线照片`)) {
    photoImage.src = route.image;
    photoImage.alt = `${route.title}封面图`;
  }
  media.append(photoImage);

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
  card.append(media, top, content);
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
  elements.mapCaption.textContent = "八线山河艺术总览";
  elements.mapAttribution.textContent = "风格化中国轮廓 · 路线轨迹";

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
  const photo = primaryPhoto(state.pagePhotos, `topic-${topic.id}`);
  if (!setPhotoImage(cover, photo, `${topic.title}专题照片`)) {
    cover.src = `assets/topic-covers/${topic.id}.svg?v=20260601-design-2`;
    cover.alt = `${topic.title}封面图`;
  }
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

function renderAtlasPhoto() {
  const photo = primaryPhoto(state.pagePhotos, "index");
  const atlas = document.querySelector(".atlas");
  if (!atlas || !photo) return;
  atlas.classList.add("has-photo");
  atlas.style.setProperty("--atlas-photo", `url("${photoUrl(photo)}")`);
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
  return `assets/route-logos/${route.id}.svg?v=20260601-design-2`;
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
  const mapBounds = boundsForRoutes(state.routes);
  const viewport = mapViewport(mapBounds);
  const baseProject = viewport.project;
  const project = (coordinate) => {
    const point = baseProject(coordinate);
    return {
      x: 500 + (point.x - 500) * 1.18,
      y: 330 + (point.y - 310) * 1.2
    };
  };

  elements.routeMap.replaceChildren();
  elements.routeMap.append(createAtlasBackdrop());
  elements.routeMap.append(createChinaSilhouette(project));
  state.routes.forEach((route) => drawAtlasRoute(route, project, route.id === selected.id));
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
  const visibleWorld = visibleWorldBounds(viewport, viewBox.width, viewBox.height);
  const minTileX = Math.max(0, Math.floor(visibleWorld.left / tileSize) - 1);
  const maxTileX = Math.min(maxTile - 1, Math.floor(visibleWorld.right / tileSize) + 1);
  const minTileY = Math.max(0, Math.floor(visibleWorld.top / tileSize) - 1);
  const maxTileY = Math.min(maxTile - 1, Math.floor(visibleWorld.bottom / tileSize) + 1);

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

function visibleWorldBounds(viewport, width, height) {
  return {
    left: viewport.worldLeft - viewport.offsetX / viewport.scale,
    top: viewport.worldTop - viewport.offsetY / viewport.scale,
    right: viewport.worldLeft + (width - viewport.offsetX) / viewport.scale,
    bottom: viewport.worldTop + (height - viewport.offsetY) / viewport.scale
  };
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

function createAtlasBackdrop() {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "atlas-art");
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("class", "atlas-art-paper");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", viewBox.width);
  rect.setAttribute("height", viewBox.height);
  group.append(rect);

  [
    ["M94 462 C184 410 220 354 302 330 C392 304 448 352 540 292 C620 241 698 212 884 226", "atlas-art-wash is-green"],
    ["M106 202 C198 164 302 182 382 128 C482 61 614 98 724 78 C804 64 860 84 924 48", "atlas-art-wash is-ochre"],
    ["M154 548 C234 504 346 520 446 464 C550 405 650 456 760 398 C820 366 878 350 942 362", "atlas-art-wash is-blue"]
  ].forEach(([d, className]) => {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("class", className);
    path.setAttribute("d", d);
    group.append(path);
  });

  [
    ["M104 114 C220 82 346 74 492 102 C636 128 778 124 908 90", "atlas-contour"],
    ["M88 514 C232 482 332 500 454 536 C594 574 738 550 914 516", "atlas-contour"],
    ["M730 120 C704 210 720 318 674 402 C640 464 652 520 604 588", "atlas-contour is-vertical"]
  ].forEach(([d, className]) => {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("class", className);
    path.setAttribute("d", d);
    group.append(path);
  });

  const title = document.createElementNS(svgNS, "text");
  title.setAttribute("class", "atlas-art-title");
  title.setAttribute("x", "70");
  title.setAttribute("y", "96");
  title.textContent = "八线入图";
  group.append(title);
  return group;
}

function createChinaSilhouette(project) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "china-outline-layer");

  chinaOutline.forEach((piece) => {
    const d = closedPathData(piece.coordinates, project);
    const halo = document.createElementNS(svgNS, "path");
    halo.setAttribute("class", `china-outline-halo is-${piece.type}`);
    halo.setAttribute("d", d);
    group.append(halo);
  });

  chinaOutline.forEach((piece) => {
    const land = document.createElementNS(svgNS, "path");
    land.setAttribute("class", `china-land is-${piece.type}`);
    land.setAttribute("d", closedPathData(piece.coordinates, project));
    land.setAttribute("aria-label", `${piece.name}轮廓`);
    group.append(land);
  });

  const lineGroup = document.createElementNS(svgNS, "g");
  lineGroup.setAttribute("class", "china-art-line-layer");
  chinaArtLines.forEach((lineItem) => {
    lineGroup.append(decorativePath(lineItem.coordinates, project, lineItem.className));
  });
  group.append(lineGroup);

  [
    { name: "帕米尔", coordinate: [75.5, 38.2] },
    { name: "青藏高原", coordinate: [90.8, 32.8] },
    { name: "河西走廊", coordinate: [98.6, 39.3] },
    { name: "华北平原", coordinate: [116.2, 37.4] },
    { name: "东海", coordinate: [123.5, 29.2] }
  ].forEach((label) => {
    const point = project(label.coordinate);
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("class", "china-map-label");
    text.setAttribute("x", point.x.toFixed(1));
    text.setAttribute("y", point.y.toFixed(1));
    text.textContent = label.name;
    group.append(text);
  });

  return group;
}

function drawAtlasRoute(route, project, isSelected) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", `atlas-route-group ${isSelected ? "is-selected" : ""}`);
  group.style.setProperty("--route-color", route.color);

  group.append(routePath(route.geometry.main.coordinates, project, {
    color: "rgba(36, 34, 31, 0.18)",
    width: isSelected ? 12 : 9,
    opacity: 1,
    isBranch: false,
    className: "atlas-route-shadow"
  }));

  group.append(routePath(route.geometry.main.coordinates, project, {
    color: route.color,
    width: isSelected ? 7.6 : 5.2,
    opacity: isSelected ? 0.96 : 0.72,
    isBranch: false,
    className: "atlas-route-line"
  }));

  if (state.showBranch) {
    group.append(routePath(route.geometry.branch.coordinates, project, {
      color: route.color,
      width: isSelected ? 4.8 : 3.4,
      opacity: isSelected ? 0.74 : 0.48,
      isBranch: true,
      className: "atlas-route-branch"
    }));
  }

  const hit = hitPath(route.geometry.main.coordinates, project, route.id);
  group.append(hit);
  const labelPoint = project(routeLabelCoordinate(route));
  const label = document.createElementNS(svgNS, "g");
  label.setAttribute("class", "atlas-route-label");
  label.setAttribute("transform", `translate(${labelPoint.x.toFixed(1)} ${labelPoint.y.toFixed(1)})`);
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("r", isSelected ? "18" : "14");
  const number = document.createElementNS(svgNS, "text");
  number.setAttribute("text-anchor", "middle");
  number.setAttribute("dy", "0.34em");
  number.textContent = String(route.order).padStart(2, "0");
  label.append(circle, number);
  group.append(label);
  elements.routeMap.append(group);
}

function routePath(coordinates, project, options) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("class", options.className ? `route-path ${options.className}` : "route-path");
  path.setAttribute("d", pathData(coordinates, project));
  path.setAttribute("stroke", options.color);
  path.setAttribute("stroke-width", options.width);
  path.setAttribute("opacity", options.opacity);
  if (options.isBranch) path.setAttribute("stroke-dasharray", "10 10");
  return path;
}

function routeLabelCoordinate(route) {
  const coordinates = route.geometry.main.coordinates;
  const ratio = route.order % 2 ? 0.42 : 0.58;
  return coordinates[Math.max(0, Math.min(coordinates.length - 1, Math.round((coordinates.length - 1) * ratio)))] ?? coordinates[0];
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

function closedPathData(coordinates, project) {
  return `${pathData(coordinates, project)} Z`;
}

function decorativePath(coordinates, project, className) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("class", className);
  path.setAttribute("d", pathData(coordinates, project));
  return path;
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

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const outputRoot = new URL("../assets/photos/page-photos/", import.meta.url);
const photoSource = process.env.PHOTO_SOURCE ?? "openverse";
const downloadMode = process.env.PHOTO_DOWNLOAD ?? "thumbnail";
const maxPhotosPerPage = Number.parseInt(process.env.PHOTOS_PER_PAGE ?? "2", 10);
const openversePageSize = Number.parseInt(process.env.OPENVERSE_PAGE_SIZE ?? "40", 10);
const openverseSource = process.env.OPENVERSE_SOURCE ?? "";
const requestedKeys = new Set((process.env.PHOTO_KEYS ?? "").split(",").map((key) => key.trim()).filter(Boolean));
const thumbWidth = Number.parseInt(process.env.PHOTO_WIDTH ?? "1600", 10);
const userAgent = "RoadtripChinaPhotoCollector/1.0 (local editorial research)";
const requestDelayMs = Number.parseInt(process.env.PHOTO_REQUEST_DELAY_MS ?? process.env.COMMONS_DELAY_MS ?? "650", 10);
const maxRetries = Number.parseInt(process.env.COMMONS_RETRIES ?? "6", 10);
let lastPhotoRequestAt = 0;

const routes = JSON.parse(await readFile(new URL("../data/route-meta.json", import.meta.url), "utf8"));
const topics = JSON.parse(await readFile(new URL("../data/special-topics.json", import.meta.url), "utf8")).topics;

const routeQueries = {
  "silk-canal": ["Silk Road China Hexi Corridor landscape", "Grand Canal China Jiangnan water town", "Kashgar Pamir Mountains"],
  coastal: ["China coastline Fujian coast", "Shandong peninsula coast Qingdao", "Pearl River Estuary Hong Kong Zhuhai"],
  yangtze: ["Yangtze River China Three Gorges", "Yangtze River source China", "Shanghai Yangtze estuary"],
  "east-west": ["Khorgos Xinjiang border landscape", "Qaidam Basin Qinghai landscape", "Fuyuan Ussuri River China"],
  "south-north": ["Xishuangbanna tropical landscape", "Mohe Heilongjiang forest", "Hainan Qiongzhou Strait"],
  "western-vertical": ["G214 Yunnan Tibet highway", "Meili Snow Mountain Deqin", "Ngari Tibet G219"],
  "central-vertical": ["Guilin karst landscape", "Qinghai Lake Xining landscape", "Zhangye Danxia Jiayuguan"],
  "south-china": ["Xu Xiake Yunnan travel landscape", "Guilin Li River karst", "Dali Erhai Yunnan"]
};

const segmentQueries = {
  "silk-canal-01": ["Kashgar Pamir Mountains", "Karakoram Highway Xinjiang", "喀什 帕米尔"],
  "silk-canal-02": ["Tarim Basin Kuqa oasis", "Taklamakan desert oasis", "塔里木 库车 绿洲"],
  "silk-canal-03": ["Sayram Lake Ili Valley", "Ili Valley Xinjiang", "赛里木湖 伊犁"],
  "silk-canal-04": ["Turpan Tianshan Xinjiang", "Urumqi Tianshan mountains", "吐鲁番 天山"],
  "silk-canal-05": ["Hexi Corridor Qilian Mountains", "Jiayuguan Gansu Qilian", "河西走廊 祁连山"],
  "silk-canal-06": ["Xi'an Luoyang Yellow River", "Longmen Grottoes Yellow River", "西安 洛阳 黄河"],
  "silk-canal-07": ["Grand Canal China Yangzhou", "Jining Grand Canal China", "京杭大运河 扬州"],
  "silk-canal-08": ["Jiangnan water town Suzhou Hangzhou", "Ningbo Hangzhou Bay Jiangnan", "江南水乡 苏州 杭州"],
  "silk-canal-09": ["Kanas Lake Altay Xinjiang", "Northern Xinjiang Altay mountains", "喀纳斯 阿勒泰"],

  "coastal-01": ["Dalian coast Liaodong Peninsula", "Liaodong Peninsula coastline", "大连 海岸"],
  "coastal-02": ["Shandong Peninsula coast Qingdao", "Qingdao coastline Laoshan", "青岛 山东半岛"],
  "coastal-03": ["Yangtze River estuary Shanghai", "Nantong Yangtze River Delta coast", "上海 长江口"],
  "coastal-04": ["Fujian coast Xiapu", "Zhejiang Fujian rocky coast", "福建 海岸 霞浦"],
  "coastal-05": ["Pearl River Estuary Hong Kong Zhuhai", "Macau Zhuhai coast", "珠江口 港珠澳"],
  "coastal-06": ["Beibu Gulf Guangxi coast", "Fangchenggang Beibu Gulf", "北部湾 防城港"],
  "coastal-07": ["Taiwan east coast", "Taiwan coastline Hualien", "台湾 东海岸"],

  "yangtze-01": ["Shanghai Yangtze estuary", "Yangtze River mouth Shanghai", "长江口 上海"],
  "yangtze-02": ["Nanjing Yangtze River", "Yangzhou Yangtze River China", "南京 长江"],
  "yangtze-03": ["Dongting Lake Poyang Lake Wuhan", "Wuhan Yangtze River lake", "洞庭湖 鄱阳湖 武汉"],
  "yangtze-04": ["Three Gorges Yangtze River", "Qutang Gorge Yangtze", "三峡 长江"],
  "yangtze-05": ["Chongqing Yangtze River", "Chengdu Chongqing Yangtze", "重庆 长江"],
  "yangtze-06": ["Nyingchi Yarlung Tsangpo", "Tibet Nyingchi valley", "林芝 雅鲁藏布"],
  "yangtze-07": ["Ngari Tibet Plateau", "Mount Kailash Ngari", "阿里 西藏"],
  "yangtze-08": ["Yangtze River source Tanggula", "Tuotuo River Yangtze source", "长江源 唐古拉"],

  "east-west-01": ["Khorgos Xinjiang border", "Pamir Xinjiang border landscape", "霍尔果斯 口岸"],
  "east-west-02": ["Qaidam Basin Qinghai", "Golmud Qaidam desert", "柴达木 格尔木"],
  "east-west-03": ["Gannan Qinghai highlands", "Qinghai Gansu grassland", "青海 甘南"],
  "east-west-04": ["Qinling Mountains Baoji", "Qinling mountain road", "秦岭 宝鸡"],
  "east-west-05": ["Beijing North China Plain", "Hebei plain Beijing", "北京 华北平原"],
  "east-west-06": ["Harbin Songnen Plain", "Northeast China plain Heilongjiang", "哈尔滨 松嫩平原"],
  "east-west-07": ["Fuyuan Ussuri River China", "Heixiazi Island Fuyuan", "抚远 乌苏里江"],
  "east-west-08": ["Mohe Heilongjiang forest", "Daxinganling Mohe", "漠河 黑龙江"],

  "south-north-01": ["Xishuangbanna tropical landscape", "Jinghong Mekong River", "西双版纳 热带"],
  "south-north-02": ["Hainan Qiongzhou Strait", "Haikou Hainan coast", "海南 琼州海峡"],
  "south-north-03": ["Zhangjiajie Wuling Mountains", "Wuling Mountains Hunan", "张家界 武陵"],
  "south-north-04": ["Pingyao Shanxi Taihang", "Shanxi ancient city mountains", "平遥 太行山"],
  "south-north-05": ["Zhangjiakou Great Wall grassland", "North China Great Wall Zhangjiakou", "张家口 长城"],
  "south-north-06": ["Mohe Daxinganling forest", "Greater Khingan forest China", "大兴安岭 漠河"],
  "south-north-07": ["Hukou Waterfall Yellow River", "Yellow River Hukou", "壶口瀑布 黄河"],

  "western-vertical-01": ["Xishuangbanna Mekong Jinghong", "Mekong River Yunnan Jinghong", "景洪 澜沧江"],
  "western-vertical-02": ["Dali Lijiang Shangri-La Meili Snow Mountain", "Meili Snow Mountain Deqin", "梅里雪山 香格里拉"],
  "western-vertical-03": ["Deqin Yanjing Nyingchi G318", "Ranwu Lake Bomi Nyingchi", "然乌 波密 林芝"],
  "western-vertical-04": ["Lhasa Shigatse Yamdrok Lake", "Tibet Lhasa Shigatse valley", "拉萨 日喀则 羊湖"],
  "western-vertical-05": ["Ngari Mount Kailash G219", "Tibet Ngari road", "阿里 冈仁波齐"],
  "western-vertical-06": ["Hotan Kuqa Taklamakan", "Taklamakan desert Hotan", "和田 库车 塔克拉玛干"],
  "western-vertical-07": ["Kanas Altay Xinjiang", "Altay mountains Xinjiang", "喀纳斯 阿勒泰"],
  "western-vertical-08": ["Sayram Lake Horgos", "Ili Xinjiang Sayram Lake", "赛里木湖 霍尔果斯"],

  "central-vertical-01": ["Liuzhou Guilin karst", "Guangxi karst Guilin", "柳州 桂林 喀斯特"],
  "central-vertical-02": ["Guizhou karst Bijie", "Guizhou mountain village karst", "贵州 喀斯特"],
  "central-vertical-03": ["Xichang Sichuan mountain road", "Panzhihua Jinsha River", "西昌 攀枝花"],
  "central-vertical-04": ["Kangding Litang Sichuan Tibetan", "Litang Sichuan grassland", "康定 理塘"],
  "central-vertical-05": ["Qinghai Lake Xining", "Qinghai Lake landscape", "青海湖 西宁"],
  "central-vertical-06": ["Zhangye Danxia Jiayuguan", "Zhangye Danxia Gansu", "张掖丹霞 嘉峪关"],
  "central-vertical-07": ["Jiuzhaigou Aba Sichuan", "Aba Sichuan valley", "九寨沟 阿坝"],

  "south-china-01": ["Suzhou Shaoxing Jiangnan water town", "Jiangnan canal water town", "苏州 绍兴 江南水乡"],
  "south-china-02": ["Huangshan Wuyuan Jiangxi mountains", "Wuyuan Jiangxi landscape", "黄山 婺源"],
  "south-china-03": ["Guilin Li River Yangshuo", "Li River karst landscape", "桂林 漓江 阳朔"],
  "south-china-04": ["Libo Guizhou karst", "Guizhou Guangxi karst landscape", "荔波 喀斯特"],
  "south-china-05": ["Dali Erhai Yunnan", "Erhai Lake Dali", "大理 洱海"],
  "south-china-06": ["Tengchong Baoshan Nujiang", "Nujiang valley Yunnan", "腾冲 怒江"],
  "south-china-07": ["Kunming Stone Forest Yunnan", "Dianchi Kunming Yunnan", "昆明 石林"]
};

const topicQueries = {
  "northern-xinjiang": ["Kanas Lake Altay Xinjiang", "Northern Xinjiang Altay landscape", "喀纳斯 阿勒泰"],
  "tarim-kunlun-oasis": ["Kashgar oasis Kunlun Mountains", "Tarim Basin oasis Xinjiang", "塔里木 昆仑 绿洲"],
  "hexi-corridor": ["Hexi Corridor Qilian Mountains", "Jiayuguan Gansu Qilian", "河西走廊 祁连山"],
  "gannan-gateway": ["Labrang Monastery Gannan grassland", "Gannan Tibetan grassland", "甘南 拉卜楞寺"],
  "western-sichuan-highlands": ["Kangding Litang Sichuan Tibetan", "Sichuan western highlands", "康定 理塘 川西"],
  "taihang-eight-passes": ["Taihang Mountains Shanxi", "Pingxingguan Taihang", "太行山 八陉"],
  "xu-xiake-guangxi": ["Guilin Li River Yangshuo karst", "Guangxi karst landscape", "徐霞客 广西 桂林"],
  "xu-xiake-yunnan": ["Dali Tengchong Yunnan landscape", "Yunnan Dali Erhai Tengchong", "徐霞客 云南 大理"]
};

const excluded = [
  "map", "locator", "relief", "diagram", "svg", "flag", "logo", "seal", "emblem",
  "coat of arms", "blank", "train", "station map", "administrative", "route map",
  "railway map", "highway map", "population", "location", "outline"
];

const existingManifest = await readExistingManifest();
const existingPages = new Map((existingManifest?.pages ?? []).map((page) => [page.key, page]));
const currentSource = photoSource === "openverse" ? "Openverse API" : "Wikimedia Commons API";

const pages = [
  {
    key: "index",
    url: "index.html",
    kind: "home",
    title: "行车中国",
    queries: ["China road landscape", "China highway mountain road", "Chinese landscape road trip"]
  },
  ...routes.map((route) => ({
    key: `route-${route.id}`,
    url: `route.html?route=${route.id}`,
    kind: "route",
    title: route.title,
    queries: routeQueries[route.id] ?? [route.title, route.shortName, route.tagline].filter(Boolean)
  })),
  ...routes.flatMap((route) =>
    route.segments.map((segment, index) => {
      const number = String(index + 1).padStart(2, "0");
      return {
        key: `section-${route.id}-${number}`,
        url: `section.html?route=${route.id}&segment=${index}`,
        kind: "section",
        title: `${route.shortName} / ${segment.name}`,
        queries: segmentQueries[`${route.id}-${number}`] ?? [`${segment.name} ${segment.range}`, route.title]
      };
    })
  ),
  ...topics.map((topic) => ({
    key: `topic-${topic.id}`,
    url: `topic.html?topic=${topic.id}`,
    kind: "topic",
    title: topic.title,
    queries: topicQueries[topic.id] ?? [topic.title, topic.deck].filter(Boolean)
  }))
];

const usedFiles = new Set(
  (existingManifest?.pages ?? [])
    .flatMap((page) => page.photos ?? [])
    .map((photo) => photo.commonsTitle)
    .filter(Boolean)
);

await mkdir(outputRoot, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  source: combinedSource(existingManifest?.source, currentSource),
  licenseNote: "Images are copied from open-license sources for local hosting. Keep each page's author/license/source attribution with any public use.",
  photoWidth: thumbWidth,
  photosPerPage: maxPhotosPerPage,
  pages: []
};

for (const page of pages) {
  const existingPage = existingPages.get(page.key);
  const saved = [...(existingPage?.photos ?? [])].slice(0, maxPhotosPerPage);
  const pageDir = new URL(`${page.key}/`, outputRoot);
  await mkdir(pageDir, { recursive: true });

  if (requestedKeys.size && !requestedKeys.has(page.key)) {
    manifest.pages.push({
      key: page.key,
      url: page.url,
      kind: page.kind,
      title: page.title,
      queries: page.queries,
      status: saved.length >= maxPhotosPerPage ? "ok" : saved.length ? "partial" : "missing",
      photos: saved
    });
    console.log(`SKIP ${page.key}: outside PHOTO_KEYS`);
    continue;
  }

  if (saved.length >= maxPhotosPerPage) {
    manifest.pages.push({
      key: page.key,
      url: page.url,
      kind: page.kind,
      title: page.title,
      queries: page.queries,
      status: "ok",
      photos: saved
    });
    console.log(`SKIP ${page.key}: ${saved.map((item) => item.file).join(", ")}`);
    continue;
  }

  const candidates = await collectCandidates(page);
  const chosen = chooseCandidates(candidates, Math.max(maxPhotosPerPage * 20, 40), usedFiles);

  for (const candidate of chosen) {
    if (saved.length >= maxPhotosPerPage) break;
    const savedPhoto = await savePhoto(pageDir, page.key, saved.length + 1, candidate);
    if (savedPhoto) {
      saved.push(savedPhoto);
      usedFiles.add(candidate.title);
    }
  }

  manifest.pages.push({
    key: page.key,
    url: page.url,
    kind: page.kind,
    title: page.title,
    queries: page.queries,
    status: saved.length >= maxPhotosPerPage ? "ok" : saved.length ? "partial" : "missing",
    photos: saved
  });

  console.log(`${saved.length ? "OK" : "MISS"} ${page.key}: ${saved.map((item) => item.file).join(", ")}`);
}

await writeFile(new URL("manifest.json", outputRoot), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(new URL("PHOTO_CREDITS.md", outputRoot), creditsMarkdown(manifest));
await writeFile(new URL("MISSING_PHOTOS.md", outputRoot), missingMarkdown(manifest));

console.log(`Saved ${manifest.pages.reduce((sum, page) => sum + page.photos.length, 0)} photos for ${manifest.pages.length} pages.`);

async function collectCandidates(page) {
  const byTitle = new Map();
  for (const query of page.queries) {
    const results = photoSource === "openverse"
      ? await openverseSearch(query)
      : await commonsSearch(query);
    for (const candidate of results) {
      const current = byTitle.get(candidate.title);
      const scored = { ...candidate, query, score: scoreCandidate(candidate, query) };
      if (!current || scored.score > current.score) {
        byTitle.set(candidate.title, scored);
      }
    }
    const viableCount = [...byTitle.values()].filter((candidate) => candidate.score > 0).length;
    if (viableCount >= maxPhotosPerPage * 5) break;
  }
  return [...byTitle.values()].sort((a, b) => b.score - a.score);
}

async function openverseSearch(query) {
  const params = new URLSearchParams({
    q: query,
    page_size: String(openversePageSize),
    license_type: "commercial,modification",
    mature: "false"
  });
  if (openverseSource) {
    params.set("source", openverseSource);
  }
  const url = `https://api.openverse.org/v1/images/?${params}`;
  const response = await photoFetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) {
    console.warn(`Openverse API ${response.status} for ${query}`);
    return [];
  }
  const json = await response.json();
  return (json.results ?? [])
    .map(normalizeOpenverseCandidate)
    .filter((candidate) => candidate.mime?.startsWith("image/") && candidate.downloadUrl);
}

async function readExistingManifest() {
  try {
    return JSON.parse(await readFile(new URL("manifest.json", outputRoot), "utf8"));
  } catch {
    return null;
  }
}

function normalizeOpenverseCandidate(item) {
  const license = item.license_version ? `${item.license?.toUpperCase()} ${item.license_version}` : item.license?.toUpperCase();
  return {
    title: item.id,
    objectName: clean(item.title) || item.id,
    description: clean(item.description ?? ""),
    artist: clean(item.creator ?? ""),
    credit: clean(item.provider ?? item.source ?? ""),
    license,
    licenseUrl: item.license_url ?? "",
    sourceUrl: item.foreign_landing_url,
    originalUrl: item.url,
    downloadUrl: downloadMode === "original" ? item.url : (item.thumbnail || item.url),
    mime: mimeFromOpenverse(item),
    width: item.width ?? 0,
    height: item.height ?? 0,
    provider: item.provider,
    source: item.source
  };
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "14",
    gsrsearch: query,
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: String(thumbWidth),
    origin: "*"
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params}`;
  const response = await photoFetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) {
    console.warn(`Commons API ${response.status} for ${query}`);
    return [];
  }
  const json = await response.json();
  const pages = Object.values(json.query?.pages ?? {});
  return pages
    .map((page) => page.imageinfo?.[0] ? normalizeCandidate(page, page.imageinfo[0]) : null)
    .filter(Boolean)
    .filter((candidate) => candidate.mime?.startsWith("image/") && candidate.downloadUrl);
}

function normalizeCandidate(page, imageinfo) {
  const metadata = imageinfo.extmetadata ?? {};
  return {
    title: page.title,
    objectName: clean(metadata.ObjectName?.value) || page.title.replace(/^File:/, ""),
    description: clean(metadata.ImageDescription?.value),
    artist: clean(metadata.Artist?.value),
    credit: clean(metadata.Credit?.value),
    license: clean(metadata.LicenseShortName?.value || metadata.License?.value),
    licenseUrl: metadata.LicenseUrl?.value ?? "",
    sourceUrl: imageinfo.descriptionurl,
    originalUrl: imageinfo.url,
    downloadUrl: imageinfo.thumburl || imageinfo.url,
    mime: imageinfo.mime,
    width: imageinfo.width,
    height: imageinfo.height
  };
}

function scoreCandidate(candidate, query) {
  const haystack = `${candidate.title} ${candidate.objectName} ${candidate.description}`.toLowerCase();
  if (excluded.some((word) => haystack.includes(word))) return -1000;
  let score = 0;
  if (candidate.mime === "image/jpeg") score += 10;
  if (candidate.width >= 1200 && candidate.height >= 800) score += 12;
  const ratio = candidate.width / candidate.height;
  if (ratio >= 1.15 && ratio <= 2.2) score += 8;
  if (ratio >= 0.75 && ratio < 1.15) score += 4;
  if (candidate.license) score += 8;
  if (/own work|photograph|photo|jpg|jpeg/i.test(haystack)) score += 4;
  for (const token of query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((item) => item.length > 3)) {
    if (haystack.includes(token)) score += 2;
  }
  if (/panorama|landscape|mountain|river|lake|valley|coast|gorge|desert|grassland/i.test(haystack)) score += 5;
  return score;
}

function chooseCandidates(candidates, count, used) {
  const firstPass = candidates.filter((candidate) => candidate.score > 0 && !used.has(candidate.title)).slice(0, count);
  if (firstPass.length >= count) return firstPass;
  const fallback = candidates.filter((candidate) => candidate.score > 0 && !firstPass.some((item) => item.title === candidate.title));
  return [...firstPass, ...fallback].slice(0, count);
}

async function savePhoto(pageDir, pageKey, index, candidate) {
  try {
    const urls = [...new Set([candidate.downloadUrl, candidate.originalUrl].filter(Boolean))];
    for (const url of urls) {
      const response = await photoFetch(url, { headers: { "user-agent": userAgent } }, 1, { maxDelayMs: 15000 });
      if (!response.ok) {
        console.warn(`Download ${response.status} ${candidate.title}`);
        continue;
      }
      const contentType = response.headers.get("content-type") ?? candidate.mime ?? "image/jpeg";
      if (!contentType.startsWith("image/")) {
        console.warn(`Download non-image ${contentType} ${candidate.title}`);
        continue;
      }
      const extension = extensionFor(contentType, url);
      const filename = `${String(index).padStart(2, "0")}${extension}`;
      const bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(new URL(filename, pageDir), bytes);
      return {
        role: index === 1 ? "primary" : "alternate",
        file: path.posix.join("assets/photos/page-photos", pageKey, filename),
        title: candidate.objectName,
        commonsTitle: candidate.title,
        sourceUrl: candidate.sourceUrl,
        originalUrl: candidate.originalUrl,
        license: candidate.license,
        licenseUrl: candidate.licenseUrl,
        artist: candidate.artist,
        credit: candidate.credit,
        description: candidate.description,
        width: candidate.width,
        height: candidate.height,
        query: candidate.query
      };
    }
    return null;
  } catch (error) {
    console.warn(`Failed ${candidate.title}: ${error.message}`);
    return null;
  }
}

async function photoFetch(url, options = {}, attempt = 1, retryOptions = {}) {
  const { maxDelayMs = 600000 } = retryOptions;
  await throttlePhotoRequests();
  const response = await fetch(url, options);
  if ((response.status === 429 || response.status >= 500) && attempt <= maxRetries) {
    const retryAfter = Number.parseFloat(response.headers.get("retry-after") ?? "");
    const delay = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : Math.min(45000, 3500 * attempt ** 1.55);
    if (delay > maxDelayMs) return response;
    console.warn(`Retry ${attempt}/${maxRetries} after ${response.status}; waiting ${Math.round(delay)}ms`);
    await sleep(delay);
    return photoFetch(url, options, attempt + 1, retryOptions);
  }
  return response;
}

async function throttlePhotoRequests() {
  const elapsed = Date.now() - lastPhotoRequestAt;
  if (elapsed < requestDelayMs) {
    await sleep(requestDelayMs - elapsed);
  }
  lastPhotoRequestAt = Date.now();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extensionFor(contentType, url) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  const match = new URL(url).pathname.match(/\.(jpe?g|png|webp)$/i);
  return match ? `.${match[1].toLowerCase().replace("jpeg", "jpg")}` : ".jpg";
}

function mimeFromOpenverse(item) {
  if (item.filetype) return `image/${item.filetype.replace("jpg", "jpeg")}`;
  const match = item.url?.match(/\.(jpe?g|png|webp)(?:[?#]|$)/i);
  if (!match) return "image/jpeg";
  return `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`;
}

function clean(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function creditsMarkdown(data) {
  const lines = [
    "# Page Photo Credits",
    "",
    `Images were downloaded through ${data.source} for local hosting. Keep attribution visible where these photos are used.`,
    ""
  ];
  for (const page of data.pages) {
    lines.push(`## ${page.key} — ${page.title}`);
    lines.push("");
    if (!page.photos.length) {
      lines.push("- No suitable image downloaded.");
    }
    for (const photo of page.photos) {
      const author = photo.artist || photo.credit || "Unknown author";
      const license = photo.license || "license metadata missing";
      lines.push(`- ${photo.role}: ${photo.file}`);
      lines.push(`  Source: ${photo.sourceUrl}`);
      lines.push(`  Title: ${photo.title}`);
      lines.push(`  Author/Credit: ${author}`);
      lines.push(`  License: ${license}${photo.licenseUrl ? ` (${photo.licenseUrl})` : ""}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function combinedSource(previous, current) {
  const sources = [previous, current]
    .flatMap((value) => `${value ?? ""}`.split(/\s+and\s+/i))
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(sources)].join(" and ") || current;
}

function missingMarkdown(data) {
  const missing = data.pages.filter((page) => !page.photos.length);
  const partial = data.pages.filter((page) => page.photos.length > 0 && page.photos.length < data.photosPerPage);
  const lines = [
    "# Missing Page Photos",
    "",
    `Generated at: ${data.generatedAt}`,
    `Target photos per page: ${data.photosPerPage}`,
    `Complete pages: ${data.pages.length - missing.length - partial.length}/${data.pages.length}`,
    `Missing pages: ${missing.length}`,
    `Partial pages: ${partial.length}`,
    ""
  ];

  if (partial.length) {
    lines.push("## Partial");
    lines.push("");
    for (const page of partial) {
      lines.push(`- ${page.key}: ${page.title}`);
      lines.push(`  URL: ${page.url}`);
      lines.push(`  Photos: ${page.photos.length}/${data.photosPerPage}`);
      lines.push(`  Queries: ${page.queries.join(" | ")}`);
    }
    lines.push("");
  }

  if (missing.length) {
    lines.push("## Missing");
    lines.push("");
    for (const page of missing) {
      lines.push(`- ${page.key}: ${page.title}`);
      lines.push(`  URL: ${page.url}`);
      lines.push(`  Queries: ${page.queries.join(" | ")}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

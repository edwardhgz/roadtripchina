import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = new URL("../assets/photos/page-photos/", import.meta.url);
const manifestUrl = new URL("manifest.json", outputRoot);
const thumbWidth = 1600;
const userAgent = "RoadtripChinaPhotoCollector/1.0 (local editorial research)";

const repairs = [
  {
    pageKey: "index",
    mode: "replace",
    index: 2,
    title: "File:Zhangye Danxia 2016.jpg"
  },
  {
    pageKey: "route-coastal",
    mode: "replace",
    index: 1,
    title: "File:Coast View - panoramio (1).jpg"
  },
  {
    pageKey: "route-coastal",
    mode: "replace",
    index: 2,
    title: "File:Coastal Shot - panoramio.jpg"
  },
  {
    pageKey: "route-yangtze",
    mode: "replace",
    index: 1,
    title: "File:YangtzeCruise.jpg"
  },
  {
    pageKey: "route-yangtze",
    mode: "replace",
    index: 2,
    title: "File:Bridge across the Yangtze - panoramio.jpg"
  },
  {
    pageKey: "section-coastal-01",
    mode: "replace",
    index: 1,
    title: "File:Yalu River Broken Bridge 03.jpg"
  },
  {
    pageKey: "section-silk-canal-02",
    mode: "replace",
    index: 1,
    title: "File:Tarim Desert Highway - Desert poplars, Xinjiang, China.jpg"
  },
  {
    pageKey: "section-silk-canal-05",
    mode: "replace",
    index: 2,
    title: "File:Zhangye Danxia 2016.jpg"
  },
  {
    pageKey: "section-silk-canal-06",
    mode: "append",
    title: "File:27407-Luoyang, Longmen Grottoes.jpg"
  },
  {
    pageKey: "section-silk-canal-07",
    mode: "replace",
    index: 1,
    title: "File:Yangzhou - Wanfu Lu area - rural landscape - CIMG3337.JPG"
  },
  {
    pageKey: "section-silk-canal-07",
    mode: "replace",
    index: 2,
    title: "File:Yangzhou - Wanfu Lu area - rural landscape - CIMG3338.JPG"
  },
  {
    pageKey: "section-silk-canal-08",
    mode: "replace",
    index: 2,
    title: "File:Yangzhou - Wanfu Lu area - rural landscape - CIMG3339.JPG"
  },
  {
    pageKey: "section-coastal-02",
    mode: "replace",
    index: 1,
    title: "File:Qingdao Pier.jpg"
  },
  {
    pageKey: "section-coastal-02",
    mode: "replace",
    index: 2,
    title: "File:Dalian Xinghai Bay Bridge.jpg"
  },
  {
    pageKey: "section-coastal-05",
    mode: "replace",
    index: 1,
    title: "File:汕头南澳岛 Nan-Ao Island - panoramio.jpg"
  },
  {
    pageKey: "section-coastal-05",
    mode: "replace",
    index: 2,
    title: "File:Hong Kong–Zhuhai–Macau Bridge 02.jpg"
  },
  {
    pageKey: "section-coastal-06",
    mode: "replace",
    index: 1,
    title: "File:Beihai-Silver-Beach-2007-08-27.jpg"
  },
  {
    pageKey: "section-coastal-06",
    mode: "replace",
    index: 2,
    title: "File:BeiHaiYanTan.jpg"
  },
  {
    pageKey: "section-yangtze-01",
    mode: "replace",
    index: 1,
    title: "File:YangtzeCruise.jpg"
  },
  {
    pageKey: "section-yangtze-02",
    mode: "replace",
    index: 1,
    title: "File:Bridge across the Yangtze - panoramio.jpg"
  },
  {
    pageKey: "section-yangtze-07",
    mode: "replace",
    index: 2,
    title: "File:Beihai-Silver-Beach-2007-08-27.jpg"
  },
  {
    pageKey: "section-yangtze-08",
    mode: "replace",
    index: 2,
    title: "File:YangtzeCruise.jpg"
  },
  {
    pageKey: "section-east-west-01",
    mode: "replace",
    index: 1,
    title: "File:Upper Hunza (Gojal).jpg"
  },
  {
    pageKey: "section-east-west-01",
    mode: "replace",
    index: 2,
    title: "File:The Curves of Silk Route - Karakoram Highway on way to Khunjerab Pass.jpg"
  },
  {
    pageKey: "section-east-west-02",
    mode: "replace",
    index: 1,
    title: "File:Tsaidam1.jpg"
  },
  {
    pageKey: "section-east-west-02",
    mode: "replace",
    index: 2,
    title: "File:柴达木盆地 chaidamu basin - panoramio.jpg"
  },
  {
    pageKey: "section-east-west-04",
    mode: "replace",
    index: 1,
    title: "File:Part of Qinling mountains.jpg"
  },
  {
    pageKey: "section-east-west-04",
    mode: "replace",
    index: 2,
    title: "File:The mountain in Jianmenguan.jpg"
  },
  {
    pageKey: "section-east-west-05",
    mode: "replace",
    index: 2,
    title: "File:Part of Qinling mountains.jpg"
  },
  {
    pageKey: "section-east-west-06",
    mode: "replace",
    index: 1,
    title: "File:Songhua River in Harbin 2.jpg"
  },
  {
    pageKey: "section-east-west-06",
    mode: "replace",
    index: 2,
    title: "File:Frozen Songhua River.jpg"
  },
  {
    pageKey: "section-east-west-08",
    mode: "replace",
    index: 2,
    title: "File:Amur River and Heihe.jpg"
  },
  {
    pageKey: "section-south-north-01",
    mode: "replace",
    index: 2,
    title: "File:Xiaoqikong.JPG"
  },
  {
    pageKey: "section-south-north-02",
    mode: "replace",
    index: 1,
    title: "File:Sunset (256943977).jpeg"
  },
  {
    pageKey: "section-south-north-02",
    mode: "replace",
    index: 2,
    title: "File:Beihai-Silver-Beach-2007-08-27.jpg"
  },
  {
    pageKey: "section-south-north-04",
    mode: "replace",
    index: 1,
    title: "File:Huangshan - Steps to Heaven.jpg"
  },
  {
    pageKey: "section-south-north-04",
    mode: "replace",
    index: 2,
    title: "File:Cliffs of Sanqing Mountain.jpg"
  },
  {
    pageKey: "section-western-vertical-02",
    mode: "replace",
    index: 2,
    title: "File:Meili Snow Mountain, Deqin County, Yunnan.jpg"
  },
  {
    pageKey: "section-western-vertical-03",
    mode: "replace",
    index: 1,
    title: "File:Litang Mountains.jpg"
  },
  {
    pageKey: "section-western-vertical-03",
    mode: "replace",
    index: 2,
    title: "File:Minya Konka Northwest Ridge.JPG"
  },
  {
    pageKey: "section-western-vertical-04",
    mode: "replace",
    index: 1,
    title: "File:Upper Hunza (Gojal).jpg"
  },
  {
    pageKey: "section-western-vertical-04",
    mode: "replace",
    index: 2,
    title: "File:Karakoram Landscapes and scenery.jpg"
  },
  {
    pageKey: "section-western-vertical-06",
    mode: "replace",
    index: 2,
    title: "File:Taklamakan desert.jpg"
  },
  {
    pageKey: "section-western-vertical-08",
    mode: "replace",
    index: 1,
    title: "File:Outlet from Kanas Lake at the Xinjiang Kanas National Geopark.jpg"
  },
  {
    pageKey: "section-western-vertical-08",
    mode: "replace",
    index: 2,
    title: "File:View from the road into Xinjiang Kanas National Geopark.jpg"
  },
  {
    pageKey: "section-central-vertical-03",
    mode: "replace",
    index: 1,
    title: "File:00 Xichang Qionghai Lake.jpg"
  },
  {
    pageKey: "section-central-vertical-03",
    mode: "replace",
    index: 2,
    title: "File:Panoramic view of the confluence of Yalong River & Jinsha River.jpg"
  },
  {
    pageKey: "section-central-vertical-04",
    mode: "replace",
    index: 1,
    title: "File:Litang Mountains.jpg"
  },
  {
    pageKey: "section-south-china-04",
    mode: "append",
    title: "File:Huangguoshu Waterfall - Pixabay.jpg"
  },
  {
    pageKey: "section-south-china-06",
    mode: "append",
    title: "File:Moli Waterfall in Ruili.jpg"
  },
  {
    pageKey: "section-south-china-02",
    mode: "replace",
    index: 1,
    title: "File:Huangshan - Steps to Heaven.jpg"
  },
  {
    pageKey: "topic-tarim-kunlun-oasis",
    mode: "replace",
    index: 1,
    title: "File:Tarim Desert Highway - Desert poplars, Xinjiang, China.jpg"
  },
  {
    pageKey: "topic-tarim-kunlun-oasis",
    mode: "replace",
    index: 2,
    title: "File:Taklamakan desert.jpg"
  },
  {
    pageKey: "topic-hexi-corridor",
    mode: "replace",
    index: 1,
    title: "File:Zhangye Danxia.JPG"
  },
  {
    pageKey: "topic-hexi-corridor",
    mode: "replace",
    index: 2,
    title: "File:Great Wall at Jiayuguan.jpg"
  },
  {
    pageKey: "topic-gannan-gateway",
    mode: "replace",
    index: 1,
    title: "File:Sangke grassland.jpg"
  },
  {
    pageKey: "topic-gannan-gateway",
    mode: "replace",
    index: 2,
    title: "File:甘南藏族自治州Rerdaba grassland - panoramio.jpg"
  },
  {
    pageKey: "topic-western-sichuan-highlands",
    mode: "replace",
    index: 1,
    title: "File:Minya Konka Northwest Ridge.JPG"
  },
  {
    pageKey: "topic-western-sichuan-highlands",
    mode: "replace",
    index: 2,
    title: "File:Litang Mountains.jpg"
  },
  {
    pageKey: "topic-xu-xiake-yunnan",
    mode: "replace",
    index: 1,
    title: "File:Yuanyang sunset rice terraced mountain.jpg"
  },
  {
    pageKey: "topic-xu-xiake-yunnan",
    mode: "replace",
    index: 2,
    title: "File:Erhai Lake Dali 01.JPG"
  },
  {
    pageKey: "topic-northern-xinjiang",
    mode: "replace",
    index: 1,
    title: "File:LakeKanas2.jpg"
  },
  {
    pageKey: "topic-northern-xinjiang",
    mode: "replace",
    index: 2,
    title: "File:喀纳斯湖Q30028182.jpg"
  }
];

const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
manifest.source = combinedSource(manifest);

for (const repair of repairs) {
  const page = manifest.pages.find((item) => item.key === repair.pageKey);
  if (!page) throw new Error(`Unknown page key: ${repair.pageKey}`);
  if (repair.mode === "append" && page.photos.length >= manifest.photosPerPage) {
    console.log(`SKIP ${page.key}: already complete`);
    continue;
  }
  if (repair.mode === "replace" && page.photos[repair.index - 1]?.commonsTitle === repair.title) {
    console.log(`SKIP ${page.key}/${String(repair.index).padStart(2, "0")}: already repaired`);
    continue;
  }

  const candidate = await commonsFile(repair.title);
  if (!candidate) {
    console.warn(`MISS ${repair.title}`);
    continue;
  }

  const index = repair.mode === "replace" ? repair.index : page.photos.length + 1;
  const photo = await downloadPhoto(page.key, index, candidate);
  if (!photo) {
    console.warn(`FAIL ${repair.title}`);
    continue;
  }

  if (repair.mode === "replace") {
    page.photos[index - 1] = photo;
  } else {
    page.photos.push(photo);
  }
  page.status = page.photos.length >= manifest.photosPerPage ? "ok" : page.photos.length ? "partial" : "missing";
  console.log(`${repair.mode.toUpperCase()} ${page.key}/${String(index).padStart(2, "0")} ${photo.title}`);
  await sleep(350);
}

manifest.generatedAt = new Date().toISOString();

await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(new URL("PHOTO_CREDITS.md", outputRoot), creditsMarkdown(manifest));
await writeFile(new URL("MISSING_PHOTOS.md", outputRoot), missingMarkdown(manifest));

async function commonsFile(title) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: String(thumbWidth),
    origin: "*"
  });
  const response = await retryFetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "user-agent": userAgent }
  });
  if (!response.ok) throw new Error(`Commons API ${response.status} for ${title}`);
  const json = await response.json();
  const page = Object.values(json.query?.pages ?? {})[0];
  const imageinfo = page?.imageinfo?.[0];
  if (!page || !imageinfo) return null;
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

async function downloadPhoto(pageKey, index, candidate) {
  const pageDir = new URL(`${pageKey}/`, outputRoot);
  await mkdir(pageDir, { recursive: true });
  const response = await retryFetch(candidate.downloadUrl, { headers: { "user-agent": userAgent } });
  if (!response.ok) {
    console.warn(`Download ${response.status} ${candidate.title}`);
    return null;
  }
  const contentType = response.headers.get("content-type") ?? candidate.mime ?? "image/jpeg";
  if (!contentType.startsWith("image/")) return null;
  const extension = extensionFor(contentType, candidate.downloadUrl);
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
    query: "curated Commons repair"
  };
}

async function retryFetch(url, options) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, options);
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === 4) return response;
    const retryAfter = Number.parseFloat(response.headers.get("retry-after") ?? "");
    const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : attempt * 5000;
    console.warn(`Retry ${attempt}/3 after ${response.status}; waiting ${Math.round(delay)}ms`);
    await sleep(delay);
  }
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

function combinedSource(data) {
  const hasCommons = data.pages.some((page) =>
    page.photos.some((photo) => photo.sourceUrl?.includes("commons.wikimedia.org"))
  );
  const hasOpenverse = data.pages.some((page) =>
    page.photos.some((photo) => photo.sourceUrl && !photo.sourceUrl.includes("commons.wikimedia.org"))
  );
  if (hasCommons && hasOpenverse) return "Openverse API and Wikimedia Commons API";
  if (hasOpenverse) return "Openverse API";
  return "Wikimedia Commons API";
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

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = new URL("../assets/photos/page-photos/", import.meta.url);
const manifestUrl = new URL("manifest.json", outputRoot);
const thumbWidth = 1600;
const userAgent = "RoadtripChinaPhotoCollector/1.0 (local editorial research)";

const repairs = [
  {
    pageKey: "section-coastal-01",
    mode: "replace",
    index: 1,
    title: "File:Yalu River Broken Bridge 03.jpg"
  },
  {
    pageKey: "section-silk-canal-06",
    mode: "append",
    title: "File:27407-Luoyang, Longmen Grottoes.jpg"
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
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
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

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = new URL("../", import.meta.url);
const outputRoot = new URL("../assets/photos/page-photos/", import.meta.url);
const manifestUrl = new URL("manifest.json", outputRoot);

const replacements = [
  ["index", 2, "section-central-vertical-06", 1],
  ["route-coastal", 1, "section-coastal-04", 1],
  ["route-coastal", 2, "section-coastal-07", 1],
  ["route-yangtze", 1, "section-yangtze-04", 1],
  ["route-yangtze", 2, "section-yangtze-05", 2],

  ["section-silk-canal-02", 1, "route-silk-canal", 1],
  ["section-silk-canal-02", 2, "route-silk-canal", 2],
  ["section-silk-canal-03", 1, "section-silk-canal-04", 1],
  ["section-silk-canal-03", 2, "section-silk-canal-04", 2],
  ["section-silk-canal-05", 2, "section-central-vertical-06", 1],
  ["section-silk-canal-07", 1, "section-south-china-01", 1],
  ["section-silk-canal-07", 2, "section-south-china-01", 2],
  ["section-silk-canal-08", 2, "section-south-china-01", 1],

  ["section-coastal-02", 1, "section-coastal-04", 1],
  ["section-coastal-02", 2, "section-coastal-07", 1],
  ["section-coastal-05", 1, "section-coastal-07", 1],
  ["section-coastal-05", 2, "section-coastal-04", 2],
  ["section-coastal-06", 1, "section-coastal-04", 1],
  ["section-coastal-06", 2, "section-coastal-07", 2],

  ["section-yangtze-01", 1, "section-yangtze-04", 1],
  ["section-yangtze-01", 2, "section-yangtze-05", 1],
  ["section-yangtze-02", 1, "section-yangtze-05", 2],
  ["section-yangtze-02", 2, "section-yangtze-04", 2],
  ["section-yangtze-07", 2, "section-yangtze-06", 1],
  ["section-yangtze-08", 2, "section-yangtze-06", 2],

  ["section-east-west-01", 1, "route-silk-canal", 1],
  ["section-east-west-01", 2, "route-silk-canal", 2],
  ["section-east-west-02", 1, "section-central-vertical-05", 2],
  ["section-east-west-02", 2, "section-central-vertical-05", 1],
  ["section-east-west-03", 1, "section-central-vertical-06", 1],
  ["section-east-west-03", 2, "section-central-vertical-06", 2],
  ["section-east-west-04", 1, "section-silk-canal-04", 1],
  ["section-east-west-04", 2, "section-silk-canal-04", 2],
  ["section-east-west-05", 1, "topic-taihang-eight-passes", 1],
  ["section-east-west-05", 2, "topic-taihang-eight-passes", 2],
  ["section-east-west-06", 1, "section-east-west-07", 1],
  ["section-east-west-06", 2, "section-east-west-07", 2],
  ["section-east-west-08", 2, "section-south-north-06", 2],

  ["section-south-north-01", 2, "section-western-vertical-01", 1],
  ["section-south-north-02", 1, "section-south-china-05", 1],
  ["section-south-north-02", 2, "section-south-china-05", 2],
  ["section-south-north-04", 1, "section-south-china-02", 2],
  ["section-south-north-04", 2, "section-south-china-01", 1],

  ["section-western-vertical-02", 2, "route-western-vertical", 1],
  ["section-western-vertical-03", 1, "section-western-vertical-05", 1],
  ["section-western-vertical-03", 2, "section-western-vertical-05", 2],
  ["section-western-vertical-04", 1, "route-western-vertical", 1],
  ["section-western-vertical-04", 2, "route-western-vertical", 2],
  ["section-western-vertical-06", 2, "route-silk-canal", 1],
  ["section-western-vertical-08", 1, "topic-northern-xinjiang", 1],
  ["section-western-vertical-08", 2, "topic-northern-xinjiang", 2],

  ["section-central-vertical-03", 1, "section-central-vertical-02", 1],
  ["section-central-vertical-03", 2, "section-central-vertical-05", 2],
  ["section-central-vertical-04", 1, "route-western-vertical", 1],
  ["section-south-china-02", 1, "section-south-china-02", 2],

  ["topic-tarim-kunlun-oasis", 1, "route-silk-canal", 1],
  ["topic-tarim-kunlun-oasis", 2, "route-silk-canal", 2],
  ["topic-hexi-corridor", 1, "section-central-vertical-06", 1],
  ["topic-hexi-corridor", 2, "section-central-vertical-06", 2],
  ["topic-gannan-gateway", 1, "section-silk-canal-04", 1],
  ["topic-gannan-gateway", 2, "section-silk-canal-04", 2],
  ["topic-western-sichuan-highlands", 1, "route-western-vertical", 1],
  ["topic-western-sichuan-highlands", 2, "route-western-vertical", 2],
  ["topic-xu-xiake-yunnan", 1, "section-south-china-05", 1],
  ["topic-xu-xiake-yunnan", 2, "section-south-china-07", 1],

  ["route-east-west", 1, "section-south-north-06", 1],
  ["route-east-west", 2, "section-south-north-06", 2],
  ["route-south-north", 1, "section-south-china-04", 1],
  ["route-coastal", 2, "section-coastal-04", 2],
  ["section-silk-canal-08", 1, "section-south-china-01", 2],
  ["section-coastal-02", 2, "section-coastal-04", 2],
  ["section-coastal-05", 1, "section-coastal-04", 1],
  ["section-coastal-06", 2, "section-coastal-04", 2],
  ["section-coastal-07", 1, "section-coastal-04", 1],
  ["section-coastal-07", 2, "section-coastal-04", 2],
  ["section-yangtze-07", 1, "section-yangtze-06", 2],
  ["section-east-west-06", 1, "section-south-north-06", 1],
  ["section-east-west-06", 2, "section-south-north-06", 2],
  ["section-east-west-07", 1, "section-south-north-06", 1],
  ["section-east-west-07", 2, "section-south-north-06", 2],
  ["section-south-north-04", 1, "section-south-china-07", 1],
  ["section-south-north-07", 1, "section-south-north-07", 2],
  ["section-western-vertical-01", 2, "section-western-vertical-01", 1],
  ["section-western-vertical-02", 1, "route-western-vertical", 2],
  ["section-western-vertical-03", 1, "route-western-vertical", 1],
  ["section-western-vertical-03", 2, "route-western-vertical", 2],
  ["section-western-vertical-05", 1, "route-western-vertical", 1],
  ["section-western-vertical-05", 2, "route-western-vertical", 2],
  ["section-south-china-02", 1, "route-south-china", 1],
  ["section-south-china-02", 2, "route-south-china", 2]
];

const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
const pageByKey = new Map(manifest.pages.map((page) => [page.key, page]));

for (const [targetKey, targetIndex, sourceKey, sourceIndex] of replacements) {
  const targetPage = pageByKey.get(targetKey);
  const sourcePage = pageByKey.get(sourceKey);
  if (!targetPage) throw new Error(`Unknown target page: ${targetKey}`);
  if (!sourcePage) throw new Error(`Unknown source page: ${sourceKey}`);
  const sourcePhoto = sourcePage.photos[sourceIndex - 1];
  if (!sourcePhoto?.file) {
    throw new Error(`Missing source photo: ${sourceKey}/${sourceIndex}`);
  }

  const extension = path.extname(sourcePhoto.file) || ".jpg";
  const filename = `${String(targetIndex).padStart(2, "0")}${extension}`;
  const targetFile = path.posix.join("assets/photos/page-photos", targetKey, filename);
  await mkdir(new URL(`${targetKey}/`, outputRoot), { recursive: true });
  await copyFile(new URL(sourcePhoto.file, projectRoot), new URL(targetFile, projectRoot));

  targetPage.photos[targetIndex - 1] = {
    ...sourcePhoto,
    role: targetIndex === 1 ? "primary" : "alternate",
    file: targetFile,
    query: `scenic local curation from ${sourceKey}/${String(sourceIndex).padStart(2, "0")}`
  };
  targetPage.status = targetPage.photos.length >= manifest.photosPerPage ? "ok" : "partial";
  console.log(`CURATED ${targetKey}/${String(targetIndex).padStart(2, "0")} <- ${sourceKey}/${String(sourceIndex).padStart(2, "0")}`);
}

manifest.generatedAt = new Date().toISOString();
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(new URL("PHOTO_CREDITS.md", outputRoot), creditsMarkdown(manifest));
await writeFile(new URL("MISSING_PHOTOS.md", outputRoot), missingMarkdown(manifest));

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
    if (!page.photos.length) lines.push("- No suitable image downloaded.");
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
  if (missing.length) {
    lines.push("## Missing");
    lines.push(...missing.map((page) => `- ${page.key}: ${page.title}`), "");
  }
  if (partial.length) {
    lines.push("## Partial");
    lines.push(...partial.map((page) => `- ${page.key}: ${page.title} (${page.photos.length}/${data.photosPerPage})`), "");
  }
  return `${lines.join("\n")}\n`;
}

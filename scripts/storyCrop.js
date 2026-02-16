#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const TIMELINE_MANIFEST_PATH = path.join(ROOT, "photos", "timeline-photos", "manifest.json");
const CROP_DIR = path.join(ROOT, "public", "images", "story-crops");
const CROP_REPORT_PATH = path.join(CROP_DIR, "manifest.json");
const DEFAULT_FOCAL_X = 0.5;
const DEFAULT_FOCAL_Y = 0.28;
const COL_TO_ROW_RATIO = 0.78;
const OUTPUT_EDGE = 1600;

const LAYOUT_BY_YEAR = {
  1995: { cols: 3, rows: 1 },
  1998: { cols: 6, rows: 2 },
  2001: { cols: 3, rows: 1 },
  2008: { cols: 3, rows: 1 },
  2013: { cols: 3, rows: 1 },
  2016: { cols: 4, rows: 2 },
  2020: { cols: 4, rows: 1 },
  2021: { cols: 4, rows: 2 },
  2023: { cols: 4, rows: 1 },
  2024: { cols: 6, rows: 2 },
  2025: { cols: 3, rows: 2 },
  2027: { cols: 3, rows: 2 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value, fallback = 0.5) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return clamp(numeric, 0, 1);
}

function yearFromEntry(entry) {
  const direct = Number(entry && entry.year);
  if (Number.isFinite(direct)) return Math.floor(direct);
  const file = String(entry && entry.file ? entry.file : "");
  const match = file.match(/(?:^|[^0-9])((?:19|20)\d{2})(?!\d)/);
  return match ? Number(match[1]) : NaN;
}

function layoutAspect(year) {
  const layout = LAYOUT_BY_YEAR[year] || { cols: 3, rows: 1 };
  const raw = (layout.cols * COL_TO_ROW_RATIO) / layout.rows;
  return clamp(raw, 1.15, 3);
}

function computeCropRect(sourceWidth, sourceHeight, targetAspect, focalX, focalY) {
  let cropWidth = sourceWidth;
  let cropHeight = Math.round(cropWidth / targetAspect);

  if (cropHeight > sourceHeight) {
    cropHeight = sourceHeight;
    cropWidth = Math.round(cropHeight * targetAspect);
  }

  const centerX = focalX * sourceWidth;
  const centerY = focalY * sourceHeight;

  let left = Math.round(centerX - cropWidth / 2);
  let top = Math.round(centerY - cropHeight / 2);

  left = clamp(left, 0, Math.max(0, sourceWidth - cropWidth));
  top = clamp(top, 0, Math.max(0, sourceHeight - cropHeight));

  return { left, top, width: cropWidth, height: cropHeight };
}

function outputSizeForAspect(aspect) {
  if (aspect >= 1) {
    return { width: OUTPUT_EDGE, height: Math.max(320, Math.round(OUTPUT_EDGE / aspect)) };
  }
  return { width: Math.max(320, Math.round(OUTPUT_EDGE * aspect)), height: OUTPUT_EDGE };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (_error) {
    return false;
  }
}

async function main() {
  const manifestRaw = await fs.readFile(TIMELINE_MANIFEST_PATH, "utf8");
  const manifestPayload = JSON.parse(manifestRaw);
  const rows = Array.isArray(manifestPayload.timeline) ? manifestPayload.timeline : [];

  if (!rows.length) {
    throw new Error("No timeline rows found in photos/timeline-photos/manifest.json");
  }

  await ensureDir(CROP_DIR);

  const sortedRows = [...rows]
    .map((row) => ({ ...row, year: yearFromEntry(row) }))
    .filter((row) => Number.isFinite(row.year))
    .sort((a, b) => a.year - b.year);

  const reportEntries = [];

  for (const row of sortedRows) {
    const sourceRel = String(row.file || "").trim();
    const sourcePath = path.join(ROOT, "photos", "timeline-photos", sourceRel);
    if (!(await fileExists(sourcePath))) {
      throw new Error(`Missing source story image: ${sourceRel}`);
    }

    const metadata = await sharp(sourcePath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Unable to read dimensions for ${sourceRel}`);
    }

    const year = Number(row.year);
    const focalX = clamp01(row.focalX, DEFAULT_FOCAL_X);
    const focalY = clamp01(row.focalY, DEFAULT_FOCAL_Y);
    const aspect = layoutAspect(year);
    const cropRect = computeCropRect(metadata.width, metadata.height, aspect, focalX, focalY);
    const outSize = outputSizeForAspect(aspect);
    const outputFile = `${year}.jpg`;
    const outputPath = path.join(CROP_DIR, outputFile);

    await sharp(sourcePath)
      .extract(cropRect)
      .resize(outSize.width, outSize.height, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({
        quality: 88,
        chromaSubsampling: "4:4:4",
        mozjpeg: true,
      })
      .toFile(outputPath);

    reportEntries.push({
      year,
      sourceFile: sourceRel,
      outputFile: `/public/images/story-crops/${outputFile}`,
      sourceWidth: metadata.width,
      sourceHeight: metadata.height,
      focalX,
      focalY,
      targetAspect: Number(aspect.toFixed(4)),
      cropRect,
      outputWidth: outSize.width,
      outputHeight: outSize.height,
      allowNoFace: Boolean(row.allowNoFace || year === 2027),
      facesDetected: row.allowNoFace || year === 2027 ? 0 : 1,
    });
  }

  const reportByYear = new Map(reportEntries.map((entry) => [entry.year, entry]));
  const timelineWithCropData = sortedRows.map((row) => {
    const report = reportByYear.get(Number(row.year));
    const focalX = clamp01(row.focalX, DEFAULT_FOCAL_X);
    const focalY = clamp01(row.focalY, DEFAULT_FOCAL_Y);
    return {
      ...row,
      year: Number(row.year),
      focalX: Number(focalX.toFixed(4)),
      focalY: Number(focalY.toFixed(4)),
      allowNoFace: Boolean(row.allowNoFace || Number(row.year) === 2027),
      mosaicFile: report ? report.outputFile : row.mosaicFile || "",
    };
  });

  manifestPayload.timeline = timelineWithCropData;
  await fs.writeFile(TIMELINE_MANIFEST_PATH, `${JSON.stringify(manifestPayload, null, 2)}\n`, "utf8");

  const cropReport = {
    generatedAt: new Date().toISOString(),
    defaults: {
      focalX: DEFAULT_FOCAL_X,
      focalY: DEFAULT_FOCAL_Y,
      colToRowRatio: COL_TO_ROW_RATIO,
    },
    entries: reportEntries,
  };
  await fs.writeFile(CROP_REPORT_PATH, `${JSON.stringify(cropReport, null, 2)}\n`, "utf8");

  console.log(`Created ${reportEntries.length} story crops in ${path.relative(ROOT, CROP_DIR)}`);
}

main().catch((error) => {
  console.error("[story:crops] failed:", error && error.message ? error.message : error);
  process.exitCode = 1;
});

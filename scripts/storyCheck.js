#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TIMELINE_MANIFEST_PATH = path.join(ROOT, "photos", "timeline-photos", "manifest.json");
const CROP_REPORT_PATH = path.join(ROOT, "public", "images", "story-crops", "manifest.json");
const DEFAULT_FOCAL_X = 0.5;
const DEFAULT_FOCAL_Y = 0.28;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value, fallback = 0.5) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return clamp(numeric, 0, 1);
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
  const timelinePayload = JSON.parse(manifestRaw);
  const rows = Array.isArray(timelinePayload.timeline) ? timelinePayload.timeline : [];
  if (!rows.length) throw new Error("Timeline manifest has no rows.");

  const cropRaw = await fs.readFile(CROP_REPORT_PATH, "utf8");
  const cropPayload = JSON.parse(cropRaw);
  const cropRows = Array.isArray(cropPayload.entries) ? cropPayload.entries : [];
  const cropByYear = new Map(cropRows.map((row) => [Number(row.year), row]));

  const errors = [];
  const warnings = [];

  const sortedYears = rows
    .map((row) => Number(row.year))
    .filter((year) => Number.isFinite(year));
  const chronological = sortedYears.every((year, index) => index === 0 || sortedYears[index - 1] <= year);
  if (!chronological) {
    errors.push("Timeline manifest is not sorted chronologically.");
  }

  for (const row of rows) {
    const year = Number(row.year);
    if (!Number.isFinite(year)) {
      errors.push(`Row missing numeric year: ${JSON.stringify(row)}`);
      continue;
    }

    const focalX = clamp01(row.focalX, DEFAULT_FOCAL_X);
    const focalY = clamp01(row.focalY, DEFAULT_FOCAL_Y);
    const allowNoFace = Boolean(row.allowNoFace || year === 2027);
    const mosaicFile = String(row.mosaicFile || "").trim();

    if (!mosaicFile) {
      errors.push(`${year}: missing mosaicFile.`);
      continue;
    }

    const localMosaicPath = path.join(ROOT, mosaicFile.replace(/^\//, ""));
    if (!(await fileExists(localMosaicPath))) {
      errors.push(`${year}: mosaic crop not found at ${mosaicFile}`);
    }

    const cropMeta = cropByYear.get(year);
    if (!cropMeta) {
      errors.push(`${year}: missing crop metadata in public/images/story-crops/manifest.json`);
      continue;
    }

    const cropRect = cropMeta.cropRect;
    const sourceWidth = Number(cropMeta.sourceWidth);
    const sourceHeight = Number(cropMeta.sourceHeight);
    if (!cropRect || !Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight)) {
      errors.push(`${year}: invalid crop metadata dimensions.`);
      continue;
    }

    const anchorX = focalX * sourceWidth;
    const anchorY = focalY * sourceHeight;
    const relX = (anchorX - cropRect.left) / Math.max(1, cropRect.width);
    const relY = (anchorY - cropRect.top) / Math.max(1, cropRect.height);

    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) {
      errors.push(`${year}: focal anchor falls outside crop rect.`);
      continue;
    }

    if (!allowNoFace) {
      if (focalX < 0.08 || focalX > 0.92 || focalY < 0.08 || focalY > 0.92) {
        errors.push(`${year}: focal point too close to image edge (x=${focalX.toFixed(3)}, y=${focalY.toFixed(3)}).`);
      }
      if (relX < 0.05 || relX > 0.95 || relY < 0.05 || relY > 0.95) {
        errors.push(`${year}: crop likely cuts faces (anchor at ${relX.toFixed(3)}, ${relY.toFixed(3)}).`);
      }
    } else if (cropMeta.facesDetected > 0) {
      warnings.push(`${year}: allowNoFace=true but facesDetected=${cropMeta.facesDetected}.`);
    }
  }

  if (warnings.length) {
    console.warn("[story:check] warnings:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length) {
    console.error("[story:check] failed:");
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`[story:check] PASS (${rows.length} timeline items)`);
}

main().catch((error) => {
  console.error("[story:check] failed:", error && error.message ? error.message : error);
  process.exitCode = 1;
});

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "photos", "timeline-photos", "manifest.json");
const SOURCE_DIR = path.join(ROOT, "photos", "timeline-photos");
const OUTPUT_DIR = path.join(ROOT, "public", "our-story-normalized");
const PUBLIC_DIR = path.join(ROOT, "public", "our-story");
const MAX_WIDTH = 1600;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Timeline manifest not found at ${MANIFEST_PATH}`);
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const timeline = Array.isArray(parsed.timeline) ? parsed.timeline : [];
  return { parsed, timeline };
}

function safeStem(inputPath) {
  const stem = path.basename(inputPath, path.extname(inputPath));
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function resolveSourcePath(fileRef) {
  const value = String(fileRef || "").trim();
  if (!value) return "";

  if (value.startsWith("/")) {
    if (value.startsWith("/our-story-normalized/")) {
      return path.join(OUTPUT_DIR, path.basename(value));
    }
    if (value.startsWith("/our-story/")) {
      return path.join(PUBLIC_DIR, path.basename(value));
    }
    const absolute = path.join(ROOT, value.replace(/^\//, ""));
    return absolute;
  }

  return path.join(SOURCE_DIR, value);
}

async function normalizeEntry(entry, index) {
  const sourceFileRef = String(entry.originalFile || entry.file || "").trim();
  if (!sourceFileRef) return entry;

  const sourcePath = resolveSourcePath(sourceFileRef);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source image missing for timeline entry ${index + 1}: ${sourcePath}`);
  }

  const stem = safeStem(sourceFileRef);
  const yearPrefix = Number.isFinite(Number(entry.year)) && !new RegExp(`^${entry.year}[-_]`).test(stem) ? `${entry.year}-` : "";
  const outputName = `${yearPrefix}${stem}.webp`;
  const outputPath = path.join(OUTPUT_DIR, outputName);
  const publicPath = path.join(PUBLIC_DIR, outputName);
  const publicRef = `/public/our-story/${outputName}`;

  const buffer = await sharp(sourcePath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();

  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(publicPath, buffer);

  return {
    ...entry,
    originalFile: entry.originalFile || sourceFileRef,
    file: publicRef,
  };
}

async function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(PUBLIC_DIR);
  const { parsed, timeline } = loadManifest();
  if (!timeline.length) {
    console.log("No timeline entries found. Nothing to normalize.");
    return;
  }

  const nextTimeline = [];
  for (let i = 0; i < timeline.length; i += 1) {
    // Keep ordering stable so year navigation remains unchanged.
    const normalized = await normalizeEntry(timeline[i], i);
    nextTimeline.push(normalized);
    console.log(`normalized ${timeline[i].file} -> ${normalized.file}`);
  }

  const nextManifest = { ...parsed, timeline: nextTimeline };
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");
  console.log(`updated manifest: ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

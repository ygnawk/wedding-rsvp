#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "photos", "timeline-photos", "manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error(`[story-assets] Missing manifest: ${manifestPath}`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (error) {
  console.error("[story-assets] Invalid JSON in manifest:", error.message);
  process.exit(1);
}

const timeline = Array.isArray(manifest?.timeline) ? manifest.timeline : [];
const errors = [];

function resolveAssetPath(src) {
  const value = String(src || "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return { error: `Absolute URL not allowed: ${value}` };

  if (value.startsWith("/our-story/")) {
    return {
      path: path.join(root, "public", "our-story-normalized", value.replace(/^\/our-story\//, "")),
    };
  }
  if (value.startsWith("/our-story-normalized/")) {
    return { error: `Use /our-story/... path, not legacy /our-story-normalized/... (${value})` };
  }
  if (value.startsWith("/public/")) {
    return { path: path.join(root, "public", value.replace(/^\/public\//, "")) };
  }
  if (value.startsWith("/photos/")) {
    return { path: path.join(root, value.replace(/^\//, "")) };
  }
  if (value.startsWith("/")) {
    return { error: `Unexpected absolute path: ${value}` };
  }

  return { path: path.join(root, "photos", "timeline-photos", value) };
}

timeline.forEach((entry, index) => {
  if (!entry || typeof entry !== "object") return;
  ["file", "mosaicFile"].forEach((field) => {
    if (!entry[field]) return;
    const resolved = resolveAssetPath(entry[field]);
    if (!resolved) return;
    if (resolved.error) {
      errors.push(`[story-assets] ${field} (index ${index}): ${resolved.error}`);
      return;
    }
    if (!fs.existsSync(resolved.path)) {
      errors.push(`[story-assets] ${field} (index ${index}): missing ${resolved.path}`);
    }
  });
});

if (errors.length) {
  errors.forEach((msg) => console.error(msg));
  process.exit(1);
}

console.log(`[story-assets] OK (${timeline.length} entries)`);

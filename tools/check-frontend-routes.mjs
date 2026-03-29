#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function checkArrivalsShell() {
  const html = read("arrivals/index.html");
  assert(html.includes('id="arrivals-preview-root"'), "arrivals shell must mount preview root directly");
  assert(!/<iframe\b/i.test(html), "arrivals shell must not include an iframe");
  assert(
    html.includes('type="module" src="/public/arrivals/preview.js?v=20260329-arrivals-direct1"'),
    "arrivals shell must load preview.js directly",
  );
}

function checkArrivalsPreview() {
  const preview = read("public/arrivals/preview.js");
  assert(!preview.includes("world.geojson"), "arrivals preview must not fetch runtime world.geojson");
  assert(
    preview.includes('fetch(url, { cache: "default", signal: controller.signal })'),
    "arrivals preview must use cache-friendly API fetches",
  );
  assert(preview.includes("scheduleMapEnhancementRender"), "arrivals preview must stage map enhancement");
}

function checkGuestWall() {
  const appJs = read("app.js");
  const html = read("guest-wall.html");
  assert(
    html.includes('/app.js?v=20260329-guestwall-perf1'),
    "guest-wall page must reference the cache-busted guest-wall bundle version",
  );
  assert(!appJs.includes('img.loading = context === "detail" ? "eager" : "lazy";'), "guest-wall must not rely on native lazy loading");
  assert(!appJs.includes("w1600"), "guest-wall board path must not use oversized w1600 candidates");
  assert(appJs.includes("GUEST_WALL_BOARD_IMAGE_MAX_CANDIDATES = 2"), "guest-wall board candidates must stay capped");
}

function main() {
  checkArrivalsShell();
  checkArrivalsPreview();
  checkGuestWall();
  console.log("[frontend-routes] OK");
}

main();

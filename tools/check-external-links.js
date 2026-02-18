#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const dataDir = path.join(root, "data");
const CHECK_TIMEOUT_MS = 10000;
const USER_AGENT = "WeddingExternalLinkAudit/1.0";

function readFileSafe(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isMapsDomainHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return (
    host.includes("google.com") ||
    host.includes("maps.google.") ||
    host.includes("maps.apple.com") ||
    host.includes("openstreetmap.org") ||
    host.includes("bing.com")
  );
}

function parseAbsoluteUrl(url) {
  const value = String(url || "").trim();
  if (!value) return { ok: false, reason: "empty-url" };
  try {
    const parsed = new URL(value);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return { ok: false, reason: `unsupported-protocol:${parsed.protocol}` };
    }
    return { ok: true, url: parsed.toString(), parsed };
  } catch (_) {
    return { ok: false, reason: "invalid-url-format" };
  }
}

function inferSectionName(html, index) {
  const windowStart = Math.max(0, index - 3500);
  const chunk = html.slice(windowStart, index);
  const sectionMatches = [...chunk.matchAll(/<section[^>]*id="([^"]+)"/gi)];
  if (!sectionMatches.length) return "index";
  return sectionMatches[sectionMatches.length - 1][1];
}

function inferCardTitle(html, index) {
  const windowStart = Math.max(0, index - 1800);
  const chunk = html.slice(windowStart, index);
  const headingMatches = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
  if (!headingMatches.length) return "";
  const raw = headingMatches[headingMatches.length - 1][1].replace(/<[^>]+>/g, " ");
  return normalizeWhitespace(raw);
}

function extractIndexAnchors() {
  const html = readFileSafe(indexPath);
  if (!html) return [];
  const regex = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const records = [];
  let match;
  while ((match = regex.exec(html))) {
    const href = String(match[1] || "").trim();
    if (!/^https?:\/\//i.test(href)) continue;
    const text = normalizeWhitespace(String(match[2] || "").replace(/<[^>]+>/g, " "));
    const section = inferSectionName(html, match.index);
    const cardTitle = inferCardTitle(html, match.index);
    const loweredText = text.toLowerCase();
    const field = loweredText === "website" ? "website" : loweredText.includes("maps") ? "maps" : "link";
    records.push({
      source: "index.html",
      section,
      itemName: cardTitle || section,
      field,
      label: text || field,
      url: href,
    });
  }
  return records;
}

function evalDataFile(filePath) {
  const source = readFileSafe(filePath);
  if (!source) return null;
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: filePath });
  return context.window;
}

function extractDataUrls() {
  const records = [];
  const foodPath = path.join(dataDir, "beijing-food.js");
  const hotelsPath = path.join(dataDir, "hotels.js");

  const foodWindow = evalDataFile(foodPath);
  const foodPlaces = Array.isArray(foodWindow?.BEIJING_FOOD_PLACES) ? foodWindow.BEIJING_FOOD_PLACES : [];
  foodPlaces.forEach((place) => {
    const name = normalizeWhitespace(place?.name_en || place?.id || "food-place");
    const mapsUrl = normalizeWhitespace(place?.maps_url);
    const dianpingUrl = normalizeWhitespace(place?.dianping_url);
    if (mapsUrl) {
      records.push({
        source: "data/beijing-food.js",
        section: "makan",
        itemName: name,
        field: "maps",
        label: "maps_url",
        url: mapsUrl,
      });
    }
    if (dianpingUrl) {
      records.push({
        source: "data/beijing-food.js",
        section: "makan",
        itemName: name,
        field: "website",
        label: "dianping_url",
        url: dianpingUrl,
      });
    }
  });

  const hotelsWindow = evalDataFile(hotelsPath);
  const hotels = Array.isArray(hotelsWindow?.HOTELS_DATA) ? hotelsWindow.HOTELS_DATA : [];
  hotels.forEach((hotel) => {
    const name = normalizeWhitespace(hotel?.name || hotel?.id || "hotel");
    const bookUrl = normalizeWhitespace(hotel?.bookUrl);
    const directionsUrl = normalizeWhitespace(hotel?.directionsUrl);
    if (bookUrl) {
      records.push({
        source: "data/hotels.js",
        section: "where-to-stay",
        itemName: name,
        field: "website",
        label: "bookUrl",
        url: bookUrl,
      });
    }
    if (directionsUrl) {
      records.push({
        source: "data/hotels.js",
        section: "where-to-stay",
        itemName: name,
        field: "maps",
        label: "directionsUrl",
        url: directionsUrl,
      });
    }
  });

  return records;
}

function createAbortSignal(timeoutMs) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function requestUrl(url, method) {
  return fetch(url, {
    method,
    redirect: "follow",
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: createAbortSignal(CHECK_TIMEOUT_MS),
  });
}

function classifyHttpResult(status) {
  if (status >= 200 && status <= 399) return "ok";
  // Treat non-2xx/3xx as warnings: many official websites block bot checks
  // while still loading for real browsers.
  return "warn";
}

async function checkUrlHealth(url) {
  let headStatus = null;
  let getStatus = null;
  try {
    const head = await requestUrl(url, "HEAD");
    headStatus = head.status;
    if (head.status >= 200 && head.status <= 399) {
      return {
        kind: "ok",
        status: head.status,
        method: "HEAD",
      };
    }
  } catch (error) {
    headStatus = `ERR:${error?.name || "fetch"}`;
  }

  try {
    const get = await requestUrl(url, "GET");
    getStatus = get.status;
    const classified = classifyHttpResult(get.status);
    return {
      kind: classified,
      status: get.status,
      method: "GET",
      note: headStatus ? `HEAD=${headStatus}` : "",
    };
  } catch (error) {
    const name = error?.name || "fetch";
    const message = error?.message || "";
    const isTimeout = name === "TimeoutError" || /timed out|abort/i.test(message);
    return {
      kind: "warn",
      status: isTimeout ? "timeout" : `ERR:${name}`,
      method: "GET",
      note: headStatus ? `HEAD=${headStatus}` : "",
    };
  }
}

function buildCacheKey(url) {
  return String(url || "").trim();
}

async function run() {
  const records = [...extractIndexAnchors(), ...extractDataUrls()];
  if (!records.length) {
    console.log("[external-links] No external links found.");
    return;
  }

  const hardFailures = [];
  const warnings = [];
  const healthCache = new Map();

  const websiteMapGroups = new Map();
  records.forEach((record) => {
    if (record.source !== "index.html") return;
    const key = `${record.section}::${record.itemName}`;
    if (!websiteMapGroups.has(key)) websiteMapGroups.set(key, { itemName: record.itemName, section: record.section });
    const group = websiteMapGroups.get(key);
    if (record.field === "maps") group.maps = record.url;
    if (record.field === "website") group.website = record.url;
  });
  websiteMapGroups.forEach((group) => {
    if (!group.maps || !group.website) return;
    if (String(group.maps).trim() !== String(group.website).trim()) return;
    hardFailures.push({
      source: "index.html",
      section: group.section,
      itemName: group.itemName,
      field: "website",
      label: "Website",
      url: group.website,
      issue: "website-duplicates-maps-url",
    });
  });

  for (const record of records) {
    const parsed = parseAbsoluteUrl(record.url);
    if (!parsed.ok) {
      hardFailures.push({
        ...record,
        issue: parsed.reason,
      });
      continue;
    }

    const protocol = String(parsed.parsed.protocol || "").toLowerCase();
    if (protocol === "http:") {
      warnings.push({
        ...record,
        issue: "http-not-https",
      });
    }

    if (record.field === "website" && isMapsDomainHost(parsed.parsed.hostname)) {
      hardFailures.push({
        ...record,
        issue: "website-points-to-maps-domain",
      });
      continue;
    }

    const cacheKey = buildCacheKey(parsed.url);
    let health = healthCache.get(cacheKey);
    if (!health) {
      health = await checkUrlHealth(parsed.url);
      healthCache.set(cacheKey, health);
    }

    if (health.kind === "hard") {
      hardFailures.push({
        ...record,
        issue: `http-check-failed:${health.status}`,
        method: health.method,
        note: health.note || "",
      });
      continue;
    }
    if (health.kind === "warn") {
      warnings.push({
        ...record,
        issue: `http-warning:${health.status}`,
        method: health.method,
        note: health.note || "",
      });
    }
  }

  const summary = {
    checkedRecords: records.length,
    uniqueUrls: healthCache.size,
    warnings: warnings.length,
    hardFailures: hardFailures.length,
  };

  console.log("[external-links] Summary:", summary);

  if (warnings.length) {
    console.log("[external-links] Warnings:");
    warnings.forEach((item) => {
      console.log(
        `  WARN ${item.issue} | ${item.source} | ${item.section} | ${item.itemName} | ${item.label} | ${item.url}${item.note ? ` | ${item.note}` : ""}`,
      );
    });
  }

  if (hardFailures.length) {
    console.error("[external-links] Hard failures:");
    hardFailures.forEach((item) => {
      console.error(
        `  FAIL ${item.issue} | ${item.source} | ${item.section} | ${item.itemName} | ${item.label} | ${item.url}${item.note ? ` | ${item.note}` : ""}`,
      );
    });
    process.exit(1);
  }

  console.log("[external-links] All hard checks passed.");
}

run().catch((error) => {
  console.error("[external-links] Unexpected error:", error?.stack || error?.message || error);
  process.exit(1);
});

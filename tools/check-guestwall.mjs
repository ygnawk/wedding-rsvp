#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://mikiandyijie-rsvp-api.onrender.com";
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.GUESTWALL_CHECK_TIMEOUT_MS || "15000", 10);

function resolveBaseUrl() {
  const cliArg = process.argv[2];
  const envValue = process.env.GUESTWALL_BASE_URL;
  const raw = String(cliArg || envValue || DEFAULT_BASE_URL).trim();
  return raw.replace(/\/+$/, "");
}

async function fetchJson(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("guestwall-check-timeout"), Math.max(1000, timeoutMs));
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid JSON from ${url}: ${message}`);
    }

    return { response, data, text };
  } finally {
    clearTimeout(timer);
  }
}

function fail(message, context = null) {
  console.error(`[guestwall-check] FAIL ${message}`);
  if (context) {
    try {
      console.error(JSON.stringify(context, null, 2));
    } catch (_error) {
      console.error(String(context));
    }
  }
  process.exit(1);
}

async function main() {
  const baseUrl = resolveBaseUrl();
  const healthUrl = `${baseUrl}/api/guestbook/health`;
  const guestbookUrl = `${baseUrl}/api/guestbook?mode=pinboard&limit=12`;

  console.info(`[guestwall-check] base=${baseUrl}`);

  const health = await fetchJson(healthUrl);
  if (!health.response.ok) {
    fail("health endpoint returned non-2xx", {
      url: healthUrl,
      status: health.response.status,
      body: health.data || health.text,
    });
  }

  const healthData = health.data || {};
  if (healthData.ok !== true || String(healthData.status || "") !== "healthy") {
    fail("health endpoint payload is not healthy", {
      url: healthUrl,
      payload: healthData,
    });
  }

  const guestbook = await fetchJson(guestbookUrl);
  if (!guestbook.response.ok) {
    fail("guestbook endpoint returned non-2xx", {
      url: guestbookUrl,
      status: guestbook.response.status,
      body: guestbook.data || guestbook.text,
    });
  }

  const guestbookData = guestbook.data || {};
  if (guestbookData.ok !== true || !Array.isArray(guestbookData.items)) {
    fail("guestbook payload malformed", {
      url: guestbookUrl,
      payload: guestbookData,
    });
  }

  console.info(
    `[guestwall-check] PASS health=healthy authMode=${healthData.authMode || "unknown"} items=${guestbookData.items.length} stale=${Boolean(guestbookData.stale)}`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
});

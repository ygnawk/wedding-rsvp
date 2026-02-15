const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const RSVP_FILE = path.join(DATA_DIR, "rsvps.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function extractYearPrefix(filename) {
  const match = String(filename || "").match(/(?:^|[^0-9])((?:19|20)\d{2})(?!\d)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function appendRsvp(record) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let existing = [];
  if (fs.existsSync(RSVP_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(RSVP_FILE, "utf8"));
      if (!Array.isArray(existing)) existing = [];
    } catch (_error) {
      existing = [];
    }
  }

  existing.push(record);
  fs.writeFileSync(RSVP_FILE, JSON.stringify(existing, null, 2), "utf8");
}

function safePath(urlPath) {
  const clean = decodeURIComponent((urlPath || "").split("?")[0]);
  const local = clean === "/" ? "/index.html" : clean;
  const resolved = path.normalize(path.join(ROOT, local));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function safeMountedPath(urlPath, mountPath, targetDir) {
  const clean = decodeURIComponent((urlPath || "").split("?")[0]);
  if (!(clean === mountPath || clean.startsWith(`${mountPath}/`))) return null;

  const relative = clean.slice(mountPath.length).replace(/^\/+/, "");
  if (!relative) return null;

  const resolved = path.normalize(path.join(targetDir, relative));
  if (!resolved.startsWith(targetDir)) return null;
  return resolved;
}

function serveStaticFile(res, filePath) {
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  send(res, 200, fs.readFileSync(filePath), mime);
}

const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent((req.url || "/").split("?")[0] || "/");

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (pathname === "/api/rsvp" && req.method === "POST") {
    try {
      const raw = await getRequestBody(req);
      const payload = JSON.parse(raw || "{}");
      appendRsvp(payload);
      send(res, 200, JSON.stringify({ ok: true }), MIME_TYPES[".json"]);
    } catch (error) {
      send(res, 400, JSON.stringify({ ok: false, error: error.message }), MIME_TYPES[".json"]);
    }
    return;
  }

  if (pathname === "/api/rsvp" && req.method === "GET") {
    if (!fs.existsSync(RSVP_FILE)) {
      send(res, 200, "[]", MIME_TYPES[".json"]);
      return;
    }
    send(res, 200, fs.readFileSync(RSVP_FILE, "utf8"), MIME_TYPES[".json"]);
    return;
  }

  if (pathname === "/api/timeline-photos" && req.method === "GET") {
    const timelineDir = path.join(ROOT, "photos", "timeline-photos");
    if (!fs.existsSync(timelineDir)) {
      send(res, 200, JSON.stringify({ ok: true, files: [] }), MIME_TYPES[".json"]);
      return;
    }

    const manifestPath = path.join(timelineDir, "manifest.json");
    let files = [];

    if (fs.existsSync(manifestPath)) {
      try {
        const manifestRaw = fs.readFileSync(manifestPath, "utf8");
        const manifest = JSON.parse(manifestRaw);
        const timeline = Array.isArray(manifest?.timeline) ? manifest.timeline : [];

        files = timeline
          .map((item) => (item && typeof item === "object" ? String(item.file || "").trim() : ""))
          .filter((name) => name && [".jpg", ".jpeg", ".png"].includes(path.extname(name).toLowerCase()))
          .sort((a, b) => {
            const yearA = extractYearPrefix(a);
            const yearB = extractYearPrefix(b);
            if (yearA !== yearB) return yearA - yearB;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
          })
          .map((name) => `/photos/timeline-photos/${encodeURIComponent(name)}`);
      } catch (_error) {
        files = [];
      }
    }

    if (!files.length) {
      files = fs
        .readdirSync(timelineDir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => [".jpg", ".jpeg", ".png"].includes(path.extname(name).toLowerCase()))
        .sort((a, b) => {
          const yearA = extractYearPrefix(a);
          const yearB = extractYearPrefix(b);
          if (yearA !== yearB) return yearA - yearB;
          return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
        })
        .map((name) => `/photos/timeline-photos/${encodeURIComponent(name)}`);
    }

    send(res, 200, JSON.stringify({ ok: true, files }), MIME_TYPES[".json"]);
    return;
  }

  const photosPath = safeMountedPath(req.url || "", "/photos", path.join(ROOT, "photos"));
  if (photosPath) {
    serveStaticFile(res, photosPath);
    return;
  }

  const publicPath = safeMountedPath(req.url || "", "/public", path.join(ROOT, "public"));
  if (publicPath) {
    serveStaticFile(res, publicPath);
    return;
  }

  const motifsPath = safeMountedPath(req.url || "", "/motifs", path.join(ROOT, "public", "motifs"));
  if (motifsPath) {
    serveStaticFile(res, motifsPath);
    return;
  }

  const iconsPath = safeMountedPath(req.url || "", "/icons", path.join(ROOT, "public", "icons"));
  if (iconsPath) {
    serveStaticFile(res, iconsPath);
    return;
  }

  if (pathname === "/logo.svg") {
    serveStaticFile(res, path.join(ROOT, "public", "logo.svg"));
    return;
  }

  if (pathname === "/favicon.svg") {
    serveStaticFile(res, path.join(ROOT, "public", "favicon.svg"));
    return;
  }

  if (pathname === "/favicon-32.png") {
    serveStaticFile(res, path.join(ROOT, "public", "favicon-32.png"));
    return;
  }

  const filePath = safePath(req.url || "/");
  serveStaticFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Wedding site running at http://localhost:${PORT}`);
  console.log(`RSVP submissions saved to ${RSVP_FILE}`);
});

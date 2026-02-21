const fs = require("fs");
const path = require("path");

const ARRIVALS_FEATURE_ROOT = path.resolve(__dirname, "..", "arrival-feature");
const ARRIVALS_PREVIEW_HTML = path.join(ARRIVALS_FEATURE_ROOT, "preview", "index.html");
const ARRIVALS_MOCK_TS = path.join(ARRIVALS_FEATURE_ROOT, "data", "mockArrivals.ts");

let cachedMock = {
  mtimeMs: 0,
  data: null,
};

function isPreviewEnabled() {
  const raw = String(process.env.NEXT_PUBLIC_ARRIVALS_PREVIEW || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function extractObjectLiteral(source, exportName) {
  const exportPattern = new RegExp(`export\\s+const\\s+${exportName}\\s*(?::[^=]+)?=`);
  const match = exportPattern.exec(source);

  if (!match || typeof match.index !== "number") {
    throw new Error(`Missing export: ${exportName}`);
  }

  const startSearchIndex = match.index + match[0].length;
  const objectStart = source.indexOf("{", startSearchIndex);
  if (objectStart < 0) {
    throw new Error(`Missing object literal for export: ${exportName}`);
  }

  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateQuote = false;
  let isEscaped = false;
  let objectEnd = -1;

  for (let index = objectStart; index < source.length; index += 1) {
    const char = source[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (inSingleQuote) {
      if (char === "'") inSingleQuote = false;
      continue;
    }

    if (inDoubleQuote) {
      if (char === '"') inDoubleQuote = false;
      continue;
    }

    if (inTemplateQuote) {
      if (char === "`") inTemplateQuote = false;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === "`") {
      inTemplateQuote = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        objectEnd = index;
        break;
      }
    }
  }

  if (objectEnd < 0) {
    throw new Error(`Unclosed object literal for export: ${exportName}`);
  }

  return source.slice(objectStart, objectEnd + 1);
}

function readMockDataFromTs() {
  if (!fs.existsSync(ARRIVALS_MOCK_TS)) {
    throw new Error(`Missing mock data file: ${ARRIVALS_MOCK_TS}`);
  }

  const stat = fs.statSync(ARRIVALS_MOCK_TS);
  if (cachedMock.data && cachedMock.mtimeMs === stat.mtimeMs) {
    return cachedMock.data;
  }

  const source = fs.readFileSync(ARRIVALS_MOCK_TS, "utf8");
  const mockObjectLiteral = extractObjectLiteral(source, "mockArrivals");
  const parsed = Function(`"use strict"; return (${mockObjectLiteral});`)();

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Parsed arrivals mock is invalid");
  }

  if (!parsed.beijing || !Array.isArray(parsed.origins) || !Array.isArray(parsed.byCountry)) {
    throw new Error("Arrivals mock data is missing required fields");
  }

  cachedMock = {
    mtimeMs: stat.mtimeMs,
    data: parsed,
  };

  return parsed;
}

function sendNotEnabled(req, res, send) {
  send(
    res,
    404,
    "Arrivals preview is not enabled. Set NEXT_PUBLIC_ARRIVALS_PREVIEW=true.",
    "text/plain; charset=utf-8",
    {
      req,
      cacheControl: "no-store",
    },
  );
}

function handleArrivalsPreviewRequest({ req, res, pathname, send, serveStaticFile, safeMountedPath, MIME_TYPES }) {
  const isPreviewRoute = pathname === "/arrivals-preview" || pathname === "/arrivals-preview/";
  const isPreviewApi = pathname === "/api/arrivals-preview/mock";
  const previewAssetPath = safeMountedPath(req.url || "", "/arrivals-preview-assets", ARRIVALS_FEATURE_ROOT);

  if (!isPreviewRoute && !isPreviewApi && !previewAssetPath) {
    return false;
  }

  if (!isPreviewEnabled()) {
    sendNotEnabled(req, res, send);
    return true;
  }

  if (isPreviewRoute) {
    serveStaticFile(req, res, ARRIVALS_PREVIEW_HTML);
    return true;
  }

  if (isPreviewApi) {
    try {
      const mockData = readMockDataFromTs();
      send(res, 200, JSON.stringify({ ok: true, data: mockData }), MIME_TYPES[".json"], {
        req,
        cacheControl: "no-store",
      });
    } catch (error) {
      send(
        res,
        500,
        JSON.stringify({ ok: false, error: String(error && error.message ? error.message : error) }),
        MIME_TYPES[".json"],
        {
          req,
          cacheControl: "no-store",
        },
      );
    }

    return true;
  }

  serveStaticFile(req, res, previewAssetPath);
  return true;
}

module.exports = {
  handleArrivalsPreviewRequest,
};

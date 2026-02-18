const fs = require("fs");
const path = require("path");
const http = require("http");
const zlib = require("zlib");
const { randomUUID } = require("crypto");
const { formidable } = require("formidable");
const { google } = require("googleapis");

const ROOT = __dirname;

const INITIAL_ENV_KEYS = new Set(Object.keys(process.env));

function parseEnvValue(rawValue) {
  if (rawValue === undefined || rawValue === null) return "";
  const trimmed = String(rawValue).trim();
  if (!trimmed) return "";

  const doubleQuoted = trimmed.startsWith('"') && trimmed.endsWith('"');
  const singleQuoted = trimmed.startsWith("'") && trimmed.endsWith("'");
  if (doubleQuoted || singleQuoted) {
    return trimmed.slice(1, -1);
  }

  return trimmed.replace(/\s+#.*$/, "").trim();
}

function loadEnvFile(filePath, { allowOverride = false } = {}) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  let loadedCount = 0;

  lines.forEach((line) => {
    const trimmed = String(line || "").trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;

    const key = match[1];
    const value = parseEnvValue(match[2]);
    if (!allowOverride && process.env[key] !== undefined) return;
    if (allowOverride && INITIAL_ENV_KEYS.has(key)) return;
    process.env[key] = value;
    loadedCount += 1;
  });

  return { filePath, loadedCount };
}

function loadLocalEnvFiles() {
  const loaded = [];
  const baseEnv = loadEnvFile(path.join(ROOT, ".env"), { allowOverride: false });
  if (baseEnv) loaded.push(baseEnv);
  const localEnv = loadEnvFile(path.join(ROOT, ".env.local"), { allowOverride: true });
  if (localEnv) loaded.push(localEnv);
  return loaded;
}

const loadedEnvFiles = loadLocalEnvFiles();
if (loadedEnvFiles.length) {
  const report = loadedEnvFiles
    .map((entry) => `${path.basename(entry.filePath)}:${entry.loadedCount}`)
    .join(", ");
  console.info(`[env] loaded ${report}`);
}

const PORT = process.env.PORT || 3000;
const NODE_ENV = String(process.env.NODE_ENV || "development").toLowerCase();

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

const TAB_SCHEMAS = {
  rsvps: [
    "submission_id",
    "submitted_at",
    "rsvp_status",
    "full_name",
    "email",
    "phone",
    "party_size",
    "when_will_you_know",
    "dietary_restrictions",
    "message_to_couple",
    "primary_fun_facts",
    "media_count",
    "source",
    "approved",
  ],
  guests: [
    "submission_id",
    "guest_index",
    "guest_name",
    "fun_facts",
    "is_primary",
    "created_at",
  ],
  media: [
    "submission_id",
    "file_index",
    "file_id",
    "file_name",
    "mime_type",
    "file_type",
    "drive_view_url",
    "created_at",
  ],
};

const GUESTBOOK_ENV_KEYS = Object.freeze({
  spreadsheetId: "GOOGLE_SPREADSHEET_ID",
  serviceAccountJson: "GOOGLE_SERVICE_ACCOUNT_JSON",
  serviceAccountEmail: "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  serviceAccountPrivateKey: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  oauthClientId: "GOOGLE_OAUTH_CLIENT_ID",
  oauthClientSecret: "GOOGLE_OAUTH_CLIENT_SECRET",
  oauthRefreshToken: "GOOGLE_OAUTH_REFRESH_TOKEN",
});

const GUESTBOOK_CACHE_TTL_MS = Math.max(60, Number.parseInt(process.env.GUESTBOOK_CACHE_TTL_SECONDS || "180", 10) || 180) * 1000;
const GUESTBOOK_RESPONSE_CACHE_SECONDS = Math.max(
  30,
  Math.min(300, Number.parseInt(process.env.GUESTBOOK_RESPONSE_CACHE_SECONDS || "90", 10) || 90),
);
const GUESTBOOK_PINBOARD_DEFAULT_LIMIT = 16;
const GUESTBOOK_ARCHIVE_DEFAULT_LIMIT = 30;
const STATIC_BODY_CACHE_MAX_BYTES = 512 * 1024;
const GOOGLE_API_CALL_TIMEOUT_MS = Math.max(3000, Number.parseInt(process.env.GOOGLE_API_CALL_TIMEOUT_MS || "10000", 10) || 10000);
const staticBodyCache = new Map();
const guestbookCache = {
  expiresAt: 0,
  items: [],
  pending: null,
  refreshing: null,
};
let guestbookWarmupPromise = null;

function extractYearPrefix(filename) {
  const match = String(filename || "").match(/(?:^|[^0-9])((?:19|20)\d{2})(?!\d)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function send(res, status, body, contentType = "text/plain; charset=utf-8", options = {}) {
  const headers = {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    ...(options.headers && typeof options.headers === "object" ? options.headers : {}),
  };

  if (options.cacheControl) {
    headers["Cache-Control"] = String(options.cacheControl);
  }

  const rawBody = Buffer.isBuffer(body) ? body : Buffer.from(String(body || ""));
  const req = options.req;
  const canCompress = req && isCompressibleMime(contentType);
  const { body: encodedBody, encoding } = canCompress ? encodeBody(rawBody, req.headers["accept-encoding"]) : { body: rawBody, encoding: null };

  if (encoding) {
    headers["Content-Encoding"] = encoding;
    headers.Vary = headers.Vary ? `${headers.Vary}, Accept-Encoding` : "Accept-Encoding";
  }

  res.writeHead(status, headers);
  res.end(encodedBody);
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 5_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
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

function isCompressibleMime(mime) {
  return /^(text\/|application\/javascript|application\/json|image\/svg\+xml)/.test(mime);
}

function encodeBody(body, acceptEncodingHeader) {
  const acceptEncoding = String(acceptEncodingHeader || "").toLowerCase();
  if (!body || body.length < 1024) {
    return { body, encoding: null };
  }

  if (acceptEncoding.includes("br")) {
    return { body: zlib.brotliCompressSync(body), encoding: "br" };
  }

  if (acceptEncoding.includes("gzip")) {
    return { body: zlib.gzipSync(body), encoding: "gzip" };
  }

  return { body, encoding: null };
}

function getPreferredEncoding(acceptEncodingHeader) {
  const acceptEncoding = String(acceptEncodingHeader || "").toLowerCase();
  if (acceptEncoding.includes("br")) return "br";
  if (acceptEncoding.includes("gzip")) return "gzip";
  return null;
}

function createWeakEtag(size, mtimeMs) {
  const safeSize = Number.isFinite(Number(size)) ? Number(size) : 0;
  const safeMtime = Number.isFinite(Number(mtimeMs)) ? Math.floor(Number(mtimeMs)) : 0;
  return `W/"${safeSize.toString(16)}-${safeMtime.toString(16)}"`;
}

function isNotModified(req, etag, mtimeMs) {
  const ifNoneMatch = String(req.headers["if-none-match"] || "").trim();
  if (ifNoneMatch && etag && ifNoneMatch === etag) return true;

  const ifModifiedSinceRaw = String(req.headers["if-modified-since"] || "").trim();
  if (!ifModifiedSinceRaw || !Number.isFinite(Number(mtimeMs))) return false;
  const ifModifiedSinceMs = Date.parse(ifModifiedSinceRaw);
  if (!Number.isFinite(ifModifiedSinceMs)) return false;
  return Math.floor(Number(mtimeMs)) <= ifModifiedSinceMs;
}

function getCachedStaticBody(filePath, stat, mime) {
  const canCacheBody = isCompressibleMime(mime) && stat.size <= STATIC_BODY_CACHE_MAX_BYTES;
  if (!canCacheBody) {
    return {
      rawBody: fs.readFileSync(filePath),
      encoded: {},
      cacheable: false,
    };
  }

  const cacheKey = filePath;
  const cached = staticBodyCache.get(cacheKey);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached;
  }

  const next = {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    rawBody: fs.readFileSync(filePath),
    encoded: {},
    cacheable: true,
  };
  staticBodyCache.set(cacheKey, next);
  return next;
}

function serveStaticFile(req, res, filePath) {
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath)) {
    send(res, 404, "Not found");
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    send(res, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  const isHtml = ext === ".html";
  const cacheControl = isHtml ? "no-cache" : "public, max-age=31536000, immutable";
  const etag = createWeakEtag(stat.size, stat.mtimeMs);
  const lastModified = new Date(stat.mtimeMs).toUTCString();

  if (isNotModified(req, etag, stat.mtimeMs)) {
    res.writeHead(304, {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": cacheControl,
      ETag: etag,
      "Last-Modified": lastModified,
      Vary: "Accept-Encoding",
    });
    res.end();
    return;
  }

  const cachedBody = getCachedStaticBody(filePath, stat, mime);
  const rawBody = cachedBody.rawBody;
  const canCompress = isCompressibleMime(mime);
  let body = rawBody;
  let encoding = null;

  if (canCompress && rawBody.length >= 1024) {
    const preferredEncoding = getPreferredEncoding(req.headers["accept-encoding"]);
    if (preferredEncoding && cachedBody.encoded && cachedBody.encoded[preferredEncoding]) {
      body = cachedBody.encoded[preferredEncoding];
      encoding = preferredEncoding;
    } else if (preferredEncoding) {
      if (preferredEncoding === "br") {
        body = zlib.brotliCompressSync(rawBody);
      } else if (preferredEncoding === "gzip") {
        body = zlib.gzipSync(rawBody);
      }
      encoding = preferredEncoding;
      if (cachedBody.cacheable) {
        cachedBody.encoded[preferredEncoding] = body;
      }
    }
  }

  const headers = {
    "Content-Type": mime,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": cacheControl,
    ETag: etag,
    "Last-Modified": lastModified,
    Vary: "Accept-Encoding",
  };

  if (encoding) {
    headers["Content-Encoding"] = encoding;
  }

  res.writeHead(200, headers);
  res.end(body);
}

function normalizeFieldValue(value) {
  if (Array.isArray(value)) return normalizeFieldValue(value[0]);
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function inferSource(userAgent, viewportWidthRaw) {
  const viewportWidth = Number.parseInt(normalizeFieldValue(viewportWidthRaw), 10);
  if (Number.isFinite(viewportWidth) && viewportWidth > 0) {
    return viewportWidth <= 860 ? "mobile" : "web";
  }

  const ua = String(userAgent || "").toLowerCase();
  if (/iphone|ipad|ipod|android|mobile|blackberry|windows phone/.test(ua)) {
    return "mobile";
  }

  return "web";
}

function parseMaybeInt(value) {
  const parsed = Number.parseInt(normalizeFieldValue(value), 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseBoundedInt(value, fallback, min, max) {
  const parsed = parseMaybeInt(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return fallback;
  }
}

function normalizeGuests(guestsRaw) {
  if (!Array.isArray(guestsRaw)) return [];
  return guestsRaw
    .map((guest) => {
      if (!guest || typeof guest !== "object") return null;
      return {
        name: normalizeFieldValue(guest.name),
        funFact: normalizeFieldValue(guest.funFact),
      };
    })
    .filter(Boolean);
}

function normalizeUploadedFiles(parsedFiles) {
  const collected = [];
  Object.entries(parsedFiles || {}).forEach(([fieldName, fileOrFiles]) => {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    files.forEach((file) => {
      if (!file) return;
      const size = Number(file.size || 0);
      if (size <= 0) return;
      collected.push({ fieldName, file });
    });
  });

  const orderFromField = (fieldName) => {
    const match = String(fieldName || "").match(/photo(\d+)/i);
    if (!match) return Number.POSITIVE_INFINITY;
    return Number.parseInt(match[1], 10);
  };

  return collected
    .sort((a, b) => orderFromField(a.fieldName) - orderFromField(b.fieldName))
    .map((entry) => entry.file)
    .slice(0, 3);
}

async function parseMultipartForm(req) {
  const form = formidable({
    multiples: true,
    maxFiles: 3,
    maxFileSize: 10 * 1024 * 1024,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        fields,
        files: normalizeUploadedFiles(files),
      });
    });
  });
}

function getServiceAccountCredentials() {
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonRaw) {
    const parsed = safeJsonParse(jsonRaw, null);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON");
    }
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key");
    }
    return {
      client_email: String(parsed.client_email),
      private_key: String(parsed.private_key).replace(/\\n/g, "\n"),
    };
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }

  return {
    client_email: String(clientEmail),
    private_key: String(privateKey).replace(/\\n/g, "\n"),
  };
}

function getRequiredGoogleIds() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const uploadsFolderId = process.env.GOOGLE_DRIVE_UPLOADS_FOLDER_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SPREADSHEET_ID");
  }
  if (!uploadsFolderId) {
    throw new Error("Missing GOOGLE_DRIVE_UPLOADS_FOLDER_ID");
  }
  return { spreadsheetId, uploadsFolderId };
}

function getRequiredSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SPREADSHEET_ID");
  }
  return spreadsheetId;
}

function isLocalRequest(req) {
  const hostHeader = String((req && req.headers && req.headers.host) || "").toLowerCase();
  return hostHeader.includes("localhost") || hostHeader.includes("127.0.0.1");
}

function getGuestbookConfigStatus() {
  const checks = {
    [GUESTBOOK_ENV_KEYS.spreadsheetId]: Boolean(process.env[GUESTBOOK_ENV_KEYS.spreadsheetId]),
    [GUESTBOOK_ENV_KEYS.serviceAccountJson]: Boolean(process.env[GUESTBOOK_ENV_KEYS.serviceAccountJson]),
    [GUESTBOOK_ENV_KEYS.serviceAccountEmail]: Boolean(process.env[GUESTBOOK_ENV_KEYS.serviceAccountEmail]),
    [GUESTBOOK_ENV_KEYS.serviceAccountPrivateKey]: Boolean(process.env[GUESTBOOK_ENV_KEYS.serviceAccountPrivateKey]),
    [GUESTBOOK_ENV_KEYS.oauthClientId]: Boolean(process.env[GUESTBOOK_ENV_KEYS.oauthClientId]),
    [GUESTBOOK_ENV_KEYS.oauthClientSecret]: Boolean(process.env[GUESTBOOK_ENV_KEYS.oauthClientSecret]),
    [GUESTBOOK_ENV_KEYS.oauthRefreshToken]: Boolean(process.env[GUESTBOOK_ENV_KEYS.oauthRefreshToken]),
  };

  const hasSpreadsheet = checks[GUESTBOOK_ENV_KEYS.spreadsheetId];
  const hasServiceAccount = checks[GUESTBOOK_ENV_KEYS.serviceAccountJson] || (checks[GUESTBOOK_ENV_KEYS.serviceAccountEmail] && checks[GUESTBOOK_ENV_KEYS.serviceAccountPrivateKey]);
  const hasOauth = checks[GUESTBOOK_ENV_KEYS.oauthClientId] && checks[GUESTBOOK_ENV_KEYS.oauthClientSecret] && checks[GUESTBOOK_ENV_KEYS.oauthRefreshToken];
  const configured = Boolean(hasSpreadsheet && (hasServiceAccount || hasOauth));

  const missing = [];
  if (!hasSpreadsheet) missing.push(GUESTBOOK_ENV_KEYS.spreadsheetId);
  if (!hasServiceAccount && !hasOauth) {
    missing.push(
      `${GUESTBOOK_ENV_KEYS.serviceAccountJson} OR (${GUESTBOOK_ENV_KEYS.serviceAccountEmail} + ${GUESTBOOK_ENV_KEYS.serviceAccountPrivateKey}) OR (${GUESTBOOK_ENV_KEYS.oauthClientId} + ${GUESTBOOK_ENV_KEYS.oauthClientSecret} + ${GUESTBOOK_ENV_KEYS.oauthRefreshToken})`,
    );
  }

  return {
    configured,
    checks,
    hasSpreadsheet,
    hasServiceAccount,
    hasOauth,
    authMode: hasOauth ? "oauth" : hasServiceAccount ? "service_account" : "missing",
    missing,
  };
}

function buildGuestbookConfigErrorPayload(req, configStatus) {
  const localRequest = isLocalRequest(req);
  const message = localRequest ? "Guestbook not configured locally." : "Guest Wall is temporarily unavailable.";
  const payload = {
    ok: false,
    error: message,
    errorCode: "GUESTBOOK_NOT_CONFIGURED",
    code: "not_configured",
    detail: "Guestbook configuration is incomplete.",
  };

  if (localRequest || NODE_ENV === "development") {
    payload.instructions =
      `Set ${GUESTBOOK_ENV_KEYS.spreadsheetId} and one auth method: ` +
      `${GUESTBOOK_ENV_KEYS.serviceAccountJson} OR ` +
      `${GUESTBOOK_ENV_KEYS.serviceAccountEmail}+${GUESTBOOK_ENV_KEYS.serviceAccountPrivateKey} OR ` +
      `${GUESTBOOK_ENV_KEYS.oauthClientId}+${GUESTBOOK_ENV_KEYS.oauthClientSecret}+${GUESTBOOK_ENV_KEYS.oauthRefreshToken}.`;
    payload.missing = Array.isArray(configStatus?.missing) ? configStatus.missing : [];
    payload.env = configStatus?.checks || {};
  }

  return payload;
}

function createGoogleClients() {
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  let auth;
  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oauth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    oauth2Client.setCredentials({ refresh_token: oauthRefreshToken });
    auth = oauth2Client;
  } else {
    const credentials = getServiceAccountCredentials();
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
  }

  return {
    sheets: google.sheets({ version: "v4", auth }),
    drive: google.drive({ version: "v3", auth }),
  };
}

async function getSheetHeaders(sheets, spreadsheetId, tabName) {
  const response = await runSheetsCall(`values.get(headers:${tabName})`, () =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!1:1`,
    }),
  );

  const row = Array.isArray(response.data.values) ? response.data.values[0] : null;
  if (!Array.isArray(row) || !row.length) {
    throw new Error(`Tab '${tabName}' has no header row`);
  }

  return row.map((header) => normalizeFieldValue(header));
}

async function getSheetObjects(sheets, spreadsheetId, tabName) {
  const startedAt = Date.now();
  const response = await runSheetsCall(`values.get(rows:${tabName})`, () =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A:ZZ`,
    }),
  );

  const values = Array.isArray(response.data.values) ? response.data.values : [];
  const [headerRow, ...rows] = values;
  const headers = Array.isArray(headerRow) ? headerRow.map((header) => normalizeFieldValue(header)) : [];
  if (!headers.length) {
    throw new Error(`Tab '${tabName}' has no header row`);
  }

  assertHeadersPresent(headers, TAB_SCHEMAS[tabName], tabName);

  const mapped = rows.map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = normalizeFieldValue(row[index]);
    });
    return item;
  });

  console.info(
    `[sheets] tab=${tabName} duration_ms=${Date.now() - startedAt} rows=${mapped.length} cols=${headers.length} range=${tabName}!A:ZZ`,
  );
  return mapped;
}

function assertHeadersPresent(headers, requiredHeaders, tabName) {
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length) {
    throw new Error(`Tab '${tabName}' is missing required headers: ${missing.join(", ")}`);
  }
}

function buildRowFromHeaders(headers, valuesByHeader) {
  return headers.map((header) => {
    const value = valuesByHeader[header];
    if (value === undefined || value === null) return "";
    return String(value);
  });
}

async function appendRows(sheets, spreadsheetId, tabName, rows) {
  if (!Array.isArray(rows) || !rows.length) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: rows,
    },
  });
}

function deriveFileTypeFromMime(mimeType) {
  const mime = String(mimeType || "").toLowerCase();
  if (mime.startsWith("video/")) return "video";
  return "image";
}

function isTruthyApproval(value) {
  const normalized = normalizeFieldValue(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function normalizeFileType(fileTypeValue, mimeTypeValue) {
  const fileType = normalizeFieldValue(fileTypeValue).toLowerCase();
  if (fileType === "image" || fileType === "video") return fileType;
  return deriveFileTypeFromMime(mimeTypeValue);
}

function buildDriveViewUrl(fileId, driveViewUrl) {
  if (driveViewUrl) return driveViewUrl;
  if (!fileId) return "";
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function buildDriveEmbedUrl(fileId, driveViewUrl, fileType) {
  if (fileId) {
    if (fileType === "video") {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return driveViewUrl || "";
}

function buildDriveThumbnailUrl(fileId) {
  if (!fileId) return "";
  return `https://lh3.googleusercontent.com/d/${fileId}=w720`;
}

function normalizeDriveThumbnailLink(url) {
  const value = normalizeFieldValue(url);
  if (!value) return "";
  if (!/^https:\/\//i.test(value)) return "";
  if (value.includes("=s")) {
    return value.replace(/=s\d+/, "=w720");
  }
  return value;
}

function getErrorCode(error) {
  return Number(
    (error && error.code) ||
      (error && error.statusCode) ||
      (error && error.response && error.response.status) ||
      (error && error.cause && error.cause.code) ||
      0,
  );
}

function isRetryableDriveError(error) {
  const code = getErrorCode(error);
  if (code === 403 || code === 408 || code === 429) return true;
  if (code >= 500) return true;
  const message = String(error instanceof Error ? error.message : error || "").toLowerCase();
  return message.includes("timeout") || message.includes("timed out") || message.includes("network");
}

function isRetryableSheetsError(error) {
  const code = getErrorCode(error);
  if (code === 429 || code === 408) return true;
  if (code >= 500) return true;
  const message = String(error instanceof Error ? error.message : error || "").toLowerCase();
  return (
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("eai_again") ||
    message.includes("enotfound") ||
    message.includes("socket hang up") ||
    message.includes("network")
  );
}

async function runDriveCall(label, operation) {
  const startedAt = Date.now();
  let attempt = 0;

  while (attempt < 3) {
    const attemptStartedAt = Date.now();
    try {
      const response = await withOperationTimeout(label, operation);
      const elapsed = Date.now() - attemptStartedAt;
      const data = response && response.data ? response.data : null;
      const itemCount = data && Array.isArray(data.files) ? data.files.length : 0;
      const byteLength =
        response && response.headers && response.headers["content-length"]
          ? Number.parseInt(response.headers["content-length"], 10) || null
          : null;
      console.info(
        `[drive] call=${label} attempt=${attempt + 1} duration_ms=${elapsed} items=${itemCount || 0} bytes=${byteLength || 0}`,
      );
      return response;
    } catch (error) {
      const elapsed = Date.now() - attemptStartedAt;
      const code = getErrorCode(error);
      const retryable = isRetryableDriveError(error);
      console.warn(
        `[drive] call=${label} attempt=${attempt + 1} duration_ms=${elapsed} status=${code || "unknown"} retryable=${retryable}`,
      );
      if (!retryable || attempt >= 2) {
        throw error;
      }
      const backoffMs = 250 * 2 ** attempt + Math.floor(Math.random() * 120);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      attempt += 1;
    }
  }

  console.warn(`[drive] call=${label} exhausted retries duration_ms=${Date.now() - startedAt}`);
  throw new Error("Drive request failed after retries");
}

async function runSheetsCall(label, operation) {
  let attempt = 0;
  while (attempt < 3) {
    const attemptStartedAt = Date.now();
    try {
      const response = await withOperationTimeout(label, operation);
      const elapsed = Date.now() - attemptStartedAt;
      const values = response && response.data && Array.isArray(response.data.values) ? response.data.values : [];
      const rows = values.length;
      const cols = rows > 0 && Array.isArray(values[0]) ? values[0].length : 0;
      console.info(`[sheets] call=${label} attempt=${attempt + 1} duration_ms=${elapsed} rows=${rows} cols=${cols}`);
      return response;
    } catch (error) {
      const elapsed = Date.now() - attemptStartedAt;
      const code = getErrorCode(error);
      const retryable = isRetryableSheetsError(error);
      console.warn(`[sheets] call=${label} attempt=${attempt + 1} duration_ms=${elapsed} status=${code || "unknown"} retryable=${retryable}`);
      if (!retryable || attempt >= 2) throw error;
      const backoffMs = 250 * 2 ** attempt + Math.floor(Math.random() * 120);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      attempt += 1;
    }
  }
  throw new Error("Sheets request failed after retries");
}

function withOperationTimeout(label, operation) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const timeoutError = new Error(`${label} timed out after ${GOOGLE_API_CALL_TIMEOUT_MS}ms`);
      timeoutError.code = "ETIMEDOUT";
      timeoutError.statusCode = 408;
      reject(timeoutError);
    }, GOOGLE_API_CALL_TIMEOUT_MS);

    Promise.resolve()
      .then(operation)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
}

async function loadDriveMetadataByFileId(drive, fileIds) {
  const uniqueIds = [...new Set((fileIds || []).map((id) => normalizeFieldValue(id)).filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const map = new Map();
  const limit = 4;
  for (let offset = 0; offset < uniqueIds.length; offset += limit) {
    const chunk = uniqueIds.slice(offset, offset + limit);
    await Promise.all(
      chunk.map(async (fileId) => {
      try {
          const response = await runDriveCall("files.get(metadata)", () =>
            drive.files.get({
              fileId,
              supportsAllDrives: true,
              fields: "id,mimeType,thumbnailLink,webViewLink",
            }),
          );

          map.set(fileId, {
            mimeType: normalizeFieldValue(response.data && response.data.mimeType),
            thumbnailLink: normalizeFieldValue(response.data && response.data.thumbnailLink),
            webViewLink: normalizeFieldValue(response.data && response.data.webViewLink),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error || "unknown");
          console.warn(`[guestbook] drive metadata lookup failed file_id=${fileId} message=${message}`);
        }
      }),
    );
  }

  return map;
}

async function makeDriveFilePublic(drive, fileId) {
  const shouldPublish = String(process.env.GOOGLE_DRIVE_PUBLIC_MEDIA || "true").toLowerCase() !== "false";
  if (!shouldPublish) return;
  if (!fileId) return;

  try {
    await runDriveCall("permissions.create(public-read)", () =>
      drive.permissions.create({
        fileId,
        supportsAllDrives: true,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        fields: "id",
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "unknown");
    console.warn(`[drive] could not make file public file_id=${fileId} message=${message}`);
  }
}

function classifyGuestbookError(error) {
  const message = String(error instanceof Error ? error.message : error || "");
  const lower = message.toLowerCase();

  if (lower.includes("missing google_spreadsheet_id")) {
    return { code: "missing_env_var", detail: "GOOGLE_SPREADSHEET_ID is not set in production env." };
  }
  if (lower.includes("missing google credentials") || lower.includes("google_service_account") || lower.includes("google_oauth")) {
    return { code: "missing_credentials", detail: "Google auth credentials are missing or incomplete." };
  }
  if (
    lower.includes("permission denied") ||
    lower.includes("insufficient permissions") ||
    lower.includes("the caller does not have permission") ||
    lower.includes("request had insufficient authentication scopes") ||
    lower.includes("forbidden")
  ) {
    return { code: "permission_denied", detail: "Google API credentials do not have access to Sheet/Drive resources." };
  }
  if (lower.includes("invalid_grant") || lower.includes("unauthorized_client") || lower.includes("invalid_client")) {
    return { code: "oauth_invalid", detail: "OAuth refresh token/client configuration is invalid." };
  }
  if (lower.includes("missing required headers") || lower.includes("has no header row")) {
    return { code: "schema_mismatch", detail: "Sheet tabs/headers do not match expected schema." };
  }
  if (
    lower.includes("econnreset") ||
    lower.includes("etimedout") ||
    lower.includes("timed out") ||
    lower.includes("timeout") ||
    lower.includes("eai_again") ||
    lower.includes("enotfound") ||
    lower.includes("network")
  ) {
    return { code: "network_error", detail: "Temporary network failure while calling Google APIs." };
  }

  return { code: "unknown", detail: "Unexpected guestbook failure." };
}

function getGuestbookErrorStatus(classified) {
  const code = String(classified && classified.code ? classified.code : "");
  if (code === "missing_env_var" || code === "missing_credentials" || code === "oauth_invalid" || code === "schema_mismatch") {
    return 503;
  }
  if (code === "permission_denied" || code === "network_error") {
    return 503;
  }
  return 500;
}

function getGuestbookErrorCode(classified) {
  const code = String(classified && classified.code ? classified.code : "");
  if (code === "missing_env_var" || code === "missing_credentials") {
    return "GUESTBOOK_NOT_CONFIGURED";
  }
  if (code === "permission_denied" || code === "oauth_invalid" || code === "schema_mismatch" || code === "network_error") {
    return "UPSTREAM_UNAVAILABLE";
  }
  return "GUESTBOOK_ERROR";
}

function getUploadExtension(originalName, mimeType) {
  const nameExt = path.extname(String(originalName || "")).toLowerCase();
  if (nameExt) return nameExt;

  const mime = String(mimeType || "").toLowerCase();
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/quicktime") return ".mov";
  return "";
}

async function uploadMediaFilesToDrive(drive, destinationFolderId, submissionId, files) {
  const uploaded = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const mimeType = normalizeFieldValue(file.mimetype) || "application/octet-stream";
    const originalName = normalizeFieldValue(file.originalFilename) || `upload-${i + 1}`;
    const uploadName = `${submissionId}_${i + 1}${getUploadExtension(originalName, mimeType)}`;

    const response = await runDriveCall("files.create(upload)", () =>
      drive.files.create({
        supportsAllDrives: true,
        requestBody: {
          name: uploadName,
          parents: [destinationFolderId],
          mimeType,
        },
        media: {
          mimeType,
          body: fs.createReadStream(file.filepath),
        },
        fields: "id,name,mimeType",
      }),
    );

    const fileId = response.data && response.data.id;
    if (!fileId) {
      throw new Error(`Failed to upload media file ${uploadName}`);
    }

    uploaded.push({
      fileIndex: i + 1,
      fileId,
      fileName: response.data.name || uploadName,
      mimeType: response.data.mimeType || mimeType,
      fileType: deriveFileTypeFromMime(response.data.mimeType || mimeType),
      driveViewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    });

    await makeDriveFilePublic(drive, fileId);
  }

  return uploaded;
}

async function cleanupUploadedTempFiles(files) {
  if (!Array.isArray(files) || !files.length) return;
  await Promise.all(
    files.map(async (file) => {
      const filepath = file && file.filepath;
      if (!filepath) return;
      try {
        await fs.promises.unlink(filepath);
      } catch (_error) {
        // ignore temp cleanup failures
      }
    }),
  );
}

async function parseRsvpRequest(req) {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType.includes("multipart/form-data")) {
    return parseMultipartForm(req);
  }

  const raw = await getRequestBody(req);
  const payload = safeJsonParse(raw || "{}", {});
  return {
    fields: payload && typeof payload === "object" ? payload : {},
    files: [],
  };
}

function getField(fields, key, fallback = "") {
  const raw = fields && Object.prototype.hasOwnProperty.call(fields, key) ? fields[key] : fallback;
  return normalizeFieldValue(raw);
}

async function handleRsvpSubmission(req, res) {
  let uploadedTempFiles = [];

  try {
    const { spreadsheetId, uploadsFolderId } = getRequiredGoogleIds();
    const { sheets, drive } = createGoogleClients();

    const { fields, files } = await parseRsvpRequest(req);
    uploadedTempFiles = files;

    const submissionId = randomUUID();
    const nowIso = new Date().toISOString();

    const rsvpStatusRaw = getField(fields, "status").toLowerCase();
    const rsvpStatus = rsvpStatusRaw === "working" ? "maybe" : rsvpStatusRaw === "yes" || rsvpStatusRaw === "maybe" || rsvpStatusRaw === "no" ? rsvpStatusRaw : "";

    const fullName = getField(fields, "fullName") || getField(fields, "guestName");
    const email = getField(fields, "email");
    const phone = getField(fields, "phone");
    const messageToCouple = getField(fields, "message");
    const dietaryRestrictions = getField(fields, "dietary");

    const guestsRaw = safeJsonParse(getField(fields, "guests_json", "[]"), []);
    const guests = normalizeGuests(guestsRaw);
    const primaryFunFacts = getField(fields, "primaryFunFacts") || getField(fields, "primary_fun_facts") || (guests[0] ? guests[0].funFact : "");

    const maybePartySize = parseMaybeInt(getField(fields, "partySize") || getField(fields, "potentialPartySize"));
    const partySize = rsvpStatus === "maybe" && Number.isFinite(maybePartySize) ? String(maybePartySize) : "";
    const whenWillYouKnow = rsvpStatus === "maybe" ? getField(fields, "whenWillYouKnow") || getField(fields, "followupChoice") : "";

    const mediaCount = files.length;
    const source = inferSource(getField(fields, "userAgent"), getField(fields, "viewportWidth"));

    const tabHeaders = {
      rsvps: await getSheetHeaders(sheets, spreadsheetId, "rsvps"),
      guests: await getSheetHeaders(sheets, spreadsheetId, "guests"),
      media: await getSheetHeaders(sheets, spreadsheetId, "media"),
    };

    assertHeadersPresent(tabHeaders.rsvps, TAB_SCHEMAS.rsvps, "rsvps");
    assertHeadersPresent(tabHeaders.guests, TAB_SCHEMAS.guests, "guests");
    assertHeadersPresent(tabHeaders.media, TAB_SCHEMAS.media, "media");

    const rsvpRow = buildRowFromHeaders(tabHeaders.rsvps, {
      submission_id: submissionId,
      submitted_at: nowIso,
      rsvp_status: rsvpStatus,
      full_name: fullName,
      email,
      phone,
      party_size: partySize,
      when_will_you_know: whenWillYouKnow,
      dietary_restrictions: dietaryRestrictions,
      message_to_couple: messageToCouple,
      primary_fun_facts: primaryFunFacts,
      media_count: String(mediaCount),
      source,
      approved: "FALSE",
    });

    const guestRowsData = [];
    guestRowsData.push(
      buildRowFromHeaders(tabHeaders.guests, {
        submission_id: submissionId,
        guest_index: "1",
        guest_name: fullName,
        fun_facts: primaryFunFacts,
        is_primary: "TRUE",
        created_at: nowIso,
      }),
    );

    let guestIndex = 2;
    const additionalGuests = guests.slice(1);
    additionalGuests.forEach((guest) => {
      if (!guest.name) return;
      guestRowsData.push(
        buildRowFromHeaders(tabHeaders.guests, {
          submission_id: submissionId,
          guest_index: String(guestIndex),
          guest_name: guest.name,
          fun_facts: guest.funFact || "",
          is_primary: "FALSE",
          created_at: nowIso,
        }),
      );
      guestIndex += 1;
    });

    let mediaRowsData = [];
    if (files.length) {
      const uploadedMedia = await uploadMediaFilesToDrive(drive, uploadsFolderId, submissionId, files);
      mediaRowsData = uploadedMedia.map((item) =>
        buildRowFromHeaders(tabHeaders.media, {
          submission_id: submissionId,
          file_index: String(item.fileIndex),
          file_id: item.fileId,
          file_name: item.fileName,
          mime_type: item.mimeType,
          file_type: item.fileType,
          drive_view_url: item.driveViewUrl,
          created_at: nowIso,
        }),
      );
    }

    await appendRows(sheets, spreadsheetId, "rsvps", [rsvpRow]);
    await appendRows(sheets, spreadsheetId, "guests", guestRowsData);
    await appendRows(sheets, spreadsheetId, "media", mediaRowsData);

    send(res, 200, JSON.stringify({ ok: true, submission_id: submissionId }), MIME_TYPES[".json"], {
      req,
      cacheControl: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RSVP submission failed";
    send(res, 500, JSON.stringify({ ok: false, error: message }), MIME_TYPES[".json"], {
      req,
      cacheControl: "no-store",
    });
  } finally {
    await cleanupUploadedTempFiles(uploadedTempFiles);
  }
}

function buildGuestbookItems(rsvpRows, guestRows, mediaRows, driveMetadataByFileId = new Map()) {
  const primaryGuestBySubmissionId = new Map();
  guestRows.forEach((row) => {
    const submissionId = normalizeFieldValue(row.submission_id);
    if (!submissionId || primaryGuestBySubmissionId.has(submissionId)) return;

    const isPrimary = normalizeFieldValue(row.is_primary).toLowerCase() === "true" || normalizeFieldValue(row.guest_index) === "1";
    if (!isPrimary) return;

    primaryGuestBySubmissionId.set(submissionId, {
      name: normalizeFieldValue(row.guest_name),
      funFacts: normalizeFieldValue(row.fun_facts),
    });
  });

  const mediaBySubmissionId = new Map();
  mediaRows.forEach((row) => {
    const submissionId = normalizeFieldValue(row.submission_id);
    if (!submissionId) return;

    const fileId = normalizeFieldValue(row.file_id);
    const fileName = normalizeFieldValue(row.file_name);
    const mimeType = normalizeFieldValue(row.mime_type);
    const metadata = fileId ? driveMetadataByFileId.get(fileId) : null;
    const fileType = normalizeFileType(row.file_type, metadata ? metadata.mimeType : mimeType);
    const driveViewUrl = buildDriveViewUrl(fileId, normalizeFieldValue(row.drive_view_url) || (metadata ? metadata.webViewLink : ""));
    const thumbnailUrl =
      fileType === "image" ? normalizeDriveThumbnailLink(metadata ? metadata.thumbnailLink : "") || buildDriveThumbnailUrl(fileId) : "";
    if (!driveViewUrl && !fileId) return;

    const item = {
      file_index: parseBoundedInt(row.file_index, Number.MAX_SAFE_INTEGER, 1, Number.MAX_SAFE_INTEGER),
      file_id: fileId,
      file_name: fileName,
      mime_type: mimeType,
      file_type: fileType,
      drive_view_url: driveViewUrl,
      view_url: driveViewUrl,
      thumbnail_url: thumbnailUrl,
      embed_url: buildDriveEmbedUrl(fileId, driveViewUrl, fileType),
      created_at: normalizeFieldValue(row.created_at),
    };

    const existing = mediaBySubmissionId.get(submissionId) || [];
    existing.push(item);
    mediaBySubmissionId.set(submissionId, existing);
  });

  mediaBySubmissionId.forEach((items) => {
    items.sort((a, b) => {
      if (a.file_index !== b.file_index) return a.file_index - b.file_index;
      return String(a.created_at).localeCompare(String(b.created_at));
    });
  });

  const guestbookItems = rsvpRows
    .filter((row) => isTruthyApproval(row.approved))
    .map((row) => {
      const submissionId = normalizeFieldValue(row.submission_id);
      if (!submissionId) return null;

      const primaryGuest = primaryGuestBySubmissionId.get(submissionId);
      const message = normalizeFieldValue(row.message_to_couple);
      const primaryFunFacts = normalizeFieldValue(row.primary_fun_facts) || (primaryGuest ? primaryGuest.funFacts : "");
      const media = mediaBySubmissionId.get(submissionId) || [];
      const name = normalizeFieldValue(row.full_name) || (primaryGuest ? primaryGuest.name : "") || "Guest";
      const submittedAt = normalizeFieldValue(row.submitted_at);

      if (!message && !primaryFunFacts && !media.length) {
        return null;
      }

      return {
        submission_id: submissionId,
        name,
        message,
        primary_fun_facts: primaryFunFacts,
        media,
        submitted_at: submittedAt,
      };
    })
    .filter(Boolean);

  guestbookItems.sort((a, b) => {
    const tsA = Date.parse(a.submitted_at || "");
    const tsB = Date.parse(b.submitted_at || "");
    const validA = Number.isFinite(tsA);
    const validB = Number.isFinite(tsB);
    if (validA && validB && tsA !== tsB) return tsB - tsA;
    if (validA !== validB) return validA ? -1 : 1;
    return String(b.submission_id).localeCompare(String(a.submission_id));
  });

  return guestbookItems;
}

async function loadGuestbookItems({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && guestbookCache.items.length && guestbookCache.expiresAt > now) {
    console.info(`[guestbook] cache hit items=${guestbookCache.items.length} expires_at=${new Date(guestbookCache.expiresAt).toISOString()}`);
    return guestbookCache.items;
  }

  if (!forceRefresh && guestbookCache.items.length && guestbookCache.expiresAt <= now) {
    if (!guestbookCache.refreshing) {
      console.info("[guestbook] stale cache served; refreshing in background");
      guestbookCache.refreshing = loadGuestbookItems({ forceRefresh: true })
        .catch((error) => {
          const message = error instanceof Error ? error.message : String(error || "unknown");
          console.warn(`[guestbook] background refresh failed message=${message}`);
        })
        .finally(() => {
          guestbookCache.refreshing = null;
        });
    }
    return guestbookCache.items;
  }

  if (guestbookCache.pending) {
    console.info("[guestbook] cache pending request reused");
    return guestbookCache.pending;
  }

  const pending = (async () => {
    const requestStartedAt = Date.now();
    const spreadsheetId = getRequiredSpreadsheetId();
    const { sheets } = createGoogleClients();

    const [rsvpRows, guestRows, mediaRows] = await Promise.all([
      getSheetObjects(sheets, spreadsheetId, "rsvps"),
      getSheetObjects(sheets, spreadsheetId, "guests"),
      getSheetObjects(sheets, spreadsheetId, "media"),
    ]);
    const approvedRows = rsvpRows.filter((row) => isTruthyApproval(row.approved)).length;
    console.info(
      `[guestbook] source rows rsvps=${rsvpRows.length} approved=${approvedRows} guests=${guestRows.length} media=${mediaRows.length}`,
    );

    const items = buildGuestbookItems(rsvpRows, guestRows, mediaRows, new Map());
    guestbookCache.items = items;
    guestbookCache.expiresAt = Date.now() + GUESTBOOK_CACHE_TTL_MS;
    if (!items.length) {
      console.info("[guestbook] success with 0 approved displayable items");
    } else {
      console.info(`[guestbook] success items=${items.length}`);
    }
    console.info(`[guestbook] refresh duration_ms=${Date.now() - requestStartedAt}`);
    return items;
  })();

  guestbookCache.pending = pending;
  try {
    return await pending;
  } finally {
    guestbookCache.pending = null;
  }
}

function scheduleGuestbookWarmup() {
  if (guestbookWarmupPromise) return guestbookWarmupPromise;
  guestbookWarmupPromise = loadGuestbookItems({ forceRefresh: true })
    .then((items) => {
      console.info(`[guestbook] warmup success items=${Array.isArray(items) ? items.length : 0}`);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error || "unknown");
      console.warn(`[guestbook] warmup failed message=${message}`);
    })
    .finally(() => {
      guestbookWarmupPromise = null;
    });
  return guestbookWarmupPromise;
}

function parseGuestbookMode(value) {
  const normalized = normalizeFieldValue(value).toLowerCase();
  return normalized === "archive" ? "archive" : "pinboard";
}

function parseGuestbookTypeFilter(value) {
  const normalized = normalizeFieldValue(value).toLowerCase();
  if (normalized === "photos" || normalized === "media") return "photos";
  if (normalized === "notes" || normalized === "note") return "notes";
  return "all";
}

function decodeGuestbookCursor(rawCursor) {
  const value = normalizeFieldValue(rawCursor);
  if (!value) return 0;
  if (/^\d+$/.test(value)) return parseBoundedInt(value, 0, 0, 1000000);

  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    if (!/^\d+$/.test(decoded)) return 0;
    return parseBoundedInt(decoded, 0, 0, 1000000);
  } catch (_error) {
    return 0;
  }
}

function encodeGuestbookCursor(offset) {
  if (!Number.isFinite(offset) || offset <= 0) return null;
  return Buffer.from(String(offset), "utf8").toString("base64");
}

function buildGuestbookNormalizedItems(approvedSubmissions) {
  const normalized = [];

  (approvedSubmissions || []).forEach((entry) => {
    const submissionId = normalizeFieldValue(entry.submission_id);
    if (!submissionId) return;

    const name = normalizeFieldValue(entry.name) || "Guest";
    const submittedAt = normalizeFieldValue(entry.submitted_at);
    const message = normalizeFieldValue(entry.message);
    const funFacts = normalizeFieldValue(entry.primary_fun_facts);
    const mediaItems = Array.isArray(entry.media) ? entry.media : [];

    mediaItems.forEach((mediaItem, mediaIndex) => {
      if (!mediaItem || typeof mediaItem !== "object") return;
      const fileType = normalizeFileType(mediaItem.file_type, mediaItem.mime_type);
      const viewUrl = normalizeFieldValue(mediaItem.view_url || mediaItem.drive_view_url);
      const thumbUrl = normalizeFieldValue(mediaItem.thumbnail_url) || buildDriveThumbnailUrl(mediaItem.file_id);
      if (fileType === "image" && !thumbUrl && !viewUrl) return;
      if (fileType === "video" && !viewUrl) return;

      normalized.push({
        id: `${submissionId}:${normalizeFieldValue(mediaItem.file_index) || mediaIndex + 1}`,
        type: "media",
        name,
        message,
        media: {
          kind: fileType,
          thumbUrl: thumbUrl || "",
          viewUrl: viewUrl || "",
        },
        submitted_at: submittedAt,
      });
    });

    const noteBody = message || (funFacts ? `Fun fact: ${funFacts}` : "");
    if (noteBody) {
      normalized.push({
        id: `${submissionId}:note`,
        type: "note",
        name,
        message: noteBody,
        media: null,
        submitted_at: submittedAt,
      });
    }
  });

  normalized.sort((a, b) => {
    const tsA = Date.parse(a.submitted_at || "");
    const tsB = Date.parse(b.submitted_at || "");
    const validA = Number.isFinite(tsA);
    const validB = Number.isFinite(tsB);
    if (validA && validB && tsA !== tsB) return tsB - tsA;
    if (validA !== validB) return validA ? -1 : 1;
    return String(b.id).localeCompare(String(a.id));
  });

  return normalized;
}

function pickBalancedPinboardItems(items, limit) {
  const maxItems = parseBoundedInt(limit, GUESTBOOK_PINBOARD_DEFAULT_LIMIT, 1, 32);
  const mediaItems = (items || []).filter((item) => item.type === "media");
  const noteItems = (items || []).filter((item) => item.type === "note");

  const targetMedia = Math.min(mediaItems.length, Math.ceil(maxItems * 0.65));
  const targetNotes = Math.min(noteItems.length, maxItems - targetMedia);

  const picked = [];
  picked.push(...mediaItems.slice(0, targetMedia));
  picked.push(...noteItems.slice(0, targetNotes));

  if (picked.length < maxItems) {
    const spillover = (items || []).filter((item) => !picked.includes(item));
    picked.push(...spillover.slice(0, maxItems - picked.length));
  }

  return picked.slice(0, maxItems);
}

function buildPinboardFeed(items) {
  const mediaQueue = (items || []).filter((item) => item.type === "media");
  const noteQueue = (items || []).filter((item) => item.type === "note");
  const feed = [];

  while (mediaQueue.length || noteQueue.length) {
    if (mediaQueue.length) feed.push(mediaQueue.shift());
    if (mediaQueue.length) feed.push(mediaQueue.shift());
    if (noteQueue.length) feed.push(noteQueue.shift());
    if (!mediaQueue.length && noteQueue.length) {
      feed.push(noteQueue.shift());
    }
  }

  return feed.filter(Boolean);
}

function filterArchiveItems(items, { typeFilter = "all", query = "" } = {}) {
  const needle = normalizeFieldValue(query).toLowerCase();
  return (items || []).filter((item) => {
    if (typeFilter === "photos" && item.type !== "media") return false;
    if (typeFilter === "notes" && item.type !== "note") return false;
    if (!needle) return true;

    const haystack = `${normalizeFieldValue(item.name)} ${normalizeFieldValue(item.message)}`.toLowerCase();
    return haystack.includes(needle);
  });
}

async function handleGuestbookRequest(req, res) {
  const requestStartedAt = Date.now();
  try {
    const requestUrl = new URL(req.url || "/api/guestbook", `http://${req.headers.host || "localhost"}`);
    const mode = parseGuestbookMode(requestUrl.searchParams.get("mode"));
    const defaultLimit = mode === "archive" ? GUESTBOOK_ARCHIVE_DEFAULT_LIMIT : GUESTBOOK_PINBOARD_DEFAULT_LIMIT;
    const limit = parseBoundedInt(requestUrl.searchParams.get("limit"), defaultLimit, 1, mode === "archive" ? 60 : 64);
    const typeFilter = parseGuestbookTypeFilter(requestUrl.searchParams.get("type"));
    const query = normalizeFieldValue(requestUrl.searchParams.get("q"));
    const cursor = requestUrl.searchParams.get("cursor");
    const cursorOffset = decodeGuestbookCursor(cursor);
    const offset = parseBoundedInt(requestUrl.searchParams.get("offset"), cursorOffset, 0, 1000000);
    const refresh = ["1", "true", "yes"].includes(normalizeFieldValue(requestUrl.searchParams.get("refresh")).toLowerCase());
    const configStatus = getGuestbookConfigStatus();
    const localRequest = isLocalRequest(req);
    console.info(
      `[guestbook] env spreadsheet=${configStatus.hasSpreadsheet} service_account=${configStatus.hasServiceAccount} oauth=${configStatus.hasOauth} auth_mode=${configStatus.authMode}`,
    );
    console.info(`[guestbook] upstream=google-sheets local_request=${localRequest}`);

    if (!configStatus.configured) {
      const payload = buildGuestbookConfigErrorPayload(req, configStatus);
      console.warn(
        `[guestbook] config missing missing=${Array.isArray(configStatus.missing) ? configStatus.missing.join(" | ") : "unknown"} duration_ms=${
          Date.now() - requestStartedAt
        }`,
      );
      send(res, 503, JSON.stringify(payload), MIME_TYPES[".json"], {
        req,
        cacheControl: "no-store",
      });
      return;
    }

    console.info(
      `[guestbook] request url=${requestUrl.pathname}${requestUrl.search} mode=${mode} limit=${limit} offset=${offset} type=${typeFilter} q=${
        query ? "yes" : "no"
      } refresh=${refresh}`,
    );

    const approvedSubmissions = await loadGuestbookItems({ forceRefresh: refresh });
    const normalizedItems = buildGuestbookNormalizedItems(approvedSubmissions);
    let workingItems = normalizedItems;
    if (mode === "pinboard") {
      workingItems = buildPinboardFeed(normalizedItems);
    } else {
      workingItems = filterArchiveItems(normalizedItems, { typeFilter, query });
    }

    const items = workingItems.slice(offset, offset + limit);
    const nextOffset = offset + items.length < workingItems.length ? offset + items.length : null;
    const nextCursor = nextOffset === null ? null : encodeGuestbookCursor(nextOffset);
    console.info(
      `[guestbook] response mode=${mode} total=${workingItems.length} returned=${items.length} next_offset=${
        nextOffset === null ? "none" : nextOffset
      } duration_ms=${Date.now() - requestStartedAt}`,
    );

    send(
      res,
      200,
      JSON.stringify({
        ok: true,
        mode,
        items,
        total: workingItems.length,
        offset,
        limit,
        next_offset: nextOffset,
        nextCursor,
        cached_until: guestbookCache.expiresAt ? new Date(guestbookCache.expiresAt).toISOString() : null,
      }),
      MIME_TYPES[".json"],
      {
        req,
        cacheControl: `public, max-age=${GUESTBOOK_RESPONSE_CACHE_SECONDS}, stale-while-revalidate=${Math.max(
          GUESTBOOK_RESPONSE_CACHE_SECONDS * 3,
          180,
        )}`,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Guestbook request failed";
    const classified = classifyGuestbookError(error);
    const status = getGuestbookErrorStatus(classified);
    const errorCode = getGuestbookErrorCode(classified);
    const localRequest = isLocalRequest(req);
    console.error(
      `[guestbook] error status=${status} error_code=${errorCode} code=${classified.code} detail=${classified.detail} message=${message} duration_ms=${
        Date.now() - requestStartedAt
      }`,
    );
    const responsePayload = {
      ok: false,
      error: status >= 500 ? "Guest Wall data is temporarily unavailable." : message,
      errorCode,
      code: classified.code,
      detail: classified.detail,
    };
    if (NODE_ENV === "development" || localRequest) {
      responsePayload.message = message;
    }
    send(
      res,
      status,
      JSON.stringify(responsePayload),
      MIME_TYPES[".json"],
      {
        req,
        cacheControl: "no-store",
      },
    );
  }
}

async function handleGuestbookHealthRequest(req, res) {
  const requestStartedAt = Date.now();
  const localRequest = isLocalRequest(req);
  const configStatus = getGuestbookConfigStatus();
  console.info(
    `[guestbook][health] env spreadsheet=${configStatus.hasSpreadsheet} service_account=${configStatus.hasServiceAccount} oauth=${configStatus.hasOauth} auth_mode=${configStatus.authMode}`,
  );

  if (!configStatus.configured) {
    const payload = buildGuestbookConfigErrorPayload(req, configStatus);
    send(res, 503, JSON.stringify(payload), MIME_TYPES[".json"], {
      req,
      cacheControl: "no-store",
    });
    return;
  }

  try {
    const items = await loadGuestbookItems({ forceRefresh: false });
    send(
      res,
      200,
      JSON.stringify({
        ok: true,
        status: "healthy",
        authMode: configStatus.authMode,
        env: configStatus.checks,
        items: Array.isArray(items) ? items.length : 0,
        cached_until: guestbookCache.expiresAt ? new Date(guestbookCache.expiresAt).toISOString() : null,
        duration_ms: Date.now() - requestStartedAt,
      }),
      MIME_TYPES[".json"],
      {
        req,
        cacheControl: "no-store",
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Guestbook health check failed";
    const classified = classifyGuestbookError(error);
    const status = getGuestbookErrorStatus(classified);
    const errorCode = getGuestbookErrorCode(classified);
    const payload = {
      ok: false,
      status: "unhealthy",
      error: "Guest Wall data source is unavailable.",
      errorCode,
      code: classified.code,
      detail: classified.detail,
      duration_ms: Date.now() - requestStartedAt,
      env: configStatus.checks,
    };
    if (NODE_ENV === "development" || localRequest) {
      payload.message = message;
    }
    send(res, status, JSON.stringify(payload), MIME_TYPES[".json"], {
      req,
      cacheControl: "no-store",
    });
  }
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
    await handleRsvpSubmission(req, res);
    return;
  }

  if (pathname === "/api/rsvp" && req.method === "GET") {
    send(res, 200, JSON.stringify({ ok: true, message: "RSVP API is active" }), MIME_TYPES[".json"], {
      req,
      cacheControl: "no-store",
    });
    return;
  }

  if (pathname === "/api/guestbook" && req.method === "GET") {
    await handleGuestbookRequest(req, res);
    return;
  }

  if (pathname === "/api/guestbook/health" && req.method === "GET") {
    await handleGuestbookHealthRequest(req, res);
    return;
  }

  if (pathname === "/api/timeline-photos" && req.method === "GET") {
    const timelineDir = path.join(ROOT, "photos", "timeline-photos");
    if (!fs.existsSync(timelineDir)) {
      send(res, 200, JSON.stringify({ ok: true, files: [] }), MIME_TYPES[".json"], {
        req,
        cacheControl: "public, max-age=300, stale-while-revalidate=900",
      });
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

    send(res, 200, JSON.stringify({ ok: true, files }), MIME_TYPES[".json"], {
      req,
      cacheControl: "public, max-age=300, stale-while-revalidate=900",
    });
    return;
  }

  const photosPath = safeMountedPath(req.url || "", "/photos", path.join(ROOT, "photos"));
  if (photosPath) {
    serveStaticFile(req, res, photosPath);
    return;
  }

  const publicPath = safeMountedPath(req.url || "", "/public", path.join(ROOT, "public"));
  if (publicPath) {
    serveStaticFile(req, res, publicPath);
    return;
  }

  const ourStoryNormalizedPath = safeMountedPath(
    req.url || "",
    "/our-story-normalized",
    path.join(ROOT, "public", "our-story-normalized"),
  );
  if (ourStoryNormalizedPath) {
    serveStaticFile(req, res, ourStoryNormalizedPath);
    return;
  }

  const ourStoryPath = safeMountedPath(req.url || "", "/our-story", path.join(ROOT, "public", "our-story-normalized"));
  if (ourStoryPath) {
    serveStaticFile(req, res, ourStoryPath);
    return;
  }

  const motifsPath = safeMountedPath(req.url || "", "/motifs", path.join(ROOT, "public", "motifs"));
  if (motifsPath) {
    serveStaticFile(req, res, motifsPath);
    return;
  }

  const iconsPath = safeMountedPath(req.url || "", "/icons", path.join(ROOT, "public", "icons"));
  if (iconsPath) {
    serveStaticFile(req, res, iconsPath);
    return;
  }

  if (pathname === "/logo.svg") {
    serveStaticFile(req, res, path.join(ROOT, "public", "logo.svg"));
    return;
  }

  if (pathname === "/favicon.svg") {
    serveStaticFile(req, res, path.join(ROOT, "public", "favicon.svg"));
    return;
  }

  if (pathname === "/favicon-32.png") {
    serveStaticFile(req, res, path.join(ROOT, "public", "favicon-32.png"));
    return;
  }

  if (pathname === "/guest-wall/all" || pathname === "/guest-wall/all/") {
    res.writeHead(302, { Location: "/guest-wall" });
    res.end();
    return;
  }

  if (pathname === "/guest-wall" || pathname === "/guest-wall/") {
    serveStaticFile(req, res, path.join(ROOT, "guest-wall.html"));
    return;
  }

  const filePath = safePath(req.url || "/");
  serveStaticFile(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`Wedding site running at http://localhost:${PORT}`);
  console.log("RSVP submissions will be written to Google Sheets + Google Drive");
  scheduleGuestbookWarmup();
});

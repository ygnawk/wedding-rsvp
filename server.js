const fs = require("fs");
const path = require("path");
const http = require("http");
const zlib = require("zlib");
const { randomUUID } = require("crypto");
const { formidable } = require("formidable");
const { google } = require("googleapis");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

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

const GUESTBOOK_CACHE_TTL_MS = Math.max(60, Number.parseInt(process.env.GUESTBOOK_CACHE_TTL_SECONDS || "180", 10) || 180) * 1000;
const GUESTBOOK_PINBOARD_DEFAULT_LIMIT = 16;
const GUESTBOOK_ARCHIVE_DEFAULT_LIMIT = 30;
const guestbookCache = {
  expiresAt: 0,
  items: [],
  pending: null,
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

function serveStaticFile(req, res, filePath) {
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
  const isHtml = ext === ".html";
  const cacheControl = isHtml ? "no-cache" : "public, max-age=31536000, immutable";
  const rawBody = fs.readFileSync(filePath);
  const canCompress = isCompressibleMime(mime);
  const { body, encoding } = canCompress ? encodeBody(rawBody, req.headers["accept-encoding"]) : { body: rawBody, encoding: null };

  const headers = {
    "Content-Type": mime,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": cacheControl,
  };

  if (encoding) {
    headers["Content-Encoding"] = encoding;
    headers.Vary = "Accept-Encoding";
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
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!1:1`,
  });

  const row = Array.isArray(response.data.values) ? response.data.values[0] : null;
  if (!Array.isArray(row) || !row.length) {
    throw new Error(`Tab '${tabName}' has no header row`);
  }

  return row.map((header) => normalizeFieldValue(header));
}

async function getSheetObjects(sheets, spreadsheetId, tabName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:ZZ`,
  });

  const values = Array.isArray(response.data.values) ? response.data.values : [];
  const [headerRow, ...rows] = values;
  const headers = Array.isArray(headerRow) ? headerRow.map((header) => normalizeFieldValue(header)) : [];
  if (!headers.length) {
    throw new Error(`Tab '${tabName}' has no header row`);
  }

  assertHeadersPresent(headers, TAB_SCHEMAS[tabName], tabName);

  return rows.map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = normalizeFieldValue(row[index]);
    });
    return item;
  });
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
  return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
}

function normalizeDriveThumbnailLink(url) {
  const value = normalizeFieldValue(url);
  if (!value) return "";
  if (!/^https:\/\//i.test(value)) return "";
  if (value.includes("=s")) {
    return value.replace(/=s\d+/, "=w1600");
  }
  return value;
}

async function loadDriveMetadataByFileId(drive, fileIds) {
  const uniqueIds = [...new Set((fileIds || []).map((id) => normalizeFieldValue(id)).filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const map = new Map();
  await Promise.all(
    uniqueIds.map(async (fileId) => {
      try {
        const response = await drive.files.get({
          fileId,
          supportsAllDrives: true,
          fields: "id,mimeType,thumbnailLink,webViewLink",
        });

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

  return map;
}

async function makeDriveFilePublic(drive, fileId) {
  const shouldPublish = String(process.env.GOOGLE_DRIVE_PUBLIC_MEDIA || "true").toLowerCase() !== "false";
  if (!shouldPublish) return;
  if (!fileId) return;

  try {
    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      fields: "id",
    });
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
    lower.includes("eai_again") ||
    lower.includes("enotfound") ||
    lower.includes("network")
  ) {
    return { code: "network_error", detail: "Temporary network failure while calling Google APIs." };
  }

  return { code: "unknown", detail: "Unexpected guestbook failure." };
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

    const response = await drive.files.create({
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
    });

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

    send(res, 200, JSON.stringify({ ok: true, submission_id: submissionId }), MIME_TYPES[".json"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "RSVP submission failed";
    send(res, 500, JSON.stringify({ ok: false, error: message }), MIME_TYPES[".json"]);
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

  if (!forceRefresh && guestbookCache.pending) {
    console.info("[guestbook] cache pending request reused");
    return guestbookCache.pending;
  }

  const pending = (async () => {
    const spreadsheetId = getRequiredSpreadsheetId();
    const { sheets, drive } = createGoogleClients();

    const [rsvpRows, guestRows, mediaRows] = await Promise.all([
      getSheetObjects(sheets, spreadsheetId, "rsvps"),
      getSheetObjects(sheets, spreadsheetId, "guests"),
      getSheetObjects(sheets, spreadsheetId, "media"),
    ]);
    const approvedRows = rsvpRows.filter((row) => isTruthyApproval(row.approved)).length;
    console.info(
      `[guestbook] source rows rsvps=${rsvpRows.length} approved=${approvedRows} guests=${guestRows.length} media=${mediaRows.length}`,
    );

    const driveMetadataByFileId = await loadDriveMetadataByFileId(
      drive,
      mediaRows.map((row) => row.file_id),
    );
    const items = buildGuestbookItems(rsvpRows, guestRows, mediaRows, driveMetadataByFileId);
    guestbookCache.items = items;
    guestbookCache.expiresAt = Date.now() + GUESTBOOK_CACHE_TTL_MS;
    if (!items.length) {
      console.info("[guestbook] success with 0 approved displayable items");
    } else {
      console.info(`[guestbook] success items=${items.length}`);
    }
    return items;
  })();

  guestbookCache.pending = pending;
  try {
    return await pending;
  } finally {
    guestbookCache.pending = null;
  }
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
  try {
    const requestUrl = new URL(req.url || "/api/guestbook", `http://${req.headers.host || "localhost"}`);
    const mode = parseGuestbookMode(requestUrl.searchParams.get("mode"));
    const defaultLimit = mode === "archive" ? GUESTBOOK_ARCHIVE_DEFAULT_LIMIT : GUESTBOOK_PINBOARD_DEFAULT_LIMIT;
    const limit = parseBoundedInt(requestUrl.searchParams.get("limit"), defaultLimit, 1, mode === "archive" ? 60 : 32);
    const typeFilter = parseGuestbookTypeFilter(requestUrl.searchParams.get("type"));
    const query = normalizeFieldValue(requestUrl.searchParams.get("q"));
    const cursor = requestUrl.searchParams.get("cursor");
    const cursorOffset = decodeGuestbookCursor(cursor);
    const offset = parseBoundedInt(requestUrl.searchParams.get("offset"), cursorOffset, 0, 1000000);
    const refresh = ["1", "true", "yes"].includes(normalizeFieldValue(requestUrl.searchParams.get("refresh")).toLowerCase());
    console.info(
      `[guestbook] request mode=${mode} limit=${limit} offset=${offset} type=${typeFilter} q=${query ? "yes" : "no"} refresh=${refresh}`,
    );

    const approvedSubmissions = await loadGuestbookItems({ forceRefresh: refresh });
    const normalizedItems = buildGuestbookNormalizedItems(approvedSubmissions);
    let workingItems = normalizedItems;
    if (mode === "pinboard") {
      workingItems = pickBalancedPinboardItems(normalizedItems, limit);
    } else {
      workingItems = filterArchiveItems(normalizedItems, { typeFilter, query });
    }

    const items = mode === "archive" ? workingItems.slice(offset, offset + limit) : workingItems;
    const nextOffset = mode === "archive" && offset + items.length < workingItems.length ? offset + items.length : null;
    const nextCursor = nextOffset === null ? null : encodeGuestbookCursor(nextOffset);
    console.info(
      `[guestbook] response mode=${mode} total=${workingItems.length} returned=${items.length} next_offset=${nextOffset === null ? "none" : nextOffset}`,
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
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Guestbook request failed";
    const classified = classifyGuestbookError(error);
    console.error(`[guestbook] error code=${classified.code} detail=${classified.detail} message=${message}`);
    send(res, 500, JSON.stringify({ ok: false, error: message }), MIME_TYPES[".json"]);
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
    send(res, 200, JSON.stringify({ ok: true, message: "RSVP API is active" }), MIME_TYPES[".json"]);
    return;
  }

  if (pathname === "/api/guestbook" && req.method === "GET") {
    await handleGuestbookRequest(req, res);
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
    serveStaticFile(req, res, photosPath);
    return;
  }

  const publicPath = safeMountedPath(req.url || "", "/public", path.join(ROOT, "public"));
  if (publicPath) {
    serveStaticFile(req, res, publicPath);
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
});

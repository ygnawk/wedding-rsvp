const SPREADSHEET_ID = "1yJqJC2q4iRVUFkQ3anFgr_lVHayAGFavo581U_zh3Ec";

const SHEET_YES = "Yes";
const SHEET_MAYBE = "Maybe";
const SHEET_NO = "No";

const STATUS_TO_SHEET = {
  yes: SHEET_YES,
  maybe: SHEET_MAYBE,
  no: SHEET_NO,
};

const DEFAULT_HEADERS = {
  [SHEET_YES]: [
    "Full name",
    "Email",
    "Phone (optional)",
    "Party size",
    "Attendee 1 name",
    "Attendee 2 name",
    "Attendee 3 name",
    "Attendee 4 name",
    "Attendee 5 name",
    "Attendee 6 name",
    "Dietary restrictions (optional)",
  ],
  [SHEET_MAYBE]: [
    "Full name",
    "Email",
    "Phone (optional)",
    "Potential party size",
    "When will you know?",
  ],
  [SHEET_NO]: [
    "Full name",
    "Email",
    "Phone (optional)",
    "Optional note",
  ],
};

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const status = normalizeValue_(payload.status);
    const sheetName = STATUS_TO_SHEET[status];
    if (!sheetName) return json_({ ok: false, error: "Invalid status" });

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = getOrCreateSheet_(ss, sheetName);
    const headers = getHeaders_(sh);
    if (!headers.length) return json_({ ok: false, error: "Missing header row" });

    const headerIndex = buildHeaderMap_(headers);
    const row = new Array(headers.length).fill("");

    const fullName = safeString_(payload.fullName || payload.guestName);
    const email = safeString_(payload.email);
    const phone = safeString_(payload.phone);
    const partySize = toNumberOrBlank_(payload.partySize);
    const potentialPartySize = toNumberOrBlank_(payload.potentialPartySize || payload.partySize);
    const dietary = safeString_(payload.dietary);
    const whenWillYouKnow = safeString_(payload.whenWillYouKnow || payload.followupChoice);
    const note = safeString_(payload.note);
    const attendeeNames = normalizeAttendees_(payload.attendeeNames);

    setByHeaders_(row, headerIndex, ["fullname", "name", "guestname"], fullName);
    setByHeaders_(row, headerIndex, ["email", "emailaddress"], email);
    setByHeaders_(row, headerIndex, ["phoneoptional", "phone", "phonenumber"], phone);

    if (status === "yes") {
      setByHeaders_(row, headerIndex, ["partysize", "numberattending"], partySize);
      for (let i = 1; i <= 6; i += 1) {
        setByHeaders_(
          row,
          headerIndex,
          [`attendee${i}name`, `attendee${i}`, `guest${i}name`, `guest${i}`, `name${i}`],
          attendeeNames[i - 1]
        );
      }
      setByHeaders_(row, headerIndex, ["dietaryrestrictionsoptional", "dietaryrestrictions", "dietary"], dietary);
    } else if (status === "maybe") {
      setByHeaders_(row, headerIndex, ["potentialpartysize", "partysize"], potentialPartySize);
      setByHeaders_(row, headerIndex, ["whenwillyouknow", "followupchoice", "confirmby"], whenWillYouKnow);
    } else if (status === "no") {
      setByHeaders_(row, headerIndex, ["optionalnote", "note"], note);
    }

    sh.appendRow(row);
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: safeString_(error && error.message ? error.message : error) || "Unknown error" });
  }
}

function parsePayload_(e) {
  const raw = (e && e.postData && e.postData.contents) || "{}";
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function getOrCreateSheet_(ss, sheetName) {
  let sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);

  if (sh.getLastRow() === 0) {
    const defaults = DEFAULT_HEADERS[sheetName] || [];
    if (defaults.length) sh.appendRow(defaults);
  }
  return sh;
}

function getHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (!lastCol) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map((v) => safeString_(v));
}

function buildHeaderMap_(headers) {
  const map = {};
  headers.forEach((header, i) => {
    const key = normalizeHeader_(header);
    if (key && map[key] === undefined) map[key] = i;
  });
  return map;
}

function normalizeAttendees_(value) {
  const names = Array.isArray(value) ? value.map((v) => safeString_(v)).slice(0, 6) : [];
  while (names.length < 6) names.push("");
  return names;
}

function setByHeaders_(row, headerIndex, candidates, value) {
  const idx = findHeaderIndex_(headerIndex, candidates);
  if (idx >= 0 && idx < row.length) row[idx] = value;
}

function findHeaderIndex_(headerIndex, candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    const key = normalizeHeader_(candidates[i]);
    if (key && headerIndex[key] !== undefined) return headerIndex[key];
  }
  return -1;
}

function normalizeHeader_(value) {
  return safeString_(value).toLowerCase().replace(/[^a-z]/g, "");
}

function normalizeValue_(value) {
  return safeString_(value).toLowerCase();
}

function toNumberOrBlank_(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : "";
}

function safeString_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

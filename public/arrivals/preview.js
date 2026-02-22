const MAP_VIEWBOX = {
  width: 2000,
  height: 1000,
};
const MAP_GEO_BOUNDS_DEFAULT = {
  x: 0,
  y: 0,
  width: 2000,
  height: 1000,
};
const MAP_PROJECTION = {
  // Option 2: generate the world land from GeoJSON in equirectangular projection.
  type: "equirectangular",
  assetWidth: 2000,
  assetHeight: 1000,
  calibration: {
    enabled: false,
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
    // Optional one-time anchor calibration for non-equirectangular raster maps.
    // Use normalized x/y (0..1) coordinates in the rendered map content box.
    anchors: [],
  },
};

const WORLD_GEOJSON_HREF = "/public/arrivals/world.geojson?v=20260219-solari50";
const WORLD_SVG_FALLBACK_HREF = "/public/arrivals/world.svg?v=20260219-solari50";
const PLANE_IMAGE_HREF = "/public/arrivals/plane.svg?v=20260219-solari50";
const BEIJING_ICON_HREF = "/public/arrivals/beijing-icon.png?v=20260219-solari79";
const BOARD_DISCLAIMER_IMAGE_HREF = "/public/arrivals/changi-solari-board.png?v=20260222-board-disclaimer1";
const BOARD_DISCLAIMER_COPY =
  "Of course we had to sneak a little Changi Airport into the site. We also tried to recreate the flip animation… and it didn’t quite cooperate.";
const EQUIRECTANGULAR_ASPECT_RATIO = 2;
const GRID_MINOR_DEGREES = 10;
const GRID_MAJOR_DEGREES = 30;
const GEO_DEBUG_PARAM = "geoDebug";
const GEO_DEBUG_POINTS = [
  { id: "zero", label: "0,0", lat: 0, lon: 0 },
  { id: "london", label: "LON 0,51.5", lat: 51.5, lon: 0 },
  { id: "nyc", label: "NYC -74,40.7", lat: 40.7, lon: -74 },
  { id: "tokyo", label: "TYO 139.7,35.7", lat: 35.7, lon: 139.7 },
  { id: "beijing", label: "BJS 116.4,39.9", lat: 39.9, lon: 116.4 },
];
const RADAR_CITY_NODES = [
  { id: "beijing", label: "Beijing", fromBeijing: true, hub: true },
];
const BOARD_ROWS_PER_PAGE = 999;
const BOARD_SEGMENT_COUNT = 1;
const BOARD_EMPTY_ROWS_AFTER_DATA = 6;
const BOARD_EMPTY_ROWS_AFTER_DATA_MOBILE = 3;
const BOARD_ROTATE_BASE_MS = 150000;
const BOARD_ROTATE_JITTER_MS = 30000;
const BOARD_RESUME_GRACE_MS = 5000;
const BOARD_IDLE_FLIP_MIN_MS = 20000;
const BOARD_IDLE_FLIP_MAX_MS = 45000;
const BOARD_IDLE_FLIP_DURATION_MIN_MS = 300;
const BOARD_IDLE_FLIP_DURATION_MAX_MS = 450;
const ARRIVALS_TITLE_LABEL = "Arrivals Tracker";
const ARRIVALS_HELPER_LABEL = "Tracking everyone’s journey to Beijing";
const MAP_LABEL = "WORLD MAP";
const BOARD_END_LABEL = "END";
const BEIJING_TIME_ZONE = "Asia/Shanghai";
const ARRIVALS_API_ORIGIN = "https://mikiandyijie-rsvp-api.onrender.com";
const ARRIVALS_API_PATH = "/api/arrivals";
const ARRIVALS_MOCK_DATA_PATH = "/public/arrivals/mock-arrivals.json";
const ARRIVALS_API_FETCH_TIMEOUT_MS = 9000;
const ARRIVALS_MOCK_FETCH_TIMEOUT_MS = 5000;

const COL_COUNTRY = 16;
const COL_CITY = 18;
const COL_PPL = 3;
const LINE_SEPARATOR = " · ";
const BOARD_LINE_LENGTH = COL_COUNTRY + LINE_SEPARATOR.length + COL_CITY + LINE_SEPARATOR.length + COL_PPL;
const FLAP_ROW_LEAD_IN_MS = 40;
const FLAP_STAGGER_BASE_MS = 12;
const FLAP_STAGGER_JITTER_MS = 10;
const FLAP_DURATION_MS = 140;
const FLAP_DURATION_NUMERIC_MS = 128;
const ROUTE_PING_DURATION_MS = 250;
const CALLOUT_FADE_MS = 180;
const DATA_REFRESH_MS = 90000;
const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 6;
const MAP_CONTROL_ZOOM_STEP = 1.24;
const MAP_INTERACTION_HINT_KEY = "arrivals-preview-map-hint-seen";
const MAP_CONTENT_INSET_SCALE = 0.965;
const PLANE_PHASE_JITTER_RATIO = 0.24;
const PLANE_MIN_PER_ROUTE = 1;
const PLANE_MAX_PER_ROUTE = 4;
const PLANE_HEADING_OFFSET_DEGREES = 180;
const PLANE_TANGENT_LOOK_DISTANCE = 2.8;
const PLANE_EDGE_FADE_PROGRESS = 0.08;
const PLANE_MAX_TRAVEL_PROGRESS = 0.996;
const PLANE_GLOBAL_LAUNCH_INTERVAL_MS = 2000;
const LOCAL_ROUTE_DISTANCE_KM_THRESHOLD = 25;
const BEIJING_LABEL_OFFSET_X = 0;
const BEIJING_LABEL_OFFSET_Y = 0;
const BEIJING_ICON_SCALE = 1.85;
const BEIJING_LABEL_BASE_X = 0;
const BEIJING_LABEL_BASE_Y = -28;
const BEIJING_ICON_OFFSET_X = 0;
const BEIJING_ICON_OFFSET_Y = -28;
const BOARD_HEADER_LINE = `${"COUNTRY".padEnd(COL_COUNTRY, " ")}${LINE_SEPARATOR}${"CITY".padEnd(
  COL_CITY,
  " ",
)}${LINE_SEPARATOR}${"PAX".padStart(COL_PPL, " ")}`;

const reducedMotionMedia =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

const root = document.getElementById("arrivals-preview-root");
let planeAnimationFrameId = 0;
let boardRotateTimerId = 0;
let boardResumeTimerId = 0;
let boardIdleFlipTimerId = 0;
let boardIdleFlipClearTimerId = 0;
let dataRefreshTimerId = 0;
let beijingDateTimerId = 0;
let mapHintTimerId = 0;
let flapCleanupTimerId = 0;
let cachedAnchorCalibrationKey = "";
let cachedAnchorCalibration = null;

const state = {
  data: null,
  origins: [],
  routes: [],
  flatRows: [],
  rowByOriginId: new Map(),
  routeById: new Map(),
  routeGroupsByRouteId: new Map(),
  routePathNodesByRouteId: new Map(),
  originNodesByRouteId: new Map(),
  planeNodesByRouteId: new Map(),
  boardRowNodesByRouteId: new Map(),
  routesGroupNode: null,
  mapSvgNode: null,
  mapBoardNode: null,
  mapCalloutNode: null,
  mapCalloutBgNode: null,
  mapCalloutTextNode: null,
  mapHintNode: null,
  mapFocusChipNode: null,
  mapFocusChipTextNode: null,
  disclaimerToggleNode: null,
  disclaimerPanelNode: null,
  boardDisclaimerToggleNode: null,
  boardDisclaimerPanelNode: null,
  mapGeoBounds: { ...MAP_GEO_BOUNDS_DEFAULT },
  worldLandPathMarkup: "",
  showProjectionDebug:
    typeof window !== "undefined" &&
    typeof window.location !== "undefined" &&
    new URLSearchParams(window.location.search).get(GEO_DEBUG_PARAM) === "1",
  hubNode: null,
  planeTracks: [],
  routePingTimers: new Map(),
  routePingIds: new Set(),
  pendingRoutePingIds: new Set(),
  hubPingTimerId: 0,
  selectedOriginId: null,
  hoveredOriginId: null,
  hoveredOriginKey: null,
  pendingScrollOriginId: null,
  pendingFocusRouteId: null,
  rowFlipSnapshot: null,
  boardPageIndex: 0,
  boardRotationPaused: false,
  mapZoom: MAP_MIN_ZOOM,
  mapCenterX: MAP_VIEWBOX.width / 2,
  mapCenterY: MAP_VIEWBOX.height / 2,
  mapViewport: {
    x: 0,
    y: 0,
    width: MAP_VIEWBOX.width,
    height: MAP_VIEWBOX.height,
  },
  mapPointers: new Map(),
  mapPanPointerId: null,
  mapLastClientX: 0,
  mapLastClientY: 0,
  mapDragDistance: 0,
  mapPinchStartDistance: 0,
  mapPinchStartZoom: MAP_MIN_ZOOM,
  mapPinchAnchorWorldX: 0,
  mapPinchAnchorWorldY: 0,
  mapSuppressClick: false,
  mapHintVisible: false,
  prefersReducedMotion: Boolean(reducedMotionMedia && reducedMotionMedia.matches),
  beijingDateLabel: "",
  disclaimerOpen: false,
  boardDisclaimerOpen: false,
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeBoardText(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9 .&/+\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function padRight(value, length) {
  const normalized = normalizeBoardText(value);
  return (normalized + " ".repeat(length)).slice(0, length);
}

function padLeft(value, length) {
  const normalized = normalizeBoardText(value);
  return (" ".repeat(length) + normalized).slice(-length);
}

function formatBoardLine(country, city, people) {
  const left = padRight(country, COL_COUNTRY);
  const middle = padRight(city, COL_CITY);
  const right = padLeft(String(people), COL_PPL);
  return `${left}${LINE_SEPARATOR}${middle}${LINE_SEPARATOR}${right}`;
}

function buildBoardFlapLine(line, previousLine, options = {}) {
  const currentLine = (line || "").padEnd(BOARD_LINE_LENGTH, " ").slice(0, BOARD_LINE_LENGTH);
  const fallbackPrevious = previousLine == null ? currentLine : previousLine;
  const previous = String(fallbackPrevious).padEnd(BOARD_LINE_LENGTH, " ").slice(0, BOARD_LINE_LENGTH);
  const animateChanges = Boolean(options.animateChanges) && !state.prefersReducedMotion;
  const isHeader = Boolean(options.isHeader);
  const seed = String(options.idSeed || "line");
  const changedOrderByIndex = new Map();

  if (animateChanges) {
    let changeOrder = 0;
    for (let index = 0; index < BOARD_LINE_LENGTH; index += 1) {
      if ((previous[index] || " ") !== (currentLine[index] || " ")) {
        changedOrderByIndex.set(index, changeOrder);
        changeOrder += 1;
      }
    }
  }

  const cells = [...currentLine]
    .map((character, index) => {
      const previousCharacter = previous[index] || " ";
      const changeOrder = changedOrderByIndex.get(index);
      const isChanged = typeof changeOrder === "number";
      const jitter = hashString(`${seed}-${index}`) % (FLAP_STAGGER_JITTER_MS + 1);
      const delay =
        FLAP_ROW_LEAD_IN_MS +
        (isChanged ? changeOrder * FLAP_STAGGER_BASE_MS : 0) +
        (isChanged ? jitter : 0);
      const isNumericColumn = index >= BOARD_LINE_LENGTH - COL_PPL;
      const duration = isNumericColumn ? FLAP_DURATION_NUMERIC_MS : FLAP_DURATION_MS;
      const isSeparator = character === "·";

      const classes = [
        "arrivals-board__flap-cell",
        isHeader ? "arrivals-board__flap-cell--header" : "",
        character === " " ? "arrivals-board__flap-cell--blank" : "",
        isSeparator ? "arrivals-board__flap-cell--separator" : "",
        isChanged ? "arrivals-board__flap-cell--flip" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const glyph = character === " " ? "&nbsp;" : escapeHtml(character);
      const styleAttr = isChanged
        ? `style="--flip-delay:${delay}ms;--flip-duration:${duration}ms"`
        : "";

      return `<span
        class="${classes}"
        data-flap-index="${index}"
        data-old-char="${escapeHtml(previousCharacter)}"
        data-new-char="${escapeHtml(character)}"
        ${styleAttr}
        aria-hidden="true"
      ><span class="arrivals-board__flap-glyph">${glyph}</span></span>`;
    })
    .join("");

  return `<span class="arrivals-board__flap-line${isHeader ? " arrivals-board__flap-line--header" : ""}" role="row">${cells}</span>`;
}

function clearBoardRotationTimers() {
  if (boardRotateTimerId) {
    window.clearTimeout(boardRotateTimerId);
    boardRotateTimerId = 0;
  }

  if (boardResumeTimerId) {
    window.clearTimeout(boardResumeTimerId);
    boardResumeTimerId = 0;
  }
}

function clearBoardIdleFlipState() {
  if (!root) {
    return;
  }

  root.querySelectorAll(".arrivals-board__row--idle-panel-flip").forEach((node) => {
    node.classList.remove("arrivals-board__row--idle-panel-flip");
    node.style.removeProperty("--idle-panel-flip-duration");
  });
}

function clearBoardIdleFlipTimers() {
  if (boardIdleFlipTimerId) {
    window.clearTimeout(boardIdleFlipTimerId);
    boardIdleFlipTimerId = 0;
  }

  if (boardIdleFlipClearTimerId) {
    window.clearTimeout(boardIdleFlipClearTimerId);
    boardIdleFlipClearTimerId = 0;
  }

  clearBoardIdleFlipState();
}

function getEligibleIdleFlipRows() {
  const allRows = [...state.boardRowNodesByRouteId.values()].filter((node) => node && node.isConnected);
  if (!allRows.length) {
    return [];
  }

  const preferredRows = allRows.filter(
    (rowNode) =>
      !rowNode.classList.contains("arrivals-board__row--locked") &&
      !rowNode.classList.contains("arrivals-board__row--active"),
  );

  return preferredRows.length ? preferredRows : allRows;
}

function scheduleBoardIdleFlip(customDelayMs) {
  if (boardIdleFlipTimerId || state.prefersReducedMotion) {
    return;
  }

  const rowNodes = getEligibleIdleFlipRows();
  if (!rowNodes.length) {
    return;
  }

  const delay =
    typeof customDelayMs === "number"
      ? customDelayMs
      : BOARD_IDLE_FLIP_MIN_MS + Math.floor(Math.random() * (BOARD_IDLE_FLIP_MAX_MS - BOARD_IDLE_FLIP_MIN_MS + 1));

  boardIdleFlipTimerId = window.setTimeout(() => {
    boardIdleFlipTimerId = 0;
    runBoardIdleFlip();
  }, delay);
}

function runBoardIdleFlip() {
  if (state.prefersReducedMotion) {
    clearBoardIdleFlipTimers();
    return;
  }

  if (state.boardRotationPaused) {
    scheduleBoardIdleFlip(BOARD_RESUME_GRACE_MS + 1200);
    return;
  }

  const rowNodes = getEligibleIdleFlipRows();
  if (!rowNodes.length) {
    scheduleBoardIdleFlip();
    return;
  }

  const selectedIndex = Math.floor(Math.random() * rowNodes.length);
  const rowNode = rowNodes[selectedIndex];
  if (!rowNode) {
    scheduleBoardIdleFlip();
    return;
  }

  clearBoardIdleFlipState();
  const flipDuration =
    BOARD_IDLE_FLIP_DURATION_MIN_MS +
    Math.floor(Math.random() * (BOARD_IDLE_FLIP_DURATION_MAX_MS - BOARD_IDLE_FLIP_DURATION_MIN_MS + 1));

  rowNode.style.setProperty("--idle-panel-flip-duration", `${flipDuration}ms`);
  rowNode.classList.add("arrivals-board__row--idle-panel-flip");

  if (boardIdleFlipClearTimerId) {
    window.clearTimeout(boardIdleFlipClearTimerId);
    boardIdleFlipClearTimerId = 0;
  }

  boardIdleFlipClearTimerId = window.setTimeout(() => {
    boardIdleFlipClearTimerId = 0;
    rowNode.classList.remove("arrivals-board__row--idle-panel-flip");
    rowNode.style.removeProperty("--idle-panel-flip-duration");
  }, flipDuration);

  scheduleBoardIdleFlip();
}

function clearRoutePingTimers() {
  state.routePingTimers.forEach((timerId) => {
    window.clearTimeout(timerId);
  });
  state.routePingTimers.clear();
  state.routePingIds.clear();

  if (state.hubPingTimerId) {
    window.clearTimeout(state.hubPingTimerId);
    state.hubPingTimerId = 0;
  }
}

function clearFlapCleanupTimer() {
  if (flapCleanupTimerId) {
    window.clearTimeout(flapCleanupTimerId);
    flapCleanupTimerId = 0;
  }
}

function scheduleFlapCleanup() {
  clearFlapCleanupTimer();

  if (state.prefersReducedMotion) {
    return;
  }

  flapCleanupTimerId = window.setTimeout(() => {
    flapCleanupTimerId = 0;
    if (!root) {
      return;
    }

    root.querySelectorAll(".arrivals-board__flap-cell--flip").forEach((node) => {
      node.classList.remove("arrivals-board__flap-cell--flip");
    });
  }, FLAP_ROW_LEAD_IN_MS + BOARD_LINE_LENGTH * (FLAP_STAGGER_BASE_MS + FLAP_STAGGER_JITTER_MS) + FLAP_DURATION_MS + 120);
}

function deriveFlatRows(origins) {
  return [...origins]
    .map((origin) => ({
      id: `row-${origin.id}`,
      routeId: origin.id,
      originId: origin.id,
      countryCode: origin.countryCode,
      country: String(origin.country || ""),
      city: String(origin.city || ""),
      people: Number(origin.count) || 0,
    }))
    .sort((a, b) => b.people - a.people || a.country.localeCompare(b.country) || a.city.localeCompare(b.city));
}

function normalizeLongitude(lon) {
  const numericLon = Number(lon);
  if (!Number.isFinite(numericLon)) {
    return 0;
  }

  const normalized = ((((numericLon + 180) % 360) + 360) % 360) - 180;
  if (normalized === -180 && numericLon > 0) {
    return 180;
  }

  return normalized;
}

function projectGeoPointToNormalized(lat, lon) {
  const clampedLat = Math.max(-90, Math.min(90, Number(lat)));
  const normalizedLon = normalizeLongitude(lon);

  return {
    x: (normalizedLon + 180) / 360,
    y: (90 - clampedLat) / 180,
  };
}

function getProjectionDebugEnabled() {
  if (typeof window === "undefined" || typeof window.location === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get(GEO_DEBUG_PARAM) === "1";
}

function formatPathRing(points, shiftX = 0) {
  if (!points || points.length < 3) {
    return "";
  }

  const commands = points.map((point, index) => {
    const x = point.x + shiftX;
    const y = point.y;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  commands.push("Z");
  return commands.join(" ");
}

function getPreferredRingShift(ring, contentBox) {
  if (!ring || !ring.length) {
    return 0;
  }

  const ringCenterX = (Math.min(...ring.map((point) => point.x)) + Math.max(...ring.map((point) => point.x))) / 2;
  const targetCenterX = contentBox.x + contentBox.width / 2;
  const candidates = [-contentBox.width, 0, contentBox.width];

  let bestShift = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  candidates.forEach((shiftX) => {
    const shiftedCenterX = ringCenterX + shiftX;
    const distance = Math.abs(shiftedCenterX - targetCenterX);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestShift = shiftX;
    }
  });

  return bestShift;
}

function unwrapRingPoints(points, wrapWidth) {
  if (!points.length) {
    return [];
  }

  const unwrapped = [];
  let wrapOffset = 0;
  let previousX = null;

  points.forEach((point) => {
    let currentX = point.x + wrapOffset;
    if (previousX != null) {
      const deltaX = currentX - previousX;
      if (deltaX > wrapWidth / 2) {
        wrapOffset -= wrapWidth;
        currentX = point.x + wrapOffset;
      } else if (deltaX < -wrapWidth / 2) {
        wrapOffset += wrapWidth;
        currentX = point.x + wrapOffset;
      }
    }

    unwrapped.push({ x: currentX, y: point.y });
    previousX = currentX;
  });

  return unwrapped;
}

function projectCoordinatesRing(ringCoordinates, contentBox) {
  if (!Array.isArray(ringCoordinates) || !ringCoordinates.length) {
    return [];
  }

  const projected = ringCoordinates
    .map((coordinate) => {
      if (!Array.isArray(coordinate) || coordinate.length < 2) {
        return null;
      }

      const lon = Number(coordinate[0]);
      const lat = Number(coordinate[1]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        return null;
      }

      return projectGeoPoint({ lat, lon }, contentBox);
    })
    .filter(Boolean);

  if (projected.length < 3) {
    return [];
  }

  return unwrapRingPoints(projected, contentBox.width);
}

function buildPolygonPathMarkup(polygonCoordinates, contentBox) {
  if (!Array.isArray(polygonCoordinates) || !polygonCoordinates.length) {
    return "";
  }

  const rings = polygonCoordinates
    .map((ringCoordinates) => projectCoordinatesRing(ringCoordinates, contentBox))
    .filter((ring) => ring.length >= 3);

  if (!rings.length) {
    return "";
  }

  const ringMarkup = rings
    .map((ring) => {
      const shiftX = getPreferredRingShift(ring, contentBox);
      const minX = Math.min(...ring.map((point) => point.x + shiftX));
      const maxX = Math.max(...ring.map((point) => point.x + shiftX));
      if (maxX < contentBox.x - 4 || minX > contentBox.x + contentBox.width + 4) {
        return "";
      }

      return formatPathRing(ring, shiftX);
    })
    .filter(Boolean)
    .join(" ");

  return ringMarkup
    ? [`<path d="${ringMarkup}"></path>`]
    .filter(Boolean)
    .join("")
    : "";
}

function extractWorldGeoPathMarkup(worldGeoJson) {
  if (!worldGeoJson || !Array.isArray(worldGeoJson.features)) {
    return "";
  }

  const contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height);
  const pathMarkup = worldGeoJson.features
    .map((feature) => {
      const featureName =
        feature && feature.properties && typeof feature.properties.name === "string"
          ? feature.properties.name.trim().toUpperCase()
          : "";
      // Antarctica reads like an artifact in this wedding map context; skip it.
      if (featureName === "ANTARCTICA") {
        return "";
      }

      const geometry = feature && feature.geometry ? feature.geometry : null;
      if (!geometry || !geometry.type || !geometry.coordinates) {
        return "";
      }

      if (geometry.type === "Polygon") {
        return buildPolygonPathMarkup(geometry.coordinates, contentBox);
      }

      if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
        return geometry.coordinates
          .map((polygonCoordinates) => buildPolygonPathMarkup(polygonCoordinates, contentBox))
          .join("");
      }

      return "";
    })
    .join("");

  return pathMarkup;
}

async function fetchWorldGeoPathMarkup() {
  const response = await fetch(WORLD_GEOJSON_HREF, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`World GeoJSON returned ${response.status}`);
  }

  const worldGeoJson = await response.json();
  return extractWorldGeoPathMarkup(worldGeoJson);
}

function getMapContentBox(containerWidth, containerHeight) {
  const width = Math.max(1, Number(containerWidth) || 1);
  const height = Math.max(1, Number(containerHeight) || 1);
  const sourceBounds = state.mapGeoBounds || MAP_GEO_BOUNDS_DEFAULT;
  const scaleX = width / MAP_VIEWBOX.width;
  const scaleY = height / MAP_VIEWBOX.height;
  const scaledBounds = {
    x: sourceBounds.x * scaleX,
    y: sourceBounds.y * scaleY,
    width: sourceBounds.width * scaleX,
    height: sourceBounds.height * scaleY,
  };
  const applyContentInset = (box) => {
    const insetScale = Math.max(0.8, Math.min(1, MAP_CONTENT_INSET_SCALE));
    const nextWidth = box.width * insetScale;
    const nextHeight = box.height * insetScale;
    return {
      x: box.x + (box.width - nextWidth) / 2,
      y: box.y + (box.height - nextHeight) / 2,
      width: nextWidth,
      height: nextHeight,
    };
  };

  if (MAP_PROJECTION.type !== "equirectangular") {
    return applyContentInset(scaledBounds);
  }

  const sourceAspectRatio = scaledBounds.width / scaledBounds.height;
  if (sourceAspectRatio > EQUIRECTANGULAR_ASPECT_RATIO) {
    const fitWidth = scaledBounds.height * EQUIRECTANGULAR_ASPECT_RATIO;
    return applyContentInset({
      x: scaledBounds.x + (scaledBounds.width - fitWidth) / 2,
      y: scaledBounds.y,
      width: fitWidth,
      height: scaledBounds.height,
    });
  }

  if (sourceAspectRatio < EQUIRECTANGULAR_ASPECT_RATIO) {
    const fitHeight = scaledBounds.width / EQUIRECTANGULAR_ASPECT_RATIO;
    return applyContentInset({
      x: scaledBounds.x,
      y: scaledBounds.y + (scaledBounds.height - fitHeight) / 2,
      width: scaledBounds.width,
      height: fitHeight,
    });
  }

  return applyContentInset(scaledBounds);
}

function fitLinearCalibration(pairs, fallbackScale, fallbackOffset) {
  if (!pairs.length) {
    return { scale: fallbackScale, offset: fallbackOffset };
  }

  const sums = pairs.reduce(
    (accumulator, pair) => ({
      count: accumulator.count + 1,
      sumX: accumulator.sumX + pair.x,
      sumY: accumulator.sumY + pair.y,
      sumXX: accumulator.sumXX + pair.x * pair.x,
      sumXY: accumulator.sumXY + pair.x * pair.y,
    }),
    { count: 0, sumX: 0, sumY: 0, sumXX: 0, sumXY: 0 },
  );

  const denominator = sums.count * sums.sumXX - sums.sumX * sums.sumX;
  if (Math.abs(denominator) < 1e-9) {
    return { scale: fallbackScale, offset: fallbackOffset };
  }

  const scale = (sums.count * sums.sumXY - sums.sumX * sums.sumY) / denominator;
  const offset = (sums.sumY - scale * sums.sumX) / sums.count;
  return { scale, offset };
}

function getAnchorCalibration() {
  const calibration = MAP_PROJECTION.calibration || {};
  const anchors = Array.isArray(calibration.anchors) ? calibration.anchors : [];
  const cacheKey = JSON.stringify(anchors);
  if (cacheKey === cachedAnchorCalibrationKey) {
    return cachedAnchorCalibration;
  }

  cachedAnchorCalibrationKey = cacheKey;
  cachedAnchorCalibration = null;

  if (anchors.length < 2) {
    return null;
  }

  const xPairs = [];
  const yPairs = [];

  anchors.forEach((anchor) => {
    const lat = Math.max(-90, Math.min(90, Number(anchor.lat)));
    const lon = normalizeLongitude(anchor.lon);
    const targetX = Number(anchor.x);
    const targetY = Number(anchor.y);
    if (![lat, lon, targetX, targetY].every(Number.isFinite)) {
      return;
    }

    const normalizedPoint = projectGeoPointToNormalized(lat, lon);
    xPairs.push({ x: normalizedPoint.x, y: targetX });
    yPairs.push({ x: normalizedPoint.y, y: targetY });
  });

  if (xPairs.length < 2 || yPairs.length < 2) {
    return null;
  }

  const xCalibration = fitLinearCalibration(xPairs, 1, 0);
  const yCalibration = fitLinearCalibration(yPairs, 1, 0);

  cachedAnchorCalibration = {
    scaleX: xCalibration.scale,
    offsetX: xCalibration.offset,
    scaleY: yCalibration.scale,
    offsetY: yCalibration.offset,
  };

  return cachedAnchorCalibration;
}

function applyProjectionCalibration(projectedPoint, contentBox) {
  const calibration = MAP_PROJECTION.calibration;
  if (!calibration || !calibration.enabled) {
    return projectedPoint;
  }

  const normalizedX = (projectedPoint.x - contentBox.x) / contentBox.width;
  const normalizedY = (projectedPoint.y - contentBox.y) / contentBox.height;
  const anchorCalibration = getAnchorCalibration();
  const scaleX = (anchorCalibration ? anchorCalibration.scaleX : 1) * calibration.scaleX;
  const scaleY = (anchorCalibration ? anchorCalibration.scaleY : 1) * calibration.scaleY;
  const offsetX = (anchorCalibration ? anchorCalibration.offsetX : 0) + calibration.offsetX;
  const offsetY = (anchorCalibration ? anchorCalibration.offsetY : 0) + calibration.offsetY;
  const calibratedX = normalizedX * scaleX + offsetX;
  const calibratedY = normalizedY * scaleY + offsetY;

  return {
    x: contentBox.x + calibratedX * contentBox.width,
    y: contentBox.y + calibratedY * contentBox.height,
  };
}

function projectGeoPoint(point, contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height)) {
  const normalized = projectGeoPointToNormalized(point.lat, point.lon);
  const projectedPoint = {
    x: contentBox.x + normalized.x * contentBox.width,
    y: contentBox.y + normalized.y * contentBox.height,
  };

  return applyProjectionCalibration(projectedPoint, contentBox);
}

function getRouteCurveBias(routeKey) {
  if (!routeKey) {
    return 0;
  }

  const seed = hashString(String(routeKey));
  return ((seed % 1001) / 1000) * 2 - 1;
}

function buildQuadraticArcPath(start, end, curveBias = 0) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const arcLift = Math.min(138, Math.max(22, distance * 0.34));
  const lateralLift = Math.min(26, Math.max(8, distance * 0.052)) * curveBias;
  const verticalLift = Math.min(20, Math.max(6, distance * 0.06)) * curveBias;
  const controlX = (start.x + end.x) / 2 + lateralLift;
  const controlY = (start.y + end.y) / 2 - (arcLift + verticalLift);

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function getShortestWrappedPair(origin, destination, contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height)) {
  const start = { ...origin };
  const end = { ...destination };
  const dx = end.x - start.x;
  const wrapWidth = contentBox.width;

  if (dx > wrapWidth / 2) {
    start.x += wrapWidth;
  } else if (dx < -wrapWidth / 2) {
    end.x += wrapWidth;
  }

  return { start, end };
}

function buildWrappedArcPaths(
  origin,
  destination,
  contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height),
  curveBias = 0,
) {
  const { start, end } = getShortestWrappedPair(origin, destination, contentBox);
  const offsets = [-contentBox.width, 0, contentBox.width];

  return offsets
    .map((offset) => {
      const shiftedStart = { x: start.x + offset, y: start.y };
      const shiftedEnd = { x: end.x + offset, y: end.y };

      if (
        Math.max(shiftedStart.x, shiftedEnd.x) < contentBox.x - 16 ||
        Math.min(shiftedStart.x, shiftedEnd.x) > contentBox.x + contentBox.width + 16
      ) {
        return null;
      }

      return {
        d: buildQuadraticArcPath(shiftedStart, shiftedEnd, curveBias),
        start: shiftedStart,
        end: shiftedEnd,
      };
    })
    .filter(Boolean);
}

function isPointWithinMapContent(point, contentBox) {
  if (!point || !contentBox) {
    return false;
  }

  return (
    point.x >= contentBox.x &&
    point.x <= contentBox.x + contentBox.width &&
    point.y >= contentBox.y &&
    point.y <= contentBox.y + contentBox.height
  );
}

function getPlanePathIndex(wrappedPaths, origin, destination, contentBox) {
  if (!Array.isArray(wrappedPaths) || wrappedPaths.length === 0) {
    return -1;
  }

  // Prefer the segment whose visible start point is the actual origin city.
  const originPathIndex = wrappedPaths.findIndex((path) => {
    if (!isPointWithinMapContent(path.start, contentBox)) {
      return false;
    }

    const xDelta = Math.abs(path.start.x - origin.x);
    const yDelta = Math.abs(path.start.y - origin.y);
    return xDelta < 0.5 && yDelta < 0.5;
  });

  if (originPathIndex >= 0) {
    return originPathIndex;
  }

  // Fallback to destination visibility so planes still converge into Beijing.
  const destinationPathIndex = wrappedPaths.findIndex((path) => {
    if (!isPointWithinMapContent(path.end, contentBox)) {
      return false;
    }

    const xDelta = Math.abs(path.end.x - destination.x);
    const yDelta = Math.abs(path.end.y - destination.y);
    return xDelta < 0.5 && yDelta < 0.5;
  });

  if (destinationPathIndex >= 0) {
    return destinationPathIndex;
  }

  const firstVisiblePathIndex = wrappedPaths.findIndex(
    (path) => isPointWithinMapContent(path.start, contentBox) || isPointWithinMapContent(path.end, contentBox),
  );

  return firstVisiblePathIndex >= 0 ? firstVisiblePathIndex : 0;
}

function deriveRoutes(origins, destination) {
  const sorted = [...origins].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  const maxCount = sorted.reduce((highest, origin) => Math.max(highest, Number(origin.count) || 0), 0);

  const derivePlaneCount = (count) => {
    const safeCount = Math.max(0, Number(count) || 0);
    if (safeCount <= 0 || maxCount <= 0) {
      return PLANE_MIN_PER_ROUTE;
    }

    // Proportional planes per route with a hard cap:
    // lowest non-zero PAX still gets one plane, higher PAX gets more.
    const normalized = Math.max(0, Math.min(1, safeCount / maxCount));
    const scaled = normalized * (PLANE_MAX_PER_ROUTE - PLANE_MIN_PER_ROUTE);
    return Math.max(
      PLANE_MIN_PER_ROUTE,
      Math.min(PLANE_MAX_PER_ROUTE, PLANE_MIN_PER_ROUTE + Math.floor(scaled + Number.EPSILON)),
    );
  };

  return sorted.map((origin, index) => {
    const originLat = Number(origin.lat);
    const originLon = Number(origin.lon);
    const canPlot = origin.plot !== false && Number.isFinite(originLat) && Number.isFinite(originLon);
    const routeOrigin = canPlot ? { lat: originLat, lon: originLon } : { lat: destination.lat, lon: destination.lon };
    const routeDestination = { lat: destination.lat, lon: destination.lon };
    const isLocal = canPlot ? haversineDistanceKm(routeOrigin, routeDestination) <= LOCAL_ROUTE_DISTANCE_KM_THRESHOLD : false;

    return {
      routeId: origin.id,
      id: `route-${origin.id}`,
      originId: origin.id,
      originCity: origin.city,
      country: origin.country,
      countryCode: origin.countryCode,
      origin: routeOrigin,
      destination: routeDestination,
      count: origin.count,
      plot: canPlot,
      geocodeStatus: origin.geocodeStatus || (canPlot ? "resolved" : "unresolved"),
      planeCount: !canPlot || isLocal ? 0 : derivePlaneCount(origin.count),
      rank: index + 1,
      isTopRoute: canPlot && !isLocal && index < 6,
      isLocal,
    };
  });
}

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

function haversineDistanceKm(fromPoint, toPoint) {
  const earthRadiusKm = 6371;
  const lat1 = toRadians(fromPoint.lat);
  const lat2 = toRadians(toPoint.lat);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(toPoint.lon - fromPoint.lon);
  const sinHalfLat = Math.sin(deltaLat / 2);
  const sinHalfLon = Math.sin(deltaLon / 2);
  const a = sinHalfLat * sinHalfLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfLon * sinHalfLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistanceKm(distanceKm) {
  const safeDistance = Number.isFinite(distanceKm) ? Math.max(0, distanceKm) : 0;
  const rounded = Math.round(safeDistance / 10) * 10;
  return `${new Intl.NumberFormat("en-US").format(rounded)} KM`;
}

function getArrivalsTimestampLabel(lastUpdatedIso) {
  const parsedDate =
    typeof lastUpdatedIso === "string" && lastUpdatedIso.trim().length > 0 ? new Date(lastUpdatedIso) : null;
  const hasValidIso = parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime());
  if (!hasValidIso) {
    return "Updated: Pending RSVP timestamp · Based on RSVP timestamps";
  }

  const displayDate = parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: BEIJING_TIME_ZONE,
  });

  return `Updated: ${displayDate} · Based on RSVP timestamps`;
}

function buildMapStatsSummary(routes) {
  if (!Array.isArray(routes) || !routes.length) {
    return "No arrivals data";
  }

  const inboundCount = routes.reduce((sum, route) => sum + (Number(route.count) || 0), 0);
  const cityCount = routes.length;
  const countryCount = new Set(routes.map((route) => route.countryCode || route.country)).size;
  const farthestRoute = routes.reduce((farthest, route) => {
    if (!route || !route.plot) return farthest;
    const distance = haversineDistanceKm(route.origin, route.destination);
    if (!Number.isFinite(distance)) return farthest;
    if (!farthest || distance > farthest.distance) {
      return { route, distance };
    }
    return farthest;
  }, null);
  const farthestCity = farthestRoute ? farthestRoute.route.originCity : "-";
  const farthestDistance = farthestRoute ? formatDistanceKm(farthestRoute.distance) : "-";

  return `${inboundCount} inbound · ${cityCount} cities · ${countryCount} countries · farthest: ${farthestCity} (${farthestDistance})`;
}

function normalizeFocusPoints(points) {
  const offsets = [0, -MAP_VIEWBOX.width, MAP_VIEWBOX.width];
  let best = points;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const offset of offsets) {
    const candidate = points.map((point) => ({ x: point.x + offset, y: point.y }));
    const minX = Math.min(...candidate.map((point) => point.x));
    const maxX = Math.max(...candidate.map((point) => point.x));
    const spread = maxX - minX;
    const offscreenCount = candidate.filter((point) => point.x < -80 || point.x > MAP_VIEWBOX.width + 80).length;
    const score = spread + offscreenCount * 900;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

function calculateRouteFocusViewport(routeId) {
  const route = getRouteById(routeId);
  if (!route) {
    return null;
  }

  const contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height);
  const projectedOrigin = projectGeoPoint(route.origin, contentBox);
  const projectedDestination = projectGeoPoint(route.destination, contentBox);
  const shortestPair = getShortestWrappedPair(projectedOrigin, projectedDestination, contentBox);
  const dx = shortestPair.end.x - shortestPair.start.x;
  const dy = shortestPair.end.y - shortestPair.start.y;
  const distance = Math.hypot(dx, dy);
  const arcLift = Math.min(138, Math.max(22, distance * 0.34));
  const controlPoint = {
    x: (shortestPair.start.x + shortestPair.end.x) / 2,
    y: (shortestPair.start.y + shortestPair.end.y) / 2 - arcLift,
  };

  const normalizedPoints = normalizeFocusPoints([shortestPair.start, shortestPair.end, controlPoint]);
  const minX = Math.min(...normalizedPoints.map((point) => point.x));
  const maxX = Math.max(...normalizedPoints.map((point) => point.x));
  const minY = Math.min(...normalizedPoints.map((point) => point.y));
  const maxY = Math.max(...normalizedPoints.map((point) => point.y));
  const paddingX = 120;
  const paddingY = 96;
  const targetWidth = Math.max(220, maxX - minX + paddingX);
  const targetHeight = Math.max(170, maxY - minY + paddingY);
  const zoom = Math.max(
    MAP_MIN_ZOOM,
    Math.min(MAP_MAX_ZOOM, MAP_VIEWBOX.width / targetWidth, MAP_VIEWBOX.height / targetHeight),
  );

  return {
    zoom,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function zoomToRoute(routeId) {
  const viewport = calculateRouteFocusViewport(routeId);
  if (!viewport) {
    return;
  }

  setMapViewport(viewport.zoom, viewport.centerX, viewport.centerY, { softBounds: false });
}

function buildGridLineMarkup(stepDegrees, majorOnly, contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height)) {
  const longitudeLines = [];
  const latitudeLines = [];

  for (let lon = -180; lon <= 180; lon += stepDegrees) {
    const isMajor = lon % GRID_MAJOR_DEGREES === 0;
    if ((majorOnly && !isMajor) || (!majorOnly && isMajor)) {
      continue;
    }

    const projected = projectGeoPoint({ lat: 0, lon }, contentBox);
    longitudeLines.push(
      `<line x1="${projected.x.toFixed(2)}" y1="${contentBox.y.toFixed(2)}" x2="${projected.x.toFixed(2)}" y2="${(
        contentBox.y + contentBox.height
      ).toFixed(2)}"></line>`,
    );
  }

  for (let lat = -90; lat <= 90; lat += stepDegrees) {
    const isMajor = lat % GRID_MAJOR_DEGREES === 0;
    if ((majorOnly && !isMajor) || (!majorOnly && isMajor)) {
      continue;
    }

    const projected = projectGeoPoint({ lat, lon: 0 }, contentBox);
    latitudeLines.push(
      `<line x1="${contentBox.x.toFixed(2)}" y1="${projected.y.toFixed(2)}" x2="${(contentBox.x + contentBox.width).toFixed(
        2,
      )}" y2="${projected.y.toFixed(2)}"></line>`,
    );
  }

  return {
    longitude: longitudeLines.join(""),
    latitude: latitudeLines.join(""),
  };
}

function buildGridEdgeMarkup(contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height)) {
  const leftX = contentBox.x + 0.18;
  const rightX = contentBox.x + contentBox.width - 0.18;
  const topY = contentBox.y + 0.18;
  const bottomY = contentBox.y + contentBox.height - 0.18;

  return `
    <line x1="${leftX.toFixed(2)}" y1="${contentBox.y.toFixed(2)}" x2="${leftX.toFixed(2)}" y2="${(
      contentBox.y + contentBox.height
    ).toFixed(2)}"></line>
    <line x1="${rightX.toFixed(2)}" y1="${contentBox.y.toFixed(2)}" x2="${rightX.toFixed(2)}" y2="${(
      contentBox.y + contentBox.height
    ).toFixed(2)}"></line>
    <line x1="${contentBox.x.toFixed(2)}" y1="${topY.toFixed(2)}" x2="${(contentBox.x + contentBox.width).toFixed(
      2,
    )}" y2="${topY.toFixed(2)}"></line>
    <line x1="${contentBox.x.toFixed(2)}" y1="${bottomY.toFixed(2)}" x2="${(contentBox.x + contentBox.width).toFixed(
      2,
    )}" y2="${bottomY.toFixed(2)}"></line>
  `;
}

function buildRadarNodes(beijing) {
  return RADAR_CITY_NODES.map((node) => {
    if (node.fromBeijing) {
      return {
        ...node,
        lat: beijing.lat,
        lon: beijing.lon,
      };
    }

    return node;
  });
}

function applyData() {
  state.flatRows = deriveFlatRows(state.origins);
  state.rowByOriginId = new Map(state.flatRows.map((row) => [row.originId, row]));

  const pageCount = getBoardPageCount();
  if (state.boardPageIndex >= pageCount) {
    state.boardPageIndex = 0;
  }

  if (state.selectedOriginId && !state.rowByOriginId.has(state.selectedOriginId)) {
    state.selectedOriginId = null;
  }
}

function getBoardPageCount() {
  if (!state.flatRows.length) {
    return 1;
  }

  return Math.max(1, Math.ceil(state.flatRows.length / BOARD_ROWS_PER_PAGE));
}

function getRowsForPage(pageIndex) {
  const pageCount = getBoardPageCount();
  const safePageIndex = Math.min(Math.max(0, pageIndex), pageCount - 1);
  const start = safePageIndex * BOARD_ROWS_PER_PAGE;
  return state.flatRows.slice(start, start + BOARD_ROWS_PER_PAGE);
}

function getCurrentPageRows() {
  return getRowsForPage(state.boardPageIndex);
}

function getInteractionRouteId() {
  const candidateRouteId = state.selectedOriginId || state.hoveredOriginId || null;
  if (!candidateRouteId) {
    return null;
  }

  const route = getRouteById(candidateRouteId);
  if (!route || route.isLocal || !route.plot) {
    return null;
  }

  return candidateRouteId;
}

function getRoutePathNode(routeId) {
  return state.routePathNodesByRouteId.get(routeId) || null;
}

function getRouteById(routeId) {
  return state.routeById.get(routeId) || null;
}

function normalizeProgress(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(1, numeric));
}

function buildOriginsMap(origins) {
  return new Map(origins.map((origin) => [origin.id, origin]));
}

function getChangedRouteIds(previousOrigins, nextOrigins) {
  const previousById = buildOriginsMap(previousOrigins);
  const nextById = buildOriginsMap(nextOrigins);
  const changed = new Set();

  for (const [id, nextOrigin] of nextById) {
    const previousOrigin = previousById.get(id);
    if (!previousOrigin) {
      changed.add(id);
      continue;
    }

    if (
      previousOrigin.count !== nextOrigin.count ||
      previousOrigin.city !== nextOrigin.city ||
      previousOrigin.country !== nextOrigin.country ||
      previousOrigin.lat !== nextOrigin.lat ||
      previousOrigin.lon !== nextOrigin.lon
    ) {
      changed.add(id);
    }
  }

  for (const id of previousById.keys()) {
    if (!nextById.has(id)) {
      changed.add(id);
    }
  }

  return changed;
}

function shouldShowMapHint() {
  try {
    return window.localStorage.getItem(MAP_INTERACTION_HINT_KEY) !== "1";
  } catch (error) {
    return false;
  }
}

function markMapHintSeen() {
  try {
    window.localStorage.setItem(MAP_INTERACTION_HINT_KEY, "1");
  } catch (error) {
    // Ignore storage failures for private browsing / blocked storage.
  }
}

function updateMapHintNode() {
  if (!state.mapHintNode) {
    return;
  }

  state.mapHintNode.classList.toggle("arrivals-map__zoom-hint--visible", state.mapHintVisible);
}

function hideMapHint(markSeen = true) {
  if (!state.mapHintVisible) {
    return;
  }

  state.mapHintVisible = false;
  if (markSeen) {
    markMapHintSeen();
  }

  if (mapHintTimerId) {
    window.clearTimeout(mapHintTimerId);
    mapHintTimerId = 0;
  }

  updateMapHintNode();
}

function scheduleMapHintAutoHide() {
  if (!state.mapHintVisible || mapHintTimerId) {
    return;
  }

  mapHintTimerId = window.setTimeout(() => {
    mapHintTimerId = 0;
    hideMapHint(true);
  }, 7000);
}

function clampMapZoom(value) {
  return Math.max(MAP_MIN_ZOOM, Math.min(MAP_MAX_ZOOM, Number(value) || MAP_MIN_ZOOM));
}

function getMapViewportFrom(zoom, centerX, centerY, options = {}) {
  const safeZoom = clampMapZoom(zoom);
  const viewportWidth = MAP_VIEWBOX.width / safeZoom;
  const viewportHeight = MAP_VIEWBOX.height / safeZoom;
  const defaultCenterX = MAP_VIEWBOX.width / 2;
  const defaultCenterY = MAP_VIEWBOX.height / 2;

  if (safeZoom <= MAP_MIN_ZOOM + 0.0001) {
    return {
      zoom: MAP_MIN_ZOOM,
      centerX: defaultCenterX,
      centerY: defaultCenterY,
      x: 0,
      y: 0,
      width: MAP_VIEWBOX.width,
      height: MAP_VIEWBOX.height,
    };
  }

  const minCenterX = viewportWidth / 2;
  const maxCenterX = MAP_VIEWBOX.width - viewportWidth / 2;
  const minCenterY = viewportHeight / 2;
  const maxCenterY = MAP_VIEWBOX.height - viewportHeight / 2;
  const useSoftBounds = Boolean(options.softBounds);
  const damping = 0.28;

  const boundValue = (value, minValue, maxValue) => {
    if (!useSoftBounds) {
      return Math.max(minValue, Math.min(maxValue, value));
    }
    if (value < minValue) {
      return minValue - (minValue - value) * damping;
    }
    if (value > maxValue) {
      return maxValue + (value - maxValue) * damping;
    }
    return value;
  };

  const boundedCenterX = boundValue(centerX, minCenterX, maxCenterX);
  const boundedCenterY = boundValue(centerY, minCenterY, maxCenterY);

  return {
    zoom: safeZoom,
    centerX: boundedCenterX,
    centerY: boundedCenterY,
    x: boundedCenterX - viewportWidth / 2,
    y: boundedCenterY - viewportHeight / 2,
    width: viewportWidth,
    height: viewportHeight,
  };
}

function applyMapViewport(viewport = state.mapViewport) {
  if (!state.mapSvgNode || !viewport) {
    return;
  }

  state.mapSvgNode.setAttribute(
    "viewBox",
    `${viewport.x.toFixed(2)} ${viewport.y.toFixed(2)} ${viewport.width.toFixed(2)} ${viewport.height.toFixed(2)}`,
  );
}

function setMapViewport(zoom, centerX, centerY, options = {}) {
  const nextViewport = getMapViewportFrom(zoom, centerX, centerY, options);
  state.mapZoom = nextViewport.zoom;
  state.mapCenterX = nextViewport.centerX;
  state.mapCenterY = nextViewport.centerY;
  state.mapViewport = {
    x: nextViewport.x,
    y: nextViewport.y,
    width: nextViewport.width,
    height: nextViewport.height,
  };

  applyMapViewport(state.mapViewport);
  updateMapPanCapability();
}

function resetMapViewport() {
  setMapViewport(MAP_MIN_ZOOM, MAP_VIEWBOX.width / 2, MAP_VIEWBOX.height / 2, { softBounds: false });
}

function getWorldPointAtClient(clientX, clientY) {
  if (!state.mapSvgNode) {
    return null;
  }

  const rect = state.mapSvgNode.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  const sx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const sy = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  const viewport = state.mapViewport;

  return {
    sx,
    sy,
    worldX: viewport.x + sx * viewport.width,
    worldY: viewport.y + sy * viewport.height,
    rect,
  };
}

function zoomToClientPoint(clientX, clientY, targetZoom) {
  const anchor = getWorldPointAtClient(clientX, clientY);
  if (!anchor) {
    return;
  }

  const zoom = clampMapZoom(targetZoom);
  const viewportWidth = MAP_VIEWBOX.width / zoom;
  const viewportHeight = MAP_VIEWBOX.height / zoom;
  const nextX = anchor.worldX - anchor.sx * viewportWidth;
  const nextY = anchor.worldY - anchor.sy * viewportHeight;
  const nextCenterX = nextX + viewportWidth / 2;
  const nextCenterY = nextY + viewportHeight / 2;

  setMapViewport(zoom, nextCenterX, nextCenterY, { softBounds: false });
}

function zoomByControlFactor(factor) {
  if (!state.mapSvgNode) {
    return;
  }

  const rect = state.mapSvgNode.getBoundingClientRect();
  zoomToClientPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, state.mapZoom * factor);
}

function initializeMapHintState() {
  state.mapHintVisible = shouldShowMapHint();
}

function isMapInteractionTarget(target) {
  return Boolean(
    target && typeof target.closest === "function" && target.closest(".arrivals-map-board"),
  );
}

function isMapSelectableTarget(target) {
  return Boolean(
    target && typeof target.closest === "function" && target.closest("[data-origin-id], [data-route-hit]"),
  );
}

function updateMapPanCapability() {
  if (!state.mapSvgNode) {
    return;
  }

  const canPan = state.mapZoom > MAP_MIN_ZOOM + 0.0001;
  state.mapSvgNode.classList.toggle("arrivals-map__svg--can-pan", canPan);
  if (!canPan) {
    state.mapSvgNode.classList.remove("arrivals-map__svg--panning");
  }
}

function getMapPointerEntries() {
  return [...state.mapPointers.entries()];
}

function setMapPanningActive(isActive) {
  if (!state.mapSvgNode) {
    return;
  }

  state.mapSvgNode.classList.toggle("arrivals-map__svg--panning", Boolean(isActive));
}

function clearMapPointers(options = {}) {
  const snapToBounds = options.snapToBounds !== false;
  state.mapPointers.clear();
  state.mapPanPointerId = null;
  state.mapPinchStartDistance = 0;
  state.mapPinchStartZoom = state.mapZoom;
  state.mapPinchAnchorWorldX = state.mapCenterX;
  state.mapPinchAnchorWorldY = state.mapCenterY;
  state.mapDragDistance = 0;
  setMapPanningActive(false);

  if (snapToBounds) {
    setMapViewport(state.mapZoom, state.mapCenterX, state.mapCenterY, { softBounds: false });
  }
}

function initializePinchFromPointers() {
  const pointerEntries = getMapPointerEntries();
  if (pointerEntries.length < 2) {
    state.mapPinchStartDistance = 0;
    return;
  }

  const firstPointer = pointerEntries[0][1];
  const secondPointer = pointerEntries[1][1];
  const dx = secondPointer.x - firstPointer.x;
  const dy = secondPointer.y - firstPointer.y;
  const distance = Math.hypot(dx, dy);
  if (!distance || !Number.isFinite(distance)) {
    state.mapPinchStartDistance = 0;
    return;
  }

  state.mapPinchStartDistance = distance;
  state.mapPinchStartZoom = state.mapZoom;
  const midpointX = (firstPointer.x + secondPointer.x) / 2;
  const midpointY = (firstPointer.y + secondPointer.y) / 2;
  const anchor = getWorldPointAtClient(midpointX, midpointY);
  if (anchor) {
    state.mapPinchAnchorWorldX = anchor.worldX;
    state.mapPinchAnchorWorldY = anchor.worldY;
  } else {
    state.mapPinchAnchorWorldX = state.mapCenterX;
    state.mapPinchAnchorWorldY = state.mapCenterY;
  }
}

function applyPinchZoomFromPointers() {
  if (!state.mapSvgNode) {
    return;
  }

  const pointerEntries = getMapPointerEntries();
  if (pointerEntries.length < 2 || !state.mapPinchStartDistance) {
    return;
  }

  const firstPointer = pointerEntries[0][1];
  const secondPointer = pointerEntries[1][1];
  const dx = secondPointer.x - firstPointer.x;
  const dy = secondPointer.y - firstPointer.y;
  const distance = Math.hypot(dx, dy);
  if (!distance || !Number.isFinite(distance)) {
    return;
  }

  const targetZoom = clampMapZoom(state.mapPinchStartZoom * (distance / state.mapPinchStartDistance));
  const rect = state.mapSvgNode.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const midpointX = (firstPointer.x + secondPointer.x) / 2;
  const midpointY = (firstPointer.y + secondPointer.y) / 2;
  const sx = Math.max(0, Math.min(1, (midpointX - rect.left) / rect.width));
  const sy = Math.max(0, Math.min(1, (midpointY - rect.top) / rect.height));
  const viewportWidth = MAP_VIEWBOX.width / targetZoom;
  const viewportHeight = MAP_VIEWBOX.height / targetZoom;
  const nextX = state.mapPinchAnchorWorldX - sx * viewportWidth;
  const nextY = state.mapPinchAnchorWorldY - sy * viewportHeight;
  const nextCenterX = nextX + viewportWidth / 2;
  const nextCenterY = nextY + viewportHeight / 2;

  setMapViewport(targetZoom, nextCenterX, nextCenterY, { softBounds: false });
}

function stopPlaneAnimation() {
  if (planeAnimationFrameId) {
    window.cancelAnimationFrame(planeAnimationFrameId);
    planeAnimationFrameId = 0;
  }
}

function wrapXInMapContent(x) {
  const contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height);
  const width = contentBox.width;
  if (!Number.isFinite(x) || !Number.isFinite(width) || width <= 0) {
    return x;
  }

  return ((((x - contentBox.x) % width) + width) % width) + contentBox.x;
}

function setPlanePositionForTrack(track, progress) {
  const safeProgress = normalizeProgress(progress);
  const travelProgress = Math.max(0, Math.min(PLANE_MAX_TRAVEL_PROGRESS, safeProgress * PLANE_MAX_TRAVEL_PROGRESS));
  const distance = travelProgress * track.length;
  const point = track.pathEl.getPointAtLength(distance);
  const lookDistance = Math.min(
    PLANE_TANGENT_LOOK_DISTANCE,
    Math.max(1.4, Math.min(PLANE_TANGENT_LOOK_DISTANCE, track.length * 0.06)),
  );
  const canUseLookAhead = distance + lookDistance <= track.length;
  const lookAheadPoint = canUseLookAhead
    ? track.pathEl.getPointAtLength(Math.min(track.length, distance + lookDistance))
    : point;
  const lookBehindPoint = canUseLookAhead
    ? point
    : track.pathEl.getPointAtLength(Math.max(0, distance - lookDistance));
  const contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height);
  let deltaX = canUseLookAhead ? lookAheadPoint.x - point.x : point.x - lookBehindPoint.x;
  let deltaY = canUseLookAhead ? lookAheadPoint.y - point.y : point.y - lookBehindPoint.y;
  if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) {
    deltaX = canUseLookAhead ? lookAheadPoint.x - lookBehindPoint.x : point.x - lookBehindPoint.x;
    deltaY = canUseLookAhead ? lookAheadPoint.y - lookBehindPoint.y : point.y - lookBehindPoint.y;
  }

  if (contentBox.width > 0) {
    const halfWrapWidth = contentBox.width / 2;
    if (deltaX > halfWrapWidth) {
      deltaX -= contentBox.width;
    } else if (deltaX < -halfWrapWidth) {
      deltaX += contentBox.width;
    }
  }

  const wrappedX = wrapXInMapContent(point.x);
  const angle =
    (Math.atan2(lookAheadPoint.y - point.y, deltaX) * 180) / Math.PI +
    PLANE_HEADING_OFFSET_DEGREES;

  track.planeEl.setAttribute(
    "transform",
    `translate(${wrappedX.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`,
  );

  const fadeIn = Math.min(1, safeProgress / PLANE_EDGE_FADE_PROGRESS);
  const fadeOut = Math.min(1, (1 - safeProgress) / PLANE_EDGE_FADE_PROGRESS);
  const visibility = Math.max(0, Math.min(fadeIn, fadeOut));
  track.planeEl.style.setProperty("--plane-cycle-opacity", visibility.toFixed(3));
}

function positionPlanesAtProgress(progress) {
  if (!state.planeTracks.length) {
    return;
  }

  const safeProgress = normalizeProgress(progress);
  for (const track of state.planeTracks) {
    setPlanePositionForTrack(track, safeProgress);
  }
}

function buildPlaneTracks(container) {
  return Array.from(container.querySelectorAll("[data-plane-id]"))
    .map((planeEl, index) => {
      const planeId = planeEl.getAttribute("data-plane-id");
      const routeId = planeEl.getAttribute("data-plane-route-id") || planeId;
      if (!routeId) return null;

      const pathEl = getRoutePathNode(routeId) || container.querySelector(`[data-plane-route='${routeId}']`);
      if (!pathEl || typeof pathEl.getTotalLength !== "function") return null;

      const length = pathEl.getTotalLength();
      if (!length || !Number.isFinite(length)) return null;

      const route = getRouteById(routeId);
      if (!route) return null;

      const normalizedLength = Math.max(0, Math.min(1, (length - 420) / 1300));
      const durationSeconds = 36 + normalizedLength * 32;
      const routeWeight = Math.max(1, Number(route.count) || 1);

      return {
        routeId: route.routeId,
        pathEl,
        planeEl,
        length,
        speed: 1 / durationSeconds,
        launchDelayMs: 0,
        routeWeight,
        hasLaunched: false,
        phaseSeed: hashString(`${planeId || route.routeId}-plane-${index}`),
      };
    })
    .filter(Boolean);
}

function shuffleInPlace(values) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = values[index];
    values[index] = values[swapIndex];
    values[swapIndex] = current;
  }
  return values;
}

function pickWeightedCandidate(candidates) {
  if (!candidates.length) {
    return null;
  }

  const totalWeight = candidates.reduce((sum, candidate) => sum + Math.max(0, candidate.weight || 0), 0);
  if (!totalWeight) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  let threshold = Math.random() * totalWeight;
  for (const candidate of candidates) {
    threshold -= Math.max(0, candidate.weight || 0);
    if (threshold <= 0) {
      return candidate;
    }
  }

  return candidates[candidates.length - 1];
}

function assignPlaneLaunchSchedule(tracks) {
  if (!tracks.length) {
    return;
  }

  const queueByRouteId = new Map();
  tracks.forEach((track) => {
    const queue = queueByRouteId.get(track.routeId) || [];
    queue.push(track);
    queueByRouteId.set(track.routeId, queue);
  });

  for (const queue of queueByRouteId.values()) {
    shuffleInPlace(queue);
  }

  let launchSlot = 0;
  let lastRouteId = "";

  while (true) {
    const available = Array.from(queueByRouteId.entries())
      .filter(([, queue]) => Array.isArray(queue) && queue.length > 0)
      .map(([routeId, queue]) => ({
        routeId,
        queue,
        weight: Math.max(1, Number(queue[0]?.routeWeight) || 1),
      }));

    if (!available.length) {
      break;
    }

    let candidates = available;
    if (lastRouteId && available.length > 1) {
      const alternateCandidates = available.filter((candidate) => candidate.routeId !== lastRouteId);
      if (alternateCandidates.length) {
        candidates = alternateCandidates;
      }
    }

    const chosen = pickWeightedCandidate(candidates);
    if (!chosen || !chosen.queue.length) {
      break;
    }

    const track = chosen.queue.shift();
    if (!track) {
      break;
    }

    track.launchDelayMs = launchSlot * PLANE_GLOBAL_LAUNCH_INTERVAL_MS;
    track.hasLaunched = false;
    launchSlot += 1;
    lastRouteId = chosen.routeId;
  }
}

function assignPlanePhaseOffsets(tracks) {
  if (!tracks.length) {
    return;
  }

  const slotSize = 1 / tracks.length;
  const maxJitter = slotSize * PLANE_PHASE_JITTER_RATIO;
  const seededTracks = tracks
    .map((track) => ({
      track,
      seed: typeof track.phaseSeed === "number" ? track.phaseSeed : hashString(track.routeId),
    }))
    .sort((left, right) => left.seed - right.seed);

  seededTracks.forEach((item, orderIndex) => {
    const slotCenter = (orderIndex + 0.5) * slotSize;
    const jitterSeed = hashString(`${item.track.routeId}-phase-jitter`) % 1000;
    const jitter = ((jitterSeed / 999) * 2 - 1) * maxJitter;
    item.track.phaseOffset = normalizeProgress(slotCenter + jitter);
  });
}

function startPlaneAnimation(container) {
  stopPlaneAnimation();

  if (state.prefersReducedMotion || !container) {
    state.planeTracks = [];
    return;
  }

  const tracks = buildPlaneTracks(container);
  assignPlaneLaunchSchedule(tracks);
  state.planeTracks = tracks;

  if (!tracks.length) {
    return;
  }

  tracks.forEach((track) => {
    track.hasLaunched = false;
    track.planeEl.style.visibility = "hidden";
    track.planeEl.style.setProperty("--plane-cycle-opacity", "0");
  });

  const startTime = performance.now();

  const animate = (timestamp) => {
    const elapsedMs = timestamp - startTime;

    for (const track of tracks) {
      if (elapsedMs < track.launchDelayMs) {
        continue;
      }

      if (!track.hasLaunched) {
        track.hasLaunched = true;
        track.planeEl.style.visibility = "visible";
      }

      const elapsedSeconds = (elapsedMs - track.launchDelayMs) / 1000;
      const progress = (elapsedSeconds * track.speed) % 1;
      setPlanePositionForTrack(track, progress);
    }

    planeAnimationFrameId = window.requestAnimationFrame(animate);
  };

  planeAnimationFrameId = window.requestAnimationFrame(animate);
}

function renderMessage(message, isError) {
  const safeMessage = escapeHtml(message);
  const loadingVisualMarkup = isError
    ? `<span class="arrivals-preview__message-text">${safeMessage}</span>`
    : `
      <span class="arrivals-preview__message-inline" aria-live="polite" aria-busy="true">
        <span class="arrivals-preview__message-loader" aria-hidden="true"></span>
        <span class="arrivals-preview__message-text">${safeMessage}</span>
      </span>
    `;

  root.innerHTML = `
    <main class="arrivals-preview">
      <section class="arrivals-preview__message${isError ? " arrivals-preview__message--error" : ""}">
        ${loadingVisualMarkup}
      </section>
    </main>
  `;
}

function render() {
  if (!state.data) {
    renderMessage("Loading arrivals preview…", false);
    return;
  }

  const interactionRouteId = getInteractionRouteId();
  const mapViewport = getMapViewportFrom(state.mapZoom, state.mapCenterX, state.mapCenterY, { softBounds: false });
  state.mapZoom = mapViewport.zoom;
  state.mapCenterX = mapViewport.centerX;
  state.mapCenterY = mapViewport.centerY;
  state.mapViewport = {
    x: mapViewport.x,
    y: mapViewport.y,
    width: mapViewport.width,
    height: mapViewport.height,
  };
  const mapContentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height);
  const minorGrid = buildGridLineMarkup(GRID_MINOR_DEGREES, false, mapContentBox);
  const majorGrid = buildGridLineMarkup(GRID_MAJOR_DEGREES, true, mapContentBox);
  const gridEdgeMarkup = buildGridEdgeMarkup(mapContentBox);
  const radarNodes = buildRadarNodes(state.data.beijing);
  const mapStatsSummary = buildMapStatsSummary(state.routes);
  const changedRouteIds = new Set();
  const zoomHintClass = state.mapHintVisible
    ? "arrivals-map__zoom-hint arrivals-map__zoom-hint--visible"
    : "arrivals-map__zoom-hint";
  const geoBoundsRectMarkup = `
    <rect
      id="geo-bounds"
      class="arrivals-map__geo-bounds"
      x="${mapContentBox.x.toFixed(2)}"
      y="${mapContentBox.y.toFixed(2)}"
      width="${mapContentBox.width.toFixed(2)}"
      height="${mapContentBox.height.toFixed(2)}"
      fill="transparent"
      stroke="none"
      aria-hidden="true"
    ></rect>
  `;
  const mapClipPathMarkup = `
    <defs>
      <clipPath id="arrivals-map-grid-clip">
        <rect
          x="${mapContentBox.x.toFixed(2)}"
          y="${mapContentBox.y.toFixed(2)}"
          width="${mapContentBox.width.toFixed(2)}"
          height="${mapContentBox.height.toFixed(2)}"
        ></rect>
      </clipPath>
    </defs>
  `;
  const inlineWorldMapMarkup = state.worldLandPathMarkup
    ? `<g class="arrivals-map__land arrivals-map__land--inline" aria-hidden="true">${state.worldLandPathMarkup}</g>`
    : `
      <g class="arrivals-map__land" aria-hidden="true">
        <image
          class="arrivals-map__base-image"
          href="${WORLD_SVG_FALLBACK_HREF}"
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    `;
  const projectionDebugMarkup = state.showProjectionDebug
    ? `
      <g class="arrivals-map__debug-layer" aria-hidden="true">
        ${GEO_DEBUG_POINTS.map((point) => {
          const projectedPoint = projectGeoPoint(point, mapContentBox);
          return `
            <g class="arrivals-map__debug-point" transform="translate(${projectedPoint.x.toFixed(2)} ${projectedPoint.y.toFixed(2)})">
              <circle class="arrivals-map__debug-point-dot" r="4"></circle>
              <text class="arrivals-map__debug-point-label" x="7" y="-7">${escapeHtml(point.label)}</text>
            </g>
          `;
        }).join("")}
      </g>
    `
    : "";

  const mapRenderableRoutes = state.routes.filter((route) => route.plot && !route.isLocal);
  const planeRoutes = [];
  const routeMarkup = mapRenderableRoutes
    .map((route) => {
      const origin = projectGeoPoint(route.origin, mapContentBox);
      const destination = projectGeoPoint(route.destination, mapContentBox);
      const wrappedPaths = buildWrappedArcPaths(origin, destination, mapContentBox, getRouteCurveBias(route.routeId));

      const selectedPlaneIndex = getPlanePathIndex(wrappedPaths, origin, destination, mapContentBox);

      const pathMarkup = wrappedPaths
        .map((path, pathIndex) => {
          const useForPlane = pathIndex === selectedPlaneIndex;
          if (useForPlane) {
            const totalPlanesForRoute = Math.max(PLANE_MIN_PER_ROUTE, Number(route.planeCount) || PLANE_MIN_PER_ROUTE);
            for (let planeIndex = 0; planeIndex < totalPlanesForRoute; planeIndex += 1) {
              planeRoutes.push({
                routeId: route.routeId,
                planeId: `${route.routeId}::${planeIndex + 1}`,
                origin: path.start,
              });
            }
          }

          const planeAttr = useForPlane ? `data-plane-route="${escapeHtml(route.routeId)}"` : "";
          return `<path
            d="${path.d}"
            class="arrivals-map__route-hit"
            data-route-hit="true"
            data-origin-id="${escapeHtml(route.routeId)}"
            data-hover-source="origin:${escapeHtml(route.routeId)}"
            aria-hidden="true"
          ></path><path
            d="${path.d}"
            class="arrivals-map__route${route.isTopRoute ? " arrivals-map__route--top" : ""}"
            style="--route-intensity:${Math.min(route.count / 12, 1)}"
            ${planeAttr}
          ></path>`;
        })
        .join("");

      return `<g
        class="arrivals-map__route-group"
        data-route-group-id="${escapeHtml(route.routeId)}"
        data-route-id="${escapeHtml(route.routeId)}"
        data-origin-id="${escapeHtml(route.routeId)}"
        data-hover-source="origin:${escapeHtml(route.routeId)}"
        role="button"
        tabindex="0"
        aria-label="Highlight route ${escapeHtml(`${route.originCity} to Beijing`)}"
      >${pathMarkup}</g>`;
    })
    .join("");

  const originsMarkup = mapRenderableRoutes
    .map((route) => {
      const projected = projectGeoPoint(route.origin, mapContentBox);

      return `
        <g
          class="arrivals-map__origin"
          role="button"
          tabindex="0"
          data-origin-id="${escapeHtml(route.routeId)}"
          data-origin-node-route-id="${escapeHtml(route.routeId)}"
          data-city-id="${escapeHtml(route.routeId)}"
          data-hover-source="origin:${escapeHtml(route.routeId)}"
          aria-label="Highlight ${escapeHtml(`${route.originCity}, ${route.country}`)}"
        >
          <circle class="arrivals-map__origin-hit" cx="${projected.x.toFixed(2)}" cy="${projected.y.toFixed(2)}" r="14"></circle>
          <circle class="arrivals-map__origin-pulse" cx="${projected.x.toFixed(2)}" cy="${projected.y.toFixed(2)}" r="8.4"></circle>
          <circle class="arrivals-map__origin-ring" cx="${projected.x.toFixed(2)}" cy="${projected.y.toFixed(2)}" r="5.6"></circle>
          <circle class="arrivals-map__origin-dot-outer" cx="${projected.x.toFixed(2)}" cy="${projected.y.toFixed(2)}" r="3.5"></circle>
          <circle class="arrivals-map__origin-dot" cx="${projected.x.toFixed(2)}" cy="${projected.y.toFixed(2)}" r="2.6"></circle>
        </g>
      `;
    })
    .join("");

  const planesMarkup = state.prefersReducedMotion
    ? ""
    : `
      <g class="arrivals-map__plane-layer" aria-hidden="true" clip-path="url(#arrivals-map-grid-clip)">
        ${planeRoutes
          .map((segment) => {
            return `
          <g
            class="arrivals-map__plane"
            data-plane-id="${escapeHtml(segment.planeId)}"
            data-plane-route-id="${escapeHtml(segment.routeId)}"
            transform="translate(${segment.origin.x.toFixed(2)} ${segment.origin.y.toFixed(2)})"
          >
            <image
              class="arrivals-map__plane-image"
              href="${PLANE_IMAGE_HREF}"
              x="-12"
              y="-6"
              width="24"
              height="12"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        `;
          })
          .join("")}
      </g>
    `;

  const radarNodesMarkup = radarNodes
    .map((node, index) => {
      const projected = projectGeoPoint(node, mapContentBox);
      const pulseDuration = (3.2 + (index % 3) * 0.38 + (node.hub ? 0.28 : 0)).toFixed(2);
      const pulseDelay = (-((index * 0.63) % 3.1)).toFixed(2);
      const coreRadius = node.hub ? 3.6 : 3;
      const pulseRadius = node.hub ? 16.4 : 13;
      const innerRingRadius = node.hub ? 13.4 : 11.5;
      const outerRingRadius = node.hub ? 18 : 14.5;
      const baseLabelX = node.hub ? BEIJING_LABEL_BASE_X : 14;
      const baseLabelY = node.hub ? BEIJING_LABEL_BASE_Y : -12;
      const labelX = baseLabelX + (node.hub ? BEIJING_LABEL_OFFSET_X : 0);
      const labelY = baseLabelY + (node.hub ? BEIJING_LABEL_OFFSET_Y : 0);
      const iconBaseSize = 22;
      const iconSize = node.hub ? iconBaseSize * BEIJING_ICON_SCALE : iconBaseSize;
      const iconCenterOffsetX = node.hub ? BEIJING_ICON_OFFSET_X : 36;
      const iconCenterOffsetY = node.hub ? BEIJING_ICON_OFFSET_Y : -16;
      const iconX = labelX + iconCenterOffsetX - iconSize / 2;
      const iconY = labelY + iconCenterOffsetY - iconSize / 2;
      const iconCenterX = iconX + iconSize / 2;
      const iconCenterY = iconY + iconSize / 2;
      const beijingIconMarkup = node.hub
        ? `<g class="arrivals-map__node-beijing-icon-group" aria-hidden="true">
            <circle
              class="arrivals-map__node-beijing-icon-plate"
              cx="${iconCenterX.toFixed(2)}"
              cy="${iconCenterY.toFixed(2)}"
              r="${(iconSize / 2 + 2).toFixed(2)}"
            ></circle>
            <image
              class="arrivals-map__node-beijing-icon"
              href="${BEIJING_ICON_HREF}"
              xlink:href="${BEIJING_ICON_HREF}"
              x="${iconX.toFixed(2)}"
              y="${iconY.toFixed(2)}"
              width="${iconSize}"
              height="${iconSize}"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>`
        : "";
      const hubRingMarkup = node.hub
        ? `<circle class="arrivals-map__node-ring-hub" r="${(innerRingRadius - 2.15).toFixed(2)}"></circle>`
        : "";

      return `
        <g
          class="arrivals-map__node${node.hub ? " arrivals-map__node--hub" : ""}"
          transform="translate(${projected.x.toFixed(2)} ${projected.y.toFixed(2)})"
          style="--node-pulse-duration:${pulseDuration}s;--node-pulse-delay:${pulseDelay}s"
          ${node.hub ? 'data-node-hub="beijing"' : ""}
          aria-hidden="true"
        >
          <circle class="arrivals-map__node-pulse" r="${pulseRadius.toFixed(2)}"></circle>
          <circle class="arrivals-map__node-ring-secondary" r="${outerRingRadius.toFixed(2)}"></circle>
          ${hubRingMarkup}
          <circle class="arrivals-map__node-ring" r="${innerRingRadius.toFixed(2)}"></circle>
          <circle class="arrivals-map__node-dot-outer" r="${(coreRadius + 0.9).toFixed(2)}"></circle>
          <circle class="arrivals-map__node-dot" r="${coreRadius.toFixed(2)}"></circle>
          ${beijingIconMarkup}
          <text class="arrivals-map__node-label${node.hub ? " arrivals-map__node-label--hub" : ""}" x="${labelX}" y="${labelY}">${escapeHtml(node.label)}</text>
        </g>
      `;
    })
    .join("");

  const currentPageRows = getCurrentPageRows();
  const previousRows = state.rowFlipSnapshot || currentPageRows;
  const totalGuests = state.flatRows.reduce((sum, row) => sum + row.people, 0);
  const lastUpdated = getArrivalsTimestampLabel(state.data?.lastUpdatedIso);
  state.beijingDateLabel = lastUpdated;
  const boardHeaderMarkup = buildBoardFlapLine(BOARD_HEADER_LINE, BOARD_HEADER_LINE, {
    idSeed: "header",
    animateChanges: false,
    isHeader: true,
  });
  const blankBoardLine = " ".repeat(BOARD_LINE_LENGTH);
  const endBoardLine = formatBoardLine("", BOARD_END_LABEL, "");
  const emptyRowsAfterData =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 768px)").matches
      ? BOARD_EMPTY_ROWS_AFTER_DATA_MOBILE
      : BOARD_EMPTY_ROWS_AFTER_DATA;
  const rowsPerSegment = Math.max(1, Math.ceil(Math.max(currentPageRows.length, 1) / BOARD_SEGMENT_COUNT));

  const boardSegmentsMarkup = Array.from({ length: BOARD_SEGMENT_COUNT }, (_, segmentIndex) => {
    const startIndex = segmentIndex * rowsPerSegment;
    const segmentRows = currentPageRows.slice(startIndex, startIndex + rowsPerSegment);

    const segmentRowsMarkup = segmentRows
      .map((row, rowIndex) => {
        const lineIndex = startIndex + rowIndex;
        const isActive = interactionRouteId === row.originId;
        const isLocked = state.selectedOriginId === row.originId;
        const rowClass = [
          "arrivals-board__row",
          isActive ? "arrivals-board__row--active" : "",
          isLocked ? "arrivals-board__row--locked" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const previousRow = previousRows[lineIndex] || null;
        const currentLine = formatBoardLine(row.country, row.city, row.people);
        const previousLine = previousRow
          ? formatBoardLine(previousRow.country, previousRow.city, previousRow.people)
          : " ".repeat(BOARD_LINE_LENGTH);
        const lineLabel = `${row.country}, ${row.city}, ${row.people} people`;
        const hasLineChanged = Boolean(state.rowFlipSnapshot) && previousLine !== currentLine;
        if (hasLineChanged) {
          changedRouteIds.add(row.routeId);
        }

        return `
          <button
            type="button"
            class="${rowClass}"
            data-board-row-origin-id="${escapeHtml(row.routeId)}"
            data-board-row-route-id="${escapeHtml(row.routeId)}"
            data-route-id="${escapeHtml(row.routeId)}"
            data-hover-source="origin:${escapeHtml(row.routeId)}"
            aria-label="${escapeHtml(lineLabel)}"
          >
            <span class="arrivals-board__count-value">${escapeHtml(lineLabel)}</span>
            ${buildBoardFlapLine(currentLine, previousLine, {
              idSeed: `slot-${state.boardPageIndex}-${segmentIndex}-${rowIndex}`,
              animateChanges: Boolean(state.rowFlipSnapshot),
            })}
          </button>
        `;
      })
      .join("");

    const emptyRowsCount = segmentRows.length > 0 ? emptyRowsAfterData : 0;
    const emptyRowsMarkup =
      emptyRowsCount > 0
        ? Array.from({ length: emptyRowsCount }, (_, emptyIndex) => {
            return `
              <div
                class="arrivals-board__row arrivals-board__row--empty"
                aria-hidden="true"
              >
                ${buildBoardFlapLine(blankBoardLine, blankBoardLine, {
                  idSeed: `empty-${state.boardPageIndex}-${segmentIndex}-${emptyIndex}`,
                  animateChanges: false,
                })}
              </div>
            `;
          }).join("")
        : "";
    const isLastRenderedSegment = startIndex + segmentRows.length >= currentPageRows.length;
    const endRowMarkup =
      segmentRows.length > 0 && isLastRenderedSegment
        ? `
          <div class="arrivals-board__row arrivals-board__row--end" aria-hidden="true">
            ${buildBoardFlapLine(endBoardLine, endBoardLine, {
              idSeed: `end-${state.boardPageIndex}-${segmentIndex}`,
              animateChanges: false,
            })}
          </div>
        `
        : "";

    const hasAnyRenderedRows = Boolean(segmentRowsMarkup || emptyRowsMarkup || endRowMarkup);
    const segmentBodyMarkup = hasAnyRenderedRows
      ? `${segmentRowsMarkup}${emptyRowsMarkup}${endRowMarkup}`
      : '<div class="arrivals-board__segment-empty" aria-hidden="true">WAITING FOR ARRIVALS DATA</div>';

    return `
      <section class="arrivals-board__segment" aria-label="Arrival board segment ${segmentIndex + 1}">
        <div class="arrivals-board__columns" aria-hidden="true">
          ${boardHeaderMarkup}
        </div>
        <div class="arrivals-board__table" role="list">
          ${segmentBodyMarkup}
        </div>
      </section>
    `;
  }).join("");

  const mapPanelMarkup = `
    <section class="arrivals-map" aria-label="Arrivals world map">
      <header class="arrivals-map__header">
        <div class="arrivals-map__header-row">
          <div class="arrivals-map__header-copy">
            <p class="arrivals-map__label">${MAP_LABEL}</p>
            <p class="arrivals-map__legend">Dashed lines = travel routes · Dot = city</p>
          </div>
          <div class="arrivals-map__disclaimer" data-disclaimer-node>
            <button
              type="button"
              class="arrivals-map__disclaimer-toggle arrivals-map__control-button${state.disclaimerOpen ? " arrivals-map__disclaimer-toggle--active arrivals-map__control-button--active" : ""}"
              data-disclaimer-toggle
              aria-label="Show disclaimer"
              title="Disclaimer"
              aria-expanded="${state.disclaimerOpen ? "true" : "false"}"
              aria-controls="arrivals-map-disclaimer-panel"
            >
              <span class="arrivals-map__control-icon" aria-hidden="true">ⓘ</span>
            </button>
            <section
              id="arrivals-map-disclaimer-panel"
              class="arrivals-map__disclaimer-panel${state.disclaimerOpen ? " arrivals-map__disclaimer-panel--open" : ""}"
              role="note"
              aria-hidden="${state.disclaimerOpen ? "false" : "true"}"
            >
              <h3 class="arrivals-map__disclaimer-title">Disclaimer</h3>
              <p class="arrivals-map__disclaimer-body">Not a war game. These are wedding flight paths, not missiles.</p>
              <p class="arrivals-map__disclaimer-body">Also: "Live" = RSVP updates. We are not tracking your plane. Promise.</p>
            </section>
          </div>
        </div>
      </header>

      <div class="arrivals-map-board">
        <div class="arrivals-map-board__face arrivals-map-board__face--map">
          <svg
            class="arrivals-map__svg"
            viewBox="${mapViewport.x.toFixed(2)} ${mapViewport.y.toFixed(2)} ${mapViewport.width.toFixed(2)} ${mapViewport.height.toFixed(2)}"
            preserveAspectRatio="xMidYMid meet"
            role="img"
          >
            ${mapClipPathMarkup}
            ${geoBoundsRectMarkup}
            ${inlineWorldMapMarkup}

            <g class="arrivals-map__grid" aria-hidden="true">
              <g class="arrivals-map__grid arrivals-map__grid--minor">
                ${minorGrid.latitude}
                ${minorGrid.longitude}
              </g>
              <g class="arrivals-map__grid arrivals-map__grid--major">
                ${majorGrid.latitude}
                ${majorGrid.longitude}
              </g>
              <g class="arrivals-map__grid arrivals-map__grid--edge">
                ${gridEdgeMarkup}
              </g>
            </g>

            <g class="arrivals-map__nodes">${radarNodesMarkup}</g>
            <g class="arrivals-map__routes-layer" clip-path="url(#arrivals-map-grid-clip)">
              <g class="arrivals-map__routes" aria-hidden="true">${routeMarkup}</g>
              <g class="arrivals-map__origins">${originsMarkup}</g>
            </g>
            ${projectionDebugMarkup}
            ${planesMarkup}
            <g
              class="arrivals-map__callout-svg"
              data-map-callout
              aria-hidden="true"
              style="--fade-ms:${CALLOUT_FADE_MS}ms"
            >
              <rect
                class="arrivals-map__callout-bg"
                data-map-callout-bg
                x="0"
                y="0"
                width="120"
                height="18"
                rx="3"
                ry="3"
              ></rect>
              <circle class="arrivals-map__callout-dot" cx="7" cy="9" r="1.35"></circle>
              <text class="arrivals-map__callout-text" data-map-callout-text x="12" y="12"></text>
            </g>
          </svg>
          <div class="arrivals-map__zoom-controls" role="group" aria-label="Map zoom controls">
            <button type="button" class="arrivals-map__zoom-button arrivals-map__control-button" data-map-zoom="in" aria-label="Zoom in">+</button>
            <button type="button" class="arrivals-map__zoom-button arrivals-map__control-button" data-map-zoom="out" aria-label="Zoom out">-</button>
            <button type="button" class="arrivals-map__zoom-button arrivals-map__control-button" data-map-zoom="reset" aria-label="Reset map view">&#10226;</button>
          </div>
          <p class="${zoomHintClass}" data-map-zoom-hint>Scroll to zoom • Drag to pan</p>
        </div>
      </div>
      <p class="arrivals-map__stats-strip">${escapeHtml(mapStatsSummary)}</p>
    </section>
  `;

  const boardPanelMarkup = `
    <section class="arrivals-board" aria-label="Arrival board" data-arrival-board style="--board-char-count:${BOARD_LINE_LENGTH};">
      <header class="arrivals-board__header">
        <div class="arrivals-board__header-row">
          <h2 class="arrivals-board__title">Arrival Board</h2>
          <div class="arrivals-board__disclaimer" data-board-disclaimer-node>
            <button
              type="button"
              class="arrivals-board__disclaimer-toggle arrivals-map__control-button${state.boardDisclaimerOpen ? " arrivals-board__disclaimer-toggle--active arrivals-map__control-button--active" : ""}"
              data-board-disclaimer-toggle
              aria-label="Show arrival board disclaimer"
              aria-expanded="${state.boardDisclaimerOpen ? "true" : "false"}"
              aria-controls="arrivals-board-disclaimer-panel"
            >
              <span class="arrivals-map__control-icon" aria-hidden="true">ⓘ</span>
            </button>
            <div
              id="arrivals-board-disclaimer-panel"
              class="arrivals-board__disclaimer-panel${state.boardDisclaimerOpen ? " arrivals-board__disclaimer-panel--open" : ""}"
              role="dialog"
              aria-hidden="${state.boardDisclaimerOpen ? "false" : "true"}"
            >
              <h3 class="arrivals-board__disclaimer-title">Disclaimer</h3>
              <p class="arrivals-board__disclaimer-body">${escapeHtml(BOARD_DISCLAIMER_COPY)}</p>
              <img
                class="arrivals-board__disclaimer-image"
                src="${BOARD_DISCLAIMER_IMAGE_HREF}"
                alt="Changi Airport split-flap departure board"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
        <p class="arrivals-board__meta">${totalGuests} GUESTS INBOUND</p>
        <time class="arrivals-board__timestamp">${escapeHtml(lastUpdated)}</time>
      </header>

      <div class="arrivals-board__segments">
        ${boardSegmentsMarkup}
      </div>
    </section>
  `;

  root.innerHTML = `
    <main class="arrivals-preview">
      <section class="arrivals-page" aria-labelledby="arrivals-page-title">
        <svg class="arrivals-page__motif arrivals-page__motif--top" viewBox="0 0 240 120" aria-hidden="true">
          <path d="M52 22 L58 50 L86 38 L66 58 L88 74 L60 68 L62 96 L52 74 L42 96 L44 68 L16 74 L38 58 L18 38 L46 50 Z"></path>
          <path d="M90 58 H188"></path>
          <path d="M132 50 L150 58 L132 66"></path>
          <path d="M162 50 L180 58 L162 66"></path>
        </svg>
        <svg class="arrivals-page__motif arrivals-page__motif--left" viewBox="0 0 240 120" aria-hidden="true">
          <path d="M44 16 V104 M58 18 V102 M72 16 V104"></path>
          <path d="M20 34 C50 36 70 36 94 34"></path>
          <path d="M22 58 C50 60 70 60 94 58"></path>
          <path d="M24 82 C52 84 72 84 96 82"></path>
          <path d="M112 30 C130 46 136 58 142 86"></path>
          <path d="M142 42 C126 52 120 66 118 88"></path>
        </svg>
        <header class="arrivals-page__header">
          <h1 id="arrivals-page-title" class="arrivals-page__title">${ARRIVALS_TITLE_LABEL}</h1>
          <p class="arrivals-page__helper">${ARRIVALS_HELPER_LABEL}</p>
        </header>

        <div class="arrivals-page__content">
          ${mapPanelMarkup}
          ${boardPanelMarkup}
        </div>
      </section>
    </main>
  `;

  cacheInteractiveNodes();
  clearMapPointers({ snapToBounds: false });
  applyMapViewport(state.mapViewport);
  updateMapHintNode();
  if (state.mapHintVisible) {
    scheduleMapHintAutoHide();
  }
  updateInteractionVisuals();

  if (state.mapSvgNode) {
    startPlaneAnimation(state.mapSvgNode);
  } else {
    stopPlaneAnimation();
    state.planeTracks = [];
  }

  if (state.pendingScrollOriginId) {
    scrollBoardRowIntoView(state.pendingScrollOriginId);
    state.pendingScrollOriginId = null;
  }

  const pendingPingRouteIds = new Set([...changedRouteIds, ...state.pendingRoutePingIds]);
  state.pendingRoutePingIds.clear();
  if (pendingPingRouteIds.size > 0) {
    pingRoutes([...pendingPingRouteIds]);
    pingHub();
  }

  scheduleFlapCleanup();
  state.rowFlipSnapshot = null;

  if (!boardRotateTimerId && !state.boardRotationPaused) {
    scheduleNextBoardRotation();
  }

  if (state.prefersReducedMotion) {
    clearBoardIdleFlipTimers();
  } else {
    scheduleBoardIdleFlip();
  }
}

function cacheInteractiveNodes() {
  state.mapSvgNode = root.querySelector(".arrivals-map__svg");
  state.mapBoardNode = root.querySelector(".arrivals-map-board");
  state.routesGroupNode = root.querySelector(".arrivals-map__routes");
  state.mapCalloutNode = root.querySelector("[data-map-callout]");
  state.mapCalloutBgNode = root.querySelector("[data-map-callout-bg]");
  state.mapCalloutTextNode = root.querySelector("[data-map-callout-text]");
  state.mapHintNode = root.querySelector("[data-map-zoom-hint]");
  state.mapFocusChipNode = root.querySelector("[data-map-focus-chip]");
  state.mapFocusChipTextNode = root.querySelector("[data-map-focus-chip-text]");
  state.disclaimerToggleNode = root.querySelector("[data-disclaimer-toggle]");
  state.disclaimerPanelNode = root.querySelector("#arrivals-map-disclaimer-panel");
  state.boardDisclaimerToggleNode = root.querySelector("[data-board-disclaimer-toggle]");
  state.boardDisclaimerPanelNode = root.querySelector("#arrivals-board-disclaimer-panel");
  state.hubNode = root.querySelector("[data-node-hub='beijing']");
  setDisclaimerOpen(state.disclaimerOpen);
  setBoardDisclaimerOpen(state.boardDisclaimerOpen);

  state.routeGroupsByRouteId = new Map();
  state.routePathNodesByRouteId = new Map();
  root.querySelectorAll("[data-route-group-id]").forEach((node) => {
    const routeId = node.getAttribute("data-route-group-id");
    if (!routeId) return;

    state.routeGroupsByRouteId.set(routeId, node);
    const planePathNode = node.querySelector(`[data-plane-route='${routeId}']`);
    const fallbackPathNode = node.querySelector("path");
    if (planePathNode || fallbackPathNode) {
      state.routePathNodesByRouteId.set(routeId, planePathNode || fallbackPathNode);
    }
  });

  state.originNodesByRouteId = new Map();
  root.querySelectorAll("[data-origin-node-route-id]").forEach((node) => {
    const routeId = node.getAttribute("data-origin-node-route-id");
    if (!routeId) return;
    state.originNodesByRouteId.set(routeId, node);
  });

  state.planeNodesByRouteId = new Map();
  root.querySelectorAll("[data-plane-route-id]").forEach((node) => {
    const routeId = node.getAttribute("data-plane-route-id");
    if (!routeId) return;
    const existingNodes = state.planeNodesByRouteId.get(routeId);
    if (existingNodes) {
      existingNodes.push(node);
    } else {
      state.planeNodesByRouteId.set(routeId, [node]);
    }
  });

  state.boardRowNodesByRouteId = new Map();
  root.querySelectorAll("[data-board-row-route-id]").forEach((node) => {
    const routeId = node.getAttribute("data-board-row-route-id");
    if (!routeId) return;
    state.boardRowNodesByRouteId.set(routeId, node);
  });

  updateMapPanCapability();
}

function scrollBoardRowIntoView(routeId) {
  if (!routeId) {
    return;
  }

  const escapedRouteId = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(routeId) : routeId;
  const rowNode =
    state.boardRowNodesByRouteId.get(routeId) || root.querySelector(`[data-board-row-origin-id="${escapedRouteId}"]`);

  if (!rowNode) {
    return;
  }

  rowNode.scrollIntoView({
    block: "nearest",
    behavior: state.prefersReducedMotion ? "auto" : "smooth",
  });
}

function hideMapCallout() {
  if (!state.mapCalloutNode) {
    return;
  }

  state.mapCalloutNode.classList.remove("arrivals-map__callout-svg--visible");
  state.mapCalloutNode.setAttribute("aria-hidden", "true");
}

function setDisclaimerOpen(isOpen) {
  state.disclaimerOpen = Boolean(isOpen);

  const toggleNode =
    state.disclaimerToggleNode || (root ? root.querySelector("[data-disclaimer-toggle]") : null);
  const panelNode =
    state.disclaimerPanelNode || (root ? root.querySelector("#arrivals-map-disclaimer-panel") : null);

  if (toggleNode) {
    toggleNode.classList.toggle("arrivals-map__disclaimer-toggle--active", state.disclaimerOpen);
    toggleNode.classList.toggle("arrivals-map__control-button--active", state.disclaimerOpen);
    toggleNode.setAttribute("aria-expanded", state.disclaimerOpen ? "true" : "false");
  }

  if (panelNode) {
    panelNode.classList.toggle("arrivals-map__disclaimer-panel--open", state.disclaimerOpen);
    panelNode.setAttribute("aria-hidden", state.disclaimerOpen ? "false" : "true");
  }

  // Keep disclaimer interactions from altering current map viewport.
  clearMapPointers({ snapToBounds: false });
  applyMapViewport(state.mapViewport);
  updateMapPanCapability();
}

function setBoardDisclaimerOpen(isOpen) {
  state.boardDisclaimerOpen = Boolean(isOpen);

  const toggleNode =
    state.boardDisclaimerToggleNode || (root ? root.querySelector("[data-board-disclaimer-toggle]") : null);
  const panelNode =
    state.boardDisclaimerPanelNode || (root ? root.querySelector("#arrivals-board-disclaimer-panel") : null);

  if (toggleNode) {
    toggleNode.classList.toggle("arrivals-board__disclaimer-toggle--active", state.boardDisclaimerOpen);
    toggleNode.classList.toggle("arrivals-map__control-button--active", state.boardDisclaimerOpen);
    toggleNode.setAttribute("aria-expanded", state.boardDisclaimerOpen ? "true" : "false");
  }

  if (panelNode) {
    panelNode.classList.toggle("arrivals-board__disclaimer-panel--open", state.boardDisclaimerOpen);
    panelNode.setAttribute("aria-hidden", state.boardDisclaimerOpen ? "false" : "true");
  }
}

function updateMapCallout(routeId) {
  if (!state.mapCalloutNode || !state.mapCalloutBgNode || !state.mapCalloutTextNode) {
    return;
  }

  if (!routeId) {
    hideMapCallout();
    return;
  }

  const route = getRouteById(routeId);
  if (!route) {
    hideMapCallout();
    return;
  }

  const contentBox = getMapContentBox(MAP_VIEWBOX.width, MAP_VIEWBOX.height);
  const projected = projectGeoPoint(route.origin, contentBox);
  const distanceKm = haversineDistanceKm(route.origin, route.destination);
  const label = `${normalizeBoardText(route.originCity)} \u2192 BEIJING \u00B7 PAX ${String(route.count).padStart(
    2,
    "0",
  )} \u00B7 ${formatDistanceKm(distanceKm)}`;
  state.mapCalloutTextNode.textContent = label;

  const measuredTextWidth =
    typeof state.mapCalloutTextNode.getComputedTextLength === "function"
      ? state.mapCalloutTextNode.getComputedTextLength()
      : 0;
  const fallbackTextWidth = label.length * 5.25;
  const bubbleWidth = Math.max(84, Math.ceil((measuredTextWidth || fallbackTextWidth) + 18));
  const bubbleHeight = 18;

  state.mapCalloutBgNode.setAttribute("width", String(bubbleWidth));

  const offsetX = 12;
  const offsetY = -20;
  const rawX = projected.x + offsetX;
  const rawY = projected.y + offsetY;
  const x = Math.max(4, Math.min(MAP_VIEWBOX.width - bubbleWidth - 4, rawX));
  const y = Math.max(4, Math.min(MAP_VIEWBOX.height - bubbleHeight - 4, rawY));

  state.mapCalloutNode.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  state.mapCalloutNode.classList.add("arrivals-map__callout-svg--visible");
  state.mapCalloutNode.setAttribute("aria-hidden", "false");
}

function updateFocusChip() {
  if (!state.mapFocusChipNode || !state.mapFocusChipTextNode) {
    return;
  }

  const focusedRoute = state.selectedOriginId ? getRouteById(state.selectedOriginId) : null;
  if (!focusedRoute) {
    state.mapFocusChipTextNode.textContent = "";
    state.mapFocusChipNode.classList.remove("arrivals-map__focus-chip--visible");
    state.mapFocusChipNode.setAttribute("aria-hidden", "true");
    return;
  }

  state.mapFocusChipTextNode.textContent = `Focused on: ${normalizeBoardText(focusedRoute.originCity)} \u2192 BEIJING`;
  state.mapFocusChipNode.classList.add("arrivals-map__focus-chip--visible");
  state.mapFocusChipNode.setAttribute("aria-hidden", "false");
}

function updateInteractionVisuals() {
  const activeRouteId = getInteractionRouteId();
  const hasActiveRoute = Boolean(activeRouteId);
  const lockedRouteId = state.selectedOriginId;
  let activeGroupNode = null;

  for (const route of state.routes) {
    const routeId = route.routeId;
    const routeGroupNode = state.routeGroupsByRouteId.get(routeId);
    const originGroupNode = state.originNodesByRouteId.get(routeId);
    const planeNodes = state.planeNodesByRouteId.get(routeId) || [];
    const boardRowNode = state.boardRowNodesByRouteId.get(routeId);

    const isLocked = lockedRouteId === routeId;
    const isActive = activeRouteId === routeId;
    const isRoutePinged = state.routePingIds.has(routeId);
    const isDimmedByHighlight = false;
    const isDimmed = isDimmedByHighlight;

    if (routeGroupNode) {
      routeGroupNode.classList.toggle("arrivals-map__route-group--active", isActive);
      routeGroupNode.classList.toggle("arrivals-map__route-group--locked", isLocked);
      routeGroupNode.classList.toggle("arrivals-map__route-group--dim", isDimmedByHighlight);
      routeGroupNode.classList.toggle("arrivals-map__route-group--ping", isRoutePinged);
    }

    if (originGroupNode) {
      originGroupNode.classList.toggle("arrivals-map__origin--active", isActive);
      originGroupNode.classList.toggle("arrivals-map__origin--locked", isLocked);
      originGroupNode.classList.toggle("arrivals-map__origin--dim", isDimmed);
    }

    if (planeNodes.length) {
      planeNodes.forEach((planeNode) => {
        planeNode.classList.toggle("arrivals-map__plane--active", isActive || isLocked);
        planeNode.classList.toggle("arrivals-map__plane--muted", isDimmedByHighlight);
      });
    }

    if (boardRowNode) {
      boardRowNode.classList.toggle("arrivals-board__row--active", isActive);
      boardRowNode.classList.toggle("arrivals-board__row--locked", isLocked);
    }

    if (isActive && routeGroupNode) {
      activeGroupNode = routeGroupNode;
    }
  }

  if (activeGroupNode && state.routesGroupNode && activeGroupNode.parentNode === state.routesGroupNode) {
    state.routesGroupNode.appendChild(activeGroupNode);
  }

  if (state.hubNode) {
    state.hubNode.classList.toggle("arrivals-map__node--route-active", hasActiveRoute);
  }

  updateMapCallout(activeRouteId);
}

function pingRoutes(routeIds) {
  const uniqueRouteIds = [...new Set(routeIds)].filter((routeId) => state.routeById.has(routeId));
  if (!uniqueRouteIds.length) {
    return;
  }

  uniqueRouteIds.forEach((routeId) => {
    const timerId = state.routePingTimers.get(routeId);
    if (timerId) {
      window.clearTimeout(timerId);
    }

    state.routePingIds.add(routeId);
    const nextTimerId = window.setTimeout(() => {
      state.routePingTimers.delete(routeId);
      state.routePingIds.delete(routeId);
      updateInteractionVisuals();
    }, ROUTE_PING_DURATION_MS);
    state.routePingTimers.set(routeId, nextTimerId);
  });

  updateInteractionVisuals();
}

function pingHub() {
  if (!state.hubNode) {
    return;
  }

  if (state.hubPingTimerId) {
    window.clearTimeout(state.hubPingTimerId);
    state.hubPingTimerId = 0;
  }

  state.hubNode.classList.add("arrivals-map__node--ping");
  state.hubPingTimerId = window.setTimeout(() => {
    state.hubPingTimerId = 0;
    if (state.hubNode) {
      state.hubNode.classList.remove("arrivals-map__node--ping");
    }
  }, ROUTE_PING_DURATION_MS);
}

function setHoverOrigin(originId, key) {
  if (state.hoveredOriginKey === key && state.hoveredOriginId === originId) {
    return;
  }

  state.hoveredOriginId = originId;
  state.hoveredOriginKey = key;
  updateInteractionVisuals();
}

function clearHoverOrigin() {
  if (!state.hoveredOriginId) {
    return;
  }

  state.hoveredOriginId = null;
  state.hoveredOriginKey = null;
  updateInteractionVisuals();
}

function setSelectedOrigin(originId, source) {
  if (!originId || !state.rowByOriginId.has(originId)) {
    return;
  }

  hideMapHint(true);

  if (state.selectedOriginId === originId) {
    state.selectedOriginId = null;
    state.pendingScrollOriginId = null;
    state.pendingFocusRouteId = null;
    updateInteractionVisuals();
    return;
  }

  state.selectedOriginId = originId;

  const rowIndex = state.flatRows.findIndex((row) => row.originId === originId);
  let requiresRender = false;
  if (rowIndex >= 0) {
    const targetPageIndex = Math.floor(rowIndex / BOARD_ROWS_PER_PAGE);
    if (targetPageIndex !== state.boardPageIndex) {
      state.rowFlipSnapshot = getCurrentPageRows();
      state.boardPageIndex = targetPageIndex;
      requiresRender = true;
    }

    state.pendingScrollOriginId = source === "map" ? originId : null;
  }

  if (requiresRender) {
    render();
    return;
  }

  updateInteractionVisuals();
  if (state.pendingScrollOriginId) {
    scrollBoardRowIntoView(state.pendingScrollOriginId);
    state.pendingScrollOriginId = null;
  }
}

function rotateBoardPage() {
  const pageCount = getBoardPageCount();

  if (pageCount <= 1 || state.boardRotationPaused) {
    scheduleNextBoardRotation();
    return;
  }

  state.rowFlipSnapshot = getCurrentPageRows();
  state.boardPageIndex = (state.boardPageIndex + 1) % pageCount;

  render();
  scheduleNextBoardRotation();
}

function scheduleNextBoardRotation(customDelayMs) {
  if (boardRotateTimerId) {
    window.clearTimeout(boardRotateTimerId);
    boardRotateTimerId = 0;
  }

  if (state.boardRotationPaused || getBoardPageCount() <= 1) {
    return;
  }

  const delay =
    typeof customDelayMs === "number"
      ? customDelayMs
      : BOARD_ROTATE_BASE_MS + Math.floor(Math.random() * BOARD_ROTATE_JITTER_MS);

  boardRotateTimerId = window.setTimeout(() => {
    boardRotateTimerId = 0;
    rotateBoardPage();
  }, delay);
}

function pauseBoardRotation() {
  state.boardRotationPaused = true;

  if (boardRotateTimerId) {
    window.clearTimeout(boardRotateTimerId);
    boardRotateTimerId = 0;
  }

  if (boardResumeTimerId) {
    window.clearTimeout(boardResumeTimerId);
    boardResumeTimerId = 0;
  }
}

function resumeBoardRotationWithGrace() {
  if (boardResumeTimerId) {
    window.clearTimeout(boardResumeTimerId);
    boardResumeTimerId = 0;
  }

  boardResumeTimerId = window.setTimeout(() => {
    boardResumeTimerId = 0;
    state.boardRotationPaused = false;
    scheduleNextBoardRotation();
  }, BOARD_RESUME_GRACE_MS);
}

function parseHoveredOrigin(eventTarget) {
  if (!eventTarget || typeof eventTarget.closest !== "function") {
    return null;
  }

  const hoverSourceNode = eventTarget.closest("[data-hover-source]");
  if (!hoverSourceNode) {
    return null;
  }

  const hoverSource = hoverSourceNode.getAttribute("data-hover-source");
  if (!hoverSource || !hoverSource.startsWith("origin:")) {
    return null;
  }

  const originId = hoverSource.slice("origin:".length);
  if (!state.rowByOriginId.has(originId)) {
    return null;
  }

  return {
    key: hoverSource,
    originId,
  };
}

function closestBoardNode(target) {
  return target && typeof target.closest === "function" ? target.closest("[data-arrival-board]") : null;
}

function attachEventHandlers() {
  root.addEventListener("click", (event) => {
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget) {
      return;
    }
    const disclaimerToggleButton = eventTarget.closest("[data-disclaimer-toggle]");
    if (disclaimerToggleButton) {
      event.preventDefault();
      event.stopPropagation();
      setDisclaimerOpen(!state.disclaimerOpen);
      return;
    }
    const boardDisclaimerToggleButton = eventTarget.closest("[data-board-disclaimer-toggle]");
    if (boardDisclaimerToggleButton) {
      event.preventDefault();
      event.stopPropagation();
      setBoardDisclaimerOpen(!state.boardDisclaimerOpen);
      return;
    }

    const shouldCloseMapDisclaimer = state.disclaimerOpen && !eventTarget.closest("[data-disclaimer-node]");
    if (shouldCloseMapDisclaimer) {
      setDisclaimerOpen(false);
    }
    const shouldCloseBoardDisclaimer =
      state.boardDisclaimerOpen && !eventTarget.closest("[data-board-disclaimer-node]");
    if (shouldCloseBoardDisclaimer) {
      setBoardDisclaimerOpen(false);
    }

    const clickedInsideMap = isMapInteractionTarget(eventTarget);
    if (state.mapSuppressClick) {
      state.mapSuppressClick = false;
      if (clickedInsideMap) {
        event.preventDefault();
        return;
      }
    }

    const zoomButton = eventTarget.closest("[data-map-zoom]");
    if (zoomButton) {
      const direction = zoomButton.getAttribute("data-map-zoom");
      hideMapHint(true);
      if (direction === "in") {
        zoomByControlFactor(MAP_CONTROL_ZOOM_STEP);
      } else if (direction === "out") {
        zoomByControlFactor(1 / MAP_CONTROL_ZOOM_STEP);
      } else if (direction === "reset") {
        resetMapViewport();
      }
      return;
    }

    const focusClearButton = eventTarget.closest("[data-map-focus-clear]");
    if (focusClearButton) {
      state.selectedOriginId = null;
      state.pendingFocusRouteId = null;
      state.pendingScrollOriginId = null;
      resetMapViewport();
      updateInteractionVisuals();
      return;
    }

    const boardRow = eventTarget.closest("[data-board-row-origin-id]");
    if (boardRow) {
      setSelectedOrigin(boardRow.getAttribute("data-board-row-origin-id"), "board");
      return;
    }

    const origin = eventTarget.closest("[data-origin-id]");
    if (origin) {
      setSelectedOrigin(origin.getAttribute("data-origin-id"), "map");
      return;
    }
  });

  root.addEventListener(
    "wheel",
    (event) => {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (!eventTarget || !state.mapSvgNode || !isMapInteractionTarget(eventTarget)) {
        return;
      }
      if (eventTarget.closest("[data-disclaimer-node], [data-board-disclaimer-node]")) {
        return;
      }

      hideMapHint(true);
      const zoomFactor = Math.exp(-event.deltaY * 0.00145);
      zoomToClientPoint(event.clientX, event.clientY, state.mapZoom * zoomFactor);
      event.preventDefault();
    },
    { passive: false },
  );

  root.addEventListener("dblclick", (event) => {
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget || !state.mapSvgNode || !isMapInteractionTarget(eventTarget)) {
      return;
    }
    if (eventTarget.closest("[data-disclaimer-node], [data-board-disclaimer-node]")) {
      return;
    }

    if (isMapSelectableTarget(eventTarget)) {
      return;
    }

    hideMapHint(true);
    zoomToClientPoint(event.clientX, event.clientY, state.mapZoom * MAP_CONTROL_ZOOM_STEP);
    event.preventDefault();
  });

  root.addEventListener("pointerdown", (event) => {
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget || !state.mapSvgNode || !isMapInteractionTarget(eventTarget)) {
      return;
    }
    if (eventTarget.closest("[data-disclaimer-node], [data-board-disclaimer-node]")) {
      return;
    }

    if (eventTarget.closest("[data-map-zoom], [data-map-focus-clear]")) {
      return;
    }

    if (isMapSelectableTarget(eventTarget)) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    hideMapHint(true);
    state.mapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (state.mapPointers.size >= 2) {
      state.mapPanPointerId = null;
      state.mapSuppressClick = true;
      setMapPanningActive(false);
      initializePinchFromPointers();
    } else {
      state.mapPinchStartDistance = 0;
      state.mapDragDistance = 0;
      if (state.mapZoom > MAP_MIN_ZOOM + 0.0001) {
        state.mapPanPointerId = event.pointerId;
        state.mapLastClientX = event.clientX;
        state.mapLastClientY = event.clientY;
        setMapPanningActive(true);
      }
    }

    if (typeof state.mapSvgNode.setPointerCapture === "function") {
      try {
        state.mapSvgNode.setPointerCapture(event.pointerId);
      } catch (error) {
        // Ignore unsupported pointer capture calls.
      }
    }

    if (state.mapZoom > MAP_MIN_ZOOM + 0.0001 || state.mapPointers.size > 1) {
      event.preventDefault();
    }
  });

  root.addEventListener("pointermove", (event) => {
    if (!state.mapPointers.has(event.pointerId) || !state.mapSvgNode) {
      return;
    }

    state.mapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointerEntries = getMapPointerEntries();

    if (pointerEntries.length >= 2) {
      applyPinchZoomFromPointers();
      state.mapSuppressClick = true;
      setMapPanningActive(false);
      event.preventDefault();
      return;
    }

    if (state.mapPanPointerId !== event.pointerId || state.mapZoom <= MAP_MIN_ZOOM + 0.0001) {
      return;
    }

    const rect = state.mapSvgNode.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const dx = event.clientX - state.mapLastClientX;
    const dy = event.clientY - state.mapLastClientY;
    if (!dx && !dy) {
      return;
    }

    state.mapDragDistance += Math.hypot(dx, dy);
    if (state.mapDragDistance > 4) {
      state.mapSuppressClick = true;
    }

    const deltaWorldX = -(dx / rect.width) * state.mapViewport.width;
    const deltaWorldY = -(dy / rect.height) * state.mapViewport.height;
    setMapViewport(state.mapZoom, state.mapCenterX + deltaWorldX, state.mapCenterY + deltaWorldY, {
      softBounds: true,
    });
    state.mapLastClientX = event.clientX;
    state.mapLastClientY = event.clientY;
    event.preventDefault();
  });

  const handleMapPointerRelease = (event) => {
    if (!state.mapPointers.has(event.pointerId)) {
      return;
    }

    state.mapPointers.delete(event.pointerId);
    if (typeof state.mapSvgNode?.releasePointerCapture === "function") {
      try {
        state.mapSvgNode.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Ignore unsupported pointer release calls.
      }
    }

    if (state.mapPanPointerId === event.pointerId) {
      state.mapPanPointerId = null;
      setMapPanningActive(false);
    }

    const pointerEntries = getMapPointerEntries();
    if (pointerEntries.length >= 2) {
      initializePinchFromPointers();
      return;
    }

    if (pointerEntries.length === 1) {
      state.mapPinchStartDistance = 0;
      const [remainingPointerId, pointer] = pointerEntries[0];
      if (state.mapZoom > MAP_MIN_ZOOM + 0.0001) {
        state.mapPanPointerId = remainingPointerId;
        state.mapLastClientX = pointer.x;
        state.mapLastClientY = pointer.y;
        setMapPanningActive(true);
      }
      return;
    }

    state.mapPinchStartDistance = 0;
    state.mapDragDistance = 0;
    setMapPanningActive(false);
    if (state.mapZoom <= MAP_MIN_ZOOM + 0.0001) {
      resetMapViewport();
    } else {
      setMapViewport(state.mapZoom, state.mapCenterX, state.mapCenterY, { softBounds: false });
    }
  };

  root.addEventListener("pointerup", handleMapPointerRelease);
  root.addEventListener("pointercancel", handleMapPointerRelease);

  root.addEventListener("pointerover", (event) => {
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget) {
      return;
    }

    const hoveredOrigin = parseHoveredOrigin(eventTarget);
    if (hoveredOrigin) {
      setHoverOrigin(hoveredOrigin.originId, hoveredOrigin.key);
    }

    const boardNode = closestBoardNode(eventTarget);
    if (!boardNode) {
      return;
    }

    const fromBoardNode = closestBoardNode(event.relatedTarget);
    if (fromBoardNode === boardNode) {
      return;
    }

    pauseBoardRotation();
  });

  root.addEventListener("pointerout", (event) => {
    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget) {
      return;
    }

    const currentHoverNode = eventTarget.closest("[data-hover-source]");
    const nextHoverNode = event.relatedTarget && event.relatedTarget.closest
      ? event.relatedTarget.closest("[data-hover-source]")
      : null;

    if (state.hoveredOriginId && currentHoverNode && !nextHoverNode) {
      clearHoverOrigin();
    }

    const boardNode = closestBoardNode(eventTarget);
    if (!boardNode) {
      return;
    }

    const toBoardNode = closestBoardNode(event.relatedTarget);
    if (toBoardNode === boardNode) {
      return;
    }

    resumeBoardRotationWithGrace();
  });

  root.addEventListener("pointerleave", () => {
    clearHoverOrigin();
    clearMapPointers({ snapToBounds: true });
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && (state.disclaimerOpen || state.boardDisclaimerOpen)) {
      setDisclaimerOpen(false);
      setBoardDisclaimerOpen(false);
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const eventTarget = event.target instanceof Element ? event.target : null;
    if (!eventTarget) {
      return;
    }

    const originNode = eventTarget.closest("[data-origin-id], [data-board-row-origin-id]");
    if (!originNode) {
      return;
    }

    const originId =
      originNode.getAttribute("data-origin-id") ||
      originNode.getAttribute("data-board-row-origin-id");

    if (!originId) {
      return;
    }

    event.preventDefault();
    setSelectedOrigin(originId, "keyboard");
  });
}

function resolveArrivalsApiUrl() {
  const host = typeof window !== "undefined" ? String(window.location.hostname || "").toLowerCase() : "";
  if (host === "www.mikiandyijie.com" || host === "mikiandyijie.com" || host === "ygnawk.github.io") {
    return `${ARRIVALS_API_ORIGIN}${ARRIVALS_API_PATH}`;
  }
  return ARRIVALS_API_PATH;
}

function isValidArrivalsPayload(data) {
  return Boolean(data && typeof data === "object" && data.beijing && Array.isArray(data.origins) && Array.isArray(data.byCountry));
}

async function fetchArrivalsPayload(url, label) {
  const timeoutMs = url.includes(ARRIVALS_API_PATH) ? ARRIVALS_API_FETCH_TIMEOUT_MS : ARRIVALS_MOCK_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, { cache: "no-store", signal: controller.signal });
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`${label} returned ${response.status}`);
  }

  const data = await response.json();
  if (!isValidArrivalsPayload(data)) {
    throw new Error(`${label} returned invalid payload`);
  }
  return data;
}

async function fetchPreviewData() {
  const apiUrl = resolveArrivalsApiUrl();
  try {
    return await fetchArrivalsPayload(apiUrl, "Arrivals API");
  } catch (apiError) {
    console.warn("[arrivals-preview] arrivals API failed, falling back to mock data", apiError);
    return fetchArrivalsPayload(ARRIVALS_MOCK_DATA_PATH, "Arrivals mock file");
  }
}

function applyIncomingData(nextData, options = {}) {
  const previousPageRows = options.animateChanges ? getCurrentPageRows() : null;
  const changedRouteIds = options.changedRouteIds instanceof Set ? options.changedRouteIds : new Set();

  state.data = nextData;
  state.origins = nextData.origins.map((origin) => ({ ...origin }));
  state.routes = deriveRoutes(state.origins, nextData.beijing);
  state.routeById = new Map(state.routes.map((route) => [route.routeId, route]));
  applyData();

  if (changedRouteIds.size > 0) {
    state.pendingRoutePingIds = new Set([...state.pendingRoutePingIds, ...changedRouteIds]);
  }

  if (state.selectedOriginId) {
    const index = state.flatRows.findIndex((row) => row.originId === state.selectedOriginId);
    if (index >= 0) {
      state.boardPageIndex = Math.floor(index / BOARD_ROWS_PER_PAGE);
    } else {
      state.selectedOriginId = null;
    }
  }

  state.pendingScrollOriginId = options.keepPendingScroll ? state.pendingScrollOriginId : null;
  state.rowFlipSnapshot = options.animateChanges ? previousPageRows : null;

  render();
}

function clearDataRefreshTimer() {
  if (dataRefreshTimerId) {
    window.clearInterval(dataRefreshTimerId);
    dataRefreshTimerId = 0;
  }
}

function clearBeijingDateTimer() {
  if (beijingDateTimerId) {
    window.clearInterval(beijingDateTimerId);
    beijingDateTimerId = 0;
  }
}

function scheduleBeijingDateTimer() {
  clearBeijingDateTimer();

  beijingDateTimerId = window.setInterval(() => {
    if (!state.data) {
      return;
    }

    const nextBeijingDateLabel = getArrivalsTimestampLabel(state.data.lastUpdatedIso);
    if (state.beijingDateLabel !== nextBeijingDateLabel) {
      render();
    }
  }, 60000);
}

function scheduleDataRefresh() {
  clearDataRefreshTimer();
  dataRefreshTimerId = window.setInterval(() => {
    refreshData().catch((error) => {
      console.warn("[arrivals-preview] refresh failed", error);
    });
  }, DATA_REFRESH_MS);
}

async function refreshData() {
  if (!state.data) {
    return;
  }

  const nextData = await fetchPreviewData();
  const nextOrigins = nextData.origins.map((origin) => ({ ...origin }));
  const changedRouteIds = getChangedRouteIds(state.origins, nextOrigins);
  const isTimestampChanged = state.data.lastUpdatedIso !== nextData.lastUpdatedIso;
  const nextBeijingDateLabel = getArrivalsTimestampLabel(nextData.lastUpdatedIso);
  const isBeijingDateChanged = state.beijingDateLabel !== nextBeijingDateLabel;

  if (!changedRouteIds.size && !isTimestampChanged && !isBeijingDateChanged) {
    return;
  }

  if (!changedRouteIds.size && !isTimestampChanged && isBeijingDateChanged) {
    render();
    return;
  }

  applyIncomingData(
    {
      ...nextData,
      origins: nextOrigins,
    },
    {
      animateChanges: true,
      changedRouteIds,
      keepPendingScroll: true,
    },
  );
}

async function loadData() {
  renderMessage("Loading arrivals preview…", false);
  state.showProjectionDebug = getProjectionDebugEnabled();

  const [data, worldLandPathMarkup] = await Promise.all([
    fetchPreviewData(),
    fetchWorldGeoPathMarkup().catch((error) => {
      console.warn("[arrivals-preview] world geojson load failed, using image fallback", error);
      return "";
    }),
  ]);

  state.worldLandPathMarkup = worldLandPathMarkup;
  applyIncomingData(data, { animateChanges: false });
  scheduleDataRefresh();
  scheduleBeijingDateTimer();
}

function bindReducedMotionChange() {
  if (!reducedMotionMedia) {
    return;
  }

  const listener = () => {
    state.prefersReducedMotion = reducedMotionMedia.matches;
    if (state.prefersReducedMotion) {
      stopPlaneAnimation();
      clearBoardIdleFlipTimers();
    }

    render();
  };

  if (typeof reducedMotionMedia.addEventListener === "function") {
    reducedMotionMedia.addEventListener("change", listener);
  } else if (typeof reducedMotionMedia.addListener === "function") {
    reducedMotionMedia.addListener(listener);
  }
}

attachEventHandlers();
bindReducedMotionChange();
initializeMapHintState();

loadData().catch((error) => {
  clearBoardRotationTimers();
  clearBoardIdleFlipTimers();
  clearDataRefreshTimer();
  clearBeijingDateTimer();
  clearRoutePingTimers();
  if (mapHintTimerId) {
    window.clearTimeout(mapHintTimerId);
    mapHintTimerId = 0;
  }
  clearFlapCleanupTimer();
  clearMapPointers({ snapToBounds: false });
  stopPlaneAnimation();
  renderMessage(`Unable to load arrivals preview: ${error.message}`, true);
});

window.addEventListener("beforeunload", () => {
  clearBoardRotationTimers();
  clearBoardIdleFlipTimers();
  clearDataRefreshTimer();
  clearBeijingDateTimer();
  clearRoutePingTimers();
  if (mapHintTimerId) {
    window.clearTimeout(mapHintTimerId);
    mapHintTimerId = 0;
  }
  clearFlapCleanupTimer();
  clearMapPointers({ snapToBounds: false });
  stopPlaneAnimation();
});

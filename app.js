const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwpfLq3hB_mRiKKgiwMv1bvZUUtcoUZP7ifjKpnLpcK0HgaOKHwm_LRsPPCahWWQ67U/exec";
const RSVP_LOCAL_FALLBACK_KEY = "wedding_rsvp_fallback";
const BASE_PATH = window.location.hostname === "ygnawk.github.io" ? "/wedding-rsvp" : "";
const IS_LOCAL_DEV = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const DEBUG_FOCAL_PARAM = String(new URLSearchParams(window.location.search).get("debugFocal") || "").toLowerCase();
const ENABLE_FOCAL_TUNER = IS_LOCAL_DEV && ["1", "true", "yes", "on"].includes(DEBUG_FOCAL_PARAM);

const SECTION_IDS = ["top", "interlude", "story", "venue", "schedule", "rsvp", "faq", "stay", "things-to-do", "makan", "travel-visa", "gallery"];

const inviteState = {
  token: "",
  greetingName: "",
  maxPartySize: 6,
};

const MAX_GUESTS = 4;
const MAX_PLUS_ONES = MAX_GUESTS - 1;
const MAX_UPLOAD_FILES = 3;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const HOTEL_PANEL_TRANSITION_MS = 500;
const HOTEL_CONTENT_FADE_MS = 500;
const UPLOAD_ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "heic", "heif", "mp4", "mov", "webm"]);
const UPLOAD_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const UPLOAD_SLOT_DEFAULT_META = "JPG/PNG/HEIC/MP4/MOV • up to 10MB";
const FUN_FACT_CHIP_COUNT = 6;
const BASE_FUN_FACT_EXAMPLES = [
  "I will travel for noodles.",
  "I can’t handle horror films.",
  "Ask me about my latest hyper-fixation.",
  "I judge cities by their coffee.",
  "I have strong opinions about dumplings.",
  "My toxic trait is planning trips like a spreadsheet.",
  "I’ll cross a city for good hot pot.",
  "Char kway teow has my loyalty.",
  "I’m here for the dance floor.",
  "I will always order dessert.",
  "I’ve cried at a movie on an airplane.",
  "I’m a morning person (unfortunately).",
];
const NEW_FUN_FACT_IDEAS = [
  "I judge a city by its coffee.",
  "My superpower is finding the best dish on a menu.",
  "I’m here for the views and the snacks.",
  "I can’t pass a bakery without “just looking.”",
  "I will plan an itinerary, then ignore it.",
  "If there’s a dumpling, I’m ordering it.",
  "My love language is sending restaurant pins.",
  "I came for the wedding, stayed for the street food.",
  "I can fall asleep before takeoff.",
  "I treat hotel breakfast like a competitive sport.",
  "I have strong opinions about noodles.",
  "I will walk 20,000 steps for one good meal.",
  "I always pack snacks like it’s survival training.",
  "I’m the person who brings a tiny pharmacy while traveling.",
  "I can’t resist a good stationery store.",
  "I collect fridge magnets like trophies.",
  "I’m here to romanticize my life in every city.",
  "I will order “one more” and mean it.",
  "I’m happiest near water or a noodle shop.",
  "I’m the friend who knows the best photo spot.",
  "I will try the weird local soda.",
  "I believe the best conversations happen after midnight.",
  "I’m a “one more museum room” person.",
  "I can’t stop myself from checking dessert menus first.",
  "I’ve googled “best ____ near me” in 12 countries.",
  "I have a running list of foods I’d fly back for.",
  "I’m dangerously good at spotting scams.",
  "I will befriend the hotel cat if there is one.",
  "I’m a sucker for old bookstores.",
  "I treat convenience stores like cultural landmarks.",
  "I’m here to eat, not to be perceived.",
  "I will take public transit for fun.",
  "I can’t leave without buying something small and local.",
  "I’m the group’s unofficial translator (even when I’m not).",
  "My camera roll is 70% food, 30% sky.",
  "I’m always down for a night market.",
  "I have a talent for finding the quietest corner in a loud place.",
  "I will try it once. Twice if it’s spicy.",
  "I’m an early riser… on vacation only.",
  "I can’t say no to a scenic walk.",
  "My ideal souvenir is a good story.",
  "I choose seats based on sunlight.",
  "I’m the friend who always has a charger.",
  "I’ve missed my stop because I was staring out the window.",
  "I’m here for the ceremony and the chaos.",
  "I will compliment your outfit with full sincerity.",
  "I make friends in bathrooms and elevator lines.",
  "I have a playlist for every mood and every city.",
  "I can eat the same thing five days in a row happily.",
  "If you want recommendations, I’m ready.",
];
const FUN_FACT_REPLACEMENT_IDEAS = [
  "I keep emergency chili oil in my bag.",
  "I will always split one more appetizer.",
  "I’m loyal to window seats and soup dumplings.",
  "I plan around sunsets and snack breaks.",
  "I collect menus from trips like postcards.",
  "I can turn any walk into a food crawl.",
];

function normalizeFunFactIdea(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeFunFactIdea(value) {
  return normalizeFunFactIdea(value)
    .split(" ")
    .filter(Boolean);
}

function isNearDuplicateFunFactIdea(candidate, existingItems) {
  const candidateTokens = tokenizeFunFactIdea(candidate);
  if (!candidateTokens.length) return false;

  return existingItems.some((existing) => {
    const existingTokens = tokenizeFunFactIdea(existing);
    if (!existingTokens.length) return false;

    const existingTokenSet = new Set(existingTokens);
    const shared = candidateTokens.filter((token) => existingTokenSet.has(token)).length;
    const overlap = shared / Math.max(candidateTokens.length, existingTokens.length);
    return overlap >= 0.86;
  });
}

function buildFunFactExamples() {
  const existingSet = new Set(BASE_FUN_FACT_EXAMPLES.map((item) => normalizeFunFactIdea(item)));
  const existingIdeaPool = [...BASE_FUN_FACT_EXAMPLES];
  const seenNew = new Set();
  const uniqueNew = [];

  NEW_FUN_FACT_IDEAS.forEach((idea) => {
    const normalized = normalizeFunFactIdea(idea);
    if (!normalized || existingSet.has(normalized) || seenNew.has(normalized)) return;
    if (isNearDuplicateFunFactIdea(idea, existingIdeaPool)) return;
    seenNew.add(normalized);
    uniqueNew.push(idea);
    existingIdeaPool.push(idea);
  });

  if (uniqueNew.length < NEW_FUN_FACT_IDEAS.length) {
    FUN_FACT_REPLACEMENT_IDEAS.forEach((idea) => {
      if (uniqueNew.length >= NEW_FUN_FACT_IDEAS.length) return;
      const normalized = normalizeFunFactIdea(idea);
      if (!normalized || existingSet.has(normalized) || seenNew.has(normalized)) return;
      if (isNearDuplicateFunFactIdea(idea, existingIdeaPool)) return;
      seenNew.add(normalized);
      uniqueNew.push(idea);
      existingIdeaPool.push(idea);
    });
  }

  if (IS_LOCAL_DEV) {
    const collisionCount = NEW_FUN_FACT_IDEAS.filter((idea) => existingSet.has(normalizeFunFactIdea(idea))).length;
    console.debug("[fun-fact-ideas]", {
      requested: NEW_FUN_FACT_IDEAS.length,
      collisions: collisionCount,
      added: uniqueNew.length,
      check: NEW_FUN_FACT_IDEAS.filter((idea) => existingSet.has(normalizeFunFactIdea(idea))).length === 0,
    });
    if (uniqueNew.length < NEW_FUN_FACT_IDEAS.length) {
      console.warn(`[fun-fact-ideas] expected ${NEW_FUN_FACT_IDEAS.length} new unique ideas, got ${uniqueNew.length}`);
    }
  }

  return [...BASE_FUN_FACT_EXAMPLES, ...uniqueNew];
}

const FUN_FACT_EXAMPLES = buildFunFactExamples();

let photoManifest = null;
let revealObserver = null;
let reducedMotion = false;
let selectedUploadFiles = Array.from({ length: MAX_UPLOAD_FILES }, () => null);
let selectedUploadPreviewUrls = Array.from({ length: MAX_UPLOAD_FILES }, () => "");

const floatingHeader = document.getElementById("floatingHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileNavSheet = document.getElementById("mobileNavSheet");
const desktopNavMore = document.getElementById("desktopNavMore");
const desktopMoreToggle = document.getElementById("desktopMoreToggle");
const desktopMoreMenu = document.getElementById("desktopMoreMenu");
const desktopMoreLinks = desktopMoreMenu ? Array.from(desktopMoreMenu.querySelectorAll("a[data-link]")) : [];

const heroGreeting = document.getElementById("heroGreeting");
const heroCountdown = document.getElementById("heroCountdown");

const choiceCards = Array.from(document.querySelectorAll(".choice-card"));
const attendanceChoice = document.getElementById("attendanceChoice");
const rsvpFields = document.getElementById("rsvpFields");
const rsvpForm = document.getElementById("rsvpForm");
const submitButton = document.getElementById("submitButton");
const rsvpConfirmation = document.getElementById("rsvpConfirmation");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");

const yesFields = document.getElementById("yesFields");
const youFunFactsFields = document.getElementById("youFunFactsFields");
const youGuestCardWrap = document.getElementById("youGuestCardWrap");
const guestCardsWrap = document.getElementById("guestCardsWrap");
const addGuestButton = document.getElementById("addGuestButton");
const guestLimitError = document.getElementById("guestLimitError");
const dietary = document.getElementById("dietary");

const workingFields = document.getElementById("workingFields");
const workingCount = document.getElementById("workingCount");
const workingConfirm = document.getElementById("workingConfirm");

const noFields = document.getElementById("noFields");
const photoUploadSlots = Array.from(document.querySelectorAll("[data-upload-slot]"));
const photoUploadSlotRefs = photoUploadSlots.map((slotNode, fallbackIndex) => {
  const slot = Number(slotNode.dataset.uploadSlot || fallbackIndex + 1);
  return {
    slot,
    slotNode,
    input: document.getElementById(`photoUpload${slot}`),
    trigger: slotNode.querySelector(`[data-upload-trigger='${slot}']`),
    meta: slotNode.querySelector(`[data-upload-meta='${slot}']`),
    previewWrap: slotNode.querySelector(`[data-upload-preview-wrap='${slot}']`),
    preview: slotNode.querySelector(`[data-upload-preview='${slot}']`),
    previewText: slotNode.querySelector(`[data-upload-preview-text='${slot}']`),
    actions: slotNode.querySelector(`[data-upload-actions='${slot}']`),
    replaceButton: slotNode.querySelector(`[data-upload-replace='${slot}']`),
    removeButton: slotNode.querySelector(`[data-upload-remove='${slot}']`),
    errorNode: slotNode.querySelector(`[data-upload-error='${slot}']`),
  };
});
const thingsThemeList = document.getElementById("thingsThemeList");
const makanTipTrigger = document.getElementById("makanTipTrigger");
const makanTipPopover = document.getElementById("makanTipPopover");
const makanMenuRows = document.getElementById("makanMenuRows");
const makanExpandAll = document.getElementById("makanExpandAll");
const makanCollapseAll = document.getElementById("makanCollapseAll");
const makanLegalTrigger = document.getElementById("makanLegalTrigger");
const makanLegalPopover = document.getElementById("makanLegalPopover");
const makanLegalClose = document.getElementById("makanLegalClose");
const hotelMatrixShell = document.getElementById("hotelMatrixShell");
const hotelMapCard = document.querySelector(".hotel-map-card");
const hotelMatrixChartCol = document.querySelector(".hotel-map-chart-col");
const hotelMatrixSvg = document.getElementById("hotelMatrixSvg");
const hotelMatrixTooltip = document.getElementById("hotelMatrixTooltip");
const hotelMatrixDetails = document.getElementById("hotelMatrixDetails");
const hotelMatrixSheet = document.getElementById("hotelMatrixSheet");
const hotelMatrixSheetContent = document.getElementById("hotelMatrixSheetContent");
const hotelMatrixSheetClose = document.getElementById("hotelMatrixSheetClose");
const hotelMatrixSheetCloseControls = hotelMatrixSheet ? Array.from(hotelMatrixSheet.querySelectorAll("[data-sheet-close], #hotelMatrixSheetClose")) : [];
const hotelMatrixRatingClaim = document.getElementById("hotelMatrixRatingClaim");
const hotelMethodTrigger = document.getElementById("hotelMethodTrigger");
let hotelMethodTooltip = null;

const galleryGrid = document.getElementById("galleryGrid");
const galleryLightbox = document.getElementById("lightbox");
const galleryLightboxImage = document.getElementById("lightboxImg");
const galleryLightboxCounter = document.getElementById("lightboxCounter");
const galleryLightboxPrev = galleryLightbox ? galleryLightbox.querySelector(".lightbox-btn--prev") : null;
const galleryLightboxNext = galleryLightbox ? galleryLightbox.querySelector(".lightbox-btn--next") : null;
const galleryLightboxFrame = galleryLightbox ? galleryLightbox.querySelector(".lightbox-frame") : null;
const galleryLightboxCloseButtons = galleryLightbox
  ? Array.from(galleryLightbox.querySelectorAll("[data-close], .lightbox-close"))
  : [];

let galleryImages = [];
let currentGalleryIndex = 0;
let galleryTouchStartX = null;

const storySection = document.getElementById("story");
const storyViewport = document.getElementById("storyViewport");
const storyTrack = document.getElementById("storyTrack");
const storyPrev = document.getElementById("storyPrev");
const storyNext = document.getElementById("storyNext");
const storyDots = document.getElementById("storyDots");
const storyHint = document.getElementById("storyHint");
const storyYearScrubber = document.getElementById("storyYearScrubber");
const storySkipLink = document.querySelector(".story-skip-link");
const storyMosaicShell = document.getElementById("storyMosaicShell");
const storyMosaicLayout = document.getElementById("storyMosaicLayout");
const storyChronologyPath = document.getElementById("storyChronologyPath");
const storyChronologyStart = document.getElementById("storyChronologyStart");
const storyChronologyNow = document.getElementById("storyChronologyNow");
const storyMobileStage = document.getElementById("storyMobileStage");
const storyMobileCard = document.getElementById("storyMobileCard");
const storyMobileImg = document.getElementById("storyMobileImg");
const storyMobileYear = document.getElementById("storyMobileYear");
const storyMobileBlurb = document.getElementById("storyMobileBlurb");
const storyScrollyTrack = document.getElementById("storyScrollyTrack");
const storyStage = document.getElementById("storyStage");
const storyMosaicGrid = document.getElementById("storyMosaicGrid");
const storyFocusOverlay = document.getElementById("storyFocusOverlay");
const storyFocusImage = document.getElementById("storyFocusImage");
const storyCaption = document.getElementById("storyCaption");
const storyCaptionTitle = document.getElementById("storyCaptionTitle");
const storyCaptionBlurb = document.getElementById("storyCaptionBlurb");
const storyLightbox = document.getElementById("storyLightbox");
const storyLightboxImg = document.getElementById("storyLightboxImg");
const storyLightboxTitle = document.getElementById("storyLightboxTitle");
const storyLightboxBlurb = document.getElementById("storyLightboxBlurb");
const storyLightboxLong = document.getElementById("storyLightboxLong");
const storyLightboxCounter = document.getElementById("storyLightboxCounter");
const storyLightboxPrev = storyLightbox ? storyLightbox.querySelector(".story-lightbox-btn--prev") : null;
const storyLightboxNext = storyLightbox ? storyLightbox.querySelector(".story-lightbox-btn--next") : null;
const storyLightboxFrame = storyLightbox ? storyLightbox.querySelector(".story-lightbox-frame") : null;
const storyLightboxCloseButtons = storyLightbox ? Array.from(storyLightbox.querySelectorAll("[data-story-close], .story-lightbox-close")) : [];

let storyItems = [];
let currentStoryIndex = 0;
let storyTouchStartX = null;
let storyTimelineIndex = 0;
let storyTimelineRaf = null;
let storyActiveStep = -1;
let storyScrollRaf = null;
let storyTileElements = [];
let storyResizeRaf = null;
let storyYearButtons = [];
let storyYearObserver = null;
let storyMobileIndex = 0;
let storyMobileTouchStartX = null;
let storyPathTargets = [];
let storyPathRaf = null;
let storyPathResizeBound = false;
let storyPathResizeObserver = null;
let hotelMatrixItems = [];
let hotelMatrixPinnedId = "";
let activeHotelMatrixId = "";
let hotelDetailsSwapTimer = null;
let hotelSheetOpen = false;
let hotelMatrixMetaById = new Map();
let hotelMatrixResizeObserver = null;
let hotelMatrixResizeRaf = null;
let hotelMatrixWidth = 760;
let hotelMatrixHeight = 460;
let hotelMethodOpen = false;
let hotelMethodCloseTimer = null;
let hotelMethodPinned = false;
let makanTipOpen = false;
let makanLegalOpen = false;
let makanTypeAccordions = [];
let makanBulkToggle = false;

const jumpMenuWrap = document.getElementById("jumpMenuWrap");
const jumpMenuToggle = document.getElementById("jumpMenuToggle");
const jumpMenuPanel = document.getElementById("jumpMenuPanel");
const jumpMenuLinks = jumpMenuPanel ? Array.from(jumpMenuPanel.querySelectorAll("a[href^='#']")) : [];
const travelPassportPills = Array.from(document.querySelectorAll(".travel-passport-pill"));
const travelPassportClear = document.getElementById("travelPassportClear");
const travelPassportResult = document.getElementById("travelPassportResult");
const travelSourcesDisclosure = document.querySelector(".travel-sources-disclosure");

const HOTELS_DATA = Array.isArray(window.HOTELS_DATA) ? window.HOTELS_DATA : [];
const BEIJING_FOOD_PLACES = Array.isArray(window.BEIJING_FOOD_PLACES) ? window.BEIJING_FOOD_PLACES : [];
const TRAVEL_PASSPORT_RULES = {
  us: {
    title: "U.S. passport",
    outcome: "Visa required (typical)",
    detail: "Tourist visa is generally required for standard trips.",
  },
  singapore: {
    title: "Singapore passport",
    outcome: "Visa-free (typical)",
    detail: "Visa-free entry up to 30 days.",
  },
  japan: {
    title: "Japan passport",
    outcome: "Visa-free (typical)",
    detail: "Visa-free entry up to 30 days through Dec 31, 2026.",
  },
  thailand: {
    title: "Thailand passport",
    outcome: "Visa exemption (typical)",
    detail: "Visa exemption up to 30 days per entry; 90 days within any 180 days.",
  },
  malaysia: {
    title: "Malaysia passport",
    outcome: "Visa exemption (typical)",
    detail: "Visa exemption up to 30 days per entry; 90 days within any 180 days.",
  },
  "south-korea": {
    title: "South Korean passport",
    outcome: "Visa-free (typical)",
    detail: "Visa-free entry up to 30 days through Dec 31, 2026.",
  },
  other: {
    title: "Other passport",
    outcome: "Varies by passport",
    detail: "Rules vary by passport. Please check official sources below.",
  },
};

const STORY_COPY = {
  1995: {
    title: "1995 — Born in Singapore",
    blurb: "Born tired. Still tired.",
    longCaption: "Yi Jie arrives in Singapore and immediately builds a lifelong relationship with naps.",
  },
  1998: {
    title: "1998 — Born in Japan",
    blurb: "Already cooler than us.",
    longCaption: "Miki starts her chapter in Japan with more style than anyone else in this timeline.",
  },
  2001: {
    title: "2001 — Tiny stools era",
    blurb: "Character building with siblings.",
    longCaption: "The three-siblings-on-stools phase. Peak childhood logistics, peak sibling energy.",
  },
  2008: {
    title: "2008 — Move to Beijing",
    blurb: "Discipline arc begins.",
    longCaption: "Miki moves to Beijing to pursue music training and starts the long discipline arc.",
  },
  2013: {
    title: "2013 — Military life",
    blurb: "Went to the military… to fish?!?",
    longCaption: "Yi Jie does military service and still somehow finds fishing stories that sound made up.",
  },
  2016: {
    title: "2016 — Wesleyan",
    blurb: "Plot twist: not for classes.",
    longCaption: "We meet at Wesleyan in Connecticut. Academics were present. Romance was louder.",
  },
  2020: {
    title: "2020 — NYC",
    blurb: "Moved during COVID. Oops.",
    longCaption: "We moved to New York in the middle of COVID and learned flexibility very quickly.",
  },
  2021: {
    title: "2021 — SF",
    blurb: "SF for the outdoors. But we couldn't afford a car.",
    longCaption: "California sun, lots of optimism, and absolutely no car budget. We still made it fun.",
  },
  2023: {
    title: "2023 — Asia year",
    blurb: "Mostly in Tokyo.",
    longCaption: "Asia year, mostly in Tokyo — Miki quit her job, YJ found projects in JP.",
  },
  2024: {
    title: "2024 — Proposal in Singapore",
    blurb: "She said yes. We are still shocked.",
    longCaption: "A quiet, happy proposal in Singapore. Still one of our favorite evenings.",
  },
  2025: {
    title: "2025 — Leo & Luna",
    blurb: "Two fluffy Siberians. Zero personal space.",
    longCaption: "We adopted Leo and Luna and immediately gave up all claims to couch ownership.",
  },
  2026: {
    title: "2026 — Wedding in Beijing",
    blurb: "Finally.",
    longCaption: "The chapter we get to celebrate with everyone we love in one place.",
  },
  2027: {
    title: "Future...",
    blurb: "We will pretend we have a plan.",
    longCaption: "Future chapter loading. Hopefully with fewer bugs and more dumplings.",
  },
};

const MAKAN_TYPE_ORDER = [
  "Peking duck",
  "Imperial / Banquet experience",
  "Cantonese dining",
  "Fujian cuisine",
  "Jiangnan / Shanghainese",
  "Hotpot & late-night",
  "Noodles + dumplings",
  "Street snacks",
  "Modern Beijing / creative Chinese",
  "Breakfast",
  "Dessert / tea / coffee",
];

const MAKAN_PLACEHOLDER_COPY = {
  "Breakfast & street snacks": [
    "We’re still arguing about the best jianbing.",
    "If you see a breakfast queue… that’s usually the sign.",
    "Have a must-eat? Send it to us and we’ll add it.",
  ],
  "Hotpot & late-night": [
    "Jet lag + late-night noodles is a Beijing tradition.",
    "Post-wedding hotpot squad, anyone?",
    "We’ll drop the best late-night spots soon.",
  ],
  "Desserts, tea & coffee": [
    "Tea breaks are mandatory.",
    "Café list incoming (we take this seriously).",
    "Send us your favorite spot and we’ll add it.",
  ],
};
const STORY_ASSET_VERSION = "20260216-0915";
const STORY_DEFAULT_FOCAL_X = 0.5;
const STORY_DEFAULT_FOCAL_Y = 0.28;
const STORY_OVERRIDES = {
  // Upright files should remain upright.
  "2008-miki-moves-beijing-upright.jpg": { rotate: 0, objPos: "50% 44%" },
  "2020-covid-upright.jpg": { rotate: 0, objPos: "50% 42%" },
  "2024-proposal-upright.jpg": { rotate: 0, objPos: "50% 44%" },
  // Legacy names (kept in case old files are reintroduced).
  "2008-miki-moves-beijing.jpg": { rotate: -90, yearTop: 72, objPos: "50% 36%" },
  "2008-miki-moves-beijing-v2.jpg": { rotate: -90, yearTop: 72, objPos: "50% 36%" },
  "2008 - Miki moves to China.JPG": { rotate: -90, yearTop: 72, objPos: "50% 36%" },
  "2020-covid.jpg": { rotate: 180, yearTop: 72, objPos: "50% 36%" },
  "2020-covid-v2.jpg": { rotate: 180, yearTop: 72, objPos: "50% 36%" },
  "2020-covid-from-heic.jpg": { rotate: 180, yearTop: 72, objPos: "50% 36%" },
  "2020 - COVID.HEIC": { rotate: 180, yearTop: 72, objPos: "50% 36%" },
  "2024-proposal.jpg": { rotate: -90, yearTop: 72, objPos: "50% 40%" },
  "2024-proposal-v2.jpg": { rotate: -90, yearTop: 72, objPos: "50% 40%" },
  "2024 - She said yes.JPG": { rotate: -90, yearTop: 72, objPos: "50% 40%" },
};
const STORY_YEAR_FOCAL_PRESETS = {
  1995: { focalX: 0.5, focalY: 0.42, cropMode: "cover" },
  1998: { focalX: 0.45, focalY: 0.46, cropMode: "cover" },
  2001: { focalX: 0.5, focalY: 0.48, cropMode: "cover" },
  2008: { focalX: 0.5, focalY: 0.44, cropMode: "cover" },
  2013: { focalX: 0.5, focalY: 0.26, cropMode: "cover" },
  2016: { focalX: 0.55, focalY: 0.44, cropMode: "cover" },
  2020: { focalX: 0.5, focalY: 0.42, cropMode: "cover" },
  2021: { focalX: 0.5, focalY: 0.44, cropMode: "cover" },
  2023: { focalX: 0.5, focalY: 0.48, cropMode: "cover" },
  2024: { focalX: 0.5, focalY: 0.44, cropMode: "cover" },
  2025: { focalX: 0.5, focalY: 0.4, cropMode: "cover" },
  2027: { focalX: 0.5, focalY: 0.5, cropMode: "cover" },
};
const WEDDING_DATE_SHANGHAI = { year: 2026, month: 9, day: 19 };
const SHANGHAI_TIMEZONE = "Asia/Shanghai";
const RECENT_DEFAULT_FOCAL_X = 0.5;
const RECENT_DEFAULT_FOCAL_Y = 0.45;
let countdownRefreshTimeoutId = null;

function getShanghaiDateTimeParts(dateValue = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(dateValue);
  const year = Number(parts.find((part) => part.type === "year")?.value || 0);
  const month = Number(parts.find((part) => part.type === "month")?.value || 0);
  const day = Number(parts.find((part) => part.type === "day")?.value || 0);
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const second = Number(parts.find((part) => part.type === "second")?.value || 0);
  return { year, month, day, hour, minute, second };
}

function getShanghaiDateParts(dateValue = new Date()) {
  const { year, month, day } = getShanghaiDateTimeParts(dateValue);
  return { year, month, day };
}

function getMillisecondsUntilNextShanghaiMidnight(now = new Date()) {
  const { hour, minute, second } = getShanghaiDateTimeParts(now);
  const elapsedMs = ((hour * 60 + minute) * 60 + second) * 1000 + now.getMilliseconds();
  return Math.max(1000, 86400000 - elapsedMs);
}

function formatShanghaiDebugStamp(now = new Date()) {
  const { year, month, day, hour, minute, second } = getShanghaiDateTimeParts(now);
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  const ss = String(second).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+08:00`;
}

function getDaysUntilWeddingShanghai(now = new Date()) {
  const shanghaiToday = getShanghaiDateParts(now);
  const todayUtcMidnight = Date.UTC(shanghaiToday.year, shanghaiToday.month - 1, shanghaiToday.day);
  const weddingUtcMidnight = Date.UTC(WEDDING_DATE_SHANGHAI.year, WEDDING_DATE_SHANGHAI.month - 1, WEDDING_DATE_SHANGHAI.day);
  return Math.floor((weddingUtcMidnight - todayUtcMidnight) / 86400000);
}

function renderHeroCountdown() {
  if (!heroCountdown) return;

  const now = new Date();
  const daysRemaining = getDaysUntilWeddingShanghai(now);
  if (IS_LOCAL_DEV) {
    console.debug("[countdown:asia-shanghai]", {
      nowBeijing: formatShanghaiDebugStamp(now),
      daysToGo: daysRemaining,
    });
  }

  if (daysRemaining > 0) {
    const unit = daysRemaining === 1 ? "day" : "days";
    heroCountdown.textContent = `${daysRemaining} ${unit} to go`;
    return;
  }

  if (daysRemaining === 0) {
    heroCountdown.textContent = "Today";
    return;
  }

  heroCountdown.textContent = "Married!";
}

function scheduleHeroCountdownMidnightRefresh() {
  if (countdownRefreshTimeoutId) window.clearTimeout(countdownRefreshTimeoutId);
  const delay = getMillisecondsUntilNextShanghaiMidnight(new Date());
  countdownRefreshTimeoutId = window.setTimeout(() => {
    renderHeroCountdown();
    scheduleHeroCountdownMidnightRefresh();
  }, delay);
}

function initHeroCountdown() {
  if (!heroCountdown) return;
  renderHeroCountdown();
  scheduleHeroCountdownMidnightRefresh();
}

function withBasePath(pathValue) {
  if (!pathValue) return "";
  if (/^https?:\/\//i.test(pathValue)) return pathValue;

  const rawPath = String(pathValue).trim();
  if (!rawPath) return "";

  if (!BASE_PATH) return rawPath;
  if (rawPath === BASE_PATH || rawPath.startsWith(`${BASE_PATH}/`)) return rawPath;
  if (rawPath.startsWith("/")) return `${BASE_PATH}${rawPath}`;
  return `${BASE_PATH}/${rawPath.replace(/^\.?\//, "")}`;
}

function clampPartySize(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 6;
  return Math.max(1, Math.min(6, Math.floor(num)));
}

function isSheetsConfigured() {
  return Boolean(
    SHEETS_WEBAPP_URL &&
      /^https?:\/\//i.test(SHEETS_WEBAPP_URL) &&
      !SHEETS_WEBAPP_URL.includes("PASTE_DEPLOYED_WEBAPP_URL_HERE") &&
      !SHEETS_WEBAPP_URL.includes("PASTE_WEBAPP_URL_HERE") &&
      !SHEETS_WEBAPP_URL.includes("PASTE_WEB_APP_URL_HERE"),
  );
}

function getScrollBehavior() {
  return reducedMotion ? "auto" : "smooth";
}

function prefersReducedMotion() {
  return reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setAriaExpanded(node, expanded) {
  node.setAttribute("aria-expanded", String(expanded));
}

function setHiddenClass(node, hidden) {
  node.classList.toggle("hidden", Boolean(hidden));
}

function setA11yHidden(node, hidden) {
  node.hidden = Boolean(hidden);
  node.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function createExternalAnchor(href, textContent, className = "") {
  const anchor = document.createElement("a");
  if (className) anchor.className = className;
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = textContent;
  return anchor;
}

function setActiveLink(sectionId) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-link") === sectionId);
  });

  if (desktopMoreToggle) {
    const hasOverflowActive = desktopMoreLinks.some((link) => link.getAttribute("data-link") === sectionId);
    desktopMoreToggle.classList.toggle("active", hasOverflowActive);
  }
}

function initSectionObserver() {
  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveLink(visible[0].target.id);
    },
    {
      threshold: [0.12, 0.28, 0.45, 0.6],
      rootMargin: "-16% 0px -48% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function closeMobileMenu() {
  if (!mobileNavSheet || !menuToggle) return;
  mobileNavSheet.classList.remove("open");
  setAriaExpanded(menuToggle, false);
}

function closeDesktopMoreMenu() {
  if (!desktopMoreToggle || !desktopMoreMenu) return;
  setAriaExpanded(desktopMoreToggle, false);
  desktopMoreMenu.hidden = true;
}

function openDesktopMoreMenu() {
  if (!desktopMoreToggle || !desktopMoreMenu) return;
  setAriaExpanded(desktopMoreToggle, true);
  desktopMoreMenu.hidden = false;
}

function toggleDesktopMoreMenu() {
  if (!desktopMoreToggle || !desktopMoreMenu) return;
  const expanded = desktopMoreToggle.getAttribute("aria-expanded") === "true";
  if (expanded) closeDesktopMoreMenu();
  else openDesktopMoreMenu();
}

function initHeader() {
  if (menuToggle && mobileNavSheet) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNavSheet.classList.toggle("open");
      setAriaExpanded(menuToggle, isOpen);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1100) closeMobileMenu();
      if (window.innerWidth < 1100) closeDesktopMoreMenu();
    });
  }

  if (desktopMoreToggle && desktopMoreMenu && desktopNavMore) {
    closeDesktopMoreMenu();

    desktopMoreToggle.addEventListener("click", (event) => {
      event.preventDefault();
      toggleDesktopMoreMenu();
    });

    desktopMoreLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeDesktopMoreMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeDesktopMoreMenu();
    });

    document.addEventListener(
      "pointerdown",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (desktopNavMore.contains(target)) return;
        closeDesktopMoreMenu();
      },
      { passive: true },
    );
  }

  document.querySelectorAll(".desktop-nav a, .desktop-nav-more-toggle, .mobile-nav a, .header-rsvp, .brand").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
      if (!desktopNavMore || !desktopNavMore.contains(link)) closeDesktopMoreMenu();
    });
  });
}

function closeJumpMenu() {
  if (!jumpMenuToggle || !jumpMenuPanel) return;
  setAriaExpanded(jumpMenuToggle, false);
  jumpMenuPanel.hidden = true;
}

function openJumpMenu() {
  if (!jumpMenuToggle || !jumpMenuPanel) return;
  setAriaExpanded(jumpMenuToggle, true);
  jumpMenuPanel.hidden = false;
}

function toggleJumpMenu() {
  if (!jumpMenuToggle || !jumpMenuPanel) return;
  const expanded = jumpMenuToggle.getAttribute("aria-expanded") === "true";
  if (expanded) closeJumpMenu();
  else openJumpMenu();
}

function syncJumpMenuVisibility() {
  if (!jumpMenuWrap) return;
  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
  const revealThreshold = isMobileViewport ? Math.max(880, window.innerHeight * 1.65) : Math.max(240, window.innerHeight * 0.9);
  const visible = window.scrollY > revealThreshold;
  jumpMenuWrap.classList.toggle("is-visible", visible);
  if (!visible) closeJumpMenu();
}

function initJumpMenu() {
  if (!jumpMenuWrap || !jumpMenuToggle || !jumpMenuPanel) return;
  if (jumpMenuWrap.dataset.bound === "true") return;

  closeJumpMenu();
  syncJumpMenuVisibility();

  jumpMenuToggle.addEventListener("click", (event) => {
    event.preventDefault();
    toggleJumpMenu();
  });

  jumpMenuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : href;
      const target = id ? document.getElementById(id) : null;
      if (target) target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
      closeJumpMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeJumpMenu();
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (jumpMenuWrap.contains(target)) return;
      closeJumpMenu();
    },
    { passive: true },
  );

  window.addEventListener("scroll", syncJumpMenuVisibility, { passive: true });
  window.addEventListener("resize", syncJumpMenuVisibility);
  jumpMenuWrap.dataset.bound = "true";
}

function initThingsThemes() {
  if (!thingsThemeList) return;
  if (thingsThemeList.dataset.bound === "true") return;

  const detailsNodes = Array.from(thingsThemeList.querySelectorAll("details.things-theme"));
  if (!detailsNodes.length) return;

  detailsNodes.forEach((node) => {
    node.open = false;
  });

  detailsNodes.forEach((node) => {
    node.addEventListener("toggle", () => {
      if (!node.open) return;
      detailsNodes.forEach((other) => {
        if (other !== node) other.open = false;
      });
    });
  });

  thingsThemeList.dataset.bound = "true";
}

function initStorySkipLink() {
  if (!storySkipLink || storySkipLink.dataset.bound === "true") return;

  storySkipLink.addEventListener("click", (event) => {
    event.preventDefault();
    const href = storySkipLink.getAttribute("href") || "#venue";
    const targetId = href.startsWith("#") ? href.slice(1) : href;
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;
    target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
  });

  storySkipLink.dataset.bound = "true";
}

function renderTravelPassportResult(key) {
  if (!travelPassportResult) return;
  const rule = TRAVEL_PASSPORT_RULES[String(key || "")];
  if (!rule) {
    setHiddenClass(travelPassportResult, true);
    travelPassportResult.hidden = true;
    return;
  }

  const title = travelPassportResult.querySelector(".travel-result-title");
  const outcome = travelPassportResult.querySelector(".travel-result-outcome");
  const detail = travelPassportResult.querySelector(".travel-result-detail");
  if (!title || !outcome || !detail) return;

  title.textContent = rule.title;
  outcome.textContent = "";
  const strong = document.createElement("strong");
  strong.textContent = rule.outcome;
  outcome.appendChild(strong);
  detail.textContent = rule.detail;
  setHiddenClass(travelPassportResult, false);
  travelPassportResult.hidden = false;
}

function initScheduleReveal() {
  const sectionRef = document.getElementById("schedule");
  if (!sectionRef) return;
  const timelineRef = sectionRef.querySelector(".schedule-list");
  if (!(timelineRef instanceof HTMLElement)) return;

  const rowRefs = Array.from(timelineRef.querySelectorAll(".scheduleRow"));
  if (!rowRefs.length) return;
  const dotRefs = rowRefs.map((row) => row.querySelector(".schedule-dot"));

  const reduce = prefersReducedMotion();
  if (reduce) {
    timelineRef.style.setProperty("--schedule-line-progress", "1");
    rowRefs.forEach((row) => {
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    });
    dotRefs.forEach((dot) => {
      if (!(dot instanceof HTMLElement)) return;
      dot.style.opacity = "1";
      dot.style.transform = "translateY(-50%) scale(1)";
    });
    return;
  }

  sectionRef.classList.add("schedule-scrub-ready");
  timelineRef.style.setProperty("--schedule-line-progress", "0");

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const getProgress = () => {
    const rect = sectionRef.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const start = viewportHeight * 0.85;
    const end = viewportHeight * 0.15;
    const raw = (start - rect.top) / Math.max(1, start - end);
    return clamp(raw, 0, 1);
  };

  const renderProgress = (progressValue) => {
    const p = clamp(progressValue, 0, 1);
    timelineRef.style.setProperty("--schedule-line-progress", `${p}`);

    const count = rowRefs.length;
    rowRefs.forEach((row, index) => {
      const revealStart = (index / Math.max(1, count)) * 0.9;
      const revealEnd = revealStart + 0.18;
      const t = clamp((p - revealStart) / Math.max(0.001, revealEnd - revealStart), 0, 1);
      row.style.opacity = `${t}`;
      row.style.transform = `translateY(${((1 - t) * 10).toFixed(3)}px)`;

      const dot = dotRefs[index];
      if (!(dot instanceof HTMLElement)) return;
      const dotScale = 0.96 + 0.04 * t;
      dot.style.opacity = `${t}`;
      dot.style.transform = `translateY(-50%) scale(${dotScale.toFixed(4)})`;
    });
  };

  renderProgress(0);

  let active = false;
  let rafId = null;

  const apply = () => {
    rafId = null;
    renderProgress(getProgress());
  };

  const requestApply = () => {
    if (!active) return;
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(apply);
  };

  const onScroll = () => {
    requestApply();
  };

  const onResize = () => {
    requestApply();
  };

  const attach = () => {
    if (active) return;
    active = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    requestApply();
  };

  const detach = () => {
    if (!active) return;
    active = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    renderProgress(getProgress());
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const inView = entries.some((entry) => entry.isIntersecting);
      if (inView) attach();
      else detach();
    },
    {
      threshold: 0.05,
      rootMargin: "20% 0px 20% 0px",
    },
  );

  observer.observe(sectionRef);
}

function initTravelVisaSection() {
  const hasPills = travelPassportPills.length > 0;

  const syncPassportUi = (rawValue) => {
    const key = String(rawValue || "");
    renderTravelPassportResult(key);

    if (hasPills) {
      travelPassportPills.forEach((pill) => {
        const isActive = pill.dataset.passport === key;
        pill.classList.toggle("is-active", isActive);
        pill.setAttribute("aria-pressed", String(isActive));
      });
    }

    if (travelPassportClear) {
      travelPassportClear.classList.toggle("hidden", !key);
    }
  };

  if (hasPills) {
    travelPassportPills.forEach((pill) => {
      if (pill.dataset.bound === "true") return;
      pill.setAttribute("aria-pressed", "false");
      pill.addEventListener("click", () => {
        const key = pill.dataset.passport || "";
        const currentlyActive = pill.classList.contains("is-active");
        syncPassportUi(currentlyActive ? "" : key);
      });
      pill.dataset.bound = "true";
    });
  }

  if (travelPassportClear && travelPassportClear.dataset.bound !== "true") {
    travelPassportClear.addEventListener("click", () => {
      syncPassportUi("");
    });
    travelPassportClear.dataset.bound = "true";
  }

  syncPassportUi("");

  if (travelSourcesDisclosure && travelSourcesDisclosure.dataset.bound !== "true") {
    travelSourcesDisclosure.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      travelSourcesDisclosure.open = false;
      const summary = travelSourcesDisclosure.querySelector("summary");
      if (summary instanceof HTMLElement) summary.focus({ preventScroll: true });
    });
    travelSourcesDisclosure.dataset.bound = "true";
  }
}

async function copyTextToClipboard(value) {
  const text = String(value || "").trim();
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // Fall back to the textarea approach below.
    }
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "true");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  helper.style.pointerEvents = "none";
  document.body.appendChild(helper);
  helper.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }

  document.body.removeChild(helper);
  return copied;
}

function createFoodCopyButton(copyValueInput, options = {}) {
  const copyValue = String(copyValueInput || "").trim();
  const label = String(options.label || "Copy name");
  const copiedLabel = String(options.copiedLabel || "Copied!");
  const failedLabel = String(options.failedLabel || "Copy failed");
  const ariaLabel = String(options.ariaLabel || `Copy ${label.toLowerCase()}`);
  const className = String(options.className || "makan-copy-btn");
  const title = String(options.title || "Copy");
  const iconOnly = Boolean(options.iconOnly);
  const resetDelay = Number.isFinite(options.resetDelay) ? Math.max(300, Number(options.resetDelay)) : 600;
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", ariaLabel);
  button.title = title;
  if (iconOnly) {
    button.textContent = "⧉";
    button.dataset.defaultText = "⧉";
  } else {
    button.textContent = label;
    button.dataset.defaultText = button.textContent;
  }

  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    const copied = await copyTextToClipboard(copyValue);
    if (iconOnly) {
      showToast(copied ? copiedLabel : failedLabel);
      button.classList.toggle("is-copied", copied);
    } else {
      button.textContent = copied ? copiedLabel : failedLabel;
      button.classList.toggle("is-copied", copied);
    }

    window.setTimeout(() => {
      button.textContent = button.dataset.defaultText || (iconOnly ? "⧉" : label);
      button.classList.remove("is-copied");
      button.disabled = false;
    }, resetDelay);
  });

  return button;
}

function dedupeMakanDescription(rawText) {
  const normalized = String(rawText || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const unique = [];
  const seen = new Set();
  normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const key = part.replace(/\s+/g, " ").trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(part.replace(/\s+/g, " ").trim());
    });

  return unique.join("\n\n");
}

function buildMakanRestaurantItem(place) {
  const row = document.createElement("div");
  row.className = "makan-item";
  const rawNameEn = String(place.name_en || "").trim();
  const nameParts = rawNameEn.split(/\s+—\s+/);
  const nameOnly = nameParts.shift() || rawNameEn;
  const movedTagline = nameParts.join(" — ").trim();
  const taglineLead = movedTagline ? (/[.!?]$/.test(movedTagline) ? movedTagline : `${movedTagline}.`) : "";
  const baseBlurb = String(place.blurb_en || "").trim();
  const mergedBlurb = [taglineLead, baseBlurb].filter(Boolean).join(" ").trim();
  const blurbText = dedupeMakanDescription(mergedBlurb);

  const meta = document.createElement("div");
  meta.className = "makan-item-main";

  const createMetaRow = ({ label, value, copyValue, valueClass, rowClass }) => {
    if (!value) return null;
    const rowEl = document.createElement("div");
    rowEl.className = `makan-meta-row ${rowClass || ""}`.trim();
    rowEl.dataset.metaType = String(label || "").toLowerCase();

    const metaValue = document.createElement("span");
    metaValue.className = `makan-meta-value ${valueClass || ""}`.trim();
    metaValue.textContent = value;
    rowEl.appendChild(metaValue);

    if (copyValue) {
      rowEl.appendChild(
        createFoodCopyButton(copyValue, {
          className: "makan-copy-icon-btn",
          ariaLabel: `Copy ${label} for ${nameOnly}`,
          copiedLabel: "Copied!",
          failedLabel: "Copy failed",
          resetDelay: 600,
          iconOnly: true,
          title: "Copy",
        }),
      );
    }
    return rowEl;
  };

  const canonicalName = [nameOnly, place.name_cn].filter(Boolean).join(" / ");
  meta.appendChild(
    createMetaRow({
      label: "EN",
      value: nameOnly,
      copyValue: canonicalName,
      valueClass: "makan-name-en",
      rowClass: "makan-meta-name-row",
    }),
  );

  if (place.name_cn) {
    meta.appendChild(
      createMetaRow({
        label: "中文",
        value: place.name_cn,
        copyValue: place.name_cn,
        valueClass: "makan-name-cn",
      }),
    );
  }

  if (place.address_cn) {
    meta.appendChild(
      createMetaRow({
        label: "地址",
        value: place.address_cn,
        copyValue: place.address_cn,
        valueClass: "makan-address-text",
      }),
    );
  }

  const actions = document.createElement("div");
  actions.className = "makan-item-actions";
  if (place.dianping_url) {
    const link = createExternalAnchor(place.dianping_url, "Open in 大众点评", "makan-link");
    actions.appendChild(link);
  }
  meta.appendChild(actions);

  const panel = document.createElement("div");
  panel.className = "makan-item-panel";

  const fullDescription = document.createElement("p");
  fullDescription.className = "makan-item-description";
  fullDescription.textContent = blurbText;
  panel.appendChild(fullDescription);
  row.appendChild(meta);
  row.appendChild(panel);
  return row;
}

function updateMakanTypeControls() {
  if (!makanTypeAccordions.length) return;
  const openCount = makanTypeAccordions.reduce((count, accordion) => (accordion.open ? count + 1 : count), 0);
  if (makanExpandAll) makanExpandAll.disabled = openCount === makanTypeAccordions.length;
  if (makanCollapseAll) makanCollapseAll.disabled = openCount === 0;
}

function setMakanTypeAccordionState(shouldOpen) {
  if (!makanTypeAccordions.length) return;
  makanBulkToggle = true;
  makanTypeAccordions.forEach((accordion) => {
    accordion.open = Boolean(shouldOpen);
  });
  makanBulkToggle = false;
  updateMakanTypeControls();
}

function initMakanTypeControls() {
  if ((!makanExpandAll && !makanCollapseAll) || (makanExpandAll && makanExpandAll.dataset.bound === "true")) {
    updateMakanTypeControls();
    return;
  }

  if (makanExpandAll) {
    makanExpandAll.addEventListener("click", () => {
      setMakanTypeAccordionState(true);
    });
    makanExpandAll.dataset.bound = "true";
  }

  if (makanCollapseAll) {
    makanCollapseAll.addEventListener("click", () => {
      setMakanTypeAccordionState(false);
    });
    makanCollapseAll.dataset.bound = "true";
  }

  updateMakanTypeControls();
}

function renderMakanMenuRows() {
  if (!makanMenuRows) return;
  makanMenuRows.innerHTML = "";
  makanTypeAccordions = [];

  const sorted = [...BEIJING_FOOD_PLACES].sort((a, b) => {
    const aType = String(a.restaurantType || a.category || "");
    const bType = String(b.restaurantType || b.category || "");
    const aOrder = MAKAN_TYPE_ORDER.indexOf(aType);
    const bOrder = MAKAN_TYPE_ORDER.indexOf(bType);
    const categoryDelta = (aOrder < 0 ? Number.MAX_SAFE_INTEGER : aOrder) - (bOrder < 0 ? Number.MAX_SAFE_INTEGER : bOrder);
    if (categoryDelta !== 0) return categoryDelta;
    return a.name_en.localeCompare(b.name_en, undefined, { sensitivity: "base" });
  });

  const grouped = new Map();
  sorted.forEach((place) => {
    const nextType = String(place.restaurantType || place.category || "Restaurant");
    if (!grouped.has(nextType)) {
      grouped.set(nextType, []);
    }
    grouped.get(nextType)?.push(place);
  });

  Array.from(grouped.entries()).forEach(([typeName, places], groupIndex) => {
    const accordion = document.createElement("details");
    accordion.className = "makan-type";

    const summary = document.createElement("summary");
    summary.className = "makan-type-summary";
    summary.setAttribute("aria-label", `Toggle ${typeName}`);

    const title = document.createElement("span");
    title.className = "makan-type-title";
    title.textContent = typeName;

    const chevron = document.createElement("span");
    chevron.className = "makan-type-chevron";
    chevron.setAttribute("aria-hidden", "true");

    summary.appendChild(title);
    summary.appendChild(chevron);

    const panel = document.createElement("div");
    panel.className = "makan-type-panel";
    panel.id = `makanTypePanel${groupIndex + 1}`;

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "makan-type-items";
    places.forEach((place) => {
      itemsWrap.appendChild(buildMakanRestaurantItem(place));
    });
    panel.appendChild(itemsWrap);

    accordion.appendChild(summary);
    accordion.appendChild(panel);
    makanMenuRows.appendChild(accordion);
    makanTypeAccordions.push(accordion);

    accordion.addEventListener("toggle", () => {
      if (!accordion.open || makanBulkToggle) {
        updateMakanTypeControls();
        return;
      }
      makanTypeAccordions.forEach((peer) => {
        if (peer !== accordion && peer.open) peer.open = false;
      });
      updateMakanTypeControls();
    });
  });

  updateMakanTypeControls();
}

function closeMakanTipPopover() {
  if (!makanTipTrigger || !makanTipPopover) return;
  setA11yHidden(makanTipPopover, true);
  setAriaExpanded(makanTipTrigger, false);
  makanTipOpen = false;
}

function positionMakanTipPopover() {
  if (!makanTipTrigger || !makanTipPopover || makanTipPopover.hidden) return;
  const triggerRect = makanTipTrigger.getBoundingClientRect();
  const popoverRect = makanTipPopover.getBoundingClientRect();
  const gap = 10;
  const viewportPadding = 12;

  let left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - popoverRect.width - viewportPadding));

  let top = triggerRect.bottom + gap;
  if (top + popoverRect.height > window.innerHeight - viewportPadding) {
    top = triggerRect.top - popoverRect.height - gap;
  }
  if (top < viewportPadding) top = viewportPadding;

  makanTipPopover.style.left = `${left}px`;
  makanTipPopover.style.top = `${top}px`;
}

function openMakanTipPopover() {
  if (!makanTipTrigger || !makanTipPopover) return;
  setA11yHidden(makanTipPopover, false);
  setAriaExpanded(makanTipTrigger, true);
  makanTipOpen = true;
  positionMakanTipPopover();
}

function toggleMakanTipPopover() {
  if (makanTipOpen) closeMakanTipPopover();
  else openMakanTipPopover();
}

function initMakanTipPopover() {
  if (!makanTipTrigger || !makanTipPopover) return;
  if (makanTipTrigger.dataset.bound === "true") return;

  closeMakanTipPopover();

  makanTipTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMakanTipPopover();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !makanTipOpen) return;
    closeMakanTipPopover();
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!makanTipOpen) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (makanTipTrigger.contains(target) || makanTipPopover.contains(target)) return;
      closeMakanTipPopover();
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (makanTipOpen) positionMakanTipPopover();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (makanTipOpen) positionMakanTipPopover();
    },
    { passive: true },
  );

  makanTipTrigger.dataset.bound = "true";
}

function closeMakanLegalModal({ restoreFocus = true } = {}) {
  if (!makanLegalPopover || !makanLegalTrigger) return;
  setA11yHidden(makanLegalPopover, true);
  makanLegalPopover.classList.remove("open");
  setAriaExpanded(makanLegalTrigger, false);
  makanLegalOpen = false;
  if (restoreFocus) {
    makanLegalTrigger.focus({ preventScroll: true });
  }
}

function openMakanLegalModal() {
  if (!makanLegalPopover || !makanLegalTrigger) return;
  setA11yHidden(makanLegalPopover, false);
  makanLegalPopover.classList.add("open");
  setAriaExpanded(makanLegalTrigger, true);
  makanLegalOpen = true;
  if (makanLegalClose instanceof HTMLElement) {
    window.requestAnimationFrame(() => makanLegalClose.focus({ preventScroll: true }));
  }
}

function initMakanLegalModal() {
  if (!makanLegalTrigger || !makanLegalPopover) return;
  if (makanLegalTrigger.dataset.boundLegal === "true") return;

  closeMakanLegalModal({ restoreFocus: false });

  makanLegalTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (makanLegalOpen) closeMakanLegalModal();
    else openMakanLegalModal();
  });

  if (makanLegalClose) {
    makanLegalClose.addEventListener("click", () => closeMakanLegalModal());
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && makanLegalOpen) {
      closeMakanLegalModal();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!makanLegalOpen) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (makanLegalPopover.contains(target) || makanLegalTrigger.contains(target)) return;
    closeMakanLegalModal({ restoreFocus: false });
  });

  makanLegalTrigger.dataset.boundLegal = "true";
}

function initMakanSection() {
  renderMakanMenuRows();
  initMakanTypeControls();
  initMakanTipPopover();
  initMakanLegalModal();
}

function createSvgNode(tagName, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function metricBandFromNorm(value) {
  if (value < 0.34) return "low";
  if (value < 0.67) return "medium";
  return "high";
}

function priceBucketFromNorm(normValue) {
  if (normValue < 0.25) return "$";
  if (normValue < 0.5) return "$$";
  if (normValue < 0.75) return "$$$";
  return "$$$$";
}

function buildHotelRatingClaim(items) {
  if (!Array.isArray(items) || !items.length) return "";
  const ratings = items.map((item) => Number(item.metrics && item.metrics.comfortRating)).filter((value) => Number.isFinite(value));
  if (!ratings.length) return "";

  const minRating = Math.min(...ratings);
  const labels = [
    ...new Set(
      items
        .map((item) => String((item.metrics && item.metrics.sourceLabel) || "").trim())
        .filter(Boolean),
    ),
  ];
  const source = labels.length === 1 ? labels[0] : labels.length ? labels.join(", ") : "listed sources";
  return `All hotels shown are rated ≥ ${minRating.toFixed(1)} on ${source}.`;
}

function isHotelMatrixMobile() {
  return window.matchMedia("(max-width: 860px)").matches || isCoarsePointer();
}

function getHotelById(hotelId) {
  if (!hotelId) return null;
  return hotelMatrixItems.find((item) => item.id === hotelId) || null;
}

function getActiveHotelMatrixId() {
  return hotelMatrixPinnedId || "";
}

function ensureHotelMethodOverlay() {
  if (hotelMethodTooltip) return;

  hotelMethodTooltip = document.createElement("div");
  hotelMethodTooltip.id = "hotelMethodOverlay";
  hotelMethodTooltip.className = "hotel-method-tooltip";
  hotelMethodTooltip.setAttribute("role", "tooltip");
  hotelMethodTooltip.hidden = true;
  hotelMethodTooltip.setAttribute("aria-hidden", "true");
  hotelMethodTooltip.innerHTML = `
    <p class="hotel-method-tooltip-title">METHODOLOGY</p>
    <ul class="hotel-method-tooltip-list">
      <li>Y-axis: estimated drive time (mins) to the wedding venue (traffic dependent).</li>
      <li>X-axis: nightly price bands in USD ($: under 150, $$: 150–300, $$$: 301–500, $$$$: 500+).</li>
      <li>Only hotels rated ≥ 9.0 on Expedia are shown.</li>
      <li>Shaded area = best value zone (lower price + shorter drive time).</li>
      <li>No footnotes, no appendix — our AI analyst “Chat” ran the numbers. I already did my six-year consultant sentence.</li>
    </ul>
  `;

  document.body.appendChild(hotelMethodTooltip);
}

function positionHotelMethodTooltip() {
  if (!hotelMethodTrigger || !hotelMethodTooltip || hotelMethodTooltip.hidden) return;

  const triggerRect = hotelMethodTrigger.getBoundingClientRect();
  const tooltipRect = hotelMethodTooltip.getBoundingClientRect();
  const gap = 10;
  const viewportPadding = 12;

  let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));

  let top = triggerRect.bottom + gap;
  if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
    top = triggerRect.top - tooltipRect.height - gap;
  }
  if (top < viewportPadding) top = viewportPadding;

  hotelMethodTooltip.style.left = `${left}px`;
  hotelMethodTooltip.style.top = `${top}px`;
}

function closeHotelMethodologyTooltip(resetPinned = true) {
  if (!hotelMethodTooltip || !hotelMethodTrigger) return;
  if (hotelMethodCloseTimer) {
    window.clearTimeout(hotelMethodCloseTimer);
    hotelMethodCloseTimer = null;
  }
  setA11yHidden(hotelMethodTooltip, true);
  setAriaExpanded(hotelMethodTrigger, false);
  hotelMethodOpen = false;
  if (resetPinned) hotelMethodPinned = false;
}

function openHotelMethodologyTooltip({ pinned = false } = {}) {
  if (!hotelMethodTrigger) return;
  ensureHotelMethodOverlay();
  if (!hotelMethodTooltip) return;
  hotelMethodPinned = pinned;
  setA11yHidden(hotelMethodTooltip, false);
  setAriaExpanded(hotelMethodTrigger, true);
  hotelMethodOpen = true;
  positionHotelMethodTooltip();
}

function initHotelMethodology() {
  if (!hotelMethodTrigger) return;
  if (hotelMethodTrigger.dataset.bound === "true") return;
  ensureHotelMethodOverlay();
  if (!hotelMethodTooltip) return;

  closeHotelMethodologyTooltip();

  const openIfDesktop = () => {
    if (isCoarsePointer()) return;
    if (hotelMethodPinned) return;
    openHotelMethodologyTooltip({ pinned: false });
  };

  const closeIfDesktop = () => {
    if (isCoarsePointer()) return;
    if (hotelMethodPinned) return;
    if (hotelMethodCloseTimer) window.clearTimeout(hotelMethodCloseTimer);
    hotelMethodCloseTimer = window.setTimeout(() => {
      closeHotelMethodologyTooltip();
      hotelMethodCloseTimer = null;
    }, 90);
  };

  hotelMethodTrigger.addEventListener("pointerenter", openIfDesktop);
  hotelMethodTrigger.addEventListener("pointerleave", (event) => {
    const related = event.relatedTarget;
    if (related instanceof Node && hotelMethodTooltip.contains(related)) return;
    closeIfDesktop();
  });
  hotelMethodTooltip.addEventListener("pointerenter", openIfDesktop);
  hotelMethodTooltip.addEventListener("pointerleave", (event) => {
    const related = event.relatedTarget;
    if (related instanceof Node && hotelMethodTrigger.contains(related)) return;
    closeIfDesktop();
  });
  hotelMethodTrigger.addEventListener("focus", openIfDesktop);
  hotelMethodTrigger.addEventListener("blur", () => {
    window.setTimeout(() => {
      const active = document.activeElement;
      if (active instanceof Node && (hotelMethodTrigger.contains(active) || hotelMethodTooltip.contains(active))) return;
      closeHotelMethodologyTooltip();
    }, 0);
  });

  hotelMethodTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (hotelMethodOpen && hotelMethodPinned) closeHotelMethodologyTooltip();
    else openHotelMethodologyTooltip({ pinned: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && hotelMethodOpen) {
      closeHotelMethodologyTooltip();
    }
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!hotelMethodOpen) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (hotelMethodTooltip.contains(target) || hotelMethodTrigger.contains(target)) return;
      closeHotelMethodologyTooltip();
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (hotelMethodOpen) positionHotelMethodTooltip();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (hotelMethodOpen) positionHotelMethodTooltip();
    },
    { passive: true },
  );

  hotelMethodTrigger.dataset.bound = "true";
}

function hideHotelDotTooltip() {
  if (!hotelMatrixTooltip) return;
  hotelMatrixTooltip.hidden = true;
  hotelMatrixTooltip.setAttribute("aria-hidden", "true");
}

function buildHotelDetailsCard(item) {
  const card = document.createElement("article");
  card.className = "hotel-map-detail-card";

  const media = document.createElement("figure");
  media.className = "hotel-map-detail-media";
  const image = document.createElement("img");
  image.src = toPhotoSrc(item.imageSrc);
  image.alt = item.name;
  image.loading = "eager";
  image.fetchPriority = "high";
  image.decoding = "sync";
  media.appendChild(image);
  card.appendChild(media);

  const heading = document.createElement("h4");
  heading.className = "hotel-map-detail-name";
  heading.textContent = item.name;
  card.appendChild(heading);

  const blurb = document.createElement("p");
  blurb.className = "hotel-map-detail-blurb";
  blurb.textContent = item.shortBlurb;
  card.appendChild(blurb);

  const statsGrid = document.createElement("div");
  statsGrid.className = "hotel-map-detail-stats";

  const distanceStat = document.createElement("div");
  distanceStat.className = "hotel-map-detail-stat";
  const distanceLabel = document.createElement("span");
  distanceLabel.className = "hotel-map-detail-stat-label";
  distanceLabel.textContent = "Distance";
  const distanceValue = document.createElement("span");
  distanceValue.className = "hotel-map-detail-stat-value";
  distanceValue.textContent = `${Number(item.distanceKm).toFixed(1)} km • ${item.driveMins} min`;
  distanceStat.appendChild(distanceLabel);
  distanceStat.appendChild(distanceValue);

  const priceStat = document.createElement("div");
  priceStat.className = "hotel-map-detail-stat";
  const priceLabel = document.createElement("span");
  priceLabel.className = "hotel-map-detail-stat-label";
  priceLabel.textContent = "Price snapshot";
  const priceValue = document.createElement("span");
  priceValue.className = "hotel-map-detail-stat-value";
  priceValue.textContent = `$${item.metrics.priceUsd}/night`;
  priceStat.appendChild(priceLabel);
  priceStat.appendChild(priceValue);

  statsGrid.appendChild(distanceStat);
  statsGrid.appendChild(priceStat);
  card.appendChild(statsGrid);

  const comfortLine = document.createElement("p");
  comfortLine.className = "hotel-map-detail-metrics";
  comfortLine.textContent = `Comfort: ${Number(item.metrics.comfortRating).toFixed(1)}/10 (${item.metrics.reviewCount} reviews)`;
  card.appendChild(comfortLine);

  const source = document.createElement("p");
  source.className = "hotel-map-detail-source";
  source.textContent = `Source: ${item.metrics.sourceLabel}`;
  if (item.metrics.secondarySourceLabel && item.metrics.secondarySourceValue) {
    source.textContent += ` · ${item.metrics.secondarySourceLabel} ${item.metrics.secondarySourceValue}`;
  }
  card.appendChild(source);

  const links = document.createElement("p");
  links.className = "hotel-map-detail-links";
  const book = createExternalAnchor(item.bookUrl, "Book");
  const directions = createExternalAnchor(item.directionsUrl, "Directions");
  links.appendChild(book);
  links.appendChild(directions);
  card.appendChild(links);

  return card;
}

function swapHotelDetails(item) {
  if (!hotelMatrixDetails || !item) return;
  if (hotelDetailsSwapTimer) {
    window.clearTimeout(hotelDetailsSwapTimer);
    hotelDetailsSwapTimer = null;
  }

  const nextId = item.id;
  if (hotelMatrixDetails.dataset.hotelId === nextId) return;
  if (reducedMotion) {
    hotelMatrixDetails.replaceChildren(buildHotelDetailsCard(item));
    hotelMatrixDetails.dataset.hotelId = nextId;
    return;
  }

  hotelMatrixDetails.classList.add("is-swapping");
  hotelDetailsSwapTimer = window.setTimeout(() => {
    hotelMatrixDetails.replaceChildren(buildHotelDetailsCard(item));
    hotelMatrixDetails.dataset.hotelId = nextId;
    hotelMatrixDetails.classList.remove("is-swapping");
    hotelDetailsSwapTimer = null;
  }, HOTEL_CONTENT_FADE_MS);
}

function openHotelMatrixSheet(item) {
  if (!hotelMatrixSheet || !hotelMatrixSheetContent || !item) return;
  hotelMatrixSheet.hidden = false;
  hotelMatrixSheetContent.replaceChildren(buildHotelDetailsCard(item));
  hotelSheetOpen = true;
  document.body.classList.add("modal-open");
  if (hotelMatrixSheetClose) hotelMatrixSheetClose.focus({ preventScroll: true });
}

function closeHotelMatrixSheet() {
  if (!hotelMatrixSheet) return;
  hotelMatrixSheet.hidden = true;
  hotelSheetOpen = false;
  document.body.classList.remove("modal-open");
}

function clearHotelMatrixSelection() {
  hotelMatrixPinnedId = "";
  closeHotelMatrixSheet();
  applyHotelMatrixSelection();
}

function applyHotelMatrixSelection() {
  const selectedId = getActiveHotelMatrixId();
  activeHotelMatrixId = selectedId;

  hotelMatrixMetaById.forEach((meta, hotelId) => {
    const isActive = hotelId === selectedId;
    if (meta.group) meta.group.classList.toggle("is-active", isActive);
  });

  const pinnedHotel = getHotelById(selectedId);
  if (pinnedHotel) {
    if (hotelMapCard) hotelMapCard.classList.add("has-selection");
    swapHotelDetails(pinnedHotel);
    hotelMatrixDetails.classList.add("is-visible");
  } else if (hotelMatrixDetails) {
    if (hotelMapCard) hotelMapCard.classList.remove("has-selection");
    hotelMatrixDetails.classList.remove("is-visible");
    hotelMatrixDetails.dataset.hotelId = "";
    if (hotelDetailsSwapTimer) {
      window.clearTimeout(hotelDetailsSwapTimer);
      hotelDetailsSwapTimer = null;
    }
    if (reducedMotion) {
      hotelMatrixDetails.replaceChildren();
    } else {
      hotelDetailsSwapTimer = window.setTimeout(() => {
        if (!hotelMatrixPinnedId && hotelMatrixDetails) hotelMatrixDetails.replaceChildren();
        hotelDetailsSwapTimer = null;
      }, HOTEL_PANEL_TRANSITION_MS);
    }
  }
  queueHotelMatrixRender();
  hideHotelDotTooltip();
}

function getHotelMatrixDimensions() {
  if (!hotelMatrixShell) {
    return { width: hotelMatrixWidth, height: hotelMatrixHeight };
  }

  const shellRect = hotelMatrixShell.getBoundingClientRect();
  const shellStyle = window.getComputedStyle(hotelMatrixShell);
  const innerWidth =
    shellRect.width -
    (Number.parseFloat(shellStyle.paddingLeft) || 0) -
    (Number.parseFloat(shellStyle.paddingRight) || 0);
  if (!(innerWidth > 0)) {
    return { width: hotelMatrixWidth, height: hotelMatrixHeight };
  }

  const width = Math.max(300, Math.round(innerWidth));
  const compact = width < 560;
  const aspect = compact ? 1 : 760 / 460;
  const height = compact ? Math.max(320, Math.round(width / aspect)) : Math.max(280, Math.round(width / aspect));
  return { width, height };
}

function renderHotelMatrix() {
  if (!hotelMatrixSvg || !hotelMatrixItems.length) return;

  const width = hotelMatrixWidth;
  const height = hotelMatrixHeight;
  const isCompact = width < 560;
  const margins = isCompact ? { top: 24, right: 24, bottom: 72, left: 80 } : { top: 42, right: 56, bottom: 104, left: 122 };
  const plotWidth = Math.max(180, width - margins.left - margins.right);
  const plotHeight = Math.max(170, height - margins.top - margins.bottom);
  const ringRadius = isCompact ? 10.8 : 12;
  const dotRadius = isCompact ? 6.6 : 7.4;

  hotelMatrixSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  hotelMatrixSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  hotelMatrixSvg.innerHTML = "";
  hotelMatrixMetaById = new Map();

  const title = createSvgNode("title", { id: "hotelMatrixTitle" });
  title.textContent = "Hotels matrix by price and drive time";
  const desc = createSvgNode("desc", { id: "hotelMatrixDesc" });
  desc.textContent = "Price increases from left to right. Drive time to the wedding venue increases from bottom to top.";
  hotelMatrixSvg.appendChild(title);
  hotelMatrixSvg.appendChild(desc);

  const defs = createSvgNode("defs");
  const clipPath = createSvgNode("clipPath", { id: "hotelMatrixPlotClip" });
  clipPath.appendChild(
    createSvgNode("rect", {
      x: margins.left,
      y: margins.top,
      width: plotWidth,
      height: plotHeight,
    }),
  );
  defs.appendChild(clipPath);
  hotelMatrixSvg.appendChild(defs);

  hotelMatrixSvg.appendChild(
    createSvgNode("rect", {
      class: "hotel-map-frame",
      x: margins.left,
      y: margins.top,
      width: plotWidth,
      height: plotHeight,
      fill: "none",
    }),
  );

  const midX = margins.left + plotWidth / 2;
  const midY = margins.top + plotHeight / 2;
  hotelMatrixSvg.appendChild(
    createSvgNode("line", { class: "hotel-map-midline", x1: midX, x2: midX, y1: margins.top, y2: margins.top + plotHeight }),
  );
  hotelMatrixSvg.appendChild(
    createSvgNode("line", { class: "hotel-map-midline", x1: margins.left, x2: margins.left + plotWidth, y1: midY, y2: midY }),
  );

  const prices = hotelMatrixItems.map((item) => Number(item.metrics.priceUsd)).filter((value) => Number.isFinite(value) && value > 0);
  const driveTimes = hotelMatrixItems.map((item) => Number(item.driveMins)).filter((value) => Number.isFinite(value) && value >= 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDrive = Math.min(...driveTimes);
  const maxDrive = Math.max(...driveTimes);
  const drivePadding = Math.max(1, Math.round((maxDrive - minDrive) * 0.08));
  const driveDomainMin = Math.max(0, minDrive - drivePadding);
  const driveDomainMax = maxDrive + drivePadding;
  const driveTicks = [...new Set(driveTimes.map((value) => Math.round(value)))].sort((a, b) => a - b);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mapPrice = (price) => {
    if (!(minPrice > 0) || !(maxPrice > 0) || minPrice === maxPrice) return 0.5;
    const ratio = (Math.log(price) - Math.log(minPrice)) / (Math.log(maxPrice) - Math.log(minPrice));
    return clamp(0.04 + ratio * 0.92, 0.04, 0.96);
  };
  const mapDriveMins = (minutes) => {
    if (driveDomainMin === driveDomainMax) return 0.5;
    const ratio = (minutes - driveDomainMin) / (driveDomainMax - driveDomainMin);
    return clamp(0.04 + ratio * 0.92, 0.04, 0.96);
  };

  const bestValueDriveCutoff = Math.min(15, driveDomainMax);
  const bestValueYNorm = mapDriveMins(bestValueDriveCutoff);
  const bestValueTopY = margins.top + (1 - bestValueYNorm) * plotHeight;
  const bestValueZoneX = margins.left;
  const bestValueZoneWidth = plotWidth * 0.5;
  const bestValueZoneHeight = margins.top + plotHeight - bestValueTopY;
  const pointCoords = hotelMatrixItems.map((item) => {
    const xNorm = mapPrice(Number(item.metrics.priceUsd));
    const yNorm = mapDriveMins(Number(item.driveMins));
    return {
      item,
      xNorm,
      yNorm,
      cx: margins.left + xNorm * plotWidth,
      cy: margins.top + (1 - yNorm) * plotHeight,
      priceBand: priceBucketFromNorm(xNorm),
      driveBand: metricBandFromNorm(yNorm),
    };
  });

  hotelMatrixSvg.appendChild(
    createSvgNode("rect", {
      class: "hotel-map-best-value-zone",
      x: bestValueZoneX,
      y: bestValueTopY,
      width: bestValueZoneWidth,
      height: bestValueZoneHeight,
      rx: 0,
      ry: 0,
    }),
  );

  hotelMatrixSvg.appendChild(
    createSvgNode("line", {
      class: "hotel-map-axis",
      x1: margins.left,
      x2: margins.left + plotWidth,
      y1: margins.top + plotHeight,
      y2: margins.top + plotHeight,
    }),
  );
  hotelMatrixSvg.appendChild(
    createSvgNode("line", {
      class: "hotel-map-axis",
      x1: margins.left,
      x2: margins.left,
      y1: margins.top,
      y2: margins.top + plotHeight,
    }),
  );

  ["$", "$$", "$$$", "$$$$"].forEach((label, index, source) => {
    const ratio = source.length <= 1 ? 0 : index / (source.length - 1);
    const x = margins.left + ratio * plotWidth;

    hotelMatrixSvg.appendChild(
      createSvgNode("line", {
        class: "hotel-map-tick-line",
        x1: x,
        x2: x,
        y1: margins.top + plotHeight,
        y2: margins.top + plotHeight + 11,
      }),
    );

    const node = createSvgNode("text", {
      class: "hotel-map-tick",
      x,
      y: margins.top + plotHeight + 31,
      "text-anchor": "middle",
      "dominant-baseline": "hanging",
    });
    node.textContent = label;
    hotelMatrixSvg.appendChild(node);
  });

  driveTicks.forEach((minutes) => {
    const y = margins.top + (1 - mapDriveMins(minutes)) * plotHeight;
    hotelMatrixSvg.appendChild(
      createSvgNode("line", {
        class: "hotel-map-tick-line",
        x1: margins.left - 11,
        x2: margins.left,
        y1: y,
        y2: y,
      }),
    );

    const node = createSvgNode("text", {
      class: "hotel-map-tick",
      x: margins.left - 24,
      y,
      "text-anchor": "end",
      "dominant-baseline": "middle",
    });
    node.textContent = String(minutes);
    hotelMatrixSvg.appendChild(node);
  });

  const axisLabelClass = isCompact ? "hotel-map-axis-label hotel-map-axis-label--compact" : "hotel-map-axis-label";

  const xAxisLabel = createSvgNode("text", {
    class: axisLabelClass,
    x: margins.left + plotWidth / 2,
    y: height - 12,
    "text-anchor": "middle",
  });
  xAxisLabel.textContent = "Price ($ to $$$$)";
  hotelMatrixSvg.appendChild(xAxisLabel);

  const yAxisLabelX = isCompact ? 22 : 26;
  const yAxisLabel = createSvgNode("text", {
    class: axisLabelClass,
    x: yAxisLabelX,
    y: margins.top + plotHeight / 2,
    "text-anchor": "middle",
    transform: `rotate(-90 ${yAxisLabelX} ${margins.top + plotHeight / 2})`,
  });
  yAxisLabel.textContent = isCompact ? "Drive time to venue (mins)" : "Drive time to wedding venue (mins)";
  hotelMatrixSvg.appendChild(yAxisLabel);

  const layer = createSvgNode("g", { class: "hotel-map-points", "clip-path": "url(#hotelMatrixPlotClip)" });
  hotelMatrixSvg.appendChild(layer);

  pointCoords.forEach(({ item, cx, cy, priceBand, driveBand }) => {

    const group = createSvgNode("g", {
      class: "hotel-map-point",
      "data-id": item.id,
      tabindex: "0",
      role: "button",
      "aria-label": `Hotel: ${item.name}. Price ${priceBand}. Drive time ${Number(item.driveMins)} minutes (${driveBand}).`,
    });
    const dotAnchor = createSvgNode("g", {
      class: "hotel-map-dot-anchor",
      transform: `translate(${cx.toFixed(2)} ${cy.toFixed(2)})`,
    });
    const ring = createSvgNode("circle", {
      class: "hotel-map-dot-ring",
      cx: "0",
      cy: "0",
      r: ringRadius.toFixed(2),
    });
    const dot = createSvgNode("circle", {
      class: "hotel-map-dot",
      cx: "0",
      cy: "0",
      r: dotRadius.toFixed(2),
    });

    const handleSelect = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isSameSelection = hotelMatrixPinnedId === item.id;
      hotelMatrixPinnedId = isSameSelection ? "" : item.id;
      applyHotelMatrixSelection();

      if (isHotelMatrixMobile()) {
        if (hotelMatrixPinnedId) openHotelMatrixSheet(item);
        else closeHotelMatrixSheet();
      } else {
        closeHotelMatrixSheet();
      }
    };

    group.addEventListener("click", handleSelect);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelect(event);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        clearHotelMatrixSelection();
      }
    });
    group.addEventListener("focus", () => {
      group.classList.add("is-focused");
    });
    group.addEventListener("blur", () => {
      group.classList.remove("is-focused");
    });

    dotAnchor.appendChild(ring);
    dotAnchor.appendChild(dot);
    group.appendChild(dotAnchor);
    layer.appendChild(group);
    hotelMatrixMetaById.set(item.id, { group, item, cx, cy, priceBand });
  });

  applyHotelMatrixSelection();
}

function queueHotelMatrixRender(force = false) {
  if (hotelMatrixResizeRaf) return;
  hotelMatrixResizeRaf = window.requestAnimationFrame(() => {
    hotelMatrixResizeRaf = null;
    const next = getHotelMatrixDimensions();
    const changed =
      force ||
      Math.abs(next.width - hotelMatrixWidth) > 1 ||
      Math.abs(next.height - hotelMatrixHeight) > 1;
    if (!changed) return;
    hotelMatrixWidth = next.width;
    hotelMatrixHeight = next.height;
    renderHotelMatrix();
  });
}

function initHotelMatrix() {
  if (!hotelMatrixShell || !hotelMatrixSvg || !hotelMatrixDetails || !hotelMatrixChartCol) return;
  if (hotelMatrixShell.dataset.initialized === "true") return;
  initHotelMethodology();

  hotelMatrixItems = HOTELS_DATA.slice(0, 6);
  if (!hotelMatrixItems.length) return;

  if (hotelMatrixRatingClaim) {
    hotelMatrixRatingClaim.textContent = buildHotelRatingClaim(hotelMatrixItems);
  }

  if (hotelMatrixTooltip) hideHotelDotTooltip();
  if (hotelMapCard) hotelMapCard.classList.remove("has-selection");
  hotelMatrixDetails.classList.remove("is-visible");
  hotelMatrixDetails.replaceChildren();
  hotelMatrixDetails.dataset.hotelId = "";

  if (hotelMatrixSvg.dataset.bound !== "true") {
    hotelMatrixSvg.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".hotel-map-point")) return;
      if (hotelMatrixPinnedId) clearHotelMatrixSelection();
    });
    hotelMatrixSvg.dataset.bound = "true";
  }

  hotelMatrixSheetCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
      closeHotelMatrixSheet();
      hotelMatrixPinnedId = "";
      applyHotelMatrixSelection();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (hotelSheetOpen) closeHotelMatrixSheet();
    if (hotelMatrixPinnedId) {
      hotelMatrixPinnedId = "";
      applyHotelMatrixSelection();
    }
    hideHotelDotTooltip();
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (isHotelMatrixMobile() || !hotelMatrixPinnedId) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (hotelMatrixShell.contains(target) || hotelMatrixDetails.contains(target)) return;
      clearHotelMatrixSelection();
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (!isHotelMatrixMobile() && hotelSheetOpen) {
      closeHotelMatrixSheet();
    }
    queueHotelMatrixRender();
  });

  if ("ResizeObserver" in window) {
    hotelMatrixResizeObserver = new ResizeObserver(() => {
      queueHotelMatrixRender();
    });
    hotelMatrixResizeObserver.observe(hotelMatrixChartCol);
  }

  queueHotelMatrixRender(true);
  hotelMatrixShell.dataset.initialized = "true";
}

function setupRevealNode(node) {
  const delay = node.getAttribute("data-delay");
  node.style.setProperty("--reveal-delay", `${Number(delay || 0)}ms`);

  const shouldAnimate = node.classList.contains("settle") || node.classList.contains("section-title-reveal");
  if (reducedMotion || !shouldAnimate) {
    node.classList.add("in-view");
    return;
  }

  if (revealObserver) revealObserver.observe(node);
}

function initReveals() {
  reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    document.body.classList.add("reduce-motion");
  } else {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          revealObserver?.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );
  }

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .section-title-reveal").forEach((node) => setupRevealNode(node));
}

function getTokenFromUrl() {
  const url = new URL(window.location.href);
  return String(url.searchParams.get("t") || "").trim();
}

function applyInviteContext() {
  if (heroGreeting) {
    if (inviteState.greetingName) {
      heroGreeting.textContent = `Hi ${inviteState.greetingName} — we’d love to celebrate with you.`;
      heroGreeting.classList.remove("hidden");
    } else {
      heroGreeting.classList.add("hidden");
    }
  }

  populatePartySizeOptions(workingCount, inviteState.maxPartySize);

  if (fullNameInput && inviteState.greetingName && !fullNameInput.value.trim()) {
    fullNameInput.value = inviteState.greetingName;
  }
}

async function lookupToken(token) {
  if (!token || !isSheetsConfigured()) return;

  try {
    const response = await fetch(`${SHEETS_WEBAPP_URL}?action=lookup&t=${encodeURIComponent(token)}`);
    if (!response.ok) return;

    const data = await response.json();
    if (!data || !data.ok) return;

    inviteState.greetingName = String(data.name || "").trim();
    inviteState.maxPartySize = clampPartySize(data.maxPartySize || 6);
    applyInviteContext();
  } catch (_error) {
    // Optional personalization only.
  }
}

function populatePartySizeOptions(selectEl, maxParty) {
  if (!selectEl) return;

  const current = selectEl.value;
  const max = clampPartySize(maxParty);
  selectEl.innerHTML = '<option value="">Select</option>';

  for (let i = 1; i <= max; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = String(i);
    selectEl.appendChild(option);
  }

  if (current && Number(current) <= max) selectEl.value = current;
}

function hideGuestLimitError() {
  if (!guestLimitError) return;
  guestLimitError.textContent = "";
  guestLimitError.classList.add("hidden");
}

function showGuestLimitError(message) {
  if (!guestLimitError) return;
  guestLimitError.textContent = message;
  guestLimitError.classList.remove("hidden");
}

function pickRandomFunFactExamples(limit = FUN_FACT_CHIP_COUNT) {
  const pool = [...FUN_FACT_EXAMPLES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(limit, pool.length));
}

function buildFunFactExamplesPopover(input) {
  const wrap = document.createElement("div");
  wrap.className = "fun-fact-ideas";

  const controls = document.createElement("div");
  controls.className = "fun-fact-ideas-controls";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "fun-fact-ideas-toggle";
  toggle.textContent = "See ideas";
  setAriaExpanded(toggle, false);

  const shuffle = document.createElement("button");
  shuffle.type = "button";
  shuffle.className = "fun-fact-ideas-shuffle hidden";
  shuffle.textContent = "Shuffle ideas";

  const chipsWrap = document.createElement("div");
  chipsWrap.className = "fun-fact-ideas-chips hidden";

  const usedExamples = new Set();
  let displayedExamples = pickRandomFunFactExamples();

  function openIdeas() {
    chipsWrap.classList.remove("hidden");
    shuffle.classList.remove("hidden");
    setAriaExpanded(toggle, true);
    toggle.textContent = "Hide ideas";
  }

  function closeIdeas() {
    chipsWrap.classList.add("hidden");
    shuffle.classList.add("hidden");
    setAriaExpanded(toggle, false);
    toggle.textContent = "See ideas";
  }

  function insertExampleText(example) {
    const existing = input.value.trim();
    input.value = existing ? `${existing} / ${example}` : example;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }

  function renderChips() {
    chipsWrap.innerHTML = "";
    displayedExamples.forEach((example) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "fun-fact-chip";
      chip.textContent = example;
      if (usedExamples.has(example)) chip.classList.add("is-used");
      chip.addEventListener("click", () => {
        insertExampleText(example);
        usedExamples.add(example);
        chip.classList.add("is-used");
      });
      chipsWrap.appendChild(chip);
    });
  }

  toggle.addEventListener("click", () => {
    const isOpen = !chipsWrap.classList.contains("hidden");
    if (isOpen) {
      closeIdeas();
      return;
    }
    openIdeas();
    renderChips();
  });

  shuffle.addEventListener("click", () => {
    displayedExamples = pickRandomFunFactExamples();
    renderChips();
  });

  input.addEventListener("focus", () => {
    if (!chipsWrap.classList.contains("hidden")) return;
    openIdeas();
    renderChips();
  });

  controls.appendChild(toggle);
  controls.appendChild(shuffle);
  wrap.appendChild(controls);
  wrap.appendChild(chipsWrap);
  return wrap;
}

function getGuestCardTitle(index) {
  if (index === 0) return "You";
  return `+${index}`;
}

function getGuestNameLabel(index) {
  return `+${index} name`;
}

function buildGuestFunFactField(index, funFact = "") {
  const factField = document.createElement("div");
  factField.className = "field form-field";

  const inputId = `guestFunFact${index + 1}`;
  const factLabel = document.createElement("label");
  factLabel.setAttribute("for", inputId);
  factLabel.textContent = "Fun facts (we will print this on your name card to help break the ice)";

  const factInput = document.createElement("textarea");
  factInput.id = inputId;
  factInput.rows = 2;
  factInput.placeholder = "Example: I will travel for noodles.";
  factInput.value = funFact;
  factInput.dataset.guestFunFact = "true";

  const helper = document.createElement("p");
  helper.className = "field-helper";
  helper.textContent = "Short + specific is best.";

  factField.appendChild(factLabel);
  factField.appendChild(factInput);
  factField.appendChild(helper);
  factField.appendChild(buildFunFactExamplesPopover(factInput));
  return factField;
}

function buildPrimaryGuestCard(name = "", funFact = "") {
  const card = document.createElement("article");
  card.className = "guest-card guest-card--primary-inline";
  card.dataset.guestIndex = "0";

  const nameInput = document.createElement("input");
  nameInput.id = "guestName1";
  nameInput.type = "hidden";
  nameInput.value = name;
  nameInput.dataset.guestName = "true";
  nameInput.dataset.primaryGuest = "true";
  nameInput.dataset.autoSync = "true";

  card.appendChild(nameInput);
  card.appendChild(buildGuestFunFactField(0, funFact));
  return card;
}

function buildGuestCard(index, name = "", funFact = "") {
  const card = document.createElement("article");
  card.className = "guest-card";
  card.dataset.guestIndex = String(index);

  const header = document.createElement("div");
  header.className = "guest-card-header";

  const title = document.createElement("h4");
  title.textContent = getGuestCardTitle(index);
  header.appendChild(title);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "guest-remove";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    card.remove();
    resequenceGuestCards();
    hideGuestLimitError();
    updateAddGuestButtonState();
  });
  header.appendChild(remove);

  const nameInput = document.createElement("input");
  nameInput.id = `guestName${index + 1}`;
  nameInput.required = true;
  nameInput.value = name;
  nameInput.dataset.guestName = "true";
  nameInput.type = "text";
  const nameField = document.createElement("div");
  nameField.className = "field form-field";
  const nameLabel = document.createElement("label");
  nameLabel.setAttribute("for", `guestName${index + 1}`);
  nameLabel.textContent = getGuestNameLabel(index);
  nameField.appendChild(nameLabel);
  const error = document.createElement("p");
  error.className = "field-error hidden";
  error.textContent = "Please enter a name.";
  error.dataset.guestNameError = "true";
  nameField.appendChild(nameInput);
  nameField.appendChild(error);
  card.appendChild(nameField);

  card.appendChild(header);
  card.appendChild(buildGuestFunFactField(index, funFact));
  return card;
}

function resequenceGuestCards() {
  if (!guestCardsWrap) return;
  const cards = Array.from(guestCardsWrap.querySelectorAll(".guest-card"));
  cards.forEach((card, index) => {
    const guestIndex = index + 1;
    card.dataset.guestIndex = String(guestIndex);
    const title = card.querySelector(".guest-card-header h4");
    if (title) title.textContent = getGuestCardTitle(guestIndex);
    const nameInput = card.querySelector("input[data-guest-name]");
    const factInput = card.querySelector("textarea[data-guest-fun-fact]");
    if (nameInput) nameInput.id = `guestName${guestIndex + 1}`;
    if (factInput) factInput.id = `guestFunFact${guestIndex + 1}`;
    const nameLabel = card.querySelector("label[for^='guestName']");
    const factLabel = card.querySelector("label[for^='guestFunFact']");
    if (nameLabel) {
      nameLabel.setAttribute("for", `guestName${guestIndex + 1}`);
      nameLabel.textContent = getGuestNameLabel(guestIndex);
    }
    if (factLabel) factLabel.setAttribute("for", `guestFunFact${guestIndex + 1}`);
  });
}

function ensurePrimaryGuestCard() {
  if (!youGuestCardWrap) return;
  const existing = youGuestCardWrap.querySelector(".guest-card");
  if (existing) return;
  const preferredName = (fullNameInput && fullNameInput.value.trim()) || inviteState.greetingName;
  youGuestCardWrap.appendChild(buildPrimaryGuestCard(preferredName, ""));
  syncPrimaryGuestName(true);
}

function syncPrimaryGuestName(force = false) {
  if (!youGuestCardWrap || !fullNameInput) return;
  const primaryGuestInput =
    youGuestCardWrap.querySelector("input[data-primary-guest='true']") || youGuestCardWrap.querySelector("input[data-guest-name]");
  if (!(primaryGuestInput instanceof HTMLInputElement)) return;

  const fullName = fullNameInput.value.trim();
  const canSync = force || primaryGuestInput.dataset.autoSync === "true" || !primaryGuestInput.value.trim();
  if (!canSync) return;

  primaryGuestInput.value = fullName;
  primaryGuestInput.dataset.autoSync = "true";
}

function collectGuests() {
  const cards = [];
  if (youGuestCardWrap) {
    const primaryCard = youGuestCardWrap.querySelector(".guest-card");
    if (primaryCard) cards.push(primaryCard);
  }
  if (guestCardsWrap) cards.push(...Array.from(guestCardsWrap.querySelectorAll(".guest-card")));
  const fullName = (fullNameInput && fullNameInput.value.trim()) || inviteState.greetingName;
  return cards.map((card) => {
    const nameInput = card.querySelector("input[data-guest-name]");
    const factInput = card.querySelector("textarea[data-guest-fun-fact]");
    const isPrimary = nameInput instanceof HTMLInputElement && nameInput.dataset.primaryGuest === "true";
    return {
      name: isPrimary ? fullName : nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "",
      funFact: factInput ? factInput.value.trim() : "",
      nameInput,
      errorNode: card.querySelector("[data-guest-name-error]"),
      isPrimary,
    };
  });
}

function validateGuestCards() {
  const guests = collectGuests();
  const fullName = (fullNameInput && fullNameInput.value.trim()) || "";
  let valid = true;
  guests.forEach((guest) => {
    const hasName = guest.isPrimary ? Boolean(fullName) : Boolean(guest.name);
    if (guest.errorNode) guest.errorNode.classList.toggle("hidden", hasName);
    if (guest.nameInput instanceof HTMLInputElement) {
      guest.nameInput.setCustomValidity(hasName ? "" : "Please enter a name.");
    }
    if (!hasName) valid = false;
  });
  return valid;
}

function getPlusOneCount() {
  if (!guestCardsWrap) return 0;
  return guestCardsWrap.querySelectorAll(".guest-card").length;
}

function updateAddGuestButtonState() {
  if (!addGuestButton) return;
  const plusOneCount = getPlusOneCount();
  const atLimit = plusOneCount >= MAX_PLUS_ONES;
  addGuestButton.disabled = atLimit;
  addGuestButton.setAttribute("aria-disabled", String(atLimit));
}

function getUploadFileExtension(fileName) {
  const value = String(fileName || "");
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return value.slice(dotIndex + 1).toLowerCase();
}

function isUploadFileTypeAllowed(file) {
  const extension = getUploadFileExtension(file && file.name ? file.name : "");
  const mime = String(file && file.type ? file.type : "").toLowerCase();
  const hasAllowedExtension = extension ? UPLOAD_ALLOWED_EXTENSIONS.has(extension) : false;
  const hasAllowedMime = mime ? UPLOAD_ALLOWED_MIME_TYPES.has(mime) : false;
  return hasAllowedExtension || hasAllowedMime;
}

function validateUploadFile(file) {
  if (!file) return "";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `${file.name} is larger than 10MB.`;
  }
  if (!isUploadFileTypeAllowed(file)) {
    return `${file.name} must be JPG, PNG, HEIC, MP4, MOV, or WEBM.`;
  }
  return "";
}

function getUploadSlotRef(index) {
  return photoUploadSlotRefs[index] || null;
}

function clearUploadSlotError(index) {
  const ref = getUploadSlotRef(index);
  if (!ref || !ref.errorNode) return;
  ref.errorNode.textContent = "";
  setHiddenClass(ref.errorNode, true);
}

function setUploadSlotError(index, message) {
  const ref = getUploadSlotRef(index);
  if (!ref || !ref.errorNode) return;
  ref.errorNode.textContent = message;
  setHiddenClass(ref.errorNode, false);
}

function clearUploadSlotPreview(index) {
  const ref = getUploadSlotRef(index);
  if (!ref) return;

  const previewUrl = selectedUploadPreviewUrls[index];
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    selectedUploadPreviewUrls[index] = "";
  }

  if (ref.preview) {
    ref.preview.src = "";
    setHiddenClass(ref.preview, true);
  }

  if (ref.previewWrap) {
    setHiddenClass(ref.previewWrap, true);
  }

  if (ref.previewText) {
    ref.previewText.textContent = "";
    setHiddenClass(ref.previewText, true);
  }
}

function updateUploadSlotUi(index) {
  const ref = getUploadSlotRef(index);
  if (!ref) return;

  const file = selectedUploadFiles[index];
  const hasFile = Boolean(file);
  ref.slotNode.classList.toggle("has-file", hasFile);

  if (ref.meta) {
    ref.meta.textContent = hasFile ? file.name : UPLOAD_SLOT_DEFAULT_META;
  }

  if (ref.actions) {
    ref.actions.classList.toggle("hidden", !hasFile);
  }

  clearUploadSlotPreview(index);

  if (!hasFile || !ref.preview || !ref.previewWrap) return;

  const extension = getUploadFileExtension(file.name);
  const isImagePreview = file.type.startsWith("image/") && extension !== "heic" && extension !== "heif";
  if (isImagePreview) {
    const previewUrl = URL.createObjectURL(file);
    selectedUploadPreviewUrls[index] = previewUrl;
    ref.preview.src = previewUrl;
    setHiddenClass(ref.preview, false);
    setHiddenClass(ref.previewWrap, false);
    return;
  }

  const isVideo = file.type.startsWith("video/") || ["mp4", "mov", "webm"].includes(extension);
  if (isVideo && ref.previewText && ref.previewWrap) {
    ref.previewText.textContent = `Video selected: ${file.name}`;
    setHiddenClass(ref.previewText, false);
    setHiddenClass(ref.previewWrap, false);
  }
}

function setUploadSlotFile(index, file) {
  const ref = getUploadSlotRef(index);
  if (!ref || !ref.input) return false;

  clearUploadSlotError(index);

  if (!file) {
    selectedUploadFiles[index] = null;
    updateUploadSlotUi(index);
    return true;
  }

  const errorMessage = validateUploadFile(file);
  if (errorMessage) {
    selectedUploadFiles[index] = null;
    ref.input.value = "";
    setUploadSlotError(index, errorMessage);
    updateUploadSlotUi(index);
    return false;
  }

  selectedUploadFiles[index] = file;
  updateUploadSlotUi(index);
  return true;
}

function clearUploadSlots() {
  selectedUploadFiles = Array.from({ length: MAX_UPLOAD_FILES }, () => null);
  selectedUploadPreviewUrls.forEach((previewUrl) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
  selectedUploadPreviewUrls = Array.from({ length: MAX_UPLOAD_FILES }, () => "");

  photoUploadSlotRefs.forEach((ref, index) => {
    if (ref && ref.input) ref.input.value = "";
    clearUploadSlotError(index);
    updateUploadSlotUi(index);
  });
}

function validateUploadSlots() {
  let valid = true;
  photoUploadSlotRefs.forEach((ref, index) => {
    if (!ref) return;
    const file = selectedUploadFiles[index];
    clearUploadSlotError(index);
    if (!file) return;
    const errorMessage = validateUploadFile(file);
    if (!errorMessage) return;
    valid = false;
    setUploadSlotError(index, errorMessage);
  });
  return valid;
}

function initUploadSlots() {
  if (!photoUploadSlotRefs.length) return;

  photoUploadSlotRefs.forEach((ref, index) => {
    if (!ref || !ref.slotNode || ref.slotNode.dataset.bound === "true") return;
    const { input, trigger, replaceButton, removeButton } = ref;
    if (!input || !trigger) return;

    trigger.addEventListener("click", () => {
      input.click();
    });

    input.addEventListener("change", () => {
      const nextFile = input.files && input.files[0] ? input.files[0] : null;
      setUploadSlotFile(index, nextFile);
    });

    if (replaceButton) {
      replaceButton.addEventListener("click", () => {
        input.click();
      });
    }

    if (removeButton) {
      removeButton.addEventListener("click", () => {
        input.value = "";
        setUploadSlotFile(index, null);
      });
    }

    ref.slotNode.dataset.bound = "true";
  });

  photoUploadSlotRefs.forEach((_ref, index) => {
    updateUploadSlotUi(index);
  });
}

function clearRsvpChoice() {
  if (!attendanceChoice || !rsvpFields || !submitButton || !yesFields || !workingFields || !noFields || !youFunFactsFields) return;

  if (rsvpForm) rsvpForm.reset();

  attendanceChoice.value = "";
  rsvpFields.classList.add("hidden");

  choiceCards.forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });

  yesFields.classList.add("hidden");
  youFunFactsFields.classList.add("hidden");
  workingFields.classList.add("hidden");
  noFields.classList.add("hidden");

  if (guestCardsWrap) {
    guestCardsWrap.innerHTML = "";
  }
  if (youGuestCardWrap) {
    youGuestCardWrap.innerHTML = "";
  }

  if (workingCount) {
    workingCount.required = false;
    workingCount.setCustomValidity("");
  }

  if (workingConfirm) {
    workingConfirm.required = false;
    workingConfirm.setCustomValidity("");
  }

  clearUploadSlots();
  hideGuestLimitError();
  updateAddGuestButtonState();

  submitButton.textContent = "Send reply";

  if (fullNameInput && inviteState.greetingName) {
    fullNameInput.value = inviteState.greetingName;
  }

  if (rsvpConfirmation) {
    rsvpConfirmation.classList.add("hidden");
    rsvpConfirmation.textContent = "";
  }
}

function setChoice(choice) {
  if (!attendanceChoice || !rsvpFields || !submitButton || !yesFields || !workingFields || !noFields || !youFunFactsFields) return;
  if (!choice) {
    clearRsvpChoice();
    return;
  }

  if (attendanceChoice.value === choice) {
    clearRsvpChoice();
    return;
  }

  attendanceChoice.value = choice;
  rsvpFields.classList.remove("hidden");

  choiceCards.forEach((card) => {
    const isActive = card.dataset.choice === choice;
    card.classList.toggle("selected", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });

  yesFields.classList.toggle("hidden", choice !== "yes");
  youFunFactsFields.classList.toggle("hidden", choice !== "yes");
  workingFields.classList.toggle("hidden", choice !== "working");
  noFields.classList.toggle("hidden", choice !== "no");
  if (youGuestCardWrap) {
    youGuestCardWrap.querySelectorAll("input[data-guest-name]").forEach((input) => {
      input.required = false;
      if (choice !== "yes") input.setCustomValidity("");
    });
  }
  if (guestCardsWrap) {
    guestCardsWrap.querySelectorAll("input[data-guest-name]").forEach((input) => {
      input.required = choice === "yes";
      if (choice !== "yes") input.setCustomValidity("");
    });
  }

  if (workingCount) workingCount.required = choice === "working";
  if (workingConfirm) workingConfirm.required = choice === "working";

  if (choice === "yes") {
    ensurePrimaryGuestCard();
    syncPrimaryGuestName(true);
    updateAddGuestButtonState();
    submitButton.textContent = "Confirm attendance";
  }

  if (choice === "working") {
    updateAddGuestButtonState();
    submitButton.textContent = "Add me to the list";
    hideGuestLimitError();
  }

  if (choice === "no") {
    updateAddGuestButtonState();
    submitButton.textContent = "Send reply";
    hideGuestLimitError();
  }
}

function initRsvpCards() {
  if (!choiceCards.length) return;

  choiceCards.forEach((card) => {
    card.setAttribute("aria-pressed", "false");
    card.addEventListener("click", () => setChoice(card.dataset.choice));
    card.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setChoice(card.dataset.choice);
      }
    });
  });

  if (addGuestButton) {
    addGuestButton.addEventListener("click", () => {
      if (!guestCardsWrap) return;
      const cards = Array.from(guestCardsWrap.querySelectorAll(".guest-card"));
      if (cards.length >= MAX_PLUS_ONES) {
        showGuestLimitError("Max 3 +1 guests.");
        updateAddGuestButtonState();
        return;
      }
      guestCardsWrap.appendChild(buildGuestCard(cards.length + 1));
      resequenceGuestCards();
      hideGuestLimitError();
      updateAddGuestButtonState();
    });
  }

  updateAddGuestButtonState();

  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => {
      syncPrimaryGuestName();
    });
  }

  initUploadSlots();
}

function buildPayload() {
  const choice = attendanceChoice ? attendanceChoice.value : "";
  const status = choice === "yes" ? "yes" : choice === "working" ? "maybe" : "no";
  const fullName = (fullNameInput && fullNameInput.value.trim()) || inviteState.greetingName;

  const guests = choice === "yes" ? collectGuests().map((guest) => ({ name: guest.name, funFact: guest.funFact })) : [];
  const yesPartySize = choice === "yes" ? guests.length : 0;
  const potentialPartySize = choice === "working" ? Number((workingCount && workingCount.value) || 0) : 0;

  return {
    token: inviteState.token,
    status,
    fullName,
    guestName: fullName,
    email: emailInput ? emailInput.value.trim() : "",
    phone: phoneInput ? phoneInput.value.trim() : "",
    message: messageInput ? messageInput.value.trim() : "",
    partySize: status === "yes" ? yesPartySize : potentialPartySize,
    potentialPartySize,
    guests,
    dietary: status === "yes" && dietary ? dietary.value.trim() : "",
    whenWillYouKnow: status === "maybe" && workingConfirm ? workingConfirm.value : "",
    followupChoice: status === "maybe" && workingConfirm ? workingConfirm.value : "",
    photoFiles: selectedUploadFiles
      .map((file, index) => {
        if (!file) return null;
        return {
          slot: index + 1,
          name: file.name,
          size: file.size,
          type: file.type || "",
        };
      })
      .filter(Boolean),
    userAgent: navigator.userAgent || "",
  };
}

function buildRsvpFormData(payload) {
  const formData = new FormData();
  formData.append("token", payload.token || "");
  formData.append("status", payload.status || "");
  formData.append("fullName", payload.fullName || "");
  formData.append("guestName", payload.guestName || "");
  formData.append("email", payload.email || "");
  formData.append("phone", payload.phone || "");
  formData.append("message", payload.message || "");
  formData.append("partySize", String(payload.partySize || 0));
  formData.append("potentialPartySize", String(payload.potentialPartySize || 0));
  formData.append("guests_json", JSON.stringify(Array.isArray(payload.guests) ? payload.guests : []));
  formData.append("dietary", payload.dietary || "");
  formData.append("whenWillYouKnow", payload.whenWillYouKnow || "");
  formData.append("followupChoice", payload.followupChoice || "");
  formData.append("userAgent", payload.userAgent || "");

  selectedUploadFiles.forEach((file, index) => {
    if (!file) return;
    formData.append(`photo${index + 1}`, file, file.name);
  });

  return formData;
}

async function submitToRsvpApi(payload) {
  const response = await fetch(withBasePath("/api/rsvp"), {
    method: "POST",
    body: buildRsvpFormData(payload),
  });
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (_error) {
    data = null;
  }

  if (!data || typeof data !== "object") {
    return {
      ok: false,
      error: response.ok ? "Unexpected RSVP response from server." : "RSVP request failed.",
    };
  }

  if (!response.ok && data.ok !== true) {
    return {
      ok: false,
      error: data.error || "RSVP request failed.",
    };
  }

  return data;
}

async function submitRSVP(payload) {
  try {
    const data = await submitToRsvpApi(payload);
    if (!data || data.ok !== true) throw new Error(data && data.error ? String(data.error) : "Sheets submit failed");
    return data;
  } catch (error) {
    // Keep a local backup copy, but report failure to the UI.
    try {
      const existing = JSON.parse(localStorage.getItem(RSVP_LOCAL_FALLBACK_KEY) || "[]");
      existing.push(payload);
      localStorage.setItem(RSVP_LOCAL_FALLBACK_KEY, JSON.stringify(existing));
    } catch (_storageError) {
      // no-op
    }
    return { ok: false, error: error instanceof Error ? error.message : "Submission failed" };
  }
}

function confirmationMessage(choice) {
  if (choice === "yes") {
    return "Amazing. We’re so excited. We’ll email you a quick reconfirmation in about a month to lock the final list.";
  }
  if (choice === "working") {
    return "Perfect — thank you for telling us early. We won’t hold seats yet. We’ll follow up around the time you picked.";
  }
  return "Thank you. We’ll miss you in Beijing. We’ll share photos after the wedding.";
}

function initRsvpForm() {
  if (!rsvpForm || !attendanceChoice || !rsvpConfirmation) return;

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!attendanceChoice.value) {
      rsvpConfirmation.textContent = "Please select one RSVP option first.";
      rsvpConfirmation.classList.remove("hidden");
      return;
    }

    if (!rsvpForm.reportValidity()) return;

    if (attendanceChoice.value === "yes") {
      ensurePrimaryGuestCard();
      if (!validateGuestCards()) {
        rsvpConfirmation.textContent = "Please enter all guest names.";
        rsvpConfirmation.classList.remove("hidden");
        return;
      }
    }

    if (!validateUploadSlots()) {
      rsvpConfirmation.textContent = "Please fix the photo upload errors before submitting.";
      rsvpConfirmation.classList.remove("hidden");
      return;
    }

    const payload = buildPayload();
    const result = await submitRSVP(payload);
    if (!result || result.ok !== true) {
      rsvpConfirmation.textContent = result && result.error ? result.error : "We couldn’t submit your RSVP right now. Please try again in a moment.";
      rsvpConfirmation.classList.remove("hidden");
      return;
    }

    rsvpForm.classList.add("hidden");
    const baseMessage = confirmationMessage(attendanceChoice.value);
    rsvpConfirmation.textContent = result.warning ? `${baseMessage} ${result.warning}` : baseMessage;
    rsvpConfirmation.classList.remove("hidden");
  });
}

async function loadManifest() {
  try {
    const response = await fetch(withBasePath("/photos/manifest.json"), { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function toPhotoSrc(name) {
  if (!name) return "";
  if (/^https?:\/\//i.test(name)) return name;
  if (name.startsWith("/")) return withBasePath(name);
  return withBasePath(`/photos/${name.replace(/^\.\//, "")}`);
}

function applyPhotoSettings(config, img) {
  if (!img || !config) return;

  const src = toPhotoSrc(config.file || config.src || "");
  if (src) img.src = src;
  if (config.alt) img.alt = config.alt;

  const objectPosition = config.objectPosition || "50% 50%";
  img.style.objectFit = "cover";
  img.style.objectPosition = objectPosition;

  const frame = img.closest("figure") || img;
  const isCutoutFrame = frame instanceof HTMLElement && frame.classList.contains("cutout-parallax");
  if (!isCutoutFrame && (config.cropClass === "img-arch" || config.cropClass === "img-round" || config.cropClass === "img-moon")) {
    frame.classList.remove("img-arch", "img-round", "img-moon");
    frame.classList.add(config.cropClass);
  }
}

function applyStaticPhotoManifest() {
  if (!photoManifest || !photoManifest.images) return;

  const map = photoManifest.images;
  document.querySelectorAll("img[data-photo-key]").forEach((img) => {
    const key = img.getAttribute("data-photo-key");
    const config = map[key];
    applyPhotoSettings(config, img);
  });
}

function initFaqWearImageDebug() {
  const img = document.getElementById("faqWearImg");
  if (!img) return;

  const preferredSrc = String(img.getAttribute("data-src") || img.getAttribute("src") || "").trim();
  if (preferredSrc) {
    if (/^https?:\/\//i.test(preferredSrc)) {
      img.src = preferredSrc;
    } else if (preferredSrc.startsWith("/")) {
      img.src = withBasePath(preferredSrc);
    } else {
      img.src = withBasePath(`/${preferredSrc.replace(/^\.?\//, "")}`);
    }
  }

  let attemptedEncodedFallback = false;
  img.addEventListener("error", () => {
    console.error("FAQ wear image failed to load:", img.currentSrc || img.src);

    if (!attemptedEncodedFallback) {
      attemptedEncodedFallback = true;
      img.src = withBasePath("/photos/faq-photo/new%20what%20to%20wear.png");
      return;
    }

    const wrap = img.closest(".faq-wear-media");
    if (wrap) {
      wrap.innerHTML = '<div class="faq-wear-missing">Image not found. Check /photos/faq-photo/new what to wear.png</div>';
    }
  });
}

function initFaqAccordionGroups() {
  const faqSection = document.getElementById("faq");
  if (!faqSection || faqSection.dataset.accordionBound === "true") return;

  const groupNodes = Array.from(faqSection.querySelectorAll(".faq-group-disclosure"));
  if (!groupNodes.length) return;

  const detailsNodes = Array.from(faqSection.querySelectorAll(".faq-list details"));

  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

  const collapseAllGroups = () => {
    groupNodes.forEach((node) => {
      node.open = false;
    });
  };

  groupNodes.forEach((group) => {
    group.addEventListener("toggle", () => {
      if (!group.open) return;
      groupNodes.forEach((other) => {
        if (other !== group) other.open = false;
      });
    });
  });

  const normalizeOpenState = () => {
    if (!isMobile()) return;
    groupNodes.forEach((group) => {
      const openNodes = Array.from(group.querySelectorAll(".faq-list details")).filter((node) => node.open);
      openNodes.slice(1).forEach((node) => {
        node.open = false;
      });
    });
  };

  detailsNodes.forEach((node) => {
    node.addEventListener("toggle", () => {
      if (!node.open) return;
      const parentGroup = node.closest(".faq-group-disclosure");
      if (!parentGroup) return;
      const siblings = Array.from(parentGroup.querySelectorAll(".faq-list details"));
      siblings.forEach((other) => {
        if (other !== node) other.open = false;
      });
    });
  });

  collapseAllGroups();
  normalizeOpenState();
  window.addEventListener("resize", normalizeOpenState);
  faqSection.dataset.accordionBound = "true";
}

function parseFocalFromObjectPosition(positionValue, fallbackX = RECENT_DEFAULT_FOCAL_X, fallbackY = RECENT_DEFAULT_FOCAL_Y) {
  const match = String(positionValue || "").trim().match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!match) return null;
  return {
    x: clamp01(Number(match[1]) / 100, fallbackX),
    y: clamp01(Number(match[2]) / 100, fallbackY),
  };
}

function toGalleryObjectPosition(focalX = RECENT_DEFAULT_FOCAL_X, focalY = RECENT_DEFAULT_FOCAL_Y) {
  return `${(clamp01(focalX, RECENT_DEFAULT_FOCAL_X) * 100).toFixed(2)}% ${(clamp01(focalY, RECENT_DEFAULT_FOCAL_Y) * 100).toFixed(2)}%`;
}

function normalizeGalleryEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: entry.trim(),
      file: entry.trim(),
      alt: "",
      cropClass: "img-round",
      focalX: RECENT_DEFAULT_FOCAL_X,
      focalY: RECENT_DEFAULT_FOCAL_Y,
      objectPosition: toGalleryObjectPosition(RECENT_DEFAULT_FOCAL_X, RECENT_DEFAULT_FOCAL_Y),
    };
  }

  if (!entry || typeof entry !== "object") {
    return {
      id: "",
      file: "",
      alt: "",
      cropClass: "img-round",
      focalX: RECENT_DEFAULT_FOCAL_X,
      focalY: RECENT_DEFAULT_FOCAL_Y,
      objectPosition: toGalleryObjectPosition(RECENT_DEFAULT_FOCAL_X, RECENT_DEFAULT_FOCAL_Y),
    };
  }

  const parsedPosition = parseFocalFromObjectPosition(entry.objectPosition, RECENT_DEFAULT_FOCAL_X, RECENT_DEFAULT_FOCAL_Y);
  const focalX = Number.isFinite(Number(entry.focalX))
    ? clamp01(Number(entry.focalX), RECENT_DEFAULT_FOCAL_X)
    : parsedPosition?.x ?? RECENT_DEFAULT_FOCAL_X;
  const focalY = Number.isFinite(Number(entry.focalY))
    ? clamp01(Number(entry.focalY), RECENT_DEFAULT_FOCAL_Y)
    : parsedPosition?.y ?? RECENT_DEFAULT_FOCAL_Y;

  return {
    id: String(entry.id || entry.file || entry.src || "").trim(),
    file: String(entry.file || entry.src || "").trim(),
    alt: String(entry.alt || "").trim(),
    cropClass: String(entry.cropClass || "img-round").trim(),
    focalX,
    focalY,
    objectPosition: toGalleryObjectPosition(focalX, focalY),
  };
}

function isExcludedGalleryFile(filePath) {
  const lower = String(filePath || "").toLowerCase();
  return (
    lower.includes("location-main") ||
    lower.includes("/hotels/") ||
    lower.includes("/things/") ||
    lower.includes("timeline-photos") ||
    lower.includes("timeline/") ||
    lower.includes("hotel") ||
    lower.includes("venue") ||
    lower.includes("mandarin-oriental")
  );
}

function getConfiguredGalleryEntries(manifest) {
  const galleryRaw = manifest && Array.isArray(manifest.gallery) ? manifest.gallery : [];
  const normalized = galleryRaw.map((entry) => normalizeGalleryEntry(entry)).filter((entry) => entry.file);
  const deduped = [];
  const seen = new Set();

  normalized.forEach((entry) => {
    const key = String(entry.file || "").toLowerCase();
    if (!key || seen.has(key)) return;
    if (isExcludedGalleryFile(entry.file)) return;
    seen.add(key);
    deduped.push(entry);
  });

  const lmnFirst = deduped.filter((entry) => /(^|\/)lmn_/i.test(entry.file));
  const nonLmn = deduped.filter((entry) => !/(^|\/)lmn_/i.test(entry.file));
  return [...lmnFirst, ...nonLmn].slice(0, 9);
}

function isGalleryLightboxOpen() {
  if (!galleryLightbox) return false;
  return !galleryLightbox.classList.contains("hidden") && galleryLightbox.getAttribute("aria-hidden") !== "true";
}

function removeLegacyGalleryLightbox() {
  document.querySelectorAll("#galleryLightbox, .gallery-lightbox").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.id === "lightbox" || node.classList.contains("lightbox")) return;
    node.remove();
  });
}

function updateGalleryLightboxView() {
  if (!galleryLightboxImage || !galleryImages.length) return;
  const entry = galleryImages[currentGalleryIndex];
  if (!entry) return;

  galleryLightboxImage.src = toPhotoSrc(entry.file);
  galleryLightboxImage.alt = entry.alt || "";
  if (galleryLightboxCounter) galleryLightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryImages.length}`;
}

function openGalleryLightbox(index) {
  if (!galleryLightbox || !galleryLightboxImage || !galleryImages.length) return;
  closeStoryLightbox();

  const nextIndex = Number(index);
  currentGalleryIndex = Number.isFinite(nextIndex) ? ((nextIndex % galleryImages.length) + galleryImages.length) % galleryImages.length : 0;
  updateGalleryLightboxView();

  galleryLightbox.classList.remove("hidden");
  galleryLightbox.classList.add("open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function openLightbox(index) {
  openGalleryLightbox(index);
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage) return;
  galleryLightbox.classList.add("hidden");
  galleryLightbox.classList.remove("open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  galleryLightboxImage.removeAttribute("src");
  document.body.classList.remove("modal-open");
}

function showPrevLightboxImage() {
  if (!galleryImages.length) return;
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
  updateGalleryLightboxView();
}

function showNextLightboxImage() {
  if (!galleryImages.length) return;
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
  updateGalleryLightboxView();
}

function bindGalleryLightboxEvents() {
  if (!galleryLightbox || galleryLightbox.dataset.bound === "true") return;

  galleryLightboxCloseButtons.forEach((button) => {
    button.addEventListener("click", closeGalleryLightbox);
  });

  if (galleryLightboxPrev) {
    galleryLightboxPrev.addEventListener("click", (event) => {
      event.stopPropagation();
      showPrevLightboxImage();
    });
  }

  if (galleryLightboxNext) {
    galleryLightboxNext.addEventListener("click", (event) => {
      event.stopPropagation();
      showNextLightboxImage();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!isGalleryLightboxOpen()) return;
    if (event.key === "Escape") {
      closeGalleryLightbox();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevLightboxImage();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextLightboxImage();
    }
  });

  const swipeTarget = galleryLightboxFrame || galleryLightbox;
  if (swipeTarget) {
    swipeTarget.addEventListener(
      "touchstart",
      (event) => {
        galleryTouchStartX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
      },
      { passive: true },
    );

    swipeTarget.addEventListener(
      "touchend",
      (event) => {
        const endX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
        if (galleryTouchStartX === null || endX === null) return;
        const deltaX = endX - galleryTouchStartX;
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) showPrevLightboxImage();
          else showNextLightboxImage();
        }
        galleryTouchStartX = null;
      },
      { passive: true },
    );
  }

  galleryLightbox.dataset.bound = "true";
}

function bindGalleryFocalTuner(card, img, entry, index, initialFocalX, initialFocalY) {
  if (!ENABLE_FOCAL_TUNER) return;
  card.classList.add("gallery-tile--tuning");
  const marker = document.createElement("span");
  marker.className = "gallery-focal-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.style.left = `${(initialFocalX * 100).toFixed(2)}%`;
  marker.style.top = `${(initialFocalY * 100).toFixed(2)}%`;
  card.appendChild(marker);

  card.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = card.getBoundingClientRect();
    const tunedFocalX = clamp01((event.clientX - rect.left) / Math.max(rect.width, 1), RECENT_DEFAULT_FOCAL_X);
    const tunedFocalY = clamp01((event.clientY - rect.top) / Math.max(rect.height, 1), RECENT_DEFAULT_FOCAL_Y);
    const tunedPosition = toGalleryObjectPosition(tunedFocalX, tunedFocalY);
    img.style.objectPosition = tunedPosition;
    card.style.setProperty("--objPos", tunedPosition);
    marker.style.left = `${(tunedFocalX * 100).toFixed(2)}%`;
    marker.style.top = `${(tunedFocalY * 100).toFixed(2)}%`;
    console.log(`RECENT tile ${entry.id || entry.file || `slot-${index + 1}`} focalX=${tunedFocalX.toFixed(2)} focalY=${tunedFocalY.toFixed(2)}`);
  });
}

function buildGalleryCard(entry, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "gallery-tile";
  card.dataset.galleryId = entry.id || `slot-${index + 1}`;
  card.classList.add(`gallery-tile--slot-${index + 1}`);
  if (index === 0) card.classList.add("gallery-tile--hero");
  if (index === 1) card.classList.add("gallery-tile--medium-top");
  if (index === 2) card.classList.add("gallery-tile--medium-bottom");
  if (index === 6) card.classList.add("gallery-tile--wide");
  card.setAttribute("aria-label", `Open photo ${index + 1} of ${galleryImages.length || 9}`);

  const img = document.createElement("img");
  img.src = toPhotoSrc(entry.file);
  img.alt = entry.alt || "Miki and Yi Jie";
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectFit = "cover";
  const focalX = clamp01(entry.focalX, RECENT_DEFAULT_FOCAL_X);
  const focalY = clamp01(entry.focalY, RECENT_DEFAULT_FOCAL_Y);
  const objectPosition = toGalleryObjectPosition(focalX, focalY);
  img.style.objectPosition = objectPosition;
  card.style.setProperty("--objPos", objectPosition);
  card.appendChild(img);

  if (ENABLE_FOCAL_TUNER) {
    bindGalleryFocalTuner(card, img, entry, index, focalX, focalY);
  } else {
    card.addEventListener("click", () => openLightbox(index));
  }

  return card;
}

async function initGallery() {
  if (!galleryGrid) return;
  bindGalleryLightboxEvents();

  galleryGrid.innerHTML = "";
  const selected = getConfiguredGalleryEntries(photoManifest || {}).slice(0, 9);

  galleryImages = selected;
  window.__galleryItems = selected.map((item) => ({
    id: item.id || item.file,
    src: toPhotoSrc(item.file),
    alt: item.alt || "Miki and Yi Jie",
    objPos: item.objectPosition || toGalleryObjectPosition(RECENT_DEFAULT_FOCAL_X, RECENT_DEFAULT_FOCAL_Y),
    focalX: clamp01(item.focalX, RECENT_DEFAULT_FOCAL_X),
    focalY: clamp01(item.focalY, RECENT_DEFAULT_FOCAL_Y),
  }));

  if (!galleryImages.length) {
    const empty = document.createElement("p");
    empty.className = "gallery-empty";
    empty.textContent = "Photos coming soon.";
    galleryGrid.appendChild(empty);
    return;
  }

  galleryImages.forEach((entry, index) => {
    const card = buildGalleryCard(entry, index);
    galleryGrid.appendChild(card);
  });
}

function extractStoryYear(value) {
  const basename = String(value || "").split("/").pop() || "";
  const match = basename.match(/(?:^|[^0-9])((?:19|20)\d{2})(?!\d)/);
  return match ? Number(match[1]) : NaN;
}

function clamp01(value, fallback = 0.5) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (numeric < 0) return 0;
  if (numeric > 1) return 1;
  return numeric;
}

function normalizeCropMode(modeValue) {
  const mode = String(modeValue || "").toLowerCase();
  if (mode === "contain") return "contain";
  if (mode === "cover") return "cover";
  return "";
}

function parseStoryObjectPosition(positionValue) {
  const match = String(positionValue || "").trim().match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!match) return null;
  return {
    x: clamp01(Number(match[1]) / 100, STORY_DEFAULT_FOCAL_X),
    y: clamp01(Number(match[2]) / 100, STORY_DEFAULT_FOCAL_Y),
  };
}

function toObjectPosition(focalX = STORY_DEFAULT_FOCAL_X, focalY = STORY_DEFAULT_FOCAL_Y) {
  return `${(clamp01(focalX, STORY_DEFAULT_FOCAL_X) * 100).toFixed(2)}% ${(clamp01(focalY, STORY_DEFAULT_FOCAL_Y) * 100).toFixed(2)}%`;
}

function normalizeStoryEntry(entry) {
  if (typeof entry === "string") {
    return {
      file: entry.trim(),
      mosaicFile: "",
      objectPosition: "",
      alt: "",
      year: NaN,
      focalX: NaN,
      focalY: NaN,
      cropMode: "",
      allowNoFace: false,
    };
  }

  if (!entry || typeof entry !== "object") {
    return {
      file: "",
      mosaicFile: "",
      objectPosition: "",
      alt: "",
      year: NaN,
      focalX: NaN,
      focalY: NaN,
      cropMode: "",
      allowNoFace: false,
    };
  }

  return {
    file: String(entry.file || "").trim(),
    mosaicFile: String(entry.mosaicFile || "").trim(),
    objectPosition: String(entry.objectPosition || "").trim(),
    fit: String(entry.fit || "").trim(),
    cropMode: normalizeCropMode(entry.cropMode || entry.fit),
    rotation: Number.isFinite(Number(entry.rotation)) ? Number(entry.rotation) : 0,
    year: Number.isFinite(Number(entry.year)) ? Number(entry.year) : NaN,
    focalX: Number.isFinite(Number(entry.focalX)) ? clamp01(Number(entry.focalX)) : NaN,
    focalY: Number.isFinite(Number(entry.focalY)) ? clamp01(Number(entry.focalY), STORY_DEFAULT_FOCAL_Y) : NaN,
    allowNoFace: Boolean(entry.allowNoFace),
    alt: String(entry.alt || "").trim(),
  };
}

function sortStoryEntries(entries) {
  const normalized = (entries || []).map(normalizeStoryEntry).filter((entry) => entry.file);
  const byFile = new Map();

  normalized.forEach((entry) => {
    byFile.set(entry.file, entry);
  });

  return Array.from(byFile.values())
    .map((entry) => ({
      file: entry.file,
      objectPosition: entry.objectPosition,
      mosaicFile: entry.mosaicFile,
      fit: entry.fit,
      cropMode: entry.cropMode,
      rotation: entry.rotation,
      alt: entry.alt,
      focalX: entry.focalX,
      focalY: entry.focalY,
      allowNoFace: entry.allowNoFace,
      year: Number.isFinite(entry.year) ? entry.year : extractStoryYear(entry.file),
    }))
    .filter((entry) => {
      if (Number.isFinite(entry.year)) return true;
      if (IS_LOCAL_DEV) {
        console.warn(`[story] missing year/date for timeline item: ${entry.file}`);
      }
      return false;
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" });
    });
}

async function loadStoryEntriesFromManifest() {
  try {
    const response = await fetch(withBasePath("/photos/timeline-photos/manifest.json"), { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();

    const rows = Array.isArray(payload)
      ? payload
      : payload && Array.isArray(payload.timeline)
        ? payload.timeline
        : payload && Array.isArray(payload.files)
          ? payload.files
          : [];

    return rows
      .map((entry) => normalizeStoryEntry(entry))
      .filter((entry) => entry.file)
      .map((entry) => ({
        ...entry,
        file: entry.file.startsWith("/")
          ? withBasePath(entry.file)
          : withBasePath(`/photos/timeline-photos/${encodeURIComponent(entry.file)}`),
        mosaicFile: entry.mosaicFile
          ? entry.mosaicFile.startsWith("/")
            ? withBasePath(entry.mosaicFile)
            : withBasePath(`/public/images/story-crops/${entry.mosaicFile}`)
          : withBasePath(`/public/images/story-crops/${Number.isFinite(entry.year) ? entry.year : extractStoryYear(entry.file)}.jpg`),
      }));
  } catch (_error) {
    return [];
  }
}

function storyCopyForYear(year) {
  const copy = STORY_COPY[year];
  if (copy) return copy;
  return {
    title: `${year}`,
    blurb: `A moment from ${year}.`,
    longCaption: `A moment from ${year}.`,
  };
}

function storyYearLabel(year) {
  return Number(year) === 2027 ? "Future..." : String(year);
}

function withStoryVersion(srcValue) {
  const src = String(srcValue || "").trim();
  if (!src) return "";
  return `${src}${src.includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
}

function storyImageSources(item, preferMosaic = false) {
  const originalBase = toPhotoSrc(item?.file || "");
  const mosaicBase = toPhotoSrc(item?.mosaicFile || "");
  const preferredBase = preferMosaic && mosaicBase ? mosaicBase : originalBase;
  const fallbackBase = preferredBase === originalBase ? "" : originalBase;

  return {
    preferred: withStoryVersion(preferredBase),
    fallback: withStoryVersion(fallbackBase),
    original: withStoryVersion(originalBase),
  };
}

function attachStoryFallback(img, fallbackSrc) {
  if (!(img instanceof HTMLImageElement)) return;
  const fallback = String(fallbackSrc || "").trim();
  img.dataset.fallbackSrc = fallback;
  img.dataset.fallbackUsed = "false";
  img.onerror = () => {
    const nextSrc = String(img.dataset.fallbackSrc || "").trim();
    if (!nextSrc || img.dataset.fallbackUsed === "true") return;
    img.dataset.fallbackUsed = "true";
    img.src = nextSrc;
  };
}

function buildStoryTimelineSlide(item, index) {
  const slide = document.createElement("article");
  slide.className = "story-slide";
  slide.dataset.index = String(index);

  const media = document.createElement("figure");
  media.className = "story-slide-media";

  const img = document.createElement("img");
  const imageSources = storyImageSources(item, false);
  img.src = imageSources.preferred;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.imageOrientation = "from-image";
  img.style.objectFit = item.cropMode === "contain" || item.fit === "contain" ? "contain" : "cover";

  if (item.rotation === 90) {
    img.style.setProperty("--storyRotate", "90deg");
    img.style.setProperty("--storyScale", "1.12");
  } else if (item.rotation === -90) {
    img.style.setProperty("--storyRotate", "-90deg");
    img.style.setProperty("--storyScale", "1.12");
  } else if (item.rotation === 180) {
    img.style.setProperty("--storyRotate", "180deg");
    img.style.setProperty("--storyScale", "1.03");
  } else {
    img.style.setProperty("--storyRotate", "0deg");
    img.style.setProperty("--storyScale", "1");
  }

  const year = document.createElement("span");
  year.className = "story-slide-year";
  year.textContent = item.yearLabel;

  const caption = document.createElement("div");
  caption.className = "story-slide-caption";

  const title = document.createElement("h3");
  title.textContent = item.title || item.yearLabel;

  const blurb = document.createElement("p");
  blurb.textContent = item.blurb || item.longCaption || "";

  media.appendChild(img);
  media.appendChild(year);
  caption.appendChild(title);
  caption.appendChild(blurb);
  slide.appendChild(media);
  slide.appendChild(caption);
  return slide;
}

function buildStoryTimelinePlaceholder() {
  const slide = document.createElement("article");
  slide.className = "story-slide";

  const media = document.createElement("figure");
  media.className = "story-slide-media";
  media.style.display = "grid";
  media.style.placeItems = "center";
  media.style.background = "rgba(75, 15, 23, 0.08)";

  const year = document.createElement("span");
  year.className = "story-slide-year";
  year.textContent = "Timeline";

  const caption = document.createElement("div");
  caption.className = "story-slide-caption";
  caption.innerHTML = "<h3>Photos coming soon</h3><p>We are still adding timeline moments.</p>";

  media.appendChild(year);
  slide.appendChild(media);
  slide.appendChild(caption);
  return slide;
}

function setActiveStoryScrubberIndex(index) {
  if (!storyYearButtons.length) return;
  const safeIndex = Math.max(0, Math.min(storyYearButtons.length - 1, Number(index) || 0));
  storyYearButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === safeIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function highlightStoryMosaicTile(target) {
  if (!(target instanceof HTMLElement)) return;
  target.classList.remove("is-jump-highlight");
  window.requestAnimationFrame(() => {
    target.classList.add("is-jump-highlight");
  });
  window.setTimeout(() => {
    target.classList.remove("is-jump-highlight");
  }, 820);
}

function highlightStoryMobileCard() {
  if (!storyMobileCard) return;
  storyMobileCard.classList.remove("is-jump-highlight");
  window.requestAnimationFrame(() => {
    storyMobileCard.classList.add("is-jump-highlight");
  });
  window.setTimeout(() => {
    storyMobileCard.classList.remove("is-jump-highlight");
  }, 780);
}

function isStoryMobileView() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function renderStoryYearScrubber(items, yearTargets = [], onSelect = null) {
  if (!storyYearScrubber) return;
  storyYearScrubber.innerHTML = "";
  storyYearButtons = [];

  if (!Array.isArray(items) || !items.length) {
    storyYearScrubber.classList.add("hidden");
    return;
  }

  const targetsByIndex = new Map();
  yearTargets.forEach((entry) => {
    if (!entry || !entry.element) return;
    targetsByIndex.set(entry.index, entry.element);
  });

  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "story-year-pill-btn";
    button.textContent = item.yearLabel;
    button.setAttribute("aria-label", `Jump to ${item.yearLabel}`);
    button.dataset.index = String(index);

    button.addEventListener("click", () => {
      if (typeof onSelect === "function") onSelect(index);

      if (isStoryMobileView()) {
        setActiveStoryScrubberIndex(index);
        highlightStoryMobileCard();
        return;
      }

      const target = targetsByIndex.get(index);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
        highlightStoryMosaicTile(target);
      }
      setActiveStoryScrubberIndex(index);
    });

    storyYearButtons.push(button);
    storyYearScrubber.appendChild(button);
  });

  setActiveStoryScrubberIndex(0);
  storyYearScrubber.classList.toggle("hidden", !isStoryMobileView());
}

function bindStoryYearObserver(yearTargets = []) {
  if (storyYearObserver) {
    storyYearObserver.disconnect();
    storyYearObserver = null;
  }
  if (!yearTargets.length) return;

  storyYearObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const idx = Number(visible[0].target.getAttribute("data-year-index"));
      if (!Number.isFinite(idx)) return;
      setActiveStoryScrubberIndex(idx);
    },
    {
      threshold: [0.45, 0.7],
      rootMargin: "-32% 0px -32% 0px",
    },
  );

  yearTargets.forEach((entry) => {
    if (!(entry.element instanceof Element)) return;
    storyYearObserver.observe(entry.element);
  });
}

function clearStoryChronologyPath() {
  if (storyChronologyPath) storyChronologyPath.innerHTML = "";
  if (storyChronologyStart) storyChronologyStart.style.display = "none";
  if (storyChronologyNow) storyChronologyNow.style.display = "none";
}

function drawStoryChronologyPath(yearTargets = []) {
  if (!storyMosaicShell || !storyChronologyPath || isStoryMobileView()) {
    clearStoryChronologyPath();
    return;
  }

  const shellRect = storyMosaicShell.getBoundingClientRect();
  const width = Math.max(1, shellRect.width);
  const height = Math.max(1, shellRect.height);

  const points = yearTargets
    .filter((entry) => entry && entry.element instanceof HTMLElement)
    .sort((a, b) => a.index - b.index)
    .map((entry) => {
      const tileRect = entry.element.getBoundingClientRect();
      const x = tileRect.left - shellRect.left + Math.min(tileRect.width * 0.24, 44);
      const y = tileRect.top - shellRect.top + Math.min(tileRect.height * 0.24, 40);
      return {
        index: entry.index,
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y)),
      };
    });

  if (points.length < 2) {
    clearStoryChronologyPath();
    return;
  }

  const pathD = points.map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const circles = points
    .map((point) => `<circle class="story-chronology-dot" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="2.7"></circle>`)
    .join("");

  storyChronologyPath.setAttribute("viewBox", `0 0 ${width.toFixed(2)} ${height.toFixed(2)}`);
  storyChronologyPath.innerHTML = `<path class="story-chronology-line" d="${pathD}"></path>${circles}`;

  const placeEdgeLabel = (node, point, offsetX = 8) => {
    if (!node || !point) return;
    const labelWidth = 58;
    const x = Math.max(8, Math.min(width - labelWidth, point.x + offsetX));
    const y = Math.max(6, Math.min(height - 24, point.y - 16));
    node.style.display = "inline-flex";
    node.style.left = `${x.toFixed(2)}px`;
    node.style.top = `${y.toFixed(2)}px`;
  };

  placeEdgeLabel(storyChronologyStart, points[0], 8);
  placeEdgeLabel(storyChronologyNow, points[points.length - 1], 10);
}

function queueStoryChronologyPathRender() {
  if (storyPathRaf) return;
  storyPathRaf = window.requestAnimationFrame(() => {
    storyPathRaf = null;
    drawStoryChronologyPath(storyPathTargets);
  });
}

function bindStoryChronologyResize() {
  if (storyPathResizeBound) return;
  window.addEventListener("resize", queueStoryChronologyPathRender, { passive: true });
  storyPathResizeBound = true;

  if (storyMosaicShell && "ResizeObserver" in window) {
    if (storyPathResizeObserver) {
      storyPathResizeObserver.disconnect();
    }
    storyPathResizeObserver = new ResizeObserver(() => {
      queueStoryChronologyPathRender();
    });
    storyPathResizeObserver.observe(storyMosaicShell);
  }
}

function setStoryMobileSlide(index, options = {}) {
  if (!storyItems.length || !storyMobileImg || !storyMobileYear) return;

  const { scrollPill = true } = options;
  const total = storyItems.length;
  const safeIndex = ((Number(index) || 0) % total + total) % total;
  const item = storyItems[safeIndex];
  storyMobileIndex = safeIndex;
  const imageSources = storyImageSources(item, true);
  const imageSrc = imageSources.preferred || imageSources.original;

  storyMobileImg.src = imageSrc;
  attachStoryFallback(storyMobileImg, imageSources.fallback);
  storyMobileImg.alt = item.alt || `Story photo ${item.yearLabel}`;
  storyMobileImg.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  storyMobileImg.style.imageOrientation = "from-image";
  storyMobileImg.style.objectFit = item.cropMode === "contain" ? "contain" : "cover";
  if (storyMobileCard) {
    storyMobileCard.classList.toggle("is-contain", item.cropMode === "contain");
    storyMobileCard.style.setProperty("--storyMobileBgImage", item.cropMode === "contain" ? `url("${imageSrc}")` : "none");
  }

  if (item.rotation === 90) storyMobileImg.style.setProperty("--storyRotate", "90deg");
  else if (item.rotation === -90) storyMobileImg.style.setProperty("--storyRotate", "-90deg");
  else if (item.rotation === 180) storyMobileImg.style.setProperty("--storyRotate", "180deg");
  else storyMobileImg.style.setProperty("--storyRotate", "0deg");

  storyMobileYear.textContent = item.yearLabel;
  if (storyMobileBlurb) storyMobileBlurb.textContent = item.blurb || "";
  setActiveStoryScrubberIndex(safeIndex);

  if (scrollPill && storyYearButtons[safeIndex]) {
    storyYearButtons[safeIndex].scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }
}

function syncStoryResponsiveMode() {
  if (!storyMosaicLayout || !storyMobileStage) return;
  const isMobile = isStoryMobileView();
  if (storyYearScrubber) {
    storyYearScrubber.classList.toggle("hidden", !storyItems.length || !isMobile);
    if (!storyYearButtons.length && storyItems.length) {
      renderStoryYearScrubber(storyItems, storyPathTargets, (index) => {
        if (!isStoryMobileView()) return;
        setStoryMobileSlide(index);
      });
    }
  }
  storyMobileStage.hidden = !isMobile;
  storyMobileStage.setAttribute("aria-hidden", String(!isMobile));
  if (storyMosaicShell) storyMosaicShell.setAttribute("aria-hidden", String(isMobile));
  storyMosaicLayout.setAttribute("aria-hidden", String(isMobile));
  bindStoryYearObserver(isMobile ? [] : storyPathTargets);

  if (isMobile && storyItems.length) {
    setStoryMobileSlide(storyMobileIndex, { scrollPill: false });
    clearStoryChronologyPath();
    return;
  }

  queueStoryChronologyPathRender();
}

function bindStoryMobileStage() {
  if (!storyMobileCard || storyMobileCard.dataset.bound === "true") return;

  storyMobileCard.addEventListener("click", () => {
    if (!storyItems.length) return;
    openStoryLightbox(storyMobileIndex);
  });

  storyMobileCard.addEventListener(
    "touchstart",
    (event) => {
      storyMobileTouchStartX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
    },
    { passive: true },
  );

  storyMobileCard.addEventListener(
    "touchend",
    (event) => {
      const endX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
      if (storyMobileTouchStartX === null || endX === null) return;
      const delta = endX - storyMobileTouchStartX;
      storyMobileTouchStartX = null;
      if (Math.abs(delta) < 48) return;
      if (delta < 0) setStoryMobileSlide(storyMobileIndex + 1);
      else setStoryMobileSlide(storyMobileIndex - 1);
    },
    { passive: true },
  );

  window.addEventListener("resize", syncStoryResponsiveMode);
  storyMobileCard.dataset.bound = "true";
}

function getNearestStoryTimelineIndex() {
  if (!storyViewport || !storyTrack) return 0;
  const slides = Array.from(storyTrack.children);
  if (!slides.length) return 0;
  const targetLeft = storyViewport.scrollLeft + storyViewport.clientWidth * 0.5;
  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const center = slide.offsetLeft + slide.clientWidth * 0.5;
    const delta = Math.abs(center - targetLeft);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function updateStoryTimelineUI(index) {
  if (!storyTrack) return;
  const maxIndex = Math.max(0, storyTrack.children.length - 1);
  storyTimelineIndex = Math.max(0, Math.min(maxIndex, Number(index) || 0));

  if (storyPrev) storyPrev.disabled = storyTimelineIndex <= 0;
  if (storyNext) storyNext.disabled = storyTimelineIndex >= maxIndex;

  if (storyDots) {
    const dots = Array.from(storyDots.querySelectorAll(".story-timeline-dot"));
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === storyTimelineIndex);
      dot.setAttribute("aria-current", dotIndex === storyTimelineIndex ? "true" : "false");
    });
  }

  setActiveStoryScrubberIndex(storyTimelineIndex);
}

function scrollStoryTimelineTo(index, behavior = getScrollBehavior()) {
  if (!storyViewport || !storyTrack) return;
  const slides = Array.from(storyTrack.children);
  if (!slides.length) return;
  const clamped = Math.max(0, Math.min(slides.length - 1, Number(index) || 0));
  const target = slides[clamped];
  storyViewport.scrollTo({
    left: target.offsetLeft,
    behavior,
  });
  updateStoryTimelineUI(clamped);
}

function bindStoryTimelineEvents() {
  if (!storyViewport || !storyTrack || storyViewport.dataset.bound === "true") return;

  if (storyPrev) {
    storyPrev.addEventListener("click", () => {
      scrollStoryTimelineTo(storyTimelineIndex - 1);
    });
  }

  if (storyNext) {
    storyNext.addEventListener("click", () => {
      scrollStoryTimelineTo(storyTimelineIndex + 1);
    });
  }

  storyViewport.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = storyViewport.scrollWidth - storyViewport.clientWidth;
      if (maxScroll <= 1) return;
      const atStart = storyViewport.scrollLeft <= 1;
      const atEnd = storyViewport.scrollLeft >= maxScroll - 1;

      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) {
        return;
      }

      event.preventDefault();
      storyViewport.scrollLeft += event.deltaY;
    },
    { passive: false },
  );

  storyViewport.addEventListener(
    "scroll",
    () => {
      if (storyTimelineRaf) return;
      storyTimelineRaf = window.requestAnimationFrame(() => {
        storyTimelineRaf = null;
        updateStoryTimelineUI(getNearestStoryTimelineIndex());
      });
    },
    { passive: true },
  );

  storyViewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollStoryTimelineTo(storyTimelineIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollStoryTimelineTo(storyTimelineIndex + 1);
    }
  });

  window.addEventListener("resize", () => {
    if (!storyTrack.children.length) return;
    scrollStoryTimelineTo(storyTimelineIndex, "auto");
  });

  storyViewport.dataset.bound = "true";
}

async function initStoryTimeline() {
  if (!storyTrack || !storyViewport) return;

  const entries = sortStoryEntries(await loadStoryEntriesFromManifest());
  storyItems = entries.map((entry) => buildStoryItem(entry));
  storyTrack.innerHTML = "";
  if (storyDots) storyDots.innerHTML = "";

  if (!storyItems.length) {
    storyTrack.appendChild(buildStoryTimelinePlaceholder());
    updateStoryTimelineUI(0);
    bindStoryTimelineEvents();
    return;
  }

  storyItems.forEach((item, index) => {
    const slide = buildStoryTimelineSlide(item, index);
    storyTrack.appendChild(slide);
    if (storyDots) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "story-timeline-dot";
      dot.setAttribute("aria-label", `Go to ${item.yearLabel}`);
      dot.addEventListener("click", () => scrollStoryTimelineTo(index));
      storyDots.appendChild(dot);
    }
  });

  if (storyHint) {
    storyHint.textContent = isCoarsePointer() ? "Swipe timeline →" : "Scroll, swipe, or use arrows →";
  }

  updateStoryTimelineUI(0);
  bindStoryTimelineEvents();
  window.requestAnimationFrame(() => scrollStoryTimelineTo(0, "auto"));
}

function buildStoryMosaicCard(item, slot, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = `story-mosaic-card story-mosaic-card--${slot}`;
  if (item.cropMode === "contain") card.classList.add("story-mosaic-card--contain");
  card.id = `story-${item.year}-${index}`;
  card.dataset.year = String(item.year);
  card.dataset.yearIndex = String(index);
  card.style.setProperty("--objPos", item.objectPosition || "50% 50%");
  card.setAttribute("aria-label", `Open story from ${item.yearLabel}`);

  const imageSources = storyImageSources(item, true);
  const imageSrc = imageSources.preferred || imageSources.original;

  if (item.cropMode === "contain") {
    const bgImg = document.createElement("img");
    bgImg.className = "story-mosaic-bg";
    bgImg.src = imageSrc;
    bgImg.alt = "";
    bgImg.loading = "lazy";
    bgImg.decoding = "async";
    bgImg.setAttribute("aria-hidden", "true");
    card.appendChild(bgImg);
  }

  const img = document.createElement("img");
  img.className = "story-mosaic-image";
  img.src = imageSrc;
  attachStoryFallback(img, imageSources.fallback);
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.objectFit = item.cropMode === "contain" ? "contain" : "cover";
  img.style.imageOrientation = "from-image";
  if (item.rotation === 90) img.style.setProperty("--storyRotate", "90deg");
  else if (item.rotation === -90) img.style.setProperty("--storyRotate", "-90deg");
  else if (item.rotation === 180) img.style.setProperty("--storyRotate", "180deg");
  else img.style.setProperty("--storyRotate", "0deg");

  const overlay = document.createElement("span");
  overlay.className = "story-card-overlay";
  overlay.textContent = item.blurb;

  const yearPill = document.createElement("span");
  yearPill.className = "story-year-pill";
  yearPill.textContent = item.yearLabel;

  card.appendChild(img);
  card.appendChild(overlay);
  card.appendChild(yearPill);

  if (ENABLE_FOCAL_TUNER) {
    const marker = document.createElement("span");
    marker.className = "story-focal-marker";
    marker.style.left = `${(item.focalX * 100).toFixed(2)}%`;
    marker.style.top = `${(item.focalY * 100).toFixed(2)}%`;
    card.appendChild(marker);

    img.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const rect = img.getBoundingClientRect();
      const focalX = clamp01((event.clientX - rect.left) / Math.max(rect.width, 1));
      const focalY = clamp01((event.clientY - rect.top) / Math.max(rect.height, 1), 0.3);
      marker.style.left = `${(focalX * 100).toFixed(2)}%`;
      marker.style.top = `${(focalY * 100).toFixed(2)}%`;
      console.log(`year ${item.year} focalX=${focalX.toFixed(2)} focalY=${focalY.toFixed(2)}`);
    });
  }

  const lightboxIndex = storyItems.findIndex((storyItem) => storyItem.file === item.file);
  card.addEventListener("click", () => {
    if (lightboxIndex < 0) return;
    openStoryLightbox(lightboxIndex);
  });

  return card;
}

function applyStoryMosaicReveal(cards) {
  if (!cards.length) return;
  if (reducedMotion) {
    cards.forEach((card) => card.classList.add("is-in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in-view");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  cards.forEach((card) => observer.observe(card));
}

const STORY_MOSAIC_SLOTS_BY_YEAR = {
  1998: "hero-a",
  1995: "top-mid",
  2001: "top-right",
  2008: "mid-mid",
  2013: "mid-right",
  2024: "hero-b",
  2016: "low-mid",
  2020: "low-right",
  2021: "row4-mid",
  2023: "row4-right",
  2025: "row5-left",
  2027: "row5-right",
};

function getStoryMosaicSlot(item, index) {
  const yearSlot = STORY_MOSAIC_SLOTS_BY_YEAR[item.year];
  if (yearSlot) return yearSlot;
  return index === 0 ? "hero-a" : "auto";
}

async function initStoryMosaicLayout() {
  if (!storyMosaicLayout) return;

  const entries = sortStoryEntries(await loadStoryEntriesFromManifest());
  storyItems = entries.map((entry) => buildStoryItem(entry));
  storyMosaicLayout.innerHTML = "";
  bindStoryLightboxEvents();

  if (!storyItems.length) {
    const empty = document.createElement("div");
    empty.className = "story-mosaic-empty";
    empty.textContent = "Story photos coming soon.";
    storyMosaicLayout.appendChild(empty);
    storyPathTargets = [];
    clearStoryChronologyPath();
    renderStoryYearScrubber([], []);
    bindStoryYearObserver([]);
    syncStoryResponsiveMode();
    return;
  }

  const orderedItems = [...storyItems].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" });
  });
  storyItems = orderedItems;
  const cards = [];
  const yearTargets = [];

  orderedItems.forEach((item, index) => {
    const slot = getStoryMosaicSlot(item, index);
    const card = buildStoryMosaicCard(item, slot, index);
    storyMosaicLayout.appendChild(card);

    cards.push(card);
    yearTargets.push({ index, element: card });
  });

  storyPathTargets = yearTargets;

  renderStoryYearScrubber(orderedItems, yearTargets, (index) => {
    if (!isStoryMobileView()) return;
    setStoryMobileSlide(index);
  });
  bindStoryYearObserver(isStoryMobileView() ? [] : yearTargets);
  applyStoryMosaicReveal(cards);
  bindStoryMobileStage();
  bindStoryChronologyResize();
  const preferredIndex = Math.max(
    0,
    orderedItems.findIndex((item) => Number(item.year) === 2016),
  );
  storyMobileIndex = preferredIndex;
  setStoryMobileSlide(preferredIndex, { scrollPill: false });
  syncStoryResponsiveMode();
  queueStoryChronologyPathRender();
}

function isCoarsePointer() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches || window.innerWidth <= 760;
}

function clearStoryTileReveal(keepIndex = -1) {
  if (!storyMosaicGrid) return;
  storyMosaicGrid.querySelectorAll(".story-mosaic-tile.is-revealed").forEach((tile) => {
    if (Number(tile.dataset.index) === keepIndex) return;
    tile.classList.remove("is-revealed");
  });
}

function isStoryLightboxOpen() {
  if (!storyLightbox) return false;
  return !storyLightbox.classList.contains("hidden") && storyLightbox.getAttribute("aria-hidden") !== "true";
}

function updateStoryLightboxView() {
  if (!storyLightboxImg || !storyItems.length) return;
  const item = storyItems[currentStoryIndex];
  storyLightboxImg.src = storyImageSources(item, false).original;
  storyLightboxImg.alt = item.alt || `Story photo ${item.year}`;
  if (item.rotation === 90) storyLightboxImg.style.transform = "rotate(90deg) scale(0.95)";
  else if (item.rotation === -90) storyLightboxImg.style.transform = "rotate(-90deg) scale(0.95)";
  else if (item.rotation === 180) storyLightboxImg.style.transform = "rotate(180deg) scale(0.99)";
  else storyLightboxImg.style.transform = "none";
  if (storyLightboxTitle) storyLightboxTitle.textContent = item.title;
  if (storyLightboxBlurb) storyLightboxBlurb.textContent = item.blurb;
  if (storyLightboxLong) storyLightboxLong.textContent = item.longCaption;
  if (storyLightboxCounter) storyLightboxCounter.textContent = `${currentStoryIndex + 1} / ${storyItems.length}`;
}

function openStoryLightbox(index) {
  if (!storyLightbox || !storyItems.length) return;
  closeGalleryLightbox();
  currentStoryIndex = Number.isFinite(index) ? ((index % storyItems.length) + storyItems.length) % storyItems.length : 0;
  updateStoryLightboxView();
  storyLightbox.classList.remove("hidden");
  storyLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeStoryLightbox() {
  if (!storyLightbox) return;
  storyLightbox.classList.add("hidden");
  storyLightbox.setAttribute("aria-hidden", "true");
  if (storyLightboxImg) storyLightboxImg.removeAttribute("src");
  clearStoryTileReveal(-1);
  document.body.classList.remove("modal-open");
}

function showPrevStory() {
  if (!storyItems.length) return;
  currentStoryIndex = (currentStoryIndex - 1 + storyItems.length) % storyItems.length;
  updateStoryLightboxView();
}

function showNextStory() {
  if (!storyItems.length) return;
  currentStoryIndex = (currentStoryIndex + 1) % storyItems.length;
  updateStoryLightboxView();
}

function bindStoryLightboxEvents() {
  if (!storyLightbox || storyLightbox.dataset.bound === "true") return;

  storyLightboxCloseButtons.forEach((button) => {
    button.addEventListener("click", closeStoryLightbox);
  });

  if (storyLightboxPrev) {
    storyLightboxPrev.addEventListener("click", (event) => {
      event.preventDefault();
      showPrevStory();
    });
  }

  if (storyLightboxNext) {
    storyLightboxNext.addEventListener("click", (event) => {
      event.preventDefault();
      showNextStory();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!isStoryLightboxOpen()) return;
    if (event.key === "Escape") {
      closeStoryLightbox();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevStory();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextStory();
    }
  });

  const swipeTarget = storyLightboxFrame || storyLightbox;
  if (swipeTarget) {
    swipeTarget.addEventListener(
      "touchstart",
      (event) => {
        storyTouchStartX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
      },
      { passive: true },
    );

    swipeTarget.addEventListener(
      "touchend",
      (event) => {
        const endX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
        if (storyTouchStartX === null || endX === null) return;
        const deltaX = endX - storyTouchStartX;
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) showPrevStory();
          else showNextStory();
        }
        storyTouchStartX = null;
      },
      { passive: true },
    );
  }

  storyLightbox.dataset.bound = "true";
}

function buildStoryItem(entry) {
  const filename = decodeURIComponent((String(entry.file || "").split("?")[0].split("/").pop() || "").trim());
  const override = STORY_OVERRIDES[filename] || {};
  const yearPreset = STORY_YEAR_FOCAL_PRESETS[entry.year] || {};
  const copy = storyCopyForYear(entry.year);
  const rotation = Number.isFinite(Number(override.rotate))
    ? Number(override.rotate)
    : Number.isFinite(Number(entry.rotation))
      ? Number(entry.rotation)
      : 0;
  const parsedEntryPosition = parseStoryObjectPosition(entry.objectPosition);
  const focalX = Number.isFinite(Number(entry.focalX))
    ? clamp01(Number(entry.focalX), STORY_DEFAULT_FOCAL_X)
    : parsedEntryPosition?.x ?? yearPreset.focalX ?? STORY_DEFAULT_FOCAL_X;
  const focalY = Number.isFinite(Number(entry.focalY))
    ? clamp01(Number(entry.focalY), STORY_DEFAULT_FOCAL_Y)
    : parsedEntryPosition?.y ?? yearPreset.focalY ?? STORY_DEFAULT_FOCAL_Y;
  const cropMode = normalizeCropMode(entry.cropMode || yearPreset.cropMode || entry.fit || "cover") || "cover";
  const parsedOverridePosition = parseStoryObjectPosition(override.objPos);
  const objectPosition = parsedOverridePosition
    ? toObjectPosition(parsedOverridePosition.x, parsedOverridePosition.y)
    : toObjectPosition(focalX, focalY);

  return {
    ...entry,
    title: copy.title,
    blurb: copy.blurb,
    longCaption: copy.longCaption,
    rotation,
    focalX,
    focalY,
    cropMode,
    allowNoFace: Boolean(entry.allowNoFace),
    objectPosition,
    yearLabel: storyYearLabel(entry.year),
  };
}

function createStoryMosaicTile(item, index, totalCount) {
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "story-mosaic-tile";
  tile.dataset.index = String(index);
  tile.setAttribute("aria-label", `Open story from ${item.yearLabel}`);

  if (totalCount >= 6 && index === 0) {
    tile.classList.add("is-anchor-lg");
  } else if (totalCount >= 8 && index === 4) {
    tile.classList.add("is-anchor-wide");
  }

  const img = document.createElement("img");
  const imageSources = storyImageSources(item, true);
  img.src = imageSources.preferred || imageSources.original;
  attachStoryFallback(img, imageSources.fallback);
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.imageOrientation = "from-image";
  if (item.rotation === 90) img.style.setProperty("--storyRotate", "90deg");
  else if (item.rotation === -90) img.style.setProperty("--storyRotate", "-90deg");
  else if (item.rotation === 180) img.style.setProperty("--storyRotate", "180deg");
  else img.style.setProperty("--storyRotate", "0deg");

  const overlay = document.createElement("span");
  overlay.className = "story-mosaic-overlay";

  const caption = document.createElement("span");
  caption.className = "story-mosaic-caption";
  caption.textContent = item.blurb;

  overlay.appendChild(caption);

  const yearChip = document.createElement("span");
  yearChip.className = "story-mosaic-year-chip";
  yearChip.textContent = item.yearLabel;
  tile.appendChild(img);
  tile.appendChild(overlay);
  tile.appendChild(yearChip);

  tile.addEventListener("click", () => {
    if (isCoarsePointer() && !tile.classList.contains("is-revealed")) {
      clearStoryTileReveal(index);
      tile.classList.add("is-revealed");
      return;
    }
    openStoryLightbox(index);
  });

  tile.addEventListener("focus", () => {
    if (isCoarsePointer()) return;
    clearStoryTileReveal(index);
    tile.classList.add("is-revealed");
  });

  return tile;
}

function buildStoryPlaceholder() {
  const tile = document.createElement("div");
  tile.className = "story-mosaic-tile";
  tile.style.display = "grid";
  tile.style.placeItems = "center";
  tile.style.padding = "16px";
  tile.textContent = "Story photos coming soon.";
  return tile;
}

function getStoryFocusRect(stageRect) {
  const isMobile = window.innerWidth <= 760;
  const maxWidth = isMobile ? stageRect.width * 0.92 : Math.min(860, stageRect.width * 0.82);
  const targetHeight = isMobile ? Math.min(window.innerHeight * 0.52, stageRect.height * 0.88) : Math.min(window.innerHeight * 0.62, stageRect.height * 0.9);
  const width = Math.max(220, Math.min(stageRect.width, maxWidth));
  const height = Math.max(200, Math.min(stageRect.height, targetHeight));
  const left = (stageRect.width - width) / 2;
  const top = Math.max(8, (stageRect.height - height) / 2);

  return { left, top, width, height };
}

function setStoryOverlayRect(rect) {
  if (!storyFocusOverlay) return;
  storyFocusOverlay.style.left = `${rect.left}px`;
  storyFocusOverlay.style.top = `${rect.top}px`;
  storyFocusOverlay.style.width = `${rect.width}px`;
  storyFocusOverlay.style.height = `${rect.height}px`;
}

function applyStoryOverlayImage(item) {
  if (!storyFocusImage || !item) return;
  const imageSources = storyImageSources(item, true);
  storyFocusImage.src = imageSources.preferred || imageSources.original;
  attachStoryFallback(storyFocusImage, imageSources.fallback);
  storyFocusImage.alt = item.alt || `Story photo ${item.yearLabel}`;
  storyFocusImage.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);

  if (item.rotation === 90) {
    storyFocusImage.style.setProperty("--storyRotate", "90deg");
    storyFocusImage.style.setProperty("--storyScaleFactor", "1.16");
  } else if (item.rotation === -90) {
    storyFocusImage.style.setProperty("--storyRotate", "-90deg");
    storyFocusImage.style.setProperty("--storyScaleFactor", "1.16");
  } else if (item.rotation === 180) {
    storyFocusImage.style.setProperty("--storyRotate", "180deg");
    storyFocusImage.style.setProperty("--storyScaleFactor", "1.04");
  } else {
    storyFocusImage.style.setProperty("--storyRotate", "0deg");
    storyFocusImage.style.setProperty("--storyScaleFactor", "1.03");
  }
}

function hideStoryFocus() {
  if (!storyMosaicGrid || !storyFocusOverlay || !storyCaption) return;

  storyMosaicGrid.classList.remove("is-focused");
  storyTileElements.forEach((tile) => tile.classList.remove("is-active"));

  if (reducedMotion) {
    storyFocusOverlay.classList.remove("is-visible");
    storyFocusOverlay.classList.add("hidden");
    storyCaption.classList.remove("is-visible");
    storyCaption.classList.add("hidden");
    return;
  }

  storyFocusOverlay.classList.remove("is-visible");
  storyCaption.classList.remove("is-visible");
  window.setTimeout(() => {
    if (storyActiveStep >= 0) return;
    storyFocusOverlay.classList.add("hidden");
    storyCaption.classList.add("hidden");
  }, 230);
}

function showStoryFocus(step, animate = true) {
  if (!storyStage || !storyMosaicGrid || !storyFocusOverlay || !storyFocusImage || !storyCaption || !storyCaptionTitle || !storyCaptionBlurb) return;
  if (!storyItems.length) return;
  if (step < 0 || step >= storyItems.length) return;

  const tile = storyTileElements[step];
  if (!tile) return;

  const tileRect = tile.getBoundingClientRect();
  const stageRect = storyStage.getBoundingClientRect();
  const startRect = {
    left: tileRect.left - stageRect.left,
    top: tileRect.top - stageRect.top,
    width: tileRect.width,
    height: tileRect.height,
  };
  const endRect = getStoryFocusRect(stageRect);
  const item = storyItems[step];

  applyStoryOverlayImage(item);
  storyCaptionTitle.textContent = item.yearLabel;
  storyCaptionBlurb.textContent = item.blurb;

  storyMosaicGrid.classList.add("is-focused");
  storyTileElements.forEach((node, index) => node.classList.toggle("is-active", index === step));

  storyFocusOverlay.classList.remove("hidden");
  storyCaption.classList.remove("hidden");
  setStoryOverlayRect(startRect);

  if (reducedMotion || !animate) {
    setStoryOverlayRect(endRect);
    storyFocusOverlay.classList.add("is-visible");
    storyCaption.classList.add("is-visible");
    return;
  }

  storyFocusOverlay.classList.add("is-visible");
  window.requestAnimationFrame(() => {
    setStoryOverlayRect(endRect);
    storyCaption.classList.add("is-visible");
  });
}

function applyStoryStep(step, animate = true) {
  if (step === storyActiveStep) return;
  storyActiveStep = step;

  if (step < 0) {
    hideStoryFocus();
    return;
  }

  showStoryFocus(step, animate);
}

function computeStoryStep() {
  if (!storySection || !storyItems.length) return -1;
  const sectionRect = storySection.getBoundingClientRect();
  const sectionTop = window.scrollY + sectionRect.top;
  const sectionHeight = storySection.offsetHeight || sectionRect.height;
  const viewportHeight = window.innerHeight || 1;
  const rawProgress = (window.scrollY - sectionTop) / Math.max(1, sectionHeight - viewportHeight);
  const progress = Math.max(0, Math.min(1, rawProgress));
  const segment = 1 / (storyItems.length + 1);
  const step = Math.floor(progress / segment) - 1;
  return Math.max(-1, Math.min(storyItems.length - 1, step));
}

function requestStoryStepSync() {
  if (storyScrollRaf) return;
  storyScrollRaf = window.requestAnimationFrame(() => {
    storyScrollRaf = null;
    const step = computeStoryStep();
    applyStoryStep(step, true);
  });
}

function setStoryTrackSteps(count) {
  if (!storyScrollyTrack) return;
  const safeCount = Math.max(1, Number(count) || 1);
  storyScrollyTrack.style.setProperty("--storySteps", String(safeCount));
}

function bindStoryScrollyEvents() {
  if (!storySection || storySection.dataset.bound === "true") return;

  if (storyFocusOverlay) {
    storyFocusOverlay.addEventListener("click", () => {
      if (storyActiveStep < 0) return;
      openStoryLightbox(storyActiveStep);
    });
  }

  window.addEventListener("scroll", requestStoryStepSync, { passive: true });

  window.addEventListener("resize", () => {
    if (storyResizeRaf) window.cancelAnimationFrame(storyResizeRaf);
    storyResizeRaf = window.requestAnimationFrame(() => {
      storyResizeRaf = null;
      syncStoryResponsiveMode();
      if (storyActiveStep >= 0) {
        showStoryFocus(storyActiveStep, false);
      } else {
        applyStoryStep(computeStoryStep(), false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".story-mosaic-tile")) return;
    if (target.closest(".story-lightbox-frame")) return;
    clearStoryTileReveal(-1);
  });

  storySection.dataset.bound = "true";
}

async function initStoryScrolly() {
  if (!storyMosaicGrid || !storySection) return;

  const entries = sortStoryEntries(await loadStoryEntriesFromManifest());
  storyItems = entries.map((entry) => buildStoryItem(entry));
  storyMosaicGrid.innerHTML = "";
  storyTileElements = [];
  storyActiveStep = -1;

  if (!storyItems.length) {
    storyMosaicGrid.appendChild(buildStoryPlaceholder());
    setStoryTrackSteps(1);
    return;
  }

  storyItems.forEach((item, index) => {
    const tile = createStoryMosaicTile(item, index, storyItems.length);
    storyTileElements.push(tile);
    storyMosaicGrid.appendChild(tile);
  });

  setStoryTrackSteps(storyItems.length);
  bindStoryLightboxEvents();
  bindStoryScrollyEvents();
  applyStoryStep(computeStoryStep(), false);
}

function initCutoutParallax() {
  const venueSection = document.getElementById("venue");
  if (!venueSection) return;

  const block = venueSection.querySelector(".cutout-parallax");
  const media = block ? block.querySelector(".cutout-parallax__media") : null;
  const img = media ? media.querySelector("img") : null;
  const scene = venueSection.querySelector(".venue-scene-scroll") || venueSection;
  if (!(block instanceof HTMLElement) || !(media instanceof HTMLElement) || !(img instanceof HTMLElement) || !(scene instanceof HTMLElement)) return;

  if (img.dataset.cutoutBound !== "true") {
    img.addEventListener("load", () => {
      block.classList.remove("is-image-missing");
    });
    img.addEventListener("error", () => {
      block.classList.add("is-image-missing");
    });
    img.dataset.cutoutBound = "true";
  }

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  let sceneTop = 0;
  let sceneHeight = 0;
  let viewportHeight = window.innerHeight;
  let panPx = 0;
  let overscanFactor = 1.45;
  let startPx = 0;
  let endPx = 0;
  let lastPanX = Number.NaN;
  let ticking = false;
  let inViewport = true;
  let resizeRaf = null;

  const setStaticCrop = () => {
    img.style.width = "100%";
    img.style.maxWidth = "100%";
    img.style.setProperty("--venue-pan", "0px");
    img.style.setProperty("--venue-pan-x", "0px");
    img.style.setProperty("--venue-scale", "1");
    img.style.transform = "translate3d(0, 0, 0) scale(1)";
  };

  const prefersReduced = prefersReducedMotion();
  if (prefersReduced) {
    setStaticCrop();
    return;
  }

  const measure = () => {
    viewportHeight = window.innerHeight;
    const sceneRect = scene.getBoundingClientRect();
    sceneTop = window.scrollY + sceneRect.top;
    sceneHeight = sceneRect.height;

    const frameWidth = media.clientWidth || 0;
    const isMobile = window.innerWidth <= 760;
    overscanFactor = isMobile ? 1.3 : 1.45;
    panPx = Math.max(0, frameWidth * (overscanFactor - 1));
    startPx = 0;
    endPx = -panPx;

    img.style.width = `calc(100% + ${panPx.toFixed(2)}px)`;
    img.style.maxWidth = "none";
    img.style.setProperty("--venue-pan", `${panPx.toFixed(2)}px`);
    lastPanX = Number.NaN;
  };

  const getProgress = () => {
    const denominator = sceneHeight - viewportHeight;
    if (denominator > 1) {
      return clamp01((window.scrollY - sceneTop) / denominator);
    }

    const rect = scene.getBoundingClientRect();
    const travel = Math.max(1, rect.height + viewportHeight);
    return clamp01((viewportHeight - rect.top) / travel);
  };

  const apply = () => {
    ticking = false;
    if (!inViewport) return;

    const progress = getProgress();
    const nextPanXRaw = startPx + (endPx - startPx) * progress;
    const nextPanX = Math.max(-panPx, Math.min(0, nextPanXRaw));
    if (Number.isFinite(lastPanX) && Math.abs(nextPanX - lastPanX) < 0.08) return;

    lastPanX = nextPanX;
    const scale = window.innerWidth <= 760 ? 1.01 : 1.02;
    img.style.setProperty("--venue-pan-x", `${nextPanX.toFixed(2)}px`);
    img.style.setProperty("--venue-scale", `${scale}`);
    img.style.transform = `translate3d(${nextPanX.toFixed(2)}px, 0, 0) scale(${scale})`;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      inViewport = entries.some((entry) => entry.isIntersecting);
      if (inViewport) requestTick();
    },
    {
      threshold: [0, 0.1, 0.35, 0.65],
      rootMargin: "140px 0px 140px 0px",
    },
  );
  observer.observe(scene);

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    if (resizeRaf !== null) window.cancelAnimationFrame(resizeRaf);
    resizeRaf = window.requestAnimationFrame(() => {
      measure();
      requestTick();
      resizeRaf = null;
    });
  });

  measure();
  requestTick();
}

async function init() {
  removeLegacyGalleryLightbox();
  setActiveLink("top");
  initHeader();
  initHeroCountdown();
  initSectionObserver();
  initJumpMenu();
  initThingsThemes();
  initTravelVisaSection();
  initHotelMatrix();
  initMakanSection();
  initStorySkipLink();
  initReveals();
  initScheduleReveal();
  await initStoryMosaicLayout();
  initRsvpCards();
  initRsvpForm();

  photoManifest = await loadManifest();
  applyInviteContext();
  applyStaticPhotoManifest();
  initCutoutParallax();
  initFaqAccordionGroups();
  initFaqWearImageDebug();
  await initGallery();

  inviteState.token = getTokenFromUrl();
  await lookupToken(inviteState.token);
}

init();

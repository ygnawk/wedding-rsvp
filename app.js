const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwpfLq3hB_mRiKKgiwMv1bvZUUtcoUZP7ifjKpnLpcK0HgaOKHwm_LRsPPCahWWQ67U/exec";
const RSVP_LOCAL_FALLBACK_KEY = "wedding_rsvp_fallback";
const BASE_PATH = window.location.hostname === "ygnawk.github.io" ? "/wedding-rsvp" : "";
const IS_LOCAL_DEV = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const RSVP_API_ORIGIN = "https://mikiandyijie-rsvp-api.onrender.com";
const DEBUG_FOCAL_PARAM = String(new URLSearchParams(window.location.search).get("debugFocal") || "").toLowerCase();
const ENABLE_FOCAL_TUNER = IS_LOCAL_DEV && ["1", "true", "yes", "on"].includes(DEBUG_FOCAL_PARAM);
const DEBUG_SLOT_PARAM = String(new URLSearchParams(window.location.search).get("debugSlots") || "").toLowerCase();
const SHOW_SLOT_DEBUG = IS_LOCAL_DEV && ["1", "true", "yes", "on"].includes(DEBUG_SLOT_PARAM);

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
const MOBILE_GALLERY_DOT_MAX = 7;
const GUEST_WALL_AUTOPLAY_INTERVAL_MS = 10000;
const GUEST_WALL_PINBOARD_LIMIT = 12;
const GUEST_WALL_PINBOARD_BUFFER_DESKTOP = 32;
const GUEST_WALL_PINBOARD_BUFFER_MOBILE = 16;
const GUEST_WALL_PREFETCH_THRESHOLD = 4;
const GUEST_WALL_DESKTOP_VISIBLE_SLOTS = 14;
const GUEST_WALL_MOBILE_VISIBLE_SLOTS = 6;
const GUEST_WALL_SLOT_GAP_DESKTOP = -10;
const GUEST_WALL_SLOT_GAP_MOBILE = -8;
const GUEST_WALL_SLOT_JITTER_DESKTOP = 10;
const GUEST_WALL_SLOT_JITTER_MOBILE = 6;
const GUEST_WALL_SWAP_FADE_OUT_MS = 200;
const GUEST_WALL_SWAP_FADE_IN_MS = 260;
const GUEST_WALL_SHUFFLE_REPLACE_RATIO = 0.4;
const GUEST_WALL_PICKUP_OPEN_DELAY_MS = 130;
const GUEST_WALL_ARRANGE_STORAGE_KEY = "guestwall-arrangement-v1";
const GUEST_WALL_ARRANGE_DEOVERLAP_STEPS = 20;
const GUEST_WALL_ARRANGE_DEOVERLAP_GAP = 8;
const GUEST_WALL_SLOW_MESSAGE_DELAY_MS = 5000;
const GUEST_WALL_SLOW_MESSAGE_ROTATE_MS = 3000;
const GUEST_WALL_HARD_TIMEOUT_MS = 20000;
const GUEST_WALL_LOADING_MESSAGE = "Loading guest wall…";
const GUEST_WALL_EMPTY_MESSAGE = "Nothing here yet—check back soon.";
const GUEST_WALL_UNAVAILABLE_MESSAGE = "Guest Wall is temporarily unavailable.";
const GUEST_WALL_READY_MESSAGE = "";
const GUEST_WALL_SLOW_MESSAGES = [
  "Sorry—this is taking a minute. The Wall is… emotionally buffering.",
  "Hang tight. We’re fetching your sweet words from the cloud (literally).",
  "Still loading. Really. Blame it on Yi Jie for relying on a free server plan.",
];
const GUEST_WALL_POLAROID_TONES = ["#5a1720", "#1f3c35", "#203652", "#3f2f2b", "#4c2a42"];
const GUEST_WALL_NOTE_TONES = ["#FAF3E8", "#F7EEDB", "#FFF4D8", "#F3E9D6"];
const GUEST_WALL_NOTE_VARIANTS = [
  "sticky",
  "sticky-soft",
  "notebook-torn",
  "index-aged",
  "letter",
  "letter-wrinkled",
  "receipt-strip",
  "postcard",
  "notebook",
  "index",
];
const GUEST_WALL_PIN_COLORS = ["#2F6F5E", "#2E5E86", "#C9A24A", "#6B1F2A"];
const GUEST_WALL_PIN_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const GUEST_WALL_DARK_INK_PALETTE = ["#1F1A17", "#3B0D16", "#0F2A24", "#0E1F3A"];
const RSVP_SLOW_SUBMIT_DELAY_MS = 4000;
const RSVP_SLOW_SUBMIT_JOKE =
  "We know it’s taking a while — Yi Jie was too cheap to pay for a faster server (free plan life). Give it a few more seconds…";
const STORY_IMAGE_PLACEHOLDER_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23efe7da"/><stop offset="100%" stop-color="%23e4d7c1"/></linearGradient></defs><rect width="1200" height="900" fill="url(%23g)"/><circle cx="600" cy="390" r="92" fill="%23ceb998" opacity="0.45"/><rect x="356" y="548" width="488" height="22" rx="11" fill="%239b7d52" opacity="0.4"/><rect x="418" y="594" width="364" height="18" rx="9" fill="%239b7d52" opacity="0.28"/></svg>';
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
const FUN_FACT_CHIP_COUNT = 10;
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
const FUN_FACT_POOL_V2 = [
  "I’m a +1 and accepting friend applications.",
  "I came for the wedding, stayed for the dumplings.",
  "If there’s a dessert table, I will find it.",
  "My karaoke song is painfully predictable.",
  "I’m great at remembering faces… not names.",
  "I own too many tote bags.",
  "I plan trips like it’s a military operation.",
  "I can’t walk past a bookstore.",
  "I will laugh at my own jokes. Loudly.",
  "I’m the designated photo-taker in every friend group.",
  "I judge cities by their coffee.",
  "I’m weirdly competitive about board games.",
  "I have a talent for finding the best seat in a room.",
  "I’m here for love and unlimited hot tea.",
  "I always order ‘one more’ appetizer.",
  "I’m a serial ‘just one more episode’ person.",
  "I can recommend a great café in at least three cities.",
  "I clap when the plane lands. Sometimes.",
  "I’m either 10 minutes early or exactly on time—never in between.",
  "My screen time report is between me and my therapist.",
  "I have strong opinions about bubble tea toppings.",
  "I can do a respectable two-step. Don’t ask for more.",
  "I’m the friend who reads the menu before arriving.",
  "I collect random facts I don’t need.",
  "I’ve never met a museum gift shop I didn’t love.",
  "I am a ‘walk everywhere’ person (until it rains).",
  "I’m here as a +1 but fully committed to the vibes.",
  "I will pet every dog I meet (with consent).",
  "I’m a first-timer in Beijing and taking local tips.",
  "I can’t resist a good stationery store.",
];

function normalizeFunFactPoolKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function dedupeFunFactPool(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const key = normalizeFunFactPoolKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildFunFactExamples() {
  const combined = dedupeFunFactPool([...BASE_FUN_FACT_EXAMPLES, ...NEW_FUN_FACT_IDEAS, ...FUN_FACT_POOL_V2, ...FUN_FACT_REPLACEMENT_IDEAS]);

  if (IS_LOCAL_DEV) {
    const requested = BASE_FUN_FACT_EXAMPLES.length + NEW_FUN_FACT_IDEAS.length + FUN_FACT_POOL_V2.length + FUN_FACT_REPLACEMENT_IDEAS.length;
    const duplicatesRemoved = requested - combined.length;
    console.debug("[fun-fact-ideas]", {
      requested,
      unique: combined.length,
      duplicatesRemoved,
    });
  }

  return combined;
}

const FUN_FACT_EXAMPLES = buildFunFactExamples();

let photoManifest = null;
let revealObserver = null;
let reducedMotion = false;
let selectedUploadFiles = Array.from({ length: MAX_UPLOAD_FILES }, () => null);
let selectedUploadPreviewUrls = Array.from({ length: MAX_UPLOAD_FILES }, () => "");
let rsvpIsSubmitting = false;

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
const rsvpSubmitHelper = document.getElementById("rsvpSubmitHelper");
const rsvpSubmitSlowHelper = document.getElementById("rsvpSubmitSlowHelper");
const rsvpConfirmation = document.getElementById("rsvpConfirmation");
const rsvpPanel = document.querySelector("#rsvp .rsvp-panel");

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
const makanLegalWrapper = makanLegalTrigger ? makanLegalTrigger.closest(".makan-legal-row") : null;
const hotelMatrixShell = document.getElementById("hotelMatrixShell");
const hotelMapCard = document.querySelector(".hotel-map-card");
const hotelMatrixChartCol = document.querySelector(".hotel-map-chart-col");
const hotelMatrixSvg = document.getElementById("hotelMatrixSvg");
const hotelMatrixTooltip = document.getElementById("hotelMatrixTooltip");
const hotelMatrixDetails = document.getElementById("hotelMatrixDetails");
const hotelMatrixSheet = document.getElementById("hotelMatrixSheet");
const hotelMatrixSheetContent = document.getElementById("hotelMatrixSheetContent");
const hotelMatrixSheetClose = document.getElementById("hotelMatrixSheetClose");
const hotelMatrixSheetPanel = hotelMatrixSheet ? hotelMatrixSheet.querySelector(".hotel-map-sheet-panel") : null;
const hotelMatrixSheetCloseControls = hotelMatrixSheet ? Array.from(hotelMatrixSheet.querySelectorAll("[data-sheet-close], #hotelMatrixSheetClose")) : [];
const hotelMethodTrigger = document.getElementById("hotelMethodTrigger");
const hotelMethodTriggerMobile = document.getElementById("hotelMethodTriggerMobile");
const hotelMethodSheet = document.getElementById("hotelMethodSheet");
const hotelMethodSheetPanel = hotelMethodSheet ? hotelMethodSheet.querySelector(".hotel-method-sheet-panel") : null;
const hotelMethodSheetCloseControls = hotelMethodSheet ? Array.from(hotelMethodSheet.querySelectorAll("[data-method-sheet-close], #hotelMethodSheetClose")) : [];
let hotelMethodTooltip = null;

const galleryGrid = document.getElementById("galleryGrid");
const galleryDots = document.getElementById("galleryDots");
const galleryLightbox = document.getElementById("lightbox");
const galleryLightboxImage = document.getElementById("lightboxImg");
const galleryLightboxCounter = document.getElementById("lightboxCounter");
const galleryLightboxPrev = galleryLightbox ? galleryLightbox.querySelector(".lightbox-btn--prev") : null;
const galleryLightboxNext = galleryLightbox ? galleryLightbox.querySelector(".lightbox-btn--next") : null;
const galleryLightboxFrame = galleryLightbox ? galleryLightbox.querySelector(".lightbox-frame") : null;
const galleryLightboxCloseButtons = galleryLightbox
  ? Array.from(galleryLightbox.querySelectorAll("[data-close], .lightbox-close"))
  : [];
const guestWallPinboard = document.getElementById("guestWallPinboard");
const guestWallMobile = document.getElementById("guestWallMobile");
const guestWallStatus = document.getElementById("guestWallStatus");
const guestWallPinboardView = document.getElementById("guestWallPinboardView");
const guestWallShuffle = document.getElementById("guestWallShuffle");
const guestWallArrangeToggle = document.getElementById("guestWallArrangeToggle");
const guestWallAutoplayToggle = document.getElementById("guestWallAutoplayToggle");
const guestWallAutoplayControl = document.querySelector(".guestwall-autoplay-control");
const guestWallAutoplayState = document.getElementById("guestWallAutoplayState");
const guestWallDetailModal = document.getElementById("guestWallDetailModal");
const guestWallDetailClose = document.getElementById("guestWallDetailClose");
const guestWallDetailContent = document.getElementById("guestWallDetailContent");

let galleryImages = [];
let currentGalleryIndex = 0;
let galleryTouchStartX = null;
let bodyScrollLockCount = 0;
let bodyScrollLockY = 0;
let galleryScrollRaf = null;
let guestWallCards = [];
let guestWallCardById = new Map();
let guestWallVisibleCardIds = [];
let guestWallSlotNodes = [];
let guestWallActiveSlotNode = null;
let guestWallRotationTimer = null;
let guestWallMobileTimer = null;
let guestWallMobileIndex = 0;
let guestWallPaused = false;
let guestWallIsShuffling = false;
let guestWallDetailOpen = false;
let guestWallResizeRaf = null;
let guestWallLastViewportWidth = window.innerWidth || 0;
let guestWallNextCursor = null;
let guestWallPrefetchInFlight = null;
let guestWallRequestInFlight = null;
let guestWallLayoutCycle = 0;
let guestWallActiveSlotConfig = [];
let guestWallLoadState = "idle";
let guestWallSlowMessageStartTimer = null;
let guestWallSlowMessageRotateTimer = null;
let guestWallSlowMessageIndex = 0;
let guestWallArrangeMode = false;
let guestWallDragState = null;
let guestWallArrangementByCardId = new Map();
let overflowDebugResizeTimer = null;
let desktopMoreCloseTimer = null;
let activeSectionId = "top";
let desktopMoreActiveOverride = false;
let rsvpSlowSubmitTimer = null;

function clearRsvpSlowSubmitTimer() {
  if (!rsvpSlowSubmitTimer) return;
  window.clearTimeout(rsvpSlowSubmitTimer);
  rsvpSlowSubmitTimer = null;
}

function resetRsvpSlowSubmitJoke() {
  clearRsvpSlowSubmitTimer();
  if (rsvpSubmitSlowHelper) {
    rsvpSubmitSlowHelper.textContent = RSVP_SLOW_SUBMIT_JOKE;
    setHiddenClass(rsvpSubmitSlowHelper, true);
  }
}

function logHorizontalOverflowOffenders(context = "runtime") {
  if (!IS_LOCAL_DEV || window.innerWidth > 900) return [];

  const viewportWidth = window.innerWidth;
  const offenders = [];

  document.querySelectorAll("body *").forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;

    const rect = el.getBoundingClientRect();
    if (!Number.isFinite(rect.left) || !Number.isFinite(rect.right) || rect.width <= 0 || rect.height <= 0) return;

    if (rect.right > viewportWidth + 1 || rect.left < -1) {
      offenders.push({
        el,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        className: el.className || "",
      });
    }
  });

  if (offenders.length) {
    const printable = offenders
      .slice(0, 25)
      .map((item) => ({
        node: item.el.tagName.toLowerCase(),
        className: String(item.className).trim(),
        left: Math.round(item.left * 100) / 100,
        right: Math.round(item.right * 100) / 100,
        width: Math.round(item.width * 100) / 100,
      }));

    console.groupCollapsed(`[overflow-debug:${context}] ${offenders.length} element(s) exceed viewport ${viewportWidth}px`);
    console.table(printable);
    console.groupEnd();
  }

  return offenders;
}

function initOverflowDebugHelper() {
  if (!IS_LOCAL_DEV) return;
  window.__logOverflowOffenders = (label = "manual") => logHorizontalOverflowOffenders(label);

  window.addEventListener("resize", () => {
    window.clearTimeout(overflowDebugResizeTimer);
    overflowDebugResizeTimer = window.setTimeout(() => logHorizontalOverflowOffenders("resize"), 140);
  });

  window.setTimeout(() => logHorizontalOverflowOffenders("post-init"), 180);
}

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
const storyMobileImgCurrent = document.getElementById("storyMobileImgCurrent");
const storyMobileImgNext = document.getElementById("storyMobileImgNext");
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
let storyDebugNode = null;
let storyFetchErrorState = null;

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
let storyMobileSwapToken = 0;
const STORY_MOBILE_CROSSFADE_MS = 320;
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
let hotelMethodSheetOpen = false;
let hotelMethodSheetSwipeActive = false;
let hotelMethodSheetStartY = 0;
let hotelMethodSheetDeltaY = 0;
let hotelTouchSelectionLockUntil = 0;
let makanTipOpen = false;
let makanLegalOpen = false;
let makanTypeAccordions = [];
let makanBulkToggle = false;

const jumpMenuWrap = document.getElementById("jumpMenuWrap");
const jumpWallButton = document.getElementById("jumpWallButton");
const travelPassportPills = Array.from(document.querySelectorAll(".travel-passport-pill"));
const travelPassportClear = document.getElementById("travelPassportClear");
const travelPassportResult = document.getElementById("travelPassportResult");
const travelSourcesDisclosure = document.querySelector(".travel-sources-disclosure");

const SLOT_MAPS_DESKTOP = {
  A: [
    { id: "dA1", xPct: 18, yPct: 20, size: "M", kind: "media", baseZ: 4, tiltBase: -2.0 },
    { id: "dA2", xPct: 35, yPct: 32, size: "XL", kind: "media", format: "wide", baseZ: 7, tiltBase: 1.6 },
    { id: "dA3", xPct: 13, yPct: 47, size: "S", kind: "media", baseZ: 3, tiltBase: 1.5 },
    { id: "dA4", xPct: 49, yPct: 21, size: "S", kind: "media", baseZ: 4, tiltBase: -1.1 },
    { id: "dA5", xPct: 44, yPct: 54, size: "M", kind: "media", baseZ: 5, tiltBase: -1.5 },
    { id: "dA6", xPct: 76, yPct: 23, size: "S", kind: "note", baseZ: 3, tiltBase: 1.2 },
    { id: "dA7", xPct: 88, yPct: 31, size: "M", kind: "note", baseZ: 4, tiltBase: -1.2 },
    { id: "dA8", xPct: 79, yPct: 45, size: "S", kind: "note", baseZ: 3, tiltBase: 1.3 },
    { id: "dA9", xPct: 90, yPct: 49, size: "S", kind: "note", baseZ: 4, tiltBase: -1.0 },
    { id: "dA10", xPct: 24, yPct: 76, size: "M", kind: "media", baseZ: 4, tiltBase: 1.5 },
    { id: "dA11", xPct: 82, yPct: 76, size: "M", kind: "note", baseZ: 3, tiltBase: -1.3 },
    { id: "dA12", xPct: 46, yPct: 75, size: "L", kind: "media", format: "wide", baseZ: 6, tiltBase: -1.4 },
    { id: "dA13", xPct: 34, yPct: 88, size: "M", kind: "media", baseZ: 5, tiltBase: 1.2 },
    { id: "dA14", xPct: 53, yPct: 88, size: "S", kind: "media", baseZ: 3, tiltBase: -1.1 },
  ],
  B: [
    { id: "dB1", xPct: 16, yPct: 24, size: "M", kind: "media", baseZ: 4, tiltBase: 1.6 },
    { id: "dB2", xPct: 34, yPct: 19, size: "S", kind: "media", baseZ: 3, tiltBase: -1.3 },
    { id: "dB3", xPct: 36, yPct: 43, size: "XL", kind: "media", format: "wide", baseZ: 7, tiltBase: -1.8 },
    { id: "dB4", xPct: 17, yPct: 58, size: "S", kind: "media", baseZ: 4, tiltBase: 1.1 },
    { id: "dB5", xPct: 49, yPct: 54, size: "M", kind: "media", baseZ: 5, tiltBase: 1.2 },
    { id: "dB6", xPct: 78, yPct: 22, size: "M", kind: "note", baseZ: 4, tiltBase: -1.1 },
    { id: "dB7", xPct: 90, yPct: 26, size: "S", kind: "note", baseZ: 3, tiltBase: 1.4 },
    { id: "dB8", xPct: 79, yPct: 40, size: "S", kind: "note", baseZ: 4, tiltBase: -1.2 },
    { id: "dB9", xPct: 91, yPct: 46, size: "M", kind: "note", baseZ: 4, tiltBase: 1.0 },
    { id: "dB10", xPct: 23, yPct: 80, size: "M", kind: "media", baseZ: 4, tiltBase: -1.2 },
    { id: "dB11", xPct: 44, yPct: 84, size: "S", kind: "media", baseZ: 3, tiltBase: 1.3 },
    { id: "dB12", xPct: 47, yPct: 76, size: "L", kind: "media", format: "wide", baseZ: 6, tiltBase: 1.4 },
    { id: "dB13", xPct: 80, yPct: 80, size: "M", kind: "note", baseZ: 5, tiltBase: -1.1 },
    { id: "dB14", xPct: 92, yPct: 84, size: "S", kind: "note", baseZ: 3, tiltBase: 1.2 },
  ],
  C: [
    { id: "dC1", xPct: 17, yPct: 21, size: "M", kind: "media", baseZ: 4, tiltBase: -1.4 },
    { id: "dC2", xPct: 36, yPct: 33, size: "XL", kind: "media", format: "wide", baseZ: 7, tiltBase: 1.7 },
    { id: "dC3", xPct: 14, yPct: 46, size: "S", kind: "media", baseZ: 3, tiltBase: 1.2 },
    { id: "dC4", xPct: 50, yPct: 21, size: "S", kind: "media", baseZ: 4, tiltBase: -1.0 },
    { id: "dC5", xPct: 44, yPct: 55, size: "M", kind: "media", baseZ: 5, tiltBase: -1.2 },
    { id: "dC6", xPct: 76, yPct: 20, size: "S", kind: "note", baseZ: 3, tiltBase: 1.3 },
    { id: "dC7", xPct: 89, yPct: 29, size: "M", kind: "note", baseZ: 4, tiltBase: -1.1 },
    { id: "dC8", xPct: 78, yPct: 43, size: "S", kind: "note", baseZ: 4, tiltBase: 1.1 },
    { id: "dC9", xPct: 91, yPct: 47, size: "S", kind: "note", baseZ: 3, tiltBase: -1.2 },
    { id: "dC10", xPct: 22, yPct: 78, size: "M", kind: "media", baseZ: 4, tiltBase: 1.4 },
    { id: "dC11", xPct: 40, yPct: 84, size: "S", kind: "media", baseZ: 3, tiltBase: -1.1 },
    { id: "dC12", xPct: 47, yPct: 73, size: "L", kind: "media", format: "wide", baseZ: 6, tiltBase: -1.5 },
    { id: "dC13", xPct: 80, yPct: 78, size: "M", kind: "note", baseZ: 5, tiltBase: 1.1 },
    { id: "dC14", xPct: 92, yPct: 84, size: "S", kind: "note", baseZ: 3, tiltBase: -1.0 },
  ],
};

const SLOT_MAPS_MOBILE = {
  A: [
    { id: "mA1", xPct: 28, yPct: 23, size: "M", kind: "media", baseZ: 4, tiltBase: -1.4 },
    { id: "mA2", xPct: 41, yPct: 38, size: "L", kind: "media", format: "wide", baseZ: 6, tiltBase: 1.5 },
    { id: "mA3", xPct: 80, yPct: 22, size: "S", kind: "note", baseZ: 3, tiltBase: -1.0 },
    { id: "mA4", xPct: 30, yPct: 60, size: "S", kind: "media", baseZ: 3, tiltBase: 1.1 },
    { id: "mA5", xPct: 80, yPct: 50, size: "M", kind: "note", baseZ: 4, tiltBase: -1.2 },
    { id: "mA6", xPct: 41, yPct: 82, size: "M", kind: "media", baseZ: 4, tiltBase: 1.0 },
    { id: "mA7", xPct: 79, yPct: 80, size: "S", kind: "note", baseZ: 3, tiltBase: -1.1 },
    { id: "mA8", xPct: 53, yPct: 92, size: "S", kind: "media", baseZ: 3, tiltBase: 1.2 },
  ],
  B: [
    { id: "mB1", xPct: 25, yPct: 21, size: "M", kind: "media", baseZ: 4, tiltBase: 1.3 },
    { id: "mB2", xPct: 40, yPct: 35, size: "L", kind: "media", format: "wide", baseZ: 6, tiltBase: -1.6 },
    { id: "mB3", xPct: 82, yPct: 23, size: "S", kind: "note", baseZ: 3, tiltBase: 1.0 },
    { id: "mB4", xPct: 29, yPct: 58, size: "S", kind: "media", baseZ: 3, tiltBase: -1.0 },
    { id: "mB5", xPct: 81, yPct: 50, size: "M", kind: "note", baseZ: 4, tiltBase: 1.1 },
    { id: "mB6", xPct: 42, yPct: 80, size: "M", kind: "media", baseZ: 4, tiltBase: -1.2 },
    { id: "mB7", xPct: 80, yPct: 79, size: "S", kind: "note", baseZ: 3, tiltBase: 1.2 },
    { id: "mB8", xPct: 54, yPct: 92, size: "S", kind: "media", baseZ: 3, tiltBase: -1.1 },
  ],
  C: [
    { id: "mC1", xPct: 26, yPct: 22, size: "M", kind: "media", baseZ: 4, tiltBase: -1.2 },
    { id: "mC2", xPct: 42, yPct: 34, size: "L", kind: "media", format: "wide", baseZ: 6, tiltBase: 1.4 },
    { id: "mC3", xPct: 81, yPct: 24, size: "S", kind: "note", baseZ: 3, tiltBase: -1.1 },
    { id: "mC4", xPct: 30, yPct: 57, size: "S", kind: "media", baseZ: 3, tiltBase: 1.0 },
    { id: "mC5", xPct: 79, yPct: 50, size: "M", kind: "note", baseZ: 4, tiltBase: -1.1 },
    { id: "mC6", xPct: 43, yPct: 79, size: "M", kind: "media", baseZ: 4, tiltBase: 1.1 },
    { id: "mC7", xPct: 80, yPct: 79, size: "S", kind: "note", baseZ: 3, tiltBase: -1.0 },
    { id: "mC8", xPct: 54, yPct: 92, size: "S", kind: "media", baseZ: 3, tiltBase: 1.2 },
  ],
};

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
    blurb: "University ... plot twist: not for classes.",
    longCaption: "We met at Wesleyan in Connecticut. Academics were present. Romance was louder.",
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
const STORY_ASSET_VERSION = "20260216-2135";
const STORY_FETCH_TIMEOUT_MS = 12000;
const STORY_LOADING_MESSAGE = "Loading Our Story…";
const STORY_TIMEOUT_MESSAGE = "Our Story is taking longer than usual.";
const STORY_ERROR_MESSAGE = "Our Story is temporarily unavailable.";
const STORY_DEFAULT_FOCAL_X = 0.5;
const STORY_DEFAULT_FOCAL_Y = 0.28;
const STORY_OVERRIDES = {
  // Upright files should remain upright.
  "2008-miki-moves-beijing-upright.jpg": { rotate: 0, objPos: "50% 44%" },
  "2020-covid-upright.jpg": { rotate: 0, objPos: "50% 25%" },
  "2024-proposal-upright.jpg": { rotate: 0, objPos: "50% 44%" },
  // Legacy names are also pinned upright to avoid accidental rotation regressions.
  "2008-miki-moves-beijing.jpg": { rotate: 0, objPos: "50% 44%" },
  "2008-miki-moves-beijing-v2.jpg": { rotate: 0, objPos: "50% 44%" },
  "2008 - Miki moves to China.JPG": { rotate: 0, objPos: "50% 44%" },
  "2020-covid.jpg": { rotate: 0, objPos: "50% 25%" },
  "2020-covid-v2.jpg": { rotate: 0, objPos: "50% 25%" },
  "2020-covid-from-heic.jpg": { rotate: 0, objPos: "50% 25%" },
  "2020 - COVID.HEIC": { rotate: 0, objPos: "50% 25%" },
  "2024-proposal.jpg": { rotate: 0, objPos: "50% 44%" },
  "2024-proposal-v2.jpg": { rotate: 0, objPos: "50% 44%" },
  "2024 - She said yes.JPG": { rotate: 0, objPos: "50% 44%" },
};
const STORY_YEAR_FOCAL_PRESETS = {
  1995: { focalX: 0.5, focalY: 0.42, cropMode: "cover" },
  1998: { focalX: 0.45, focalY: 0.46, cropMode: "cover" },
  2001: { focalX: 0.5, focalY: 0.48, cropMode: "cover" },
  2008: { focalX: 0.5, focalY: 0.44, cropMode: "cover" },
  2013: { focalX: 0.5, focalY: 0.26, cropMode: "cover" },
  2016: { focalX: 0.55, focalY: 0.44, cropMode: "cover" },
  2020: { focalX: 0.5, focalY: 0.25, cropMode: "cover" },
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

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function scrollToElement(target, options = {}) {
  if (!(target instanceof Element)) return;
  const allowMobile = options.allowMobile === true;
  if (!allowMobile && isMobileViewport()) return;

  target.scrollIntoView({
    behavior: options.behavior || getScrollBehavior(),
    block: options.block || "start",
    inline: options.inline || "nearest",
  });
}

function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    bodyScrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${bodyScrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }
  bodyScrollLockCount += 1;
}

function unlockBodyScroll() {
  if (bodyScrollLockCount <= 0) return;
  bodyScrollLockCount -= 1;
  if (bodyScrollLockCount > 0) return;

  document.body.classList.remove("modal-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, bodyScrollLockY);
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
  activeSectionId = String(sectionId || activeSectionId || "top");
  const currentPath = String(window.location.pathname || "").replace(/\/+$/, "") || "/";
  const isGuestWallRoute = currentPath === "/guest-wall";
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-link") === activeSectionId);
  });

  if (desktopMoreToggle) {
    const hasOverflowActive =
      activeSectionId === "guest-wall" || isGuestWallRoute || desktopMoreLinks.some((link) => link.getAttribute("data-link") === activeSectionId);
    desktopMoreToggle.classList.toggle("active", desktopMoreActiveOverride || hasOverflowActive);
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
  if (desktopMoreCloseTimer) {
    window.clearTimeout(desktopMoreCloseTimer);
    desktopMoreCloseTimer = null;
  }
  desktopMoreActiveOverride = false;
  setAriaExpanded(desktopMoreToggle, false);
  desktopMoreMenu.hidden = true;
  setActiveLink(activeSectionId);
}

function openDesktopMoreMenu() {
  if (!desktopMoreToggle || !desktopMoreMenu) return;
  if (desktopMoreCloseTimer) {
    window.clearTimeout(desktopMoreCloseTimer);
    desktopMoreCloseTimer = null;
  }
  desktopMoreActiveOverride = true;
  setAriaExpanded(desktopMoreToggle, true);
  desktopMoreMenu.hidden = false;
  setActiveLink(activeSectionId);
}

function scheduleDesktopMoreClose(delayMs = 160) {
  if (desktopMoreCloseTimer) window.clearTimeout(desktopMoreCloseTimer);
  desktopMoreCloseTimer = window.setTimeout(() => {
    desktopMoreCloseTimer = null;
    closeDesktopMoreMenu();
  }, delayMs);
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

    desktopNavMore.addEventListener("mouseenter", () => {
      openDesktopMoreMenu();
    });

    desktopNavMore.addEventListener("mouseleave", () => {
      scheduleDesktopMoreClose(160);
    });

    desktopNavMore.addEventListener("focusin", () => {
      openDesktopMoreMenu();
    });

    desktopNavMore.addEventListener("focusout", (event) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && desktopNavMore.contains(nextTarget)) return;
      scheduleDesktopMoreClose(120);
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

function syncJumpMenuVisibility() {
  if (!jumpMenuWrap) return;
  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
  const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const mobileProgressVisible = window.scrollY / scrollableHeight >= 0.25;
  const desktopThreshold = Math.max(240, window.innerHeight * 0.9);
  const visible = isMobileViewport ? mobileProgressVisible : window.scrollY > desktopThreshold;
  jumpMenuWrap.classList.toggle("is-visible", visible);
}

function initJumpMenu() {
  if (!jumpMenuWrap || !jumpWallButton) return;
  if (jumpMenuWrap.dataset.bound === "true") return;
  syncJumpMenuVisibility();

  jumpWallButton.addEventListener("click", (event) => {
    event.preventDefault();
    const guestWallSection = document.getElementById("guest-wall");
    if (guestWallSection) {
      scrollToElement(guestWallSection, { block: "start", allowMobile: true });
      return;
    }
    window.location.href = withBasePath("/guest-wall");
  });

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
    if (isMobileViewport()) {
      window.location.hash = `#${targetId}`;
      return;
    }
    scrollToElement(target, { block: "start" });
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

  const header = document.createElement("div");
  header.className = "makan-item-header";

  const names = document.createElement("div");
  names.className = "makan-name-stack";

  const nameEn = document.createElement("p");
  nameEn.className = "makan-name-en";
  nameEn.textContent = nameOnly;
  names.appendChild(nameEn);

  const nameZh = String(place.name_zh || place.name_cn || "").trim();
  const nameCn = document.createElement("p");
  nameCn.className = "makan-name-cn";
  nameCn.textContent = nameZh || "中文名待补充";
  names.appendChild(nameCn);

  const actions = document.createElement("div");
  actions.className = "makan-item-actions";
  const dianpingLink = createExternalAnchor(place.dianping_url || "#", "Open in 大众点评", "makan-link");
  if (!place.dianping_url) {
    dianpingLink.setAttribute("aria-disabled", "true");
    dianpingLink.classList.add("is-disabled");
    dianpingLink.addEventListener("click", (event) => event.preventDefault());
    dianpingLink.title = "Dianping link missing";
  }
  actions.appendChild(dianpingLink);

  const addressZh = String(place.address_zh || place.address_cn || "").trim();

  header.appendChild(names);
  header.appendChild(actions);

  const addressRow = document.createElement("div");
  addressRow.className = "makan-address-row";
  const addressText = document.createElement("p");
  addressText.className = "makan-address-text";
  addressText.textContent = addressZh || "地址待补充";
  addressRow.appendChild(addressText);

  const description = document.createElement("p");
  description.className = "makan-item-description";
  description.textContent = blurbText;

  meta.appendChild(header);
  meta.appendChild(addressRow);

  const panel = document.createElement("div");
  panel.className = "makan-item-panel";
  panel.appendChild(description);

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
      if (makanBulkToggle) return;
      updateMakanTypeControls();
    });
  });

  updateMakanTypeControls();
}

function validateMakanPlacesData() {
  const issues = [];
  BEIJING_FOOD_PLACES.forEach((place) => {
    const id = String(place.id || "").trim() || "(missing-id)";
    if (!String(place.name_zh || place.name_cn || "").trim()) issues.push(`${id}: missing name_zh`);
    if (!String(place.address_zh || place.address_cn || "").trim()) issues.push(`${id}: missing address_zh`);
    if (!String(place.maps_url || "").trim()) issues.push(`${id}: missing maps_url`);
  });
  if (!issues.length) return;
  console.error("[makan:data-validation]", issues);
  if (IS_LOCAL_DEV) {
    throw new Error(`Makan data validation failed:\\n${issues.join("\\n")}`);
  }
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
  if (makanLegalWrapper) makanLegalWrapper.dataset.open = "false";
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
  if (makanLegalWrapper) makanLegalWrapper.dataset.open = "true";
  setAriaExpanded(makanLegalTrigger, true);
  makanLegalOpen = true;
  if (makanLegalClose instanceof HTMLElement) {
    window.requestAnimationFrame(() => makanLegalClose.focus({ preventScroll: true }));
  }
}

function initMakanLegalModal() {
  if (!makanLegalTrigger || !makanLegalPopover) return;
  if (makanLegalTrigger.dataset.boundLegal === "true") return;

  if (makanLegalWrapper) makanLegalWrapper.dataset.open = "false";
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
  validateMakanPlacesData();
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

function isHotelMatrixMobile() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function getHotelById(hotelId) {
  if (!hotelId) return null;
  return hotelMatrixItems.find((item) => item.id === hotelId) || null;
}

function getActiveHotelMatrixId() {
  return hotelMatrixPinnedId || "";
}

function setHotelMethodAriaExpanded(expanded) {
  if (hotelMethodTrigger) setAriaExpanded(hotelMethodTrigger, expanded);
  if (hotelMethodTriggerMobile) setAriaExpanded(hotelMethodTriggerMobile, expanded);
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
  if (!hotelMethodTooltip) return;
  if (hotelMethodCloseTimer) {
    window.clearTimeout(hotelMethodCloseTimer);
    hotelMethodCloseTimer = null;
  }
  setA11yHidden(hotelMethodTooltip, true);
  hotelMethodOpen = false;
  if (resetPinned) hotelMethodPinned = false;
  if (!hotelMethodSheetOpen) setHotelMethodAriaExpanded(false);
}

function openHotelMethodologyTooltip({ pinned = false } = {}) {
  if (!hotelMethodTrigger || isHotelMatrixMobile()) return;
  ensureHotelMethodOverlay();
  if (!hotelMethodTooltip) return;
  hotelMethodPinned = pinned;
  setA11yHidden(hotelMethodTooltip, false);
  setHotelMethodAriaExpanded(true);
  hotelMethodOpen = true;
  positionHotelMethodTooltip();
}

function resetHotelMethodSheetPanelPosition() {
  if (!hotelMethodSheetPanel) return;
  hotelMethodSheetPanel.style.transition = "transform 220ms ease";
  hotelMethodSheetPanel.style.transform = "translateY(0px)";
}

function closeHotelMethodSheet({ focusTrigger = false } = {}) {
  if (!hotelMethodSheet) return;
  hotelMethodSheet.hidden = true;
  hotelMethodSheetOpen = false;
  hotelMethodSheetSwipeActive = false;
  hotelMethodSheetDeltaY = 0;
  resetHotelMethodSheetPanelPosition();
  if (!hotelMethodOpen) setHotelMethodAriaExpanded(false);
  if (focusTrigger && hotelMethodTriggerMobile && isHotelMatrixMobile()) {
    hotelMethodTriggerMobile.focus({ preventScroll: true });
  }
}

function openHotelMethodSheet() {
  if (!hotelMethodSheet || !isHotelMatrixMobile()) return;
  closeHotelMethodologyTooltip();
  hotelMethodSheet.hidden = false;
  hotelMethodSheetOpen = true;
  hotelMethodSheetSwipeActive = false;
  hotelMethodSheetDeltaY = 0;
  resetHotelMethodSheetPanelPosition();
  setHotelMethodAriaExpanded(true);
}

function initHotelMethodology() {
  if (!hotelMethodTrigger && !hotelMethodTriggerMobile) return;
  if ((hotelMethodTrigger && hotelMethodTrigger.dataset.bound === "true") || (hotelMethodTriggerMobile && hotelMethodTriggerMobile.dataset.bound === "true")) return;
  ensureHotelMethodOverlay();
  if (!hotelMethodTooltip) return;

  closeHotelMethodologyTooltip();

  const openIfDesktop = () => {
    if (isHotelMatrixMobile()) return;
    if (hotelMethodPinned) return;
    openHotelMethodologyTooltip({ pinned: false });
  };

  const closeIfDesktop = () => {
    if (isHotelMatrixMobile()) return;
    if (hotelMethodPinned) return;
    if (hotelMethodCloseTimer) window.clearTimeout(hotelMethodCloseTimer);
    hotelMethodCloseTimer = window.setTimeout(() => {
      closeHotelMethodologyTooltip();
      hotelMethodCloseTimer = null;
    }, 90);
  };

  if (hotelMethodTrigger) {
    hotelMethodTrigger.addEventListener("pointerenter", openIfDesktop);
    hotelMethodTrigger.addEventListener("pointerleave", (event) => {
      const related = event.relatedTarget;
      if (related instanceof Node && hotelMethodTooltip.contains(related)) return;
      closeIfDesktop();
    });
  }
  hotelMethodTooltip.addEventListener("pointerenter", openIfDesktop);
  hotelMethodTooltip.addEventListener("pointerleave", (event) => {
    const related = event.relatedTarget;
    if (related instanceof Node && hotelMethodTrigger && hotelMethodTrigger.contains(related)) return;
    closeIfDesktop();
  });
  if (hotelMethodTrigger) {
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
      if (isHotelMatrixMobile()) {
        if (hotelMethodSheetOpen) closeHotelMethodSheet();
        else openHotelMethodSheet();
        return;
      }
      if (hotelMethodOpen && hotelMethodPinned) closeHotelMethodologyTooltip();
      else openHotelMethodologyTooltip({ pinned: true });
    });
  }

  if (hotelMethodTriggerMobile) {
    hotelMethodTriggerMobile.addEventListener("click", (event) => {
      event.preventDefault();
      if (hotelMethodSheetOpen) closeHotelMethodSheet({ focusTrigger: true });
      else openHotelMethodSheet();
    });
  }

  hotelMethodSheetCloseControls.forEach((control) => {
    control.addEventListener("click", () => closeHotelMethodSheet({ focusTrigger: true }));
  });

  if (hotelMethodSheetPanel) {
    hotelMethodSheetPanel.addEventListener("pointerdown", (event) => {
      if (!isHotelMatrixMobile() || !hotelMethodSheetOpen) return;
      hotelMethodSheetSwipeActive = true;
      hotelMethodSheetStartY = event.clientY;
      hotelMethodSheetDeltaY = 0;
      hotelMethodSheetPanel.style.transition = "none";
    });

    hotelMethodSheetPanel.addEventListener("pointermove", (event) => {
      if (!hotelMethodSheetSwipeActive || !hotelMethodSheetOpen) return;
      hotelMethodSheetDeltaY = Math.max(0, event.clientY - hotelMethodSheetStartY);
      hotelMethodSheetPanel.style.transform = `translateY(${Math.min(180, hotelMethodSheetDeltaY)}px)`;
    });

    const finishSheetSwipe = () => {
      if (!hotelMethodSheetSwipeActive) return;
      hotelMethodSheetSwipeActive = false;
      if (hotelMethodSheetDeltaY > 90) {
        closeHotelMethodSheet({ focusTrigger: false });
        return;
      }
      resetHotelMethodSheetPanelPosition();
    };
    hotelMethodSheetPanel.addEventListener("pointerup", finishSheetSwipe);
    hotelMethodSheetPanel.addEventListener("pointercancel", finishSheetSwipe);
    hotelMethodSheetPanel.addEventListener("pointerleave", finishSheetSwipe);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && hotelMethodSheetOpen) closeHotelMethodSheet();
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
      if (hotelMethodTooltip.contains(target) || (hotelMethodTrigger && hotelMethodTrigger.contains(target))) return;
      closeHotelMethodologyTooltip();
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (hotelMethodSheetOpen && !isHotelMatrixMobile()) closeHotelMethodSheet();
    if (hotelMethodOpen) positionHotelMethodTooltip();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (hotelMethodOpen) positionHotelMethodTooltip();
    },
    { passive: true },
  );

  if (hotelMethodTrigger) hotelMethodTrigger.dataset.bound = "true";
  if (hotelMethodTriggerMobile) hotelMethodTriggerMobile.dataset.bound = "true";
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
  const wasOpen = hotelSheetOpen;
  hotelMatrixSheet.hidden = false;
  hotelMatrixSheetContent.replaceChildren(buildHotelDetailsCard(item));
  hotelMatrixSheet.scrollTop = 0;
  hotelMatrixSheetContent.scrollTop = 0;
  if (hotelMatrixSheetPanel) hotelMatrixSheetPanel.scrollTop = 0;
  hotelSheetOpen = true;
  if (!wasOpen) lockBodyScroll();
  if (hotelMatrixSheetClose) hotelMatrixSheetClose.focus({ preventScroll: true });
}

function closeHotelMatrixSheet() {
  if (!hotelMatrixSheet || !hotelSheetOpen) return;
  hotelMatrixSheet.hidden = true;
  hotelSheetOpen = false;
  unlockBodyScroll();
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
  const compact = window.matchMedia("(max-width: 640px)").matches || width < 560;
  const aspect = compact ? 16 / 10 : 760 / 460;
  const height = compact ? Math.max(300, Math.round(width / aspect)) : Math.max(280, Math.round(width / aspect));
  return { width, height };
}

function renderHotelMatrix() {
  if (!hotelMatrixSvg || !hotelMatrixItems.length) return;

  const width = hotelMatrixWidth;
  const height = hotelMatrixHeight;
  const hasSelection = Boolean(hotelMatrixPinnedId) && !isHotelMatrixMobile();
  const isCompact = window.matchMedia("(max-width: 640px)").matches || width < 560;
  const margins = isCompact
    ? { top: 20, right: 10, bottom: 68, left: hasSelection ? 74 : 66 }
    : { top: hasSelection ? 50 : 42, right: 56, bottom: hasSelection ? 116 : 104, left: hasSelection ? 146 : 122 };
  const plotWidth = Math.max(180, width - margins.left - margins.right);
  const plotHeight = Math.max(170, height - margins.top - margins.bottom);
  const ringRadius = isCompact ? 8.2 : 12;
  const dotRadius = isCompact ? 4.8 : 7.4;

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
  const driveTicksRaw = [...new Set(driveTimes.map((value) => Math.round(value)))].sort((a, b) => a - b);
  let driveTicks = driveTicksRaw;
  if (isCompact && driveTicksRaw.length > 3) {
    const midIndex = Math.floor((driveTicksRaw.length - 1) / 2);
    driveTicks = [...new Set([driveTicksRaw[0], driveTicksRaw[midIndex], driveTicksRaw[driveTicksRaw.length - 1]])];
  }

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
      class: isCompact ? "hotel-map-tick hotel-map-tick--compact" : "hotel-map-tick",
      x,
      y: margins.top + plotHeight + (isCompact ? 22 : 31),
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
      class: isCompact ? "hotel-map-tick hotel-map-tick--compact" : "hotel-map-tick",
      x: margins.left - (isCompact ? 14 : 26),
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
    y: height - (isCompact ? 12 : 12),
    "text-anchor": "middle",
  });
  xAxisLabel.textContent = isCompact ? "Price" : "Price ($ to $$$$)";
  hotelMatrixSvg.appendChild(xAxisLabel);

  const yAxisLabelX = isCompact ? (hasSelection ? 30 : 24) : hasSelection ? 38 : 28;
  const yAxisLabel = createSvgNode("text", {
    class: axisLabelClass,
    x: yAxisLabelX,
    y: margins.top + plotHeight / 2,
    "text-anchor": "middle",
    transform: `rotate(-90 ${yAxisLabelX} ${margins.top + plotHeight / 2})`,
  });
  yAxisLabel.textContent = isCompact ? "Drive time to venue (min)" : hasSelection ? "Drive time to venue (mins)" : "Drive time to wedding venue (mins)";
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
      if (hotelMethodSheetOpen) closeHotelMethodSheet();

      if (isHotelMatrixMobile()) {
        if (hotelMatrixPinnedId) openHotelMatrixSheet(item);
        else closeHotelMatrixSheet();
      } else {
        closeHotelMatrixSheet();
      }
    };

    group.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") return;
      hotelTouchSelectionLockUntil = Date.now() + 700;
      handleSelect(event);
    });
    group.addEventListener("click", (event) => {
      if (Date.now() < hotelTouchSelectionLockUntil) return;
      handleSelect(event);
    });
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

  // Defensive reset: never leave a transparent sheet/backdrop intercepting taps.
  closeHotelMatrixSheet();
  hotelSheetOpen = false;

  hotelMatrixItems = HOTELS_DATA.slice(0, 6);
  if (!hotelMatrixItems.length) return;

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
  setHiddenClass(guestLimitError, true);
}

function showGuestLimitError(message) {
  if (!guestLimitError) return;
  guestLimitError.textContent = message;
  setHiddenClass(guestLimitError, false);
}

function pickRandomFunFactExamples(limit = FUN_FACT_CHIP_COUNT) {
  const seen = new Set();
  const pool = FUN_FACT_EXAMPLES.filter((item) => {
    const normalized = normalizeFunFactPoolKey(item);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(limit, pool.length));
}

function getFunFactLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function addFunFactLine(current, fact, maxLines = 3) {
  const lines = getFunFactLines(current);
  const factText = String(fact || "").trim();
  if (!factText) return lines.join("\n");

  const exists = lines.some((line) => normalizeFunFactPoolKey(line) === normalizeFunFactPoolKey(factText));
  if (exists) return lines.join("\n");

  return [...lines, factText].slice(0, Math.max(1, maxLines)).join("\n");
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
  const lineCounter = document.createElement("p");
  lineCounter.className = "field-helper fun-fact-line-counter";

  const usedExamples = new Set();
  let displayedExamples = pickRandomFunFactExamples();

  function updateLineCounter() {
    lineCounter.textContent = `${Math.min(getFunFactLines(input.value).length, 3)} / 3 lines`;
  }

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
    input.value = addFunFactLine(input.value, example, 3);
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
  input.addEventListener("input", updateLineCounter);

  controls.appendChild(toggle);
  controls.appendChild(shuffle);
  wrap.appendChild(controls);
  wrap.appendChild(chipsWrap);
  wrap.appendChild(lineCounter);
  updateLineCounter();
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
  factInput.placeholder =
    "Example (add 2–3):\n• I’m a +1 and accepting friend applications.\n• My karaoke song is painfully predictable.\n• I came for the wedding, stayed for the dumplings.";
  factInput.value = funFact;
  factInput.dataset.guestFunFact = "true";

  factField.appendChild(factLabel);
  factField.appendChild(factInput);
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

function getSubmitButtonLabel(choiceInput) {
  const choice = String(choiceInput || "");
  if (choice === "yes") return "Confirm attendance";
  if (choice === "working") return "Add me to the list";
  return "Send reply";
}

function updateSubmitButtonLabel() {
  if (!submitButton || rsvpIsSubmitting) return;
  const nextLabel = getSubmitButtonLabel(attendanceChoice ? attendanceChoice.value : "");
  submitButton.textContent = nextLabel;
}

function setRsvpSubmittingState(isSubmitting) {
  const active = Boolean(isSubmitting);
  rsvpIsSubmitting = active;
  if (!submitButton) return;

  submitButton.disabled = active;
  submitButton.setAttribute("aria-disabled", String(active));
  submitButton.setAttribute("aria-busy", active ? "true" : "false");
  submitButton.classList.toggle("is-loading", active);
  submitButton.textContent = active ? "Submitting…" : getSubmitButtonLabel(attendanceChoice ? attendanceChoice.value : "");

  if (rsvpSubmitHelper) setHiddenClass(rsvpSubmitHelper, !active);
  resetRsvpSlowSubmitJoke();
  if (!active) return;

  rsvpSlowSubmitTimer = window.setTimeout(() => {
    if (!rsvpIsSubmitting || !rsvpSubmitSlowHelper) return;
    setHiddenClass(rsvpSubmitSlowHelper, false);
  }, RSVP_SLOW_SUBMIT_DELAY_MS);
}

function setRsvpSubmittedState() {
  if (!submitButton) return;
  rsvpIsSubmitting = false;
  resetRsvpSlowSubmitJoke();
  submitButton.classList.remove("is-loading");
  submitButton.disabled = true;
  submitButton.setAttribute("aria-disabled", "true");
  submitButton.setAttribute("aria-busy", "false");
  submitButton.textContent = "Submitted ✓";
  if (rsvpSubmitHelper) setHiddenClass(rsvpSubmitHelper, true);
}

function clearRsvpChoice() {
  if (!attendanceChoice || !rsvpFields || !submitButton || !yesFields || !workingFields || !noFields || !youFunFactsFields) return;

  if (rsvpForm) rsvpForm.reset();
  if (rsvpForm) setHiddenClass(rsvpForm, false);
  if (rsvpPanel) rsvpPanel.classList.remove("is-success");

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
  setRsvpSubmittingState(false);

  if (fullNameInput && inviteState.greetingName) {
    fullNameInput.value = inviteState.greetingName;
  }

  hideRsvpConfirmation();
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
  }

  if (choice === "working") {
    updateAddGuestButtonState();
    hideGuestLimitError();
  }

  if (choice === "no") {
    updateAddGuestButtonState();
    hideGuestLimitError();
  }

  updateSubmitButtonLabel();
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
    viewportWidth: window.innerWidth || 0,
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
  formData.append("viewportWidth", String(payload.viewportWidth || 0));

  selectedUploadFiles.forEach((file, index) => {
    if (!file) return;
    formData.append(`photo${index + 1}`, file, file.name);
  });

  return formData;
}

function resolveRsvpApiUrl() {
  if (IS_LOCAL_DEV) return withBasePath("/api/rsvp");
  const host = String(window.location.hostname || "").toLowerCase();
  if (host === "www.mikiandyijie.com" || host === "mikiandyijie.com" || host === "ygnawk.github.io") {
    return `${RSVP_API_ORIGIN}/api/rsvp`;
  }
  return withBasePath("/api/rsvp");
}

async function submitToRsvpApi(payload) {
  const response = await fetch(resolveRsvpApiUrl(), {
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

function getRsvpChoiceSummary(choice) {
  const normalized = String(choice || "").toLowerCase();
  if (normalized === "yes") return "Yes — count us in";
  if (normalized === "working") return "Maybe — need a month";
  if (normalized === "no") return "No — can’t make it";
  return "Not selected";
}

function hideRsvpConfirmation() {
  if (!rsvpConfirmation) return;
  setHiddenClass(rsvpConfirmation, true);
  rsvpConfirmation.classList.remove("confirmation--success");
  rsvpConfirmation.innerHTML = "";
  if (rsvpPanel) rsvpPanel.classList.remove("is-success");
}

function showRsvpConfirmation(message, options = {}) {
  if (!rsvpConfirmation) return;
  const includeGuestWallLink = options.includeGuestWallLink === true;
  const variant = String(options.variant || "").toLowerCase();
  rsvpConfirmation.innerHTML = "";

  if (variant === "success") {
    rsvpConfirmation.classList.add("confirmation--success");
    if (rsvpPanel) rsvpPanel.classList.add("is-success");

    const titleRow = document.createElement("div");
    titleRow.className = "confirmation-title-row";

    const badge = document.createElement("div");
    badge.className = "confirmation-success-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "✓";
    titleRow.appendChild(badge);

    const title = document.createElement("h3");
    title.className = "confirmation-title";
    title.textContent = "RSVP received — thank you!";
    titleRow.appendChild(title);

    rsvpConfirmation.appendChild(titleRow);

    const selection = document.createElement("p");
    selection.className = "confirmation-selection";
    selection.textContent = `Your response: ${getRsvpChoiceSummary(options.selectedChoice)}`;
    rsvpConfirmation.appendChild(selection);

    const subtitle = document.createElement("p");
    subtitle.className = "confirmation-subtitle";
    subtitle.textContent = "If you added a note or photo, we’ll share it on the Guest Wall shortly.";
    rsvpConfirmation.appendChild(subtitle);

    const actions = document.createElement("div");
    actions.className = "confirmation-actions";

    const guestWallLink = document.createElement("a");
    guestWallLink.className = "btn btn-maroon confirmation-guestwall-link";
    guestWallLink.href = "/guest-wall";
    guestWallLink.textContent = "View Guest Wall 👀";
    actions.appendChild(guestWallLink);

    rsvpConfirmation.appendChild(actions);
  } else {
    rsvpConfirmation.classList.remove("confirmation--success");
    if (rsvpPanel) rsvpPanel.classList.remove("is-success");

    const copy = document.createElement("p");
    copy.className = "confirmation-copy";
    copy.textContent = String(message || "");
    rsvpConfirmation.appendChild(copy);

    if (includeGuestWallLink) {
      const actions = document.createElement("div");
      actions.className = "confirmation-actions";

      const guestWallLink = document.createElement("a");
      guestWallLink.className = "btn btn-maroon confirmation-guestwall-link";
      guestWallLink.href = "/guest-wall";
      guestWallLink.textContent = "View Guest Wall 👀";
      actions.appendChild(guestWallLink);

      rsvpConfirmation.appendChild(actions);
    }
  }

  setHiddenClass(rsvpConfirmation, false);
}

function initRsvpForm() {
  if (!rsvpForm || !attendanceChoice || !rsvpConfirmation) return;
  setHiddenClass(rsvpForm, false);
  if (rsvpSubmitHelper) setHiddenClass(rsvpSubmitHelper, true);
  resetRsvpSlowSubmitJoke();
  updateSubmitButtonLabel();

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (rsvpIsSubmitting) return;

    if (!attendanceChoice.value) {
      showRsvpConfirmation("Please select one RSVP option first.");
      return;
    }

    if (!rsvpForm.reportValidity()) return;

    if (attendanceChoice.value === "yes") {
      ensurePrimaryGuestCard();
      if (!validateGuestCards()) {
        showRsvpConfirmation("Please enter all guest names.");
        return;
      }
    }

    if (!validateUploadSlots()) {
      showRsvpConfirmation("Please fix the photo upload errors before submitting.");
      return;
    }

    const payload = buildPayload();
    let submissionSucceeded = false;
    hideRsvpConfirmation();
    setRsvpSubmittingState(true);

    try {
      const result = await submitRSVP(payload);
      if (!result || result.ok !== true) {
        showRsvpConfirmation(result && result.error ? result.error : "We couldn’t submit your RSVP right now. Please try again in a moment.");
        return;
      }

      submissionSucceeded = true;
      setRsvpSubmittedState();

      const baseMessage = confirmationMessage(attendanceChoice.value);
      showRsvpConfirmation(result.warning ? `${baseMessage} ${result.warning}` : "", {
        includeGuestWallLink: true,
        variant: "success",
        selectedChoice: attendanceChoice.value,
      });
      setHiddenClass(rsvpForm, true);
    } finally {
      if (!submissionSucceeded) {
        setRsvpSubmittingState(false);
      }
    }
  });
}

function isGuestWallMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function shuffleItems(items) {
  const list = Array.isArray(items) ? [...items] : [];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function chooseRandomIndices(total, count) {
  const indices = Array.from({ length: Math.max(0, total) }, (_, index) => index);
  return shuffleItems(indices).slice(0, Math.max(0, count));
}

function randomIntInclusive(min, max) {
  const floorMin = Math.floor(min);
  const floorMax = Math.floor(max);
  if (floorMax <= floorMin) return floorMin;
  return floorMin + Math.floor(Math.random() * (floorMax - floorMin + 1));
}

function setGuestWallLoadState(nextState) {
  guestWallLoadState = String(nextState || "idle");
  if (guestWallPinboardView instanceof HTMLElement) {
    guestWallPinboardView.dataset.loadState = guestWallLoadState;
  }
}

function clearGuestWallSlowMessageTimers() {
  if (guestWallSlowMessageStartTimer) {
    window.clearTimeout(guestWallSlowMessageStartTimer);
    guestWallSlowMessageStartTimer = null;
  }
  if (guestWallSlowMessageRotateTimer) {
    window.clearTimeout(guestWallSlowMessageRotateTimer);
    guestWallSlowMessageRotateTimer = null;
  }
  guestWallSlowMessageIndex = 0;
}

function startGuestWallSlowMessageRotation() {
  clearGuestWallSlowMessageTimers();
  guestWallSlowMessageStartTimer = window.setTimeout(() => {
    const rotateMessage = () => {
      if (guestWallLoadState !== "loading") return;
      const nextMessage = GUEST_WALL_SLOW_MESSAGES[guestWallSlowMessageIndex % GUEST_WALL_SLOW_MESSAGES.length];
      setGuestWallStatus(`${GUEST_WALL_LOADING_MESSAGE} ${nextMessage}`);
      guestWallSlowMessageIndex += 1;
      guestWallSlowMessageRotateTimer = window.setTimeout(rotateMessage, GUEST_WALL_SLOW_MESSAGE_ROTATE_MS);
    };
    rotateMessage();
  }, GUEST_WALL_SLOW_MESSAGE_DELAY_MS);
}

function classifyGuestWallError(error) {
  const status = Number(error?.status || 0);
  if (error?.isTimeout || status === 408) {
    return {
      state: "timeout",
      statusMessage: "Still loading longer than expected. Please try again.",
      panelMessage: "Still loading longer than expected. Please try again.",
      reason: "timeout",
    };
  }
  if (status === 401 || status === 403) {
    return {
      state: "error",
      statusMessage: "Guest Wall is temporarily unavailable (permission issue).",
      panelMessage: "Guest Wall is temporarily unavailable (permission issue). Please try again later.",
      reason: "permission",
    };
  }
  if (status === 404) {
    return {
      state: "error",
      statusMessage: "Guest Wall source link looks broken right now.",
      panelMessage: "Guest Wall source link looks broken right now. Please try again shortly.",
      reason: "not_found",
    };
  }
  if (status === 429) {
    return {
      state: "error",
      statusMessage: "Guest Wall is rate-limited right now. Please retry in a moment.",
      panelMessage: "Guest Wall is rate-limited right now. Please retry in a moment.",
      reason: "rate_limited",
    };
  }
  if (status >= 500) {
    return {
      state: "error",
      statusMessage: "Guest Wall is temporarily unavailable (server issue).",
      panelMessage: "Guest Wall is temporarily unavailable (server issue). Please retry.",
      reason: "upstream",
    };
  }
  return {
    state: "error",
    statusMessage: GUEST_WALL_UNAVAILABLE_MESSAGE,
    panelMessage: GUEST_WALL_UNAVAILABLE_MESSAGE,
    reason: "unknown",
  };
}

function resolveGuestbookApiUrl(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const suffix = search.toString() ? `?${search.toString()}` : "";

  if (IS_LOCAL_DEV) return `${withBasePath("/api/guestbook")}${suffix}`;
  const host = String(window.location.hostname || "").toLowerCase();
  if (host === "www.mikiandyijie.com" || host === "mikiandyijie.com" || host === "ygnawk.github.io") {
    return `${RSVP_API_ORIGIN}/api/guestbook${suffix}`;
  }
  return `${withBasePath("/api/guestbook")}${suffix}`;
}

async function fetchGuestbookPage({
  mode = "pinboard",
  limit = GUEST_WALL_PINBOARD_LIMIT,
  refresh = false,
  cursor = "",
} = {}) {
  const startedAt = performance.now();
  const apiUrl = resolveGuestbookApiUrl({
    mode,
    limit,
    refresh: refresh ? "1" : "",
    cursor,
  });
  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(() => {
    controller.abort("guestwall-timeout");
  }, GUEST_WALL_HARD_TIMEOUT_MS);
  let response = null;
  let text = "";

  if (IS_LOCAL_DEV) {
    console.info(`[guestwall][request] endpoint=GET /api/guestbook url=${apiUrl}`);
  }

  try {
    response = await fetch(apiUrl, { cache: "default", signal: controller.signal });
    text = await response.text();
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    const isTimeout =
      String(error?.name || "") === "AbortError" || String(error?.message || "").includes("guestwall-timeout");
    const wrappedError = new Error(isTimeout ? "Guest wall request timed out." : GUEST_WALL_UNAVAILABLE_MESSAGE);
    wrappedError.url = apiUrl;
    wrappedError.status = isTimeout ? 408 : 0;
    wrappedError.code = isTimeout ? "timeout" : "network";
    wrappedError.durationMs = durationMs;
    wrappedError.responseBytes = 0;
    wrappedError.itemCount = 0;
    wrappedError.isTimeout = isTimeout;
    if (IS_LOCAL_DEV) {
      console.error(
        `[guestwall][fetch] endpoint=GET /api/guestbook status=${wrappedError.status} durationMs=${durationMs} bytes=0 items=0 error=${wrappedError.code}`,
      );
    }
    throw wrappedError;
  } finally {
    window.clearTimeout(timeoutHandle);
  }

  let data = null;
  const responseBytes = new TextEncoder().encode(text).length;
  const durationMs = Math.round(performance.now() - startedAt);

  try {
    data = text ? JSON.parse(text) : null;
  } catch (_error) {
    data = null;
  }

  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data?.items)
      ? data.data.items
      : Array.isArray(data?.results)
        ? data.results
        : null;

  if (IS_LOCAL_DEV) {
    console.info(
      `[guestwall][fetch] endpoint=GET /api/guestbook status=${response.status} durationMs=${durationMs} bytes=${responseBytes} items=${Array.isArray(items) ? items.length : "invalid"}`,
    );
  }

  if (!response.ok || !data || data.ok !== true || !Array.isArray(items)) {
    const error = new Error(GUEST_WALL_UNAVAILABLE_MESSAGE);
    error.url = apiUrl;
    error.status = response.status;
    error.durationMs = durationMs;
    error.responseBytes = responseBytes;
    error.itemCount = Array.isArray(items) ? items.length : 0;
    error.isTimeout = false;
    error.responseBody = text.slice(0, 500);
    if (data && data.error) error.cause = String(data.error);
    throw error;
  }

  return {
    ...data,
    items,
    total: Number.isFinite(Number(data.total)) ? Number(data.total) : items.length,
    nextCursor: String(data.nextCursor || "").trim() || null,
  };
}

function normalizeGuestWallLegacyEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const submissionId = String(entry.submission_id || entry.submissionId || "").trim();
  if (!submissionId) return null;

  const mediaRaw = Array.isArray(entry.media) ? entry.media : Array.isArray(entry.media_items) ? entry.media_items : [];
  const media = mediaRaw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const fileType = String(item.file_type || item.type || "").toLowerCase() === "video" ? "video" : "image";
      const fileId = String(item.file_id || item.fileId || "").trim();
      const driveViewUrl = String(item.view_url || item.drive_view_url || item.url || "").trim();
      const thumbnailUrl =
        String(item.thumbnail_url || item.thumbnailUrl || "").trim() || (fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w1600` : "");

      if (fileType === "image" && !thumbnailUrl && !driveViewUrl) return null;
      if (fileType === "video" && !driveViewUrl) return null;

      return {
        id: `${submissionId}:media:${index + 1}`,
        file_id: fileId,
        fileName: String(item.file_name || "").trim(),
        mimeType: String(item.mime_type || "").trim(),
        fileType,
        url: thumbnailUrl || driveViewUrl,
        thumbnailUrl,
        driveViewUrl,
        viewUrl: driveViewUrl,
      };
    })
    .filter(Boolean);

  return {
    submissionId,
    name: String(entry.name || entry.full_name || "").trim() || "Guest",
    message: String(entry.message || entry.message_to_couple || "").trim(),
    primaryFunFacts: String(entry.primary_fun_facts || "").trim(),
    submittedAt: String(entry.submitted_at || entry.submittedAt || "").trim(),
    media,
  };
}

function normalizeGuestWallCardFromApi(item) {
  if (!item || typeof item !== "object") return null;

  const id = String(item.id || "").trim();
  if (!id) return null;

  const type = String(item.type || "").toLowerCase() === "note" ? "note" : "media";
  const name = String(item.name || "").trim() || "Guest";
  const submittedAt = String(item.submitted_at || item.submittedAt || "").trim();
  const message = String(item.message || "").trim();

  if (type === "note") {
    if (!message) return null;
    return {
      id,
      kind: "note",
      submissionId: id.split(":")[0],
      name,
      submittedAt,
      text: message,
    };
  }

  const media = item.media && typeof item.media === "object" ? item.media : {};
  const mediaKind = String(media.kind || media.file_type || "").toLowerCase() === "video" ? "video" : "image";
  const thumbnailUrl = String(media.thumbUrl || media.thumbnailUrl || media.thumbnail_url || media.url || "").trim();
  const viewUrl = String(media.viewUrl || media.driveViewUrl || media.drive_view_url || "").trim();
  const fileId = String(media.file_id || media.fileId || "").trim();

  if (mediaKind === "image" && !thumbnailUrl && !viewUrl && !fileId) return null;
  if (mediaKind === "video" && !viewUrl) return null;

  return {
    id,
    kind: "media",
    submissionId: id.split(":")[0],
    name,
    submittedAt,
    message,
    media: {
      fileType: mediaKind,
      file_id: fileId,
      url: thumbnailUrl || viewUrl || "",
      thumbnailUrl,
      driveViewUrl: viewUrl,
      viewUrl,
    },
  };
}

function buildGuestWallImageCandidates(mediaItem, size = "w720") {
  if (!mediaItem || typeof mediaItem !== "object") return [];
  const fileId = String(mediaItem.file_id || mediaItem.fileId || "").trim();
  const directUrl = String(mediaItem.thumbnailUrl || mediaItem.url || "").trim();
  const driveThumbnailUrl = String(mediaItem.thumbnail_url || "").trim();

  const candidates = [];
  const addCandidate = (value) => {
    const url = String(value || "").trim();
    if (!url) return;
    if (!/^https:\/\//i.test(url)) return;
    if (candidates.includes(url)) return;
    candidates.push(url);
  };

  addCandidate(directUrl);
  addCandidate(driveThumbnailUrl);

  if (fileId) {
    addCandidate(`https://lh3.googleusercontent.com/d/${fileId}=${size}`);
    addCandidate(`https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`);
  }
  return candidates;
}

function buildGuestWallCardsFromLegacyEntries(entries) {
  const cards = [];

  (entries || []).forEach((entry) => {
    if (!entry) return;

    entry.media.forEach((mediaItem, mediaIndex) => {
      cards.push({
        id: `${entry.submissionId}:media:${mediaIndex + 1}`,
        kind: "media",
        submissionId: entry.submissionId,
        name: entry.name,
        submittedAt: entry.submittedAt,
        message: entry.message,
        media: mediaItem,
      });
    });

    if (entry.message) {
      cards.push({
        id: `${entry.submissionId}:note`,
        kind: "note",
        submissionId: entry.submissionId,
        name: entry.name,
        submittedAt: entry.submittedAt,
        text: entry.message,
      });
    } else if (entry.primaryFunFacts) {
      cards.push({
        id: `${entry.submissionId}:fun-facts`,
        kind: "note",
        submissionId: entry.submissionId,
        name: entry.name,
        submittedAt: entry.submittedAt,
        text: `Fun fact: ${entry.primaryFunFacts}`,
      });
    }
  });

  return cards;
}

function normalizeGuestWallCards(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  if (!items.length) return [];

  const first = items[0];
  let cards;
  if (first && typeof first === "object" && typeof first.id === "string" && typeof first.type === "string") {
    cards = items.map((item) => normalizeGuestWallCardFromApi(item)).filter(Boolean);
  } else {
    const legacyEntries = items.map((item) => normalizeGuestWallLegacyEntry(item)).filter(Boolean);
    cards = buildGuestWallCardsFromLegacyEntries(legacyEntries);
  }

  const seen = new Set();
  return cards.filter((card) => {
    if (!card || !card.id || seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

function clearGuestWallBoards() {
  setGuestWallActiveSlot(null);
  if (guestWallPinboard instanceof HTMLElement) guestWallPinboard.innerHTML = "";
  if (guestWallMobile instanceof HTMLElement) guestWallMobile.innerHTML = "";
}

function renderGuestWallLoadingSkeleton() {
  clearGuestWallBoards();
  if (guestWallPinboard instanceof HTMLElement) {
    const wrap = document.createElement("div");
    wrap.className = "guestwall-loading";
    for (let i = 0; i < 6; i += 1) {
      const block = document.createElement("div");
      block.className = "guestwall-skeleton";
      wrap.appendChild(block);
    }
    guestWallPinboard.appendChild(wrap);
  }

  if (guestWallMobile instanceof HTMLElement) {
    const stage = document.createElement("div");
    stage.className = "guestwall-mobile-stage";
    const block = document.createElement("div");
    block.className = "guestwall-skeleton guestwall-skeleton--mobile";
    stage.appendChild(block);
    guestWallMobile.appendChild(stage);
  }
}

function renderGuestWallErrorStateWithMessage(message) {
  const fallbackMessage = String(message || "").trim() || GUEST_WALL_UNAVAILABLE_MESSAGE;
  const detailMessage = String(renderGuestWallErrorStateWithMessage.lastDetail || "").trim();
  const makePanel = () => {
    const panel = document.createElement("div");
    panel.className = "guestwall-error";

    const text = document.createElement("p");
    text.className = "guestwall-error-text";
    text.textContent = fallbackMessage;
    panel.appendChild(text);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "guestwall-control-btn guestwall-retry-btn";
    button.textContent = "Try again";
    button.addEventListener("click", () => {
      loadGuestWallPinboard({ refresh: true });
    });
    panel.appendChild(button);

    if (IS_LOCAL_DEV && detailMessage) {
      const detail = document.createElement("p");
      detail.className = "guestwall-error-detail";
      detail.textContent = detailMessage;
      panel.appendChild(detail);
    }
    return panel;
  };

  clearGuestWallBoards();
  if (guestWallPinboard instanceof HTMLElement) guestWallPinboard.appendChild(makePanel());
  if (guestWallMobile instanceof HTMLElement) guestWallMobile.appendChild(makePanel());
}
renderGuestWallErrorStateWithMessage.lastDetail = "";

function buildGuestWallMediaNode(card, context = "board") {
  const mediaWrap = document.createElement("div");
  mediaWrap.className = "guestwall-polaroid-media";

  if (card.media.fileType === "video") {
    const fallback = document.createElement("div");
    fallback.className = "guestwall-media-fallback guestwall-media-fallback--video";
    fallback.innerHTML = "<p>Video upload</p>";

    const openUrl = String(card.media.viewUrl || card.media.driveViewUrl || "").trim();
    if (openUrl) {
      const openLink = createExternalAnchor(openUrl, "Open video in Drive", "guestwall-media-retry");
      fallback.appendChild(openLink);
    }

    mediaWrap.appendChild(fallback);
  } else {
    const img = document.createElement("img");
    img.classList.add("guestwall-media-img", "is-loading");
    img.alt = `Uploaded by ${card.name}`;
    img.loading = "lazy";
    img.decoding = "async";
    const fallback = document.createElement("div");
    fallback.className = "guestwall-media-fallback hidden";
    fallback.innerHTML = "<p>Image failed to load</p>";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "guestwall-media-retry";
    retry.textContent = "Tap to retry";
    fallback.appendChild(retry);

    const imageCandidates = buildGuestWallImageCandidates(card.media, "w720");
    let candidateIndex = 0;

    const loadCurrentCandidate = () => {
      if (candidateIndex >= imageCandidates.length) {
        img.removeAttribute("src");
        img.classList.add("is-loading");
        setHiddenClass(fallback, false);
        return;
      }
      img.src = imageCandidates[candidateIndex];
    };

    img.addEventListener("load", () => {
      img.classList.remove("is-loading");
      setHiddenClass(fallback, true);
    });

    img.addEventListener("error", () => {
      const currentSrc = imageCandidates[candidateIndex] || img.currentSrc || img.src;
      console.error("[guestwall:image-load-failed]", {
        submissionId: card.submissionId || "unknown",
        cardId: card.id || "unknown",
        src: currentSrc || "",
        candidateIndex,
      });
      candidateIndex += 1;
      loadCurrentCandidate();
    });

    retry.addEventListener("click", () => {
      candidateIndex = 0;
      img.classList.add("is-loading");
      setHiddenClass(fallback, true);
      loadCurrentCandidate();
    });

    loadCurrentCandidate();
    mediaWrap.appendChild(img);
    mediaWrap.appendChild(fallback);
  }

  return mediaWrap;
}

function buildGuestWallCard(card, context = "board") {
  const node = document.createElement("article");
  if (card.kind === "media") {
    node.className = "guestwall-item guestwall-item--polaroid";
    const format = normalizeGuestWallPolaroidFormat(getGuestWallPolaroidFormat(card.id));
    node.classList.add(`guestwall-polaroid--${format}`);
    const tone = getGuestWallPolaroidTone(card.id);
    node.style.setProperty("--gwPolaroidTone", tone);
    const mat = document.createElement("div");
    mat.className = "guestwall-polaroid-mat";
    const mediaNode = buildGuestWallMediaNode(card, context);
    const signatureStyle = getGuestWallSignatureStyle(card.id);
    const signature = document.createElement("span");
    signature.className = `guestwall-polaroid-signature guestwall-polaroid-signature--${signatureStyle.side}`;
    signature.classList.add("guestwall-polaroid-signature--border");
    signature.textContent = String(card.name || "").trim();
    signature.style.setProperty("--gwSigAngle", signatureStyle.angle);
    signature.style.setProperty("--gwSigOffset", signatureStyle.horizontalOffset);
    signature.style.setProperty("--gwSigLetterSpacing", signatureStyle.letterSpacing);
    signature.style.setProperty("--gwSigInk", signatureStyle.ink);
    signature.style.setProperty("--gwSigStroke", signatureStyle.stroke);
    signature.style.setProperty("--gwSigShadowX", signatureStyle.shadowX);
    signature.style.setProperty("--gwSigShadowY", signatureStyle.shadowY);
    mat.appendChild(mediaNode);
    mat.appendChild(signature);
    node.appendChild(mat);
    return node;
  }

  node.className = "guestwall-item guestwall-item--note";
  node.style.setProperty("--gwNotePaper", getGuestWallNoteTone(card.id));
  node.style.setProperty("--gwNoteInk", getGuestWallInkColor(`note-body:${card.id}`));
  node.style.setProperty("--gwNoteSignInk", getGuestWallInkColor(`note-sign:${card.id}`));
  node.classList.add("guestwall-note--postcard");

  const stamp = document.createElement("span");
  stamp.className = "guestwall-note-stamp";
  stamp.setAttribute("aria-hidden", "true");

  const postmark = document.createElement("span");
  postmark.className = "guestwall-note-postmark";
  postmark.setAttribute("aria-hidden", "true");

  const address = document.createElement("span");
  address.className = "guestwall-note-address";
  address.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i += 1) {
    const line = document.createElement("span");
    line.className = "guestwall-note-address-line";
    address.appendChild(line);
  }

  const text = document.createElement("p");
  text.className = "guestwall-note-text";
  text.textContent = String(card.text || "").replace(/\s+/g, " ").trim();

  const sign = document.createElement("p");
  sign.className = "guestwall-note-sign guestwall-note-sign--postcard";
  sign.textContent = `— ${card.name}`;

  node.appendChild(stamp);
  node.appendChild(postmark);
  node.appendChild(address);
  node.appendChild(text);
  node.appendChild(sign);
  return node;
}

function clearGuestWallDesktopTimer() {
  if (!guestWallRotationTimer) return;
  window.clearTimeout(guestWallRotationTimer);
  guestWallRotationTimer = null;
}

function clearGuestWallMobileTimer() {
  if (!guestWallMobileTimer) return;
  window.clearTimeout(guestWallMobileTimer);
  guestWallMobileTimer = null;
}

function ensureGuestWallVisibleIds(slotCount, reshuffle = false) {
  const allIds = guestWallCards.map((card) => card.id);
  if (!allIds.length || slotCount <= 0) {
    guestWallVisibleCardIds = [];
    return;
  }

  if (reshuffle || !guestWallVisibleCardIds.length) {
    guestWallVisibleCardIds = shuffleItems(allIds).slice(0, slotCount);
    return;
  }

  const next = guestWallVisibleCardIds.filter((id) => guestWallCardById.has(id)).slice(0, slotCount);
  const needed = slotCount - next.length;

  if (needed > 0) {
    const remaining = shuffleItems(allIds.filter((id) => !next.includes(id))).slice(0, needed);
    next.push(...remaining);
  }

  guestWallVisibleCardIds = next;
}

function getGuestWallVisibleCardId(slotIndex) {
  if (!Number.isFinite(slotIndex) || slotIndex < 0) return "";
  return String(guestWallVisibleCardIds[slotIndex] || "");
}

function setGuestWallStatus(message) {
  if (!guestWallStatus) return;
  const text = String(message || "").trim();
  guestWallStatus.textContent = text;
  setHiddenClass(guestWallStatus, !text);
}

function setGuestWallControlsDisabled(disabled) {
  [guestWallShuffle, guestWallAutoplayToggle, guestWallArrangeToggle].forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.disabled = Boolean(disabled);
  });
}

function flashGuestWallButton(button) {
  if (!(button instanceof HTMLButtonElement)) return;
  button.classList.add("is-pressed");
  window.setTimeout(() => {
    button.classList.remove("is-pressed");
  }, 120);
  button.classList.add("flash");
  window.setTimeout(() => {
    button.classList.remove("flash");
  }, 180);
}

function setGuestWallShuffleState(isShuffling) {
  guestWallIsShuffling = Boolean(isShuffling);
  if (!(guestWallShuffle instanceof HTMLButtonElement)) return;
  const labelNode = guestWallShuffle.querySelector(".guestwall-control-btn__label");
  guestWallShuffle.disabled = guestWallIsShuffling;
  guestWallShuffle.setAttribute("aria-disabled", guestWallIsShuffling ? "true" : "false");
  guestWallShuffle.classList.remove("is-pressed");
  guestWallShuffle.classList.toggle("is-loading", guestWallIsShuffling);
  guestWallShuffle.setAttribute("aria-busy", guestWallIsShuffling ? "true" : "false");
  if (labelNode instanceof HTMLElement) {
    labelNode.textContent = guestWallIsShuffling ? "Shuffling…" : "Shuffle";
  } else {
    guestWallShuffle.textContent = guestWallIsShuffling ? "Shuffling…" : "Shuffle";
  }
}

function isGuestWallArrangeCapable() {
  if (isGuestWallMobileView()) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function readGuestWallArrangeOffset(slotNode, axis = "x") {
  if (!(slotNode instanceof HTMLElement)) return 0;
  const property = axis === "y" ? "--gw-arrange-dy" : "--gw-arrange-dx";
  const raw = slotNode.style.getPropertyValue(property).trim().replace(/px$/i, "");
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function writeGuestWallArrangeOffset(slotNode, x, y) {
  if (!(slotNode instanceof HTMLElement)) return;
  slotNode.style.setProperty("--gw-arrange-dx", `${Number.isFinite(x) ? x : 0}px`);
  slotNode.style.setProperty("--gw-arrange-dy", `${Number.isFinite(y) ? y : 0}px`);
}

function getGuestWallArrangementStorageBucket() {
  const hostKey = String(window.location.hostname || "unknown");
  return `${GUEST_WALL_ARRANGE_STORAGE_KEY}:${hostKey}`;
}

function loadGuestWallArrangementFromStorage() {
  try {
    const raw = window.localStorage.getItem(getGuestWallArrangementStorageBucket());
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return new Map();
    const entries = Object.entries(parsed)
      .map(([cardId, offsets]) => {
        const dx = Number(offsets && offsets.dx);
        const dy = Number(offsets && offsets.dy);
        if (!cardId || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;
        return [cardId, { dx: clampNumber(dx, -500, 500), dy: clampNumber(dy, -500, 500) }];
      })
      .filter(Boolean);
    return new Map(entries);
  } catch (error) {
    console.warn("[guestwall] failed to load arrangement", error instanceof Error ? error.message : String(error));
    return new Map();
  }
}

function saveGuestWallArrangementToStorage() {
  try {
    const payload = {};
    guestWallArrangementByCardId.forEach((offsets, cardId) => {
      if (!cardId || !offsets) return;
      payload[cardId] = {
        dx: Math.round(Number(offsets.dx || 0) * 10) / 10,
        dy: Math.round(Number(offsets.dy || 0) * 10) / 10,
      };
    });
    window.localStorage.setItem(getGuestWallArrangementStorageBucket(), JSON.stringify(payload));
  } catch (error) {
    console.warn("[guestwall] failed to save arrangement", error instanceof Error ? error.message : String(error));
  }
}

function clampGuestWallSlotOffsetToBounds(slotNode, nextDx, nextDy) {
  if (!(slotNode instanceof HTMLElement) || !(guestWallPinboard instanceof HTMLElement)) {
    return { x: nextDx, y: nextDy };
  }

  const baseCenterX = Number(slotNode.dataset.arrangeBaseCenterX || "");
  const baseCenterY = Number(slotNode.dataset.arrangeBaseCenterY || "");
  const halfWidth = Number(slotNode.dataset.arrangeHalfWidth || "");
  const halfHeight = Number(slotNode.dataset.arrangeHalfHeight || "");

  if (![baseCenterX, baseCenterY, halfWidth, halfHeight].every(Number.isFinite)) {
    return { x: nextDx, y: nextDy };
  }

  const boardRect = guestWallPinboard.getBoundingClientRect();
  const padding = 8;
  const minCenterX = halfWidth + padding;
  const maxCenterX = boardRect.width - halfWidth - padding;
  const minCenterY = halfHeight + padding;
  const maxCenterY = boardRect.height - halfHeight - padding;
  const targetCenterX = baseCenterX + nextDx;
  const targetCenterY = baseCenterY + nextDy;
  const clampedCenterX = clampNumber(targetCenterX, minCenterX, maxCenterX);
  const clampedCenterY = clampNumber(targetCenterY, minCenterY, maxCenterY);
  return {
    x: clampedCenterX - baseCenterX,
    y: clampedCenterY - baseCenterY,
  };
}

function hydrateGuestWallSlotArrangeMetrics() {
  if (!(guestWallPinboard instanceof HTMLElement)) return;
  const boardRect = guestWallPinboard.getBoundingClientRect();
  if (!boardRect.width || !boardRect.height) return;

  guestWallSlotNodes.forEach((slotNode) => {
    if (!(slotNode instanceof HTMLElement)) return;
    const rect = slotNode.getBoundingClientRect();
    const currentDx = readGuestWallArrangeOffset(slotNode, "x");
    const currentDy = readGuestWallArrangeOffset(slotNode, "y");
    const centerX = rect.left - boardRect.left + rect.width / 2 - currentDx;
    const centerY = rect.top - boardRect.top + rect.height / 2 - currentDy;
    slotNode.dataset.arrangeBaseCenterX = String(centerX);
    slotNode.dataset.arrangeBaseCenterY = String(centerY);
    slotNode.dataset.arrangeHalfWidth = String(rect.width / 2);
    slotNode.dataset.arrangeHalfHeight = String(rect.height / 2);
    const clamped = clampGuestWallSlotOffsetToBounds(slotNode, currentDx, currentDy);
    if (clamped.x !== currentDx || clamped.y !== currentDy) {
      writeGuestWallArrangeOffset(slotNode, clamped.x, clamped.y);
    }
  });
}

function applyGuestWallStoredArrangement(slotNode, cardId) {
  if (!(slotNode instanceof HTMLElement)) return;
  const key = String(cardId || "").trim();
  const offsets = guestWallArrangementByCardId.get(key);
  if (!offsets) {
    writeGuestWallArrangeOffset(slotNode, 0, 0);
    return;
  }
  const clamped = clampGuestWallSlotOffsetToBounds(slotNode, Number(offsets.dx || 0), Number(offsets.dy || 0));
  writeGuestWallArrangeOffset(slotNode, clamped.x, clamped.y);
}

function snapshotGuestWallArrangementFromSlots() {
  guestWallSlotNodes.forEach((slotNode) => {
    if (!(slotNode instanceof HTMLElement)) return;
    const cardId = String(slotNode.dataset.cardId || "").trim();
    if (!cardId) return;
    guestWallArrangementByCardId.set(cardId, {
      dx: readGuestWallArrangeOffset(slotNode, "x"),
      dy: readGuestWallArrangeOffset(slotNode, "y"),
    });
  });
  saveGuestWallArrangementToStorage();
}

function runGuestWallDeoverlapPass() {
  if (!(guestWallPinboard instanceof HTMLElement) || !guestWallSlotNodes.length) return;
  const boardRect = guestWallPinboard.getBoundingClientRect();
  const padding = 8;
  const slots = guestWallSlotNodes
    .filter((slotNode) => slotNode instanceof HTMLElement)
    .map((slotNode) => {
      const baseCenterX = Number(slotNode.dataset.arrangeBaseCenterX || "");
      const baseCenterY = Number(slotNode.dataset.arrangeBaseCenterY || "");
      const halfWidth = Number(slotNode.dataset.arrangeHalfWidth || "");
      const halfHeight = Number(slotNode.dataset.arrangeHalfHeight || "");
      if (![baseCenterX, baseCenterY, halfWidth, halfHeight].every(Number.isFinite)) return null;
      return {
        node: slotNode,
        baseCenterX,
        baseCenterY,
        halfWidth,
        halfHeight,
        centerX: baseCenterX + readGuestWallArrangeOffset(slotNode, "x"),
        centerY: baseCenterY + readGuestWallArrangeOffset(slotNode, "y"),
      };
    })
    .filter(Boolean);

  if (slots.length <= 1) {
    snapshotGuestWallArrangementFromSlots();
    return;
  }

  const separatePair = (a, b) => {
    const dx = b.centerX - a.centerX;
    const dy = b.centerY - a.centerY;
    const overlapX = a.halfWidth + b.halfWidth + GUEST_WALL_ARRANGE_DEOVERLAP_GAP - Math.abs(dx);
    const overlapY = a.halfHeight + b.halfHeight + GUEST_WALL_ARRANGE_DEOVERLAP_GAP - Math.abs(dy);
    if (overlapX <= 0 || overlapY <= 0) return;
    if (overlapX < overlapY) {
      const push = overlapX / 2;
      const direction = dx >= 0 ? 1 : -1;
      a.centerX -= push * direction;
      b.centerX += push * direction;
    } else {
      const push = overlapY / 2;
      const direction = dy >= 0 ? 1 : -1;
      a.centerY -= push * direction;
      b.centerY += push * direction;
    }
  };

  for (let step = 0; step < GUEST_WALL_ARRANGE_DEOVERLAP_STEPS; step += 1) {
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        separatePair(slots[i], slots[j]);
      }
    }

    slots.forEach((slot) => {
      const minX = slot.halfWidth + padding;
      const maxX = boardRect.width - slot.halfWidth - padding;
      const minY = slot.halfHeight + padding;
      const maxY = boardRect.height - slot.halfHeight - padding;
      slot.centerX = clampNumber(slot.centerX, minX, maxX);
      slot.centerY = clampNumber(slot.centerY, minY, maxY);
    });
  }

  slots.forEach((slot) => {
    const dx = slot.centerX - slot.baseCenterX;
    const dy = slot.centerY - slot.baseCenterY;
    writeGuestWallArrangeOffset(slot.node, dx, dy);
  });
  snapshotGuestWallArrangementFromSlots();
}

function setGuestWallArrangeMode(enabled) {
  const nextMode = Boolean(enabled) && isGuestWallArrangeCapable();
  if (!nextMode && guestWallDragState) {
    cancelGuestWallDrag(true);
  }
  guestWallArrangeMode = nextMode;
  if (guestWallPinboard instanceof HTMLElement) {
    guestWallPinboard.classList.toggle("is-arrange-mode", nextMode);
  }
  if (guestWallArrangeToggle instanceof HTMLButtonElement) {
    guestWallArrangeToggle.classList.toggle("is-active", nextMode);
    guestWallArrangeToggle.textContent = `Arrange: ${nextMode ? "On" : "Off"}`;
    guestWallArrangeToggle.setAttribute("aria-pressed", nextMode ? "true" : "false");
  }
}

function syncGuestWallArrangeAvailability() {
  if (!(guestWallArrangeToggle instanceof HTMLButtonElement)) return;
  const canArrange = isGuestWallArrangeCapable();
  setHiddenClass(guestWallArrangeToggle, !canArrange);
  if (!canArrange) {
    setGuestWallArrangeMode(false);
  }
}

function cancelGuestWallDrag(commit = false) {
  if (!guestWallDragState || !(guestWallDragState.slotNode instanceof HTMLElement)) return;
  const slotNode = guestWallDragState.slotNode;
  slotNode.classList.remove("is-dragging");
  if (commit) {
    runGuestWallDeoverlapPass();
  } else {
    snapshotGuestWallArrangementFromSlots();
  }
  guestWallDragState = null;
}

function clearGuestWallSlotOpenTimer(slotNode) {
  if (!(slotNode instanceof HTMLElement)) return;
  const timerId = Number(slotNode.dataset.openTimerId || "");
  if (Number.isFinite(timerId) && timerId > 0) {
    window.clearTimeout(timerId);
  }
  slotNode.dataset.openTimerId = "";
}

function setGuestWallActiveSlot(nextSlotNode) {
  if (guestWallActiveSlotNode instanceof HTMLElement && guestWallActiveSlotNode !== nextSlotNode) {
    clearGuestWallSlotOpenTimer(guestWallActiveSlotNode);
    guestWallActiveSlotNode.classList.remove("is-active");
    guestWallActiveSlotNode.classList.remove("is-opening");
  }
  guestWallActiveSlotNode = nextSlotNode instanceof HTMLElement ? nextSlotNode : null;
  if (guestWallActiveSlotNode) {
    guestWallActiveSlotNode.classList.add("is-active");
  }
}

function closeGuestWallDetail() {
  if (!(guestWallDetailModal instanceof HTMLElement) || !guestWallDetailOpen) return;
  setHiddenClass(guestWallDetailModal, true);
  guestWallDetailModal.setAttribute("aria-hidden", "true");
  unlockBodyScroll();
  guestWallDetailOpen = false;
}

function buildGuestWallDetailMediaNode(card) {
  if (!card || card.kind !== "media" || !card.media) return null;
  const mediaKind = String(card.media.fileType || "").toLowerCase();
  if (mediaKind === "video") {
    const fallback = document.createElement("div");
    fallback.className = "guestwall-media-fallback guestwall-media-fallback--video";
    fallback.innerHTML = "<p>Video upload</p>";
    const openUrl = String(card.media.viewUrl || card.media.driveViewUrl || "").trim();
    if (openUrl) {
      fallback.appendChild(createExternalAnchor(openUrl, "Open video in Drive", "guestwall-media-retry"));
    }
    return fallback;
  }

  const candidates = buildGuestWallImageCandidates(card.media, "w1600");
  if (!candidates.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "guestwall-media-fallback";
    placeholder.innerHTML = "<p>Photo unavailable.</p>";
    return placeholder;
  }

  const img = document.createElement("img");
  img.alt = `Uploaded by ${card.name || "Guest"}`;
  img.decoding = "async";
  img.loading = "eager";
  img.src = candidates[0];
  img.addEventListener("error", () => {
    const placeholder = document.createElement("div");
    placeholder.className = "guestwall-media-fallback";
    placeholder.innerHTML = "<p>Photo unavailable.</p>";
    if (img.parentElement instanceof HTMLElement) {
      img.parentElement.replaceChildren(placeholder);
    }
  });
  return img;
}

function buildGuestWallDetailNoteBlock(noteText, name) {
  const noteBlock = document.createElement("article");
  noteBlock.className = "guestwall-detail-block guestwall-detail-block--note";

  const noteTextNode = document.createElement("p");
  noteTextNode.className = "guestwall-note-text guestwall-detail-note";
  noteTextNode.textContent = noteText;
  noteBlock.appendChild(noteTextNode);

  const noteNameNode = document.createElement("p");
  noteNameNode.className = "guestwall-note-sign guestwall-detail-name";
  noteNameNode.textContent = `— ${name}`;
  noteBlock.appendChild(noteNameNode);

  return noteBlock;
}

function buildGuestWallDetailPhotoBlock(card, name) {
  const mediaNode = buildGuestWallDetailMediaNode(card);
  if (!(mediaNode instanceof HTMLElement)) return null;

  const photoBlock = document.createElement("article");
  photoBlock.className = "guestwall-detail-block guestwall-detail-block--photo";

  const mediaWrap = document.createElement("div");
  mediaWrap.className = "guestwall-modal-media guestwall-detail-media";
  mediaWrap.appendChild(mediaNode);
  photoBlock.appendChild(mediaWrap);

  const photoNameNode = document.createElement("p");
  photoNameNode.className = "guestwall-note-sign guestwall-detail-name";
  photoNameNode.textContent = `— ${name}`;
  photoBlock.appendChild(photoNameNode);

  return photoBlock;
}

function openGuestWallDetail(card) {
  if (!(guestWallDetailModal instanceof HTMLElement) || !(guestWallDetailContent instanceof HTMLElement) || !card) return;
  const wasOpen = guestWallDetailOpen;
  const guestName = String(card.name || "Guest");
  const fullNote = String(card.kind === "note" ? card.text : card.message || "").trim();
  const hasMedia = card.kind === "media" && !!card.media;
  const hasNote = fullNote.length > 0;
  if (!hasMedia && !hasNote) return;

  guestWallDetailContent.innerHTML = "";
  if (hasMedia && hasNote) {
    const photoBlock = buildGuestWallDetailPhotoBlock(card, guestName);
    if (photoBlock) guestWallDetailContent.appendChild(photoBlock);
    const noteBlock = buildGuestWallDetailNoteBlock(fullNote, guestName);
    guestWallDetailContent.appendChild(noteBlock);
  } else if (hasMedia) {
    const photoBlock = buildGuestWallDetailPhotoBlock(card, guestName);
    if (photoBlock) guestWallDetailContent.appendChild(photoBlock);
  } else if (hasNote) {
    const noteBlock = buildGuestWallDetailNoteBlock(fullNote, guestName);
    guestWallDetailContent.appendChild(noteBlock);
  }

  setHiddenClass(guestWallDetailModal, false);
  guestWallDetailModal.setAttribute("aria-hidden", "false");
  if (!wasOpen) lockBodyScroll();
  guestWallDetailOpen = true;

  if (guestWallDetailClose instanceof HTMLButtonElement) {
    window.setTimeout(() => {
      guestWallDetailClose.focus({ preventScroll: true });
    }, 0);
  }
}

function bindGuestWallDetailModalEvents() {
  if (!(guestWallDetailModal instanceof HTMLElement)) return;
  if (guestWallDetailModal.dataset.bound === "true") return;

  guestWallDetailModal.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest("[data-guestwall-close='true']")) {
      closeGuestWallDetail();
    }
  });

  if (guestWallDetailClose instanceof HTMLButtonElement) {
    guestWallDetailClose.addEventListener("click", closeGuestWallDetail);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !guestWallDetailOpen) return;
    closeGuestWallDetail();
  });

  guestWallDetailModal.dataset.bound = "true";
}

function openGuestWallDetailWithPickup(slotNode, card, options = {}) {
  if (!(slotNode instanceof HTMLElement) || !card) return;
  const immediate = Boolean(options.immediate || prefersReducedMotion());

  setGuestWallActiveSlot(slotNode);
  clearGuestWallSlotOpenTimer(slotNode);
  if (immediate) {
    slotNode.classList.remove("is-opening");
    openGuestWallDetail(card);
    return;
  }

  slotNode.classList.add("is-opening");
  const timer = window.setTimeout(() => {
    if (!(slotNode instanceof HTMLElement)) return;
    slotNode.classList.remove("is-opening");
    slotNode.dataset.openTimerId = "";
    openGuestWallDetail(card);
  }, GUEST_WALL_PICKUP_OPEN_DELAY_MS);
  slotNode.dataset.openTimerId = String(timer);
}

function bindGuestWallSlotInteraction(slotNode) {
  if (!(slotNode instanceof HTMLElement) || slotNode.dataset.interactionBound === "true") return;
  slotNode.dataset.interactionBound = "true";
  slotNode.tabIndex = 0;

  slotNode.addEventListener("pointerdown", (event) => {
    const pointerType = String(event.pointerType || "").toLowerCase();
    if (guestWallArrangeMode && isGuestWallArrangeCapable() && pointerType !== "touch" && event.button === 0) {
      if (!(guestWallPinboard instanceof HTMLElement)) return;
      const startDx = readGuestWallArrangeOffset(slotNode, "x");
      const startDy = readGuestWallArrangeOffset(slotNode, "y");
      guestWallDragState = {
        slotNode,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startDx,
        startDy,
        moved: false,
      };
      slotNode.dataset.dragMoved = "false";
      slotNode.classList.add("is-dragging");
      setGuestWallActiveSlot(slotNode);
      event.preventDefault();
      event.stopPropagation();
      if (typeof slotNode.setPointerCapture === "function") {
        slotNode.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (pointerType === "touch" || pointerType === "pen") {
      setGuestWallActiveSlot(slotNode);
    }
  });

  slotNode.addEventListener("pointermove", (event) => {
    if (!guestWallDragState || guestWallDragState.slotNode !== slotNode) return;
    if (guestWallDragState.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - guestWallDragState.startX;
    const deltaY = event.clientY - guestWallDragState.startY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      guestWallDragState.moved = true;
      slotNode.dataset.dragMoved = "true";
    }
    const nextDx = guestWallDragState.startDx + deltaX;
    const nextDy = guestWallDragState.startDy + deltaY;
    const clamped = clampGuestWallSlotOffsetToBounds(slotNode, nextDx, nextDy);
    writeGuestWallArrangeOffset(slotNode, clamped.x, clamped.y);
    event.preventDefault();
  });

  const endDrag = (event) => {
    if (!guestWallDragState || guestWallDragState.slotNode !== slotNode) return;
    if (guestWallDragState.pointerId !== event.pointerId) return;
    const moved = Boolean(guestWallDragState.moved);
    if (typeof slotNode.releasePointerCapture === "function") {
      try {
        slotNode.releasePointerCapture(event.pointerId);
      } catch (_) {
        // ignore capture release errors
      }
    }
    slotNode.classList.remove("is-dragging");
    guestWallDragState = null;
    if (moved) {
      runGuestWallDeoverlapPass();
      event.preventDefault();
    } else {
      snapshotGuestWallArrangementFromSlots();
    }
  };
  slotNode.addEventListener("pointerup", endDrag);
  slotNode.addEventListener("pointercancel", endDrag);
  slotNode.addEventListener("lostpointercapture", endDrag);

  slotNode.addEventListener("click", (event) => {
    if (guestWallArrangeMode) {
      event.preventDefault();
      return;
    }
    if (slotNode.dataset.dragMoved === "true") {
      slotNode.dataset.dragMoved = "false";
      event.preventDefault();
      return;
    }
    const cardId = String(slotNode.dataset.cardId || "").trim();
    if (!cardId) return;
    const card = guestWallCardById.get(cardId);
    if (!card) return;
    openGuestWallDetailWithPickup(slotNode, card);
  });

  slotNode.addEventListener("keydown", (event) => {
    if (guestWallArrangeMode) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    const cardId = String(slotNode.dataset.cardId || "").trim();
    if (!cardId) return;
    const card = guestWallCardById.get(cardId);
    if (!card) return;
    event.preventDefault();
    openGuestWallDetailWithPickup(slotNode, card, { immediate: true });
  });
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashStringToUint32(value) {
  const input = String(value || "");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandomFromHash(seedValue) {
  let state = Number(seedValue) >>> 0;
  state = Math.imul(state ^ 61, state | 1);
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
  const normalized = ((state ^ (state >>> 14)) >>> 0) / 4294967295;
  return clampNumber(normalized, 0, 1);
}

function getGuestWallPolaroidTone(cardId) {
  const tones = GUEST_WALL_POLAROID_TONES;
  if (!tones.length) return "#5a1720";
  const seed = hashStringToUint32(String(cardId || ""));
  return tones[seed % tones.length];
}

function getGuestWallPolaroidFormat(cardId) {
  const seed = hashStringToUint32(`polaroid-format:${String(cardId || "")}`);
  const value = seededRandomFromHash(seed);
  if (value < 0.7) return "mini";
  if (value < 0.9) return "square";
  return "wide";
}

function normalizeGuestWallPolaroidFormat(value) {
  const format = String(value || "").trim().toLowerCase();
  if (format === "mini" || format === "square" || format === "wide") return format;
  return "square";
}

function isGuestWallWideFormat(value) {
  return normalizeGuestWallPolaroidFormat(value) === "wide";
}

function getGuestWallSlotFormat(slotConfigOrNode) {
  if (!slotConfigOrNode) return "any";
  if (slotConfigOrNode instanceof HTMLElement) {
    return String(slotConfigOrNode.dataset.slotFormat || "any").trim() || "any";
  }
  return String(slotConfigOrNode.format || "any").trim() || "any";
}

function getGuestWallSlotKind(slotConfigOrNode) {
  if (!slotConfigOrNode) return "mixed";
  if (slotConfigOrNode instanceof HTMLElement) {
    return String(slotConfigOrNode.dataset.slotKind || "mixed").trim().toLowerCase() || "mixed";
  }
  const explicitKind = String(slotConfigOrNode.kind || "").trim().toLowerCase();
  if (explicitKind === "media" || explicitKind === "note" || explicitKind === "mixed") return explicitKind;
  const fallbackPrefer = String(slotConfigOrNode.prefer || "mixed").trim().toLowerCase();
  if (fallbackPrefer === "media" || fallbackPrefer === "note" || fallbackPrefer === "mixed") return fallbackPrefer;
  return "mixed";
}

function getGuestWallInkColor(seedKey) {
  const colors = GUEST_WALL_DARK_INK_PALETTE;
  if (!colors.length) return "#1F1A17";
  const seed = hashStringToUint32(`gw-ink:${String(seedKey || "")}`);
  return colors[seed % colors.length];
}

function getGuestWallSignatureStyle(cardId) {
  const id = String(cardId || "");
  const sideSeed = hashStringToUint32(`sig-side:${id}`);
  const angleSeed = hashStringToUint32(`sig-angle:${id}`);
  const offsetSeed = hashStringToUint32(`sig-offset:${id}`);
  const trackingSeed = hashStringToUint32(`sig-track:${id}`);
  const shadowSeed = hashStringToUint32(`sig-shadow:${id}`);
  const ink = getGuestWallInkColor(`polaroid-signature:${id}`);

  const side = sideSeed % 2 === 0 ? "left" : "right";
  const angle = ((seededRandomFromHash(angleSeed) * 6) - 3).toFixed(2);
  const horizontalOffset = `${Math.round(9 + seededRandomFromHash(offsetSeed) * 7)}px`;
  const letterSpacing = `${((seededRandomFromHash(trackingSeed) - 0.5) * 0.35).toFixed(2)}px`;
  const shadowX = side === "left" ? 1 : -1;
  const shadowY = 1 + Math.round(seededRandomFromHash(shadowSeed));

  return {
    side,
    angle: `${angle}deg`,
    horizontalOffset,
    letterSpacing,
    shadowX: `${shadowX}px`,
    shadowY: `${shadowY}px`,
    ink,
    stroke: ink,
  };
}

function getGuestWallNoteTone(cardId) {
  const tones = GUEST_WALL_NOTE_TONES;
  if (!tones.length) return "#FAF3E8";
  const seed = hashStringToUint32(`note:${String(cardId || "")}`);
  return tones[seed % tones.length];
}

function getGuestWallNoteVariant(cardId) {
  const variants = GUEST_WALL_NOTE_VARIANTS;
  if (!variants.length) return "sticky";
  const seed = hashStringToUint32(`note-variant:${String(cardId || "")}`);
  return variants[seed % variants.length];
}

function getGuestWallNoteFastenerStyle(cardId) {
  const id = String(cardId || "");
  const colorSeed = hashStringToUint32(`pin-color:${id}`);
  const cornerSeed = hashStringToUint32(`pin-corner:${id}`);
  const xJitterSeed = hashStringToUint32(`pin-x:${id}`);
  const yJitterSeed = hashStringToUint32(`pin-y:${id}`);
  const typeSeed = hashStringToUint32(`fastener-type:${id}`);
  const tapeAngleSeed = hashStringToUint32(`fastener-angle:${id}`);
  const color = GUEST_WALL_PIN_COLORS[colorSeed % GUEST_WALL_PIN_COLORS.length] || "#6B1F2A";
  const corner = GUEST_WALL_PIN_CORNERS[cornerSeed % GUEST_WALL_PIN_CORNERS.length] || "top-right";
  const xJitter = Math.round((seededRandomFromHash(xJitterSeed) - 0.5) * 8);
  const yJitter = Math.round((seededRandomFromHash(yJitterSeed) - 0.5) * 5);
  const edgeInset = 12;
  const fastenerTypeIndex = typeSeed % 10;
  const type = fastenerTypeIndex <= 5 ? "pin" : fastenerTypeIndex <= 8 ? "tape" : "clip";
  const tapeAngle = `${((seededRandomFromHash(tapeAngleSeed) * 8) - 4).toFixed(2)}deg`;

  if (corner === "top-left") {
    return {
      type,
      color,
      top: `${-7 + yJitter}px`,
      right: "auto",
      bottom: "auto",
      left: `${edgeInset + xJitter}px`,
      tapeAngle,
    };
  }

  if (corner === "bottom-left") {
    return {
      type,
      color,
      top: "auto",
      right: "auto",
      bottom: `${-7 + yJitter}px`,
      left: `${edgeInset + xJitter}px`,
      tapeAngle,
    };
  }

  if (corner === "bottom-right") {
    return {
      type,
      color,
      top: "auto",
      right: `${edgeInset + xJitter}px`,
      bottom: `${-7 + yJitter}px`,
      left: "auto",
      tapeAngle,
    };
  }

  return {
    type,
    color,
    top: `${-7 + yJitter}px`,
    right: `${edgeInset + xJitter}px`,
    bottom: "auto",
    left: "auto",
    tapeAngle,
  };
}

function assignGuestWallCardsToSlots(slotConfigs, requestedIds) {
  const slots = Array.isArray(slotConfigs) ? slotConfigs : [];
  if (!slots.length) return [];

  const requested = Array.isArray(requestedIds) ? requestedIds : [];
  const allIds = guestWallCards.map((card) => card.id);
  const combined = [...requested, ...allIds];
  const seen = new Set();
  const uniquePool = combined.filter((id) => {
    const key = String(id || "");
    if (!key || !guestWallCardById.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const mediaWideQueue = uniquePool.filter((id) => {
    const card = guestWallCardById.get(id);
    return card?.kind === "media" && isGuestWallWideFormat(normalizeGuestWallPolaroidFormat(getGuestWallPolaroidFormat(id)));
  });
  const mediaPortraitQueue = uniquePool.filter((id) => {
    const card = guestWallCardById.get(id);
    return card?.kind === "media" && !isGuestWallWideFormat(normalizeGuestWallPolaroidFormat(getGuestWallPolaroidFormat(id)));
  });
  const noteQueue = uniquePool.filter((id) => guestWallCardById.get(id)?.kind === "note");
  const fallbackQueue = [...uniquePool];
  const used = new Set();
  const takeNext = (queue, predicate = null) => {
    const index = queue.findIndex((id) => !used.has(id) && (!predicate || predicate(id)));
    if (index < 0) return "";
    const [picked] = queue.splice(index, 1);
    used.add(picked);
    return picked;
  };

  return slots.map((slotConfig) => {
    const slotKind = getGuestWallSlotKind(slotConfig);
    const slotFormat = getGuestWallSlotFormat(slotConfig);

    if (slotKind === "note") {
      return takeNext(noteQueue) || takeNext(fallbackQueue, (id) => guestWallCardById.get(id)?.kind === "note") || "";
    }

    if (slotKind === "media") {
      if (slotFormat === "wide") {
        return takeNext(mediaWideQueue) || takeNext(mediaPortraitQueue) || "";
      }
      return takeNext(mediaPortraitQueue) || takeNext(mediaWideQueue) || takeNext(fallbackQueue, (id) => guestWallCardById.get(id)?.kind === "media") || "";
    }

    if (slotFormat === "wide") {
      return takeNext(mediaWideQueue) || takeNext(mediaPortraitQueue) || takeNext(noteQueue) || takeNext(fallbackQueue) || "";
    }

    return (
      takeNext(mediaPortraitQueue) ||
      takeNext(noteQueue) ||
      takeNext(mediaWideQueue) ||
      takeNext(fallbackQueue, (id) => !isGuestWallWideFormat(normalizeGuestWallPolaroidFormat(getGuestWallPolaroidFormat(id)))) ||
      takeNext(fallbackQueue) ||
      ""
    );
  });
}

function getGuestWallSlotMapForCycle(mobile = false) {
  const mapSet = mobile ? SLOT_MAPS_MOBILE : SLOT_MAPS_DESKTOP;
  const keys = Object.keys(mapSet);
  if (!keys.length) return [];
  const seed = hashStringToUint32(`gw-map:${mobile ? "mobile" : "desktop"}:${guestWallLayoutCycle}`);
  const mapKey = keys[seed % keys.length];
  const slots = mapSet[mapKey] || [];
  return slots.map((slot) => ({ ...slot, mapKey }));
}

function getStableGuestWallSlotRotation(slotNode, cardId) {
  if (!(slotNode instanceof HTMLElement)) return 0;
  const slotId = String(slotNode.dataset.slotId || "");
  const tiltBase = Number(slotNode.dataset.tiltBase || 0);
  const seed = hashStringToUint32(`${String(cardId || "")}:${slotId}`);
  const seededUnit = seededRandomFromHash(seed);
  const tiltJitter = -2 + seededUnit * 4;
  return clampNumber(tiltBase + tiltJitter, -4, 4);
}

function getStableGuestWallSlotWarp(slotNode, cardId) {
  if (!(slotNode instanceof HTMLElement)) return { skewX: 0, skewY: 0 };
  const slotId = String(slotNode.dataset.slotId || "");
  const id = String(cardId || "");
  const gateSeed = hashStringToUint32(`gw-warp-gate:${slotId}:${id}`);
  const gate = seededRandomFromHash(gateSeed);
  if (gate < 0.35) return { skewX: 0, skewY: 0 };

  const xSeed = hashStringToUint32(`gw-warp-x:${slotId}:${id}`);
  const ySeed = hashStringToUint32(`gw-warp-y:${slotId}:${id}`);
  const skewX = ((seededRandomFromHash(xSeed) * 2 - 1) * 1.2).toFixed(2);
  const skewY = ((seededRandomFromHash(ySeed) * 2 - 1) * 0.8).toFixed(2);
  return { skewX: Number(skewX), skewY: Number(skewY) };
}

function getGuestWallSlotWidthPx(containerWidth, size, mobile = false) {
  const width = Math.max(320, Number(containerWidth) || 0);
  if (mobile) {
    if (size === "S") return clampNumber(width * 0.32, 112, 138);
    if (size === "XL") return clampNumber(width * 0.58, 192, 252);
    if (size === "L") return clampNumber(width * 0.44, 146, 182);
    return clampNumber(width * 0.38, 128, 162);
  }

  if (size === "S") return clampNumber(width * 0.125, 138, 176);
  if (size === "XL") return clampNumber(width * 0.265, 284, 368);
  if (size === "L") return clampNumber(width * 0.172, 188, 236);
  return clampNumber(width * 0.148, 162, 206);
}

function getGuestWallSlotAspectRatio(slotConfig) {
  const slotFormat = getGuestWallSlotFormat(slotConfig);
  const preferredKind = getGuestWallSlotKind(slotConfig);
  if (slotFormat === "wide") return 108 / 86;
  if (preferredKind === "note") return 1.14;
  if (preferredKind === "media") return 72 / 86;
  return 0.88;
}

function getGuestWallSlotRole(slotConfig) {
  const explicitRole = String(slotConfig?.role || "").trim().toLowerCase();
  if (explicitRole === "hero" || explicitRole === "support" || explicitRole === "note") return explicitRole;
  const preferredKind = getGuestWallSlotKind(slotConfig);
  if (slotConfig?.size === "XL") return "hero";
  if (preferredKind === "note") return "note";
  return "support";
}

function getGuestWallSlotRect(slotConfig, containerRect, mobile = false) {
  const width = getGuestWallSlotWidthPx(containerRect.width, slotConfig.size, mobile);
  const aspectRatio = getGuestWallSlotAspectRatio(slotConfig);
  const height = width / Math.max(0.58, aspectRatio) + 8;
  const centerX = (containerRect.width * Number(slotConfig.xPct || 0)) / 100 + Number(slotConfig.xOffsetPx || 0);
  const centerY = (containerRect.height * Number(slotConfig.yPct || 0)) / 100 + Number(slotConfig.yOffsetPx || 0);
  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
    width,
    height,
  };
}

function rectsOverlap(a, b, gap) {
  return !(a.right + gap <= b.left || a.left >= b.right + gap || a.bottom + gap <= b.top || a.top >= b.bottom + gap);
}

function getGuestWallSlotJitter(slotConfig, slotIndex, jitterMaxPx, jitterSeed, attempt = 0) {
  if (!Number.isFinite(jitterMaxPx) || jitterMaxPx <= 0) {
    return { xOffsetPx: 0, yOffsetPx: 0 };
  }
  const dampening = Math.max(0, 1 - attempt * 0.28);
  const range = jitterMaxPx * dampening;
  if (range <= 0.5) return { xOffsetPx: 0, yOffsetPx: 0 };

  const baseSeed = `${String(jitterSeed || "0")}:${String(slotConfig.id || "")}:${slotIndex}:${attempt}`;
  const xSeed = hashStringToUint32(`${baseSeed}:x`);
  const ySeed = hashStringToUint32(`${baseSeed}:y`);
  const xOffsetPx = Math.round((seededRandomFromHash(xSeed) * 2 - 1) * range);
  const yOffsetPx = Math.round((seededRandomFromHash(ySeed) * 2 - 1) * range);
  return { xOffsetPx, yOffsetPx };
}

function resolveGuestWallSlotLayout(slotMap, containerRect, mobile = false, options = {}) {
  const gap = mobile ? GUEST_WALL_SLOT_GAP_MOBILE : GUEST_WALL_SLOT_GAP_DESKTOP;
  const crossKindGap = mobile ? 14 : 20;
  const heroNoOverlapGap = mobile ? 16 : 24;
  const edgePadding = mobile ? 8 : 12;
  const jitterMaxPx = Number(options.jitterMaxPx || 0);
  const jitterSeed = String(options.jitterSeed || "");
  const placed = [];
  const result = [];

  const isValidPlacement = (candidateRect, candidateRole, candidateKind) => {
    if (
      candidateRect.left < edgePadding ||
      candidateRect.top < edgePadding ||
      candidateRect.right > containerRect.width - edgePadding ||
      candidateRect.bottom > containerRect.height - edgePadding
    ) {
      return false;
    }
    return !placed.some((entry) => {
      const protectHero = candidateRole === "hero" || entry.role === "hero";
      const kindGap = entry.kind === candidateKind ? gap : crossKindGap;
      return rectsOverlap(entry.rect, candidateRect, protectHero ? Math.max(heroNoOverlapGap, kindGap) : kindGap);
    });
  };

  slotMap.forEach((slotConfig, slotIndex) => {
    const attempts = jitterMaxPx > 0 ? 5 : 1;
    const role = getGuestWallSlotRole(slotConfig);
    const kind = getGuestWallSlotKind(slotConfig);
    let selectedOffset = { xOffsetPx: 0, yOffsetPx: 0 };
    let selectedRect = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const offset = getGuestWallSlotJitter(slotConfig, slotIndex, jitterMaxPx, jitterSeed, attempt);
      const candidate = { ...slotConfig, ...offset };
      const candidateRect = getGuestWallSlotRect(candidate, containerRect, mobile);
      if (!isValidPlacement(candidateRect, role, kind)) continue;
      selectedOffset = offset;
      selectedRect = candidateRect;
      break;
    }

    if (!selectedRect) {
      const fallbackCandidate = { ...slotConfig, xOffsetPx: 0, yOffsetPx: 0 };
      selectedRect = getGuestWallSlotRect(fallbackCandidate, containerRect, mobile);
      selectedOffset = { xOffsetPx: 0, yOffsetPx: 0 };
    }

    placed.push({ rect: selectedRect, role, kind });
    result.push({
      ...slotConfig,
      role,
      kind,
      ...selectedOffset,
      pxWidth: selectedRect.width,
    });
  });

  return result;
}

function placeGuestWallSlot(slotNode, slotConfig) {
  slotNode.style.setProperty("--gw-left", String(slotConfig.xPct));
  slotNode.style.setProperty("--gw-top", String(slotConfig.yPct));
  slotNode.style.setProperty("--gw-x-offset", `${Math.round(Number(slotConfig.xOffsetPx || 0))}px`);
  slotNode.style.setProperty("--gw-y-offset", `${Math.round(Number(slotConfig.yOffsetPx || 0))}px`);
  slotNode.style.setProperty("--gw-card-width", `${Math.round(slotConfig.pxWidth || 140)}px`);
  slotNode.style.setProperty("--gw-rotate", `${slotConfig.tiltBase}deg`);
  slotNode.style.setProperty("--gw-skew-x", "0deg");
  slotNode.style.setProperty("--gw-skew-y", "0deg");
  slotNode.style.setProperty("--gw-z", String(slotConfig.baseZ));
  slotNode.dataset.slotId = String(slotConfig.id || "");
  slotNode.dataset.slotSize = String(slotConfig.size || "M");
  slotNode.dataset.slotRole = String(slotConfig.role || getGuestWallSlotRole(slotConfig));
  slotNode.dataset.slotFormat = String(slotConfig.format || "any");
  slotNode.dataset.slotKind = String(getGuestWallSlotKind(slotConfig));
  slotNode.dataset.tiltBase = String(slotConfig.tiltBase || 0);
  slotNode.classList.toggle("slot-size-s", slotConfig.size === "S");
  slotNode.classList.toggle("slot-size-m", slotConfig.size === "M");
  slotNode.classList.toggle("slot-size-l", slotConfig.size === "L");
  slotNode.classList.toggle("slot-size-xl", slotConfig.size === "XL");

  if (SHOW_SLOT_DEBUG && !slotNode.querySelector(".guestwall-slot-debug")) {
    const debugNode = document.createElement("div");
    debugNode.className = "guestwall-slot-debug";
    debugNode.textContent = String(slotConfig.id || "");
    slotNode.appendChild(debugNode);
  }
}

function mountGuestWallSlotCard(slotNode, cardId, animate = false) {
  if (!(slotNode instanceof HTMLElement)) return;
  const card = guestWallCardById.get(cardId);
  if (!card) return;

  const stableRotate = getStableGuestWallSlotRotation(slotNode, cardId);
  const stableWarp = getStableGuestWallSlotWarp(slotNode, cardId);
  slotNode.style.setProperty("--gw-rotate", `${stableRotate}deg`);
  slotNode.style.setProperty("--gw-skew-x", `${stableWarp.skewX}deg`);
  slotNode.style.setProperty("--gw-skew-y", `${stableWarp.skewY}deg`);
  slotNode.dataset.cardId = String(card.id || cardId || "");
  applyGuestWallStoredArrangement(slotNode, card.id || cardId);

  const debugNode = slotNode.querySelector(".guestwall-slot-debug");
  const node = buildGuestWallCard(card, "board");
  if (animate && !prefersReducedMotion()) {
    node.classList.add("is-entering");
    slotNode.replaceChildren(node, ...(debugNode ? [debugNode] : []));
    window.requestAnimationFrame(() => {
      node.classList.remove("is-entering");
    });
    return;
  }

  slotNode.replaceChildren(node, ...(debugNode ? [debugNode] : []));
}

function swapGuestWallSlotCard(slotIndex, nextCardId) {
  const slotNode = guestWallSlotNodes[slotIndex];
  if (!(slotNode instanceof HTMLElement)) return;

  const current = slotNode.firstElementChild;
  if (!(current instanceof HTMLElement) || prefersReducedMotion()) {
    mountGuestWallSlotCard(slotNode, nextCardId, false);
    return;
  }

  slotNode.classList.add("is-swapping-out");
  current.classList.add("is-leaving");
  window.setTimeout(() => {
    slotNode.classList.remove("is-swapping-out");
    slotNode.classList.add("is-swapping-in");
    mountGuestWallSlotCard(slotNode, nextCardId, true);
    window.setTimeout(() => {
      slotNode.classList.remove("is-swapping-in");
    }, GUEST_WALL_SWAP_FADE_IN_MS + 40);
  }, GUEST_WALL_SWAP_FADE_OUT_MS);
}

function renderGuestWallDesktop({ reshuffle = false } = {}) {
  if (!(guestWallPinboard instanceof HTMLElement)) return;

  guestWallPinboard.innerHTML = "";
  guestWallSlotNodes = [];

  const slotMap = getGuestWallSlotMapForCycle(false);
  const slotCount = Math.min(slotMap.length, guestWallCards.length, GUEST_WALL_DESKTOP_VISIBLE_SLOTS);
  const containerRect = guestWallPinboard.getBoundingClientRect();
  const arrangedSlots = resolveGuestWallSlotLayout(slotMap.slice(0, slotCount), containerRect, false, {
    jitterMaxPx: GUEST_WALL_SLOT_JITTER_DESKTOP,
    jitterSeed: `desktop:${guestWallLayoutCycle}`,
  });
  guestWallActiveSlotConfig = arrangedSlots.slice(0, slotCount);
  if (!guestWallCards.length) {
    const empty = document.createElement("p");
    empty.className = "guestwall-empty";
    empty.textContent = GUEST_WALL_EMPTY_MESSAGE;
    guestWallPinboard.appendChild(empty);
    return;
  }

  ensureGuestWallVisibleIds(slotCount, reshuffle);
  guestWallVisibleCardIds = assignGuestWallCardsToSlots(guestWallActiveSlotConfig, guestWallVisibleCardIds);

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    const slotNode = document.createElement("div");
    slotNode.className = "guestwall-slot";
    bindGuestWallSlotInteraction(slotNode);
    placeGuestWallSlot(slotNode, arrangedSlots[slotIndex] || slotMap[slotIndex]);
    const cardId = getGuestWallVisibleCardId(slotIndex);
    if (cardId) {
      mountGuestWallSlotCard(slotNode, cardId, false);
    }
    guestWallPinboard.appendChild(slotNode);
    guestWallSlotNodes.push(slotNode);
  }
  hydrateGuestWallSlotArrangeMetrics();
  syncGuestWallArrangeAvailability();
  setGuestWallArrangeMode(guestWallArrangeMode);
}

function scheduleGuestWallDesktopRotation() {
  clearGuestWallDesktopTimer();
  if (guestWallPaused || isGuestWallMobileView() || guestWallVisibleCardIds.length <= 1 || guestWallSlotNodes.length <= 1) return;
  guestWallRotationTimer = window.setTimeout(() => {
    shuffleGuestWallVisibleSubset();
    scheduleGuestWallDesktopRotation();
  }, GUEST_WALL_AUTOPLAY_INTERVAL_MS);
}

function renderGuestWallMobile() {
  if (!(guestWallMobile instanceof HTMLElement)) return;
  guestWallMobile.innerHTML = "";

  if (!guestWallCards.length) {
    const empty = document.createElement("p");
    empty.className = "guestwall-status";
    empty.textContent = GUEST_WALL_EMPTY_MESSAGE;
    guestWallMobile.appendChild(empty);
    return;
  }

  const stage = document.createElement("div");
  stage.className = "guestwall-mobile-stage guestwall-mobile-stage--collage";
  guestWallMobile.appendChild(stage);
  guestWallSlotNodes = [];

  const slotMap = getGuestWallSlotMapForCycle(true);
  const slotCount = Math.min(slotMap.length, guestWallCards.length, GUEST_WALL_MOBILE_VISIBLE_SLOTS);
  const containerRect = stage.getBoundingClientRect();
  const arrangedSlots = resolveGuestWallSlotLayout(slotMap.slice(0, slotCount), containerRect, true, {
    jitterMaxPx: GUEST_WALL_SLOT_JITTER_MOBILE,
    jitterSeed: `mobile:${guestWallLayoutCycle}`,
  });
  guestWallActiveSlotConfig = arrangedSlots.slice(0, slotCount);
  ensureGuestWallVisibleIds(slotCount, false);
  guestWallVisibleCardIds = assignGuestWallCardsToSlots(guestWallActiveSlotConfig, guestWallVisibleCardIds);

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    const slotNode = document.createElement("div");
    slotNode.className = "guestwall-slot";
    bindGuestWallSlotInteraction(slotNode);
    placeGuestWallSlot(slotNode, arrangedSlots[slotIndex] || slotMap[slotIndex]);
    const cardId = getGuestWallVisibleCardId(slotIndex);
    if (cardId) {
      mountGuestWallSlotCard(slotNode, cardId, false);
    }
    stage.appendChild(slotNode);
    guestWallSlotNodes.push(slotNode);
  }
  hydrateGuestWallSlotArrangeMetrics();
  setGuestWallArrangeMode(false);
  syncGuestWallArrangeAvailability();
}

function scheduleGuestWallMobileRotation() {
  clearGuestWallMobileTimer();
  if (guestWallPaused || !isGuestWallMobileView() || guestWallVisibleCardIds.length <= 1 || guestWallSlotNodes.length <= 1) return;
  guestWallMobileTimer = window.setTimeout(() => {
    shuffleGuestWallVisibleSubset();
    scheduleGuestWallMobileRotation();
  }, GUEST_WALL_AUTOPLAY_INTERVAL_MS);
}

function syncGuestWallLayout({ reshuffle = false } = {}) {
  if (!(guestWallPinboard instanceof HTMLElement) || !(guestWallMobile instanceof HTMLElement)) return;

  const mobile = isGuestWallMobileView();
  setHiddenClass(guestWallPinboard, mobile);
  setHiddenClass(guestWallMobile, !mobile);

  if (mobile) {
    clearGuestWallDesktopTimer();
    if (reshuffle) guestWallVisibleCardIds = [];
    renderGuestWallMobile();
    scheduleGuestWallMobileRotation();
    return;
  }

  clearGuestWallMobileTimer();
  renderGuestWallDesktop({ reshuffle });
  scheduleGuestWallDesktopRotation();
}

function setGuestWallPaused(paused) {
  guestWallPaused = Boolean(paused);

  if (guestWallAutoplayToggle instanceof HTMLButtonElement) {
    const isOn = !guestWallPaused;
    const stateText = isOn ? "ON" : "OFF";
    guestWallAutoplayToggle.classList.toggle("is-on", isOn);
    guestWallAutoplayToggle.classList.toggle("is-off", !isOn);
    guestWallAutoplayToggle.dataset.state = stateText;
    guestWallAutoplayToggle.setAttribute("aria-checked", isOn ? "true" : "false");
    guestWallAutoplayToggle.setAttribute("aria-label", isOn ? "Auto-shuffle on" : "Auto-shuffle off");
    if (guestWallAutoplayControl instanceof HTMLElement) {
      guestWallAutoplayControl.dataset.state = stateText;
      guestWallAutoplayControl.classList.toggle("is-on", isOn);
      guestWallAutoplayControl.classList.toggle("is-off", !isOn);
    }
    if (guestWallAutoplayState instanceof HTMLElement) {
      guestWallAutoplayState.textContent = stateText;
      guestWallAutoplayState.classList.toggle("is-on", isOn);
      guestWallAutoplayState.classList.toggle("is-off", !isOn);
    }
  }

  if (guestWallPaused) {
    clearGuestWallDesktopTimer();
    clearGuestWallMobileTimer();
    return;
  }

  if (isGuestWallMobileView()) scheduleGuestWallMobileRotation();
  else scheduleGuestWallDesktopRotation();
}

function waitForGuestWallVisibleMediaReady(maxWaitMs = 1500) {
  const mediaNodes = guestWallSlotNodes
    .map((slotNode) => slotNode.querySelector("img,video"))
    .filter((node) => node instanceof HTMLImageElement || node instanceof HTMLVideoElement);
  if (!mediaNodes.length) return Promise.resolve();

  const loadPromises = mediaNodes.map((node) => {
    if (node instanceof HTMLImageElement) {
      if (node.complete && node.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        const onDone = () => {
          node.removeEventListener("load", onDone);
          node.removeEventListener("error", onDone);
          resolve();
        };
        node.addEventListener("load", onDone, { once: true });
        node.addEventListener("error", onDone, { once: true });
      });
    }

    if (node instanceof HTMLVideoElement) {
      if (node.readyState >= 2) return Promise.resolve();
      return new Promise((resolve) => {
        const onDone = () => {
          node.removeEventListener("loadeddata", onDone);
          node.removeEventListener("error", onDone);
          resolve();
        };
        node.addEventListener("loadeddata", onDone, { once: true });
        node.addEventListener("error", onDone, { once: true });
      });
    }

    return Promise.resolve();
  });

  const timeoutPromise = new Promise((resolve) => {
    window.setTimeout(resolve, maxWaitMs);
  });

  return Promise.race([Promise.all(loadPromises), timeoutPromise]);
}

function shuffleGuestWallVisibleSubset() {
  if (!guestWallCards.length || !guestWallVisibleCardIds.length || !guestWallSlotNodes.length) return;

  const slotCount = Math.min(guestWallVisibleCardIds.length, guestWallSlotNodes.length);
  if (slotCount <= 1) return;

  const currentVisible = guestWallVisibleCardIds.slice(0, slotCount);
  const allIds = guestWallCards.map((card) => card.id);
  if (allIds.length <= 1) return;
  const slotConfig = guestWallActiveSlotConfig.slice(0, slotCount);

  const requestedReplacements = clampNumber(Math.round(slotCount * GUEST_WALL_SHUFFLE_REPLACE_RATIO), 1, slotCount - 1);
  const candidateArrangement = assignGuestWallCardsToSlots(slotConfig, shuffleItems(allIds));
  const nextVisible = currentVisible.slice();
  const slotIndexes = shuffleItems(Array.from({ length: slotCount }, (_, idx) => idx));
  const replacementIndexes = slotIndexes.slice(0, requestedReplacements);
  const preservedIndexes = slotIndexes.slice(requestedReplacements);
  const usedIds = new Set(preservedIndexes.map((idx) => currentVisible[idx]).filter(Boolean));
  const changedIndexes = [];

  replacementIndexes.forEach((slotIndex) => {
    let replacementId =
      candidateArrangement.find((id) => id && !usedIds.has(id) && id !== currentVisible[slotIndex]) ||
      allIds.find((id) => id && !usedIds.has(id) && id !== currentVisible[slotIndex]) ||
      "";

    if (!replacementId) return;
    usedIds.add(replacementId);
    nextVisible[slotIndex] = replacementId;
    if (replacementId !== currentVisible[slotIndex]) {
      changedIndexes.push(slotIndex);
    }
  });

  if (!changedIndexes.length) {
    const fallbackIndexes = slotIndexes.slice(0, 1);
    fallbackIndexes.forEach((slotIndex) => {
      const fallbackId = allIds.find((id) => id && id !== currentVisible[slotIndex]);
      if (!fallbackId) return;
      nextVisible[slotIndex] = fallbackId;
      if (fallbackId !== currentVisible[slotIndex]) changedIndexes.push(slotIndex);
    });
  }

  if (!changedIndexes.length) return;

  guestWallVisibleCardIds = nextVisible.slice();
  changedIndexes.forEach((slotIndex) => {
    const nextCardId = nextVisible[slotIndex];
    if (!nextCardId) return;
    swapGuestWallSlotCard(slotIndex, nextCardId);
  });

  maybePrefetchGuestWallBuffer();
}

function bindGuestWallEvents() {
  if (!(guestWallPinboard instanceof HTMLElement)) return;
  if (guestWallPinboard.dataset.bound === "true") return;

  if (guestWallShuffle instanceof HTMLButtonElement) {
    guestWallShuffle.addEventListener("click", async () => {
      if (!guestWallCards.length) return;
      if (guestWallIsShuffling || guestWallShuffle.disabled) return;
      try {
        setGuestWallShuffleState(true);
        flashGuestWallButton(guestWallShuffle);
        shuffleGuestWallVisibleSubset();
        if (!guestWallPaused) {
          if (isGuestWallMobileView()) scheduleGuestWallMobileRotation();
          else scheduleGuestWallDesktopRotation();
        }
        await waitForGuestWallVisibleMediaReady(1500);
      } finally {
        setGuestWallShuffleState(false);
      }
    });
  }

  if (guestWallAutoplayToggle instanceof HTMLButtonElement) {
    guestWallAutoplayToggle.addEventListener("click", () => {
      setGuestWallPaused(!guestWallPaused);
    });
  }

  if (guestWallArrangeToggle instanceof HTMLButtonElement) {
    guestWallArrangeToggle.addEventListener("click", () => {
      if (!isGuestWallArrangeCapable()) return;
      setGuestWallArrangeMode(!guestWallArrangeMode);
    });
  }

  window.addEventListener(
    "resize",
    () => {
      if (guestWallResizeRaf) return;
      guestWallResizeRaf = window.requestAnimationFrame(() => {
        guestWallResizeRaf = null;
        const currentWidth = window.innerWidth || 0;
        const widthDelta = Math.abs(currentWidth - guestWallLastViewportWidth);
        guestWallLastViewportWidth = currentWidth;
        syncGuestWallArrangeAvailability();
        if (isGuestWallMobileView() && widthDelta < 2) return;
        syncGuestWallLayout();
      });
    },
    { passive: true },
  );

  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target && target.closest(".guestwall-slot")) return;
    setGuestWallActiveSlot(null);
  });

  guestWallPinboard.dataset.bound = "true";
}

function getGuestWallPinboardRequestLimit() {
  return isGuestWallMobileView() ? GUEST_WALL_PINBOARD_BUFFER_MOBILE : GUEST_WALL_PINBOARD_BUFFER_DESKTOP;
}

function mergeGuestWallCards(newCards) {
  if (!Array.isArray(newCards) || !newCards.length) return;
  const merged = [...guestWallCards];
  const seen = new Set(merged.map((card) => card.id));
  newCards.forEach((card) => {
    if (!card || !card.id || seen.has(card.id)) return;
    seen.add(card.id);
    merged.push(card);
  });
  guestWallCards = merged;
  guestWallCardById = new Map(merged.map((card) => [card.id, card]));
}

async function maybePrefetchGuestWallBuffer() {
  if (!guestWallNextCursor || guestWallPrefetchInFlight) return;
  if (!guestWallVisibleCardIds.length) return;
  const remainingPool = guestWallCards.length - guestWallVisibleCardIds.length;
  if (remainingPool > GUEST_WALL_PREFETCH_THRESHOLD) return;

  guestWallPrefetchInFlight = (async () => {
    try {
      const payload = await fetchGuestbookPage({
        mode: "pinboard",
        limit: getGuestWallPinboardRequestLimit(),
        cursor: guestWallNextCursor,
      });
      guestWallNextCursor = payload.nextCursor;
      const cards = normalizeGuestWallCards(payload.items);
      mergeGuestWallCards(cards);
    } catch (error) {
      console.warn("[guestwall] prefetch failed", error instanceof Error ? error.message : String(error));
    } finally {
      guestWallPrefetchInFlight = null;
    }
  })();

  return guestWallPrefetchInFlight;
}

async function initGuestWall() {
  if (!(guestWallPinboard instanceof HTMLElement)) return;

  guestWallArrangementByCardId = loadGuestWallArrangementFromStorage();
  bindGuestWallDetailModalEvents();
  bindGuestWallEvents();
  syncGuestWallArrangeAvailability();
  if (guestWallPinboardView instanceof HTMLElement) setHiddenClass(guestWallPinboardView, false);
  await loadGuestWallPinboard({ refresh: false });
}

async function loadGuestWallPinboard({ refresh = false } = {}) {
  if (guestWallRequestInFlight) return guestWallRequestInFlight;

  setGuestWallLoadState("loading");
  setGuestWallStatus(GUEST_WALL_LOADING_MESSAGE);
  setGuestWallShuffleState(false);
  setGuestWallControlsDisabled(true);
  renderGuestWallLoadingSkeleton();
  startGuestWallSlowMessageRotation();

  const request = (async () => {
    try {
      const payload = await fetchGuestbookPage({
        mode: "pinboard",
        limit: getGuestWallPinboardRequestLimit(),
        refresh,
      });
      const cards = normalizeGuestWallCards(payload.items);
      guestWallCards = [];
      guestWallCardById = new Map();
      mergeGuestWallCards(cards);
      guestWallNextCursor = payload.nextCursor;
      guestWallPrefetchInFlight = null;
      if (!cards.length) {
        clearGuestWallSlowMessageTimers();
        setGuestWallLoadState("success");
        setGuestWallStatus(GUEST_WALL_EMPTY_MESSAGE);
        syncGuestWallLayout({ reshuffle: true });
        return;
      }

      clearGuestWallSlowMessageTimers();
      setGuestWallLoadState("success");
      setGuestWallStatus(GUEST_WALL_READY_MESSAGE);
      setGuestWallControlsDisabled(false);
      guestWallLayoutCycle = 0;
      guestWallVisibleCardIds = [];
      setGuestWallPaused(false);
      syncGuestWallLayout({ reshuffle: true });
      maybePrefetchGuestWallBuffer();
    } catch (error) {
      console.error("[guestwall] load failed", {
        message: error instanceof Error ? error.message : String(error),
        status: error && typeof error === "object" ? error.status : undefined,
        url: error && typeof error === "object" ? error.url : undefined,
        durationMs: error && typeof error === "object" ? error.durationMs : undefined,
        responseBytes: error && typeof error === "object" ? error.responseBytes : undefined,
        itemCount: error && typeof error === "object" ? error.itemCount : undefined,
        isTimeout: error && typeof error === "object" ? error.isTimeout : undefined,
        cause: error && typeof error === "object" ? error.cause : undefined,
        responseBody: error && typeof error === "object" ? error.responseBody : undefined,
      });
      clearGuestWallSlowMessageTimers();
      const classified = classifyGuestWallError(error);
      renderGuestWallErrorStateWithMessage.lastDetail =
        `[dev] status=${error && typeof error === "object" ? error.status || 0 : 0} reason=${classified.reason} durationMs=${
          error && typeof error === "object" ? error.durationMs || 0 : 0
        } url=${error && typeof error === "object" ? error.url || "n/a" : "n/a"}`;
      setGuestWallLoadState(classified.state);
      setGuestWallStatus(classified.statusMessage);
      setGuestWallControlsDisabled(true);
      guestWallNextCursor = null;
      guestWallPrefetchInFlight = null;
      renderGuestWallErrorStateWithMessage(classified.panelMessage);
    } finally {
      clearGuestWallSlowMessageTimers();
      guestWallRequestInFlight = null;
    }
  })();

  guestWallRequestInFlight = request;
  return request;
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
  if (name.startsWith("/public/our-story/")) return withBasePath(name);
  if (name.startsWith("/our-story/") || name.startsWith("/our-story-normalized/")) {
    const fileName = name.split("/").pop() || "";
    return withBasePath(`/public/our-story/${fileName}`);
  }
  if (name.startsWith("/public/")) return withBasePath(name.replace(/^\/public(?=\/)/, ""));
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
  const parsedMobilePosition = parseFocalFromObjectPosition(entry.mobileObjectPosition, focalX, focalY);
  const mobileObjectPosition = parsedMobilePosition ? toGalleryObjectPosition(parsedMobilePosition.x, parsedMobilePosition.y) : "";

  return {
    id: String(entry.id || entry.file || entry.src || "").trim(),
    file: String(entry.file || entry.src || "").trim(),
    alt: String(entry.alt || "").trim(),
    cropClass: String(entry.cropClass || "img-round").trim(),
    focalX,
    focalY,
    objectPosition: toGalleryObjectPosition(focalX, focalY),
    mobileObjectPosition,
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
  const wasOpen = isGalleryLightboxOpen();
  closeStoryLightbox();

  const nextIndex = Number(index);
  currentGalleryIndex = Number.isFinite(nextIndex) ? ((nextIndex % galleryImages.length) + galleryImages.length) % galleryImages.length : 0;
  updateGalleryLightboxView();

  galleryLightbox.classList.remove("hidden");
  galleryLightbox.classList.add("open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  if (!wasOpen) lockBodyScroll();
}

function openLightbox(index) {
  openGalleryLightbox(index);
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage || !isGalleryLightboxOpen()) return;
  galleryLightbox.classList.add("hidden");
  galleryLightbox.classList.remove("open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  galleryLightboxImage.removeAttribute("src");
  unlockBodyScroll();
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
  const baseObjectPosition = toGalleryObjectPosition(focalX, focalY);
  const objectPosition = isGalleryMobileView() ? entry.mobileObjectPosition || baseObjectPosition : baseObjectPosition;
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

function syncGalleryObjectPositions() {
  if (!galleryGrid || !galleryImages.length) return;
  const isMobile = isGalleryMobileView();
  const cards = Array.from(galleryGrid.querySelectorAll(".gallery-tile"));
  cards.forEach((card, index) => {
    const entry = galleryImages[index];
    if (!entry) return;
    const img = card.querySelector("img");
    if (!(img instanceof HTMLImageElement)) return;
    const fallbackPosition = entry.objectPosition || toGalleryObjectPosition(RECENT_DEFAULT_FOCAL_X, RECENT_DEFAULT_FOCAL_Y);
    const objectPosition = isMobile ? entry.mobileObjectPosition || fallbackPosition : fallbackPosition;
    img.style.objectPosition = objectPosition;
    card.style.setProperty("--objPos", objectPosition);
  });
}

function isGalleryMobileView() {
  return window.matchMedia("(max-width: 600px)").matches;
}

function setActiveGalleryDot(index) {
  if (!galleryDots) return;
  const dots = Array.from(galleryDots.querySelectorAll(".gallery-dot"));
  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === index;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
}

function syncGalleryDotFromScroll() {
  if (!galleryGrid || !galleryImages.length || !isGalleryMobileView()) return;
  const width = galleryGrid.clientWidth || 1;
  const index = Math.round(galleryGrid.scrollLeft / width);
  const boundedIndex = Math.max(0, Math.min(galleryImages.length - 1, index));
  setActiveGalleryDot(boundedIndex);
}

function renderGalleryDots() {
  if (!galleryDots) return;
  galleryDots.innerHTML = "";

  if (!galleryImages.length || (isGalleryMobileView() && galleryImages.length > MOBILE_GALLERY_DOT_MAX)) {
    galleryDots.hidden = true;
    return;
  }

  galleryImages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", `Go to photo ${index + 1}`);
    dot.setAttribute("aria-current", "false");
    dot.addEventListener("click", () => {
      if (!galleryGrid || !isGalleryMobileView()) return;
      const left = index * galleryGrid.clientWidth;
      galleryGrid.scrollLeft = left;
      setActiveGalleryDot(index);
    });
    galleryDots.appendChild(dot);
  });

  galleryDots.hidden = !isGalleryMobileView();
  setActiveGalleryDot(0);
}

function bindGalleryMobileCarouselEvents() {
  if (!galleryGrid || galleryGrid.dataset.carouselBound === "true") return;

  galleryGrid.addEventListener(
    "scroll",
    () => {
      if (galleryScrollRaf) return;
      galleryScrollRaf = window.requestAnimationFrame(() => {
        galleryScrollRaf = null;
        syncGalleryDotFromScroll();
      });
    },
    { passive: true },
  );

  window.addEventListener(
    "resize",
    () => {
      if (galleryDots) {
        const hideDots = !isGalleryMobileView() || !galleryImages.length || galleryImages.length > MOBILE_GALLERY_DOT_MAX;
        galleryDots.hidden = hideDots;
      }
      syncGalleryObjectPositions();
      syncGalleryDotFromScroll();
    },
    { passive: true },
  );

  galleryGrid.dataset.carouselBound = "true";
}

async function initGallery() {
  if (!galleryGrid) return;
  bindGalleryLightboxEvents();
  bindGalleryMobileCarouselEvents();

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

  syncGalleryObjectPositions();
  renderGalleryDots();
  syncGalleryDotFromScroll();
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
      mobileObjectPosition: "",
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
      mobileObjectPosition: "",
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
    mobileObjectPosition: String(entry.mobileObjectPosition || "").trim(),
    fit: String(entry.fit || "").trim(),
    cropMode: normalizeCropMode(entry.cropMode || entry.fit),
    rotationDeg: Number.isFinite(Number(entry.rotationDeg)) ? Number(entry.rotationDeg) : NaN,
    rotation: Number.isFinite(Number(entry.rotation))
      ? Number(entry.rotation)
      : Number.isFinite(Number(entry.rotationDeg))
        ? Number(entry.rotationDeg)
        : 0,
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
      mobileObjectPosition: entry.mobileObjectPosition,
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
  const manifestUrl = withBasePath("/photos/timeline-photos/manifest.json");
  const startedAt = typeof performance !== "undefined" && performance && typeof performance.now === "function" ? performance.now() : Date.now();
  storyFetchErrorState = null;

  const normalizeManifestStoryPath = (rawPath, fallbackFolder = "/photos/timeline-photos/") => {
    const value = String(rawPath || "").trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        const pathname = url.pathname || "";
        if (pathname.startsWith("/our-story-normalized/") || pathname.startsWith("/our-story/") || pathname.startsWith("/public/our-story/")) {
          const fileName = pathname.split("/").pop() || "";
          return `/public/our-story/${fileName}`;
        }
        if (pathname.startsWith("/public/") || pathname.startsWith("/photos/")) {
          return pathname;
        }
        return pathname || "";
      } catch (_error) {
        return "";
      }
    }

    if (value.startsWith("/our-story-normalized/") || value.startsWith("/our-story/") || value.startsWith("/public/our-story/")) {
      const fileName = value.split("/").pop() || "";
      return `/public/our-story/${fileName}`;
    }
    if (value.startsWith("/public/") || value.startsWith("/photos/")) return value;
    if (value.startsWith("/")) return value;
    return `${fallbackFolder}${encodeURIComponent(value)}`;
  };

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), STORY_FETCH_TIMEOUT_MS) : null;

  try {
    const response = await fetch(manifestUrl, {
      cache: "no-store",
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!response.ok) {
      const error = new Error(`Story manifest request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const payload = await response.json();

    const rows = Array.isArray(payload)
      ? payload
      : payload && Array.isArray(payload.timeline)
        ? payload.timeline
        : payload && Array.isArray(payload.files)
          ? payload.files
          : [];

    const normalized = rows
      .map((entry) => normalizeStoryEntry(entry))
      .filter((entry) => entry.file)
      .map((entry) => ({
        ...entry,
        file: normalizeManifestStoryPath(entry.file),
        mosaicFile: entry.mosaicFile
          ? normalizeManifestStoryPath(entry.mosaicFile, "/images/story-crops/")
          : normalizeManifestStoryPath(entry.file),
      }));

    const durationMs = Math.round(
      (typeof performance !== "undefined" && performance && typeof performance.now === "function" ? performance.now() : Date.now()) - startedAt,
    );
    console.info("[story] manifest loaded", {
      url: manifestUrl,
      status: response.status,
      durationMs,
      itemCount: normalized.length,
    });

    return normalized;
  } catch (error) {
    const durationMs = Math.round(
      (typeof performance !== "undefined" && performance && typeof performance.now === "function" ? performance.now() : Date.now()) - startedAt,
    );
    const statusCode = Number(error?.status) || 0;
    const timedOut = Boolean(error?.name === "AbortError");
    const reason = timedOut
      ? "timeout"
      : statusCode === 401 || statusCode === 403
        ? "permission"
        : statusCode === 404
          ? "not_found"
          : statusCode === 429
            ? "rate_limit"
            : statusCode >= 500
              ? "server"
              : "network";
    const panelMessage = timedOut ? STORY_TIMEOUT_MESSAGE : STORY_ERROR_MESSAGE;

    storyFetchErrorState = {
      state: timedOut ? "timeout" : "error",
      reason,
      statusCode,
      url: manifestUrl,
      durationMs,
      panelMessage,
    };

    console.error("[story] manifest load failed", {
      url: manifestUrl,
      status: statusCode,
      reason,
      durationMs,
      error: error?.message || String(error),
    });

    return [];
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
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

function ensureStoryDebugNode() {
  if (!IS_LOCAL_DEV || !(storySection instanceof HTMLElement)) return null;
  if (storyDebugNode instanceof HTMLElement && storyDebugNode.isConnected) return storyDebugNode;
  const node = document.createElement("p");
  node.id = "storyDebugStatus";
  node.style.margin = "6px 0 0";
  node.style.fontSize = "11px";
  node.style.lineHeight = "1.3";
  node.style.color = "rgba(75, 15, 23, 0.78)";
  node.style.wordBreak = "break-all";
  node.style.display = "none";
  storySection.appendChild(node);
  storyDebugNode = node;
  return node;
}

function setStoryDebugMessage(message) {
  if (!IS_LOCAL_DEV) return;
  const node = ensureStoryDebugNode();
  if (!(node instanceof HTMLElement)) return;
  const text = String(message || "").trim();
  node.textContent = text;
  node.style.display = text ? "block" : "none";
}

function attachStoryFallback(img, fallbackSrc, originalSrc, meta = {}) {
  if (!(img instanceof HTMLImageElement)) return;
  const fallback = String(fallbackSrc || "").trim();
  const original = String(originalSrc || "").trim();
  const year = String(meta?.year || "").trim();
  img.dataset.fallbackSrc = fallback;
  img.dataset.fallbackUsed = "false";
  img.dataset.retryUsed = "false";
  img.dataset.storyYear = year;
  img.classList.remove("story-image--placeholder");
  img.classList.add("is-loading");
  const mediaWrap = img.closest(".story-lightbox-media");
  if (mediaWrap instanceof HTMLElement) mediaWrap.classList.add("is-loading");
  img.onload = () => {
    img.classList.remove("story-image--placeholder");
    img.classList.remove("is-loading");
    if (mediaWrap instanceof HTMLElement) mediaWrap.classList.remove("is-loading");
    if (IS_LOCAL_DEV) {
      console.info("[story] image loaded", {
        year: img.dataset.storyYear || year || "unknown",
        origin: window.location.origin,
        src: img.currentSrc || img.getAttribute("src") || "",
      });
      setStoryDebugMessage("");
    }
  };
  img.onerror = () => {
    const failingSrc = img.currentSrc || img.getAttribute("src") || "";
    console.warn("[story] image failed", {
      year: img.dataset.storyYear || year || "unknown",
      origin: window.location.origin,
      src: failingSrc,
      fallback: img.dataset.fallbackSrc,
      retried: img.dataset.retryUsed === "true",
      ua: navigator.userAgent,
    });
    if (IS_LOCAL_DEV) setStoryDebugMessage(`Failed to load: ${failingSrc}`);

    if (img.dataset.retryUsed !== "true") {
      const retryBase = original || failingSrc;
      if (retryBase) {
        img.dataset.retryUsed = "true";
        const separator = retryBase.includes("?") ? "&" : "?";
        img.src = `${retryBase}${separator}retry=${Date.now()}`;
        return;
      }
    }

    const nextSrc = String(img.dataset.fallbackSrc || "").trim();
    if (nextSrc && img.dataset.fallbackUsed !== "true") {
      img.dataset.fallbackUsed = "true";
      img.src = nextSrc;
      return;
    }
    img.onerror = null;
    img.classList.remove("is-loading");
    if (mediaWrap instanceof HTMLElement) mediaWrap.classList.remove("is-loading");
    img.classList.add("story-image--placeholder");
    img.src = STORY_IMAGE_PLACEHOLDER_DATA_URI;
  };
}

function applyStoryImageRotation(img, rotation, scaleVarName, scales = {}) {
  if (!(img instanceof HTMLElement)) return;
  const normalizedRotation = Number.isFinite(Number(rotation)) ? Number(rotation) : 0;
  const isQuarterTurn = Math.abs(normalizedRotation) === 90;
  const isHalfTurn = Math.abs(normalizedRotation) === 180;
  const scaleValue = isQuarterTurn
    ? Number(scales.quarterTurn ?? 1.05)
    : isHalfTurn
      ? Number(scales.halfTurn ?? 1.01)
      : Number(scales.defaultScale ?? 1);

  img.style.setProperty("--storyRotate", `${normalizedRotation}deg`);
  img.style.setProperty(scaleVarName, String(scaleValue));
  img.classList.toggle("story-image--quarter-turn", isQuarterTurn);
}

function buildStoryTimelineSlide(item, index) {
  const slide = document.createElement("article");
  slide.className = "story-slide";
  slide.dataset.index = String(index);

  const media = document.createElement("figure");
  media.className = "story-slide-media";

  const img = document.createElement("img");
  const imageSources = storyImageSources(item, false);
  img.style.imageOrientation = "none";
  img.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.objectFit = item.cropMode === "contain" || item.fit === "contain" ? "contain" : "cover";
  applyStoryImageRotation(img, item.rotation, "--storyScale", {
    quarterTurn: 1.05,
    halfTurn: 1.01,
    defaultScale: 1,
  });
  attachStoryFallback(img, imageSources.fallback, imageSources.preferred || imageSources.original, { year: item.yearLabel });
  img.src = imageSources.preferred;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";

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
  return window.matchMedia("(max-width: 768px)").matches;
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
        scrollToElement(target, { block: "center", allowMobile: false });
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

function applyStoryImagePresentation(img, item, mobileView, fallbackSrc, originalSrc) {
  if (!(img instanceof HTMLImageElement) || !item) return;
  img.style.objectPosition = mobileView
    ? item.mobileObjectPosition || item.objectPosition || "50% 20%"
    : item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.imageOrientation = "none";
  img.style.objectFit = "contain";
  img.style.transformOrigin = "50% 50%";
  applyStoryImageRotation(img, item.rotation, "--storyScale", {
    quarterTurn: 1.05,
    halfTurn: 1.01,
    defaultScale: 1,
  });
  attachStoryFallback(img, fallbackSrc, originalSrc || img.src, { year: item.yearLabel });
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
}

function preloadStoryImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function waitForImageElementReady(img, src) {
  return new Promise((resolve, reject) => {
    if (!(img instanceof HTMLImageElement) || !src) {
      reject(new Error("invalid image source"));
      return;
    }

    let settled = false;
    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = async () => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        await img.decode();
      } catch (_error) {
        // Safari may reject decode even after onload; keep rendering path uninterrupted.
      }
      resolve();
    };

    img.onerror = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error || new Error("image load failed"));
    };

    img.src = src;
    if (img.complete) {
      img.onload?.();
    }
  });
}

async function setStoryMobileSlide(index, options = {}) {
  if (!storyItems.length || !storyMobileImgCurrent || !storyMobileImgNext || !storyMobileYear) return;

  const { scrollPill = true } = options;
  const mobileView = isStoryMobileView();
  const total = storyItems.length;
  const safeIndex = ((Number(index) || 0) % total + total) % total;
  const item = storyItems[safeIndex];
  storyMobileIndex = safeIndex;
  const swapToken = ++storyMobileSwapToken;
  const imageSources = storyImageSources(item, true);
  const imageSrc = imageSources.original || imageSources.preferred;
  const fallbackSrc = imageSources.fallback;
  if (IS_LOCAL_DEV) {
    console.info("[story] selected image", {
      year: item.yearLabel,
      origin: window.location.origin,
      src: imageSrc,
      fallback: fallbackSrc,
    });
  }

  applyStoryImagePresentation(storyMobileImgCurrent, item, mobileView, fallbackSrc, imageSrc);
  applyStoryImagePresentation(storyMobileImgNext, item, mobileView, fallbackSrc, imageSrc);

  try {
    await preloadStoryImage(imageSrc);
  } catch (_error) {
    // Fallback still handles broken source.
  }
  if (swapToken !== storyMobileSwapToken) return;

  let imageReady = false;
  try {
    await waitForImageElementReady(storyMobileImgNext, imageSrc);
    imageReady = true;
  } catch (_error) {
    // Broken preferred source is handled by fallback on the element itself.
    storyMobileImgNext.src = imageSrc;
  }
  if (swapToken !== storyMobileSwapToken) return;

  if (!storyMobileImgCurrent.src || !storyMobileImgCurrent.getAttribute("src")) {
    storyMobileImgCurrent.src = imageSrc;
    if (storyMobileCard) {
      storyMobileCard.classList.remove("is-swapping");
      storyMobileCard.classList.toggle("is-contain", true);
      storyMobileCard.style.setProperty("--storyMobileBgImage", imageSrc ? `url("${imageSrc}")` : "none");
    }
  } else if (imageReady) {
    if (storyMobileCard) {
      storyMobileCard.classList.add("is-swapping");
      storyMobileCard.classList.toggle("is-contain", true);
      storyMobileCard.style.setProperty("--storyMobileBgImage", imageSrc ? `url("${imageSrc}")` : "none");
    }

    await new Promise((resolve) => window.setTimeout(resolve, STORY_MOBILE_CROSSFADE_MS));
    if (swapToken !== storyMobileSwapToken) return;
    storyMobileImgCurrent.src = imageSrc;
    if (storyMobileCard) storyMobileCard.classList.remove("is-swapping");
  }

  storyMobileYear.textContent = item.yearLabel;
  if (storyMobileBlurb) storyMobileBlurb.textContent = item.blurb || "";
  setActiveStoryScrubberIndex(safeIndex);

  if (scrollPill && storyYearButtons[safeIndex]) {
    const pill = storyYearButtons[safeIndex];
    if (storyYearScrubber) {
      const centeredLeft = pill.offsetLeft - Math.max(0, (storyYearScrubber.clientWidth - pill.clientWidth) / 2);
      storyYearScrubber.scrollLeft = Math.max(0, centeredLeft);
    }
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
  if (storyMosaicShell) {
    storyMosaicShell.hidden = isMobile;
    storyMosaicShell.setAttribute("aria-hidden", String(isMobile));
  }
  storyMosaicLayout.hidden = isMobile;
  storyMosaicLayout.setAttribute("aria-hidden", String(isMobile));
  bindStoryYearObserver(isMobile ? [] : storyPathTargets);

  if (isMobile && storyItems.length) {
    setStoryMobileSlide(storyMobileIndex, { scrollPill: true });
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
  if (isMobileViewport()) {
    storyViewport.scrollLeft = target.offsetLeft;
  } else {
    storyViewport.scrollTo({
      left: target.offsetLeft,
      behavior,
    });
  }
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
  img.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.objectFit = item.cropMode === "contain" ? "contain" : "cover";
  img.style.imageOrientation = "none";
  applyStoryImageRotation(img, item.rotation, "--storyTileScale", {
    quarterTurn: 1.05,
    halfTurn: 1.01,
    defaultScale: 1,
  });
  attachStoryFallback(img, imageSources.fallback, imageSources.preferred || imageSources.original, { year: item.yearLabel });
  img.src = imageSrc;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";

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
  storyMosaicLayout.innerHTML = "";
  storyMosaicLayout.appendChild(buildStoryLoadStateCard(STORY_LOADING_MESSAGE, false));
  const entries = sortStoryEntries(await loadStoryEntriesFromManifest());
  storyItems = entries.map((entry) => buildStoryItem(entry));
  storyMosaicLayout.innerHTML = "";
  bindStoryLightboxEvents();

  if (storyFetchErrorState) {
    storyMosaicLayout.appendChild(buildStoryLoadStateCard(storyFetchErrorState.panelMessage || STORY_ERROR_MESSAGE, true));
    storyPathTargets = [];
    clearStoryChronologyPath();
    renderStoryYearScrubber([], []);
    bindStoryYearObserver([]);
    syncStoryResponsiveMode();
    return;
  }

  if (!storyItems.length) {
    storyMosaicLayout.appendChild(buildStoryPlaceholder());
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
    orderedItems.findIndex((item) => Number(item.year) === 1998),
  );
  storyMobileIndex = preferredIndex;
  setStoryMobileSlide(preferredIndex, { scrollPill: true });
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
  const imageSources = storyImageSources(item, false);
  attachStoryFallback(storyLightboxImg, imageSources.fallback, imageSources.original, { year: item.yearLabel });
  storyLightboxImg.style.imageOrientation = "none";
  storyLightboxImg.style.objectPosition = item.objectPosition || "50% 50%";
  applyStoryImageRotation(storyLightboxImg, item.rotation, "--storyScale", {
    quarterTurn: 0.95,
    halfTurn: 0.99,
    defaultScale: 1,
  });
  storyLightboxImg.src = imageSources.original;
  storyLightboxImg.alt = item.alt || `Story photo ${item.year}`;
  if (storyLightboxTitle) storyLightboxTitle.textContent = item.title;
  if (storyLightboxBlurb) storyLightboxBlurb.textContent = item.blurb;
  if (storyLightboxLong) storyLightboxLong.textContent = item.longCaption;
  if (storyLightboxCounter) storyLightboxCounter.textContent = `${currentStoryIndex + 1} of ${storyItems.length}`;
}

function openStoryLightbox(index) {
  if (!storyLightbox || !storyItems.length) return;
  const wasOpen = isStoryLightboxOpen();
  closeGalleryLightbox();
  currentStoryIndex = Number.isFinite(index) ? ((index % storyItems.length) + storyItems.length) % storyItems.length : 0;
  updateStoryLightboxView();
  storyLightbox.classList.remove("hidden");
  storyLightbox.setAttribute("aria-hidden", "false");
  if (!wasOpen) lockBodyScroll();
}

function closeStoryLightbox() {
  if (!storyLightbox || !isStoryLightboxOpen()) return;
  storyLightbox.classList.add("hidden");
  storyLightbox.setAttribute("aria-hidden", "true");
  if (storyLightboxImg) storyLightboxImg.removeAttribute("src");
  clearStoryTileReveal(-1);
  unlockBodyScroll();
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
  // Story image files are now pre-rotated offline; keep runtime rotation disabled.
  const rotation = 0;
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
  const parsedMobilePosition = parseStoryObjectPosition(entry.mobileObjectPosition);
  const mobileObjectPosition = parsedMobilePosition ? toObjectPosition(parsedMobilePosition.x, parsedMobilePosition.y) : objectPosition;

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
    mobileObjectPosition,
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
  img.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  img.style.imageOrientation = "none";
  applyStoryImageRotation(img, item.rotation, "--storyScale", {
    quarterTurn: 1.05,
    halfTurn: 1.01,
    defaultScale: 1,
  });
  attachStoryFallback(img, imageSources.fallback, imageSources.preferred || imageSources.original, { year: item.yearLabel });
  img.src = imageSources.preferred || imageSources.original;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";

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

function buildStoryLoadStateCard(message, canRetry = false) {
  const tile = document.createElement("div");
  tile.className = "story-mosaic-empty story-mosaic-empty--error";

  const text = document.createElement("p");
  text.className = "story-mosaic-empty__message";
  text.textContent = String(message || STORY_ERROR_MESSAGE);
  tile.appendChild(text);

  if (canRetry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "story-status-retry";
    button.textContent = "Retry";
    button.addEventListener("click", () => {
      initStoryMosaicLayout();
    });
    tile.appendChild(button);
  }

  if (IS_LOCAL_DEV && storyFetchErrorState) {
    const details = document.createElement("p");
    details.className = "story-mosaic-empty__debug";
    details.textContent = `[dev] ${storyFetchErrorState.reason} status=${storyFetchErrorState.statusCode || 0} durationMs=${storyFetchErrorState.durationMs || 0}`;
    tile.appendChild(details);
  }

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
  storyFocusImage.style.imageOrientation = "none";
  storyFocusImage.style.objectPosition = item.objectPosition || toObjectPosition(STORY_DEFAULT_FOCAL_X, STORY_DEFAULT_FOCAL_Y);
  applyStoryImageRotation(storyFocusImage, item.rotation, "--storyScaleFactor", {
    quarterTurn: 1.05,
    halfTurn: 1.02,
    defaultScale: 1.03,
  });
  attachStoryFallback(storyFocusImage, imageSources.fallback, imageSources.original, { year: item.yearLabel });
  storyFocusImage.src = imageSources.preferred || imageSources.original;
  storyFocusImage.alt = item.alt || `Story photo ${item.yearLabel}`;
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
  initOverflowDebugHelper();
  removeLegacyGalleryLightbox();
  const currentPath = String(window.location.pathname || "").replace(/\/+$/, "") || "/";
  setActiveLink(currentPath === "/guest-wall" ? "guest-wall" : "top");
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
  document.body.classList.add("is-app-ready");
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
  await initGuestWall();

  inviteState.token = getTokenFromUrl();
  await lookupToken(inviteState.token);
}

init();

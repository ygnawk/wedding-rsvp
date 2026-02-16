const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwpfLq3hB_mRiKKgiwMv1bvZUUtcoUZP7ifjKpnLpcK0HgaOKHwm_LRsPPCahWWQ67U/exec";
const RSVP_LOCAL_FALLBACK_KEY = "wedding_rsvp_fallback";
const BASE_PATH = window.location.hostname === "ygnawk.github.io" ? "/wedding-rsvp" : "";

const SECTION_IDS = ["top", "interlude", "story", "venue", "schedule", "rsvp", "faq", "stay", "things-to-do", "makan", "travel-visa", "gallery"];

const inviteState = {
  token: "",
  greetingName: "",
  maxPartySize: 6,
};

let photoManifest = null;
let revealObserver = null;
let reducedMotion = false;

const floatingHeader = document.getElementById("floatingHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileNavSheet = document.getElementById("mobileNavSheet");

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

const yesFields = document.getElementById("yesFields");
const yesCount = document.getElementById("yesCount");
const attendeeNamesWrap = document.getElementById("attendeeNamesWrap");
const dietary = document.getElementById("dietary");

const workingFields = document.getElementById("workingFields");
const workingCount = document.getElementById("workingCount");
const workingConfirm = document.getElementById("workingConfirm");

const noFields = document.getElementById("noFields");
const noNote = document.getElementById("noNote");
const thingsThemeList = document.getElementById("thingsThemeList");
const makanTipTrigger = document.getElementById("makanTipTrigger");
const makanTipPopover = document.getElementById("makanTipPopover");
const makanMenuRows = document.getElementById("makanMenuRows");
const hotelMatrixShell = document.getElementById("hotelMatrixShell");
const hotelMatrixSvg = document.getElementById("hotelMatrixSvg");
const hotelMatrixTooltip = document.getElementById("hotelMatrixTooltip");
const hotelMatrixDetails = document.getElementById("hotelMatrixDetails");
const hotelMatrixSheet = document.getElementById("hotelMatrixSheet");
const hotelMatrixSheetContent = document.getElementById("hotelMatrixSheetContent");
const hotelMatrixSheetClose = document.getElementById("hotelMatrixSheetClose");
const hotelMatrixSheetCloseControls = hotelMatrixSheet ? Array.from(hotelMatrixSheet.querySelectorAll("[data-sheet-close], #hotelMatrixSheetClose")) : [];
const hotelMatrixCard = document.querySelector(".hotel-map-card");
const hotelMatrixRatingClaim = document.getElementById("hotelMatrixRatingClaim");
const hotelMethodTrigger = document.getElementById("hotelMethodTrigger");
const hotelMethodTooltip = document.getElementById("hotelMethodTooltip");

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
const storyMosaicLayout = document.getElementById("storyMosaicLayout");
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
const storySkip = document.querySelector(".story-skip");
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
let hotelMatrixItems = [];
let hotelMatrixHoveredId = "";
let hotelMatrixPinnedId = "";
let activeHotelMatrixId = "";
let hotelDetailsSwapTimer = null;
let hotelHoverSwapTimer = null;
let hotelSheetOpen = false;
let hotelMatrixMetaById = new Map();
let hotelMethodOpen = false;
let hotelMethodCloseTimer = null;
let makanTipOpen = false;

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
  "Jiangnan / Shanghainese",
  "Hot pot",
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
const STORY_ASSET_VERSION = "20260215-1310";
const STORY_OVERRIDES = {
  // Lock problematic files so orientation and year placement stay stable.
  "2008-miki-moves-beijing-upright.jpg": { rotate: -90, yearTop: 72, objPos: "50% 36%" },
  "2020-covid-upright.jpg": { rotate: 180, yearTop: 72, objPos: "50% 36%" },
  "2024-proposal-upright.jpg": { rotate: -90, yearTop: 72, objPos: "50% 40%" },
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
const WEDDING_DATE_SHANGHAI = { year: 2026, month: 9, day: 19 };
const SHANGHAI_TIMEZONE = "Asia/Shanghai";
let countdownIntervalId = null;

function getShanghaiDateParts(dateValue = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(dateValue);
  const year = Number(parts.find((part) => part.type === "year")?.value || 0);
  const month = Number(parts.find((part) => part.type === "month")?.value || 0);
  const day = Number(parts.find((part) => part.type === "day")?.value || 0);
  return { year, month, day };
}

function getDaysUntilWeddingShanghai(now = new Date()) {
  const shanghaiToday = getShanghaiDateParts(now);
  const todayUtcMidnight = Date.UTC(shanghaiToday.year, shanghaiToday.month - 1, shanghaiToday.day);
  const weddingUtcMidnight = Date.UTC(WEDDING_DATE_SHANGHAI.year, WEDDING_DATE_SHANGHAI.month - 1, WEDDING_DATE_SHANGHAI.day);
  return Math.floor((weddingUtcMidnight - todayUtcMidnight) / 86400000);
}

function renderHeroCountdown() {
  if (!heroCountdown) return;

  const daysRemaining = getDaysUntilWeddingShanghai(new Date());
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

function initHeroCountdown() {
  if (!heroCountdown) return;
  renderHeroCountdown();
  if (countdownIntervalId) window.clearInterval(countdownIntervalId);
  countdownIntervalId = window.setInterval(renderHeroCountdown, 60 * 60 * 1000);
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

function setActiveLink(sectionId) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-link") === sectionId);
  });
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
  menuToggle.setAttribute("aria-expanded", "false");
}

function initHeader() {
  if (menuToggle && mobileNavSheet) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNavSheet.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1100) closeMobileMenu();
    });
  }

  document.querySelectorAll(".desktop-nav a, .mobile-nav a, .header-rsvp, .brand").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
}

function closeJumpMenu() {
  if (!jumpMenuToggle || !jumpMenuPanel) return;
  jumpMenuToggle.setAttribute("aria-expanded", "false");
  jumpMenuPanel.hidden = true;
}

function openJumpMenu() {
  if (!jumpMenuToggle || !jumpMenuPanel) return;
  jumpMenuToggle.setAttribute("aria-expanded", "true");
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
  const visible = window.scrollY > Math.max(240, window.innerHeight * 0.9);
  jumpMenuWrap.classList.toggle("is-visible", visible);
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

function renderTravelPassportResult(key) {
  if (!travelPassportResult) return;
  const rule = TRAVEL_PASSPORT_RULES[String(key || "")];
  if (!rule) {
    travelPassportResult.classList.add("hidden");
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
  travelPassportResult.classList.remove("hidden");
  travelPassportResult.hidden = false;
}

function initScheduleReveal() {
  const scheduleRows = Array.from(document.querySelectorAll(".scheduleRow"));
  if (!scheduleRows.length) return;

  const reduce = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    scheduleRows.forEach((row) => {
      row.classList.remove("schedule-row-pending");
      row.classList.add("schedule-row-visible");
    });
    return;
  }

  scheduleRows.forEach((row) => {
    row.classList.add("schedule-row-pending");
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const row = entry.target;
        row.classList.remove("schedule-row-pending");
        row.classList.add("schedule-row-visible");
        obs.unobserve(row);
      });
    },
    {
      rootMargin: "0px 0px -25% 0px",
      threshold: 0.15,
    },
  );

  scheduleRows.forEach((row) => observer.observe(row));
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

function createFoodCopyButton(nameCn, nameEn) {
  const copyValue = String(nameCn || nameEn || "").trim();
  const button = document.createElement("button");
  button.type = "button";
  button.className = "makan-copy-btn";
  button.setAttribute("aria-label", `Copy restaurant name ${copyValue}`);
  button.textContent = "Copy name";
  button.dataset.defaultText = button.textContent;

  button.addEventListener("click", async () => {
    const copied = await copyTextToClipboard(copyValue);
    button.textContent = copied ? "Copied" : "Copy failed";
    button.classList.toggle("is-copied", copied);

    window.setTimeout(() => {
      button.textContent = button.dataset.defaultText || "Copy name";
      button.classList.remove("is-copied");
    }, 1300);
  });

  return button;
}

function buildMakanRow(place, rowIndex) {
  const row = document.createElement("article");
  row.className = "makan-menu-row";
  const rawNameEn = String(place.name_en || "").trim();
  const nameParts = rawNameEn.split(/\s+—\s+/);
  const nameOnly = nameParts.shift() || rawNameEn;
  const movedTagline = nameParts.join(" — ").trim();
  const taglineLead = movedTagline ? (/[.!?]$/.test(movedTagline) ? movedTagline : `${movedTagline}.`) : "";
  const baseBlurb = String(place.blurb_en || "").trim();
  const blurbText = [taglineLead, baseBlurb].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  const detailsId = `makanRowDetails${rowIndex + 1}`;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "makan-row-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", detailsId);
  toggle.setAttribute("aria-label", `Show details for ${nameOnly}`);

  const colType = document.createElement("span");
  colType.className = "makan-col makan-col--type";
  colType.textContent = place.restaurantType || place.category || "Restaurant";

  const colRestaurant = document.createElement("span");
  colRestaurant.className = "makan-col makan-col--restaurant";

  const nameEn = document.createElement("span");
  nameEn.className = "makan-name-en";
  nameEn.textContent = nameOnly;
  const nameCn = document.createElement("span");
  nameCn.className = "makan-name-cn";
  nameCn.textContent = place.name_cn;
  colRestaurant.appendChild(nameEn);
  colRestaurant.appendChild(nameCn);

  const colBlurb = document.createElement("span");
  colBlurb.className = "makan-col makan-col--blurb";
  colBlurb.textContent = blurbText;

  const chevron = document.createElement("span");
  chevron.className = "makan-row-chevron";
  chevron.setAttribute("aria-hidden", "true");

  toggle.appendChild(colType);
  toggle.appendChild(colRestaurant);
  toggle.appendChild(colBlurb);
  toggle.appendChild(chevron);

  const details = document.createElement("div");
  details.id = detailsId;
  details.className = "makan-row-details";
  details.hidden = true;

  const imageSrc = place.imageSrc || place.image || "";
  if (imageSrc) {
    const media = document.createElement("figure");
    media.className = "makan-row-photo";
    const img = document.createElement("img");
    img.src = toPhotoSrc(imageSrc);
    img.alt = place.imageAlt || place.name_en;
    img.loading = "lazy";
    img.decoding = "async";
    media.appendChild(img);
    details.appendChild(media);
  }

  if (place.imageAttribution || place.imageLicenseUrl) {
    const attribution = document.createElement("p");
    attribution.className = "makan-image-attribution";
    if (place.imageLicenseUrl) {
      const licenseLink = document.createElement("a");
      licenseLink.href = place.imageLicenseUrl;
      licenseLink.target = "_blank";
      licenseLink.rel = "noopener noreferrer";
      licenseLink.textContent = "License";
      attribution.textContent = `${place.imageAttribution || "Image attribution"} · `;
      attribution.appendChild(licenseLink);
    } else {
      attribution.textContent = place.imageAttribution || "";
    }
    details.appendChild(attribution);
  }

  const actions = document.createElement("div");
  actions.className = "makan-row-actions";
  actions.appendChild(createFoodCopyButton(place.name_cn, place.name_en));
  if (place.dianping_url) {
    const link = document.createElement("a");
    link.className = "makan-link";
    link.href = place.dianping_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open in the app";
    actions.appendChild(link);
  }
  details.appendChild(actions);

  row.appendChild(toggle);
  row.appendChild(details);
  return { row, toggle, details };
}

function renderMakanMenuRows() {
  if (!makanMenuRows) return;
  makanMenuRows.innerHTML = "";

  const sorted = [...BEIJING_FOOD_PLACES].sort((a, b) => {
    const aType = String(a.restaurantType || a.category || "");
    const bType = String(b.restaurantType || b.category || "");
    const aOrder = MAKAN_TYPE_ORDER.indexOf(aType);
    const bOrder = MAKAN_TYPE_ORDER.indexOf(bType);
    const categoryDelta = (aOrder < 0 ? Number.MAX_SAFE_INTEGER : aOrder) - (bOrder < 0 ? Number.MAX_SAFE_INTEGER : bOrder);
    if (categoryDelta !== 0) return categoryDelta;
    return a.name_en.localeCompare(b.name_en, undefined, { sensitivity: "base" });
  });

  const rowBindings = [];
  let currentType = "";
  sorted.forEach((place, index) => {
    const nextType = String(place.restaurantType || place.category || "Restaurant");
    if (nextType !== currentType) {
      currentType = nextType;
      const heading = document.createElement("div");
      heading.className = "makan-group-heading";
      heading.textContent = currentType;
      makanMenuRows.appendChild(heading);
    }

    const { row, toggle, details } = buildMakanRow(place, index);
    makanMenuRows.appendChild(row);
    rowBindings.push({ toggle, details, row });
  });

  rowBindings.forEach((binding) => {
    binding.toggle.addEventListener("click", () => {
      const willOpen = binding.toggle.getAttribute("aria-expanded") !== "true";
      rowBindings.forEach((candidate) => {
        candidate.toggle.setAttribute("aria-expanded", "false");
        candidate.details.hidden = true;
        candidate.row.classList.remove("is-open");
      });
      if (!willOpen) return;
      binding.toggle.setAttribute("aria-expanded", "true");
      binding.details.hidden = false;
      binding.row.classList.add("is-open");
    });
  });
}

function closeMakanTipPopover() {
  if (!makanTipTrigger || !makanTipPopover) return;
  makanTipPopover.hidden = true;
  makanTipPopover.setAttribute("aria-hidden", "true");
  makanTipTrigger.setAttribute("aria-expanded", "false");
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
  makanTipPopover.hidden = false;
  makanTipPopover.setAttribute("aria-hidden", "false");
  makanTipTrigger.setAttribute("aria-expanded", "true");
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

function initMakanSection() {
  renderMakanMenuRows();
  initMakanTipPopover();
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
  return hotelMatrixPinnedId || hotelMatrixHoveredId || "";
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

function closeHotelMethodologyTooltip() {
  if (!hotelMethodTooltip || !hotelMethodTrigger) return;
  hotelMethodTooltip.hidden = true;
  hotelMethodTooltip.setAttribute("aria-hidden", "true");
  hotelMethodTrigger.setAttribute("aria-expanded", "false");
  hotelMethodOpen = false;
}

function openHotelMethodologyTooltip() {
  if (!hotelMethodTooltip || !hotelMethodTrigger) return;
  hotelMethodTooltip.hidden = false;
  hotelMethodTooltip.setAttribute("aria-hidden", "false");
  hotelMethodTrigger.setAttribute("aria-expanded", "true");
  hotelMethodOpen = true;
  positionHotelMethodTooltip();
}

function toggleHotelMethodologyTooltip() {
  if (hotelMethodOpen) {
    closeHotelMethodologyTooltip();
  } else {
    openHotelMethodologyTooltip();
  }
}

function initHotelMethodology() {
  if (!hotelMethodTrigger || !hotelMethodTooltip) return;
  if (hotelMethodTrigger.dataset.bound === "true") return;

  closeHotelMethodologyTooltip();

  const openIfDesktop = () => {
    if (isCoarsePointer()) return;
    if (hotelMethodCloseTimer) {
      window.clearTimeout(hotelMethodCloseTimer);
      hotelMethodCloseTimer = null;
    }
    openHotelMethodologyTooltip();
  };

  const closeIfDesktop = () => {
    if (isCoarsePointer()) return;
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
    if (isCoarsePointer()) {
      toggleHotelMethodologyTooltip();
      return;
    }
    if (hotelMethodOpen) closeHotelMethodologyTooltip();
    else openHotelMethodologyTooltip();
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

function buildHotelEmptyState() {
  const empty = document.createElement("div");
  empty.className = "hotel-map-empty";
  const title = document.createElement("p");
  title.className = "hotel-map-empty-title";
  title.textContent = "Hover a dot to see details.";
  const body = document.createElement("p");
  body.textContent = "Yes, this is a framework. Old habits. ChatGPT made it faster.";
  empty.appendChild(title);
  empty.appendChild(body);
  return empty;
}

function hideHotelDotTooltip() {
  if (!hotelMatrixTooltip) return;
  hotelMatrixTooltip.hidden = true;
  hotelMatrixTooltip.setAttribute("aria-hidden", "true");
}

function showHotelDotTooltip(item, cx, cy, priceBucket = "$$") {
  if (!hotelMatrixTooltip || !hotelMatrixShell || !item) return;
  if (isHotelMatrixMobile() || hotelMatrixPinnedId) {
    hideHotelDotTooltip();
    return;
  }

  hotelMatrixTooltip.innerHTML = `
    <p class="hotel-map-dot-tooltip-title">${item.name}</p>
    <p class="hotel-map-dot-tooltip-body">${Number(item.driveMins)} min drive · ${priceBucket}</p>
  `;

  hotelMatrixTooltip.hidden = false;
  hotelMatrixTooltip.setAttribute("aria-hidden", "false");

  const shellRect = hotelMatrixShell.getBoundingClientRect();
  const tooltipRect = hotelMatrixTooltip.getBoundingClientRect();
  const viewX = shellRect.left + (cx / 760) * shellRect.width;
  const viewY = shellRect.top + (cy / 460) * shellRect.height;
  const gap = 10;
  const viewportPad = 12;

  let left = viewX - tooltipRect.width / 2;
  left = Math.max(viewportPad, Math.min(left, window.innerWidth - tooltipRect.width - viewportPad));

  let top = viewY - tooltipRect.height - gap;
  if (top < viewportPad) {
    top = viewY + gap;
  }
  if (top + tooltipRect.height > window.innerHeight - viewportPad) {
    top = window.innerHeight - tooltipRect.height - viewportPad;
  }

  hotelMatrixTooltip.style.left = `${left}px`;
  hotelMatrixTooltip.style.top = `${top}px`;
}

function buildHotelDetailsCard(item) {
  const card = document.createElement("article");
  card.className = "hotel-map-detail-card";

  const media = document.createElement("figure");
  media.className = "hotel-map-detail-media";
  const image = document.createElement("img");
  image.src = toPhotoSrc(item.imageSrc);
  image.alt = item.name;
  image.loading = "lazy";
  image.decoding = "async";
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
  const book = document.createElement("a");
  book.href = item.bookUrl;
  book.target = "_blank";
  book.rel = "noopener noreferrer";
  book.textContent = "Book";
  const directions = document.createElement("a");
  directions.href = item.directionsUrl;
  directions.target = "_blank";
  directions.rel = "noopener noreferrer";
  directions.textContent = "Directions";
  links.appendChild(book);
  links.appendChild(directions);
  card.appendChild(links);

  return card;
}

function swapHotelDetails(item) {
  if (!hotelMatrixDetails) return;
  const nextNode = item ? buildHotelDetailsCard(item) : buildHotelEmptyState();
  const nextId = item ? item.id : "";

  if (hotelMatrixDetails.dataset.hotelId === nextId) return;

  if (hotelDetailsSwapTimer) {
    window.clearTimeout(hotelDetailsSwapTimer);
    hotelDetailsSwapTimer = null;
  }

  if (reducedMotion || hotelMatrixDetails.dataset.ready !== "true") {
    hotelMatrixDetails.replaceChildren(nextNode);
    hotelMatrixDetails.dataset.hotelId = nextId;
    hotelMatrixDetails.dataset.ready = "true";
    return;
  }

  hotelMatrixDetails.classList.add("is-fading");
  hotelDetailsSwapTimer = window.setTimeout(() => {
    hotelMatrixDetails.replaceChildren(nextNode);
    hotelMatrixDetails.dataset.hotelId = nextId;
    hotelMatrixDetails.classList.remove("is-fading");
    hotelMatrixDetails.classList.add("is-entering");
    window.requestAnimationFrame(() => hotelMatrixDetails.classList.remove("is-entering"));
    hotelDetailsSwapTimer = null;
  }, 150);
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
  hotelMatrixHoveredId = "";
  hotelMatrixPinnedId = "";
  closeHotelMatrixSheet();
  applyHotelMatrixSelection();
}

function applyHotelMatrixSelection() {
  const highlightId = getActiveHotelMatrixId();
  activeHotelMatrixId = highlightId;

  hotelMatrixMetaById.forEach((meta, hotelId) => {
    const isActive = hotelId === highlightId;
    if (meta.group) meta.group.classList.toggle("is-active", isActive);
  });

  const pinnedHotel = getHotelById(hotelMatrixPinnedId);
  const shouldShowDetailsPanel = Boolean(hotelMatrixPinnedId) && !isHotelMatrixMobile();

  if (hotelMatrixCard) {
    hotelMatrixCard.classList.toggle("is-detail-open", shouldShowDetailsPanel);
  }

  if (shouldShowDetailsPanel) {
    swapHotelDetails(pinnedHotel);
  } else {
    swapHotelDetails(null);
  }

  if (!highlightId || hotelMatrixPinnedId) {
    hideHotelDotTooltip();
  }
}

function initHotelMatrix() {
  if (!hotelMatrixShell || !hotelMatrixSvg || !hotelMatrixDetails) return;
  if (hotelMatrixShell.dataset.initialized === "true") return;
  initHotelMethodology();

  hotelMatrixItems = HOTELS_DATA.slice(0, 6);
  if (!hotelMatrixItems.length) return;

  const width = 760;
  const height = 460;
  const margins = { top: 42, right: 52, bottom: 84, left: 88 };
  const plotWidth = width - margins.left - margins.right;
  const plotHeight = height - margins.top - margins.bottom;
  hotelMatrixSvg.innerHTML = "";
  hotelMatrixMetaById = new Map();

  const title = createSvgNode("title", { id: "hotelMatrixTitle" });
  title.textContent = "Hotels matrix by price and drive time";
  const desc = createSvgNode("desc", { id: "hotelMatrixDesc" });
  desc.textContent = "Price increases from left to right. Drive time to Mandarin Oriental increases from bottom to top.";
  hotelMatrixSvg.appendChild(title);
  hotelMatrixSvg.appendChild(desc);

  const plotFrame = createSvgNode("rect", {
    class: "hotel-map-frame",
    x: margins.left,
    y: margins.top,
    width: plotWidth,
    height: plotHeight,
    fill: "none",
  });
  hotelMatrixSvg.appendChild(plotFrame);

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

  if (hotelMatrixRatingClaim) {
    hotelMatrixRatingClaim.textContent = buildHotelRatingClaim(hotelMatrixItems);
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
        y2: margins.top + plotHeight + 8,
      }),
    );

    const node = createSvgNode("text", {
      class: "hotel-map-tick",
      x,
      y: margins.top + plotHeight + 20,
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
        x1: margins.left - 8,
        x2: margins.left,
        y1: y,
        y2: y,
      }),
    );

    const node = createSvgNode("text", {
      class: "hotel-map-tick",
      x: margins.left - 14,
      y,
      "text-anchor": "end",
      "dominant-baseline": "middle",
    });
    node.textContent = String(minutes);
    hotelMatrixSvg.appendChild(node);
  });

  const xAxisLabel = createSvgNode("text", {
    class: "hotel-map-axis-label",
    x: margins.left + plotWidth / 2,
    y: height - 12,
    "text-anchor": "middle",
  });
  xAxisLabel.textContent = "Price ($ to $$$$)";
  hotelMatrixSvg.appendChild(xAxisLabel);

  const yAxisLabel = createSvgNode("text", {
    class: "hotel-map-axis-label",
    x: 22,
    y: margins.top + plotHeight / 2,
    "text-anchor": "middle",
    transform: `rotate(-90 22 ${margins.top + plotHeight / 2})`,
  });
  yAxisLabel.textContent = "Drive time to Mandarin Oriental (mins)";
  hotelMatrixSvg.appendChild(yAxisLabel);

  const layer = createSvgNode("g", { class: "hotel-map-points" });
  hotelMatrixSvg.appendChild(layer);

  hotelMatrixItems.forEach((item) => {
    const xNorm = mapPrice(Number(item.metrics.priceUsd));
    const yNorm = mapDriveMins(Number(item.driveMins));
    const cx = margins.left + xNorm * plotWidth;
    const cy = margins.top + (1 - yNorm) * plotHeight;
    const priceBand = priceBucketFromNorm(xNorm);
    const driveBand = metricBandFromNorm(yNorm);

    const group = createSvgNode("g", { class: "hotel-map-point", "data-id": item.id });
    const horizontal = createSvgNode("line", {
      class: "hotel-map-crosshair",
      x1: margins.left,
      x2: margins.left + plotWidth,
      y1: cy.toFixed(2),
      y2: cy.toFixed(2),
    });
    const vertical = createSvgNode("line", {
      class: "hotel-map-crosshair",
      x1: cx.toFixed(2),
      x2: cx.toFixed(2),
      y1: margins.top,
      y2: margins.top + plotHeight,
    });
    const ring = createSvgNode("circle", {
      class: "hotel-map-dot-ring",
      cx: cx.toFixed(2),
      cy: cy.toFixed(2),
      r: "12",
    });
    const dot = createSvgNode("circle", {
      class: "hotel-map-dot",
      cx: cx.toFixed(2),
      cy: cy.toFixed(2),
      r: "7.4",
      tabindex: "0",
      role: "button",
      "aria-label": `Hotel: ${item.name}. Price ${priceBand}. Drive time ${Number(item.driveMins)} minutes (${driveBand}).`,
    });

    dot.addEventListener("pointerenter", () => {
      if (isHotelMatrixMobile() || hotelMatrixPinnedId) return;
      if (hotelHoverSwapTimer) window.clearTimeout(hotelHoverSwapTimer);
      hotelHoverSwapTimer = window.setTimeout(() => {
        hotelMatrixHoveredId = item.id;
        applyHotelMatrixSelection();
        showHotelDotTooltip(item, cx, cy, priceBand);
      }, 90);
    });

    dot.addEventListener("pointerleave", () => {
      if (isHotelMatrixMobile() || hotelMatrixPinnedId) return;
      if (hotelHoverSwapTimer) {
        window.clearTimeout(hotelHoverSwapTimer);
        hotelHoverSwapTimer = null;
      }
      hotelMatrixHoveredId = "";
      applyHotelMatrixSelection();
      hideHotelDotTooltip();
    });

    dot.addEventListener("focus", () => {
      if (hotelMatrixPinnedId && hotelMatrixPinnedId !== item.id) return;
      hotelMatrixHoveredId = item.id;
      applyHotelMatrixSelection();
      showHotelDotTooltip(item, cx, cy, priceBand);
    });

    dot.addEventListener("blur", () => {
      if (!hotelMatrixPinnedId) {
        hotelMatrixHoveredId = "";
        applyHotelMatrixSelection();
      }
      hideHotelDotTooltip();
    });

    dot.addEventListener("click", (event) => {
      event.preventDefault();
      if (hotelMatrixPinnedId === item.id) {
        clearHotelMatrixSelection();
        return;
      }

      hotelMatrixPinnedId = item.id;
      hotelMatrixHoveredId = item.id;
      applyHotelMatrixSelection();
      hideHotelDotTooltip();

      if (isHotelMatrixMobile()) {
        openHotelMatrixSheet(item);
      }
    });

    dot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dot.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        clearHotelMatrixSelection();
      }
    });

    group.appendChild(horizontal);
    group.appendChild(vertical);
    group.appendChild(ring);
    group.appendChild(dot);
    layer.appendChild(group);
    hotelMatrixMetaById.set(item.id, { group, item, cx, cy, priceBand });
  });

  hotelMatrixSheetCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
      closeHotelMatrixSheet();
      hotelMatrixPinnedId = "";
      hotelMatrixHoveredId = "";
      applyHotelMatrixSelection();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (hotelSheetOpen) closeHotelMatrixSheet();
    if (hotelMatrixPinnedId || hotelMatrixHoveredId) {
      hotelMatrixPinnedId = "";
      hotelMatrixHoveredId = "";
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
    if (isHotelMatrixMobile()) {
      hideHotelDotTooltip();
      return;
    }
    if (hotelMatrixHoveredId && !hotelMatrixPinnedId) {
      const hoveredMeta = hotelMatrixMetaById.get(hotelMatrixHoveredId);
      if (hoveredMeta) showHotelDotTooltip(hoveredMeta.item, hoveredMeta.cx, hoveredMeta.cy, hoveredMeta.priceBand);
    }
  });

  if (hotelMatrixCard) hotelMatrixCard.classList.remove("is-detail-open");
  swapHotelDetails(null);
  hotelMatrixShell.dataset.initialized = "true";
}

function setupRevealNode(node) {
  const delay = node.getAttribute("data-delay");
  node.style.setProperty("--reveal-delay", `${Number(delay || 0)}ms`);

  const shouldAnimate = node.classList.contains("settle");
  if (reducedMotion || !shouldAnimate) {
    node.classList.add("in-view");
    return;
  }

  if (revealObserver) revealObserver.observe(node);
}

function initReveals() {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    document.body.classList.add("reduce-motion");
  } else {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );
  }

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((node) => setupRevealNode(node));
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

  populatePartySizeOptions(yesCount, inviteState.maxPartySize);
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

function renderAttendeeFields(count) {
  if (!attendeeNamesWrap) return;
  attendeeNamesWrap.innerHTML = "";

  const safeCount = Math.max(0, Math.min(clampPartySize(inviteState.maxPartySize), Number(count) || 0));
  for (let i = 1; i <= safeCount; i += 1) {
    const field = document.createElement("div");
    field.className = "field form-field";

    const label = document.createElement("label");
    label.setAttribute("for", `attendeeName${i}`);
    label.textContent = `Attendee ${i} name`;

    const input = document.createElement("input");
    input.id = `attendeeName${i}`;
    input.type = "text";
    input.required = attendanceChoice && attendanceChoice.value === "yes";
    input.dataset.attendeeName = String(i);

    if (i === 1) {
      const preferred = (fullNameInput && fullNameInput.value.trim()) || inviteState.greetingName;
      if (preferred) input.value = preferred;
    }

    field.appendChild(label);
    field.appendChild(input);
    attendeeNamesWrap.appendChild(field);
  }
}

function collectAttendeeNames() {
  if (!attendeeNamesWrap) return [];
  return Array.from(attendeeNamesWrap.querySelectorAll("input[data-attendee-name]"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function setChoice(choice) {
  if (!attendanceChoice || !rsvpFields || !submitButton || !yesFields || !workingFields || !noFields) return;

  attendanceChoice.value = choice;
  rsvpFields.classList.remove("hidden");

  choiceCards.forEach((card) => {
    const isActive = card.dataset.choice === choice;
    card.classList.toggle("selected", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });

  yesFields.classList.toggle("hidden", choice !== "yes");
  workingFields.classList.toggle("hidden", choice !== "working");
  noFields.classList.toggle("hidden", choice !== "no");

  if (yesCount) yesCount.required = choice === "yes";
  if (workingCount) workingCount.required = choice === "working";
  if (workingConfirm) workingConfirm.required = choice === "working";

  if (choice === "yes") {
    if (yesCount && !yesCount.value) yesCount.value = "1";
    renderAttendeeFields(Number((yesCount && yesCount.value) || 1));
    submitButton.textContent = "Confirm attendance";
  }

  if (choice === "working") {
    submitButton.textContent = "Add me to the list";
    if (attendeeNamesWrap) attendeeNamesWrap.innerHTML = "";
  }

  if (choice === "no") {
    submitButton.textContent = "Send reply";
    if (attendeeNamesWrap) attendeeNamesWrap.innerHTML = "";
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

  if (yesCount) {
    yesCount.addEventListener("change", () => {
      if (attendanceChoice && attendanceChoice.value === "yes") {
        renderAttendeeFields(Number(yesCount.value));
      }
    });
  }

  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => {
      const first = attendeeNamesWrap && attendeeNamesWrap.querySelector('input[data-attendee-name="1"]');
      if (first && !first.value.trim()) first.value = fullNameInput.value.trim();
    });
  }
}

function buildPayload() {
  const attendeeNamesRaw = collectAttendeeNames();
  const choice = attendanceChoice ? attendanceChoice.value : "";
  const status = choice === "yes" ? "yes" : choice === "working" ? "maybe" : "no";
  const fullName = (fullNameInput && fullNameInput.value.trim()) || inviteState.greetingName;

  const yesPartySize = choice === "yes" ? Number((yesCount && yesCount.value) || attendeeNamesRaw.length || 0) : 0;
  const potentialPartySize = choice === "working" ? Number((workingCount && workingCount.value) || 0) : 0;

  const attendeeNames = [...attendeeNamesRaw].slice(0, 6);
  while (attendeeNames.length < 6) attendeeNames.push("");

  return {
    token: inviteState.token,
    status,
    fullName,
    guestName: fullName,
    email: emailInput ? emailInput.value.trim() : "",
    phone: phoneInput ? phoneInput.value.trim() : "",
    partySize: status === "yes" ? yesPartySize : potentialPartySize,
    potentialPartySize,
    attendeeNames,
    dietary: status === "yes" && dietary ? dietary.value.trim() : "",
    whenWillYouKnow: status === "maybe" && workingConfirm ? workingConfirm.value : "",
    followupChoice: status === "maybe" && workingConfirm ? workingConfirm.value : "",
    note: status === "no" && noNote ? noNote.value.trim() : "",
    userAgent: navigator.userAgent || "",
  };
}

async function submitToSheets(payload) {
  const res = await fetch(`${SHEETS_WEBAPP_URL}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

async function submitRSVP(payload) {
  if (!isSheetsConfigured()) {
    return { ok: false, error: "RSVP submission is not configured yet. Please contact Yi Jie." };
  }

  try {
    const data = await submitToSheets(payload);
    if (!data || data.ok !== true) throw new Error(data && data.error ? String(data.error) : "Sheets submit failed");
    return { ok: true };
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
      const required = Number((yesCount && yesCount.value) || 0);
      const names = collectAttendeeNames();
      if (names.length < required) {
        rsvpConfirmation.textContent = "Please enter all attendee names for your party.";
        rsvpConfirmation.classList.remove("hidden");
        return;
      }
    }

    const payload = buildPayload();
    const result = await submitRSVP(payload);
    if (!result || result.ok !== true) {
      rsvpConfirmation.textContent = result && result.error ? result.error : "We couldn’t submit your RSVP right now. Please try again in a moment.";
      rsvpConfirmation.classList.remove("hidden");
      return;
    }

    rsvpForm.classList.add("hidden");
    rsvpConfirmation.textContent = confirmationMessage(attendanceChoice.value);
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
      img.src = withBasePath("/photos/FAQ%20photo/what-to-wear.png");
      return;
    }

    const wrap = img.closest(".faq-wear-media");
    if (wrap) {
      wrap.innerHTML = '<div class="faq-wear-missing">Image not found. Check /photos/faq-photo/what-to-wear.png</div>';
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

function normalizeGalleryEntry(entry) {
  if (typeof entry === "string") {
    return {
      file: entry.trim(),
      alt: "",
      cropClass: "img-round",
      objectPosition: "50% 35%",
    };
  }

  if (!entry || typeof entry !== "object") {
    return {
      file: "",
      alt: "",
      cropClass: "img-round",
      objectPosition: "50% 35%",
    };
  }

  return {
    file: String(entry.file || entry.src || "").trim(),
    alt: String(entry.alt || "").trim(),
    cropClass: String(entry.cropClass || "img-round").trim(),
    objectPosition: String(entry.objectPosition || "50% 35%").trim(),
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

function buildGalleryCard(entry, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "gallery-tile";
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
  img.style.objectPosition = entry.objectPosition || "50% 35%";
  card.style.setProperty("--objPos", entry.objectPosition || "50% 35%");
  card.appendChild(img);
  card.addEventListener("click", () => openLightbox(index));

  return card;
}

async function initGallery() {
  if (!galleryGrid) return;
  bindGalleryLightboxEvents();

  galleryGrid.innerHTML = "";
  const selected = getConfiguredGalleryEntries(photoManifest || {}).slice(0, 9);

  galleryImages = selected;
  window.__galleryItems = selected.map((item) => ({
    src: toPhotoSrc(item.file),
    alt: item.alt || "Miki and Yi Jie",
    objPos: item.objectPosition || "50% 35%",
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

function normalizeStoryEntry(entry) {
  if (typeof entry === "string") {
    return { file: entry.trim(), objectPosition: "", alt: "", year: NaN };
  }

  if (!entry || typeof entry !== "object") {
    return { file: "", objectPosition: "", alt: "", year: NaN };
  }

  return {
    file: String(entry.file || "").trim(),
    objectPosition: String(entry.objectPosition || "").trim(),
    fit: String(entry.fit || "").trim(),
    rotation: Number.isFinite(Number(entry.rotation)) ? Number(entry.rotation) : 0,
    year: Number.isFinite(Number(entry.year)) ? Number(entry.year) : NaN,
    alt: String(entry.alt || "").trim(),
  };
}

function sortStoryEntries(entries) {
  const isLocalDev = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  const normalized = (entries || []).map(normalizeStoryEntry).filter((entry) => entry.file);
  const byFile = new Map();

  normalized.forEach((entry) => {
    byFile.set(entry.file, entry);
  });

  return Array.from(byFile.values())
    .map((entry) => ({
      file: entry.file,
      objectPosition: entry.objectPosition,
      fit: entry.fit,
      rotation: entry.rotation,
      alt: entry.alt,
      year: Number.isFinite(entry.year) ? entry.year : extractStoryYear(entry.file),
    }))
    .filter((entry) => {
      if (Number.isFinite(entry.year)) return true;
      if (isLocalDev) {
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

function buildStoryTimelineSlide(item, index) {
  const slide = document.createElement("article");
  slide.className = "story-slide";
  slide.dataset.index = String(index);

  const media = document.createElement("figure");
  media.className = "story-slide-media";

  const img = document.createElement("img");
  img.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || "50% 50%";
  img.style.imageOrientation = "from-image";
  if (item.fit === "contain") img.style.objectFit = "contain";

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
        return;
      }

      const target = targetsByIndex.get(index);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
      }
      setActiveStoryScrubberIndex(index);
    });

    storyYearButtons.push(button);
    storyYearScrubber.appendChild(button);
  });

  setActiveStoryScrubberIndex(0);
  storyYearScrubber.classList.remove("hidden");
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

function setStoryMobileSlide(index, options = {}) {
  if (!storyItems.length || !storyMobileImg || !storyMobileYear) return;

  const { scrollPill = true } = options;
  const total = storyItems.length;
  const safeIndex = ((Number(index) || 0) % total + total) % total;
  const item = storyItems[safeIndex];
  storyMobileIndex = safeIndex;

  storyMobileImg.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
  storyMobileImg.alt = item.alt || `Story photo ${item.yearLabel}`;
  storyMobileImg.style.objectPosition = item.objectPosition || "50% 50%";
  storyMobileImg.style.imageOrientation = "from-image";

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
  storyMobileStage.hidden = !isMobile;
  storyMobileStage.setAttribute("aria-hidden", String(!isMobile));
  storyMosaicLayout.setAttribute("aria-hidden", String(isMobile));

  if (isMobile && storyItems.length) {
    setStoryMobileSlide(storyMobileIndex, { scrollPill: false });
  }
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

  if (storySkip && storySkip.dataset.bound !== "true") {
    storySkip.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.getElementById("schedule");
      if (!target) return;
      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
    storySkip.dataset.bound = "true";
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
  card.id = `story-${item.year}-${index}`;
  card.dataset.year = String(item.year);
  card.dataset.yearIndex = String(index);
  card.setAttribute("aria-label", `Open story from ${item.yearLabel}`);

  const img = document.createElement("img");
  img.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || "50% 50%";
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

  renderStoryYearScrubber(orderedItems, yearTargets, (index) => {
    if (!isStoryMobileView()) return;
    setStoryMobileSlide(index);
  });
  bindStoryYearObserver(isStoryMobileView() ? [] : yearTargets);
  applyStoryMosaicReveal(cards);
  bindStoryMobileStage();
  setStoryMobileSlide(0, { scrollPill: false });
  syncStoryResponsiveMode();
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
  storyLightboxImg.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
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
  const copy = storyCopyForYear(entry.year);
  const rotation = Number.isFinite(Number(override.rotate))
    ? Number(override.rotate)
    : Number.isFinite(Number(entry.rotation))
      ? Number(entry.rotation)
      : 0;
  const objectPosition = override.objPos || entry.objectPosition || "50% 50%";

  return {
    ...entry,
    title: copy.title,
    blurb: copy.blurb,
    longCaption: copy.longCaption,
    rotation,
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
  img.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || "50% 50%";
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
  storyFocusImage.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
  storyFocusImage.alt = item.alt || `Story photo ${item.yearLabel}`;
  storyFocusImage.style.objectPosition = item.objectPosition || "50% 50%";

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

  if (storySkip) {
    storySkip.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.getElementById("schedule");
      if (!target) return;
      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
  }

  window.addEventListener("scroll", requestStoryStepSync, { passive: true });

  window.addEventListener("resize", () => {
    if (storyResizeRaf) window.cancelAnimationFrame(storyResizeRaf);
    storyResizeRaf = window.requestAnimationFrame(() => {
      storyResizeRaf = null;
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
  const blocks = Array.from(document.querySelectorAll(".cutout-parallax"));
  if (!blocks.length) return;

  const entries = blocks
    .map((block, index) => ({
      block,
      img: block.querySelector(".cutout-parallax__media img"),
      speed: Number(block.getAttribute("data-parallax-speed") || 0.12),
      index,
    }))
    .filter((entry) => entry.img);

  if (!entries.length) return;

  entries.forEach((entry) => {
    const img = entry.img;
    if (!img) return;
    if (img.dataset.cutoutBound === "true") return;
    img.addEventListener("load", () => {
      entry.block.classList.remove("is-image-missing");
    });
    img.addEventListener("error", () => {
      entry.block.classList.add("is-image-missing");
    });
    img.dataset.cutoutBound = "true";
  });

  const setStatic = (scale = 1.01) => {
    entries.forEach((entry) => {
      entry.img.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
    });
  };

  if (reducedMotion) {
    setStatic(1);
    return;
  }

  const active = new Set();
  let ticking = false;

  const update = () => {
    ticking = false;
    const isMobile = window.innerWidth <= 900;

    entries.forEach((entry) => {
      if (!active.has(entry.block)) return;

      if (isMobile) {
        entry.img.style.transform = "translate3d(0, 0, 0) scale(1.01)";
        return;
      }

      const rect = entry.block.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const blockCenter = rect.top + rect.height / 2;
      const delta = viewportCenter - blockCenter;
      const strength = entry.speed * 0.3;
      const maxShift = 24;
      const translateY = Math.max(-maxShift, Math.min(maxShift, delta * strength));
      entry.img.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(1.03)`;
    });
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (observerEntries) => {
      observerEntries.forEach((entry) => {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      });
      requestTick();
    },
    {
      threshold: [0, 0.15, 0.35, 0.6],
      rootMargin: "120px 0px 120px 0px",
    },
  );

  entries.forEach((entry) => observer.observe(entry.block));
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 900) {
      setStatic(1.01);
      return;
    }
    requestTick();
  });
  if (window.innerWidth <= 900) {
    setStatic(1.01);
  }
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

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
const thingsToggle = document.getElementById("thingsToggle");
const thingsExtraCards = Array.from(document.querySelectorAll(".thing-extra"));
const makanSpecialsTrack = document.getElementById("makanSpecialsTrack");
const makanCategoryGrid = document.getElementById("makanCategoryGrid");
const hotelMatrixShell = document.getElementById("hotelMatrixShell");
const hotelMatrixSvg = document.getElementById("hotelMatrixSvg");
const hotelMatrixDetails = document.getElementById("hotelMatrixDetails");
const hotelMatrixSheet = document.getElementById("hotelMatrixSheet");
const hotelMatrixSheetContent = document.getElementById("hotelMatrixSheetContent");
const hotelMatrixSheetClose = document.getElementById("hotelMatrixSheetClose");
const hotelMatrixSheetCloseControls = hotelMatrixSheet ? Array.from(hotelMatrixSheet.querySelectorAll("[data-sheet-close], #hotelMatrixSheetClose")) : [];
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
let hotelMatrixItems = [];
let hotelMatrixHoveredId = "";
let hotelMatrixPinnedId = "";
let activeHotelMatrixId = "";
let hotelDetailsSwapTimer = null;
let hotelSheetOpen = false;
let hotelMatrixMetaById = new Map();
let hotelMethodOpen = false;

const jumpMenuWrap = document.getElementById("jumpMenuWrap");
const jumpMenuToggle = document.getElementById("jumpMenuToggle");
const jumpMenuPanel = document.getElementById("jumpMenuPanel");
const jumpMenuLinks = jumpMenuPanel ? Array.from(jumpMenuPanel.querySelectorAll("a[href^='#']")) : [];

const HOTELS_DATA = Array.isArray(window.HOTELS_DATA) ? window.HOTELS_DATA : [];
const BEIJING_FOOD_PLACES = Array.isArray(window.BEIJING_FOOD_PLACES) ? window.BEIJING_FOOD_PLACES : [];

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

const MAKAN_CATEGORY_ORDER = [
  "Duck & roasts",
  "Cantonese & seafood",
  "Jiangnan (Shanghai / Huaiyang)",
  "Breakfast & street snacks",
  "Hotpot & late-night",
  "Desserts, tea & coffee",
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
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
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

function initCardDisclosure(toggleButton, extraCards) {
  if (!toggleButton || !extraCards.length) return;

  const setExpanded = (expanded) => {
    toggleButton.setAttribute("aria-expanded", String(expanded));
    toggleButton.textContent = expanded ? "Show less" : "Show 3 more";
    extraCards.forEach((card) => {
      card.hidden = !expanded;
    });
  };

  setExpanded(false);
  toggleButton.addEventListener("click", () => {
    const currentlyExpanded = toggleButton.getAttribute("aria-expanded") === "true";
    setExpanded(!currentlyExpanded);
  });
}

function initThingsDisclosure() {
  initCardDisclosure(thingsToggle, thingsExtraCards);
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

function createFoodCopyButton(nameCn) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "makan-copy-btn";
  button.setAttribute("aria-label", `Copy Chinese name ${nameCn}`);
  button.textContent = "Copy 中文名";
  button.dataset.defaultText = button.textContent;

  button.addEventListener("click", async () => {
    const copied = await copyTextToClipboard(nameCn);
    button.textContent = copied ? "Copied" : "Copy failed";
    button.classList.toggle("is-copied", copied);

    window.setTimeout(() => {
      button.textContent = button.dataset.defaultText || "Copy 中文名";
      button.classList.remove("is-copied");
    }, 1300);
  });

  return button;
}

function FoodMenuRow(place) {
  const row = document.createElement("article");
  row.className = "makan-menu-row";

  const top = document.createElement("div");
  top.className = "makan-menu-row-top";

  const main = document.createElement("div");
  main.className = "makan-menu-main";

  const en = document.createElement("p");
  en.className = "makan-name-en";
  en.textContent = place.name_en;

  const cn = document.createElement("p");
  cn.className = "makan-name-cn";
  cn.textContent = place.name_cn;

  const blurb = document.createElement("p");
  blurb.className = "makan-row-blurb";
  blurb.textContent = place.blurb_en;

  main.appendChild(en);
  main.appendChild(cn);
  main.appendChild(blurb);

  const leader = document.createElement("span");
  leader.className = "makan-row-leader";
  leader.setAttribute("aria-hidden", "true");

  const chips = document.createElement("div");
  chips.className = "makan-chip-group";
  (place.vibe_tags || []).slice(0, 3).forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "makan-chip";
    chip.textContent = tag;
    chips.appendChild(chip);
  });

  top.appendChild(main);
  top.appendChild(leader);
  top.appendChild(chips);

  const foot = document.createElement("div");
  foot.className = "makan-menu-row-foot";

  const address = document.createElement("p");
  address.className = "makan-address";
  address.textContent = place.address_cn ? `📍 ${place.address_cn}` : "📍 Beijing";
  foot.appendChild(address);

  const actions = document.createElement("div");
  actions.className = "makan-row-actions";
  actions.appendChild(createFoodCopyButton(place.name_cn));

  if (place.dianping_url) {
    const link = document.createElement("a");
    link.className = "makan-link";
    link.href = place.dianping_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open in 大众点评";
    actions.appendChild(link);
  }

  foot.appendChild(actions);
  row.appendChild(top);
  row.appendChild(foot);
  return row;
}

function FoodSpecialsStrip(places) {
  if (!makanSpecialsTrack) return;

  const fallbackImages = [
    "/public/images/makan-placeholder-gongyan.svg",
    "/public/images/makan-placeholder-duck.svg",
    "/public/images/makan-placeholder-cantonese.svg",
    "/public/images/makan-placeholder-jiangnan.svg",
  ];

  const specials = places.filter((place) => place.is_house_special).slice(0, 6);
  makanSpecialsTrack.innerHTML = "";

  specials.forEach((place, index) => {
    const card = document.createElement("article");
    card.className = "makan-special-card";

    const media = document.createElement("figure");
    media.className = "makan-special-media";

    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = `${place.name_en}`;
    image.src = toPhotoSrc(place.image || fallbackImages[index % fallbackImages.length]);
    media.appendChild(image);

    const body = document.createElement("div");
    body.className = "makan-special-body";

    const name = document.createElement("h4");
    name.className = "makan-special-name";
    name.textContent = place.name_en;

    const nameCn = document.createElement("p");
    nameCn.className = "makan-special-name-cn";
    nameCn.textContent = place.name_cn;

    const why = document.createElement("p");
    why.className = "makan-special-why";
    why.textContent = place.blurb_en;

    const actions = document.createElement("div");
    actions.className = "makan-special-actions";
    actions.appendChild(createFoodCopyButton(place.name_cn));

    if (place.dianping_url) {
      const link = document.createElement("a");
      link.className = "makan-link";
      link.href = place.dianping_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open in 大众点评";
      actions.appendChild(link);
    }

    body.appendChild(name);
    body.appendChild(nameCn);
    body.appendChild(why);
    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(body);
    makanSpecialsTrack.appendChild(card);
  });
}

function FoodCategoryGrid(places) {
  if (!makanCategoryGrid) return;
  makanCategoryGrid.innerHTML = "";

  MAKAN_CATEGORY_ORDER.forEach((categoryTitle) => {
    const card = document.createElement("article");
    card.className = "makan-category-card";

    const title = document.createElement("h4");
    title.className = "makan-category-title";
    title.textContent = categoryTitle;
    card.appendChild(title);

    const items = places.filter((place) => place.category === categoryTitle);
    if (items.length > 0) {
      const rowsWrap = document.createElement("div");
      rowsWrap.className = "makan-rows";
      items.forEach((place) => rowsWrap.appendChild(FoodMenuRow(place)));
      card.appendChild(rowsWrap);
    } else {
      const placeholderList = document.createElement("ul");
      placeholderList.className = "makan-placeholder-list";
      (MAKAN_PLACEHOLDER_COPY[categoryTitle] || []).forEach((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        placeholderList.appendChild(item);
      });
      card.appendChild(placeholderList);
    }

    makanCategoryGrid.appendChild(card);
  });
}

function BeijingMakanMenuSection() {
  if (!makanSpecialsTrack || !makanCategoryGrid) return;

  FoodSpecialsStrip(BEIJING_FOOD_PLACES);
  FoodCategoryGrid(BEIJING_FOOD_PLACES);
}

function initMakanSection() {
  BeijingMakanMenuSection();
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

  hotelMethodTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    toggleHotelMethodologyTooltip();
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

  const distanceLine = document.createElement("p");
  distanceLine.className = "hotel-map-detail-distance";
  distanceLine.textContent = `${Number(item.distanceKm).toFixed(1)} km • ${item.driveMins} min by car`;
  card.appendChild(distanceLine);

  const metrics = document.createElement("p");
  metrics.className = "hotel-map-detail-metrics";
  metrics.textContent = `Comfort: ${Number(item.metrics.comfortRating).toFixed(1)}/10 (${item.metrics.reviewCount} reviews) · Price snapshot: $${item.metrics.priceUsd}/night`;
  card.appendChild(metrics);

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

  if (hotelMatrixDetails.dataset.hotelId === nextId && nextId) return;

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
  const nextActiveId = getActiveHotelMatrixId();
  activeHotelMatrixId = nextActiveId;

  hotelMatrixMetaById.forEach((meta, hotelId) => {
    const isActive = hotelId === nextActiveId;
    if (meta.group) meta.group.classList.toggle("is-active", isActive);
  });

  const activeHotel = getHotelById(nextActiveId);
  swapHotelDetails(activeHotel);
}

function initHotelMatrix() {
  if (!hotelMatrixShell || !hotelMatrixSvg || !hotelMatrixDetails) return;
  if (hotelMatrixShell.dataset.initialized === "true") return;
  initHotelMethodology();

  hotelMatrixItems = HOTELS_DATA.slice(0, 6);
  if (!hotelMatrixItems.length) return;

  const width = 760;
  const height = 460;
  const margins = { top: 54, right: 48, bottom: 62, left: 72 };
  const plotWidth = width - margins.left - margins.right;
  const plotHeight = height - margins.top - margins.bottom;
  hotelMatrixSvg.innerHTML = "";
  hotelMatrixMetaById = new Map();

  const title = createSvgNode("title", { id: "hotelMatrixTitle" });
  title.textContent = "Hotels matrix by price and comfort";
  const desc = createSvgNode("desc", { id: "hotelMatrixDesc" });
  desc.textContent = "Price increases from left to right. Comfort increases from bottom to top.";
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

  const labels = [
    { text: "Lower price", x: margins.left, y: height - 22, anchor: "start" },
    { text: "Higher price", x: margins.left + plotWidth, y: height - 22, anchor: "end" },
    { text: "Higher comfort", x: margins.left, y: margins.top - 20, anchor: "start" },
    { text: "Lower comfort", x: margins.left, y: margins.top + plotHeight + 20, anchor: "start" },
  ];

  labels.forEach((label) => {
    const node = createSvgNode("text", {
      class: "hotel-map-label",
      x: label.x,
      y: label.y,
      "text-anchor": label.anchor,
      "dominant-baseline": "middle",
    });
    node.textContent = label.text;
    hotelMatrixSvg.appendChild(node);
  });

  const prices = hotelMatrixItems.map((item) => Number(item.metrics.priceUsd)).filter((value) => Number.isFinite(value) && value > 0);
  const ratings = hotelMatrixItems
    .map((item) => Number(item.metrics.comfortRating))
    .filter((value) => Number.isFinite(value) && value > 0);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minRating = Math.min(...ratings) - 0.2;
  const maxRating = Math.max(...ratings) + 0.2;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mapPrice = (price) => {
    if (!(minPrice > 0) || !(maxPrice > 0) || minPrice === maxPrice) return 0.5;
    const ratio = (Math.log(price) - Math.log(minPrice)) / (Math.log(maxPrice) - Math.log(minPrice));
    return clamp(0.04 + ratio * 0.92, 0.04, 0.96);
  };
  const mapRating = (rating) => {
    if (minRating === maxRating) return 0.5;
    const ratio = (rating - minRating) / (maxRating - minRating);
    return clamp(0.04 + ratio * 0.92, 0.04, 0.96);
  };

  const layer = createSvgNode("g", { class: "hotel-map-points" });
  hotelMatrixSvg.appendChild(layer);

  hotelMatrixItems.forEach((item) => {
    const xNorm = mapPrice(Number(item.metrics.priceUsd));
    const yNorm = mapRating(Number(item.metrics.comfortRating));
    const cx = margins.left + xNorm * plotWidth;
    const cy = margins.top + (1 - yNorm) * plotHeight;
    const priceBand = metricBandFromNorm(xNorm);
    const comfortBand = metricBandFromNorm(yNorm);

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
      r: "8",
    });
    const dot = createSvgNode("circle", {
      class: "hotel-map-dot",
      cx: cx.toFixed(2),
      cy: cy.toFixed(2),
      r: "5.7",
      tabindex: "0",
      role: "button",
      "aria-label": `Hotel: ${item.name}. Price ${priceBand}. Comfort ${comfortBand}.`,
    });

    dot.addEventListener("pointerenter", () => {
      if (isHotelMatrixMobile() || hotelMatrixPinnedId) return;
      hotelMatrixHoveredId = item.id;
      applyHotelMatrixSelection();
    });

    dot.addEventListener("pointerleave", () => {
      if (isHotelMatrixMobile() || hotelMatrixPinnedId) return;
      hotelMatrixHoveredId = "";
      applyHotelMatrixSelection();
    });

    dot.addEventListener("focus", () => {
      if (hotelMatrixPinnedId && hotelMatrixPinnedId !== item.id) return;
      hotelMatrixHoveredId = item.id;
      applyHotelMatrixSelection();
    });

    dot.addEventListener("blur", () => {
      if (!hotelMatrixPinnedId) {
        hotelMatrixHoveredId = "";
        applyHotelMatrixSelection();
      }
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
    hotelMatrixMetaById.set(item.id, { group });
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
  });

  window.addEventListener("resize", () => {
    if (!isHotelMatrixMobile() && hotelSheetOpen) {
      closeHotelMatrixSheet();
    }
  });

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
    return { file: entry.trim(), objectPosition: "", alt: "" };
  }

  if (!entry || typeof entry !== "object") {
    return { file: "", objectPosition: "", alt: "" };
  }

  return {
    file: String(entry.file || "").trim(),
    objectPosition: String(entry.objectPosition || "").trim(),
    fit: String(entry.fit || "").trim(),
    rotation: Number.isFinite(Number(entry.rotation)) ? Number(entry.rotation) : 0,
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
      fit: entry.fit,
      rotation: entry.rotation,
      alt: entry.alt,
      year: extractStoryYear(entry.file),
    }))
    .filter((entry) => Number.isFinite(entry.year))
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
}

function scrollStoryTimelineTo(index, behavior = "smooth") {
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
      const target = document.getElementById("venue");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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
      const target = document.getElementById("venue");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const setStatic = (scale = 1.08) => {
    entries.forEach((entry) => {
      entry.img.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
    });
  };

  if (reducedMotion) {
    setStatic(1.08);
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
        entry.img.style.transform = "translate3d(0, 0, 0) scale(1.08)";
        return;
      }

      const rect = entry.block.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const blockCenter = rect.top + rect.height / 2;
      const delta = viewportCenter - blockCenter;
      const strength = entry.speed * 0.42;
      const maxShift = 18;
      const translateY = Math.max(-maxShift, Math.min(maxShift, delta * strength));
      entry.img.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(1.12)`;
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
      setStatic(1.08);
      return;
    }
    requestTick();
  });
  if (window.innerWidth <= 900) {
    setStatic(1.08);
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
  initThingsDisclosure();
  initHotelMatrix();
  initMakanSection();
  initReveals();
  await initStoryTimeline();
  initRsvpCards();
  initRsvpForm();

  photoManifest = await loadManifest();
  applyInviteContext();
  applyStaticPhotoManifest();
  initCutoutParallax();
  initFaqWearImageDebug();
  await initGallery();

  inviteState.token = getTokenFromUrl();
  await lookupToken(inviteState.token);
}

init();

const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwpfLq3hB_mRiKKgiwMv1bvZUUtcoUZP7ifjKpnLpcK0HgaOKHwm_LRsPPCahWWQ67U/exec";
const RSVP_LOCAL_FALLBACK_KEY = "wedding_rsvp_fallback";
const BASE_PATH = window.location.hostname === "ygnawk.github.io" ? "/wedding-rsvp" : "";

const SECTION_IDS = ["top", "interlude", "our-story", "venue", "schedule", "rsvp", "faq", "stay", "things-to-do", "makan", "travel-visa", "gallery"];

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
const interludeKicker = document.querySelector(".interlude-kicker");
const interludeDays = document.getElementById("interludeDays");
const interludeHours = document.getElementById("interludeHours");
const interludeMinutes = document.getElementById("interludeMinutes");
const interludeSeconds = document.getElementById("interludeSeconds");

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
const stayToggle = document.getElementById("stayToggle");
const stayExtraCards = Array.from(document.querySelectorAll(".stay-extra"));

const galleryGrid = document.getElementById("galleryGrid");
const galleryLightbox = document.getElementById("lightbox") || document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("lightboxImg") || document.getElementById("galleryLightboxImage");
const galleryLightboxCounter = document.getElementById("lightboxCounter");
const galleryLightboxPrev = galleryLightbox ? galleryLightbox.querySelector(".lightbox-btn--prev") : null;
const galleryLightboxNext = galleryLightbox ? galleryLightbox.querySelector(".lightbox-btn--next") : null;
const galleryLightboxFrame = galleryLightbox ? galleryLightbox.querySelector(".lightbox-frame") : null;
const galleryLightboxCloseButtons = galleryLightbox
  ? Array.from(galleryLightbox.querySelectorAll("[data-close], .lightbox-close, #galleryLightboxClose"))
  : [];

let galleryImages = [];
let currentGalleryIndex = 0;
let galleryTouchStartX = null;

const storyTilesGrid = document.getElementById("storyTilesGrid");
const storyTileTemplate = document.getElementById("storyTileTemplate");
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

const MAKAN_CATEGORIES = [
  { title: "Breakfast & street snacks", items: [] },
  { title: "Dumplings & noodles", items: [] },
  { title: "Duck & roasts", items: [] },
  { title: "Hotpot & late-night", items: [] },
  { title: "Desserts & tea", items: [] },
  { title: "Coffee (jet-lag recovery)", items: [] },
];
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
let interludeCountdownIntervalId = null;

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
  const getPart = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
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
    heroCountdown.textContent = `In ${daysRemaining} days`;
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

function padCountdownValue(value) {
  return String(Math.max(0, Number(value) || 0)).padStart(2, "0");
}

function setInterludeCountdownValues(days, hours, minutes, seconds) {
  if (interludeDays) interludeDays.textContent = String(Math.max(0, days));
  if (interludeHours) interludeHours.textContent = padCountdownValue(hours);
  if (interludeMinutes) interludeMinutes.textContent = padCountdownValue(minutes);
  if (interludeSeconds) interludeSeconds.textContent = padCountdownValue(seconds);
}

function getShanghaiCountdownRemainingMs(now = new Date()) {
  const targetUtcEquivalent = Date.UTC(
    WEDDING_DATE_SHANGHAI.year,
    WEDDING_DATE_SHANGHAI.month - 1,
    WEDDING_DATE_SHANGHAI.day,
    0,
    0,
    0,
  );
  const currentParts = getShanghaiDateTimeParts(now);
  const nowUtcEquivalent = Date.UTC(
    currentParts.year,
    currentParts.month - 1,
    currentParts.day,
    currentParts.hour,
    currentParts.minute,
    currentParts.second,
  );
  return targetUtcEquivalent - nowUtcEquivalent;
}

function renderInterludeCountdown() {
  if (!interludeDays || !interludeHours || !interludeMinutes || !interludeSeconds) return;

  const remainingMs = getShanghaiCountdownRemainingMs(new Date());
  if (remainingMs > 0) {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    setInterludeCountdownValues(days, hours, minutes, seconds);
    if (interludeKicker) interludeKicker.textContent = "Counting down to Beijing";
    return;
  }

  const dayDelta = getDaysUntilWeddingShanghai(new Date());
  setInterludeCountdownValues(0, 0, 0, 0);
  if (interludeKicker) interludeKicker.textContent = dayDelta === 0 ? "Today" : "Married!";
}

function initInterludeCountdown() {
  if (!interludeDays || !interludeHours || !interludeMinutes || !interludeSeconds) return;
  renderInterludeCountdown();
  if (interludeCountdownIntervalId) window.clearInterval(interludeCountdownIntervalId);
  interludeCountdownIntervalId = window.setInterval(renderInterludeCountdown, 1000);
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

function initStayDisclosure() {
  if (!stayToggle || !stayExtraCards.length) return;

  const setExpanded = (expanded) => {
    stayToggle.setAttribute("aria-expanded", String(expanded));
    stayToggle.textContent = expanded ? "Show less" : "Show 3 more";
    stayExtraCards.forEach((card) => {
      card.hidden = !expanded;
    });
  };

  setExpanded(false);
  stayToggle.addEventListener("click", () => {
    const currentlyExpanded = stayToggle.getAttribute("aria-expanded") === "true";
    setExpanded(!currentlyExpanded);
  });
}

function initMakanSection() {
  const makanGrid = document.getElementById("makanGrid");
  if (!makanGrid) return;

  makanGrid.innerHTML = "";

  MAKAN_CATEGORIES.forEach((category) => {
    const card = document.createElement("article");
    card.className = "makan-category";

    const title = document.createElement("h4");
    title.className = "makan-category-title";
    title.textContent = category.title;
    card.appendChild(title);

    const list = document.createElement("ul");
    list.className = "makan-lines";

    const hasItems = Array.isArray(category.items) && category.items.length > 0;
    const lines = hasItems ? category.items.slice(0, 4) : ["TBD", "TBD", "TBD", "TBD"];

    lines.forEach((line) => {
      const item = document.createElement("li");
      item.className = hasItems ? "makan-line" : "makan-line is-placeholder";

      const name = document.createElement("span");
      name.className = "makan-line-name";
      name.textContent = String(line);

      const dots = document.createElement("span");
      dots.className = "makan-line-dots";
      dots.setAttribute("aria-hidden", "true");

      item.appendChild(name);
      item.appendChild(dots);
      list.appendChild(item);
    });

    card.appendChild(list);
    makanGrid.appendChild(card);
  });
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
    field.className = "field";

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
  if (config.cropClass === "img-arch" || config.cropClass === "img-round" || config.cropClass === "img-moon") {
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

function isCoarsePointer() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches || window.innerWidth <= 760;
}

function clearStoryTileReveal(keepIndex = -1) {
  if (!storyTilesGrid) return;
  storyTilesGrid.querySelectorAll(".story-tile.is-revealed").forEach((tile) => {
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

function buildStoryTile(item, index) {
  const templateNode = storyTileTemplate && storyTileTemplate.content ? storyTileTemplate.content.firstElementChild : null;
  const tile = templateNode ? templateNode.cloneNode(true) : document.createElement("button");
  tile.type = "button";
  tile.classList.add("story-tile");
  tile.dataset.index = String(index);
  tile.setAttribute("aria-label", `Open story from ${item.yearLabel}`);

  const img = tile.querySelector("img") || document.createElement("img");
  img.src = `${toPhotoSrc(item.file)}${String(item.file).includes("?") ? "&" : "?"}v=${STORY_ASSET_VERSION}`;
  img.alt = item.alt || `Story photo ${item.yearLabel}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectPosition = item.objectPosition || "50% 50%";
  img.dataset.rotate = String(item.rotation);
  img.style.imageOrientation = "from-image";
  if (item.rotation === 90) img.style.setProperty("--storyRotate", "90deg");
  else if (item.rotation === -90) img.style.setProperty("--storyRotate", "-90deg");
  else if (item.rotation === 180) img.style.setProperty("--storyRotate", "180deg");
  else img.style.setProperty("--storyRotate", "0deg");

  const year = tile.querySelector(".story-tile-year") || document.createElement("span");
  year.classList.add("story-tile-year");
  year.textContent = item.yearLabel;

  const caption = tile.querySelector(".story-tile-caption") || document.createElement("span");
  caption.classList.add("story-tile-caption");
  caption.textContent = item.blurb;

  if (!img.parentElement) tile.appendChild(img);
  const overlay = tile.querySelector(".story-tile-overlay");
  if (overlay) {
    overlay.innerHTML = "";
    overlay.appendChild(year);
    overlay.appendChild(caption);
  }

  tile.addEventListener("click", () => {
    const coarsePointer = isCoarsePointer();
    if (coarsePointer && !tile.classList.contains("is-revealed")) {
      clearStoryTileReveal(index);
      tile.classList.add("is-revealed");
      return;
    }
    openStoryLightbox(index);
  });

  return tile;
}

function buildStoryPlaceholder() {
  const tile = document.createElement("div");
  tile.className = "story-tile";
  tile.style.display = "grid";
  tile.style.placeItems = "center";
  tile.style.padding = "16px";
  tile.textContent = "Story photos coming soon.";
  return tile;
}

async function initStoryTiles() {
  if (!storyTilesGrid) return;

  const entries = sortStoryEntries(await loadStoryEntriesFromManifest());
  storyItems = entries.map((entry) => buildStoryItem(entry));
  storyTilesGrid.innerHTML = "";

  if (!storyItems.length) {
    storyTilesGrid.appendChild(buildStoryPlaceholder());
    return;
  }

  storyItems.forEach((item, index) => {
    storyTilesGrid.appendChild(buildStoryTile(item, index));
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".story-tile")) return;
    if (target.closest(".story-lightbox-frame")) return;
    clearStoryTileReveal(-1);
  });

  bindStoryLightboxEvents();
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

  if (reducedMotion) {
    entries.forEach((entry) => {
      entry.img.style.transform = "translate3d(0, 0, 0) scale(1.02)";
    });
    return;
  }

  const active = new Set();
  let ticking = false;

  const update = () => {
    ticking = false;
    const isMobile = window.innerWidth <= 760;

    entries.forEach((entry) => {
      if (!active.has(entry.block)) return;

      if (isMobile && entry.index > 0) {
        entry.img.style.transform = "translate3d(0, 0, 0) scale(1.02)";
        return;
      }

      const rect = entry.block.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const blockCenter = rect.top + rect.height / 2;
      const delta = viewportCenter - blockCenter;
      const strength = isMobile ? entry.speed * 0.5 : entry.speed;
      const maxShift = isMobile ? 20 : 34;
      const translateY = Math.max(-maxShift, Math.min(maxShift, delta * strength));
      entry.img.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(1.06)`;
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
  window.addEventListener("resize", requestTick);
  requestTick();
}

async function init() {
  setActiveLink("top");
  initHeader();
  initHeroCountdown();
  initInterludeCountdown();
  initSectionObserver();
  initStayDisclosure();
  initMakanSection();
  initReveals();
  await initStoryTiles();
  initCutoutParallax();
  initRsvpCards();
  initRsvpForm();

  photoManifest = await loadManifest();
  applyInviteContext();
  applyStaticPhotoManifest();
  initFaqWearImageDebug();
  await initGallery();

  inviteState.token = getTokenFromUrl();
  await lookupToken(inviteState.token);
}

init();

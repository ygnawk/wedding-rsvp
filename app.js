const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwpfLq3hB_mRiKKgiwMv1bvZUUtcoUZP7ifjKpnLpcK0HgaOKHwm_LRsPPCahWWQ67U/exec";
const RSVP_LOCAL_FALLBACK_KEY = "wedding_rsvp_fallback";
const BASE_PATH = window.location.hostname === "ygnawk.github.io" ? "/wedding-rsvp" : "";

const SECTION_IDS = ["top", "our-story", "venue", "schedule", "rsvp", "faq", "stay", "things-to-do", "travel-visa", "gallery"];

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

const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");
const galleryLightbox = document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("galleryLightboxImage");
const galleryLightboxCaption = document.getElementById("galleryLightboxCaption");
const galleryLightboxClose = document.getElementById("galleryLightboxClose");

const GALLERY_FALLBACK_FILES = [
  "LMN_0527.jpg",
  "LMN_0953.jpg",
  "LMN_2093.jpg",
  "LMN_4200.jpg",
  "LMN_4326.jpg",
  "LMN_1503.jpg",
  "LMN_0812.jpg",
  "LMN_1409.jpg",
  "LMN_2075.jpg",
];

const TIMELINE_CAPTIONS = {
  1995: "Yi Jie — Born in Singapore. Born tired. Still tired.",
  1998: "Miki — Born in Japan. (Already cooler than us.)",
  2001: "Yi Jie — Grew up with siblings. Character building.",
  2008: "Miki — Moved to Beijing to learn music. (Discipline arc begins.)",
  2013: "Yi Jie — Went to the military… to fish?!?",
  2016: "We met at Wesleyan (CT). Plot twist: it wasn't for the classes ;)",
  2020: "Moved to NYC in the middle of COVID. (Oops.)",
  2021: "SF for the outdoors. But we couldn't afford a car.",
  2023: "Asia year, mostly in Tokyo — Miki quit her job, YJ found projects in JP",
  2024: "Proposal in Singapore. (She said yes. We are still shocked.)",
  2025: "Adopted Leo & Luna — two fluffy Siberians. Zero personal space.",
  2026: "Wedding in Beijing. (Finally.)",
  2027: "What’s next…? (We’ll pretend we have a plan.)",
};
const TIMELINE_ASSET_VERSION = "20260215-1310";
const TIMELINE_OVERRIDES = {
  // Lock problematic files so orientation and year placement stay stable.
  "2008-miki-moves-beijing-upright.jpg": { rotate: -90, yearTop: 56, objPos: "50% 36%" },
  "2020-covid-upright.jpg": { rotate: 180, yearTop: 56, objPos: "50% 36%" },
  "2024-proposal-upright.jpg": { rotate: -90, yearTop: 56, objPos: "50% 40%" },
  // Legacy names (kept in case old files are reintroduced).
  "2008-miki-moves-beijing.jpg": { rotate: -90, yearTop: 56, objPos: "50% 36%" },
  "2008-miki-moves-beijing-v2.jpg": { rotate: -90, yearTop: 56, objPos: "50% 36%" },
  "2008 - Miki moves to China.JPG": { rotate: -90, yearTop: 56, objPos: "50% 36%" },
  "2020-covid.jpg": { rotate: 180, yearTop: 56, objPos: "50% 36%" },
  "2020-covid-v2.jpg": { rotate: 180, yearTop: 56, objPos: "50% 36%" },
  "2020-covid-from-heic.jpg": { rotate: 180, yearTop: 56, objPos: "50% 36%" },
  "2020 - COVID.HEIC": { rotate: 180, yearTop: 56, objPos: "50% 36%" },
  "2024-proposal.jpg": { rotate: -90, yearTop: 56, objPos: "50% 40%" },
  "2024-proposal-v2.jpg": { rotate: -90, yearTop: 56, objPos: "50% 40%" },
  "2024 - She said yes.JPG": { rotate: -90, yearTop: 56, objPos: "50% 40%" },
};

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

function setupRevealNode(node) {
  const delay = node.getAttribute("data-delay");
  node.style.setProperty("--reveal-delay", `${Number(delay || 0)}ms`);

  if (reducedMotion) {
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

function normalizeGalleryEntry(entry) {
  if (typeof entry === "string") {
    return {
      file: entry.trim(),
      alt: "",
      cropClass: "img-round",
      objectPosition: "50% 35%",
      tags: [],
      category: "",
      people: false,
    };
  }

  if (!entry || typeof entry !== "object") {
    return {
      file: "",
      alt: "",
      cropClass: "img-round",
      objectPosition: "50% 35%",
      tags: [],
      category: "",
      people: false,
    };
  }

  const tags = Array.isArray(entry.tags) ? entry.tags.map((tag) => String(tag).toLowerCase()) : [];
  return {
    file: String(entry.file || entry.src || "").trim(),
    alt: String(entry.alt || "").trim(),
    cropClass: String(entry.cropClass || "img-round").trim(),
    objectPosition: String(entry.objectPosition || "50% 35%").trim(),
    tags,
    category: String(entry.category || "").toLowerCase(),
    people: Boolean(entry.people),
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

function hasHumanSignal(entry) {
  const file = String(entry.file || "").toLowerCase();
  const alt = String(entry.alt || "").toLowerCase();
  const combinedTags = `${entry.category || ""} ${Array.isArray(entry.tags) ? entry.tags.join(" ") : ""}`;

  if (entry.people) return true;
  if (/(^|\/)lmn_/i.test(file)) return true;
  if (/(people|person|human|portrait|couple|friends|family|miki|yi j|yi jie|us|together)/i.test(alt)) return true;
  if (/(people|person|human|portrait|couple|friends|family)/i.test(combinedTags)) return true;

  return false;
}

function getHumanGalleryCandidates(manifest) {
  const galleryRaw = manifest && Array.isArray(manifest.gallery) ? manifest.gallery : [];
  const normalized = galleryRaw.map((entry) => normalizeGalleryEntry(entry)).filter((entry) => entry.file);

  const filtered = normalized.filter((entry) => !isExcludedGalleryFile(entry.file) && hasHumanSignal(entry));
  const deduped = [];
  const seen = new Set();

  filtered.forEach((entry) => {
    const key = String(entry.file).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(entry);
  });

  return deduped;
}

function getFallbackGalleryEntries(manifest) {
  const galleryRaw = manifest && Array.isArray(manifest.gallery) ? manifest.gallery : [];
  const normalized = galleryRaw.map((entry) => normalizeGalleryEntry(entry)).filter((entry) => entry.file);

  const byFile = new Map(normalized.map((entry) => [String(entry.file).toLowerCase(), entry]));
  const picked = [];

  GALLERY_FALLBACK_FILES.forEach((file) => {
    const match = byFile.get(file.toLowerCase());
    if (match && !isExcludedGalleryFile(match.file)) picked.push(match);
  });

  if (picked.length >= 6) return picked.slice(0, 6);

  const seen = new Set(picked.map((entry) => String(entry.file).toLowerCase()));
  normalized.forEach((entry) => {
    const key = String(entry.file).toLowerCase();
    if (seen.has(key)) return;
    if (isExcludedGalleryFile(entry.file)) return;
    if (!/(^|\/)lmn_/i.test(entry.file)) return;
    picked.push(entry);
    seen.add(key);
  });

  const finalPicked = picked.slice(0, 6);
  if (finalPicked.length) return finalPicked;

  return GALLERY_FALLBACK_FILES.map((file) => ({
    file,
    alt: "Couple photo",
    cropClass: "img-round",
    objectPosition: "50% 42%",
    tags: ["couple"],
    category: "gallery",
    people: true,
  }));
}

function measureImageBrightness(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        const sampleSize = 48;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

        let luminanceSum = 0;
        let pixels = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          luminanceSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
          pixels += 1;
        }

        resolve(pixels ? luminanceSum / pixels : null);
      } catch (_error) {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function pickBalancedGalleryEntries(entries, count) {
  const safeCount = Math.max(0, Number(count) || 0);
  if (safeCount === 0) return [];
  if (!entries.length) return [];

  const withBrightness = await Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      _brightness: await measureImageBrightness(toPhotoSrc(entry.file)),
    })),
  );

  const measured = withBrightness.filter((entry) => Number.isFinite(entry._brightness));
  if (measured.length < safeCount) return withBrightness.slice(0, safeCount);

  const sortedByLight = [...measured].sort((a, b) => a._brightness - b._brightness);
  const half = Math.floor(sortedByLight.length / 2);
  const moodyPool = sortedByLight.slice(0, half);
  const brightPool = sortedByLight.slice(half).reverse();

  const targetBright = Math.min(3, brightPool.length);
  const targetMoody = Math.min(3, moodyPool.length);

  const selected = [];
  let brightUsed = 0;
  let moodyUsed = 0;
  while (selected.length < safeCount && (brightPool.length || moodyPool.length)) {
    if (brightUsed < targetBright && brightPool.length) {
      selected.push(brightPool.shift());
      brightUsed += 1;
    }
    if (selected.length >= safeCount) break;
    if (moodyUsed < targetMoody && moodyPool.length) {
      selected.push(moodyPool.shift());
      moodyUsed += 1;
    }
    if (brightUsed >= targetBright && moodyUsed >= targetMoody) break;
  }

  if (selected.length < safeCount) {
    const seen = new Set(selected.map((entry) => entry.file.toLowerCase()));
    for (const entry of sortedByLight.reverse()) {
      if (seen.has(entry.file.toLowerCase())) continue;
      selected.push(entry);
      seen.add(entry.file.toLowerCase());
      if (selected.length >= safeCount) break;
    }
  }

  return selected.slice(0, safeCount);
}

function openGalleryLightbox(entry) {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) return;

  galleryLightboxImage.src = toPhotoSrc(entry.file);
  galleryLightboxImage.alt = entry.alt || "Gallery photo";
  galleryLightboxCaption.textContent = entry.alt || "";
  galleryLightbox.classList.add("open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) return;
  galleryLightbox.classList.remove("open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  galleryLightboxImage.removeAttribute("src");
  galleryLightboxCaption.textContent = "";
  document.body.style.overflow = "";
}

function bindGalleryLightboxEvents() {
  if (!galleryLightbox || galleryLightbox.dataset.bound === "true") return;

  if (galleryLightboxClose) galleryLightboxClose.addEventListener("click", closeGalleryLightbox);
  galleryLightbox.addEventListener("click", (event) => {
    if (event.target === galleryLightbox) closeGalleryLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && galleryLightbox.classList.contains("open")) {
      closeGalleryLightbox();
    }
  });

  galleryLightbox.dataset.bound = "true";
}

function buildGalleryCard(entry) {
  const card = document.createElement("figure");
  card.className = "gallery-item";
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", entry.alt || "Open gallery photo");

  const frame = document.createElement("div");
  const cropClass = entry.cropClass === "img-arch" || entry.cropClass === "img-round" || entry.cropClass === "img-moon" ? entry.cropClass : "img-round";
  frame.className = `photo-frame ${cropClass}`;

  const img = document.createElement("img");
  img.src = toPhotoSrc(entry.file);
  img.alt = entry.alt || "Gallery photo";
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectFit = "cover";
  img.style.objectPosition = entry.objectPosition || "50% 35%";

  frame.appendChild(img);
  card.appendChild(frame);

  card.addEventListener("click", () => openGalleryLightbox(entry));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGalleryLightbox(entry);
    }
  });

  return card;
}

async function initGallery() {
  if (!galleryGrid) return;
  bindGalleryLightboxEvents();

  galleryGrid.innerHTML = "";
  if (galleryEmpty) galleryEmpty.classList.add("hidden");

  try {
    const candidates = getHumanGalleryCandidates(photoManifest || {});
    const targetCount = 9;
    const prioritized = getFallbackGalleryEntries(photoManifest || {});
    let selected = prioritized.slice(0, targetCount);

    if (selected.length < targetCount) {
      const used = new Set(selected.map((entry) => String(entry.file).toLowerCase()));
      const remaining = candidates.filter((entry) => !used.has(String(entry.file).toLowerCase()));
      const extras = await pickBalancedGalleryEntries(remaining, targetCount - selected.length);
      selected = [...selected, ...extras].slice(0, targetCount);
    }

    if (!selected.length) {
      selected = await pickBalancedGalleryEntries(candidates, targetCount);
    }

    if (!selected.length) {
      if (galleryEmpty) galleryEmpty.classList.remove("hidden");
      return;
    }

    selected.forEach((entry) => {
      const card = buildGalleryCard(entry);
      galleryGrid.appendChild(card);
    });
  } catch (_error) {
    const fallback = getFallbackGalleryEntries(photoManifest || {});
    if (fallback.length) {
      fallback.forEach((entry) => {
        const card = buildGalleryCard(entry);
        galleryGrid.appendChild(card);
      });
      return;
    }

    if (galleryEmpty) galleryEmpty.classList.remove("hidden");
  }
}

function extractTimelineYear(value) {
  const basename = String(value || "").split("/").pop() || "";
  const match = basename.match(/(?:^|[^0-9])((?:19|20)\d{2})(?!\d)/);
  return match ? Number(match[1]) : NaN;
}

function timelineCaptionForYear(year) {
  return TIMELINE_CAPTIONS[year] || `A moment from ${year}.`;
}

function timelineCaptionForItem(item) {
  const file = String(item?.file || "").toLowerCase();
  if (Number(item?.year) === 2001 && file.includes("stool")) {
    return "Yi Jie — The three of us, on tiny stools. Peak childhood.";
  }
  return timelineCaptionForYear(item?.year);
}

function timelineYearLabel(item) {
  return Number(item?.year) === 2027 ? "Future..." : String(item?.year);
}

function normalizeTimelineEntry(entry) {
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
    yearTop: Number.isFinite(Number(entry.yearTop)) ? Number(entry.yearTop) : NaN,
    alt: String(entry.alt || "").trim(),
  };
}

function sortTimelineEntries(entries) {
  const normalized = (entries || []).map(normalizeTimelineEntry).filter((entry) => entry.file);
  const byFile = new Map();
  normalized.forEach((entry) => {
    byFile.set(entry.file, entry);
  });

  const unique = Array.from(byFile.values());
  return unique
    .map((entry) => ({
      file: entry.file,
      objectPosition: entry.objectPosition,
      fit: entry.fit,
      rotation: entry.rotation,
      yearTop: entry.yearTop,
      alt: entry.alt,
      year: extractTimelineYear(entry.file),
    }))
    .sort((a, b) => {
      const yearA = Number.isFinite(a.year) ? a.year : Number.POSITIVE_INFINITY;
      const yearB = Number.isFinite(b.year) ? b.year : Number.POSITIVE_INFINITY;
      if (yearA !== yearB) return yearA - yearB;
      return a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" });
    });
}

async function loadTimelinePhotosFromManifest() {
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
      .map((entry) => normalizeTimelineEntry(entry))
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

async function loadTimelinePhotos() {
  const manifestFiles = await loadTimelinePhotosFromManifest();
  if (manifestFiles.length) return sortTimelineEntries(manifestFiles);
  return [];
}

function buildTimelineSlide(item) {
  const template = document.getElementById("timelineSlideTemplate");
  const templateNode = template && template.content ? template.content.firstElementChild : null;
  const slide = templateNode ? templateNode.cloneNode(true) : document.createElement("div");
  slide.classList.add("timeline-slide");
  slide.setAttribute("data-year", String(item.year));

  const imageWrap = slide.querySelector(".timeline-image") || document.createElement("div");
  imageWrap.classList.add("timeline-image");

  const media = slide.querySelector(".timeline-media") || document.createElement("div");
  media.classList.add("timeline-media", "img-moon");

  const img = slide.querySelector(".timeline-media img") || document.createElement("img");
  const yearTag = slide.querySelector(".timeline-year") || document.createElement("div");
  const caption = slide.querySelector(".timeline-caption") || document.createElement("div");

  const filename = decodeURIComponent((String(item.file || "").split("?")[0].split("/").pop() || "").trim());
  const override = TIMELINE_OVERRIDES[filename] || {};
  const rotateValue = Number.isFinite(Number(override.rotate))
    ? Number(override.rotate)
    : Number.isFinite(Number(item.rotation))
      ? Number(item.rotation)
      : 0;
  const yearTopValue = Number.isFinite(Number(override.yearTop))
    ? Number(override.yearTop)
    : Number.isFinite(Number(item.yearTop))
      ? Number(item.yearTop)
      : 56;
  const objectPosition = override.objPos || item.objectPosition || "50% 50%";

  slide.setAttribute("data-rotate", String(rotateValue));

  img.src = `${item.file}${item.file.includes("?") ? "&" : "?"}v=${TIMELINE_ASSET_VERSION}`;
  img.alt = item.alt || `${item.year} timeline photo`;
  img.loading = "lazy";
  img.decoding = "async";
  img.style.objectFit = item.fit || "cover";
  img.style.setProperty("--objPos", objectPosition);
  img.style.objectPosition = objectPosition;

  yearTag.classList.add("timeline-year");
  yearTag.textContent = timelineYearLabel(item);
  yearTag.style.setProperty("--yearTop", `${yearTopValue}px`);

  caption.classList.add("timeline-caption");
  caption.textContent = timelineCaptionForItem(item);

  if (!img.parentElement) media.appendChild(img);
  if (!yearTag.parentElement) imageWrap.appendChild(yearTag);
  if (!media.parentElement) imageWrap.appendChild(media);
  if (yearTag.parentElement === imageWrap && media.parentElement === imageWrap && yearTag.nextElementSibling !== media) {
    imageWrap.insertBefore(yearTag, media);
  }
  if (!imageWrap.parentElement) slide.appendChild(imageWrap);
  if (!caption.parentElement) slide.appendChild(caption);
  return slide;
}

function buildTimelinePlaceholder() {
  const slide = document.createElement("div");
  slide.className = "timeline-slide timeline-slide--placeholder";
  slide.setAttribute("data-year", "timeline");

  const imageWrap = document.createElement("div");
  imageWrap.className = "timeline-image";

  const media = document.createElement("div");
  media.className = "timeline-media img-moon";

  const placeholder = document.createElement("div");
  placeholder.className = "timeline-placeholder";
  placeholder.textContent = "Timeline";

  media.appendChild(placeholder);
  imageWrap.appendChild(media);

  const caption = document.createElement("div");
  caption.className = "timeline-caption";
  caption.textContent = "Photos coming soon.";

  slide.appendChild(imageWrap);
  slide.appendChild(caption);
  return slide;
}

async function initStoryTimeline() {
  const viewport = document.getElementById("timelineViewport");
  const track = document.getElementById("timelineTrack");
  const dots = document.getElementById("timelineDots");
  const prevButton = document.getElementById("timelinePrev");
  const nextButton = document.getElementById("timelineNext");
  if (!viewport || !track || !dots || !prevButton || !nextButton) return;

  const photos = await loadTimelinePhotos();
  track.innerHTML = "";
  dots.innerHTML = "";

  if (!photos.length) {
    track.appendChild(buildTimelinePlaceholder());
  } else {
    photos.forEach((item) => {
      if (!Number.isFinite(item.year)) return;
      track.appendChild(buildTimelineSlide(item));
    });
  }

  const slides = Array.from(track.querySelectorAll(".timeline-slide"));
  if (!slides.length) {
    track.appendChild(buildTimelinePlaceholder());
    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  const dotNodes = slides.map((_slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "timeline-dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => {
      slides[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    dots.appendChild(dot);
    return dot;
  });

  const hasMultipleSlides = slides.length > 1;
  prevButton.disabled = !hasMultipleSlides;
  nextButton.disabled = !hasMultipleSlides;

  const getActiveIndex = () => {
    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    let bestIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const center = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const updateDots = () => {
    const activeIndex = getActiveIndex();
    dotNodes.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  };

  let ticking = false;
  viewport.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateDots();
        ticking = false;
      });
    },
    { passive: true },
  );

  viewport.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    },
    { passive: false },
  );

  prevButton.addEventListener("click", () => {
    const activeIndex = getActiveIndex();
    const targetIndex = Math.max(0, activeIndex - 1);
    slides[targetIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });

  nextButton.addEventListener("click", () => {
    const activeIndex = getActiveIndex();
    const targetIndex = Math.min(slides.length - 1, activeIndex + 1);
    slides[targetIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });

  updateDots();
}

async function init() {
  setActiveLink("top");
  initHeader();
  initSectionObserver();
  initReveals();
  await initStoryTimeline();
  initRsvpCards();
  initRsvpForm();

  photoManifest = await loadManifest();
  applyInviteContext();
  applyStaticPhotoManifest();
  await initGallery();

  inviteState.token = getTokenFromUrl();
  await lookupToken(inviteState.token);
}

init();

const CASES = {
  "atvidaberg-tandvard": {
    ref: "CASE / 01",
    title: "Åtvidaberg Tandvård",
    tags: "Freelance / Full-Stack Developer / Dental Clinic",
    status: "WIP",
    problem: "TODO",
    built: "Currently designing & developing a new website for Åtvidaberg Tandvård, a dental clinic in Sweden, alongside building a backend system to connect the website with the clinic's existing booking software, Opus Dental.",
    decision: "TODO",
    wrong: "TODO",
    result: "TODO",
    current: "WIP. Sep 2026 – Present · 1 mo · Remote.",
  },
  "codecheckr": {
    ref: "CASE / 02",
    title: "CodeCheckr",
    tags: "Self-employed / Founder & Full-Stack / EdTech",
    status: "WIP",
    problem: "TODO",
    built: "Founded and developing CodeCheckr, a coding education & assessment platform for GCSE Computer Science students. Built the full platform from the ground up: student & class management, secure in-browser Python execution, custom assignment & test case creation for teachers, and a library of pre-made programming exercises.",
    decision: "TODO",
    wrong: "TODO",
    result: "TODO",
    current: "WIP. Finalising teacher analytics and brand identity re-work before closed beta. Feb 2025 – Present · 1 yr 8 mos · London, UK.",
  },
  "arshachu": {
    ref: "CASE / 03",
    title: "Arshachu",
    tags: "Self-employed / Founder & Full-Stack / E-Commerce",
    status: "Completed",
    problem: "TODO",
    built: "Founded Arshachu at 15, scaling from a few hundred pounds of initial capital to a six-figure operation in under a year. Designed and built the full-stack e-commerce platform from scratch using React, TypeScript, Supabase and PostgreSQL; integrated Stripe payments and subscriptions, automated inventory management, customer accounts, email marketing and Royal Mail shipping automation.",
    decision: "TODO",
    wrong: "TODO",
    result: "Six-figure revenue within a year of founding.",
    current: "Mar 2025 – Feb 2026 · 1 yr · London, UK.",
  },
  "map2med": {
    ref: "CASE / 04",
    title: "Map2Med",
    tags: "Freelance / Web Developer / MedTech",
    status: "Completed",
    problem: "TODO",
    built: "Designed & developed the Map2Med website using HTML, CSS, and JavaScript. One of my earliest web dev projects; first chance to apply learning to a real-world project.",
    decision: "TODO",
    wrong: "TODO",
    result: "TODO",
    current: "Jun 2024 – Jul 2024 · 2 mos · Remote.",
  },
};

(function () {
  try {
    const s = "font-family:'JetBrains Mono',monospace;font-size:13px;padding:4px 8px;line-height:1.5;";
    console.log("%c%s", s + "color:#111;background:#F0ECE2;", " // You looked under the hood.");
    console.log("%c%s", s + "color:#111;background:#F0ECE2;", " I like you.");
  } catch (_) {}

  // ponytail: flip to false to re-enable full case-study modal system
  const COMING_SOON = true;

  const KEYS = Object.keys(CASES);
  const $ = (id) => document.getElementById(id);
  const modal = $("caseModal");
  const rows = document.querySelectorAll(".project-row");
  let skipHash = false;

  const FIELD_MAP = {
    ref: "caseRef", title: "caseTitle", tags: "caseTags", status: "caseStatus",
    problem: "caseProblem", built: "caseBuilt", decision: "caseDecision",
    wrong: "caseWrong", result: "caseResult", current: "caseCurrent"
  };
  const demoSection = $("caseDemoSection");
  const demoLink = $("caseDemoLink");
  const caseComingSoon = $("caseComingSoon");
  const caseLegacy = $("caseLegacy");
  if (caseComingSoon && caseLegacy) {
    caseComingSoon.hidden = !COMING_SOON;
    caseLegacy.hidden = COMING_SOON;
  }

  function populate(key) {
    if (COMING_SOON) return;
    const c = CASES[key];
    if (!c) return;
    for (const k in FIELD_MAP) $(FIELD_MAP[k]).textContent = c[k];
    demoSection.hidden = !c.demo?.url;
    if (demoSection.hidden) return;
    demoLink.href = c.demo.url;
    demoLink.textContent = (c.demo.label || c.demo.url).trim();
  }

  function currentKey() {
    const h = location.hash.slice(1).trim().toLowerCase();
    return KEYS.includes(h) ? h : null;
  }

  function open(key, writeHash = true) {
    if (!CASES[key]) return;
    populate(key);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!writeHash || skipHash) return;
    try { history.pushState({ key }, "", "#" + key); }
    catch (_) { location.hash = key; }
  }

  function close(writeHash = true) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (!writeHash || !currentKey()) return;
    skipHash = true;
    try { history.pushState({ key: null }, "", location.pathname + location.search); }
    catch (_) { location.hash = ""; }
    setTimeout(() => (skipHash = false), 40);
  }

  rows.forEach((row) => {
    const key = row.dataset.project;
    row.addEventListener("click", () => open(key));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        open(key);
      }
    });
  });

  document.querySelector(".case-overlay").addEventListener("click", () => close());
  document.querySelector(".case-close").addEventListener("click", () => close());
  document.addEventListener("keydown", (e) =>
    e.key === "Escape" && modal.classList.contains("open") && close());
  const syncFromUrl = () => {
    if (skipHash) return;
    const key = currentKey();
    key ? open(key, false) : modal.classList.contains("open") && close(false);
  };
  addEventListener("hashchange", syncFromUrl);
  addEventListener("popstate", syncFromUrl);

  currentKey() && open(currentKey(), false);

  modal.addEventListener("click", (e) => e.target.hasAttribute("data-close") && close());
  const sql = $("sqlLine");
  if (sql) {
    let busy = false;
    sql.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      rows.forEach((r, i) => {
        setTimeout(() => r.classList.add("flash"), i * 70);
        setTimeout(() => r.classList.remove("flash"), i * 70 + 520);
      });
      setTimeout(() => (busy = false), rows.length * 70 + 620);
    });
  }
})();
const CASES = {
  proj1: {
    ref: "CASE / 01",
    title: "Project One",
    tags: "tag1 / tag2",
    status: "wip",
    problem: "stub problem",
    built: "stub built",
    decision: "stub decision",
    wrong: "stub wrong",
    result: "stub result",
    current: "stub current",
  },
  proj2: { ref: "CASE / 02", title: "Project Two", tags: "tag1 / tag2", status: "wip", problem: "p2", built: "b2", decision: "d2", wrong: "w2", result: "r2", current: "c2" },
  proj3: { ref: "CASE / 03", title: "Project Three", tags: "tag1 / tag2", status: "wip", problem: "p3", built: "b3", decision: "d3", wrong: "w3", result: "r3", current: "c3" },
  proj4: { ref: "CASE / 04", title: "Project Four", tags: "tag1 / tag2", status: "wip", problem: "p4", built: "b4", decision: "d4", wrong: "w4", result: "r4", current: "c4" },
};

(function () {
  const KEYS = Object.keys(CASES);
  const $ = (id) => document.getElementById(id);
  const modal = $("caseModal");
  const rows = document.querySelectorAll(".project-row");
  let skipHash = false;

  const FIELD_MAP = {
    ref: "caseRef", title: "caseTitle", tags: "caseTags", status: "caseStatus",
    problem: "caseProblem", built: "caseBuilt", decision: "caseDecision",
    wrong: "caseWrong", result: "caseResult", current: "caseCurrent",
  };

  function populate(key) {
    const c = CASES[key];
    if (!c) return;
    for (const k in FIELD_MAP) $(FIELD_MAP[k]).textContent = c[k];
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

  function currentKey() {
    const h = location.hash.replace(/^#/, "").trim().toLowerCase();
    return KEYS.includes(h) ? h : null;
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

  const syncFromUrl = () => {
    if (skipHash) return;
    const key = currentKey();
    key ? open(key, false) : modal.classList.contains("open") && close(false);
  };
  addEventListener("hashchange", syncFromUrl);
  addEventListener("popstate", syncFromUrl);

  currentKey() && open(currentKey(), false);

  rows.forEach((row) => {
    row.addEventListener("click", () => open(row.getAttribute("data-project")));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        open(row.getAttribute("data-project"));
      }
    });
  });

  document.querySelector(".case-overlay").addEventListener("click", () => close());
  document.querySelector(".case-close").addEventListener("click", () => close());
  document.addEventListener("keydown", (e) =>
    e.key === "Escape" && modal.classList.contains("open") && close());

  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) close();
  });
})();

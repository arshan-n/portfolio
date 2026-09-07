const CASES = {
  mashtest: {
    ref: "CASE / 00",
    title: "test",
    tags: "qwerty / asdf",
    status: "wip",
    problem:
      "alskdjlkasjdlk asj dlkj aslkd jlkasj dljksld.",
    built:
      "dskfjk sjdfkl sjdhf lkjsd lkf sjdklf qwei qpw oiru jaksdf lkxj.",
    decision:
      "qowiru qpw pei oqi wepr oqw eiro pw iou qwp eor iqwp eiour.",
    wrong:
      "zoxmvbc nbxzcv mzcx bv zxmv bvcxz lkhgfd sa poi uy tr ew.",
    result:
      "aklsjd fqpw eiur ymvnx zc bhasgdf ioyqw uer zxmbv ckhalsd fp.",
    current:
      "oaiusdoiuasoidu aosid uas jdlk ajskld aksd.",
  },
};

(function () {
  try {
    const s = "font-family:'JetBrains Mono',monospace;font-size:13px;padding:4px 8px;line-height:1.5;";
    console.log("%c%s", s + "color:#111;background:#F0ECE2;", " // You looked under the hood.");
    console.log("%c%s", s + "color:#111;background:#FAFAF7;", " I like you.");
  } catch (_) {}

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

  function populate(key) {
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
const CASES = {
  arshachu: {
    ref: "CASE / 01",
    title: "Arshachu",
    tags: "commerce / software",
    status: "active",
    problem:
      "A classic e-commerce arbitrage problem with one extra constraint: every supplier price and availability feed updated on its own cadence, and the business couldn't afford stale listings leading to oversells. The previous stack was a single cron job every 15 minutes that wrote the entire price table — it scaled to about 8k SKUs before each sync run started overlapping with the next one and corrupting inventory.",
    built:
      "Replaced the monolithic sync with a per-SKU state machine plus a delta-publish pipeline. Incoming supplier feeds are parsed into row-level diffs, each diff is idempotently applied against a Postgres materialized view, and only rows whose final price or stock changed get pushed to the shop API. A backpressure queue handles the slow Shopify REST rate limits.",
    decision:
      "Kept it on Postgres + a small Node worker rather than introducing a queue product like Kafka or SQS. The total daily message volume didn't warrant the operational weight of a dedicated message broker, and the per-queue ordering guarantees we needed (SKU-level serializability) were easier to implement correctly with advisory locks on SKU ids in Postgres than on a consumer group.",
    wrong:
      "First version used advisory locks at the supplier-level, not the SKU-level. Worked fine for one supplier. When we onboarded a second supplier that overlapped on 200 SKUs, we got silent write-write races on those SKUs that surfaced as 'sometimes the price is wrong, randomly' bugs three weeks later. Took two days of live tracing to reproduce because it only happened under the 1am bulk-sync load.",
    result:
      "£300 starting ad budget turned into six figures in top-line revenue inside 12 months. Sync overlap dropped from ~14% of runs to zero. Worst-case listing staleness went from 15+ minutes to under 60 seconds even with 3 concurrent suppliers active, and oversell tickets hit zero within a month of rollout.",
    current:
      "Still actively running on the same stack today. I add new supplier parsers occasionally. Once a month I run VACUUM ANALYZE and archive a copy of the materialized view offsite. It is the most boring production system I own and that is a very good thing.",
    demo: {
      url: "https://arshachu.example.com/",
      label: "visit arshachu storefront →",
    },
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

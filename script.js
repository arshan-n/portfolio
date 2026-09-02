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
  codecheckr: {
    ref: "CASE / 02",
    title: "CodeCheckr",
    tags: "education / software",
    status: "building",
    problem:
      "Most automated marking for CS1-level courses grades on passing test cases only, which means students learn to game test suites instead of writing robust code. The grading assistants at the university were manually reading hundreds of submissions per week to catch surface-level correctness with no structural insight — and it was burning them out.",
    built:
      "A two-stage marker: first stage runs test suites as usual (fast, parallel, per-process isolation). Second stage runs an AST-level rubric checker on the passing submissions, scoring on separation of concerns, depth of control flow, naming hygiene, and several domain-specific structural heuristics. TAs only review the combined rubric output plus the small set of submissions that failed all or nothing — they don't touch the bulk of submissions at all.",
    decision:
      "Wrote the AST layer on the same parser that powers the reference solution itself instead of parsing each submission a second time. That way if a language upgrade introduces a syntax rule that breaks one submission, it breaks the baseline first and we find it during spec review, not as a ghost false-negative in production.",
    wrong:
      "First pass had the rubric weights tuned way too aggressively against long variable names. Top-scoring submissions started renaming variables to 2 or 3 character names to beat the 'line noise' rubric rule. Hilarious and very obvious in hindsight — I threw the name-length rule out and replaced it with an identifier-reuse metric across functions instead.",
    result:
      "Currently in live beta with a single 120-student course. TA grading time per assignment is down from ~2 days total to ~2 hours, and the feedback turnaround for students went from 9 days post-deadline to under 48 hours. Structural rubric is still being tuned every assignment cycle.",
    current:
      "Active build. Next items are a student-facing rubric breakdown so submissions know *why* they lost marks, and a JSON export feed that plugs directly into the university's existing LMS grade import without another manual upload step.",
    demo: {
      url: "https://codecheckr.example.com/",
      label: "try the demo grader →",
    },
  },
  atvidaberg: {
    ref: "CASE / 03",
    title: "Åtvidaberg Tandvård",
    tags: "healthcare / software",
    status: "maintained",
    problem:
      "A small clinic with three dentists and one receptionist using a mish-mash of Google Calendar, a legacy book-it-online widget from 2017 that didn't know about Swedish public holidays, and an intake paper form that patients had to fill out on arrival and then get typed in by hand. No-show rate was ~19% and the receptionist spent 3+ hours a day on booking confirmations.",
    built:
      "A single booking + intake web app glued directly on top of the existing Google Workspace setup. Calendar writes go straight to their existing calendar with no data-migration step. Intake forms are collected 24 hours before the appointment via a signed one-time URL and rendered as a pre-filled PDF waiting in the patient file folder by appointment start. SMS reminders go out 72h, 24h, and 2h before via Twilio.",
    decision:
      "Refused to build a custom calendar from scratch. Every part of this system that touches time or dates is unmodified Google Calendar logic, including their holiday handling, recurring-event expansion, and cross-user conflict detection. The app only applies clinic-specific rules (opening hours, dentist-to-specialty matching) and rejects anything before the write. Date bugs are the worst. Let Google have them.",
    wrong:
      "The 2-hour-before SMS reminder launched with the same 'reply YES or NO' template as the 24h one. Receptionist started replying to patients who texted back 'NO' at 2 hours with 'thanks!' manually. Fine until one Monday morning 3 patients cancelled within 10 minutes and she was busy with a walk-in emergency — the empty slots went un-filled for 18 hours total. 2h reminder became 'see you soon, call the clinic if you need to reschedule' instead.",
    result:
      "No-show rate dropped from 19% to under 6% in the first three months. Receptionist booking-administration time is down to about 30 minutes a day and mostly just handling edge-case phone calls. The dentists still use the exact calendar interface they've used for 10 years, which was the entire point.",
    current:
      "Maintenance releases once a quarter. Biggest ongoing effort is keeping the Google OAuth consent screen and scopes alive as Google periodically deprecates things. Not fun, but 15 minutes of work every few months. Otherwise the system hums.",
    demo: {
      url: "https://atvidaberg-tandvard.example.com/",
      label: "book a demo appointment →",
    },
  },
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

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

  function populate(key) {
    const c = CASES[key];
    if (!c) return;
    $("caseRef").textContent = c.ref;
    $("caseTitle").textContent = c.title;
    $("caseTags").textContent = c.tags;
    $("caseStatus").textContent = c.status;
    $("caseProblem").textContent = c.problem;
    $("caseBuilt").textContent = c.built;
    $("caseDecision").textContent = c.decision;
    $("caseWrong").textContent = c.wrong;
    $("caseResult").textContent = c.result;
    $("caseCurrent").textContent = c.current;
  }

  function open(key) {
    if (!CASES[key]) return;
    populate(key);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  rows.forEach((row) => {
    row.addEventListener("click", () => open(row.getAttribute("data-project")));
  });

  document.querySelector(".case-overlay").addEventListener("click", () => close());
  document.querySelector(".case-close").addEventListener("click", () => close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });
})();

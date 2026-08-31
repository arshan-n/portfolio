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
  console.log("init", KEYS);
})();

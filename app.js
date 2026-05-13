const LINEAR_ASSIGNMENT_ID = "linear-equations-doral-v1";
const STORAGE_KEY = "freshman-algebra-linear-dashboard-doral-v1";
const ANSWER_TOLERANCE = 0.0001;

const assignments = [
  {
    id: LINEAR_ASSIGNMENT_ID,
    title: "Linear Equations",
    directions: "Solve for x",
    problemCount: 30,
    answerType: "single",
    answerPlaceholder: "x =",
    generator: makeLinearProblem,
  },
  {
    id: "systems-equations-doral-v1",
    title: "Systems of Equations",
    directions: "Solve for x and y",
    problemCount: 15,
    answerType: "ordered-pair",
    answerPlaceholder: "value",
    generator: makeSystemProblem,
  },
];

const roster = [
  { id: "S1001", name: "Amaya Solbes" },
  { id: "S1002", name: "Austin Davis" },
  { id: "S1003", name: "Camila Lopez" },
  { id: "S1004", name: "Tony Mkhitaryan" },
  { id: "S1005", name: "Emme Nguyen" },
  { id: "S1006", name: "Brilynn Moates" },
  { id: "S1007", name: "Elias Terry" },
  { id: "S1008", name: "Raevyn Moore" },
  { id: "S1009", name: "Madison Osborn" },
  { id: "S1010", name: "Antony Stoev" },
  { id: "S1011", name: "Capri Vickers" },
  { id: "S1012", name: "Joshua Hearne" },
  { id: "S1013", name: "Lillian Akers" },
  { id: "S1014", name: "Zoe Tomlinson" },
  { id: "S1015", name: "Zaim Ishola" },
  { id: "S1016", name: "Presley Peterson" },
  { id: "S1017", name: "Evan Hernandez" },
  { id: "S1018", name: "Mason Peraza" },
  { id: "S1019", name: "Melia Mosley" },
  { id: "S1020", name: "Rayden Canda" },
  { id: "S1021", name: "Julian Pitura" },
  { id: "S1022", name: "Elijan Rosas" },
  { id: "S1023", name: "Madyson Jezbera" },
  { id: "S1024", name: "Naol Kassaya" },
  { id: "S1025", name: "Gabriella Novo" },
].sort(compareStudentsByLastName);

const state = {
  selectedAssignment: assignments[0],
  selectedStudent: roster[0],
  problems: [],
  answers: new Map(),
  submissions: loadSubmissions(),
};

const elements = {
  assignmentSelect: document.querySelector("#assignment-select"),
  dashboardAssignmentSelect: document.querySelector("#dashboard-assignment-select"),
  studentSelect: document.querySelector("#student-select"),
  studentId: document.querySelector("#student-id"),
  loadAssignment: document.querySelector("#load-assignment"),
  submitAssignment: document.querySelector("#submit-assignment"),
  problemList: document.querySelector("#problem-list"),
  assignmentDirections: document.querySelector("#assignment-directions"),
  assignmentTitle: document.querySelector("#assignment-title"),
  currentScore: document.querySelector("#current-score"),
  currentPercent: document.querySelector("#current-percent"),
  answeredCount: document.querySelector("#answered-count"),
  correctCount: document.querySelector("#correct-count"),
  submissionNote: document.querySelector("#submission-note"),
  dashboardBody: document.querySelector("#dashboard-body"),
  submittedCount: document.querySelector("#submitted-count"),
  classAverage: document.querySelector("#class-average"),
  highestScore: document.querySelector("#highest-score"),
  refreshDashboard: document.querySelector("#refresh-dashboard"),
  resetDashboard: document.querySelector("#reset-dashboard"),
  headerProblemCount: document.querySelector("#header-problem-count"),
  headerStudentCount: document.querySelector("#header-student-count"),
};

function compareStudentsByLastName(a, b) {
  const aParts = a.name.split(" ");
  const bParts = b.name.split(" ");
  const aLast = aParts[aParts.length - 1];
  const bLast = bParts[bParts.length - 1];
  return aLast.localeCompare(bLast) || a.name.localeCompare(b.name);
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function getSelectedAssignment() {
  return state.selectedAssignment || assignments[0];
}

function getAssignmentById(assignmentId) {
  return assignments.find((assignment) => assignment.id === assignmentId) || assignments[0];
}

function renderHeaderCounts() {
  const assignment = getSelectedAssignment();
  setText(elements.headerProblemCount, assignment.problemCount);
  setText(elements.headerStudentCount, roster.length);
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function integerBetween(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function nonZeroBetween(random, min, max) {
  let value = 0;
  while (value === 0) {
    value = integerBetween(random, min, max);
  }
  return value;
}

function formatTerm(coefficient, variable = "x") {
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `-${variable}`;
  return `${coefficient}${variable}`;
}

function formatLinear(leftCoefficient, constant) {
  const variable = formatTerm(leftCoefficient);
  if (constant === 0) return variable;
  return `${variable} ${constant > 0 ? "+" : "-"} ${Math.abs(constant)}`;
}

function formatVariableTerm(coefficient, variable, isFirstTerm) {
  const absolute = Math.abs(coefficient);
  const term = absolute === 1 ? variable : `${absolute}${variable}`;

  if (isFirstTerm) {
    return coefficient < 0 ? `-${term}` : term;
  }

  return `${coefficient < 0 ? "-" : "+"} ${term}`;
}

function formatSystemEquation(xCoefficient, yCoefficient, right) {
  return `${formatVariableTerm(xCoefficient, "x", true)} ${formatVariableTerm(
    yCoefficient,
    "y",
    false,
  )} = ${right}`;
}

function makeTwoStep(random) {
  const solution = nonZeroBetween(random, -12, 12);
  const coefficient = nonZeroBetween(random, -9, 9);
  const constant = integerBetween(random, -18, 18);
  const right = coefficient * solution + constant;
  return {
    equation: `${formatLinear(coefficient, constant)} = ${right}`,
    answer: solution,
  };
}

function makeVariablesBothSides(random) {
  const solution = nonZeroBetween(random, -10, 10);
  let leftCoefficient = nonZeroBetween(random, -8, 8);
  let rightCoefficient = nonZeroBetween(random, -8, 8);
  while (rightCoefficient === leftCoefficient) {
    rightCoefficient = nonZeroBetween(random, -8, 8);
  }
  const leftConstant = integerBetween(random, -16, 16);
  const rightConstant = (leftCoefficient - rightCoefficient) * solution + leftConstant;
  return {
    equation: `${formatLinear(leftCoefficient, leftConstant)} = ${formatLinear(
      rightCoefficient,
      rightConstant,
    )}`,
    answer: solution,
  };
}

function makeParentheses(random) {
  const solution = integerBetween(random, -12, 12);
  const coefficient = nonZeroBetween(random, -7, 7);
  const inside = integerBetween(random, -9, 9);
  const right = coefficient * (solution + inside);
  return {
    equation: `${coefficient}(${
      inside === 0 ? "x" : `x ${inside > 0 ? "+" : "-"} ${Math.abs(inside)}`
    }) = ${right}`,
    answer: solution,
  };
}

function makeDistributed(random) {
  const solution = nonZeroBetween(random, -9, 9);
  const coefficient = nonZeroBetween(random, -6, 6);
  const inside = integerBetween(random, -8, 8);
  const outside = integerBetween(random, -14, 14);
  const right = coefficient * (solution + inside) + outside;
  return {
    equation: `${coefficient}(${
      inside === 0 ? "x" : `x ${inside > 0 ? "+" : "-"} ${Math.abs(inside)}`
    }) ${outside >= 0 ? "+" : "-"} ${Math.abs(outside)} = ${right}`,
    answer: solution,
  };
}

function makeFraction(random) {
  const divisor = integerBetween(random, 2, 9);
  const quotient = nonZeroBetween(random, -10, 10);
  const solution = divisor * quotient;
  const constant = integerBetween(random, -12, 12);
  const right = quotient + constant;
  return {
    equation: `x / ${divisor} ${constant >= 0 ? "+" : "-"} ${Math.abs(constant)} = ${right}`,
    answer: solution,
  };
}

function makeLinearProblem(random) {
  const problemTypes = [
    makeTwoStep,
    makeVariablesBothSides,
    makeParentheses,
    makeDistributed,
    makeFraction,
  ];
  const typeIndex = integerBetween(random, 0, problemTypes.length - 1);
  return problemTypes[typeIndex](random);
}

function makeSystemProblem(random) {
  const x = integerBetween(random, -8, 8);
  const y = integerBetween(random, -8, 8);
  let xCoefficientA = nonZeroBetween(random, -6, 6);
  let yCoefficientA = nonZeroBetween(random, -6, 6);
  let xCoefficientB = nonZeroBetween(random, -6, 6);
  let yCoefficientB = nonZeroBetween(random, -6, 6);

  while (xCoefficientA * yCoefficientB - xCoefficientB * yCoefficientA === 0) {
    xCoefficientA = nonZeroBetween(random, -6, 6);
    yCoefficientA = nonZeroBetween(random, -6, 6);
    xCoefficientB = nonZeroBetween(random, -6, 6);
    yCoefficientB = nonZeroBetween(random, -6, 6);
  }

  return {
    equations: [
      formatSystemEquation(
        xCoefficientA,
        yCoefficientA,
        xCoefficientA * x + yCoefficientA * y,
      ),
      formatSystemEquation(
        xCoefficientB,
        yCoefficientB,
        xCoefficientB * x + yCoefficientB * y,
      ),
    ],
    answer: { x, y },
  };
}

function makeProblem(assignment, student, problemNumber, attempt = 0) {
  const seedText = `${assignment.id}:${student.id}:${student.name}:${problemNumber}:${attempt}`;
  const random = mulberry32(hashString(seedText));
  const problem = assignment.generator(random);
  return {
    ...problem,
    answerType: assignment.answerType,
    id: `${assignment.id}-${student.id}-${problemNumber}`,
    number: problemNumber,
  };
}

function getProblemSignature(problem) {
  return problem.equations ? problem.equations.join("|") : problem.equation;
}

function generateAssignment(student, assignment) {
  const problems = [];
  const seen = new Set();

  for (let problemNumber = 1; problemNumber <= assignment.problemCount; problemNumber += 1) {
    let attempt = 0;
    let problem = makeProblem(assignment, student, problemNumber, attempt);
    while (seen.has(getProblemSignature(problem)) && attempt < 20) {
      attempt += 1;
      problem = makeProblem(assignment, student, problemNumber, attempt);
    }
    seen.add(getProblemSignature(problem));
    problems.push(problem);
  }

  return problems;
}

function createEmptySubmissionStore() {
  return assignments.reduce((store, assignment) => {
    store[assignment.id] = {};
    return store;
  }, {});
}

function isLegacySubmissionStore(saved) {
  return Object.values(saved).some(
    (value) =>
      value &&
      typeof value === "object" &&
      "studentId" in value &&
      "correct" in value &&
      "submittedAt" in value,
  );
}

function normalizeSubmissions(saved) {
  const normalized = createEmptySubmissionStore();
  if (!saved || typeof saved !== "object") return normalized;

  if (isLegacySubmissionStore(saved)) {
    normalized[LINEAR_ASSIGNMENT_ID] = saved;
    return normalized;
  }

  assignments.forEach((assignment) => {
    if (saved[assignment.id] && typeof saved[assignment.id] === "object") {
      normalized[assignment.id] = saved[assignment.id];
    }
  });

  return normalized;
}

function loadSubmissions() {
  try {
    return normalizeSubmissions(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return createEmptySubmissionStore();
  }
}

function saveSubmissions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.submissions));
}

function renderAssignmentOptions() {
  const options = assignments
    .map(
      (assignment) =>
        `<option value="${assignment.id}">${assignment.title} (${assignment.problemCount})</option>`,
    )
    .join("");

  if (elements.assignmentSelect) {
    elements.assignmentSelect.innerHTML = options;
    elements.assignmentSelect.value = getSelectedAssignment().id;
  }

  if (elements.dashboardAssignmentSelect) {
    elements.dashboardAssignmentSelect.innerHTML = options;
    elements.dashboardAssignmentSelect.value = getSelectedAssignment().id;
  }
}

function renderStudentOptions() {
  if (!elements.studentSelect || !elements.studentId) return;

  elements.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.id}">${student.name}</option>`)
    .join("");
  elements.studentId.value = state.selectedStudent.id;
}

function updateAssignmentDisplay() {
  const assignment = getSelectedAssignment();
  setText(elements.assignmentDirections, assignment.directions);
  renderHeaderCounts();
}

function selectAssignment(assignmentId, options = {}) {
  state.selectedAssignment = getAssignmentById(assignmentId);
  if (elements.assignmentSelect) {
    elements.assignmentSelect.value = state.selectedAssignment.id;
  }
  if (elements.dashboardAssignmentSelect) {
    elements.dashboardAssignmentSelect.value = state.selectedAssignment.id;
  }

  updateAssignmentDisplay();

  if (options.resetStudentWork) {
    state.problems = [];
    state.answers = new Map();
    setText(elements.assignmentTitle, "Choose a student to begin");
    setText(elements.submissionNote, "");
    if (elements.submitAssignment) {
      elements.submitAssignment.disabled = true;
    }
    renderProblems();
    updateStudentScore();
  }

  renderDashboard();
}

function loadSelectedStudent() {
  if (!elements.studentSelect || !elements.studentId) return;

  const assignment = getSelectedAssignment();
  const student = roster.find((item) => item.id === elements.studentSelect.value) || roster[0];
  state.selectedStudent = student;
  elements.studentId.value = student.id;
  state.problems = generateAssignment(student, assignment);
  state.answers = new Map();
  elements.assignmentTitle.textContent = `${student.name}'s ${assignment.problemCount} ${assignment.title.toLowerCase()} problems`;
  elements.submissionNote.textContent = "";
  elements.submitAssignment.disabled = false;
  renderProblems();
  updateStudentScore();
}

function renderEquation(problem) {
  if (problem.equations) {
    return `<div class="system-equations">${problem.equations
      .map((equation) => `<span>${equation}</span>`)
      .join("")}</div>`;
  }

  return problem.equation;
}

function renderAnswerInputs(problem) {
  if (problem.answerType === "ordered-pair") {
    return `
      <label class="answer-field">
        <span>x</span>
        <input
          type="text"
          inputmode="decimal"
          aria-label="x value for problem ${problem.number}"
          data-answer-input="${problem.id}"
          data-answer-key="x"
          placeholder="x"
        />
      </label>
      <label class="answer-field">
        <span>y</span>
        <input
          type="text"
          inputmode="decimal"
          aria-label="y value for problem ${problem.number}"
          data-answer-input="${problem.id}"
          data-answer-key="y"
          placeholder="y"
        />
      </label>
    `;
  }

  return `
    <input
      type="text"
      inputmode="decimal"
      aria-label="Answer for problem ${problem.number}"
      data-answer-input="${problem.id}"
      data-answer-key="x"
      placeholder="${getSelectedAssignment().answerPlaceholder}"
    />
  `;
}

function renderProblems() {
  if (!elements.problemList) return;

  if (!state.problems.length) {
    elements.problemList.innerHTML = `<div class="empty-state">Select a student and load the selected assignment.</div>`;
    return;
  }

  elements.problemList.innerHTML = state.problems
    .map(
      (problem) => `
        <article class="problem-card" data-problem-id="${problem.id}">
          <span class="problem-number">${problem.number}</span>
          <div class="equation">${renderEquation(problem)}</div>
          <div class="answer-row ${problem.answerType === "ordered-pair" ? "is-pair" : ""}">
            ${renderAnswerInputs(problem)}
            <span class="feedback" data-feedback="${problem.id}">Waiting</span>
          </div>
        </article>
      `,
    )
    .join("");

  elements.problemList.querySelectorAll("[data-answer-input]").forEach((input) => {
    input.addEventListener("input", handleAnswerInput);
  });
}

function handleAnswerInput(event) {
  const input = event.currentTarget;
  const problemId = input.dataset.answerInput;
  const answerKey = input.dataset.answerKey || "x";
  const answer = state.answers.get(problemId) || {};
  answer[answerKey] = input.value.trim();
  state.answers.set(problemId, answer);
  updateProblemFeedback(problemId);
  updateStudentScore();
}

function isBlank(value) {
  return value === undefined || value === "";
}

function isCloseEnough(actual, expected) {
  return Math.abs(actual - expected) < ANSWER_TOLERANCE;
}

function getProblemResult(problem) {
  const answer = state.answers.get(problem.id) || {};

  if (problem.answerType === "ordered-pair") {
    if (isBlank(answer.x) && isBlank(answer.y)) {
      return "blank";
    }

    const x = Number(answer.x);
    const y = Number(answer.y);
    if (isBlank(answer.x) || isBlank(answer.y) || !Number.isFinite(x) || !Number.isFinite(y)) {
      return "wrong";
    }

    return isCloseEnough(x, problem.answer.x) && isCloseEnough(y, problem.answer.y)
      ? "correct"
      : "wrong";
  }

  if (isBlank(answer.x)) {
    return "blank";
  }

  const numericAnswer = Number(answer.x);
  if (!Number.isFinite(numericAnswer)) {
    return "wrong";
  }

  return isCloseEnough(numericAnswer, problem.answer) ? "correct" : "wrong";
}

function updateProblemFeedback(problemId) {
  if (!elements.problemList) return;

  const problem = state.problems.find((item) => item.id === problemId);
  const card = elements.problemList.querySelector(`[data-problem-id="${problemId}"]`);
  const feedback = elements.problemList.querySelector(`[data-feedback="${problemId}"]`);
  if (!problem || !card || !feedback) return;

  const result = getProblemResult(problem);
  card.classList.toggle("is-correct", result === "correct");
  card.classList.toggle("is-wrong", result === "wrong");

  if (result === "correct") {
    feedback.textContent = "Correct";
  } else if (result === "wrong") {
    feedback.textContent = "Try again";
  } else {
    feedback.textContent = "Waiting";
  }
}

function calculateScore() {
  const assignment = getSelectedAssignment();
  const answered = state.problems.filter((problem) => getProblemResult(problem) !== "blank").length;
  const correct = state.problems.filter((problem) => getProblemResult(problem) === "correct").length;
  return {
    answered,
    correct,
    percent: Math.round((correct / assignment.problemCount) * 100),
  };
}

function updateStudentScore() {
  if (
    !elements.currentScore ||
    !elements.currentPercent ||
    !elements.answeredCount ||
    !elements.correctCount
  ) {
    return;
  }

  const assignment = getSelectedAssignment();
  const score = calculateScore();
  elements.currentScore.textContent = `${score.correct} / ${assignment.problemCount}`;
  elements.currentPercent.textContent = `${score.percent}%`;
  elements.answeredCount.textContent = `${score.answered} answered`;
  elements.correctCount.textContent = `${score.correct} correct`;
}

function submitAssignment() {
  if (!state.selectedStudent || !state.problems.length) return;

  const assignment = getSelectedAssignment();
  const score = calculateScore();
  if (!state.submissions[assignment.id]) {
    state.submissions[assignment.id] = {};
  }

  state.submissions[assignment.id][state.selectedStudent.id] = {
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    studentId: state.selectedStudent.id,
    name: state.selectedStudent.name,
    correct: score.correct,
    total: assignment.problemCount,
    percent: score.percent,
    answered: score.answered,
    submittedAt: new Date().toISOString(),
  };
  saveSubmissions();
  if (elements.dashboardBody) {
    renderDashboard();
  }
  setText(
    elements.submissionNote,
    `Submitted: ${score.correct} out of ${assignment.problemCount} (${score.percent}%).`,
  );
}

function renderDashboard() {
  if (!elements.dashboardBody) return;

  const assignment = getSelectedAssignment();
  const assignmentSubmissions = state.submissions[assignment.id] || {};
  const rows = roster.map((student) => {
    const submission = assignmentSubmissions[student.id];
    const submittedAt = submission
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(submission.submittedAt))
      : "--";
    return `
      <tr>
        <td>${student.name}</td>
        <td>${student.id}</td>
        <td>
          <span class="status-pill ${submission ? "is-submitted" : ""}">
            ${submission ? "Submitted" : "Waiting"}
          </span>
        </td>
        <td>${submission ? `${submission.correct} / ${submission.total}` : "--"}</td>
        <td>${submission ? `${submission.percent}%` : "--"}</td>
        <td>${submittedAt}</td>
      </tr>
    `;
  });

  elements.dashboardBody.innerHTML = rows.join("");

  const submissions = Object.values(assignmentSubmissions);
  const submittedCount = submissions.length;
  const average = submittedCount
    ? Math.round(submissions.reduce((sum, item) => sum + item.percent, 0) / submittedCount)
    : null;
  const highest = submittedCount
    ? Math.max(...submissions.map((item) => item.percent))
    : null;

  setText(elements.submittedCount, `${submittedCount} / ${roster.length}`);
  setText(elements.classAverage, average === null ? "--" : `${average}%`);
  setText(elements.highestScore, highest === null ? "--" : `${highest}%`);
}

function refreshDashboard() {
  state.submissions = loadSubmissions();
  renderDashboard();
}

function resetDashboard() {
  const assignment = getSelectedAssignment();
  const confirmed = window.confirm(`Clear all submitted grades for ${assignment.title}?`);
  if (!confirmed) return;

  state.submissions[assignment.id] = {};
  saveSubmissions();
  renderDashboard();
}

function bindEvents() {
  if (elements.assignmentSelect) {
    elements.assignmentSelect.addEventListener("change", () => {
      selectAssignment(elements.assignmentSelect.value, { resetStudentWork: true });
    });
  }

  if (elements.dashboardAssignmentSelect) {
    elements.dashboardAssignmentSelect.addEventListener("change", () => {
      selectAssignment(elements.dashboardAssignmentSelect.value);
    });
  }

  if (elements.studentSelect && elements.studentId) {
    elements.studentSelect.addEventListener("change", () => {
      const student = roster.find((item) => item.id === elements.studentSelect.value);
      if (!student) return;
      state.selectedStudent = student;
      elements.studentId.value = student.id;
    });

    elements.studentId.addEventListener("input", () => {
      const matchingStudent = roster.find(
        (student) => student.id.toLowerCase() === elements.studentId.value.trim().toLowerCase(),
      );
      if (!matchingStudent) return;
      state.selectedStudent = matchingStudent;
      elements.studentSelect.value = matchingStudent.id;
    });
  }

  if (elements.loadAssignment) {
    elements.loadAssignment.addEventListener("click", loadSelectedStudent);
  }
  if (elements.submitAssignment) {
    elements.submitAssignment.addEventListener("click", submitAssignment);
  }
  if (elements.refreshDashboard) {
    elements.refreshDashboard.addEventListener("click", refreshDashboard);
  }
  if (elements.resetDashboard) {
    elements.resetDashboard.addEventListener("click", resetDashboard);
  }
}

function init() {
  renderAssignmentOptions();
  updateAssignmentDisplay();
  renderStudentOptions();
  renderProblems();
  updateStudentScore();
  renderDashboard();
  bindEvents();
}

init();

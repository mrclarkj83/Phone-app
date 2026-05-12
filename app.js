const ASSIGNMENT_ID = "linear-equations-doral-v1";
const PROBLEM_COUNT = 30;
const STORAGE_KEY = "freshman-algebra-linear-dashboard-doral-v1";

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
];

const state = {
  selectedStudent: roster[0],
  problems: [],
  answers: new Map(),
  submissions: loadSubmissions(),
};

const elements = {
  studentSelect: document.querySelector("#student-select"),
  studentId: document.querySelector("#student-id"),
  loadAssignment: document.querySelector("#load-assignment"),
  submitAssignment: document.querySelector("#submit-assignment"),
  problemList: document.querySelector("#problem-list"),
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
  resetDashboard: document.querySelector("#reset-dashboard"),
  tabButtons: document.querySelectorAll(".tab-button"),
  views: document.querySelectorAll(".view"),
  headerProblemCount: document.querySelector("#header-problem-count"),
  headerStudentCount: document.querySelector("#header-student-count"),
};

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

function formatNumber(value) {
  return value < 0 ? `(${value})` : `${value}`;
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
    equation: `${coefficient}(${inside === 0 ? "x" : `x ${inside > 0 ? "+" : "-"} ${Math.abs(inside)}`}) = ${right}`,
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
    equation: `${coefficient}(${inside === 0 ? "x" : `x ${inside > 0 ? "+" : "-"} ${Math.abs(inside)}`}) ${
      outside >= 0 ? "+" : "-"
    } ${Math.abs(outside)} = ${right}`,
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

function makeProblem(student, problemNumber, attempt = 0) {
  const seedText = `${ASSIGNMENT_ID}:${student.id}:${student.name}:${problemNumber}:${attempt}`;
  const random = mulberry32(hashString(seedText));
  const problemTypes = [
    makeTwoStep,
    makeVariablesBothSides,
    makeParentheses,
    makeDistributed,
    makeFraction,
  ];
  const typeIndex = integerBetween(random, 0, problemTypes.length - 1);
  const problem = problemTypes[typeIndex](random);
  return {
    ...problem,
    id: `${student.id}-${problemNumber}`,
    number: problemNumber,
  };
}

function generateAssignment(student) {
  const problems = [];
  const seen = new Set();

  for (let problemNumber = 1; problemNumber <= PROBLEM_COUNT; problemNumber += 1) {
    let attempt = 0;
    let problem = makeProblem(student, problemNumber, attempt);
    while (seen.has(problem.equation) && attempt < 20) {
      attempt += 1;
      problem = makeProblem(student, problemNumber, attempt);
    }
    seen.add(problem.equation);
    problems.push(problem);
  }

  return problems;
}

function loadSubmissions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveSubmissions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.submissions));
}

function renderStudentOptions() {
  elements.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.id}">${student.name}</option>`)
    .join("");
  elements.studentId.value = state.selectedStudent.id;
  elements.headerProblemCount.textContent = PROBLEM_COUNT;
  elements.headerStudentCount.textContent = roster.length;
}

function loadSelectedStudent() {
  const student = roster.find((item) => item.id === elements.studentSelect.value) || roster[0];
  state.selectedStudent = student;
  elements.studentId.value = student.id;
  state.problems = generateAssignment(student);
  state.answers = new Map();
  elements.assignmentTitle.textContent = `${student.name}'s 30 problems`;
  elements.submissionNote.textContent = "";
  elements.submitAssignment.disabled = false;
  renderProblems();
  updateStudentScore();
}

function renderProblems() {
  if (!state.problems.length) {
    elements.problemList.innerHTML = `<div class="empty-state">Select a student and load the assignment.</div>`;
    return;
  }

  elements.problemList.innerHTML = state.problems
    .map(
      (problem) => `
        <article class="problem-card" data-problem-id="${problem.id}">
          <span class="problem-number">${problem.number}</span>
          <div class="equation">${problem.equation}</div>
          <div class="answer-row">
            <input
              type="text"
              inputmode="decimal"
              aria-label="Answer for problem ${problem.number}"
              data-answer-input="${problem.id}"
              placeholder="x ="
            />
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
  state.answers.set(input.dataset.answerInput, input.value.trim());
  updateProblemFeedback(input.dataset.answerInput);
  updateStudentScore();
}

function getProblemResult(problem) {
  const answer = state.answers.get(problem.id);
  if (answer === undefined || answer === "") {
    return "blank";
  }

  const numericAnswer = Number(answer);
  if (!Number.isFinite(numericAnswer)) {
    return "wrong";
  }

  return Math.abs(numericAnswer - problem.answer) < 0.0001 ? "correct" : "wrong";
}

function updateProblemFeedback(problemId) {
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
  const answered = state.problems.filter((problem) => getProblemResult(problem) !== "blank").length;
  const correct = state.problems.filter((problem) => getProblemResult(problem) === "correct").length;
  return {
    answered,
    correct,
    percent: Math.round((correct / PROBLEM_COUNT) * 100),
  };
}

function updateStudentScore() {
  const score = calculateScore();
  elements.currentScore.textContent = `${score.correct} / ${PROBLEM_COUNT}`;
  elements.currentPercent.textContent = `${score.percent}%`;
  elements.answeredCount.textContent = `${score.answered} answered`;
  elements.correctCount.textContent = `${score.correct} correct`;
}

function submitAssignment() {
  if (!state.selectedStudent || !state.problems.length) return;

  const score = calculateScore();
  state.submissions[state.selectedStudent.id] = {
    studentId: state.selectedStudent.id,
    name: state.selectedStudent.name,
    correct: score.correct,
    total: PROBLEM_COUNT,
    percent: score.percent,
    answered: score.answered,
    submittedAt: new Date().toISOString(),
  };
  saveSubmissions();
  renderDashboard();
  elements.submissionNote.textContent = `Submitted: ${score.correct} out of ${PROBLEM_COUNT} (${score.percent}%).`;
}

function renderDashboard() {
  const rows = roster.map((student) => {
    const submission = state.submissions[student.id];
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

  const submissions = Object.values(state.submissions);
  const submittedCount = submissions.length;
  const average = submittedCount
    ? Math.round(submissions.reduce((sum, item) => sum + item.percent, 0) / submittedCount)
    : null;
  const highest = submittedCount
    ? Math.max(...submissions.map((item) => item.percent))
    : null;

  elements.submittedCount.textContent = `${submittedCount} / ${roster.length}`;
  elements.classAverage.textContent = average === null ? "--" : `${average}%`;
  elements.highestScore.textContent = highest === null ? "--" : `${highest}%`;
}

function resetDashboard() {
  const confirmed = window.confirm("Clear all submitted grades for this assignment?");
  if (!confirmed) return;

  state.submissions = {};
  saveSubmissions();
  renderDashboard();
}

function switchView(viewId) {
  elements.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewId);
  });
  elements.views.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
}

function bindEvents() {
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

  elements.loadAssignment.addEventListener("click", loadSelectedStudent);
  elements.submitAssignment.addEventListener("click", submitAssignment);
  elements.resetDashboard.addEventListener("click", resetDashboard);

  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
}

function init() {
  renderStudentOptions();
  renderProblems();
  renderDashboard();
  bindEvents();
}

init();

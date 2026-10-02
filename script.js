const $ = (selector) => document.querySelector(selector);
const initialTasks = [
  { id: 1, title: "Revise vectors and calculus", subject: "Mathematics", priority: "high", done: false },
  { id: 2, title: "Complete C programming exercises", subject: "Programming in C", priority: "normal", done: false },
  { id: 3, title: "Review mechanics lecture notes", subject: "Physics", priority: "normal", done: true },
  { id: 4, title: "Prepare for weekly quiz", subject: "Mathematics", priority: "low", done: false }
];
let tasks = load("studyspace-tasks", initialTasks);
let completedTotal = Number(load("studyspace-completed", 8));
let showAll = false;
let toastTimer;

function load(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function persist() {
  localStorage.setItem("studyspace-tasks", JSON.stringify(tasks));
  localStorage.setItem("studyspace-completed", JSON.stringify(completedTotal));
}
function dateText() {
  const now = new Date();
  $("#todayLabel").textContent = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  $("#greeting").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  $("#dateDay").textContent = String(now.getDate()).padStart(2, "0");
  $("#dateMonth").textContent = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
function renderTasks() {
  const list = $("#taskList");
  const visible = showAll ? tasks : tasks.slice(0, 4);
  list.innerHTML = "";
  if (!visible.length) {
    list.innerHTML = '<div class="empty-tasks">No tasks yet. Add one to get started!</div>';
  }
  visible.forEach(task => {
    const item = document.createElement("div");
    item.className = `task-item${task.done ? " done" : ""}`;
    const check = document.createElement("button");
    check.className = "task-check";
    check.type = "button";
    check.setAttribute("aria-label", task.done ? "Mark task incomplete" : "Mark task complete");
    check.textContent = task.done ? "✓" : "";
    check.addEventListener("click", () => {
      task.done = !task.done;
      if (task.done) completedTotal++;
      else completedTotal = Math.max(0, completedTotal - 1);
      persist(); renderTasks();
    });
    const copy = document.createElement("div");
    copy.className = "task-copy";
    const title = document.createElement("strong");
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    const subject = document.createElement("span");
    subject.className = "subject-tag";
    subject.textContent = task.subject;
    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority[0].toUpperCase() + task.priority.slice(1);
    meta.append(subject, priority); copy.append(title, meta);
    const remove = document.createElement("button");
    remove.className = "delete-task"; remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${task.title}`); remove.textContent = "×";
    remove.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id); persist(); renderTasks(); showToast("Task removed");
    });
    item.append(check, copy, remove); list.append(item);
  });
  const done = tasks.filter(t => t.done).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  $("#pendingStat").textContent = tasks.filter(t => !t.done).length;
  $("#completedStat").textContent = completedTotal;
  $("#navTaskCount").textContent = tasks.filter(t => !t.done).length;
  $("#taskProgressBar").style.width = `${percent}%`;
  $("#taskProgressText").textContent = `${done} of ${tasks.length} completed`;
  $("#taskProgressPercent").textContent = `${percent}%`;
  $("#viewAllTasks").innerHTML = showAll ? 'Show less <span>↗</span>' : 'View all <span>↗</span>';
}
function openModal() {
  $("#taskModal").classList.add("open");
  $("#taskModal").setAttribute("aria-hidden", "false");
  $("#taskTitle").focus();
}
function closeModal() {
  $("#taskModal").classList.remove("open");
  $("#taskModal").setAttribute("aria-hidden", "true");
  $("#taskForm").reset();
}
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
$("#addTaskTop").addEventListener("click", openModal);
$("#addTaskBottom").addEventListener("click", openModal);
$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
$("#taskModal").addEventListener("click", e => { if (e.target === $("#taskModal")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
$("#taskForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("#taskTitle").value.trim();
  if (!title) return;
  tasks.unshift({ id: Date.now(), title, subject: $("#taskSubject").value, priority: $("#taskPriority").value, done: false });
  persist(); renderTasks(); closeModal(); showToast("Your task was added");
});
$("#viewAllTasks").addEventListener("click", () => { showAll = !showAll; renderTasks(); });
$("#saveNote").addEventListener("click", () => {
  localStorage.setItem("studyspace-note", $("#quickNote").value);
  $("#noteStatus").textContent = "Saved just now"; showToast("Note saved on this device");
});
$("#quickNote").value = localStorage.getItem("studyspace-note") || "";
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("studyspace-dark", document.body.classList.contains("dark") ? "yes" : "no");
});
if (localStorage.getItem("studyspace-dark") === "yes") document.body.classList.add("dark");
$("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
  link.classList.add("active"); $("#sidebar").classList.remove("open");
}));
$("#manageSubjects").addEventListener("click", () => showToast("You can customize subjects in the HTML file."));
dateText(); renderTasks();
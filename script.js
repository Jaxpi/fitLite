function getHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function saveHistory(history) {
  localStorage.setItem("history", JSON.stringify(history));
}

function addEntry(muscle) {
  const history = getHistory();
  history.push({
    id: Date.now(),
    muscle,
    date: new Date().toISOString(),
    status: "none"
  });
  saveHistory(history);
}

// Flash animation when logged
function logWithFlash(tile, muscle) {
  addEntry(muscle);

  tile.classList.add("flash");
  setTimeout(() => tile.classList.remove("flash"), 250);
}

function cycleStatus(entry) {
  const order = ["none", "green", "amber", "red"];
  entry.status = order[(order.indexOf(entry.status) + 1) % order.length];
}

function deleteEntry(id) {
  const history = getHistory().filter(e => e.id !== id);
  saveHistory(history);
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("history-list");
  const history = getHistory().sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = "";

  let lastDate = null;

  history.forEach(entry => {
    const entryDate = new Date(entry.date).toLocaleDateString();

    // Insert date separator if needed
    if (entryDate !== lastDate) {
      const sep = document.createElement("div");
      sep.className = "date-separator";
      sep.textContent = entryDate;
      container.appendChild(sep);
      lastDate = entryDate;
    }

    const item = document.createElement("div");
    item.className = "history-item";

    const colorClass = entry.status !== "none" ? entry.status : "";

    item.innerHTML = `
      <div class="history-info ${colorClass}">
        <strong>${entry.muscle}</strong>
        <span>${new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <button class="delete-btn">Delete</button>
    `;

    // Tap to cycle color
    item.querySelector(".history-info").onclick = () => {
      cycleStatus(entry);
      saveHistory(history);
      renderHistory();
    };

    // Long press to edit date
    let pressTimer;
    item.querySelector(".history-info").addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => editDate(entry, history), 600);
    });
    item.querySelector(".history-info").addEventListener("mouseup", () => clearTimeout(pressTimer));
    item.querySelector(".history-info").addEventListener("mouseleave", () => clearTimeout(pressTimer));

    // Delete button
    item.querySelector(".delete-btn").onclick = () => deleteEntry(entry.id);

    container.appendChild(item);
  });
}

// Date editing function
function editDate(entry, history) {
  const newDate = prompt("Enter new date (YYYY-MM-DD):", entry.date.split("T")[0]);
  if (!newDate) return;

  // Keep original time, only change date
  const old = new Date(entry.date);
  const [year, month, day] = newDate.split("-");
  old.setFullYear(year);
  old.setMonth(month - 1);
  old.setDate(day);

  entry.date = old.toISOString();
  saveHistory(history);
  renderHistory();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

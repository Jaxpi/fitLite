// ---------------------------
// HISTORY STORAGE
// ---------------------------
function getHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function saveHistory(history) {
  localStorage.setItem("history", JSON.stringify(history));
}

// ---------------------------
// ADD ENTRY
// ---------------------------
function addEntry(muscle) {
  const history = getHistory();
  history.push({
    id: Date.now(),
    muscle,
    date: new Date().toISOString(),
    status: "none",
  });
  saveHistory(history);
}

// Flash animation when logged
function logWithFlash(tile, muscle) {
  addEntry(muscle);

  tile.classList.add("flash");
  setTimeout(() => tile.classList.remove("flash"), 250);
}

// ---------------------------
// STATUS CYCLING
// ---------------------------
function cycleStatus(entry) {
  const order = ["none", "green", "amber", "red"];
  entry.status = order[(order.indexOf(entry.status) + 1) % order.length];
}

// ---------------------------
// DELETE ENTRY
// ---------------------------
function deleteEntry(id) {
  const history = getHistory().filter((e) => e.id !== id);
  saveHistory(history);
  renderHistory();
}

// ---------------------------
// EDIT DATE (LONG PRESS)
// ---------------------------
function openDatePopup(entry, history) {
  const popup = document.getElementById("date-popup");
  const input = document.getElementById("date-input");
  const saveBtn = document.getElementById("date-save");
  const cancelBtn = document.getElementById("date-cancel");

  // Set initial date
  input.value = entry.date.split("T")[0];

  popup.classList.remove("hidden");

  cancelBtn.onclick = () => {
    popup.classList.add("hidden");
  };

  saveBtn.onclick = () => {
    const newDate = input.value;
    if (!newDate) return;

    const old = new Date(entry.date);
    const [year, month, day] = newDate.split("-");
    old.setFullYear(year);
    old.setMonth(month - 1);
    old.setDate(day);

    entry.date = old.toISOString();
    saveHistory(history);
    popup.classList.add("hidden");
    renderHistory();
  };
}

// ---------------------------
// RENDER HISTORY
// ---------------------------
function renderHistory() {
  const container = document.getElementById("history-list");
  const history = getHistory().sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  container.innerHTML = "";

  let lastDate = null;

  history.forEach((entry) => {
    const entryDate = new Date(entry.date).toLocaleDateString();

    // Insert date separator
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
        <span>${new Date(entry.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</span>
      </div>
      <button class="delete-btn">Delete</button>
    `;

    const info = item.querySelector(".history-info");

    // ---------------------------
    // TAP → cycle color
    // ---------------------------
    info.onclick = () => {
      if (longPressActive) return; // prevent conflict
      cycleStatus(entry);
      saveHistory(history);
      renderHistory();
    };

// ---------------------------
// LONG PRESS (mobile + desktop)
// ---------------------------
let pressTimer;
let startX, startY;

info.addEventListener("pointerdown", (e) => {
  startX = e.clientX;
  startY = e.clientY;

  pressTimer = setTimeout(() => {
    openDatePopup(entry, history);
  }, 600);
});

info.addEventListener("pointermove", (e) => {
  const dx = Math.abs(e.clientX - startX);
  const dy = Math.abs(e.clientY - startY);

  // Cancel long press if finger moves too much
  if (dx > 10 || dy > 10) {
    clearTimeout(pressTimer);
  }
});

info.addEventListener("pointerup", () => clearTimeout(pressTimer));
info.addEventListener("pointercancel", () => clearTimeout(pressTimer));


    // Delete button
    item.querySelector(".delete-btn").onclick = () => deleteEntry(entry.id);

    container.appendChild(item);
  });
}

// ---------------------------
// SERVICE WORKER
// ---------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

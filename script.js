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
  const history = getHistory();

  container.innerHTML = "";

  history
    .sort((a, b) => b.id - a.id)
    .forEach(entry => {
      const item = document.createElement("div");
      item.className = "history-item";

      const colorClass = entry.status !== "none" ? entry.status : "";

      item.innerHTML = `
        <div class="history-info ${colorClass}">
          <strong>${entry.muscle}</strong>
          <span>${new Date(entry.date).toLocaleString()}</span>
        </div>
        <button class="delete-btn">Delete</button>
      `;

      item.querySelector(".history-info").onclick = () => {
        cycleStatus(entry);
        saveHistory(history);
        renderHistory();
      };

      item.querySelector(".delete-btn").onclick = () => deleteEntry(entry.id);

      container.appendChild(item);
    });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

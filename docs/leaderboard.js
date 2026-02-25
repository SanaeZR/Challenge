const CSV_URL =
  "https://raw.githubusercontent.com/NoorMajdoub/Challenge/main/leaderboard/leaderboard.csv";

let currentData = [];
let sortAsc = true;

// Load leaderboard
async function loadLeaderboard() {
    const response = await fetch(CSV_URL + "?ts=" + Date.now());
    const text = await response.text();

    const rows = text.trim().split("\n");
    currentData = rows
    .map(r => {
        const [team, score] = r.split(/[,|\t]/);
        const parsedScore = parseFloat(score);

        return {
            team: team?.trim(),
            score: parsedScore
        };
    })
    .filter(entry =>
        entry.team &&
        Number.isFinite(entry.score)
    );

    currentData.sort((a, b) => b.score - a.score);

    updateStats();
    updatePodium();
    renderTable(currentData);
}

// Stats
function updateStats() {
    document.getElementById("teamCount").textContent =
        `${currentData.length} teams`;

    document.getElementById("bestScore").textContent =
        `Best score: ${currentData[0].score.toFixed(4)}`;

    document.getElementById("lastUpdated").textContent =
        `Last updated: ${new Date().toLocaleString()}`;
}

// Podium
function updatePodium() {
    const podium = currentData.slice(0, 3);

    const map = ["first", "second", "third"];
    podium.forEach((entry, i) => {
        document.getElementById(`${map[i]}Team`).textContent = entry.team;
        document.getElementById(`${map[i]}Score`).textContent =
            entry.score.toFixed(4);
    });
}

// Table
function renderTable(data) {
    const tbody = document.querySelector("#leaderboard tbody");
    tbody.innerHTML = "";

    data.forEach((entry, index) => {
        const tr = document.createElement("tr");

        // Rank display (medals for top 3)
        const rankDisplay =
            index === 0 ? "1 🥇" :
            index === 1 ? "2 🥈" :
            index === 2 ? "2 🥉" :
            index + 1;

        tr.innerHTML = `
            <td class="rank-cell">${rankDisplay}</td>
            <td>${entry.team}</td>
            <td>${entry.score.toFixed(4)}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Search
document.getElementById("searchBox").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const filtered = currentData.filter(e =>
        e.team.toLowerCase().includes(filter)
    );
    renderTable(filtered);
});

// Sort
function sortTable(col) {
    if (col === 2) {
        currentData.sort((a, b) =>
            sortAsc ? a.score - b.score : b.score - a.score
        );
    } else if (col === 1) {
        currentData.sort((a, b) =>
            sortAsc
                ? a.team.localeCompare(b.team)
                : b.team.localeCompare(a.team)
        );
    }
    sortAsc = !sortAsc;
    renderTable(currentData);
}

// Init
loadLeaderboard();
setInterval(loadLeaderboard, 30000);
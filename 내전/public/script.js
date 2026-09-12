const STORAGE_KEY = "naejun-players-v1";
const MAX_PLAYERS = 10;
const TIER_NAMES = {
    IRON: "아이언",
    BRONZE: "브론즈",
    SILVER: "실버",
    GOLD: "골드",
    PLATINUM: "플래티넘",
    EMERALD: "에메랄드",
    DIAMOND: "다이아몬드",
    MASTER: "마스터",
    GRANDMASTER: "그랜드마스터",
    CHALLENGER: "챌린저"
};

const playerForm = document.getElementById("playerForm");
const gameNameInput = document.getElementById("gameName");
const tagLineInput = document.getElementById("tagLine");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const clearPlayersBtn = document.getElementById("clearPlayersBtn");
const createTeamBtn = document.getElementById("createTeamBtn");
const playerList = document.getElementById("playerList");
const playerCount = document.getElementById("playerCount");
const emptyPlayers = document.getElementById("emptyPlayers");
const formMessage = document.getElementById("formMessage");
const teamResults = document.getElementById("teamResults");
const blueTeam = document.getElementById("blueTeam");
const redTeam = document.getElementById("redTeam");
const blueScore = document.getElementById("blueScore");
const redScore = document.getElementById("redScore");
const balanceSummary = document.getElementById("balanceSummary");

let players = loadPlayers();

function loadPlayers() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function savePlayers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

function normalizedRiotId(gameName, tagLine) {
    return `${gameName}#${tagLine}`.normalize("NFKC").toLocaleLowerCase("ko-KR");
}

function rankLabel(player) {
    if (!player.rank) {
        return "언랭크";
    }

    return `${TIER_NAMES[player.rank.tier] || player.rank.tier} ${player.rank.division} · ${player.rank.leaguePoints} LP`;
}

function clearTeams() {
    teamResults.hidden = true;
    blueTeam.replaceChildren();
    redTeam.replaceChildren();
}

function renderPlayers() {
    playerList.replaceChildren();

    players.forEach((player) => {
        const item = document.createElement("li");
        const details = document.createElement("div");
        const riotId = document.createElement("strong");
        const rank = document.createElement("span");
        const score = document.createElement("span");
        const deleteButton = document.createElement("button");

        details.className = "player-details";
        riotId.textContent = player.riotId;
        rank.textContent = rankLabel(player);
        rank.className = `rank tier-${player.rank ? player.rank.tier.toLowerCase() : "unranked"}`;
        score.textContent = `${player.score.toLocaleString()}점`;
        score.className = "score";
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.setAttribute("aria-label", `${player.riotId} 삭제`);
        deleteButton.title = "플레이어 삭제";
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => {
            players = players.filter((candidate) => candidate.puuid !== player.puuid);
            savePlayers();
            clearTeams();
            renderPlayers();
        });

        details.append(riotId, rank);
        item.append(details, score, deleteButton);
        playerList.appendChild(item);
    });

    playerCount.textContent = `${players.length} / ${MAX_PLAYERS}`;
    emptyPlayers.hidden = players.length > 0;
    clearPlayersBtn.disabled = players.length === 0;
    createTeamBtn.disabled = players.length < 2 || players.length % 2 !== 0;
}

function setLoading(isLoading) {
    addPlayerBtn.disabled = isLoading;
    addPlayerBtn.classList.toggle("loading", isLoading);
    gameNameInput.disabled = isLoading;
    tagLineInput.disabled = isLoading;
}

playerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const gameName = gameNameInput.value.trim();
    const tagLine = tagLineInput.value.trim();
    const requestedId = normalizedRiotId(gameName, tagLine);

    formMessage.textContent = "";
    formMessage.className = "message";

    if (players.length >= MAX_PLAYERS) {
        formMessage.textContent = "내전 정원은 최대 10명입니다.";
        formMessage.classList.add("error");
        return;
    }

    if (players.some((player) => normalizedRiotId(player.gameName, player.tagLine) === requestedId)) {
        formMessage.textContent = "이미 등록된 플레이어입니다.";
        formMessage.classList.add("error");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameName, tagLine })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "플레이어를 불러오지 못했습니다.");
        }

        if (players.some((player) => player.puuid === data.puuid)) {
            throw new Error("이미 등록된 플레이어입니다.");
        }

        players.push(data);
        savePlayers();
        clearTeams();
        renderPlayers();
        playerForm.reset();
        gameNameInput.focus();
        formMessage.textContent = `${data.riotId} 님을 추가했습니다.`;
        formMessage.classList.add("success");
    } catch (error) {
        formMessage.textContent = error.message;
        formMessage.classList.add("error");
    } finally {
        setLoading(false);
    }
});

clearPlayersBtn.addEventListener("click", () => {
    players = [];
    savePlayers();
    clearTeams();
    renderPlayers();
});

function renderTeam(list, members) {
    list.replaceChildren();

    members.forEach((player) => {
        const item = document.createElement("li");
        const riotId = document.createElement("strong");
        const rank = document.createElement("span");

        riotId.textContent = player.riotId;
        rank.textContent = rankLabel(player);
        item.append(riotId, rank);
        list.appendChild(item);
    });
}

createTeamBtn.addEventListener("click", () => {
    const result = TeamBalancer.createBalancedTeams(players);

    renderTeam(blueTeam, result.blue);
    renderTeam(redTeam, result.red);
    blueScore.textContent = `${result.blueScore.toLocaleString()}점`;
    redScore.textContent = `${result.redScore.toLocaleString()}점`;
    balanceSummary.textContent = `점수 차 ${result.difference.toLocaleString()}`;
    teamResults.hidden = false;
    teamResults.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderPlayers();

const STORAGE_KEY = "naejun-players-v1";
const MATCH_STORAGE_KEY = "naejun-matches-v1";
const STAKE_STORAGE_KEY = "naejun-stake-v1";
const MAX_PLAYERS = 10;
const DEFAULT_STAKE = 1000;
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
const stakeInput = document.getElementById("stakeInput");
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
const blueWinBtn = document.getElementById("blueWinBtn");
const redWinBtn = document.getElementById("redWinBtn");
const matchMessage = document.getElementById("matchMessage");
const moneyEmpty = document.getElementById("moneyEmpty");
const moneyDashboard = document.getElementById("moneyDashboard");
const ledgerList = document.getElementById("ledgerList");
const settlementList = document.getElementById("settlementList");
const matchCount = document.getElementById("matchCount");
const totalPot = document.getElementById("totalPot");
const historyBlock = document.getElementById("historyBlock");
const matchHistory = document.getElementById("matchHistory");
const undoMatchBtn = document.getElementById("undoMatchBtn");
const clearMatchesBtn = document.getElementById("clearMatchesBtn");

let players = loadPlayers();
let matches = loadMatches();
let currentTeams = null;

function loadPlayers() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function loadMatches() {
    try {
        const saved = JSON.parse(localStorage.getItem(MATCH_STORAGE_KEY));
        return Array.isArray(saved) ? saved.filter(isValidMatch) : [];
    } catch {
        return [];
    }
}

function isValidMatch(match) {
    return match
        && Number.isSafeInteger(match.stake)
        && match.stake > 0
        && ["blue", "red"].includes(match.winner)
        && Array.isArray(match.blue)
        && Array.isArray(match.red);
}

function loadStake() {
    const saved = Number(localStorage.getItem(STAKE_STORAGE_KEY));
    return Number.isSafeInteger(saved) && saved > 0 ? saved : DEFAULT_STAKE;
}

function savePlayers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

function saveMatches() {
    localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
}

function readStake() {
    const stake = Number(stakeInput.value);
    return Number.isSafeInteger(stake) && stake >= 100 ? stake : null;
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

function formatWon(amount) {
    return `${amount.toLocaleString("ko-KR")}원`;
}

function formatBalance(amount) {
    return amount > 0 ? `+${formatWon(amount)}` : formatWon(amount);
}

function setWinnerButtons(isReady) {
    blueWinBtn.disabled = !isReady;
    redWinBtn.disabled = !isReady;
}

function clearTeams() {
    currentTeams = null;
    teamResults.hidden = true;
    blueTeam.replaceChildren();
    redTeam.replaceChildren();
    setWinnerButtons(false);
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

stakeInput.addEventListener("change", () => {
    const stake = readStake();

    if (stake === null) {
        stakeInput.value = String(loadStake());
        return;
    }

    localStorage.setItem(STAKE_STORAGE_KEY, String(stake));
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
    const stake = readStake();

    currentTeams = result;
    renderTeam(blueTeam, result.blue);
    renderTeam(redTeam, result.red);
    blueScore.textContent = `${result.blueScore.toLocaleString()}점`;
    redScore.textContent = `${result.redScore.toLocaleString()}점`;
    balanceSummary.textContent = `점수 차 ${result.difference.toLocaleString()}`;
    matchMessage.className = "message";
    matchMessage.textContent = stake === null
        ? "판돈을 100원 이상 정수로 입력한 뒤 승리 팀을 선택하세요."
        : `승리 팀을 선택하면 1인당 ${formatWon(stake)}으로 기록됩니다.`;
    setWinnerButtons(true);
    teamResults.hidden = false;
    teamResults.scrollIntoView({ behavior: "smooth", block: "start" });
});

function matchId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function snapshotTeam(team) {
    return team.map(({ puuid, riotId }) => ({ puuid, riotId }));
}

function recordMatch(winner) {
    const stake = readStake();

    matchMessage.className = "message";

    if (!currentTeams) {
        matchMessage.textContent = "먼저 새 팀을 만들어 주세요.";
        matchMessage.classList.add("error");
        return;
    }

    if (stake === null) {
        matchMessage.textContent = "판돈은 100원 이상의 정수로 입력해 주세요.";
        matchMessage.classList.add("error");
        stakeInput.focus();
        return;
    }

    matches.push({
        id: matchId(),
        createdAt: new Date().toISOString(),
        stake,
        winner,
        blue: snapshotTeam(currentTeams.blue),
        red: snapshotTeam(currentTeams.red)
    });
    localStorage.setItem(STAKE_STORAGE_KEY, String(stake));
    saveMatches();
    currentTeams = null;
    setWinnerButtons(false);
    matchMessage.textContent = `${winner === "blue" ? "Blue" : "Red"} 승리를 기록했습니다.`;
    matchMessage.classList.add("success");
    renderMoney();
}

blueWinBtn.addEventListener("click", () => recordMatch("blue"));
redWinBtn.addEventListener("click", () => recordMatch("red"));

function renderLedger(ledger) {
    ledgerList.replaceChildren();

    ledger.forEach((entry) => {
        const item = document.createElement("li");
        const details = document.createElement("div");
        const riotId = document.createElement("strong");
        const record = document.createElement("span");
        const balance = document.createElement("strong");

        details.className = "ledger-details";
        riotId.textContent = entry.riotId;
        record.textContent = `${entry.wins}승 ${entry.losses}패 · 딴 돈 ${formatWon(entry.won)} · 잃은 돈 ${formatWon(entry.lost)}`;
        balance.textContent = formatBalance(entry.balance);
        balance.className = `net-amount ${entry.balance > 0 ? "profit" : entry.balance < 0 ? "loss" : "even"}`;

        details.append(riotId, record);
        item.append(details, balance);
        ledgerList.appendChild(item);
    });
}

function renderSettlements(settlements) {
    settlementList.replaceChildren();

    if (settlements.length === 0) {
        const settled = document.createElement("li");
        settled.className = "settled-message";
        settled.textContent = "현재 주고받을 돈이 없습니다.";
        settlementList.appendChild(settled);
        return;
    }

    settlements.forEach((settlement) => {
        const item = document.createElement("li");
        const route = document.createElement("div");
        const from = document.createElement("strong");
        const arrow = document.createElement("span");
        const to = document.createElement("strong");
        const amount = document.createElement("strong");

        route.className = "settlement-route";
        from.textContent = settlement.from.riotId;
        arrow.textContent = "→";
        arrow.setAttribute("aria-hidden", "true");
        to.textContent = settlement.to.riotId;
        amount.className = "settlement-amount";
        amount.textContent = formatWon(settlement.amount);
        item.setAttribute("aria-label", `${settlement.from.riotId} 님이 ${settlement.to.riotId} 님에게 ${formatWon(settlement.amount)} 송금`);

        route.append(from, arrow, to);
        item.append(route, amount);
        settlementList.appendChild(item);
    });
}

function renderHistory() {
    matchHistory.replaceChildren();

    [...matches].reverse().forEach((match, index) => {
        const item = document.createElement("li");
        const summary = document.createElement("div");
        const result = document.createElement("strong");
        const stake = document.createElement("span");
        const teams = document.createElement("p");
        const round = matches.length - index;

        summary.className = "history-summary";
        result.className = match.winner === "blue" ? "blue-result" : "red-result";
        result.textContent = `#${round} ${match.winner === "blue" ? "Blue" : "Red"} 승리`;
        stake.textContent = `1인당 ${formatWon(match.stake)}`;
        teams.className = "history-teams";
        teams.textContent = `Blue ${match.blue.map((player) => player.riotId).join(", ")} / Red ${match.red.map((player) => player.riotId).join(", ")}`;

        summary.append(result, stake);
        item.append(summary, teams);
        matchHistory.appendChild(item);
    });
}

function renderMoney() {
    const hasMatches = matches.length > 0;
    const ledger = MatchMoney.calculateLedger(matches);
    const settlements = MatchMoney.calculateSettlements(ledger);
    const movedAmount = matches.reduce((sum, match) => {
        const losingTeamSize = match.winner === "blue" ? match.red.length : match.blue.length;
        return sum + match.stake * losingTeamSize;
    }, 0);

    matchCount.textContent = `${matches.length}경기`;
    undoMatchBtn.disabled = !hasMatches;
    clearMatchesBtn.disabled = !hasMatches;
    moneyEmpty.hidden = hasMatches;
    moneyDashboard.hidden = !hasMatches;
    historyBlock.hidden = !hasMatches;

    if (!hasMatches) {
        ledgerList.replaceChildren();
        settlementList.replaceChildren();
        matchHistory.replaceChildren();
        return;
    }

    totalPot.textContent = `총 이동 금액 ${formatWon(movedAmount)}`;
    renderLedger(ledger);
    renderSettlements(settlements);
    renderHistory();
}

undoMatchBtn.addEventListener("click", () => {
    matches.pop();
    saveMatches();
    renderMoney();
});

clearMatchesBtn.addEventListener("click", () => {
    if (!window.confirm("모든 경기와 정산 기록을 삭제할까요?")) {
        return;
    }

    matches = [];
    saveMatches();
    renderMoney();
});

stakeInput.value = String(loadStake());
setWinnerButtons(false);
renderPlayers();
renderMoney();

const STORAGE_KEY = "naejun-players-v1";
const MATCH_STORAGE_KEY = "naejun-matches-v1";
const STAKE_STORAGE_KEY = "naejun-stake-v1";
const SOLO_STORAGE_KEY = "naejun-solo-records-v1";
const ACTIVE_ROOM_STORAGE_KEY = "naejun-active-room-v1";
const ROOM_HOST_TOKENS_STORAGE_KEY = "naejun-room-host-tokens-v1";
const MAX_PLAYERS = 10;
const DEFAULT_STAKE = 1000;
const ROOM_POLL_INTERVAL = 3000;
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
const autoModeBtn = document.getElementById("autoModeBtn");
const manualModeBtn = document.getElementById("manualModeBtn");
const manualTeamBuilder = document.getElementById("manualTeamBuilder");
const blueManualSlots = document.getElementById("blueManualSlots");
const redManualSlots = document.getElementById("redManualSlots");
const blueManualCount = document.getElementById("blueManualCount");
const redManualCount = document.getElementById("redManualCount");
const confirmManualTeamBtn = document.getElementById("confirmManualTeamBtn");
const manualTeamMessage = document.getElementById("manualTeamMessage");
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
const soloEmpty = document.getElementById("soloEmpty");
const soloList = document.getElementById("soloList");
const clearSoloBtn = document.getElementById("clearSoloBtn");
const roomDisconnected = document.getElementById("roomDisconnected");
const roomConnected = document.getElementById("roomConnected");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomForm = document.getElementById("joinRoomForm");
const roomCodeInput = document.getElementById("roomCodeInput");
const activeRoomCode = document.getElementById("activeRoomCode");
const roomRole = document.getElementById("roomRole");
const roomSyncStatus = document.getElementById("roomSyncStatus");
const copyRoomLinkBtn = document.getElementById("copyRoomLinkBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const roomMessage = document.getElementById("roomMessage");

let players = loadPlayers();
let matches = loadMatches();
let soloRecords = loadSoloRecords();
let currentTeams = null;
let teamMode = "auto";
let manualSelections = { blue: [], red: [] };
let activeRoom = null;
let applyingRoomState = false;
let roomPollTimer = null;
let roomSaveTimer = null;
let roomSaveInFlight = false;
let roomSaveQueued = false;

function canEditState() {
    return !activeRoom || Boolean(activeRoom.hostToken);
}

function loadPlayers() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved)
            ? saved.map((player) => ({ ...player, score: RankScore.rankedScore(player.rank) }))
            : [];
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

function loadSoloRecords() {
    try {
        const saved = JSON.parse(localStorage.getItem(SOLO_STORAGE_KEY));
        return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch {
        return {};
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
    if (!activeRoom) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
    scheduleRoomSave();
}

function saveMatches() {
    if (!activeRoom) {
        localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
    }
    scheduleRoomSave();
}

function saveSoloRecords() {
    if (!activeRoom) {
        localStorage.setItem(SOLO_STORAGE_KEY, JSON.stringify(soloRecords));
    }
    scheduleRoomSave();
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
    blueWinBtn.disabled = !isReady || !canEditState();
    redWinBtn.disabled = !isReady || !canEditState();
}

function clearTeams() {
    currentTeams = null;
    teamResults.hidden = true;
    blueTeam.replaceChildren();
    redTeam.replaceChildren();
    setWinnerButtons(false);
    scheduleRoomSave();
}

function normalizeManualSelections() {
    const teamSize = players.length >= 2 && players.length % 2 === 0 ? players.length / 2 : 0;
    const playerIds = new Set(players.map((player) => player.puuid));
    const used = new Set();

    for (const team of ["blue", "red"]) {
        const previous = Array.isArray(manualSelections[team]) ? manualSelections[team] : [];
        manualSelections[team] = Array.from({ length: teamSize }, (_, index) => {
            const puuid = previous[index] || "";

            if (!puuid || !playerIds.has(puuid) || used.has(puuid)) {
                return "";
            }

            used.add(puuid);
            return puuid;
        });
    }
}

function manualTeamsComplete() {
    const selected = [...manualSelections.blue, ...manualSelections.red].filter(Boolean);
    return selected.length === players.length && new Set(selected).size === players.length;
}

function createManualSlot(team, index) {
    const label = document.createElement("label");
    const slotName = document.createElement("span");
    const select = document.createElement("select");
    const emptyOption = document.createElement("option");
    const currentValue = manualSelections[team][index];
    const selectedIds = new Set([...manualSelections.blue, ...manualSelections.red].filter(Boolean));

    label.className = "team-slot";
    slotName.textContent = `${index + 1}번`;
    select.setAttribute("aria-label", `${team === "blue" ? "Blue" : "Red"} Team ${index + 1}번 플레이어`);
    emptyOption.value = "";
    emptyOption.textContent = "참가자 선택";
    select.appendChild(emptyOption);

    players.forEach((player) => {
        const option = document.createElement("option");
        option.value = player.puuid;
        option.textContent = `${player.riotId} · ${player.score.toLocaleString()}점`;
        option.disabled = selectedIds.has(player.puuid) && player.puuid !== currentValue;
        select.appendChild(option);
    });

    select.value = currentValue;
    select.disabled = !canEditState();
    select.addEventListener("change", () => {
        manualSelections[team][index] = select.value;
        renderManualTeamBuilder();
    });
    label.append(slotName, select);
    return label;
}

function renderManualTeamBuilder() {
    manualTeamBuilder.hidden = teamMode !== "manual";
    blueManualSlots.replaceChildren();
    redManualSlots.replaceChildren();
    manualTeamMessage.className = "message";
    normalizeManualSelections();

    const teamSize = manualSelections.blue.length;
    const validPlayerCount = teamSize > 0;

    if (!validPlayerCount) {
        blueManualCount.textContent = "0 / 0";
        redManualCount.textContent = "0 / 0";
        confirmManualTeamBtn.disabled = true;
        manualTeamMessage.textContent = "짝수 인원의 참가자를 먼저 등록해 주세요.";
        return;
    }

    manualSelections.blue.forEach((_, index) => blueManualSlots.appendChild(createManualSlot("blue", index)));
    manualSelections.red.forEach((_, index) => redManualSlots.appendChild(createManualSlot("red", index)));

    const blueCount = manualSelections.blue.filter(Boolean).length;
    const redCount = manualSelections.red.filter(Boolean).length;
    blueManualCount.textContent = `${blueCount} / ${teamSize}`;
    redManualCount.textContent = `${redCount} / ${teamSize}`;
    confirmManualTeamBtn.disabled = !manualTeamsComplete() || !canEditState();
    manualTeamMessage.textContent = manualTeamsComplete()
        ? "모든 참가자를 배정했습니다."
        : `Blue와 Red에 ${teamSize}명씩 배정해 주세요.`;
}

function setTeamMode(mode) {
    teamMode = mode;
    const isAuto = mode === "auto";

    autoModeBtn.classList.toggle("active", isAuto);
    manualModeBtn.classList.toggle("active", !isAuto);
    autoModeBtn.setAttribute("aria-pressed", String(isAuto));
    manualModeBtn.setAttribute("aria-pressed", String(!isAuto));
    createTeamBtn.hidden = !isAuto;
    clearTeams();
    renderManualTeamBuilder();
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
        deleteButton.disabled = !canEditState();
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
    clearPlayersBtn.disabled = players.length === 0 || !canEditState();
    createTeamBtn.disabled = players.length < 2 || players.length % 2 !== 0 || !canEditState();
    renderManualTeamBuilder();
    renderSoloRecords();
}

function setLoading(isLoading) {
    const disabled = isLoading || !canEditState();
    addPlayerBtn.disabled = disabled;
    addPlayerBtn.classList.toggle("loading", isLoading);
    gameNameInput.disabled = disabled;
    tagLineInput.disabled = disabled;
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

autoModeBtn.addEventListener("click", () => setTeamMode("auto"));
manualModeBtn.addEventListener("click", () => setTeamMode("manual"));

stakeInput.addEventListener("change", () => {
    const stake = readStake();

    if (stake === null) {
        stakeInput.value = String(loadStake());
        return;
    }

    if (!activeRoom) {
        localStorage.setItem(STAKE_STORAGE_KEY, String(stake));
    }
    scheduleRoomSave();
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

function showTeamResult(result, isManual = false) {
    const stake = readStake();

    currentTeams = { ...result, isManual };
    renderTeam(blueTeam, result.blue);
    renderTeam(redTeam, result.red);
    blueScore.textContent = `${result.blueScore.toLocaleString()}점`;
    redScore.textContent = `${result.redScore.toLocaleString()}점`;
    balanceSummary.textContent = `${isManual ? "직접 편성 · " : ""}점수 차 ${result.difference.toLocaleString()}`;
    matchMessage.className = "message";
    matchMessage.textContent = stake === null
        ? "판돈을 100원 이상 정수로 입력한 뒤 승리 팀을 선택하세요."
        : `승리 팀을 선택하면 1인당 ${formatWon(stake)}으로 기록됩니다.`;
    setWinnerButtons(true);
    teamResults.hidden = false;
    scheduleRoomSave();

    if (!applyingRoomState) {
        teamResults.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

createTeamBtn.addEventListener("click", () => {
    const result = TeamBalancer.createBalancedTeams(players);

    showTeamResult(result);
});

confirmManualTeamBtn.addEventListener("click", () => {
    if (!manualTeamsComplete()) {
        manualTeamMessage.textContent = "모든 참가자를 한 번씩 배정해 주세요.";
        manualTeamMessage.classList.add("error");
        return;
    }

    const playerById = new Map(players.map((player) => [player.puuid, player]));
    const blue = manualSelections.blue.map((puuid) => playerById.get(puuid));
    const red = manualSelections.red.map((puuid) => playerById.get(puuid));
    const blueTeamScore = blue.reduce((sum, player) => sum + player.score, 0);
    const redTeamScore = red.reduce((sum, player) => sum + player.score, 0);

    showTeamResult({
        blue,
        red,
        blueScore: blueTeamScore,
        redScore: redTeamScore,
        difference: Math.abs(blueTeamScore - redTeamScore)
    }, true);
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
    if (!activeRoom) {
        localStorage.setItem(STAKE_STORAGE_KEY, String(stake));
    }
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
    undoMatchBtn.disabled = !hasMatches || !canEditState();
    clearMatchesBtn.disabled = !hasMatches || !canEditState();
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

function formatSoloScore(score) {
    return score > 0 ? `+${score}` : String(score);
}

function recentSoloLabel(matches) {
    if (!Array.isArray(matches) || matches.length === 0) {
        return "최근 전적 없음";
    }

    return matches.map((match) => {
        const champion = match.championName ? `${match.championName} ` : "";
        const result = match.voided ? "무효" : match.win ? "승" : "패";
        return `${champion}${result}`;
    }).join(" · ");
}

function renderSoloRecords() {
    soloList.replaceChildren();
    soloEmpty.hidden = players.length > 0;
    clearSoloBtn.disabled = Object.keys(soloRecords).length === 0 || !canEditState();

    players.forEach((player) => {
        const record = soloRecords[player.puuid] || null;
        const item = document.createElement("li");
        const identity = document.createElement("div");
        const riotId = document.createElement("strong");
        const recent = document.createElement("span");
        const stats = document.createElement("div");
        const score = document.createElement("strong");
        const recordText = document.createElement("span");
        const sync = document.createElement("div");
        const status = document.createElement("span");
        const syncButton = document.createElement("button");

        identity.className = "solo-identity";
        riotId.textContent = player.riotId;
        recent.textContent = record ? recentSoloLabel(record.recentMatches) : "아직 불러오지 않음";
        stats.className = "solo-stats";
        score.className = `solo-score ${record?.score > 0 ? "positive" : record?.score < 0 ? "negative" : "neutral"}`;
        score.textContent = formatSoloScore(record?.score || 0);
        recordText.textContent = `${record?.wins || 0}승 ${record?.losses || 0}패 · ${record?.voids || 0}무효`;
        sync.className = "solo-sync";
        status.className = "solo-sync-status";
        status.textContent = record?.syncMessage || "";
        syncButton.type = "button";
        syncButton.className = "solo-sync-button";
        syncButton.textContent = "전적 동기화";
        syncButton.disabled = !canEditState();
        syncButton.addEventListener("click", () => syncSoloRecord(player, syncButton, status));

        identity.append(riotId, recent);
        stats.append(score, recordText);
        sync.append(status, syncButton);
        item.append(identity, stats, sync);
        soloList.appendChild(item);
    });
}

async function syncSoloRecord(player, button, status) {
    button.disabled = true;
    button.textContent = "불러오는 중";
    status.textContent = "";

    try {
        const response = await fetch("/api/solo-record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puuid: player.puuid })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "솔랭 전적을 불러오지 못했습니다.");
        }

        const next = SoloScore.applyMatches(soloRecords[player.puuid], data.matches);
        const addedCount = next.addedWins + next.addedLosses + next.addedVoids;
        const voidMessage = next.addedVoids > 0 ? ` · 연속 챔피언 ${next.addedVoids}경기 무효` : "";
        soloRecords[player.puuid] = {
            ...next,
            puuid: player.puuid,
            riotId: player.riotId,
            syncedAt: new Date().toISOString(),
            syncMessage: addedCount > 0
                ? `새 경기 ${next.addedWins}승 ${next.addedLosses}패 반영${voidMessage}`
                : "새로 끝난 경기가 없습니다."
        };
        saveSoloRecords();
        renderSoloRecords();
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
        button.disabled = false;
        button.textContent = "다시 시도";
    }
}

clearSoloBtn.addEventListener("click", () => {
    if (!window.confirm("모든 솔랭 내기 기록을 삭제할까요?")) {
        return;
    }

    soloRecords = {};
    saveSoloRecords();
    renderSoloRecords();
});

function normalizeRoomCode(value) {
    return typeof value === "string"
        ? value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 6)
        : "";
}

function loadRoomHostTokens() {
    try {
        const saved = JSON.parse(localStorage.getItem(ROOM_HOST_TOKENS_STORAGE_KEY));
        return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch {
        return {};
    }
}

function rememberRoomHostToken(code, token) {
    const tokens = loadRoomHostTokens();
    tokens[code] = token;
    localStorage.setItem(ROOM_HOST_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

function roomHostToken(code) {
    return loadRoomHostTokens()[code] || "";
}

function sharedRoomState() {
    return {
        players,
        matches,
        soloRecords,
        currentTeams,
        stake: readStake() || DEFAULT_STAKE
    };
}

function applyRoomPermissions() {
    const editable = canEditState();
    gameNameInput.disabled = !editable;
    tagLineInput.disabled = !editable;
    addPlayerBtn.disabled = !editable;
    clearPlayersBtn.disabled = players.length === 0 || !editable;
    autoModeBtn.disabled = !editable;
    manualModeBtn.disabled = !editable;
    stakeInput.disabled = !editable;
    createTeamBtn.disabled = players.length < 2 || players.length % 2 !== 0 || !editable;
    confirmManualTeamBtn.disabled = !manualTeamsComplete() || !editable;
    setWinnerButtons(Boolean(currentTeams));
}

function renderRoomControls() {
    const connected = Boolean(activeRoom);
    roomDisconnected.hidden = connected;
    roomConnected.hidden = !connected;

    if (connected) {
        const isHost = Boolean(activeRoom.hostToken);
        activeRoomCode.textContent = activeRoom.code;
        roomRole.textContent = isHost ? "방장" : "관전자";
        roomRole.classList.toggle("viewer", !isHost);
        roomSyncStatus.textContent = isHost ? "변경 내용 자동 저장" : "방 기록 자동 새로고침";
    }

    applyRoomPermissions();
}

function updateRoomAddress(code) {
    const url = new URL(window.location.href);

    if (code) {
        url.searchParams.set("room", code);
    } else {
        url.searchParams.delete("room");
    }

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function applySharedRoomState(state) {
    applyingRoomState = true;
    players = Array.isArray(state?.players)
        ? state.players.slice(0, MAX_PLAYERS).map((player) => ({
            ...player,
            score: RankScore.rankedScore(player.rank)
        }))
        : [];
    matches = Array.isArray(state?.matches) ? state.matches.filter(isValidMatch) : [];
    soloRecords = state?.soloRecords && typeof state.soloRecords === "object" && !Array.isArray(state.soloRecords)
        ? state.soloRecords
        : {};
    currentTeams = state?.currentTeams
        && Array.isArray(state.currentTeams.blue)
        && Array.isArray(state.currentTeams.red)
        ? state.currentTeams
        : null;
    manualSelections = { blue: [], red: [] };
    stakeInput.value = String(
        Number.isSafeInteger(state?.stake) && state.stake >= 100 ? state.stake : DEFAULT_STAKE
    );

    renderPlayers();
    renderMoney();

    if (currentTeams) {
        showTeamResult(currentTeams, Boolean(currentTeams.isManual));
    } else {
        clearTeams();
    }

    applyingRoomState = false;
    renderRoomControls();
}

function stopRoomPolling() {
    if (roomPollTimer) {
        window.clearInterval(roomPollTimer);
        roomPollTimer = null;
    }
}

function startRoomPolling() {
    stopRoomPolling();
    roomPollTimer = window.setInterval(pollRoom, ROOM_POLL_INTERVAL);
}

async function pollRoom() {
    if (!activeRoom || roomSaveTimer || roomSaveInFlight) {
        return;
    }

    try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(activeRoom.code)}`, {
            cache: "no-store"
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "방 상태를 불러오지 못했습니다.");
        }

        if (data.revision > activeRoom.revision) {
            activeRoom.revision = data.revision;
            applySharedRoomState(data.state);
            roomSyncStatus.textContent = "방 기록 새로고침 완료";
        }
    } catch (error) {
        roomSyncStatus.textContent = "연결 확인 중";
        roomMessage.textContent = error.message;
        roomMessage.className = "message room-message error";
    }
}

function scheduleRoomSave() {
    if (!activeRoom?.hostToken || applyingRoomState) {
        return;
    }

    if (roomSaveInFlight) {
        roomSaveQueued = true;
        return;
    }

    if (roomSaveTimer) {
        window.clearTimeout(roomSaveTimer);
    }

    roomSyncStatus.textContent = "저장 중";
    roomSaveTimer = window.setTimeout(flushRoomSave, 300);
}

async function flushRoomSave() {
    if (!activeRoom?.hostToken) {
        return;
    }

    roomSaveTimer = null;
    roomSaveInFlight = true;
    const roomCode = activeRoom.code;
    const hostToken = activeRoom.hostToken;

    try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${hostToken}`
            },
            body: JSON.stringify({
                state: sharedRoomState(),
                expectedRevision: activeRoom.revision
            })
        });
        const data = await response.json();

        if (activeRoom?.code !== roomCode) {
            return;
        }

        if (response.status === 409 && data.state) {
            activeRoom.revision = data.revision;
            applySharedRoomState(data.state);
            roomMessage.textContent = data.message;
            roomMessage.className = "message room-message error";
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "방 기록을 저장하지 못했습니다.");
        }

        activeRoom.revision = data.revision;
        roomSyncStatus.textContent = "저장됨";
    } catch (error) {
        roomSyncStatus.textContent = "저장 실패";
        roomMessage.textContent = error.message;
        roomMessage.className = "message room-message error";
    } finally {
        roomSaveInFlight = false;

        if (roomSaveQueued) {
            roomSaveQueued = false;
            scheduleRoomSave();
        }
    }
}

function connectToRoom(data, hostToken = "") {
    activeRoom = {
        code: data.code,
        revision: data.revision,
        hostToken
    };
    localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, data.code);
    updateRoomAddress(data.code);
    applySharedRoomState(data.state);
    startRoomPolling();
}

async function joinRoom(code, quiet = false) {
    const normalizedCode = normalizeRoomCode(code);

    if (normalizedCode.length !== 6) {
        if (!quiet) {
            roomMessage.textContent = "6자리 방 코드를 입력해 주세요.";
            roomMessage.className = "message room-message error";
        }
        return;
    }

    createRoomBtn.disabled = true;
    roomCodeInput.disabled = true;
    joinRoomForm.querySelector("button").disabled = true;

    try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(normalizedCode)}`, {
            cache: "no-store"
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "방을 찾지 못했습니다.");
        }

        const hostToken = roomHostToken(data.code);
        connectToRoom(data, hostToken);
        roomMessage.textContent = hostToken
            ? "방장으로 다시 연결했습니다."
            : "방에 입장했습니다. 방장의 변경 내용이 자동으로 표시됩니다.";
        roomMessage.className = "message room-message success";
    } catch (error) {
        localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
        updateRoomAddress("");
        roomMessage.textContent = error.message;
        roomMessage.className = "message room-message error";
    } finally {
        createRoomBtn.disabled = false;
        roomCodeInput.disabled = false;
        joinRoomForm.querySelector("button").disabled = false;
    }
}

createRoomBtn.addEventListener("click", async () => {
    createRoomBtn.disabled = true;
    roomMessage.textContent = "새 방을 만들고 있습니다.";
    roomMessage.className = "message room-message";

    try {
        const response = await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: sharedRoomState() })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "방을 만들지 못했습니다.");
        }

        rememberRoomHostToken(data.code, data.hostToken);
        connectToRoom(data, data.hostToken);
        roomMessage.textContent = "방이 만들어졌습니다. 초대 링크를 친구들에게 보내세요.";
        roomMessage.className = "message room-message success";
    } catch (error) {
        roomMessage.textContent = error.message;
        roomMessage.className = "message room-message error";
    } finally {
        createRoomBtn.disabled = false;
    }
});

joinRoomForm.addEventListener("submit", (event) => {
    event.preventDefault();
    joinRoom(roomCodeInput.value);
});

roomCodeInput.addEventListener("input", () => {
    roomCodeInput.value = normalizeRoomCode(roomCodeInput.value);
});

copyRoomLinkBtn.addEventListener("click", async () => {
    if (!activeRoom) {
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("room", activeRoom.code);

    try {
        await navigator.clipboard.writeText(url.toString());
        roomMessage.textContent = "초대 링크를 복사했습니다.";
        roomMessage.className = "message room-message success";
    } catch {
        roomMessage.textContent = `방 코드 ${activeRoom.code}를 친구에게 알려주세요.`;
        roomMessage.className = "message room-message";
    }
});

leaveRoomBtn.addEventListener("click", () => {
    stopRoomPolling();
    activeRoom = null;
    localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
    updateRoomAddress("");
    players = loadPlayers();
    matches = loadMatches();
    soloRecords = loadSoloRecords();
    currentTeams = null;
    manualSelections = { blue: [], red: [] };
    stakeInput.value = String(loadStake());
    renderPlayers();
    renderMoney();
    clearTeams();
    renderRoomControls();
    roomMessage.textContent = "공유방에서 나왔습니다.";
    roomMessage.className = "message room-message";
});

function restoreActiveRoom() {
    const roomFromAddress = normalizeRoomCode(new URLSearchParams(window.location.search).get("room"));
    const savedRoom = normalizeRoomCode(localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY));
    const code = roomFromAddress || savedRoom;

    if (code) {
        joinRoom(code, true);
    }
}

function setupSectionNavigation() {
    const links = Array.from(document.querySelectorAll(".app-nav a"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (!links.length || !sections.length || !("IntersectionObserver" in window)) {
        return;
    }

    const activate = (id) => {
        links.forEach((link) => {
            const isCurrent = link.getAttribute("href") === `#${id}`;
            if (isCurrent) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
            activate(visible.target.id);
        }
    }, {
        rootMargin: "-72px 0px -68% 0px",
        threshold: [0, 0.2, 0.5]
    });

    sections.forEach((section) => observer.observe(section));
    activate(sections[0].id);
}

stakeInput.value = String(loadStake());
setWinnerButtons(false);
renderPlayers();
renderMoney();
renderRoomControls();
restoreActiveRoom();
setupSectionNavigation();

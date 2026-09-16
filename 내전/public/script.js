const STORAGE_KEY = "naejun-players-v1";
const MATCH_STORAGE_KEY = "naejun-matches-v1";
const STAKE_STORAGE_KEY = "naejun-stake-v1";
const SOLO_STORAGE_KEY = "naejun-solo-records-v1";
const SOLO_CHALLENGE_STORAGE_KEY = "naejun-solo-challenge-v1";
const PUBG_PLAYERS_STORAGE_KEY = "naejun-pubg-players-v1";
const PUBG_CHALLENGE_STORAGE_KEY = "naejun-pubg-challenge-v1";
const PUBG_TEAMS_STORAGE_KEY = "naejun-pubg-teams-v1";
const PUBG_TARGET_STORAGE_KEY = "naejun-pubg-target-v1";
const ACTIVE_ROOM_STORAGE_KEY = "naejun-active-room-v1";
const ROOM_HOST_TOKENS_STORAGE_KEY = "naejun-room-host-tokens-v1";
const MAX_PLAYERS = 10;
const DEFAULT_STAKE = 1000;
const ROOM_POLL_INTERVAL = 3000;
const PUBG_AUTO_SYNC_INTERVAL = 5 * 60 * 1000;
const DEFAULT_SOLO_CHALLENGE_DURATION = 8;
const MAX_SOLO_CHALLENGE_DURATION = 100;
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
const soloTimer = document.getElementById("soloTimer");
const soloTimerBadge = document.getElementById("soloTimerBadge");
const soloTimerTitle = document.getElementById("soloTimerTitle");
const soloTimerDetail = document.getElementById("soloTimerDetail");
const soloDurationInput = document.getElementById("soloDurationInput");
const soloDurationButtons = Array.from(soloTimer.querySelectorAll(".solo-duration-button"));
const startSoloChallengeBtn = document.getElementById("startSoloChallengeBtn");
const stopSoloChallengeBtn = document.getElementById("stopSoloChallengeBtn");
const pubgPlayerForm = document.getElementById("pubgPlayerForm");
const pubgPlayerNameInput = document.getElementById("pubgPlayerName");
const addPubgPlayerBtn = document.getElementById("addPubgPlayerBtn");
const pubgFormMessage = document.getElementById("pubgFormMessage");
const clearPubgRecordsBtn = document.getElementById("clearPubgRecordsBtn");
const randomizePubgTeamsBtn = document.getElementById("randomizePubgTeamsBtn");
const pubgBlueTeamSlots = document.getElementById("pubgBlueTeamSlots");
const pubgRedTeamSlots = document.getElementById("pubgRedTeamSlots");
const pubgBlueTeamCount = document.getElementById("pubgBlueTeamCount");
const pubgRedTeamCount = document.getElementById("pubgRedTeamCount");
const pubgBlueTeamScore = document.getElementById("pubgBlueTeamScore");
const pubgRedTeamScore = document.getElementById("pubgRedTeamScore");
const pubgBlueTeamKills = document.getElementById("pubgBlueTeamKills");
const pubgRedTeamKills = document.getElementById("pubgRedTeamKills");
const pubgBlueTeamGoal = document.getElementById("pubgBlueTeamGoal");
const pubgRedTeamGoal = document.getElementById("pubgRedTeamGoal");
const pubgTeamMessage = document.getElementById("pubgTeamMessage");
const pubgTimer = document.getElementById("pubgTimer");
const pubgTimerBadge = document.getElementById("pubgTimerBadge");
const pubgTimerTitle = document.getElementById("pubgTimerTitle");
const pubgTimerDetail = document.getElementById("pubgTimerDetail");
const pubgDurationInput = document.getElementById("pubgDurationInput");
const pubgTargetKillsInput = document.getElementById("pubgTargetKillsInput");
const pubgDurationButtons = Array.from(pubgTimer.querySelectorAll(".solo-duration-button"));
const startPubgChallengeBtn = document.getElementById("startPubgChallengeBtn");
const stopPubgChallengeBtn = document.getElementById("stopPubgChallengeBtn");
const syncAllPubgBtn = document.getElementById("syncAllPubgBtn");
const pubgSyncMeta = document.getElementById("pubgSyncMeta");
const pubgEmpty = document.getElementById("pubgEmpty");
const pubgList = document.getElementById("pubgList");
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
let soloChallenge = loadSoloChallenge();
let selectedSoloDuration = soloChallenge?.durationHours || DEFAULT_SOLO_CHALLENGE_DURATION;
let pubgPlayers = loadPubgPlayers();
let pubgChallenge = loadPubgChallenge();
let pubgTeams = loadPubgTeams();
let selectedPubgDuration = pubgChallenge?.durationHours || DEFAULT_SOLO_CHALLENGE_DURATION;
let selectedPubgTargetKills = pubgChallenge?.targetKills || loadPubgTargetKills();
let currentTeams = null;
let teamMode = "auto";
let manualSelections = { blue: [], red: [] };
let activeRoom = null;
let applyingRoomState = false;
let roomPollTimer = null;
let roomSaveTimer = null;
let roomSaveInFlight = false;
let roomSaveQueued = false;
let pubgSyncInFlight = false;
let lastPubgChallengePhase = pubgChallengePhase();

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

function loadPubgPlayers() {
    try {
        const saved = JSON.parse(localStorage.getItem(PUBG_PLAYERS_STORAGE_KEY));
        return Array.isArray(saved)
            ? saved.filter(isValidPubgPlayer).slice(0, MAX_PLAYERS)
            : [];
    } catch {
        return [];
    }
}

function isValidPubgPlayer(player) {
    return player
        && typeof player === "object"
        && typeof player.accountId === "string"
        && player.accountId.trim().length > 0
        && typeof player.playerName === "string"
        && player.playerName.trim().length > 0;
}

function normalizeSoloChallenge(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const durationHours = Number(value.durationHours);
    const startedAt = Number(value.startedAt);
    const endsAt = Number(value.endsAt);
    const maximumDuration = MAX_SOLO_CHALLENGE_DURATION * 60 * 60 * 1000;

    if (!Number.isSafeInteger(durationHours)
        || durationHours < 1
        || durationHours > MAX_SOLO_CHALLENGE_DURATION
        || !Number.isFinite(startedAt)
        || !Number.isFinite(endsAt)
        || startedAt <= 0
        || endsAt <= startedAt
        || endsAt - startedAt > maximumDuration) {
        return null;
    }

    return {
        durationHours,
        startedAt,
        endsAt,
        endedManually: Boolean(value.endedManually)
    };
}

function loadSoloChallenge() {
    try {
        return normalizeSoloChallenge(JSON.parse(localStorage.getItem(SOLO_CHALLENGE_STORAGE_KEY)));
    } catch {
        return null;
    }
}

function loadPubgChallenge() {
    try {
        return normalizePubgChallenge(JSON.parse(localStorage.getItem(PUBG_CHALLENGE_STORAGE_KEY)));
    } catch {
        return null;
    }
}

function isValidPubgTargetKills(value) {
    return Number.isSafeInteger(value) && value >= 1 && value <= 1000;
}

function normalizePubgChallenge(value) {
    const challenge = normalizeSoloChallenge(value);
    if (!challenge) {
        return null;
    }

    const targetKills = Number(value.targetKills);
    const reachedAt = Number(value.reachedAt);
    return {
        ...challenge,
        targetKills: isValidPubgTargetKills(targetKills) ? targetKills : null,
        winner: ["blue", "red", "draw"].includes(value.winner) ? value.winner : null,
        reachedAt: Number.isFinite(reachedAt) && reachedAt > 0 ? reachedAt : null
    };
}

function loadPubgTargetKills() {
    const saved = Number(localStorage.getItem(PUBG_TARGET_STORAGE_KEY));
    return isValidPubgTargetKills(saved) ? saved : 50;
}

function loadPubgTeams() {
    try {
        const saved = JSON.parse(localStorage.getItem(PUBG_TEAMS_STORAGE_KEY));
        return saved && typeof saved === "object" && !Array.isArray(saved)
            ? saved
            : { blue: [], red: [] };
    } catch {
        return { blue: [], red: [] };
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

function saveSoloChallenge() {
    if (!activeRoom) {
        if (soloChallenge) {
            localStorage.setItem(SOLO_CHALLENGE_STORAGE_KEY, JSON.stringify(soloChallenge));
        } else {
            localStorage.removeItem(SOLO_CHALLENGE_STORAGE_KEY);
        }
    }
    scheduleRoomSave();
}

function savePubgPlayers() {
    if (!activeRoom) {
        localStorage.setItem(PUBG_PLAYERS_STORAGE_KEY, JSON.stringify(pubgPlayers));
    }
    scheduleRoomSave();
}

function savePubgChallenge() {
    if (!activeRoom) {
        if (pubgChallenge) {
            localStorage.setItem(PUBG_CHALLENGE_STORAGE_KEY, JSON.stringify(pubgChallenge));
        } else {
            localStorage.removeItem(PUBG_CHALLENGE_STORAGE_KEY);
        }
    }
    scheduleRoomSave();
}

function savePubgTeams() {
    if (!activeRoom) {
        localStorage.setItem(PUBG_TEAMS_STORAGE_KEY, JSON.stringify(pubgTeams));
    }
    scheduleRoomSave();
}

function savePubgTargetKills() {
    localStorage.setItem(PUBG_TARGET_STORAGE_KEY, String(selectedPubgTargetKills));
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
    renderSoloChallenge();
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

function soloChallengePhase(now = Date.now()) {
    if (!soloChallenge) {
        return "idle";
    }

    return now < soloChallenge.endsAt ? "active" : "ended";
}

function formatSoloCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatSoloEndTime(timestamp) {
    return new Intl.DateTimeFormat("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(timestamp));
}

function isValidSoloDuration(value) {
    return Number.isSafeInteger(value)
        && value >= 1
        && value <= MAX_SOLO_CHALLENGE_DURATION;
}

function renderSoloChallenge() {
    const now = Date.now();
    const phase = soloChallengePhase(now);
    const editable = canEditState();
    const active = phase === "active";
    const durationIsValid = isValidSoloDuration(selectedSoloDuration);

    soloTimer.classList.toggle("active", active);
    soloTimer.classList.toggle("ended", phase === "ended");

    if (phase === "idle") {
        soloTimerBadge.textContent = "시작 전";
        soloTimerTitle.textContent = "제한시간을 선택하세요";
        soloTimerDetail.textContent = "내기를 시작한 뒤 끝난 솔랭 경기만 점수에 반영됩니다.";
    } else if (active) {
        soloTimerBadge.textContent = "진행 중";
        soloTimerTitle.textContent = formatSoloCountdown(soloChallenge.endsAt - now);
        soloTimerDetail.textContent = `${soloChallenge.durationHours}시간 내기 · ${formatSoloEndTime(soloChallenge.endsAt)} 종료`;
    } else {
        soloTimerBadge.textContent = "종료";
        soloTimerTitle.textContent = "00:00:00";
        soloTimerDetail.textContent = `${formatSoloEndTime(soloChallenge.endsAt)} 종료 · 제한시간 안에 끝난 경기만 최종 집계됩니다.`;
    }

    if (document.activeElement !== soloDurationInput) {
        soloDurationInput.value = durationIsValid ? String(selectedSoloDuration) : "";
    }
    soloDurationInput.disabled = active || !editable;
    soloDurationInput.setAttribute("aria-invalid", String(!durationIsValid));
    soloDurationInput.closest(".solo-duration-input-wrap").classList.toggle("invalid", !durationIsValid);

    soloDurationButtons.forEach((button) => {
        const duration = Number(button.dataset.hours);
        const selected = duration === selectedSoloDuration;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.disabled = active || !editable;
    });

    startSoloChallengeBtn.textContent = phase === "ended" ? "새 내기 시작" : "내기 시작";
    startSoloChallengeBtn.hidden = active;
    startSoloChallengeBtn.disabled = active || players.length === 0 || !editable || !durationIsValid;
    stopSoloChallengeBtn.hidden = !active;
    stopSoloChallengeBtn.disabled = !editable;

    document.querySelectorAll(".solo-sync-button").forEach((button) => {
        if (button.dataset.loading !== "true") {
            button.textContent = phase === "ended" ? "최종 집계" : "전적 동기화";
            button.disabled = !soloChallenge || !editable;
        }
    });
}

soloDurationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedSoloDuration = Number(button.dataset.hours);
        soloDurationInput.value = String(selectedSoloDuration);
        renderSoloChallenge();
    });
});

soloDurationInput.addEventListener("input", () => {
    const duration = soloDurationInput.valueAsNumber;
    selectedSoloDuration = isValidSoloDuration(duration) ? duration : null;
    renderSoloChallenge();
});

soloDurationInput.addEventListener("change", () => {
    if (!isValidSoloDuration(selectedSoloDuration)) {
        soloDurationInput.focus();
    }
});

startSoloChallengeBtn.addEventListener("click", () => {
    if (!players.length
        || soloChallengePhase() === "active"
        || !canEditState()
        || !isValidSoloDuration(selectedSoloDuration)) {
        return;
    }

    if (Object.keys(soloRecords).length > 0
        && !window.confirm("새 솔랭 내기를 시작하면 이전 솔랭 점수가 초기화됩니다. 계속할까요?")) {
        return;
    }

    const startedAt = Date.now();
    soloChallenge = {
        durationHours: selectedSoloDuration,
        startedAt,
        endsAt: startedAt + selectedSoloDuration * 60 * 60 * 1000,
        endedManually: false
    };
    soloRecords = {};
    saveSoloRecords();
    saveSoloChallenge();
    renderSoloChallenge();
    renderSoloRecords();
});

stopSoloChallengeBtn.addEventListener("click", () => {
    if (soloChallengePhase() !== "active" || !canEditState()) {
        return;
    }

    if (!window.confirm("솔랭 내기를 지금 종료할까요? 종료 이후 경기는 반영되지 않습니다.")) {
        return;
    }

    soloChallenge = {
        ...soloChallenge,
        endsAt: Math.max(soloChallenge.startedAt + 1, Date.now()),
        endedManually: true
    };
    saveSoloChallenge();
    renderSoloChallenge();
    renderSoloRecords();
});

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
        syncButton.textContent = soloChallengePhase() === "ended" ? "최종 집계" : "전적 동기화";
        syncButton.disabled = !soloChallenge || !canEditState();
        syncButton.addEventListener("click", () => syncSoloRecord(player, syncButton, status));

        identity.append(riotId, recent);
        stats.append(score, recordText);
        sync.append(status, syncButton);
        item.append(identity, stats, sync);
        soloList.appendChild(item);
    });
}

async function syncSoloRecord(player, button, status) {
    if (!soloChallenge) {
        status.textContent = "먼저 제한시간을 정하고 내기를 시작해 주세요.";
        status.classList.add("error");
        return;
    }

    button.disabled = true;
    button.dataset.loading = "true";
    button.textContent = "불러오는 중";
    status.textContent = "";
    status.classList.remove("error");

    try {
        const response = await fetch("/api/solo-record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                puuid: player.puuid,
                startedAt: soloChallenge.startedAt,
                endsAt: soloChallenge.endsAt
            })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "솔랭 전적을 불러오지 못했습니다.");
        }

        const eligibleMatches = SoloScore.filterMatchesByWindow(
            data.matches,
            soloChallenge.startedAt,
            soloChallenge.endsAt
        );
        const next = SoloScore.applyMatches(soloRecords[player.puuid], eligibleMatches);
        const addedCount = next.addedWins + next.addedLosses + next.addedVoids;
        const voidMessage = next.addedVoids > 0 ? ` · 연속 챔피언 ${next.addedVoids}경기 무효` : "";
        soloRecords[player.puuid] = {
            ...next,
            puuid: player.puuid,
            riotId: player.riotId,
            syncedAt: new Date().toISOString(),
            syncMessage: addedCount > 0
                ? `새 경기 ${next.addedWins}승 ${next.addedLosses}패 반영${voidMessage}`
                : soloChallengePhase() === "ended"
                    ? "제한시간 안에 추가로 끝난 경기가 없습니다."
                    : "새로 끝난 경기가 없습니다."
        };
        saveSoloRecords();
        renderSoloRecords();
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
        delete button.dataset.loading;
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

function pubgChallengePhase(now = Date.now()) {
    if (!pubgChallenge) {
        return "idle";
    }
    return now < pubgChallenge.endsAt ? "active" : "ended";
}

function resetPubgRecord(player) {
    return {
        accountId: player.accountId,
        playerName: player.playerName,
        platform: "steam",
        totalKills: 0,
        games: 0,
        chickens: 0,
        seenMatchIds: [],
        recentMatches: [],
        syncMessage: ""
    };
}

function pubgTeamsComplete() {
    return PubgTeam.teamsComplete(pubgPlayers, pubgTeams);
}

function pubgPlayerTeam(accountId) {
    if (pubgTeams.blue.includes(accountId)) {
        return "blue";
    }
    if (pubgTeams.red.includes(accountId)) {
        return "red";
    }
    return "";
}

function createPubgTeamSlot(team, index) {
    const label = document.createElement("label");
    const slotName = document.createElement("span");
    const select = document.createElement("select");
    const emptyOption = document.createElement("option");
    const currentValue = pubgTeams[team][index];
    const selectedIds = new Set([...pubgTeams.blue, ...pubgTeams.red].filter(Boolean));

    label.className = "team-slot";
    slotName.textContent = `${index + 1}번`;
    select.setAttribute("aria-label", `배그 ${team === "blue" ? "Blue" : "Red"} Team ${index + 1}번 플레이어`);
    emptyOption.value = "";
    emptyOption.textContent = "Steam 참가자 선택";
    select.appendChild(emptyOption);

    pubgPlayers.forEach((player) => {
        const option = document.createElement("option");
        option.value = player.accountId;
        option.textContent = player.playerName;
        option.disabled = selectedIds.has(player.accountId) && player.accountId !== currentValue;
        select.appendChild(option);
    });

    select.value = currentValue;
    select.disabled = pubgChallengePhase() === "active" || !canEditState();
    select.addEventListener("change", () => {
        pubgTeams[team][index] = select.value;
        pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, pubgTeams);
        savePubgTeams();
        renderPubgPlayers();
    });
    label.append(slotName, select);
    return label;
}

function renderPubgTeamBuilder() {
    pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, pubgTeams);
    pubgBlueTeamSlots.replaceChildren();
    pubgRedTeamSlots.replaceChildren();

    const teamSize = pubgTeams.blue.length;
    const active = pubgChallengePhase() === "active";
    const editable = canEditState();
    const totals = PubgTeam.teamTotals(pubgPlayers, pubgTeams);
    const complete = pubgTeamsComplete();
    const targetKills = pubgChallenge?.targetKills || selectedPubgTargetKills;
    const targetIsValid = isValidPubgTargetKills(targetKills);
    const winner = pubgChallenge?.winner || null;

    pubgBlueTeamKills.textContent = targetIsValid ? `${totals.blue} / ${targetKills}킬` : `${totals.blue}킬`;
    pubgRedTeamKills.textContent = targetIsValid ? `${totals.red} / ${targetKills}킬` : `${totals.red}킬`;
    pubgBlueTeamGoal.textContent = winner === "blue"
        ? "목표 달성 · 승리"
        : winner === "draw"
            ? "동시 목표 달성"
            : targetIsValid
                ? `목표까지 ${Math.max(0, targetKills - totals.blue)}킬`
                : "목표 설정 전";
    pubgRedTeamGoal.textContent = winner === "red"
        ? "목표 달성 · 승리"
        : winner === "draw"
            ? "동시 목표 달성"
            : targetIsValid
                ? `목표까지 ${Math.max(0, targetKills - totals.red)}킬`
                : "목표 설정 전";
    pubgBlueTeamScore.classList.toggle("winner", winner === "blue" || winner === "draw");
    pubgRedTeamScore.classList.toggle("winner", winner === "red" || winner === "draw");
    pubgBlueTeamCount.textContent = `${pubgTeams.blue.filter(Boolean).length} / ${teamSize}`;
    pubgRedTeamCount.textContent = `${pubgTeams.red.filter(Boolean).length} / ${teamSize}`;
    randomizePubgTeamsBtn.disabled = teamSize === 0 || active || !editable;

    if (teamSize === 0) {
        pubgTeamMessage.textContent = pubgPlayers.length % 2 === 1
            ? "같은 인원의 두 팀을 만들려면 참가자를 짝수로 등록해 주세요."
            : "Steam 참가자를 등록하면 팀 편성 칸이 열립니다.";
        return;
    }

    pubgTeams.blue.forEach((_, index) => pubgBlueTeamSlots.appendChild(createPubgTeamSlot("blue", index)));
    pubgTeams.red.forEach((_, index) => pubgRedTeamSlots.appendChild(createPubgTeamSlot("red", index)));

    if (winner === "blue" || winner === "red") {
        pubgTeamMessage.textContent = `${winner === "blue" ? "Blue" : "Red"} Team이 ${targetKills}킬 목표를 달성했습니다.`;
    } else if (winner === "draw") {
        pubgTeamMessage.textContent = `두 팀이 ${targetKills}킬 목표를 동시에 달성해 무승부입니다.`;
    } else if (active) {
        pubgTeamMessage.textContent = `킬내기 진행 중 · ${teamSize}대${teamSize} 팀 편성이 잠겼습니다.`;
    } else if (complete) {
        pubgTeamMessage.textContent = `Blue와 Red에 ${teamSize}명씩 편성했습니다.`;
    } else {
        pubgTeamMessage.textContent = `Blue와 Red에 ${teamSize}명씩 모든 참가자를 배정해 주세요.`;
    }
}

function resolvePubgTargetWinner() {
    if (!pubgChallenge || pubgChallenge.winner || !isValidPubgTargetKills(pubgChallenge.targetKills)) {
        return false;
    }

    const winner = PubgTeam.resolveWinner(pubgPlayers, pubgTeams, pubgChallenge.targetKills);
    if (!winner) {
        return false;
    }

    const reachedAt = Math.min(Date.now(), pubgChallenge.endsAt);
    pubgChallenge = {
        ...pubgChallenge,
        winner,
        reachedAt,
        endsAt: Math.min(pubgChallenge.endsAt, reachedAt)
    };
    savePubgChallenge();
    return true;
}

function pubgRecentLabel(matches) {
    if (!Array.isArray(matches) || matches.length === 0) {
        return "집계된 경기가 없습니다.";
    }

    return matches.slice(0, 3).map((match) => {
        const placement = match.placement > 0 ? `#${match.placement}` : "순위 없음";
        return `${match.kills}킬 · ${placement} · ${match.damage}딜`;
    }).join(" / ");
}

function renderPubgChallenge() {
    const now = Date.now();
    const phase = pubgChallengePhase(now);
    const active = phase === "active";
    const editable = canEditState();
    const durationIsValid = isValidSoloDuration(selectedPubgDuration);
    const targetIsValid = isValidPubgTargetKills(selectedPubgTargetKills);
    const winner = pubgChallenge?.winner || null;

    pubgTimer.classList.toggle("active", active);
    pubgTimer.classList.toggle("ended", phase === "ended");

    if (phase === "idle") {
        pubgTimerBadge.textContent = "시작 전";
        pubgTimerTitle.textContent = "킬내기 시간을 정하세요";
        pubgTimerDetail.textContent = "팀 목표 킬과 제한시간을 정하면 Steam 전적을 자동 집계합니다.";
    } else if (active) {
        pubgTimerBadge.textContent = "진행 중";
        pubgTimerTitle.textContent = formatSoloCountdown(pubgChallenge.endsAt - now);
        pubgTimerDetail.textContent = pubgChallenge.targetKills
            ? `먼저 ${pubgChallenge.targetKills}킬 · ${formatSoloEndTime(pubgChallenge.endsAt)} 시간 종료`
            : `${pubgChallenge.durationHours}시간 킬내기 · ${formatSoloEndTime(pubgChallenge.endsAt)} 종료`;
    } else if (winner) {
        pubgTimerBadge.textContent = winner === "draw" ? "무승부" : "목표 달성";
        pubgTimerTitle.textContent = winner === "draw"
            ? "동시 목표 달성"
            : `${winner === "blue" ? "BLUE" : "RED"} TEAM 승리`;
        pubgTimerDetail.textContent = `${pubgChallenge.targetKills}킬 목표 · ${formatSoloEndTime(pubgChallenge.reachedAt || pubgChallenge.endsAt)} 확정`;
    } else {
        pubgTimerBadge.textContent = "종료";
        pubgTimerTitle.textContent = "00:00:00";
        pubgTimerDetail.textContent = `${formatSoloEndTime(pubgChallenge.endsAt)} 종료 · 종료 전에 끝난 경기만 최종 집계됩니다.`;
    }

    if (document.activeElement !== pubgDurationInput) {
        pubgDurationInput.value = durationIsValid ? String(selectedPubgDuration) : "";
    }
    pubgDurationInput.disabled = active || !editable;
    pubgDurationInput.setAttribute("aria-invalid", String(!durationIsValid));
    pubgDurationInput.closest(".solo-duration-input-wrap").classList.toggle("invalid", !durationIsValid);

    if (document.activeElement !== pubgTargetKillsInput) {
        pubgTargetKillsInput.value = targetIsValid ? String(selectedPubgTargetKills) : "";
    }
    pubgTargetKillsInput.disabled = active || !editable;
    pubgTargetKillsInput.setAttribute("aria-invalid", String(!targetIsValid));
    pubgTargetKillsInput.closest(".solo-duration-input-wrap").classList.toggle("invalid", !targetIsValid);

    pubgDurationButtons.forEach((button) => {
        const selected = Number(button.dataset.hours) === selectedPubgDuration;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.disabled = active || !editable;
    });

    startPubgChallengeBtn.textContent = phase === "ended" ? "새 킬내기 시작" : "킬내기 시작";
    startPubgChallengeBtn.hidden = active;
    startPubgChallengeBtn.disabled = active
        || !pubgPlayers.length
        || !pubgTeamsComplete()
        || !durationIsValid
        || !targetIsValid
        || !editable;
    stopPubgChallengeBtn.hidden = !active;
    stopPubgChallengeBtn.disabled = !editable;
    syncAllPubgBtn.textContent = phase === "ended" ? "최종 전적 집계" : "전체 전적 동기화";
    syncAllPubgBtn.disabled = !pubgChallenge || !pubgPlayers.length || !editable || pubgSyncInFlight;
}

function renderPubgPlayers() {
    pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, pubgTeams);
    pubgList.replaceChildren();
    pubgEmpty.hidden = pubgPlayers.length > 0;
    clearPubgRecordsBtn.disabled = !pubgChallenge || !canEditState();

    const orderedPlayers = [...pubgPlayers].sort((left, right) => {
        return (Number(right.totalKills) || 0) - (Number(left.totalKills) || 0)
            || left.playerName.localeCompare(right.playerName, "ko");
    });

    orderedPlayers.forEach((player, index) => {
        const item = document.createElement("li");
        const rank = document.createElement("strong");
        const identity = document.createElement("div");
        const playerHeading = document.createElement("div");
        const playerName = document.createElement("strong");
        const teamBadge = document.createElement("span");
        const recent = document.createElement("span");
        const kills = document.createElement("div");
        const killCount = document.createElement("strong");
        const gameCount = document.createElement("span");
        const sync = document.createElement("div");
        const syncStatus = document.createElement("span");
        const syncButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        rank.className = "pubg-rank";
        rank.textContent = `#${index + 1}`;
        identity.className = "pubg-identity";
        playerHeading.className = "pubg-player-heading";
        playerName.textContent = player.playerName;
        const team = pubgPlayerTeam(player.accountId);
        if (team) {
            teamBadge.className = `pubg-team-badge ${team}`;
            teamBadge.textContent = team === "blue" ? "BLUE" : "RED";
            playerHeading.append(playerName, teamBadge);
        } else {
            playerHeading.appendChild(playerName);
        }
        recent.textContent = pubgRecentLabel(player.recentMatches);
        kills.className = "pubg-kills";
        killCount.textContent = `${Number(player.totalKills) || 0}킬`;
        gameCount.textContent = `${Number(player.games) || 0}경기 · ${Number(player.chickens) || 0}치킨`;
        sync.className = "pubg-sync";
        syncStatus.className = "pubg-sync-status";
        syncStatus.textContent = player.syncMessage || "STEAM";
        syncButton.type = "button";
        syncButton.className = "pubg-sync-button";
        syncButton.textContent = pubgChallengePhase() === "ended" ? "최종 집계" : "전적 동기화";
        syncButton.disabled = !pubgChallenge || !canEditState() || pubgSyncInFlight;
        syncButton.addEventListener("click", () => syncPubgRecords([player]));
        deleteButton.type = "button";
        deleteButton.className = "pubg-delete-button";
        deleteButton.textContent = "×";
        deleteButton.title = "플레이어 삭제";
        deleteButton.setAttribute("aria-label", `${player.playerName} 삭제`);
        deleteButton.disabled = pubgChallengePhase() === "active" || !canEditState();
        deleteButton.addEventListener("click", () => {
            if (pubgChallengePhase() === "active") {
                return;
            }
            pubgPlayers = pubgPlayers.filter((candidate) => candidate.accountId !== player.accountId);
            pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, pubgTeams);
            savePubgPlayers();
            savePubgTeams();
            renderPubgPlayers();
            renderPubgChallenge();
        });

        identity.append(playerHeading, recent);
        kills.append(killCount, gameCount);
        sync.append(syncStatus, syncButton, deleteButton);
        item.append(rank, identity, kills, sync);
        pubgList.appendChild(item);
    });

    renderPubgTeamBuilder();
    renderPubgChallenge();
}

async function syncPubgRecords(targetPlayers = pubgPlayers, quiet = false) {
    if (!pubgChallenge || !targetPlayers.length || !canEditState() || pubgSyncInFlight) {
        return;
    }

    pubgSyncInFlight = true;
    syncAllPubgBtn.textContent = "전적 불러오는 중";
    pubgSyncMeta.textContent = "Steam 경기 기록 확인 중";
    renderPubgPlayers();

    try {
        const response = await fetch("/api/pubg-records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                players: targetPlayers.map((player) => ({ accountId: player.accountId })),
                startedAt: pubgChallenge.startedAt,
                endsAt: pubgChallenge.endsAt
            })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "배그 전적을 불러오지 못했습니다.");
        }

        const targetIds = new Set(targetPlayers.map((player) => player.accountId));
        pubgPlayers = pubgPlayers.map((player) => {
            if (!targetIds.has(player.accountId)) {
                return player;
            }

            const eligibleMatches = PubgKill.filterMatchesByWindow(
                data.records?.[player.accountId],
                pubgChallenge.startedAt,
                pubgChallenge.endsAt
            );
            const next = PubgKill.applyMatches(player, eligibleMatches);
            return {
                ...player,
                ...next,
                syncedAt: data.syncedAt || new Date().toISOString(),
                syncMessage: next.addedGames > 0
                    ? `${next.addedGames}경기 · +${next.addedKills}킬`
                    : "새 경기가 없습니다."
            };
        });
        savePubgPlayers();
        if (pubgPlayers.every((player) => targetIds.has(player.accountId))) {
            resolvePubgTargetWinner();
        }
        pubgSyncMeta.textContent = `마지막 동기화 ${new Intl.DateTimeFormat("ko-KR", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date())}`;
    } catch (error) {
        pubgSyncMeta.textContent = error.message;
        if (!quiet) {
            pubgFormMessage.textContent = error.message;
            pubgFormMessage.className = "message error";
        }
    } finally {
        pubgSyncInFlight = false;
        renderPubgPlayers();
    }
}

pubgPlayerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const requestedName = pubgPlayerNameInput.value.trim();
    pubgFormMessage.textContent = "";
    pubgFormMessage.className = "message";

    if (pubgChallengePhase() === "active") {
        pubgFormMessage.textContent = "킬내기 진행 중에는 참가자를 변경할 수 없습니다.";
        pubgFormMessage.classList.add("error");
        return;
    }
    if (pubgPlayers.length >= MAX_PLAYERS) {
        pubgFormMessage.textContent = "배그 킬내기 참가자는 최대 10명입니다.";
        pubgFormMessage.classList.add("error");
        return;
    }
    if (pubgPlayers.some((player) => player.playerName.toLowerCase() === requestedName.toLowerCase())) {
        pubgFormMessage.textContent = "이미 등록된 Steam 플레이어입니다.";
        pubgFormMessage.classList.add("error");
        return;
    }

    addPubgPlayerBtn.disabled = true;
    addPubgPlayerBtn.textContent = "확인 중";
    pubgPlayerNameInput.disabled = true;

    try {
        const response = await fetch("/api/pubg-player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName: requestedName })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Steam 플레이어를 찾지 못했습니다.");
        }
        if (pubgPlayers.some((player) => player.accountId === data.accountId)) {
            throw new Error("이미 등록된 Steam 플레이어입니다.");
        }

        pubgPlayers.push(resetPubgRecord(data));
        pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, pubgTeams);
        savePubgPlayers();
        savePubgTeams();
        renderPubgPlayers();
        pubgPlayerForm.reset();
        pubgFormMessage.textContent = `${data.playerName} 님을 추가했습니다.`;
        pubgFormMessage.classList.add("success");
    } catch (error) {
        pubgFormMessage.textContent = error.message;
        pubgFormMessage.classList.add("error");
    } finally {
        const rosterLocked = pubgChallengePhase() === "active" || !canEditState();
        addPubgPlayerBtn.disabled = rosterLocked || pubgPlayers.length >= MAX_PLAYERS;
        addPubgPlayerBtn.textContent = "추가";
        pubgPlayerNameInput.disabled = rosterLocked;
    }
});

pubgDurationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedPubgDuration = Number(button.dataset.hours);
        pubgDurationInput.value = String(selectedPubgDuration);
        renderPubgChallenge();
    });
});

pubgTargetKillsInput.addEventListener("input", () => {
    const targetKills = pubgTargetKillsInput.valueAsNumber;
    selectedPubgTargetKills = isValidPubgTargetKills(targetKills) ? targetKills : null;
    if (selectedPubgTargetKills) {
        savePubgTargetKills();
    }
    renderPubgPlayers();
});

pubgDurationInput.addEventListener("input", () => {
    const duration = pubgDurationInput.valueAsNumber;
    selectedPubgDuration = isValidSoloDuration(duration) ? duration : null;
    renderPubgChallenge();
});

randomizePubgTeamsBtn.addEventListener("click", () => {
    if (pubgChallengePhase() === "active" || !canEditState()) {
        return;
    }

    pubgTeams = PubgTeam.randomizeTeams(pubgPlayers);
    savePubgTeams();
    renderPubgPlayers();
});

startPubgChallengeBtn.addEventListener("click", () => {
    if (!pubgPlayers.length
        || !pubgTeamsComplete()
        || pubgChallengePhase() === "active"
        || !canEditState()
        || !isValidSoloDuration(selectedPubgDuration)
        || !isValidPubgTargetKills(selectedPubgTargetKills)) {
        return;
    }

    if (pubgChallenge && !window.confirm("새 킬내기를 시작하면 이전 킬 기록이 초기화됩니다. 계속할까요?")) {
        return;
    }

    const startedAt = Date.now();
    pubgChallenge = {
        durationHours: selectedPubgDuration,
        startedAt,
        endsAt: startedAt + selectedPubgDuration * 60 * 60 * 1000,
        endedManually: false,
        targetKills: selectedPubgTargetKills,
        winner: null,
        reachedAt: null
    };
    pubgPlayers = pubgPlayers.map(resetPubgRecord);
    savePubgPlayers();
    savePubgChallenge();
    renderPubgPlayers();
    applyRoomPermissions();
});

stopPubgChallengeBtn.addEventListener("click", () => {
    if (pubgChallengePhase() !== "active" || !canEditState()) {
        return;
    }
    if (!window.confirm("배그 킬내기를 지금 종료할까요? 종료 이후 경기는 반영되지 않습니다.")) {
        return;
    }

    pubgChallenge = {
        ...pubgChallenge,
        endsAt: Math.max(pubgChallenge.startedAt + 1, Date.now()),
        endedManually: true
    };
    savePubgChallenge();
    renderPubgPlayers();
    applyRoomPermissions();
});

syncAllPubgBtn.addEventListener("click", () => syncPubgRecords());

clearPubgRecordsBtn.addEventListener("click", () => {
    if (!window.confirm("배그 킬 기록과 진행 중인 타이머를 초기화할까요?")) {
        return;
    }
    pubgChallenge = null;
    pubgPlayers = pubgPlayers.map(resetPubgRecord);
    savePubgPlayers();
    savePubgChallenge();
    renderPubgPlayers();
});

function autoSyncPubgRecords() {
    if (pubgChallengePhase() === "active" && canEditState() && pubgPlayers.length > 0) {
        syncPubgRecords(pubgPlayers, true);
    }
}

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
        soloChallenge,
        pubgPlayers,
        pubgChallenge,
        pubgTeams,
        currentTeams,
        stake: readStake() || DEFAULT_STAKE
    };
}

function applyRoomPermissions() {
    const editable = canEditState();
    const pubgRosterLocked = pubgChallengePhase() === "active" || !editable;
    gameNameInput.disabled = !editable;
    tagLineInput.disabled = !editable;
    addPlayerBtn.disabled = !editable;
    clearPlayersBtn.disabled = players.length === 0 || !editable;
    autoModeBtn.disabled = !editable;
    manualModeBtn.disabled = !editable;
    stakeInput.disabled = !editable;
    createTeamBtn.disabled = players.length < 2 || players.length % 2 !== 0 || !editable;
    confirmManualTeamBtn.disabled = !manualTeamsComplete() || !editable;
    pubgPlayerNameInput.disabled = pubgRosterLocked;
    addPubgPlayerBtn.disabled = pubgPlayers.length >= MAX_PLAYERS || pubgRosterLocked;
    setWinnerButtons(Boolean(currentTeams));
    renderSoloChallenge();
    renderPubgChallenge();
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
    soloChallenge = normalizeSoloChallenge(state?.soloChallenge);
    selectedSoloDuration = soloChallenge?.durationHours || selectedSoloDuration;
    pubgPlayers = Array.isArray(state?.pubgPlayers)
        ? state.pubgPlayers.filter(isValidPubgPlayer).slice(0, MAX_PLAYERS)
        : [];
    pubgChallenge = normalizePubgChallenge(state?.pubgChallenge);
    selectedPubgDuration = pubgChallenge?.durationHours || selectedPubgDuration;
    selectedPubgTargetKills = pubgChallenge?.targetKills || selectedPubgTargetKills;
    pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, state?.pubgTeams);
    const savedTeams = state?.currentTeams;
    if (savedTeams && Array.isArray(savedTeams.blue) && Array.isArray(savedTeams.red)) {
        const playerById = new Map(players.map((player) => [player.puuid, player]));
        const blue = savedTeams.blue.map((member) => playerById.get(member?.puuid));
        const red = savedTeams.red.map((member) => playerById.get(member?.puuid));
        if (blue.every(Boolean) && red.every(Boolean)) {
            const blueScore = blue.reduce((sum, player) => sum + player.score, 0);
            const redScore = red.reduce((sum, player) => sum + player.score, 0);
            currentTeams = {
                blue,
                red,
                blueScore,
                redScore,
                difference: Math.abs(blueScore - redScore),
                isManual: Boolean(savedTeams.isManual)
            };
        } else {
            currentTeams = null;
        }
    } else {
        currentTeams = null;
    }
    manualSelections = { blue: [], red: [] };
    stakeInput.value = String(
        Number.isSafeInteger(state?.stake) && state.stake >= 100 ? state.stake : DEFAULT_STAKE
    );

    renderPlayers();
    renderMoney();
    renderPubgPlayers();

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
    soloChallenge = loadSoloChallenge();
    selectedSoloDuration = soloChallenge?.durationHours || selectedSoloDuration;
    pubgPlayers = loadPubgPlayers();
    pubgChallenge = loadPubgChallenge();
    selectedPubgDuration = pubgChallenge?.durationHours || selectedPubgDuration;
    selectedPubgTargetKills = pubgChallenge?.targetKills || loadPubgTargetKills();
    pubgTeams = PubgTeam.normalizeTeams(pubgPlayers, loadPubgTeams());
    currentTeams = null;
    manualSelections = { blue: [], red: [] };
    stakeInput.value = String(loadStake());
    renderPlayers();
    renderMoney();
    renderPubgPlayers();
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
renderSoloChallenge();
renderPubgPlayers();
window.setInterval(renderSoloChallenge, 1000);
window.setInterval(() => {
    const phase = pubgChallengePhase();
    if (phase !== lastPubgChallengePhase) {
        lastPubgChallengePhase = phase;
        renderPubgPlayers();
        applyRoomPermissions();
        return;
    }
    renderPubgChallenge();
}, 1000);
window.setInterval(autoSyncPubgRecords, PUBG_AUTO_SYNC_INTERVAL);
restoreActiveRoom();
setupSectionNavigation();

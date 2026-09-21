(() => {
    const ranks = [
        { id: "muzan", name: "무잔", sub: "최상위" },
        ...Array.from({ length: 6 }, (_, index) => ({ id: `upper-${index + 1}`, name: `상현 ${index + 1}`, sub: "상현" })),
        { id: "lower-1", name: "하현 1", sub: "하현" },
        ...["탄지로", "네즈코", "이노스케", "젠이츠"].map((name, index) => ({ id: `bottom-${index}`, name, sub: "동급" }))
    ];
    const emptyState = () => ({ players: [], assignments: {}, history: [], activeDuel: null });
    const $ = (id) => document.getElementById(id);
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
    })[character]);

    let state = emptyState();
    let revision = -1;
    let activeDialogDuel = null;
    let winner = null;
    let saveQueue = Promise.resolve();

    function rankName(id) {
        return ranks.find((rank) => rank.id === id)?.name || "";
    }

    function setSyncStatus(message, status = "saved") {
        $("syncStatus").textContent = message;
        $("syncStatus").dataset.state = status;
    }

    async function request(url, options) {
        const response = await fetch(url, options);
        const payload = await response.json().catch(() => ({}));
        return { response, payload };
    }

    function renderPlayers() {
        $("playerList").innerHTML = state.players.length
            ? state.players.map((player) => `<span class="player-chip">${escapeHtml(player)}<button type="button" data-remove-player="${escapeHtml(player)}" aria-label="${escapeHtml(player)} 삭제">×</button></span>`).join("")
            : "";
        document.querySelectorAll("[data-remove-player]").forEach((button) => {
            button.onclick = () => removePlayer(button.dataset.removePlayer);
        });
    }

    function renderBoard() {
        state.assignments ||= {};
        $("rankBoard").innerHTML = ranks.map((rank, index) => {
            const assigned = state.assignments[rank.id] || "";
            const options = state.players.map((player) => `<option value="${escapeHtml(player)}" ${player === assigned ? "selected" : ""}>${escapeHtml(player)}</option>`).join("");
            return `<div class="rank-row"><div class="rank-no">${String(index + 1).padStart(2, "0")}</div><div class="rank-name"><strong>${rank.name}</strong><small>${rank.sub}</small></div><select data-rank="${rank.id}"><option value="">선수 선택</option>${options}</select></div>`;
        }).join("");
        document.querySelectorAll("[data-rank]").forEach((select) => {
            select.onchange = () => assignPlayer(select.dataset.rank, select.value);
        });
    }

    function duelPairs() {
        return [
            ...Array.from({ length: 7 }, (_, index) => ({ challenger: index + 1, defender: index })),
            ...ranks.slice(8).map((_, index) => ({ challenger: index + 8, defender: 7 }))
        ];
    }

    function renderDuels() {
        const html = duelPairs().map((pair) => {
            const challenger = state.assignments[ranks[pair.challenger].id];
            const defender = state.assignments[ranks[pair.defender].id];
            if (!challenger || !defender) return "";
            return `<article class="duel-card"><div><small>도전자 · ${ranks[pair.challenger].name}</small><strong>${escapeHtml(challenger)}</strong></div><b>VS</b><div><small>방어자 · ${ranks[pair.defender].name}</small><strong>${escapeHtml(defender)}</strong></div><button data-duel="${pair.challenger},${pair.defender}">대결 시작</button></article>`;
        }).join("");
        $("duelList").innerHTML = html || '<div class="empty">두 등급에 모두 선수를 배정하면 교체혈전을 시작할 수 있습니다.</div>';
        document.querySelectorAll("[data-duel]").forEach((button) => {
            button.disabled = Boolean(state.activeDuel);
            button.onclick = () => startDuel(...button.dataset.duel.split(",").map(Number));
        });
    }

    function renderBanner() {
        const banner = $("duelBanner");
        if (!state.activeDuel) {
            banner.hidden = true;
            banner.innerHTML = "";
            return;
        }
        banner.hidden = false;
        banner.innerHTML = `<span>진행 중 · <strong>${escapeHtml(state.activeDuel.challenger)}</strong> VS <strong>${escapeHtml(state.activeDuel.defender)}</strong></span><button id="resumeDuelBtn" type="button">결과 입력</button>`;
        $("resumeDuelBtn").onclick = () => showDuelDialog(state.activeDuel);
    }

    function renderHistory() {
        state.history ||= [];
        $("historyCount").textContent = `총 ${state.history.length}건`;
        $("undoDuelBtn").disabled = state.history.length === 0;
        $("historyList").innerHTML = state.history.length
            ? state.history.map((entry) => `<div class="history"><strong>${escapeHtml(entry.winner)}</strong><span>${escapeHtml(entry.challenger)} vs ${escapeHtml(entry.defender)} · ${escapeHtml(entry.from)} ↔ ${escapeHtml(entry.to)}</span><time>${new Date(entry.at).toLocaleDateString("ko-KR")}</time></div>`).join("")
            : '<div class="empty">아직 기록된 교체혈전이 없습니다.</div>';
    }

    function render() {
        renderPlayers();
        renderBoard();
        renderDuels();
        renderBanner();
        renderHistory();
    }

    async function loadSharedState(silent = false) {
        try {
            const { response, payload } = await request("/api/fifa");
            if (!response.ok) throw new Error(payload.message || "데이터를 불러오지 못했습니다.");
            if (payload.revision !== revision) {
                state = payload.state;
                revision = payload.revision;
                render();
            }
            if (!silent) setSyncStatus("자동 저장됨");
        } catch (error) {
            setSyncStatus("연결 오류", "error");
            if (!silent) $("formMessage").textContent = error.message;
        }
    }

    async function saveMutation(mutator, successMessage = "자동 저장됨") {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            const nextState = clone(state);
            const changed = mutator(nextState);
            if (changed === false) return false;
            setSyncStatus("저장 중", "saving");
            const { response, payload } = await request("/api/fifa", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: nextState, expectedRevision: revision })
            });
            if (response.status === 409 && payload.state) {
                state = payload.state;
                revision = payload.revision;
                render();
                continue;
            }
            if (!response.ok) throw new Error(payload.message || "저장하지 못했습니다.");
            state = payload.state;
            revision = payload.revision;
            render();
            setSyncStatus(successMessage);
            return true;
        }
        throw new Error("다른 변경과 계속 겹쳤습니다. 잠시 후 다시 시도해 주세요.");
    }

    function mutate(mutator, successMessage) {
        saveQueue = saveQueue
            .then(() => saveMutation(mutator, successMessage))
            .catch((error) => {
                setSyncStatus("저장 실패", "error");
                $("formMessage").textContent = error.message;
                return false;
            });
        return saveQueue;
    }

    function addPlayer(name) {
        return mutate((nextState) => {
            if (nextState.players.includes(name)) throw new Error("이미 등록된 선수입니다.");
            if (nextState.players.length >= 12) throw new Error("최대 12명까지 등록할 수 있습니다.");
            nextState.players.push(name);
        });
    }

    function removePlayer(name) {
        return mutate((nextState) => {
            nextState.players = nextState.players.filter((player) => player !== name);
            Object.keys(nextState.assignments).forEach((rankId) => {
                if (nextState.assignments[rankId] === name) delete nextState.assignments[rankId];
            });
            if (nextState.activeDuel && [nextState.activeDuel.challenger, nextState.activeDuel.defender].includes(name)) {
                nextState.activeDuel = null;
            }
        });
    }

    function assignPlayer(rankId, player) {
        return mutate((nextState) => {
            Object.keys(nextState.assignments).forEach((assignedRankId) => {
                if (player && nextState.assignments[assignedRankId] === player) delete nextState.assignments[assignedRankId];
            });
            if (player) nextState.assignments[rankId] = player;
            else delete nextState.assignments[rankId];
            nextState.activeDuel = null;
        });
    }

    async function startDuel(challengerIndex, defenderIndex) {
        const duel = {
            challengerRankId: ranks[challengerIndex].id,
            defenderRankId: ranks[defenderIndex].id,
            challenger: state.assignments[ranks[challengerIndex].id],
            defender: state.assignments[ranks[defenderIndex].id],
            startedAt: new Date().toISOString()
        };
        const saved = await mutate((nextState) => {
            if (nextState.activeDuel) throw new Error("이미 진행 중인 대결이 있습니다.");
            if (nextState.assignments[duel.challengerRankId] !== duel.challenger
                || nextState.assignments[duel.defenderRankId] !== duel.defender) {
                throw new Error("등급표가 변경되었습니다. 최신 대결을 선택해 주세요.");
            }
            nextState.activeDuel = duel;
        });
        if (saved) showDuelDialog(state.activeDuel);
    }

    function showDuelDialog(duel) {
        if (!duel) return;
        activeDialogDuel = clone(duel);
        winner = null;
        $("duelMatchup").innerHTML = `<strong>${escapeHtml(duel.challenger)}</strong><span>VS</span><strong>${escapeHtml(duel.defender)}</strong>`;
        $("gameList").innerHTML = [1, 2, 3].map((game) => `<label>GAME ${game}<select data-game="${game}"><option value="">미정</option><option value="c">${escapeHtml(duel.challenger)} 승</option><option value="d">${escapeHtml(duel.defender)} 승</option></select></label>`).join("");
        $("duelDialog").showModal();
        updateDialog();
    }

    function updateDialog() {
        const results = [...document.querySelectorAll("[data-game]")].map((select) => select.value);
        const challengerWins = results.filter((result) => result === "c").length;
        const defenderWins = results.filter((result) => result === "d").length;
        winner = challengerWins >= 2 ? "c" : defenderWins >= 2 ? "d" : null;
        $("finishDuelBtn").disabled = !winner;
        $("duelMessage").textContent = winner
            ? `${winner === "c" ? activeDialogDuel.challenger : activeDialogDuel.defender} 승리로 확정할 수 있습니다.`
            : "두 경기의 승패를 입력하면 결과를 확정할 수 있습니다.";
    }

    function setQuickWinner(result) {
        [...document.querySelectorAll("[data-game]")].forEach((select, index) => {
            select.value = index < 2 ? result : "";
        });
        updateDialog();
    }

    async function finishDuel() {
        if (!winner || !activeDialogDuel) return;
        const duel = clone(activeDialogDuel);
        const selectedWinner = winner;
        const saved = await mutate((nextState) => {
            const current = nextState.activeDuel;
            if (!current || current.startedAt !== duel.startedAt) throw new Error("이 대결은 이미 변경되거나 취소되었습니다.");
            const swapped = selectedWinner === "c";
            if (swapped) {
                nextState.assignments[duel.challengerRankId] = duel.defender;
                nextState.assignments[duel.defenderRankId] = duel.challenger;
            }
            nextState.history.unshift({
                challenger: duel.challenger,
                defender: duel.defender,
                winner: selectedWinner === "c" ? duel.challenger : duel.defender,
                challengerRankId: duel.challengerRankId,
                defenderRankId: duel.defenderRankId,
                from: rankName(duel.defenderRankId),
                to: rankName(duel.challengerRankId),
                at: new Date().toISOString(),
                swapped
            });
            nextState.activeDuel = null;
        }, "경기 결과 저장됨");
        if (saved) {
            $("duelDialog").close();
            activeDialogDuel = null;
        }
    }

    async function cancelDuel() {
        const saved = await mutate((nextState) => {
            nextState.activeDuel = null;
        }, "대결 취소됨");
        if (saved) {
            $("duelDialog").close();
            activeDialogDuel = null;
        }
    }

    function undoLatestDuel() {
        return mutate((nextState) => {
            const latest = nextState.history[0];
            if (!latest) return false;
            if (latest.swapped) {
                const challengerPosition = nextState.assignments[latest.defenderRankId];
                const defenderPosition = nextState.assignments[latest.challengerRankId];
                if (challengerPosition !== latest.challenger || defenderPosition !== latest.defender) {
                    throw new Error("경기 후 등급표가 바뀌어 자동으로 취소할 수 없습니다.");
                }
                nextState.assignments[latest.challengerRankId] = latest.challenger;
                nextState.assignments[latest.defenderRankId] = latest.defender;
            }
            nextState.history.shift();
        }, "마지막 경기 취소됨");
    }

    $("playerForm").onsubmit = async (event) => {
        event.preventDefault();
        const name = $("playerName").value.trim();
        if (!name) return;
        $("formMessage").textContent = "";
        const saved = await addPlayer(name);
        if (saved) {
            $("playerName").value = "";
            $("formMessage").textContent = "선수가 추가되었습니다.";
        }
    };
    $("resetFifaBtn").onclick = () => {
        if (!confirm("공용 피파 등급표와 기록을 모두 초기화할까요?")) return;
        mutate((nextState) => {
            Object.assign(nextState, emptyState());
        }, "전체 기록 초기화됨");
    };
    $("undoDuelBtn").onclick = () => undoLatestDuel();
    $("closeDialog").onclick = () => {
        $("duelDialog").close();
        activeDialogDuel = null;
    };
    $("gameList").onchange = updateDialog;
    $("challengerWinBtn").onclick = () => setQuickWinner("c");
    $("defenderWinBtn").onclick = () => setQuickWinner("d");
    $("cancelDuelBtn").onclick = () => cancelDuel();
    $("finishDuelBtn").onclick = () => finishDuel();

    loadSharedState();
    setInterval(() => {
        if (!document.hidden) loadSharedState(true);
    }, 3000);
    window.addEventListener("focus", () => loadSharedState(true));
})();

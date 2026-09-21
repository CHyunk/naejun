const fs = require("node:fs");
const path = require("node:path");

const MAX_STATE_BYTES = 96 * 1024;
const MAX_PLAYERS = 12;
const MAX_HISTORY = 500;
const RANK_IDS = [
    "muzan",
    "upper-1",
    "upper-2",
    "upper-3",
    "upper-4",
    "upper-5",
    "upper-6",
    "lower-1",
    "bottom-0",
    "bottom-1",
    "bottom-2",
    "bottom-3"
];

function emptyFifaState() {
    return {
        players: [],
        assignments: {},
        history: [],
        activeDuel: null
    };
}

function cleanText(value, maximumLength = 48) {
    return typeof value === "string"
        ? value.trim().slice(0, maximumLength)
        : "";
}

function normalizeHistoryEntry(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const challenger = cleanText(value.challenger, 24);
    const defender = cleanText(value.defender, 24);
    const winner = cleanText(value.winner, 24);
    const challengerRankId = cleanText(value.challengerRankId, 24);
    const defenderRankId = cleanText(value.defenderRankId, 24);
    const from = cleanText(value.from, 24);
    const to = cleanText(value.to, 24);
    const at = Date.parse(value.at);

    if (!challenger
        || !defender
        || ![challenger, defender].includes(winner)
        || !RANK_IDS.includes(challengerRankId)
        || !RANK_IDS.includes(defenderRankId)
        || !from
        || !to
        || !Number.isFinite(at)) {
        return null;
    }

    return {
        challenger,
        defender,
        winner,
        challengerRankId,
        defenderRankId,
        from,
        to,
        at: new Date(at).toISOString(),
        swapped: Boolean(value.swapped)
    };
}

function normalizeActiveDuel(value, assignments) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const challengerRankId = cleanText(value.challengerRankId, 24);
    const defenderRankId = cleanText(value.defenderRankId, 24);
    const challenger = cleanText(value.challenger, 24);
    const defender = cleanText(value.defender, 24);
    const startedAt = Date.parse(value.startedAt);

    if (!RANK_IDS.includes(challengerRankId)
        || !RANK_IDS.includes(defenderRankId)
        || assignments[challengerRankId] !== challenger
        || assignments[defenderRankId] !== defender
        || !Number.isFinite(startedAt)) {
        return null;
    }

    return {
        challengerRankId,
        defenderRankId,
        challenger,
        defender,
        startedAt: new Date(startedAt).toISOString()
    };
}

function normalizeFifaState(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const players = Array.isArray(value.players)
        ? Array.from(new Set(value.players.map((player) => cleanText(player, 24)).filter(Boolean))).slice(0, MAX_PLAYERS)
        : [];
    const playerSet = new Set(players);
    const usedPlayers = new Set();
    const sourceAssignments = value.assignments && typeof value.assignments === "object" && !Array.isArray(value.assignments)
        ? value.assignments
        : {};
    const assignments = {};

    RANK_IDS.forEach((rankId) => {
        const player = cleanText(sourceAssignments[rankId], 24);
        if (playerSet.has(player) && !usedPlayers.has(player)) {
            assignments[rankId] = player;
            usedPlayers.add(player);
        }
    });

    const history = Array.isArray(value.history)
        ? value.history.map(normalizeHistoryEntry).filter(Boolean).slice(0, MAX_HISTORY)
        : [];
    const activeDuel = normalizeActiveDuel(value.activeDuel, assignments);
    const state = { players, assignments, history, activeDuel };
    const serialized = JSON.stringify(state);

    return Buffer.byteLength(serialized, "utf8") <= MAX_STATE_BYTES
        ? JSON.parse(serialized)
        : null;
}

function publicFifa(record) {
    return {
        state: JSON.parse(JSON.stringify(record.state)),
        revision: record.revision,
        updatedAt: new Date(record.updatedAt).toISOString()
    };
}

class FifaStore {
    constructor(options = {}) {
        this.filePath = options.filePath || null;
        this.record = {
            state: emptyFifaState(),
            revision: 0,
            updatedAt: Date.now()
        };
        this.load();
    }

    load() {
        if (!this.filePath || !fs.existsSync(this.filePath)) {
            return;
        }

        try {
            const saved = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
            const state = normalizeFifaState(saved.state);
            if (state) {
                this.record = {
                    state,
                    revision: Number.isSafeInteger(saved.revision) && saved.revision >= 0 ? saved.revision : 0,
                    updatedAt: Number.isFinite(Date.parse(saved.updatedAt)) ? Date.parse(saved.updatedAt) : Date.now()
                };
            }
        } catch (error) {
            console.error("피파 저장 데이터를 읽지 못했습니다.", error);
        }
    }

    persist() {
        if (!this.filePath) {
            return;
        }

        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
        fs.writeFileSync(temporaryPath, JSON.stringify(publicFifa(this.record), null, 2), "utf8");
        fs.renameSync(temporaryPath, this.filePath);
    }

    get() {
        return { status: 200, fifa: publicFifa(this.record) };
    }

    update(state, expectedRevision) {
        if (!Number.isSafeInteger(expectedRevision) || expectedRevision !== this.record.revision) {
            return {
                status: 409,
                message: "다른 변경이 먼저 저장되었습니다. 최신 상태로 다시 시도해 주세요.",
                fifa: publicFifa(this.record)
            };
        }

        const normalizedState = normalizeFifaState(state);
        if (!normalizedState) {
            return { status: 400, message: "피파 데이터가 올바르지 않습니다." };
        }

        const previousRecord = this.record;
        this.record = {
            state: normalizedState,
            revision: previousRecord.revision + 1,
            updatedAt: Date.now()
        };

        try {
            this.persist();
        } catch (error) {
            this.record = previousRecord;
            console.error("피파 데이터를 저장하지 못했습니다.", error);
            return { status: 500, message: "피파 데이터를 저장하지 못했습니다." };
        }

        return { status: 200, fifa: publicFifa(this.record) };
    }
}

module.exports = {
    FifaStore,
    RANK_IDS,
    emptyFifaState,
    normalizeFifaState
};

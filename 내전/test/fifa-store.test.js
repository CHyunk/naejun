const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { FifaStore, normalizeFifaState } = require("../fifa-store");

test("normalizes players and prevents duplicate rank assignments", () => {
    const state = normalizeFifaState({
        players: [" 나 ", "나", "너"],
        assignments: {
            muzan: "나",
            "upper-1": "나",
            "upper-2": "너",
            unknown: "너"
        },
        history: []
    });

    assert.deepEqual(state.players, ["나", "너"]);
    assert.deepEqual(state.assignments, { muzan: "나", "upper-2": "너" });
    assert.equal(state.activeDuel, null);
});

test("uses revisions to prevent stale public writes", () => {
    const store = new FifaStore();
    const first = store.update({ players: ["나"], assignments: {}, history: [], activeDuel: null }, 0);
    const stale = store.update({ players: ["너"], assignments: {}, history: [], activeDuel: null }, 0);

    assert.equal(first.status, 200);
    assert.equal(first.fifa.revision, 1);
    assert.equal(stale.status, 409);
    assert.deepEqual(stale.fifa.state.players, ["나"]);
});

test("persists the shared FIFA state across store instances", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "naejun-fifa-"));
    const filePath = path.join(directory, "fifa.json");
    const firstStore = new FifaStore({ filePath });
    const updated = firstStore.update({ players: ["학교짱"], assignments: { muzan: "학교짱" }, history: [], activeDuel: null }, 0);
    const secondStore = new FifaStore({ filePath });

    assert.equal(updated.status, 200);
    assert.deepEqual(secondStore.get().fifa.state, updated.fifa.state);
    assert.equal(secondStore.get().fifa.revision, 1);

    fs.rmSync(directory, { recursive: true, force: true });
});

test("keeps a valid active duel and result metadata", () => {
    const now = new Date().toISOString();
    const state = normalizeFifaState({
        players: ["도전자", "방어자"],
        assignments: { muzan: "방어자", "upper-1": "도전자" },
        activeDuel: {
            challengerRankId: "upper-1",
            defenderRankId: "muzan",
            challenger: "도전자",
            defender: "방어자",
            startedAt: now
        },
        history: [{
            challenger: "도전자",
            defender: "방어자",
            winner: "도전자",
            challengerRankId: "upper-1",
            defenderRankId: "muzan",
            from: "무잔",
            to: "상현 1",
            at: now,
            swapped: true
        }]
    });

    assert.equal(state.activeDuel.challenger, "도전자");
    assert.equal(state.history[0].swapped, true);
});

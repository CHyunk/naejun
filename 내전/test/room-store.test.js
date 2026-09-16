const test = require("node:test");
const assert = require("node:assert/strict");
const { RoomStore, normalizeRoomState } = require("../room-store");

const initialState = {
    players: [{ puuid: "one", riotId: "나#KR1" }],
    matches: [],
    soloRecords: {},
    soloChallenge: null,
    pubgPlayers: [],
    pubgChallenge: null,
    currentTeams: null,
    stake: 1000
};

test("creates a room with a share code and private host token", () => {
    const store = new RoomStore();
    const created = store.create(initialState);

    assert.equal(created.status, 201);
    assert.match(created.room.code, /^[A-HJ-NP-Z2-9]{6}$/);
    assert.ok(created.hostToken.length >= 24);
    assert.deepEqual(store.get(created.room.code.toLowerCase()).room.state, initialState);
});

test("only the host can update a room and revisions prevent stale writes", () => {
    const store = new RoomStore();
    const created = store.create(initialState);
    const forbidden = store.update(created.room.code, "wrong-token", initialState, 1);
    const updatedState = { ...initialState, stake: 2000 };
    const updated = store.update(created.room.code, created.hostToken, updatedState, 1);
    const stale = store.update(created.room.code, created.hostToken, initialState, 1);

    assert.equal(forbidden.status, 403);
    assert.equal(updated.status, 200);
    assert.equal(updated.room.revision, 2);
    assert.equal(updated.room.state.stake, 2000);
    assert.equal(stale.status, 409);
    assert.equal(stale.room.revision, 2);
});

test("normalizes shared state and rejects oversized payloads", () => {
    const normalized = normalizeRoomState({ players: Array.from({ length: 12 }, (_, id) => ({ id })) });
    const oversized = normalizeRoomState({ soloRecords: { value: "x".repeat(100 * 1024) } });

    assert.equal(normalized.players.length, 10);
    assert.equal(normalized.stake, 1000);
    assert.equal(normalized.soloChallenge, null);
    assert.deepEqual(normalized.pubgPlayers, []);
    assert.equal(normalized.pubgChallenge, null);
    assert.equal(oversized, null);
});

test("keeps a valid solo challenge timer in shared room state", () => {
    const startedAt = 1_700_000_000_000;
    const normalized = normalizeRoomState({
        soloChallenge: {
            durationHours: 8,
            startedAt,
            endsAt: startedAt + 8 * 60 * 60 * 1000,
            endedManually: false
        }
    });

    assert.deepEqual(normalized.soloChallenge, {
        durationHours: 8,
        startedAt,
        endsAt: startedAt + 8 * 60 * 60 * 1000,
        endedManually: false
    });
});

test("keeps PUBG kill records and challenge time in shared room state", () => {
    const store = new RoomStore();
    const startedAt = Date.now();
    const state = {
        ...initialState,
        pubgPlayers: [{
            accountId: "account.steam.player",
            playerName: "SchoolPlayer",
            totalKills: 7,
            games: 3,
            seenMatchIds: ["match-1"]
        }],
        pubgChallenge: {
            durationHours: 24,
            startedAt,
            endsAt: startedAt + 24 * 60 * 60 * 1000,
            endedManually: false
        }
    };

    const created = store.create(state);

    assert.equal(created.room.state.pubgPlayers[0].totalKills, 7);
    assert.equal(created.room.state.pubgChallenge.durationHours, 24);
});

test("accepts up to 100 hours and rejects longer solo challenges", () => {
    const startedAt = 1_700_000_000_000;
    const maximum = normalizeRoomState({
        soloChallenge: {
            durationHours: 100,
            startedAt,
            endsAt: startedAt + 100 * 60 * 60 * 1000
        }
    });
    const tooLong = normalizeRoomState({
        soloChallenge: {
            durationHours: 101,
            startedAt,
            endsAt: startedAt + 101 * 60 * 60 * 1000
        }
    });

    assert.equal(maximum.soloChallenge.durationHours, 100);
    assert.equal(tooLong.soloChallenge, null);
});

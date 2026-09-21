const test = require("node:test");
const assert = require("node:assert/strict");
const Roster = require("../public/roster");

const player = (id) => ({ puuid: id, riotId: `${id}#KR1` });

test("keeps active and waiting players unique and bounded", () => {
    const active = Array.from({ length: 12 }, (_, index) => player(`a${index}`));
    const waiting = [player("a0"), ...Array.from({ length: 12 }, (_, index) => player(`w${index}`))];
    const roster = Roster.normalizeRoster(active, waiting);

    assert.equal(roster.players.length, 10);
    assert.equal(roster.waitingPlayers.length, 10);
    assert.equal(roster.waitingPlayers[0].puuid, "w0");
});

test("moves players between active and waiting without removing their record", () => {
    const alpha = player("a");
    const bravo = player("b");
    const waiting = Roster.moveToWaiting([alpha, bravo], [], "a");
    const active = Roster.moveToActive(waiting.players, waiting.waitingPlayers, "a");

    assert.deepEqual(waiting.players, [bravo]);
    assert.deepEqual(waiting.waitingPlayers, [alpha]);
    assert.deepEqual(active.players, [bravo, alpha]);
    assert.deepEqual(active.waitingPlayers, []);
});

test("swaps a waiting player into a full team in one step", () => {
    const active = Array.from({ length: 10 }, (_, index) => player(`a${index}`));
    const waiting = [player("w")];
    const swapped = Roster.swap(active, waiting, "a2", "w");

    assert.equal(swapped.players.length, 10);
    assert.equal(swapped.players[2].puuid, "w");
    assert.equal(swapped.waitingPlayers[0].puuid, "a2");
    assert.equal(Roster.moveToActive(active, waiting, "w"), null);
});

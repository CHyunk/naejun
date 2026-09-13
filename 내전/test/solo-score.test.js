const test = require("node:test");
const assert = require("node:assert/strict");
const { applyMatches } = require("../public/solo-score");

test("adds one point for a win and subtracts one for a loss", () => {
    const result = applyMatches(null, [
        { matchId: "KR_1", win: true },
        { matchId: "KR_2", win: false },
        { matchId: "KR_3", win: true }
    ]);

    assert.equal(result.wins, 2);
    assert.equal(result.losses, 1);
    assert.equal(result.score, 1);
    assert.equal(result.addedWins, 2);
    assert.equal(result.addedLosses, 1);
});

test("does not count the same match twice", () => {
    const previous = {
        wins: 1,
        losses: 0,
        score: 1,
        seenMatchIds: ["KR_1"]
    };
    const result = applyMatches(previous, [
        { matchId: "KR_1", win: true },
        { matchId: "KR_2", win: false }
    ]);

    assert.equal(result.wins, 1);
    assert.equal(result.losses, 1);
    assert.equal(result.score, 0);
    assert.equal(result.addedWins, 0);
    assert.equal(result.addedLosses, 1);
    assert.deepEqual(result.seenMatchIds, ["KR_2", "KR_1"]);
});

test("ignores malformed match results", () => {
    const result = applyMatches(null, [
        { matchId: "KR_1" },
        { matchId: 2, win: true },
        null
    ]);

    assert.equal(result.score, 0);
    assert.deepEqual(result.seenMatchIds, []);
});

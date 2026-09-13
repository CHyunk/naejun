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

test("voids a match played with the same champion as the previous game", () => {
    const result = applyMatches(null, [
        { matchId: "KR_3", win: false, championName: "Ahri", gameEndTimestamp: 300 },
        { matchId: "KR_2", win: true, championName: "Ahri", gameEndTimestamp: 200 },
        { matchId: "KR_1", win: true, championName: "Garen", gameEndTimestamp: 100 }
    ]);

    assert.equal(result.wins, 2);
    assert.equal(result.losses, 0);
    assert.equal(result.score, 2);
    assert.equal(result.voids, 1);
    assert.equal(result.addedVoids, 1);
    assert.equal(result.recentMatches[0].voided, true);
    assert.deepEqual(result.voidedMatchIds, ["KR_3"]);
});

test("voids every repeated game in a same-champion streak", () => {
    const result = applyMatches(null, [
        { matchId: "KR_3", win: true, championName: "Lux", gameEndTimestamp: 300 },
        { matchId: "KR_2", win: false, championName: "Lux", gameEndTimestamp: 200 },
        { matchId: "KR_1", win: true, championName: "Lux", gameEndTimestamp: 100 }
    ]);

    assert.equal(result.wins, 1);
    assert.equal(result.losses, 0);
    assert.equal(result.score, 1);
    assert.equal(result.voids, 2);
    assert.deepEqual(result.voidedMatchIds, ["KR_3", "KR_2"]);
});

test("applies the champion rule across separate syncs", () => {
    const first = applyMatches(null, [
        { matchId: "KR_1", win: true, championName: "Ahri", gameEndTimestamp: 100 }
    ]);
    const second = applyMatches(first, [
        { matchId: "KR_2", win: false, championName: "ahri", gameEndTimestamp: 200 },
        { matchId: "KR_1", win: true, championName: "Ahri", gameEndTimestamp: 100 }
    ]);

    assert.equal(second.wins, 1);
    assert.equal(second.losses, 0);
    assert.equal(second.score, 1);
    assert.equal(second.addedVoids, 1);
    assert.equal(second.recentMatches[0].voided, true);
});

test("uses the latest saved match when migrating an older record", () => {
    const previous = {
        wins: 1,
        losses: 0,
        score: 1,
        seenMatchIds: ["KR_1"],
        recentMatches: [
            { matchId: "KR_1", win: true, championName: "Lux", gameEndTimestamp: 100 }
        ]
    };
    const result = applyMatches(previous, [
        { matchId: "KR_2", win: true, championName: "Lux", gameEndTimestamp: 200 }
    ]);

    assert.equal(result.score, 1);
    assert.equal(result.addedVoids, 1);
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

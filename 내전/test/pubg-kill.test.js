const test = require("node:test");
const assert = require("node:assert/strict");
const { applyMatches, filterMatchesByWindow } = require("../public/pubg-kill");

test("adds PUBG kills once for each completed match", () => {
    const first = applyMatches(null, [
        { matchId: "one", endedAt: 1_000, kills: 3, damage: 410, placement: 2 },
        { matchId: "two", endedAt: 2_000, kills: 5, damage: 620, placement: 1 }
    ]);
    const second = applyMatches(first, [
        { matchId: "two", endedAt: 2_000, kills: 5, damage: 620, placement: 1 },
        { matchId: "three", endedAt: 3_000, kills: 1, damage: 90, placement: 20 }
    ]);

    assert.equal(first.totalKills, 8);
    assert.equal(first.games, 2);
    assert.equal(first.chickens, 1);
    assert.equal(second.totalKills, 9);
    assert.equal(second.addedKills, 1);
    assert.equal(second.games, 3);
});

test("counts only PUBG matches completed inside the challenge window", () => {
    const matches = [
        { matchId: "before", endedAt: 999, kills: 4 },
        { matchId: "start", endedAt: 1_000, kills: 2 },
        { matchId: "inside", endedAt: 3_000, kills: 3 },
        { matchId: "end", endedAt: 5_000, kills: 1 },
        { matchId: "after", endedAt: 5_001, kills: 9 }
    ];

    assert.deepEqual(
        filterMatchesByWindow(matches, 1_000, 5_000).map((match) => match.matchId),
        ["start", "inside", "end"]
    );
});

test("normalizes malformed PUBG kill values without inflating the score", () => {
    const result = applyMatches(null, [
        { matchId: "negative", endedAt: 1_000, kills: -5 },
        { matchId: "decimal", endedAt: 2_000, kills: 2.9 },
        { matchId: "missing-time", kills: 20 }
    ]);

    assert.equal(result.totalKills, 2);
    assert.equal(result.games, 2);
});

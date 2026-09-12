const test = require("node:test");
const assert = require("node:assert/strict");
const { rankedScore } = require("../public/rank-score");

test("uses a compact zero-to-one-thousand rank score scale", () => {
    assert.equal(rankedScore({ tier: "IRON", rank: "IV", leaguePoints: 0 }), 0);
    assert.equal(rankedScore({ tier: "GOLD", rank: "I", leaguePoints: 100 }), 400);
    assert.equal(rankedScore({ tier: "CHALLENGER", rank: "I", leaguePoints: 100 }), 1000);
});

test("scores unranked players at 150 and accepts saved division fields", () => {
    assert.equal(rankedScore(null), 150);
    assert.equal(rankedScore({ tier: "SILVER", division: "II", leaguePoints: 20 }), 255);
});

test("clamps league points to the supported range", () => {
    assert.equal(rankedScore({ tier: "PLATINUM", rank: "IV", leaguePoints: -20 }), 400);
    assert.equal(rankedScore({ tier: "PLATINUM", rank: "IV", leaguePoints: 300 }), 425);
});

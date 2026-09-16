const test = require("node:test");
const assert = require("node:assert/strict");
const { rankedScore } = require("../public/rank-score");

test("uses a zero-to-two-hundred rank score scale", () => {
    assert.equal(rankedScore({ tier: "IRON", rank: "IV", leaguePoints: 0 }), 0);
    assert.equal(rankedScore({ tier: "GOLD", rank: "I", leaguePoints: 100 }), 80);
    assert.equal(rankedScore({ tier: "CHALLENGER", rank: "I", leaguePoints: 100 }), 200);
});

test("scores unranked players at 30 and accepts saved division fields", () => {
    assert.equal(rankedScore(null), 30);
    assert.equal(rankedScore({ tier: "SILVER", division: "II", leaguePoints: 20 }), 51);
});

test("clamps league points to the supported range", () => {
    assert.equal(rankedScore({ tier: "PLATINUM", rank: "IV", leaguePoints: -20 }), 80);
    assert.equal(rankedScore({ tier: "PLATINUM", rank: "IV", leaguePoints: 300 }), 85);
});

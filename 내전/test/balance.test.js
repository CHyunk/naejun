const test = require("node:test");
const assert = require("node:assert/strict");
const { createBalancedTeams } = require("../public/balance");

function player(id, score) {
    return { puuid: id, riotId: id, score };
}

test("creates equal-sized teams with the smallest possible score difference", () => {
    const players = [
        player("a", 1000),
        player("b", 900),
        player("c", 600),
        player("d", 500)
    ];
    const result = createBalancedTeams(players, () => 0);

    assert.equal(result.blue.length, 2);
    assert.equal(result.red.length, 2);
    assert.equal(result.difference, 0);
    assert.deepEqual(
        [...result.blue, ...result.red].map((member) => member.puuid).sort(),
        ["a", "b", "c", "d"]
    );
});

test("rejects an odd number of players", () => {
    assert.throws(
        () => createBalancedTeams([player("a", 100), player("b", 100), player("c", 100)]),
        /even number/
    );
});

const test = require("node:test");
const assert = require("node:assert/strict");
const {
    normalizeTeams,
    randomizeTeams,
    resolveWinner,
    teamTotals,
    teamsComplete
} = require("../public/pubg-team");

function players(count = 8) {
    return Array.from({ length: count }, (_, index) => ({
        accountId: `player-${index + 1}`,
        playerName: `Player ${index + 1}`,
        totalKills: index + 1
    }));
}

test("creates four slots per team for eight PUBG players and removes duplicates", () => {
    const result = normalizeTeams(players(), {
        blue: ["player-1", "player-2", "player-1", "missing"],
        red: ["player-5", "player-6", "player-7", "player-8"]
    });

    assert.deepEqual(result.blue, ["player-1", "player-2", "", ""]);
    assert.deepEqual(result.red, ["player-5", "player-6", "player-7", "player-8"]);
    assert.equal(teamsComplete(players(), result), false);
});

test("randomly assigns every PUBG player to equal teams once", () => {
    const result = randomizeTeams(players(), () => 0.25);
    const selected = [...result.blue, ...result.red];

    assert.equal(result.blue.length, 4);
    assert.equal(result.red.length, 4);
    assert.equal(new Set(selected).size, 8);
    assert.equal(teamsComplete(players(), result), true);
});

test("calculates total kills for each assigned PUBG team", () => {
    const roster = players(4);
    const totals = teamTotals(roster, {
        blue: ["player-1", "player-4"],
        red: ["player-2", "player-3"]
    });

    assert.deepEqual(totals, { blue: 5, red: 5 });
});

test("declares the first PUBG team to reach the selected kill target", () => {
    const roster = players(4);
    const teams = {
        blue: ["player-1", "player-4"],
        red: ["player-2", "player-3"]
    };

    roster[0].totalKills = 10;
    roster[3].totalKills = 11;

    assert.equal(resolveWinner(roster, teams, 20), "blue");
    assert.equal(resolveWinner(roster, teams, 30), null);
});

test("uses the higher total or a draw when both PUBG teams cross the target together", () => {
    const roster = players(4);
    const teams = {
        blue: ["player-1", "player-4"],
        red: ["player-2", "player-3"]
    };

    roster[0].totalKills = 12;
    roster[3].totalKills = 10;
    roster[1].totalKills = 11;
    roster[2].totalKills = 10;
    assert.equal(resolveWinner(roster, teams, 20), "blue");

    roster[2].totalKills = 11;
    assert.equal(resolveWinner(roster, teams, 20), "draw");
});

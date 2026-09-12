const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateLedger, calculateSettlements } = require("../public/money");

const player = (name) => ({ puuid: name.toLowerCase(), riotId: `${name}#KR1` });

test("records each player's gross winnings, losses, and net balance", () => {
    const blue = [player("Alpha"), player("Bravo")];
    const red = [player("Charlie"), player("Delta")];
    const ledger = calculateLedger([
        { stake: 1000, winner: "blue", blue, red },
        { stake: 500, winner: "red", blue, red }
    ]);

    assert.equal(ledger.length, 4);
    assert.deepEqual(
        ledger.map(({ riotId, wins, losses, won, lost, balance }) => ({ riotId, wins, losses, won, lost, balance })),
        [
            { riotId: "Alpha#KR1", wins: 1, losses: 1, won: 1000, lost: 500, balance: 500 },
            { riotId: "Bravo#KR1", wins: 1, losses: 1, won: 1000, lost: 500, balance: 500 },
            { riotId: "Charlie#KR1", wins: 1, losses: 1, won: 500, lost: 1000, balance: -500 },
            { riotId: "Delta#KR1", wins: 1, losses: 1, won: 500, lost: 1000, balance: -500 }
        ]
    );
    assert.equal(ledger.reduce((sum, entry) => sum + entry.balance, 0), 0);
});

test("creates deterministic payment instructions from net balances", () => {
    const ledger = [
        { puuid: "a", riotId: "Alpha#KR1", balance: 3000 },
        { puuid: "b", riotId: "Bravo#KR1", balance: 1000 },
        { puuid: "c", riotId: "Charlie#KR1", balance: -2500 },
        { puuid: "d", riotId: "Delta#KR1", balance: -1500 },
        { puuid: "e", riotId: "Echo#KR1", balance: 0 }
    ];

    assert.deepEqual(calculateSettlements(ledger), [
        {
            from: { puuid: "c", riotId: "Charlie#KR1" },
            to: { puuid: "a", riotId: "Alpha#KR1" },
            amount: 2500
        },
        {
            from: { puuid: "d", riotId: "Delta#KR1" },
            to: { puuid: "a", riotId: "Alpha#KR1" },
            amount: 500
        },
        {
            from: { puuid: "d", riotId: "Delta#KR1" },
            to: { puuid: "b", riotId: "Bravo#KR1" },
            amount: 1000
        }
    ]);
});

test("ignores malformed matches and returns no transfers for settled balances", () => {
    const ledger = calculateLedger([
        { stake: 0, winner: "blue", blue: [player("Alpha")], red: [player("Bravo")] },
        { stake: 1000, winner: "draw", blue: [player("Alpha")], red: [player("Bravo")] }
    ]);

    assert.deepEqual(ledger, []);
    assert.deepEqual(calculateSettlements([{ riotId: "Alpha#KR1", balance: 0 }]), []);
});

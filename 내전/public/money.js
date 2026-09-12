(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.MatchMoney = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function participantKey(participant) {
        return participant.puuid || `riot:${participant.riotId}`;
    }

    function calculateLedger(matches) {
        const ledger = new Map();

        function applyResult(participant, amount, didWin) {
            if (!participant || !participant.riotId) {
                return;
            }

            const key = participantKey(participant);
            const entry = ledger.get(key) || {
                puuid: participant.puuid || "",
                riotId: participant.riotId,
                wins: 0,
                losses: 0,
                won: 0,
                lost: 0,
                balance: 0
            };

            entry.riotId = participant.riotId;
            entry.wins += didWin ? 1 : 0;
            entry.losses += didWin ? 0 : 1;
            entry.won += didWin ? amount : 0;
            entry.lost += didWin ? 0 : amount;
            entry.balance += didWin ? amount : -amount;
            ledger.set(key, entry);
        }

        for (const match of Array.isArray(matches) ? matches : []) {
            const stake = Number(match && match.stake);
            const blue = Array.isArray(match && match.blue) ? match.blue : [];
            const red = Array.isArray(match && match.red) ? match.red : [];

            if (!Number.isSafeInteger(stake) || stake <= 0 || !["blue", "red"].includes(match.winner)) {
                continue;
            }

            blue.forEach((participant) => applyResult(participant, stake, match.winner === "blue"));
            red.forEach((participant) => applyResult(participant, stake, match.winner === "red"));
        }

        return [...ledger.values()].sort((a, b) => {
            return b.balance - a.balance || a.riotId.localeCompare(b.riotId, "ko");
        });
    }

    function calculateSettlements(ledger) {
        const debtors = ledger
            .filter((entry) => entry.balance < 0)
            .map((entry) => ({ ...entry, remaining: -entry.balance }))
            .sort((a, b) => b.remaining - a.remaining || a.riotId.localeCompare(b.riotId, "ko"));
        const creditors = ledger
            .filter((entry) => entry.balance > 0)
            .map((entry) => ({ ...entry, remaining: entry.balance }))
            .sort((a, b) => b.remaining - a.remaining || a.riotId.localeCompare(b.riotId, "ko"));
        const settlements = [];
        let debtorIndex = 0;
        let creditorIndex = 0;

        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];
            const amount = Math.min(debtor.remaining, creditor.remaining);

            if (amount > 0) {
                settlements.push({
                    from: { puuid: debtor.puuid, riotId: debtor.riotId },
                    to: { puuid: creditor.puuid, riotId: creditor.riotId },
                    amount
                });
            }

            debtor.remaining -= amount;
            creditor.remaining -= amount;

            if (debtor.remaining === 0) {
                debtorIndex += 1;
            }
            if (creditor.remaining === 0) {
                creditorIndex += 1;
            }
        }

        return settlements;
    }

    return { calculateLedger, calculateSettlements };
});

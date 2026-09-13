(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.SoloScore = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function applyMatches(previous, matches) {
        const record = previous || {};
        const seen = new Set(Array.isArray(record.seenMatchIds) ? record.seenMatchIds : []);
        const validMatches = (Array.isArray(matches) ? matches : []).filter((match) => {
            return match && typeof match.matchId === "string" && typeof match.win === "boolean";
        });
        let wins = Number(record.wins) || 0;
        let losses = Number(record.losses) || 0;
        let score = Number(record.score) || 0;
        let addedWins = 0;
        let addedLosses = 0;
        const newIds = [];

        for (const match of validMatches) {
            if (seen.has(match.matchId)) {
                continue;
            }

            seen.add(match.matchId);
            newIds.push(match.matchId);

            if (match.win) {
                wins += 1;
                score += 1;
                addedWins += 1;
            } else {
                losses += 1;
                score -= 1;
                addedLosses += 1;
            }
        }

        return {
            ...record,
            wins,
            losses,
            score,
            addedWins,
            addedLosses,
            seenMatchIds: [...newIds, ...seen].filter((id, index, ids) => ids.indexOf(id) === index).slice(0, 100),
            recentMatches: validMatches.slice(0, 5)
        };
    }

    return { applyMatches };
});

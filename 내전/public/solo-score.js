(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.SoloScore = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function normalizeChampion(championName) {
        return typeof championName === "string" ? championName.trim().toLowerCase() : "";
    }

    function applyMatches(previous, matches) {
        const record = previous || {};
        const previousSeenIds = Array.isArray(record.seenMatchIds) ? record.seenMatchIds : [];
        const previousVoidedIds = Array.isArray(record.voidedMatchIds) ? record.voidedMatchIds : [];
        const seen = new Set(previousSeenIds);
        const voided = new Set(previousVoidedIds);
        const validMatches = (Array.isArray(matches) ? matches : []).filter((match) => {
            return match && typeof match.matchId === "string" && typeof match.win === "boolean";
        });
        const chronologicalMatches = validMatches
            .map((match, index) => ({ match, index }))
            .filter(({ match }) => !seen.has(match.matchId))
            .sort((left, right) => {
                const leftTime = Number(left.match.gameEndTimestamp) || 0;
                const rightTime = Number(right.match.gameEndTimestamp) || 0;

                if (leftTime && rightTime && leftTime !== rightTime) {
                    return leftTime - rightTime;
                }

                return right.index - left.index;
            });
        let wins = Number(record.wins) || 0;
        let losses = Number(record.losses) || 0;
        let score = Number(record.score) || 0;
        let voids = Number(record.voids) || 0;
        let lastChampionName = typeof record.lastChampionName === "string"
            ? record.lastChampionName
            : record.recentMatches?.[0]?.championName || "";
        let addedWins = 0;
        let addedLosses = 0;
        let addedVoids = 0;
        const newIds = [];
        const newVoidedIds = [];

        for (const { match } of chronologicalMatches) {
            seen.add(match.matchId);
            newIds.push(match.matchId);
            const championName = typeof match.championName === "string"
                ? match.championName.trim()
                : "";
            const repeatedChampion = normalizeChampion(championName) &&
                normalizeChampion(championName) === normalizeChampion(lastChampionName);

            if (repeatedChampion) {
                voids += 1;
                addedVoids += 1;
                voided.add(match.matchId);
                newVoidedIds.push(match.matchId);
            } else if (match.win) {
                wins += 1;
                score += 1;
                addedWins += 1;
            } else {
                losses += 1;
                score -= 1;
                addedLosses += 1;
            }

            lastChampionName = championName;
        }

        return {
            ...record,
            wins,
            losses,
            score,
            voids,
            addedWins,
            addedLosses,
            addedVoids,
            lastChampionName,
            seenMatchIds: [
                ...newIds.slice().reverse(),
                ...previousSeenIds.filter((id) => !newIds.includes(id))
            ].slice(0, 100),
            voidedMatchIds: [
                ...newVoidedIds.slice().reverse(),
                ...previousVoidedIds.filter((id) => !newVoidedIds.includes(id))
            ].slice(0, 100),
            recentMatches: validMatches.slice(0, 5).map((match) => ({
                ...match,
                voided: voided.has(match.matchId)
            }))
        };
    }

    return { applyMatches };
});

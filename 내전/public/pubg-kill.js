(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.PubgKill = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function filterMatchesByWindow(matches, startedAt, endsAt) {
        const start = Number(startedAt);
        const end = Number(endsAt);

        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
            return [];
        }

        return (Array.isArray(matches) ? matches : []).filter((match) => {
            const endedAt = Number(match?.endedAt);
            return Number.isFinite(endedAt) && endedAt >= start && endedAt <= end;
        });
    }

    function normalizeMatch(match) {
        if (!match
            || typeof match.matchId !== "string"
            || !match.matchId
            || !Number.isFinite(Number(match.endedAt))) {
            return null;
        }

        return {
            matchId: match.matchId,
            endedAt: Number(match.endedAt),
            kills: Math.max(0, Math.floor(Number(match.kills) || 0)),
            damage: Math.max(0, Math.round(Number(match.damage) || 0)),
            placement: Math.max(0, Math.floor(Number(match.placement) || 0)),
            mapName: typeof match.mapName === "string" ? match.mapName : "",
            gameMode: typeof match.gameMode === "string" ? match.gameMode : ""
        };
    }

    function applyMatches(previous, matches) {
        const record = previous && typeof previous === "object" ? previous : {};
        const previousSeenIds = Array.isArray(record.seenMatchIds) ? record.seenMatchIds : [];
        const seen = new Set(previousSeenIds);
        const incoming = (Array.isArray(matches) ? matches : [])
            .map(normalizeMatch)
            .filter(Boolean)
            .sort((left, right) => left.endedAt - right.endedAt);
        let totalKills = Math.max(0, Math.floor(Number(record.totalKills) || 0));
        let games = Math.max(0, Math.floor(Number(record.games) || 0));
        let chickens = Math.max(0, Math.floor(Number(record.chickens) || 0));
        let addedKills = 0;
        let addedGames = 0;
        const addedMatches = [];

        for (const match of incoming) {
            if (seen.has(match.matchId)) {
                continue;
            }

            seen.add(match.matchId);
            addedMatches.push(match);
            totalKills += match.kills;
            games += 1;
            chickens += match.placement === 1 ? 1 : 0;
            addedKills += match.kills;
            addedGames += 1;
        }

        const recentById = new Map();
        for (const match of [...addedMatches, ...(Array.isArray(record.recentMatches) ? record.recentMatches : [])]) {
            const normalized = normalizeMatch(match);
            if (normalized && !recentById.has(normalized.matchId)) {
                recentById.set(normalized.matchId, normalized);
            }
        }

        return {
            ...record,
            totalKills,
            games,
            chickens,
            addedKills,
            addedGames,
            seenMatchIds: [
                ...addedMatches.slice().reverse().map((match) => match.matchId),
                ...previousSeenIds.filter((id) => !addedMatches.some((match) => match.matchId === id))
            ].slice(0, 64),
            recentMatches: Array.from(recentById.values())
                .sort((left, right) => right.endedAt - left.endedAt)
                .slice(0, 5)
        };
    }

    return { applyMatches, filterMatchesByWindow };
});

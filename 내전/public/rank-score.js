(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.RankScore = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    const TIER_BASE_SCORE = {
        IRON: 0,
        BRONZE: 20,
        SILVER: 40,
        GOLD: 60,
        PLATINUM: 80,
        EMERALD: 100,
        DIAMOND: 120,
        MASTER: 140,
        GRANDMASTER: 160,
        CHALLENGER: 180
    };

    const DIVISION_SCORE = { IV: 0, III: 5, II: 10, I: 15 };

    function rankedScore(entry) {
        if (!entry) {
            return 30;
        }

        const leaguePoints = Math.max(0, Math.min(Number(entry.leaguePoints) || 0, 100));
        return (
            (TIER_BASE_SCORE[entry.tier] || 0) +
            (DIVISION_SCORE[entry.rank || entry.division] || 0) +
            Math.round(leaguePoints / 20)
        );
    }

    return { rankedScore };
});

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
        BRONZE: 100,
        SILVER: 200,
        GOLD: 300,
        PLATINUM: 400,
        EMERALD: 500,
        DIAMOND: 600,
        MASTER: 700,
        GRANDMASTER: 800,
        CHALLENGER: 900
    };

    const DIVISION_SCORE = { IV: 0, III: 25, II: 50, I: 75 };

    function rankedScore(entry) {
        if (!entry) {
            return 150;
        }

        const leaguePoints = Math.max(0, Math.min(Number(entry.leaguePoints) || 0, 100));
        return (
            (TIER_BASE_SCORE[entry.tier] || 0) +
            (DIVISION_SCORE[entry.rank || entry.division] || 0) +
            Math.round(leaguePoints / 4)
        );
    }

    return { rankedScore };
});

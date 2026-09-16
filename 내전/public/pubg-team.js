(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.PubgTeam = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function playerIds(players) {
        const ids = [];
        const seen = new Set();

        for (const player of Array.isArray(players) ? players : []) {
            const accountId = typeof player?.accountId === "string" ? player.accountId : "";
            if (accountId && !seen.has(accountId)) {
                seen.add(accountId);
                ids.push(accountId);
            }
        }

        return ids;
    }

    function normalizeTeams(players, value) {
        const ids = playerIds(players);
        const teamSize = ids.length >= 2 && ids.length % 2 === 0 ? ids.length / 2 : 0;
        const validIds = new Set(ids);
        const used = new Set();
        const source = value && typeof value === "object" ? value : {};

        function normalizeTeam(team) {
            const previous = Array.isArray(source[team]) ? source[team] : [];
            return Array.from({ length: teamSize }, (_, index) => {
                const accountId = previous[index];
                if (typeof accountId !== "string" || !validIds.has(accountId) || used.has(accountId)) {
                    return "";
                }
                used.add(accountId);
                return accountId;
            });
        }

        return {
            blue: normalizeTeam("blue"),
            red: normalizeTeam("red")
        };
    }

    function teamsComplete(players, value) {
        const ids = playerIds(players);
        if (ids.length < 2 || ids.length % 2 !== 0) {
            return false;
        }

        const teams = normalizeTeams(players, value);
        const selected = [...teams.blue, ...teams.red].filter(Boolean);
        return selected.length === ids.length && new Set(selected).size === ids.length;
    }

    function randomizeTeams(players, random = Math.random) {
        const ids = playerIds(players);
        if (ids.length < 2 || ids.length % 2 !== 0) {
            return { blue: [], red: [] };
        }

        for (let index = ids.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * (index + 1));
            [ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]];
        }

        const teamSize = ids.length / 2;
        return {
            blue: ids.slice(0, teamSize),
            red: ids.slice(teamSize)
        };
    }

    function teamTotals(players, value) {
        const teams = normalizeTeams(players, value);
        const killsById = new Map((Array.isArray(players) ? players : []).map((player) => [
            player?.accountId,
            Math.max(0, Math.floor(Number(player?.totalKills) || 0))
        ]));
        const total = (team) => teams[team].reduce((sum, accountId) => sum + (killsById.get(accountId) || 0), 0);

        return { blue: total("blue"), red: total("red") };
    }

    return { normalizeTeams, randomizeTeams, teamTotals, teamsComplete };
});

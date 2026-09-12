(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.TeamBalancer = api;
    }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function combinations(items, size, startIndex = 0, current = [], result = []) {
        if (current.length === size) {
            result.push([...current]);
            return result;
        }

        for (let index = startIndex; index <= items.length - (size - current.length); index += 1) {
            current.push(items[index]);
            combinations(items, size, index + 1, current, result);
            current.pop();
        }

        return result;
    }

    function totalScore(team) {
        return team.reduce((sum, player) => sum + player.score, 0);
    }

    function createBalancedTeams(players, random = Math.random) {
        if (players.length < 2 || players.length % 2 !== 0) {
            throw new Error("An even number of at least two players is required.");
        }

        const teamSize = players.length / 2;
        const firstPlayer = players[0];
        const candidates = combinations(players.slice(1), teamSize - 1)
            .map((members) => [firstPlayer, ...members]);
        let bestDifference = Number.POSITIVE_INFINITY;
        let bestTeams = [];

        for (const blue of candidates) {
            const blueIds = new Set(blue.map((player) => player.puuid));
            const red = players.filter((player) => !blueIds.has(player.puuid));
            const difference = Math.abs(totalScore(blue) - totalScore(red));

            if (difference < bestDifference) {
                bestDifference = difference;
                bestTeams = [{ blue, red }];
            } else if (difference === bestDifference) {
                bestTeams.push({ blue, red });
            }
        }

        const selected = bestTeams[Math.floor(random() * bestTeams.length)];
        return {
            blue: selected.blue,
            red: selected.red,
            blueScore: totalScore(selected.blue),
            redScore: totalScore(selected.red),
            difference: bestDifference
        };
    }

    return { createBalancedTeams };
}));


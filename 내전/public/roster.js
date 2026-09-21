(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.Roster = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    const MAX_ACTIVE = 10;
    const MAX_WAITING = 10;

    function normalizeRoster(active, waiting) {
        const seen = new Set();
        const normalize = (list, maximum) => (Array.isArray(list) ? list : [])
            .filter((player) => {
                if (!player || typeof player.puuid !== "string" || !player.puuid || seen.has(player.puuid)) {
                    return false;
                }
                seen.add(player.puuid);
                return true;
            })
            .slice(0, maximum);

        return {
            players: normalize(active, MAX_ACTIVE),
            waitingPlayers: normalize(waiting, MAX_WAITING)
        };
    }

    function moveToWaiting(players, waitingPlayers, puuid) {
        const index = players.findIndex((player) => player.puuid === puuid);
        if (index < 0 || waitingPlayers.length >= MAX_WAITING) {
            return null;
        }
        return {
            players: players.filter((player) => player.puuid !== puuid),
            waitingPlayers: [...waitingPlayers, players[index]]
        };
    }

    function moveToActive(players, waitingPlayers, puuid) {
        const index = waitingPlayers.findIndex((player) => player.puuid === puuid);
        if (index < 0 || players.length >= MAX_ACTIVE) {
            return null;
        }
        return {
            players: [...players, waitingPlayers[index]],
            waitingPlayers: waitingPlayers.filter((player) => player.puuid !== puuid)
        };
    }

    function swap(players, waitingPlayers, activePuuid, waitingPuuid) {
        const activeIndex = players.findIndex((player) => player.puuid === activePuuid);
        const waitingIndex = waitingPlayers.findIndex((player) => player.puuid === waitingPuuid);
        if (activeIndex < 0 || waitingIndex < 0) {
            return null;
        }
        const nextPlayers = players.slice();
        const nextWaiting = waitingPlayers.slice();
        [nextPlayers[activeIndex], nextWaiting[waitingIndex]] = [nextWaiting[waitingIndex], nextPlayers[activeIndex]];
        return { players: nextPlayers, waitingPlayers: nextWaiting };
    }

    return { MAX_ACTIVE, MAX_WAITING, normalizeRoster, moveToWaiting, moveToActive, swap };
});

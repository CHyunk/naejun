require("dotenv").config({ quiet: true });

const path = require("node:path");
const express = require("express");
const { rankedScore } = require("./public/rank-score");
const { RoomStore } = require("./room-store");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_PLATFORM = (process.env.RIOT_PLATFORM || "kr").toLowerCase();
const RIOT_REGION = (process.env.RIOT_REGION || "asia").toLowerCase();
const PUBG_API_KEY = process.env.PUBG_API_KEY;
const roomStore = new RoomStore();
const pubgMatchCache = new Map();

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/rooms", function (req, res) {
    const result = roomStore.create(req.body?.state);

    if (!result.room) {
        return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json({ ...result.room, hostToken: result.hostToken });
});

app.get("/api/rooms/:code", function (req, res) {
    const result = roomStore.get(req.params.code);

    return result.room
        ? res.json(result.room)
        : res.status(result.status).json({ message: result.message });
});

app.put("/api/rooms/:code", function (req, res) {
    const authorization = req.get("authorization") || "";
    const hostToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const result = roomStore.update(
        req.params.code,
        hostToken,
        req.body?.state,
        req.body?.expectedRevision
    );

    if (!result.room || result.status === 403 || result.status === 400) {
        return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json({ ...result.room, message: result.message });
});

async function riotFetch(url) {
    const response = await fetch(url, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    if (response.ok) {
        return response.json();
    }

    const error = new Error(`Riot API request failed: ${response.status}`);
    error.status = response.status;
    throw error;
}

async function pubgFetch(url, requiresAuthorization = true) {
    const headers = { Accept: "application/vnd.api+json" };
    if (requiresAuthorization) {
        headers.Authorization = `Bearer ${PUBG_API_KEY}`;
    }

    const response = await fetch(url, { headers });
    if (response.ok) {
        return response.json();
    }

    const error = new Error(`PUBG API request failed: ${response.status}`);
    error.status = response.status;
    throw error;
}

function pubgErrorResponse(error, res) {
    if (error.status === 404) {
        return res.status(404).json({ message: "Steam PUBG 플레이어 또는 경기를 찾지 못했습니다." });
    }
    if (error.status === 401 || error.status === 403) {
        return res.status(502).json({ message: "PUBG API 키가 없거나 만료되었습니다." });
    }
    if (error.status === 429) {
        return res.status(503).json({ message: "PUBG API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요." });
    }

    return res.status(502).json({ message: "PUBG API와 통신하지 못했습니다." });
}

function validPubgWindow(startedAt, endsAt) {
    return Number.isFinite(startedAt)
        && Number.isFinite(endsAt)
        && startedAt > 0
        && endsAt > startedAt
        && endsAt - startedAt <= 100 * 60 * 60 * 1000;
}

function parsePubgMatch(match, accountId) {
    const participant = Array.isArray(match?.included)
        ? match.included.find((entry) => {
            return entry?.type === "participant"
                && entry.attributes?.stats?.playerId === accountId;
        })
        : null;
    const attributes = match?.data?.attributes || {};
    const startedAt = Date.parse(attributes.createdAt);
    const durationSeconds = Number(attributes.duration) || 0;

    if (!participant || !Number.isFinite(startedAt) || !durationSeconds) {
        return null;
    }

    const stats = participant.attributes.stats || {};
    return {
        matchId: String(match.data.id || ""),
        endedAt: startedAt + durationSeconds * 1000,
        kills: Math.max(0, Math.floor(Number(stats.kills) || 0)),
        damage: Math.max(0, Math.round(Number(stats.damageDealt) || 0)),
        placement: Math.max(0, Math.floor(Number(stats.winPlace) || 0)),
        mapName: typeof attributes.mapName === "string" ? attributes.mapName : "",
        gameMode: typeof attributes.gameMode === "string" ? attributes.gameMode : ""
    };
}

async function loadPubgMatches(matchIds) {
    const uniqueIds = Array.from(new Set(matchIds.filter(Boolean)));
    const matches = new Map();
    const missing = [];

    for (const matchId of uniqueIds) {
        if (pubgMatchCache.has(matchId)) {
            matches.set(matchId, pubgMatchCache.get(matchId));
        } else {
            missing.push(matchId);
        }
    }

    for (let index = 0; index < missing.length; index += 8) {
        const batch = missing.slice(index, index + 8);
        const loaded = await Promise.all(batch.map((matchId) => {
            return pubgFetch(`https://api.pubg.com/shards/steam/matches/${encodeURIComponent(matchId)}`, false);
        }));

        loaded.forEach((match, matchIndex) => {
            const matchId = batch[matchIndex];
            pubgMatchCache.set(matchId, match);
            matches.set(matchId, match);
        });
    }

    if (pubgMatchCache.size > 512) {
        const oldestIds = Array.from(pubgMatchCache.keys()).slice(0, pubgMatchCache.size - 512);
        oldestIds.forEach((matchId) => pubgMatchCache.delete(matchId));
    }

    return matches;
}

function riotErrorResponse(error, res) {
    if (error.status === 404) {
        return res.status(404).json({ message: "Riot 계정을 찾지 못했습니다." });
    }

    if (error.status === 401 || error.status === 403) {
        return res.status(502).json({ message: "Riot API 키가 없거나 만료되었습니다." });
    }

    if (error.status === 429) {
        return res.status(503).json({ message: "Riot API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." });
    }

    console.error(error);
    return res.status(502).json({ message: "Riot API와 통신하지 못했습니다." });
}

app.post("/api/player", async function (req, res) {
    const body = req.body || {};
    const gameName = typeof body.gameName === "string" ? body.gameName.trim() : "";
    const tagLine = typeof body.tagLine === "string" ? body.tagLine.trim() : "";

    if (!gameName || !tagLine || gameName.includes("#")) {
        return res.status(400).json({ message: "올바른 게임 닉네임과 태그를 입력해주세요." });
    }

    if (!RIOT_API_KEY) {
        return res.status(503).json({ message: "서버에 RIOT_API_KEY가 설정되지 않았습니다." });
    }

    try {
        const accountUrl =
            `https://${RIOT_REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
            `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        const account = await riotFetch(accountUrl);

        const summonerUrl =
            `https://${RIOT_PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/` +
            encodeURIComponent(account.puuid);
        const summoner = await riotFetch(summonerUrl);

        const leagueUrl =
            `https://${RIOT_PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-summoner/` +
            encodeURIComponent(summoner.id);
        const leagueEntries = await riotFetch(leagueUrl);
        const soloRank = leagueEntries.find((entry) => entry.queueType === "RANKED_SOLO_5x5") || null;

        return res.json({
            gameName: account.gameName,
            tagLine: account.tagLine,
            riotId: `${account.gameName}#${account.tagLine}`,
            puuid: account.puuid,
            profileIconId: summoner.profileIconId,
            rank: soloRank
                ? {
                    tier: soloRank.tier,
                    division: soloRank.rank,
                    leaguePoints: soloRank.leaguePoints,
                    wins: soloRank.wins,
                    losses: soloRank.losses,
                    label: `${soloRank.tier} ${soloRank.rank} ${soloRank.leaguePoints}LP`
                }
                : null,
            score: rankedScore(soloRank)
        });
    } catch (error) {
        return riotErrorResponse(error, res);
    }
});

app.post("/api/solo-record", async function (req, res) {
    const puuid = typeof req.body?.puuid === "string" ? req.body.puuid.trim() : "";
    const startedAt = Number(req.body?.startedAt);
    const endsAt = Number(req.body?.endsAt);
    const hasChallengeWindow = Number.isFinite(startedAt)
        && Number.isFinite(endsAt)
        && startedAt > 0
        && endsAt > startedAt
        && endsAt - startedAt <= 100 * 60 * 60 * 1000;

    if (!puuid || puuid.length > 128) {
        return res.status(400).json({ message: "올바른 플레이어 정보가 필요합니다." });
    }

    if (!RIOT_API_KEY) {
        return res.status(503).json({ message: "서버에 RIOT_API_KEY가 설정되지 않았습니다." });
    }

    try {
        const queryEndsAt = Math.min(endsAt, Date.now());
        const challengeQuery = hasChallengeWindow
            ? `&startTime=${Math.floor(startedAt / 1000)}&endTime=${Math.ceil(queryEndsAt / 1000)}`
            : "";
        const matchIdsUrl =
            `https://${RIOT_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/` +
            `${encodeURIComponent(puuid)}/ids?queue=420&start=0&count=20${challengeQuery}`;
        const matchIds = await riotFetch(matchIdsUrl);
        const details = await Promise.all(
            matchIds.map((matchId) => {
                const matchUrl =
                    `https://${RIOT_REGION}.api.riotgames.com/lol/match/v5/matches/` +
                    encodeURIComponent(matchId);
                return riotFetch(matchUrl);
            })
        );
        const matches = details.flatMap((match, index) => {
            const participant = match.info?.participants?.find((entry) => entry.puuid === puuid);

            if (!participant || match.info?.queueId !== 420) {
                return [];
            }

            return [{
                matchId: match.metadata?.matchId || matchIds[index],
                win: Boolean(participant.win),
                championName: participant.championName || "",
                kills: Number(participant.kills) || 0,
                deaths: Number(participant.deaths) || 0,
                assists: Number(participant.assists) || 0,
                gameEndTimestamp: Number(match.info.gameEndTimestamp || match.info.gameCreation) || 0
            }];
        });

        return res.json({ matches });
    } catch (error) {
        return riotErrorResponse(error, res);
    }
});

app.post("/api/pubg-player", async function (req, res) {
    const playerName = typeof req.body?.playerName === "string" ? req.body.playerName.trim() : "";

    if (playerName.length < 2 || playerName.length > 32) {
        return res.status(400).json({ message: "올바른 Steam PUBG 닉네임을 입력해 주세요." });
    }
    if (!PUBG_API_KEY) {
        return res.status(503).json({ message: "서버에 PUBG_API_KEY가 설정되지 않았습니다." });
    }

    try {
        const url = new URL("https://api.pubg.com/shards/steam/players");
        url.searchParams.set("filter[playerNames]", playerName);
        const payload = await pubgFetch(url.toString());
        const player = Array.isArray(payload.data) ? payload.data[0] : null;

        if (!player?.id) {
            return res.status(404).json({ message: "해당 Steam PUBG 플레이어를 찾지 못했습니다." });
        }

        return res.json({
            accountId: player.id,
            playerName: player.attributes?.name || playerName,
            platform: "steam"
        });
    } catch (error) {
        return pubgErrorResponse(error, res);
    }
});

app.post("/api/pubg-records", async function (req, res) {
    const players = Array.isArray(req.body?.players)
        ? req.body.players
            .filter((player) => player && typeof player.accountId === "string")
            .map((player) => ({ accountId: player.accountId.trim() }))
            .filter((player) => player.accountId.length > 0 && player.accountId.length <= 128)
            .slice(0, 10)
        : [];
    const startedAt = Number(req.body?.startedAt);
    const endsAt = Number(req.body?.endsAt);

    if (!players.length || !validPubgWindow(startedAt, endsAt)) {
        return res.status(400).json({ message: "플레이어와 올바른 킬내기 시간이 필요합니다." });
    }
    if (!PUBG_API_KEY) {
        return res.status(503).json({ message: "서버에 PUBG_API_KEY가 설정되지 않았습니다." });
    }

    try {
        const accountIds = Array.from(new Set(players.map((player) => player.accountId)));
        const url = new URL("https://api.pubg.com/shards/steam/players");
        url.searchParams.set("filter[playerIds]", accountIds.join(","));
        const payload = await pubgFetch(url.toString());
        const playerData = Array.isArray(payload.data) ? payload.data : [];
        const matchIdsByPlayer = new Map();

        playerData.forEach((player) => {
            const matchIds = Array.isArray(player.relationships?.matches?.data)
                ? player.relationships.matches.data.slice(0, 32).map((match) => match.id)
                : [];
            matchIdsByPlayer.set(player.id, matchIds);
        });

        const allMatchIds = Array.from(matchIdsByPlayer.values()).flat();
        const matchesById = await loadPubgMatches(allMatchIds);
        const boundedEnd = Math.min(endsAt, Date.now());
        const records = {};

        accountIds.forEach((accountId) => {
            records[accountId] = (matchIdsByPlayer.get(accountId) || [])
                .map((matchId) => parsePubgMatch(matchesById.get(matchId), accountId))
                .filter((match) => match && match.endedAt >= startedAt && match.endedAt <= boundedEnd)
                .sort((left, right) => right.endedAt - left.endedAt);
        });

        return res.json({ records, syncedAt: new Date().toISOString() });
    } catch (error) {
        return pubgErrorResponse(error, res);
    }
});

app.listen(PORT, function () {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});

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
const roomStore = new RoomStore();

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
        && endsAt - startedAt <= 7 * 24 * 60 * 60 * 1000;

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

app.listen(PORT, function () {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});

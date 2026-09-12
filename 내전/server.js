require("dotenv").config({ quiet: true });

const path = require("node:path");
const express = require("express");
const { rankedScore } = require("./public/rank-score");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_PLATFORM = (process.env.RIOT_PLATFORM || "kr").toLowerCase();
const RIOT_REGION = (process.env.RIOT_REGION || "asia").toLowerCase();

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

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

app.listen(PORT, function () {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});

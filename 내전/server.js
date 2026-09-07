require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 3000;

const RIOT_API_KEY = process.env.RIOT_API_KEY;

app.use(express.json());
app.use(express.static(__dirname));


app.post("/api/player", async function (req, res) {
    const gameName = req.body.gameName;
    const tagLine = req.body.tagLine;

    try {
        const url =
            "https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/" +
            encodeURIComponent(gameName) +
            "/" +
            encodeURIComponent(tagLine);

        const riotResponse = await fetch(url, {
            headers: {
                "X-Riot-Token": RIOT_API_KEY
            }
        });

        if (!riotResponse.ok) {
            return res.status(riotResponse.status).json({
                message: "Riot 계정을 찾지 못했습니다."
            });
        }

        const account = await riotResponse.json();

        console.log("Riot 계정 조회 성공:");
        console.log(account);

        res.json({
            gameName: account.gameName,
            tagLine: account.tagLine,
            puuid: account.puuid,
            riotId: account.gameName + "#" + account.tagLine
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "서버에서 오류가 발생했습니다."
        });
    }
});


app.listen(PORT, function () {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
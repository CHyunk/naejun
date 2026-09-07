const createTeamBtn = document.getElementById("createTeamBtn");
const blueTeam = document.getElementById("blueTeam");
const redTeam = document.getElementById("redTeam");

const gameNameInput = document.getElementById("gameName");
const tagLineInput = document.getElementById("tagLine");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const playerList = document.getElementById("playerList");

const players = [];


// 플레이어 추가
addPlayerBtn.addEventListener("click", async function () {
    const gameName = gameNameInput.value.trim();
    const tagLine = tagLineInput.value.trim();

    if (gameName === "" || tagLine === "") {
        alert("게임 닉네임과 태그를 모두 입력해주세요.");
        return;
    }

    const riotId = gameName + "#" + tagLine;

    // 중복 확인
    for (let i = 0; i < players.length; i++) {
        if (players[i].riotId === riotId) {
            alert("이미 등록된 플레이어입니다.");
            return;
        }
    }

    try {
        const response = await fetch("/api/player", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                gameName: gameName,
                tagLine: tagLine
            })
        });

        const data = await response.json();

        console.log("서버 응답:", data);

        if (!response.ok) {
            alert(data.message);
            return;
        }

        const player = {
            gameName: data.gameName,
            tagLine: data.tagLine,
            riotId: data.riotId,
            puuid: data.puuid
        };

        players.push(player);

        renderPlayers();

        gameNameInput.value = "";
        tagLineInput.value = "";

    } catch (error) {
        console.error("에러 발생:", error);

        alert("서버와 통신 중 오류가 발생했습니다.");
    }
});


// 플레이어 목록 화면 출력
function renderPlayers() {
    playerList.innerHTML = "";

    for (let i = 0; i < players.length; i++) {
        const li = document.createElement("li");

        li.textContent = players[i].riotId + " ";

        const deleteBtn = document.createElement("button");

        deleteBtn.textContent = "삭제";

        deleteBtn.addEventListener("click", function () {
            players.splice(i, 1);

            renderPlayers();
        });

        li.appendChild(deleteBtn);

        playerList.appendChild(li);
    }
}


// 랜덤 팀 생성
createTeamBtn.addEventListener("click", function () {

    if (players.length < 2) {
        alert("플레이어를 2명 이상 등록해주세요.");
        return;
    }

    if (players.length % 2 !== 0) {
        alert("팀을 나누려면 플레이어 수가 짝수여야 합니다.");
        return;
    }

    const shuffledPlayers = [...players];

    shuffledPlayers.sort(function () {
        return Math.random() - 0.5;
    });

    const half = shuffledPlayers.length / 2;

    const bluePlayers = shuffledPlayers.slice(0, half);
    const redPlayers = shuffledPlayers.slice(half);

    blueTeam.innerHTML = "";
    redTeam.innerHTML = "";

    // BLUE TEAM 출력
    for (let i = 0; i < bluePlayers.length; i++) {
        const li = document.createElement("li");

        li.textContent = bluePlayers[i].riotId;

        blueTeam.appendChild(li);
    }

    // RED TEAM 출력
    for (let i = 0; i < redPlayers.length; i++) {
        const li = document.createElement("li");

        li.textContent = redPlayers[i].riotId;

        redTeam.appendChild(li);
    }
});
const crypto = require("node:crypto");

const ROOM_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;
const MAX_STATE_BYTES = 96 * 1024;
const ROOM_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeRoomCode(value) {
    return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizeSoloChallenge(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const durationHours = Number(value.durationHours);
    const startedAt = Number(value.startedAt);
    const endsAt = Number(value.endsAt);
    const maximumDuration = 100 * 60 * 60 * 1000;

    if (!Number.isSafeInteger(durationHours)
        || durationHours < 1
        || durationHours > 100
        || !Number.isFinite(startedAt)
        || !Number.isFinite(endsAt)
        || startedAt <= 0
        || endsAt <= startedAt
        || endsAt - startedAt > maximumDuration) {
        return null;
    }

    return {
        durationHours,
        startedAt,
        endsAt,
        endedManually: Boolean(value.endedManually)
    };
}

function normalizeRoomState(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const state = {
        players: Array.isArray(value.players) ? value.players.slice(0, 10) : [],
        matches: Array.isArray(value.matches) ? value.matches.slice(-500) : [],
        soloRecords: value.soloRecords && typeof value.soloRecords === "object" && !Array.isArray(value.soloRecords)
            ? value.soloRecords
            : {},
        soloChallenge: normalizeSoloChallenge(value.soloChallenge),
        pubgPlayers: Array.isArray(value.pubgPlayers) ? value.pubgPlayers.slice(0, 10) : [],
        pubgChallenge: normalizeSoloChallenge(value.pubgChallenge),
        currentTeams: value.currentTeams && typeof value.currentTeams === "object"
            ? value.currentTeams
            : null,
        stake: Number.isSafeInteger(value.stake) && value.stake >= 100 ? value.stake : 1000
    };
    const serialized = JSON.stringify(state);

    return Buffer.byteLength(serialized, "utf8") <= MAX_STATE_BYTES
        ? JSON.parse(serialized)
        : null;
}

function createRoomCode() {
    let code = "";

    for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
        code += ROOM_CODE_CHARACTERS[crypto.randomInt(ROOM_CODE_CHARACTERS.length)];
    }

    return code;
}

function hashHostToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function publicRoom(room) {
    return {
        code: room.code,
        state: JSON.parse(JSON.stringify(room.state)),
        revision: room.revision,
        updatedAt: new Date(room.updatedAt).toISOString()
    };
}

class RoomStore {
    constructor() {
        this.rooms = new Map();
    }

    create(state) {
        const normalizedState = normalizeRoomState(state);

        if (!normalizedState) {
            return { status: 400, message: "공유할 방 데이터가 올바르지 않습니다." };
        }

        let code = createRoomCode();
        while (this.rooms.has(code)) {
            code = createRoomCode();
        }

        const hostToken = crypto.randomBytes(24).toString("base64url");
        const now = Date.now();
        const room = {
            code,
            hostTokenHash: hashHostToken(hostToken),
            state: normalizedState,
            revision: 1,
            createdAt: now,
            updatedAt: now
        };
        this.rooms.set(code, room);

        return { status: 201, hostToken, room: publicRoom(room) };
    }

    get(code) {
        const normalizedCode = normalizeRoomCode(code);
        const room = this.rooms.get(normalizedCode);

        if (!room) {
            return { status: 404, message: "방을 찾지 못했습니다." };
        }

        if (Date.now() - room.updatedAt > ROOM_TTL_MS) {
            this.rooms.delete(normalizedCode);
            return { status: 404, message: "오랫동안 사용하지 않아 종료된 방입니다." };
        }

        return { status: 200, room: publicRoom(room) };
    }

    update(code, hostToken, state, expectedRevision) {
        const found = this.get(code);

        if (!found.room) {
            return found;
        }

        const room = this.rooms.get(found.room.code);
        const tokenHash = typeof hostToken === "string" ? hashHostToken(hostToken) : "";

        if (!hostToken || tokenHash !== room.hostTokenHash) {
            return { status: 403, message: "방장만 방 기록을 변경할 수 있습니다." };
        }

        if (!Number.isSafeInteger(expectedRevision) || expectedRevision !== room.revision) {
            return {
                status: 409,
                message: "다른 변경이 먼저 저장되었습니다. 최신 상태를 다시 불러옵니다.",
                room: publicRoom(room)
            };
        }

        const normalizedState = normalizeRoomState(state);
        if (!normalizedState) {
            return { status: 400, message: "공유할 방 데이터가 올바르지 않습니다." };
        }

        room.state = normalizedState;
        room.revision += 1;
        room.updatedAt = Date.now();

        return { status: 200, room: publicRoom(room) };
    }
}

module.exports = {
    RoomStore,
    normalizeRoomCode,
    normalizeRoomState
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.obtainViewerToken = exports.obtainMemberToken = exports.obtainAdminToken = void 0;
const livekit_server_sdk_1 = require("livekit-server-sdk");
function obtainAdminToken(roomName, identity, apiKey, apiSecret, participantName, metadata, ttl) {
    const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
        metadata,
        name: participantName,
        identity: identity,
        ttl
    });
    at.addGrant({
        room: roomName,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
        recorder: true,
        roomAdmin: true,
        roomCreate: true,
        roomJoin: true,
        roomList: true,
        roomRecord: true,
    });
    const token = at.toJwt();
    return token;
}
exports.obtainAdminToken = obtainAdminToken;
function obtainMemberToken(roomName, participantName, apiKey, apiSecret) {
    const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
        identity: participantName,
    });
    at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
    });
    const token = at.toJwt();
    return token;
}
exports.obtainMemberToken = obtainMemberToken;
function obtainViewerToken(roomName, participantName, apiKey, apiSecret) {
    try {
        const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
            identity: participantName,
        });
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: false,
            canSubscribe: false,
            canPublishData: true
        });
        const token = at.toJwt();
        return token;
    }
    catch (e) {
        console.log("error while obtaining token for viewer!!!");
    }
}
exports.obtainViewerToken = obtainViewerToken;
function verifyToken(token = "", apiKey, apiSecret) {
    const tokenController = new livekit_server_sdk_1.TokenVerifier(apiKey, apiSecret);
    const verify = tokenController.verify(token);
    return verify;
}
exports.verifyToken = verifyToken;
//# sourceMappingURL=tokenGenration.js.map
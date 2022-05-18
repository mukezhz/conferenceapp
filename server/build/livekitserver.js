"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptions = exports.updateRoomMetadata = exports.sendData = exports.removeParticipant = exports.mutePublishedTrack = exports.listRooms = exports.listParticipants = exports.getParticipant = exports.roomService = exports.deleteRoom = exports.createRoom = void 0;
const livekit_server_sdk_1 = require("livekit-server-sdk");
const console = require("console");
function roomService(livekitHost, apiKey, apiSecret) {
    try {
        const svc = new livekit_server_sdk_1.RoomServiceClient(livekitHost, apiKey, apiSecret);
        console.log("firssert");
        return svc;
    }
    catch (e) {
        console.log("room service creation error!!!");
    }
}
exports.roomService = roomService;
// const svc = roomService(livekitHost);
function createRoom(svc, roomName, timeout = 5, participantno = 10) {
    return __awaiter(this, void 0, void 0, function* () {
        const opts = {
            name: roomName,
            emptyTimeout: timeout,
            maxParticipants: participantno
        };
        try {
            const room = yield svc.createRoom(opts);
            return room;
        }
        catch (e) {
            console.log("room creation error");
        }
    });
}
exports.createRoom = createRoom;
function deleteRoom(svc, roomName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield svc.deleteRoom(roomName);
        }
        catch (e) {
            console.log("error while deleting!!!");
        }
    });
}
exports.deleteRoom = deleteRoom;
function getParticipant(svc, room, identity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const participant = yield svc.getParticipant(room, identity);
            return participant;
        }
        catch (e) {
            console.log('error while fetching participant!!!');
        }
    });
}
exports.getParticipant = getParticipant;
function listParticipants(svc, room) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield svc.listParticipants(room);
        }
        catch (e) {
            console.log('error while listing participants!!!');
        }
    });
}
exports.listParticipants = listParticipants;
function listRooms(svc, names) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // if names = undefined|'' returns all rooms
            return svc.listRooms(names);
        }
        catch (e) {
            console.log("error while listing the rooms!!!");
        }
    });
}
exports.listRooms = listRooms;
function mutePublishedTrack(svc, room, identity, trackSid, muted) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return svc.mutePublishedTrack(room, identity, trackSid, muted);
        }
        catch (e) {
            console.log('error while muting publish track!!!');
        }
    });
}
exports.mutePublishedTrack = mutePublishedTrack;
function removeParticipant(svc, room, identity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return svc.removeParticipant(room, identity);
        }
        catch (e) {
            console.log('error while removing participant!!!', identity);
        }
    });
}
exports.removeParticipant = removeParticipant;
function sendData(svc, room, data, kind, destinationSids) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            svc.sendData(room, data, kind);
        }
        catch (e) {
            console.log('error while sending the data!!!');
        }
    });
}
exports.sendData = sendData;
function updateRoomMetadata(svc, room, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return svc.updateRoomMetadata(room, metadata);
        }
        catch (e) {
            console.log('error while updating room metadata!!!');
        }
    });
}
exports.updateRoomMetadata = updateRoomMetadata;
function updateSubscriptions(svc, room, identity, trackSids, subscribe) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            svc.updateSubscriptions(room, identity, trackSids, subscribe);
        }
        catch (e) {
            console.log("error while updating subscriptions!!!");
        }
    });
}
exports.updateSubscriptions = updateSubscriptions;
//# sourceMappingURL=livekitserver.js.map
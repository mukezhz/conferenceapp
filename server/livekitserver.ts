import { AccessToken, RoomServiceClient, Room, TokenVerifier, ClaimGrants } from 'livekit-server-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.LIVEKIT_API_KEY || "error"
const apiSecret = process.env.LIVEKIT_API_SECRET || "errorsecret"
const hostURL = process.env.HOST_URL || "localhost"
const hostPort = process.env.HOST_PORT || 7880
const livekitHost = `http://${hostURL}:${hostPort}/`;


function roomService(url: string) {
    try {
        const svc = new RoomServiceClient(livekitHost, apiKey, apiSecret);
        return svc
    } catch (e) {
        console.log("room service creation error!!!");
    }
}
// const svc = roomService(livekitHost);

async function createRoom(svc: RoomServiceClient, roomName: string, timeout = 5, participantno = 10) {

    const opts = {
        name: roomName,
        emptyTimeout: timeout,
        maxParticipants: participantno
    }
    try {
        const room: Room = await svc.createRoom(opts);
        return room
    } catch (e) {
        console.log("room creation error");
        console.log(e);
    }
}

function deleteRoom(svc: RoomServiceClient, roomName: string) {
    svc.deleteRoom(roomName).then(() => {
        console.log('room deleted', roomName)
    })
}

export { createRoom, deleteRoom, roomService }
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
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const livekitserver_1 = require("./utils/livekitserver");
const tokenGenration_1 = require("./utils/tokenGenration");
const tokenGenration_2 = require("./utils/tokenGenration");
const misc_1 = require("./utils/misc");
// const hostURL = process.env.HOST_URL || "localhost"
// const hostPort = process.env.HOST_PORT || 7880
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));
const livekitHost = process.env.LIVEKIT_URL || "";
const apiKey = process.env.LIVEKIT_API_KEY || "error";
const apiSecret = process.env.LIVEKIT_API_SECRET || "errorsecret";
const port = process.env.PORT || 8000;
app.get("/", (req, res) => {
    // render the index template
    res.send("hello world!!!");
});
app.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room = "", timeout = 10, participantno = 100 } = req.body;
    if (!room)
        return res.status(400).json({ messgae: 'room name is not provided!!!' });
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const createdRoom = yield (0, livekitserver_1.createRoom)(svc, room, timeout, participantno);
    return res.json(createdRoom);
}));
app.post("/admintoken", (req, res) => {
    const { room = "", name = "", participantName = "", metadata = "", ttl = "" } = req.body;
    let { message = "", status = true } = (0, misc_1.checkNameRoom)(room, name);
    if (status) {
        const token = req.cookies['token'];
        if (token) {
            message = "token already exists";
            const user = (0, tokenGenration_2.verifyToken)(token, apiKey, apiSecret);
            const { video, iss, sub, jti } = user;
            if ((jti === name || sub === name) && video.room === room) {
                res.json({ message, access_token: token });
                return;
            }
        }
        const access_token = (0, tokenGenration_1.obtainAdminToken)(room, name, apiKey, apiSecret, participantName, metadata, ttl);
        res.cookie("token", access_token, {
            httpOnly: true,
        });
        res.json({ access_token, message: "success" });
        return;
    }
    return res.status(400).json({ message });
});
app.post("/membertoken", (req, res) => {
    const { room = "", name = "" } = req.body;
    let { message, status = true } = (0, misc_1.checkNameRoom)(room, name);
    if (status) {
        const token = req.cookies['token'];
        if (token) {
            message = "token already exists";
            const user = (0, tokenGenration_2.verifyToken)(token, apiKey, apiSecret);
            const { video, iss, sub, jti } = user;
            if ((jti === name || sub === name) && video.room === room) {
                res.json({ message, access_token: token });
                return;
            }
        }
        const access_token = (0, tokenGenration_1.obtainMemberToken)(room, name, apiKey, apiSecret);
        res.cookie("token", access_token, {
            httpOnly: true,
        });
        res.json({ access_token, message: "success" });
        return;
    }
    return res.status(400).json({ message });
});
app.post("/viewertoken", (req, res) => {
    const { room = "", name = "" } = req.body;
    let { message, status = true } = (0, misc_1.checkNameRoom)(room, name);
    if (status) {
        const token = req.cookies['token'];
        if (token) {
            message = "token already exists";
            const user = (0, tokenGenration_2.verifyToken)(token, apiKey, apiSecret);
            const { video, iss, sub, jti } = user;
            if ((jti === name || sub === name) && video.room === room) {
                res.json({ message, access_token: token });
                return;
            }
        }
        try {
            const access_token = (0, tokenGenration_1.obtainViewerToken)(room, name, apiKey, apiSecret);
            res.cookie("token", access_token, {
                httpOnly: true,
            });
            return res.json({ access_token, message: "success" });
        }
        catch (e) {
            return res.status(400).json({ message: 'unable to create token for viewer!!!', error: e });
        }
    }
    return res.status(400).json({ message });
});
app.get('/removetoken', (req, res) => {
    const token = req.cookies['token'];
    if (token) {
        res.clearCookie('token');
        return res.status(200).json({ message: 'success!!!' });
    }
    return res.status(400).json({ message: 'token does not exist please create token first!!!' });
});
app.post('/deleteroom', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room = "" } = req.body;
    if (!room)
        return res.status(400).json({ message: "room name is not provided!!!" });
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    yield (0, livekitserver_1.deleteRoom)(svc, room);
    return res.status(200).json({ message: `room: ${room} delete successfully!!!` });
}));
// list all the rooms available
app.get('/rooms', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const rooms = yield (0, livekitserver_1.listRooms)(svc);
    return res.status(200).json({ message: "success", rooms });
}));
// get the information of specific room
app.get('/rooms/:room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room = '' } = req.params;
    if (!room)
        return res.status(400).json({ message: 'room name is not provided!!!' });
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const specificRoom = (yield (0, livekitserver_1.listRooms)(svc, [room])) || [];
    if ((specificRoom === null || specificRoom === void 0 ? void 0 : specificRoom.length) === 0)
        return res.status(404).json({ message: 'room does not found!!!' });
    return res.status(200).json({ message: "success", room: specificRoom[0] });
}));
// get the information of list of rooms
app.post('/rooms', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rooms = [] } = req.body;
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const listsRoom = yield (0, livekitserver_1.listRooms)(svc, rooms);
    return res.status(200).json({ message: "success", rooms: listsRoom });
}));
// update room metadata
app.post('/updateroomdata', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room = "", metadata = "" } = req.body;
    if (!room || !metadata)
        return res.status(400).json({ message: 'room or metadata is not provided!!!' });
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const updatedRoom = yield (0, livekitserver_1.updateRoomMetadata)(svc, room, metadata);
    return res.status(201).json({ message: 'success', room: updatedRoom });
}));
app.get('/participants/:room/:identity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room = "", identity = "" } = req.params;
    if (!room || !identity)
        return res.status(400).json({ message: 'room or identity is not provided!!!' });
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const participant = yield (0, livekitserver_1.getParticipant)(svc, room, identity);
    if (!participant)
        return res.status(404).json({ message: "unable to find user in the room!!!" });
    return res.status(200).json({ message: "success", participant });
}));
// list the participants inside the room
app.get('/participants/:room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room = "" } = req.params;
    if (!room)
        return res.status(400).json({ messgae: 'room name is not provided!!!' });
    const svc = (0, livekitserver_1.roomService)(livekitHost, apiKey, apiSecret);
    const participants = yield (0, livekitserver_1.listParticipants)(svc, room);
    return res.status(200).json({ message: "success", participants });
}));
app.listen(port, () => {
    console.log("Listening on port ", port);
});
//# sourceMappingURL=index.js.map
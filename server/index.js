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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var dotenv = require("dotenv");
var livekit_server_sdk_1 = require("livekit-server-sdk");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var livekitserver_1 = require("./livekitserver");
// const hostURL = process.env.HOST_URL || "localhost"
// const hostPort = process.env.HOST_PORT || 7880
var livekitHost = process.env.LIVEKIT_URL || "";
dotenv.config();
var app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));
var apiKey = process.env.LIVEKIT_API_KEY || "error";
var apiSecret = process.env.LIVEKIT_API_SECRET || "errorsecret";
var port = process.env.PORT || 8000;
function obtainToken(roomName, participantName) {
    var at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
        identity: participantName
    });
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true
    });
    var token = at.toJwt();
    return token;
}
function verifyToken(token) {
    if (token === void 0) { token = ""; }
    var tokenController = new livekit_server_sdk_1.TokenVerifier(apiKey, apiSecret);
    var verify = tokenController.verify(token);
    return verify;
}
app.get("/", function (req, res) {
    // render the index template
    res.send("hello world!!!");
});
app.post("/create", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, room, svc, createdRoom;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body.room, room = _a === void 0 ? "" : _a;
                svc = (0, livekitserver_1.roomService)(livekitHost);
                return [4 /*yield*/, (0, livekitserver_1.createRoom)(svc, room)];
            case 1:
                createdRoom = _b.sent();
                return [2 /*return*/, res.json(createdRoom)];
        }
    });
}); });
app.post("/join", function (req, res) {
    var _a = req.body, _b = _a.room, room = _b === void 0 ? "" : _b, _c = _a.name, name = _c === void 0 ? "" : _c;
    var message = "";
    if (!room && !name) {
        message = "room and name both are not provided";
    }
    else if (!room) {
        message = "room is not provided";
    }
    else if (!name) {
        message = "name is not provided";
    }
    else {
        var token = req.cookies['token'];
        if (token) {
            message = "token already exists";
            var user = verifyToken(token);
            var video = user.video, iss = user.iss, sub = user.sub, jti = user.jti;
            if ((jti === name || sub === name) && video.room === room) {
                res.json({ message: message, access_token: token });
                return;
            }
        }
        var access_token = obtainToken(room, name);
        res.cookie("token", access_token, {
            // secure: process.env.NODE_ENV !== "devel`opment",
            httpOnly: true
        });
        res.json({ access_token: access_token, message: "success" });
        return;
    }
    return res.status(400).json({ message: message });
});
app.listen(port, function () {
    console.log("Listening on port ", port);
});

import express from 'express';
import dotenv from 'dotenv';
import { Express, Request, Response } from 'express'
import { AccessToken, RoomServiceClient, Room, TokenVerifier, ClaimGrants, VideoGrant } from 'livekit-server-sdk';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createRoom, deleteRoom, roomService } from "./livekitserver"

const hostURL = process.env.HOST_URL || "localhost"
const hostPort = process.env.HOST_PORT || 7880
const livekitHost = `http://${hostURL}:${hostPort}/`;

type VerifyType = {
    video: {
        roomJoin: boolean,
        room: string,
        canPublish: boolean,
        canSubscribe: boolean
    },
    iat: number,
    nbf: number,
    exp: number,
    iss: string,
    sub: string,
    jti: string
}
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
    methods: "POST"
}));
const apiKey = process.env.LIVEKIT_API_KEY || "error"
const apiSecret = process.env.LIVEKIT_API_SECRET || "errorsecret"
const port = process.env.PORT || 8000;


function obtainToken(roomName: string, participantName: string) {
    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
    });
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });

    const token = at.toJwt();
    return token
}

function verifyToken(token = "") {
    const tokenController = new TokenVerifier(apiKey, apiSecret)
    const verify = <VerifyType>tokenController.verify(token)
    return verify
}
app.get("/", (req: Request, res: Response) => {
    // render the index template
    res.send("hello world!!!")
});

app.post("/create", async (req: Request, res: Response) => {
    const { room = "" } = req.body;
    const svc = <RoomServiceClient>roomService(livekitHost)
    const createdRoom = await createRoom(svc, room);
    return res.json(createdRoom);
});

app.post("/join", (req: Request, res: Response) => {
    const { room = "", name = "" } = req.body;
    let message = "";
    if (!room && !name) {
        message = "room and name both are not provided"
    } else if (!room) {
        message = "room is not provided"
    } else if (!name) {
        message = "name is not provided"
    }
    else {
        const token = req.cookies['token']
        if (token) {
            message = "token already exists"
            const user = verifyToken(token)
            const { video, iss, sub, jti } = user
            if ((jti === name || sub === name) && video.room === room) {
                res.json({ message, access_token: token })
                return
            }
        }
        const access_token = obtainToken(room, name)
        res.cookie("token", access_token, {
            // secure: process.env.NODE_ENV !== "devel`opment",
            httpOnly: true,
        });
        res.json({ access_token, message: "success" })
        return
    }
    return res.status(400).json({ message })

})


app.listen(port, () => {
    console.log("Listening on port ", port);
})


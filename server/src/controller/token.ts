import * as express from "express"
import * as uuid from "uuid"
import * as t from "../utils"

const apiKey = process.env.LIVEKIT_API_KEY || "error"
const apiSecret = process.env.LIVEKIT_API_SECRET || "errorsecret"

export const handleAdminToken = (req: express.Request, res: express.Response) => {
    const { room = "", participantName = "", metadata = "", ttl = "" } = req.body;
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!participantName) return res.status(400).json({ message: 'participant\'s name is not provided!!!' })
    else console.log('unknown error!!!')
    const identity = `${participantName}::${uuid.v4()}`
    const token = req.cookies['token']
    if (token) {
        const user = t.verifyToken(token, apiKey, apiSecret)
        const { video, iss, sub, jti } = user
        if ((jti === identity || sub === identity) && video.room === room) {
            res.json({ message: "token already exists!!!", access_token: token })
            return
        }
    }
    try {
        const access_token = t.obtainAdminToken(room, identity, apiKey, apiSecret, participantName, metadata, ttl)
        res.cookie("token", access_token, {
            httpOnly: true,
        });
        return res.json({ access_token, message: "success" })
    } catch (e) {
        return res.status(400).json({ message: 'unable to create token for admin!!!', error: e })
    }
}


export const handleMemberToken = (req: express.Request, res: express.Response) => {
    const { metadata = "", participantName = "", room = "" } = req.body;
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!participantName) return res.status(400).json({ message: 'participant\'s name is not provided!!!' })
    else console.log('unknown error!!!')
    const identity = `${participantName}::${uuid.v4()}`
    const token = req.cookies['token']
    if (token) {
        const user = t.verifyToken(token, apiKey, apiSecret)
        const { video, iss, sub, jti } = user
        if ((jti === identity || sub === identity) && video.room === room) {
            res.json({ message: "token already exists", access_token: token })
            return
        }
    }
    try {
        const access_token = t.obtainMemberToken(room, identity, apiKey, apiSecret, participantName)
        res.cookie("token", access_token, {
            httpOnly: true,
        });
        return res.json({ access_token, message: "success" })
    } catch (e) {
        return res.status(400).json({ message: 'unable to create token for member!!!', error: e })
    }
}

export const handleViewerToken = (req: express.Request, res: express.Response) => {
    const { room = "", participantName = "" } = req.body;
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!participantName) return res.status(400).json({ message: 'participant\'s name is not provided!!!' })
    else console.log('unknown error!!!')
    const identity = `${participantName}::${uuid.v4()}`
    const token = req.cookies['token']
    if (token) {
        const user = t.verifyToken(token, apiKey, apiSecret)
        const { video, iss, sub, jti } = user
        if ((jti === identity || sub === identity) && video.room === room) {
            res.json({ message: "token already exists", access_token: token })
            return
        }
    }
    try {
        const access_token = t.obtainViewerToken(room, identity, apiKey, apiSecret, participantName)
        res.cookie("token", access_token, {
            httpOnly: true,
        });
        return res.json({ access_token, message: "success" })
    } catch (e) {
        return res.status(400).json({ message: 'unable to create token for viewer!!!', error: e })
    }
}

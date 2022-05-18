import * as express from "express"
import { RoomServiceClient } from 'livekit-server-sdk';
import * as p from "../utils"

const livekitHost = process.env.livekit_url || ""
const apiKey = process.env.livekit_api_key || "error"
const apiSecret = process.env.livekit_api_secret || "errorsecret"

export const handleSingleParticipant = async (req: express.Request, res: express.Response) => {
    const { room = "", identity = "" } = req.params
    if (!room || !identity) return res.status(400).json({ message: 'room or identity is not provided!!!' })
    const svc = <RoomServiceClient>p.roomService(livekitHost, apiKey, apiSecret)
    const participant = await p.getParticipant(svc, room, identity)
    if (!participant) return res.status(404).json({ message: "unable to find user in the room!!!" })
    return res.status(200).json({ message: "success", participant })
}

export const handleFetchRoomParticipants = async (req: express.Request, res: express.Response) => {
    const { room = "" } = req.params
    if (!room) return res.status(400).json({ messgae: 'room name is not provided!!!' })
    const svc = <RoomServiceClient>p.roomService(livekitHost, apiKey, apiSecret)
    const participants = await p.listParticipants(svc, room)
    if (!participants) return res.status(400).json({ message: 'unable to fetch participants!!!' })
    return res.status(200).json({ message: "success", participants })
}

export const handleRemoveParticipant = async (req: express.Request, res: express.Response) => {
    const { room = "", identity = "" } = req.body
    if (!room) res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!identity) res.status(400).json({ message: 'identity is not provided!!!' })
    else console.log('some unknown error!!!')
    const svc = <RoomServiceClient>p.roomService(livekitHost, apiKey, apiSecret)
    const result = await p.removeParticipant(svc, room, identity)
    try {
        const participantIdentity = identity.split('::')[0]
        if (!result) res.status(200).json({ message: `unable to remove the participant: ${participantIdentity}` })
    } catch (e) {
        return res.status(400).json({ message: 'unable to parse identity!!!' })
    }
}
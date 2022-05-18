import * as express from "express"
import { RoomServiceClient } from 'livekit-server-sdk';
import * as t from "../utils/livekitserver"

const livekitHost = process.env.LIVEKIT_URL || ""
const apiKey = process.env.LIVEKIT_API_KEY || "error"
const apiSecret = process.env.LIVEKIT_API_SECRET || "errorsecret"

export const handleMutePublishedTrack = async (req: express.Request, res: express.Response) => {
    const { room = "", identity = "", trackSid = "", muted = false } = req.body
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!identity) return res.status(400).json({ message: 'identity is not provided!!!' })
    else if (!trackSid) return res.status(400).json({ message: 'trackSid is not provided!!!' })
    else console.log('unknown error!!!')
    const svc = <RoomServiceClient>t.roomService(livekitHost, apiKey, apiSecret)
    const trackinfo = await t.mutePublishedTrack(svc, room, identity, trackSid, muted)
    if (!trackinfo) return res.status(500).json({ message: "unable to mute the track !!!" })
    return res.status(200).json({ message: "success" })
}

export const handleUpdateSubscriptions = async (req: express.Request, res: express.Response) => {
    const { room = "", identity = "", trackSids = [], subscribe = false } = req.body
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!identity) return res.status(400).json({ message: 'identity is not provided!!!' })
    else if (!trackSids.length) return res.status(400).json({ message: 'identity is not provided!!!' })
    else console.log('unknown error !!!')
    const svc = <RoomServiceClient>t.roomService(livekitHost, apiKey, apiSecret)
    const result = await t.updateSubscriptions(svc, room, identity, trackSids, subscribe)
    if (!result) return res.status(400).json({ messager: 'unable to update the subscription!!!' })
    return res.status(200).json({ message: 'success' })
}

export const handleSendData = async (req: express.Request, res: express.Response) => {
    const { room = "", data = new TextEncoder().encode(""), kind = 0, destinationSids = [] } = req.body
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    else if (!data.length) return res.status(400).json({ message: 'data is not provided!!!' })
    else console.log('unknown error !!!')
    const svc = <RoomServiceClient>t.roomService(livekitHost, apiKey, apiSecret)
    const result = await t.sendData(svc, room, data, kind, destinationSids)
    if (!result) return res.status(400).json({ messager: 'unable to send data!!!' })
    return res.status(200).json({ message: 'success' })
}
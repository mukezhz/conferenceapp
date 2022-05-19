import * as express from "express"
import { RoomServiceClient } from 'livekit-server-sdk';
import * as r from "../utils"

const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'

export const handleRoomCreate = async (req: express.Request, res: express.Response) => {
    const { room = "", timeout = 10, participantno = 100 } = req.body;
    if (!room) return res.status(400).json({ messgae: 'room name is not provided!!!' })
    const svc = <RoomServiceClient>r.roomService(livekitHost, apiKey, apiSecret)
    const specificRoom = await r.listRooms(svc, [room]) || []
    if (specificRoom.length) return res.status(400).json({ message: 'room already exists!!!' })
    const createdRoom = await r.createRoom(svc, room, timeout, participantno);
    if (!createdRoom) return res.status(500).json({ message: 'unable to create room!!!' })
    return res.json(createdRoom);
}

export const handleRemoveToken = (req: express.Request, res: express.Response) => {
    const token = req.cookies['token']
    if (token) {
        res.clearCookie('token')
        return res.status(200).json({ message: 'success!!!' });
    } return res.status(400).json({ message: 'token does not exist please create token first!!!' })
}

export const handleDeleteRoom = async (req: express.Request, res: express.Response) => {
    const { room = "" } = req.body
    if (!room) return res.status(400).json({ message: "room name is not provided!!!" })
    const svc = <RoomServiceClient>r.roomService(livekitHost, apiKey, apiSecret)
    const specificRoom = await r.listRooms(svc, [room]) || []
    if (!specificRoom.length) return res.status(404).json({ message: "room does not exist!!!" })
    const result = await r.deleteRoom(svc, room)
    if (!result)
        return res.status(400).json({ message: `error while deleting room!!!` })
    return res.status(200).json({ message: `room: ${room} delete successfully!!!` })
}

export const handleRooms = async (req: express.Request, res: express.Response) => {
    const svc = <RoomServiceClient>r.roomService(livekitHost, apiKey, apiSecret)
    const rooms = await r.listRooms(svc)
    if (!rooms) return res.status(500).json({ message: 'unable to list rooms!!!' })
    return res.status(200).json({ message: "success", rooms })
}

export const handleSingleRoom = async (req: express.Request, res: express.Response) => {
    const { room = '' } = req.params
    let newRoom = ''
    if (room.includes('"')) newRoom = room.split('"').join('')
    else newRoom = room
    if (!room) return res.status(400).json({ message: 'room name is not provided!!!' })
    const svc = <RoomServiceClient>r.roomService(livekitHost, apiKey, apiSecret)
    const specificRoom = await r.listRooms(svc, [newRoom]) || []
    if (specificRoom?.length === 0) return res.status(404).json({ message: 'room does not found!!!' })
    return res.status(200).json({ message: "success", room: specificRoom[0] })
}

export const handleListRoom = async (req: express.Request, res: express.Response) => {
    const { rooms = [] } = req.body
    const svc = <RoomServiceClient>r.roomService(livekitHost, apiKey, apiSecret)
    const listsRoom = await r.listRooms(svc, rooms)
    if (!listsRoom) return res.status(500).json({ message: 'unable to find list of users!!!' })
    return res.status(200).json({ message: "success", rooms: listsRoom })
}

export const handleUpdateRoomMetadata = async (req: express.Request, res: express.Response) => {
    const { room = "", metadata = "" } = req.body
    if (!room) return res.status(400).json({ message: 'room is not provided!!!' })
    else if (!metadata) return res.status(400).json({ message: 'metadata is not provided!!!' })
    const svc = <RoomServiceClient>r.roomService(livekitHost, apiKey, apiSecret)
    const updatedRoom = await r.updateRoomMetadata(svc, room, metadata)
    if (!updatedRoom) return res.status(400).json({ message: 'unable to update metadata!!!' })
    return res.status(201).json({ message: 'success', room: updatedRoom })
}
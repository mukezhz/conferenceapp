import * as axios from "axios";
import * as express from "express"
import { RoomServiceClient } from 'livekit-server-sdk';
import * as m from "../databases";
import * as util from "../utils"
import * as nanoid from "nanoid";


const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'
const everestUrl = process.env.EVEREST_URL || 'https://example.com'

interface Meeting {
    room: string,
    title: string,
    user_id: string,
    description?: string,
    participants: Object,
    start_date: string,
    status: string,
    cover_image?: string | null,
    app_id: string,
    country: string,
    waiting_room_enabled: boolean
}

export const handleStartMeeting = async (req: express.Request, res: express.Response) => {
    try {
        const {
            room,
            title,
            description,
            participants,
            start_date = '',
            status,
            cover_image = "",
            app_id,
            country,
            waiting_room_enabled
        }: Meeting = req.body
        const uniqueToken = nanoid.nanoid()
        if (!title) return res.status(400).json({ message: 'title is not provided!!!' })
        else if (!participants) return res.status(400).json({ message: 'participants is not provided!!!' })
        else if (!app_id) return res.status(400).json({ message: 'app_id is not provided!!!' })
        else if (!country) return res.status(400).json({ message: 'country code is not provided!!!' })
        try {
            if (room) {
                const search = await m.meeting.findByRoom(room)
                if (search) return res.status(400).json({ message: "data already exists!!!" })
            }
            const date = Number(start_date)
            if (!date) return res.status(400).json({ message: 'invalid time stamp: provide number !!!' })
            const result = await m.meeting.create({ ...req.body, start_date: new Date(date), id: uniqueToken, room: uniqueToken })
            return res.status(200).json({ message: "success", data: { id: result.id } })
        } catch (e: any) {
            return res.status(400).json({ message: "error while creating!!!", error: e.message })
        }
    } catch (e) {
        console.error(e)
        console.error("inserting to database!!!")
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleFindAll = async (req: express.Request, res: express.Response) => {
    const { page = "0", limit = "1" } = req.query
    try {
        const result = await m.meeting.findAll(page, limit)
        return res.json({ message: "success", data: result })
    } catch (e) {
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleFindById = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: "id has not been provided!!!" })
        const result = await m.meeting.findById(id)
        if (!result) return res.status(200).json({ message: "unable to find data from provided id!!!" })
        return res.json({ message: "success", data: result })
    } catch (e) {
        return res.status(500).json({ message: 'server error' })
    }
}

// export const handleFindByUserId = async (req: express.Request, res: express.Response) => {
//     try {
//         const { id } = req.params
//         if (!id) return res.status(400).json({ message: "user id has not been provided!!!" })
//         const result = await m.meeting.findByUserId(id)
//         if (!result) return res.status(200).json({ message: "unable to find data from provided user id!!!" })
//         return res.json({ message: "success", data: result })
//     } catch (e) {
//         return res.status(500).json({ message: 'server error' })
//     }
// }

export const handleUpdateStatus = async (req: express.Request, res: express.Response) => {
    try {
        const { id, status = '' }: { id: string, status: string } = req.body
        const upperStatus = typeof ('') === 'string' ? status.toUpperCase() : ''
        if (!status) return res.status(400).json({ message: "status has not been provided!!!" })
        const filter = ['NEW', 'CANCEL'].filter(d => d === upperStatus)
        if (!filter.length) return res.status(400).json({ message: 'status can be either [NEW or CANCEL]!!! ' })

        const search = await m.meeting.findById(id)
        if (!search) return res.status(400).json({ message: "data doesn't exist with id!!!" })
        const result = await m.meeting.updateStatus(id, upperStatus)
        if (!result) return res.status(200).json({ message: "unable to update status!!!" })
        return res.json({ message: "success", data: { status: result.status } })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'server error only [NEW, CANCEL] are possible!!!' })
    }
}

export const handleUpdateWaiting = async (req: express.Request, res: express.Response) => {
    try {
        const { id, waiting }: { id: string, waiting: boolean } = req.body
        if (waiting === null) return res.status(400).json({ message: "waiting has not been provided!!!" })
        const search = await m.meeting.findById(id)
        if (!search) return res.status(400).json({ message: "data doesn't exist with id!!!" })
        const result = await m.meeting.updateWaitingRoom(id, waiting)
        if (!result) return res.status(200).json({ message: "unable to update waiting room enabled!!!" })
        return res.json({ message: "success", data: { waiting: result.waiting_room_enabled } })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'server error only [true or false] is possible!!!' })
    }
}

export const handleJoinMeeting = async (req: express.Request, res: express.Response) => {
    const { identity = '', id = '', metadata = '', ttl = "10", username = "" } = req.body
    const { accesstoken } = req.headers as { [key: string]: string }
    const grpcAppId = req.headers['grpc-metadata-app-id'] as string
    const grpcWebKey = req.headers['grpc-metadata-web-api-key'] as string
    const config = {
        token: 'get',
        url: `${everestUrl}/account/profiles`,
        headers: {
            'Authorization': `Bearer ${accesstoken}`,
            'grpc-metadata-app-id': grpcAppId,
            'grpc-metadata-web-api-key': grpcWebKey
        }
    };
    try {
        const search = await m.meeting.findById(id)
        if (!search?.room) return res.status(404).json({ message: 'meeting doesn\'t exists!!!' })
        const countryCode: string = search.country
        if (!accesstoken) {
            // user is not login
            if (!id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
            else if (!username) return res.status(400).json({ message: 'user name is not provided!!!' })
            else if (!identity) return res.status(400).json({ message: 'user identity is not provided!!!' })
            // if waiting=true return waiting token
            if (search?.waiting_room_enabled) {
                const result = await m.waiting.create({
                    meeting_id: id,
                    user_id: identity,
                    user_name: username
                })
                return res.status(200).json({
                    message: 'success',
                    status: result.status
                })
            }
            // if waiting=false return member token
            return res.status(200).json({
                message: 'success',
                access_token: util.obtainMemberToken(search.room, identity, apiKey, apiSecret, username) || 'error',
                url: util.urls[countryCode]
            })
        }
        const result = await axios.default(config)
        const userId = result.data?.user_profile?.user_id || identity
        const userName = result.data?.user_profile?.displayName || username
        if (!id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
        const { hosts = [], members = [] } = search?.participants as { hosts: [], members: [] }

        const searchHost = hosts.filter(d => d === userId)
        if (searchHost.length) return res.status(200).json(
            {
                message: 'success',
                access_token: util.obtainAdminToken(search.room, userId, apiKey, apiSecret, userName, metadata, ttl) || 'error',
                url: util.urls[countryCode]
            })

        const searchMember = members.filter(d => d === userId)
        if (searchMember.length) return res.status(200).json({
            message: 'success',
            access_token: util.obtainMemberToken(search.room, userId, apiKey, apiSecret, userName) || 'error',
            url: util.urls[countryCode]
        })
        if (search?.waiting_room_enabled) {
            // TODO: fill the waiting table return status
            const result = await m.waiting.create({
                meeting_id: id,
                user_id: userId,
                user_name: userName
            })
            return res.status(200).json({ message: 'success', status: result.status })
        }
        // if waiting=false return member token
        return res.status(200).json({
            message: 'success',
            access_token: util.obtainMemberToken(search.room, userId, apiKey, apiSecret, userName) || 'error',
            url: util.urls[countryCode]
        })
    } catch (e) {
        console.error(e)
        return res.status(401).json({ message: "unauthorized user!!!" })
    }
}

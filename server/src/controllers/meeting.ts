import axios from "axios";
import * as express from "express"
import { RoomServiceClient } from 'livekit-server-sdk';
import { meeting } from "../databases";
import * as token from "../utils"

const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'

interface Meeting {
    room: string,
    title: string,
    user_id: string,
    description?: string,
    participants: Object,
    start_date: Date,
    status: string,
    cover_image?: string,
    app_id: string,
    country: string,
    waiting_room_enabled: boolean
}

export const handleStartMeeting = async (req: express.Request, res: express.Response) => {
    try {
        const {
            room,
            title,
            user_id,
            description,
            participants,
            start_date = new Date(),
            status,
            cover_image = "",
            app_id,
            country,
            waiting_room_enabled
        }: Meeting = req.body
        if (!room) return res.status(400).json({ message: 'room is not provided!!!' })
        else if (!title) return res.status(400).json({ message: 'title is not provided!!!' })
        else if (!description) return res.status(400).json({ message: 'description is not provided!!!' })
        else if (!participants) return res.status(400).json({ message: 'participants is not provided!!!' })
        else if (!start_date) return res.status(400).json({ message: 'start_date is not provided!!!' })
        else if (!status) return res.status(400).json({ message: 'status is not provided!!!' })
        else if (!app_id) return res.status(400).json({ message: 'app_id is not provided!!!' })
        else if (!country) return res.status(400).json({ message: 'country is not provided!!!' })
        else if (!waiting_room_enabled) return res.status(400).json({ message: 'waiting room enabled is not provided!!!' })
        try {
            const search = await meeting.findByRoom(room)
            if (search) return res.status(400).json({ message: "data already exists!!!" })
            const result = await meeting.create(req.body)
            return res.status(200).json({ message: "success", data: result })
        } catch (e: any) {
            return res.status(400).json({ message: "error while creating!!!", error: e.message })
        }
    } catch (e) {
        console.log(e)
        console.log("inserting to database!!!")
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleFindAll = async (req: express.Request, res: express.Response) => {
    const { page = "0", limit = "1" } = req.query
    try {
        const result = await meeting.findAll(page, limit)
        return res.json({ message: "success", data: result })
    } catch (e) {
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleFindByUUID = async (req: express.Request, res: express.Response) => {
    try {
        const { uuid } = req.params
        if (!uuid) return res.status(400).json({ message: "uuid has not been provided!!!" })
        const result = await meeting.findByUUID(uuid)
        if (!result) return res.status(200).json({ message: "unable to find data from provided uuid!!!" })
        return res.json({ message: "success", data: result })
    } catch (e) {
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleFindByUserId = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: "user id has not been provided!!!" })
        const result = await meeting.findByUserId(id)
        if (!result) return res.status(200).json({ message: "unable to find data from provided user id!!!" })
        return res.json({ message: "success", data: result })
    } catch (e) {
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleUpdateStatus = async (req: express.Request, res: express.Response) => {
    try {
        const { uuid, status } = req.body
        if (!status) return res.status(400).json({ message: "status has not been provided!!!" })
        const search = await meeting.findByUUID(uuid)
        if (!search) return res.status(400).json({ message: "data doesn't exist with UUID!!!" })
        const result = await meeting.updateStatus(uuid, status)
        if (!result) return res.status(200).json({ message: "unable to update status!!!" })
        return res.json({ message: "success", data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'server error only [NEW, PENDING, CANCEL] are possible!!!' })
    }
}

export const handleUpdateWaiting = async (req: express.Request, res: express.Response) => {
    try {
        const { uuid, waiting }: { uuid: string, waiting: boolean } = req.body
        if (waiting === null) return res.status(400).json({ message: "waiting has not been provided!!!" })
        const search = await meeting.findByUUID(uuid)
        if (!search) return res.status(400).json({ message: "data doesn't exist with UUID!!!" })
        const result = await meeting.updateWaitingRoom(uuid, waiting)
        if (!result) return res.status(200).json({ message: "unable to update waiting room enabled!!!" })
        return res.json({ message: "success", data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'server error only [true or false] is possible!!!' })
    }
}

export const handleJoinMeeting = async (req: express.Request, res: express.Response) => {
    const { access_token } = req.headers
    const { uuid } = req.body
    if (!uuid) return res.status(400).json({ message: 'room uuid is not provided!!!' })
    const config = {
        method: 'get',
        url: 'https://everestbackend-api.hamropatro.com/account/profiles',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'grpc-metadata-app-id': 'hamropatro',
            'grpc-metadata-web-api-key': 'ce15f30b-fb9b-4baf-b0f1-6ab88b3baa2f'
        }
    };
    try {
        const result = await axios(config)
        const user_id = result.data.user_profile.user_id
        const search = await meeting.findByUUID(uuid)
        const { hosts = [], members = [] } = search?.participants as { hosts: [], members: [] }
        const searchHost = hosts.filter(d => d === user_id)
        if (searchHost.length) return res.send("admin token!!!")
        const searchMember = members.filter(d => d === user_id)
        if (searchMember.length) return res.send("member token!!!")
        if (search?.waiting_room_enabled) return res.send('waiting token!!!')
        else return res.send('member token!!!')
        // if waiting=true return waiting token
        // if waiting=false return member token
        // if user_id not in list but is new id append it to member list
        res.send("member token!!!")
        console.log(hosts, members)
        // const roomSearch = await meeting.findByRoom(room)
        // console.log(roomSearch)
        if (!search) console.log('user doesn\'t exists in table!!!')
        const { name }: { name: string } = req.body
    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: "unauthorized user!!!" })
    }
    try {
        // TODO: return livekit server url based on country
        // TODO: if waiting room not enabled just let member to enter
        // TODO: if waiting room is enabled enter the user but don't let them to publish or subscribe
        // TODO: validate access_token and get user

        return res.json({ message: "success" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'server error only [true or false] is possible!!!' })
    }
}
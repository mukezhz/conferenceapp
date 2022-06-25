import * as axios from "axios";
import * as express from "express"
import * as j from "../databases";
import * as token from "../utils"

const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'

interface JoinCode {
    meeting_id: string
    expire_time: string
    identity: string
}

export const handleGenerateCode = async (req: express.Request, res: express.Response) => {
    const { meeting_id, expire_time, identity }: JoinCode = req.body
    const { access_token } = req.headers
    const config = {
        token: 'get',
        url: 'https://everestbackend-api.hamropatro.com/account/profiles',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'grpc-metadata-app-id': 'hamropatro',
            'grpc-metadata-web-api-key': 'ce15f30b-fb9b-4baf-b0f1-6ab88b3baa2f'
        }
    };
    if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
    else if (!expire_time) return res.status(400).json({ message: 'expire time is not provided!!!' })
    const time = Number(expire_time)
    if (!time) return res.status(400).json({ message: 'expire time is not time stamp number!!!' })
    let requiredIdentity = ''
    try {
        const search = await j.joinCode.findByMeetingId(meeting_id, identity)
        console.log(search)
        if (search) return res.status(200).json({ message: 'data already exists!!!' })
        if (access_token) {
            const result = await axios.default(config)
            const userName = result.data?.user_profile?.displayName || null
            const user_id = result.data?.user_profile?.user_id || null
            requiredIdentity = user_id
        }
        requiredIdentity = requiredIdentity || identity
        if (!requiredIdentity) return res.status(400).json({ message: 'user\'s identity is not provided!!!' })
        const meet = await j.meeting.findById(meeting_id)
        if (!meet) return res.status(404).json({ message: 'meeting dosen\'t exist by provided meeting id!!!' })
        const data = await j.joinCode.create({ ...req.body, identity: requiredIdentity, expire_time: new Date(time) })
        return res.status(200).json({ message: "success", data: { join_code: data.join_code } })
    } catch (e: any) {
        // console.log(e)
        console.log("inserting to database!!!")
        return res.status(500).json({ message: e.message })
    }
}

// export const handleFindAll = async (req: express.Request, res: express.Response) => {
//     const { page = "0", limit = "1" } = req.query
//     try {
//         const result = await meeting.findAll(page, limit)
//         return res.json({ message: "success", data: result })
//     } catch (e) {
//         return res.status(500).json({ message: 'server error' })
//     }
// }

export const handleFindByJoinCode = async (req: express.Request, res: express.Response) => {
    try {
        const { join_code } = req.params
        if (!join_code) return res.status(400).json({ message: "id has not been provided!!!" })
        const result = await j.joinCode.findByJoinCode(join_code)
        if (!result) return res.status(200).json({ message: "unable to find data from provided join_code!!!" })
        return res.json({ message: "success", data: result })
    } catch (e) {
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleFindMeetingIdJoinCode = async (req: express.Request, res: express.Response) => {
    const { meeting_id, join_code } = req.params
    const { access_token } = req.headers
    const { identity, name } = req.body
    const config = {
        token: 'get',
        url: 'https://everestbackend-api.hamropatro.com/account/profiles',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'grpc-metadata-app-id': 'hamropatro',
            'grpc-metadata-web-api-key': 'ce15f30b-fb9b-4baf-b0f1-6ab88b3baa2f'
        }
    };
    if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
    else if (!join_code) return res.status(400).json({ message: 'join code is not provided!!!' })
    let requiredIdentity = ''
    let requiredName = ''
    try {
        if (access_token) {
            const result = await axios.default(config)
            const userName = result.data?.user_profile?.displayName || null
            const user_id = result.data?.user_profile?.user_id || null
            requiredIdentity = user_id
            requiredName = userName
        }
        requiredIdentity = requiredIdentity || identity
        requiredName = requiredName || name
        if (!requiredIdentity) return res.status(400).json({ message: 'user\'s identity is not provided!!!' })
        else if (!requiredName) return res.status(400).json({ message: 'user\'s name is not provided!!!' })
        const search = await j.joinCode.findByMeetingJoinCode(meeting_id, requiredIdentity, join_code)
        if (!search) return res.status(404).json({ message: 'meeting dosen\'t exist by provided meeting id and room name!!!' })
        const meet = await j.meeting.findById(meeting_id)
        if (!meet) return res.status(404).json({ message: 'meeting dosen\'t exist by provided meeting id!!!' })
        if ((new Date().getTime() - search.expire_time.getTime()) > 0) return res.status(200).json({ message: 'date have been expired!!!' })
        const memberToken = token.obtainMemberToken(meet.room, requiredIdentity, apiKey, apiSecret, requiredName)
        return res.status(200).json({ message: "success", data: { token: memberToken, url: livekitHost.replace('https', 'wss') } })
    } catch (e: any) {
        // console.log(e)
        console.log("inserting to database!!!")
        return res.status(500).json({ message: e.message })
    }
}

// export const handleUpdateStatus = async (req: express.Request, res: express.Response) => {
//     try {
//         const { id, status } = req.body
//         if (!status) return res.status(400).json({ message: "status has not been provided!!!" })
//         const search = await meeting.findById(id)
//         if (!search) return res.status(400).json({ message: "data doesn't exist with id!!!" })
//         const result = await meeting.updateStatus(id, status)
//         if (!result) return res.status(200).json({ message: "unable to update status!!!" })
//         return res.json({ message: "success", status: result.status })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({ message: 'server error only [NEW, PENDING, CANCEL] are possible!!!' })
//     }
// }

// export const handleUpdateWaiting = async (req: express.Request, res: express.Response) => {
//     try {
//         const { id, waiting }: { id: string, waiting: boolean } = req.body
//         if (waiting === null) return res.status(400).json({ message: "waiting has not been provided!!!" })
//         const search = await meeting.findById(id)
//         if (!search) return res.status(400).json({ message: "data doesn't exist with id!!!" })
//         const result = await meeting.updateWaitingRoom(id, waiting)
//         if (!result) return res.status(200).json({ message: "unable to update waiting room enabled!!!" })
//         return res.json({ message: "success", waiting: result.waiting_room_enabled })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({ message: 'server error only [true or false] is possible!!!' })
//     }
// }

// export const handleJoinMeeting = async (req: express.Request, res: express.Response) => {
//     const { access_token } = req.headers
//     const { name = '', identity = '', id = '', metadata = '', ttl = "10" } = req.body
//     const search = await meeting.findById(id)
//     if (!search?.room) return res.status(404).json({ message: 'room doesn\'t exists!!!' })
//     if (!access_token) {
//         // user is not login
//         if (!id) return res.status(400).json({ message: 'room id is not provided!!!' })
//         else if (!name) return res.status(400).json({ message: 'user name is not provided!!!' })
//         else if (!identity) return res.status(400).json({ message: 'user identity is not provided!!!' })
//         // if waiting=true return waiting token
//         if (search?.waiting_room_enabled) return res.status(200).json({
//             message: 'success',
//             access_token: token.obtainWaitingToken(search.room, identity, apiKey, apiSecret, name) || 'error',
//             token: "waiting"
//         })
//         // if waiting=false return member token
//         return res.status(200).json({
//             message: 'success',
//             access_token: token.obtainMemberToken(search.room, identity, apiKey, apiSecret, name) || 'error',
//             token: "member"
//         })
//     }
//     if (!id) return res.status(400).json({ message: 'room id is not provided!!!' })
//     const config = {
//         token: 'get',
//         url: 'https://everestbackend-api.hamropatro.com/account/profiles',
//         headers: {
//             'Authorization': `Bearer ${access_token}`,
//             'grpc-metadata-app-id': 'hamropatro',
//             'grpc-metadata-web-api-key': 'ce15f30b-fb9b-4baf-b0f1-6ab88b3baa2f'
//         }
//     };
//     try {
//         const result = await axios.default(config)
//         const user_id = result.data?.user_profile.user_id
//         const userName = result.data?.user_profile.displayName
//         const { hosts = [], members = [] } = search?.participants as { hosts: [], members: [] }

//         const searchHost = hosts.filter(d => d === user_id)
//         if (searchHost.length) return res.status(200).json(
//             {
//                 message: 'success',
//                 access_token: token.obtainAdminToken(search.room, user_id, apiKey, apiSecret, userName, metadata, ttl) || 'error',
//                 token: "host"
//             })

//         const searchMember = members.filter(d => d === user_id)
//         if (searchMember.length) return res.status(200).json({
//             message: 'success',
//             access_token: token.obtainMemberToken(search.room, user_id, apiKey, apiSecret, userName) || 'error',
//             token: "member"
//         })
//         // if waiting=true return waiting token
//         if (search?.waiting_room_enabled) return res.status(200).json({
//             message: 'success',
//             access_token: token.obtainWaitingToken(search.room, user_id, apiKey, apiSecret, userName) || 'error',
//             token: "waiting"
//         })
//         // if waiting=false return member token
//         return res.status(200).json({
//             message: 'success',
//             access_token: token.obtainMemberToken(search.room, user_id, apiKey, apiSecret, userName) || 'error',
//             token: "member"
//         })
//     } catch (e) {
//         console.log(e)
//         return res.status(401).json({ message: "unauthorized user!!!" })
//     }
// }

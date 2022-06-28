import * as axios from "axios";
import * as express from "express"
import * as j from "../databases";
import * as util from "../utils"

const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiUrl = process.env.API_URL || 'https://test.com'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'
const everestUrl = process.env.EVEREST_URL || 'https://example.com'

interface JoinCode {
    meeting_id: string
    expire_time: string
    identity: string
}

export const handleGenerateCode = async (req: express.Request, res: express.Response) => {
    const { meeting_id, expire_time, identity }: JoinCode = req.body
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
    if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
    else if (!expire_time) return res.status(400).json({ message: 'expire time is not provided!!!' })
    const time = Number(expire_time)
    if (!time) return res.status(400).json({ message: 'expire time is not time stamp number!!!' })
    let requiredIdentity = ''
    try {
        const search = await j.joinCode.findByMeetingId(meeting_id, identity)
        if (search) return res.status(200).json({ message: 'data already exists!!!' })
        if (accesstoken) {
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
        return res.status(200).json({ message: "success", data: { join_code: data.join_code, join_url: `${apiUrl}/api/meetings/${meeting_id}/${data.join_code}` } })
    } catch (e: any) {
        // console.error(e)
        console.error("inserting to database!!!")
        return res.status(500).json({ message: e.message })
    }
}

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
    const { identity, name } = req.body
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
    if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
    else if (!join_code) return res.status(400).json({ message: 'join code is not provided!!!' })
    let requiredIdentity = ''
    let requiredName = ''
    try {
        if (accesstoken) {
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
        const countryCode = meet.country
        if ((new Date().getTime() - search.expire_time.getTime()) > 0) return res.status(200).json({ message: 'date have been expired!!!' })
        const memberToken = util.obtainMemberToken(meet.room, requiredIdentity, apiKey, apiSecret, requiredName)
        return res.status(200).json({ message: "success", data: { token: memberToken, url: util.urls[countryCode] } })
    } catch (e: any) {
        console.error(e)
        console.error("inserting to database!!!")
        return res.status(500).json({ message: "token expires!!!" })
    }
}

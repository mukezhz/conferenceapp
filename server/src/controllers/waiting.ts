import * as axios from "axios";
import e, * as express from "express"
import { RoomServiceClient } from 'livekit-server-sdk';
import * as w from "../databases";
import * as util from "../utils"

const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'
const everestUrl = process.env.EVEREST_URL || 'https://example.com'


export const handleInitiateWaiting = async (req: express.Request, res: express.Response) => {
    const { meeting_id, user_id, username, status = "WAITING", }: { meeting_id: string, user_id: string, username: string, status: string } = req.body
    const upperStatus = typeof ('') === 'string' ? status.toUpperCase() || 'WAITING' : ''
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
    let requiredId = user_id
    let requiredName = username
    try {
        if (status) {
            const filter = ['WAITING', 'APPROVED', 'REJECTED'].filter(d => d === upperStatus)
            if (!filter.length) return res.status(400).json({ message: 'status can be either [WAITING or APPROVED or REJECTED]!!! ' })
        }
        if (accesstoken) {
            const result = await axios.default(config)
            const userName = result.data?.user_profile?.displayName || null
            const userId = result.data?.user_profile?.user_id || null
            requiredId = userId || user_id
            requiredName = userName || username
        }
        if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
        else if (!requiredId) return res.status(400).json({ message: 'user id is not provided!!!' })
        else if (!requiredName) return res.status(400).json({ message: 'username is not provided!!!' })
        try {
            const search = await w.waiting.find(meeting_id, requiredId)
            if (search) return res.status(400).json({ message: "data already exists!!!" })
            const result = await w.waiting.create({ meeting_id: meeting_id, user_id: requiredId, user_name: requiredName, status: upperStatus })
            return res.status(200).json({ message: "success", data: { status: result.status } })
        } catch (e: any) {
            return res.status(400).json({ message: "error while creating!!!", error: e.message })
        }
    } catch (e) {
        console.error(e)
        console.error("inserting to database!!!")
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleUpdateWaitingStatus = async (req: express.Request, res: express.Response) => {
    const { meeting_id, user_id, username, status = "", }: { meeting_id: string, user_id: string, username: string, status: string } = req.body
    const upperStatus = typeof ('') === 'string' ? status.toUpperCase() : ''
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
    let requiredId = user_id
    let requiredName = username
    try {
        const filter = ['WAITING', 'APPROVED', 'REJECTED'].filter(d => d === upperStatus)
        if (!filter.length) return res.status(400).json({ message: 'status can be either [WAITING or APPROVED or REJECTED]!!! ' })
        if (accesstoken) {
            const result = await axios.default(config)
            const userName = result.data?.user_profile?.displayName || null
            const userId = result.data?.user_profile?.user_id || null
            requiredId = userId || user_id
            requiredName = userName || username
        }
        if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
        else if (!user_id) return res.status(400).json({ message: 'user id is not provided!!!' })
        else if (!username) return res.status(400).json({ message: 'username is not provided!!!' })
        try {
            const meeting = await w.meeting.findById(meeting_id)
            if (!meeting) return res.status(404).json({ message: 'meeting doesn\'t exist by provided meeting id!!!' })
            const search = await w.waiting.find(meeting_id, requiredId)
            console.log('search', search)
            if (!search) return res.status(400).json({ message: "unable to find in waiting!!!" })
            // const result = await w.waiting.updateStatus(meeting_id, requiredId, upperStatus)
            let data = {}
            if (upperStatus === 'APPROVED') {
                const memberToken = util.obtainMemberToken(meeting.room, requiredId, apiKey, apiSecret, requiredName)
                const result = await w.waiting.updateStatusToken(meeting_id, requiredId, upperStatus, memberToken)
                data = { status: result.status, access_token: memberToken }
            } else {
                const result = await w.waiting.updateStatus(meeting_id, requiredId, upperStatus)
                data = { status: result.status }
            }
            return res.status(200).json({ message: "success", data: data })
        } catch (e: any) {
            return res.status(400).json({ message: "error while updating status!!!", error: e.message })
        }
    } catch (e) {
        console.error(e)
        console.error("inserting to database!!!")
        return res.status(500).json({ message: 'server error' })
    }
}

export const handleApproveAll = async (req: express.Request, res: express.Response) => {
    const { meeting_id } = req.params
    if (!meeting_id) return res.status(400).json({ message: 'meeting id is not provided!!!' })
    try {
        const results = await w.waiting.findByStatus(meeting_id, 'WAITING')
        const search = await w.meeting.findById(meeting_id)
        if (!results.length) return res.status(400).json({ message: "all request has already been approved!!!" })
        if (!search) return res.status(400).json({ message: "meeting doesn't exists !!!" })
        const asyncForLoop = async (results: any) => {
            await Promise.all(results.map(async (result: any) => {
                const memberToken = util.obtainMemberToken(search.room, result.user_id, apiKey, apiSecret, result.user_name)
                return await w.waiting.updateStatusToken(meeting_id, result.user_id, 'APPROVED', memberToken)
            }))
        }
        await asyncForLoop(results)
        return res.status(201).json({ message: 'success' })
    } catch (e: any) {
        return res.status(500).json({ message: 'server error!!!' })
    }
}
import * as livekit from 'livekit-server-sdk';
import * as express from "express"
import * as r from "../utils"
import * as egress from "livekit-server-sdk/dist/proto/livekit_egress"
import * as service from "../databases/services"

const livekitHost = process.env.LIVEKIT_URL || 'hostname'
const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'


export const handleStartLiveStream = async (req: express.Request, res: express.Response) => {
    try {
        const {
            hostname = '',
            identity = '',
            email = '',
            platform = '',
            streamKey = '',
            roomName = '',
            layout = '',
            options = undefined,
            audioOnly = undefined,
            videoOnly = undefined,
            customBaseUrl = ''
        }: {
            hostname: string,
            identity: string,
            email: string,
            platform: string,
            streamKey: string,
            roomName: string,
            layout: string,
            options: any,
            videoOnly: any,
            audioOnly: any,
            customBaseUrl: string
        } = req.body
        const ec = <livekit.EgressClient>r.getEgressClient(livekitHost, apiKey, apiSecret)
        let newOptions: egress.EncodingOptions = {
            /** (default 1920) */
            width: 1280,
            /** (default 1080) */
            height: 720,
            /** (default 24) */
            depth: 24,
            /** (default 30) */
            framerate: 30,
            /** (default OPUS) */
            audioCodec: egress.AudioCodec.OPUS,
            /** (default 128) */
            audioBitrate: 128,
            /** (default 44100) */
            audioFrequency: 44100,
            /** (default H264_MAIN) */
            videoCodec: egress.VideoCodec.H264_MAIN,
            /** (default 4500) */
            videoBitrate: 4500
        }
        const egressInfo: egress.EgressInfo | undefined = await r.startStreamEgress(ec, platform, streamKey, roomName, layout, 0, audioOnly, videoOnly, customBaseUrl)
        if (!egressInfo) return res.status(500).json({ message: 'unable to start streaming!!!' })
        const stream = new service.StreamService()
        try {
            await stream.createStream({
                hostName: hostname,
                identity: identity,
                email: email,
                roomName: roomName,
                roomId: egressInfo.roomId,
                egressId: egressInfo.egressId,
                rooms: {
                    name: roomName,
                    egress: egressInfo
                }
            })
        } catch (e) {
            console.log('error', e)
        }
        // model.StreamModel.create({

        // })
        return res.status(200).json({ message: 'success', egress: egressInfo })
    } catch (e) {
        console.log(e)
        console.log('[Controller]: error while handling start live stream!!!')
        return res.status(500).json({ message: 'error while starting stream!!!' })
    }
}

export const handleStopLiveStream = async (req: express.Request, res: express.Response) => {
    try {
        const ec = <livekit.EgressClient>r.getEgressClient(livekitHost, apiKey, apiSecret)
        const { egressId = '' }: { egressId: string } = req.body
        const egressInfo = await r.stopEgress(ec, egressId)
        if (!egressInfo) return res.status(500).json({ message: 'unable to stop streaming!!!' })
        const stream = new service.StreamService()
        const result = await stream.updateStreamEndDate(egressId, new Date().toISOString())
        return res.status(200).json({ message: 'success', egress: result })
    } catch (e) {
        console.log(e)
        console.log('[Controller]: error while handling stop live stream!!!')
        return res.status(500).json({ message: 'error while stopping stream!!!' })
    }
}

export const handleUpdateStream = async (req: express.Request, res: express.Response) => {
    try {
        const {
            egressId = '',
            platform = '',
            streamKey = '',
            addOutputUrls = undefined,
            removeOutputUrls = undefined
        } = req.body
        const ec = <livekit.EgressClient>r.getEgressClient(livekitHost, apiKey, apiSecret)
        const egressInfo = await r.updateStream(ec, egressId, platform, streamKey, addOutputUrls, removeOutputUrls)
        if (!egressInfo) return res.status(500).json({ message: 'unable to update streaming!!!' })
        return res.status(200).json({ message: 'success' })
    } catch (e) {
        console.log(e)
        console.log('[Controller]: error while handling update stream!!!')
        return res.status(500).json({ message: 'error while updating stream!!!' })
    }
}
export const handleGetStreamInfo = async (req: express.Request, res: express.Response) => {
    const stream = new service.StreamService()
    const { roomName = '', email = '' }: { roomName: string, email: string } = req.body
    try {
        if (!roomName) res.status(400).json({ message: 'room name is not provided!!!' })
        const streamInfos = await stream.findStreamByRoomName(roomName, email)
        if (!streamInfos) return res.status(500).json({ message: 'unable to find stream!!!' })
        return res.status(200).json({ message: 'success', streams: streamInfos })
    } catch (e) {
        console.log(e)
        console.log('[Controller]: error while handling update stream!!!')
        return res.status(500).json({ message: 'error while fetching stream info!!!' })
    }
}
import * as mongoose from "mongoose"
import * as livekit from "livekit-server-sdk/dist/proto/livekit_egress"

export type Room = {
    name: string
    egress: livekit.EgressInfo
    startTime?: string
    endTime?: string
}

export interface Stream {
    identity: string
    rooms?: Room
    roomId: string
    egressId: string
    roomName: string
    hostName: string
    email?: string
}
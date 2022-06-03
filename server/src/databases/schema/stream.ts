import * as livekit from "livekit-server-sdk/dist/proto/livekit_egress"
import * as typegoose from "@typegoose/typegoose"


class Room {
    @typegoose.prop({ required: true })
    public name!: string

    @typegoose.prop({ required: true, default: new Date().toISOString() })
    public startTime!: string

    @typegoose.prop({ required: false })
    public endTime!: string


    @typegoose.prop({ required: false })
    public egress!: livekit.EgressInfo
}

@typegoose.modelOptions({ schemaOptions: { collection: 'Streams', timestamps: true } })
export class StreamSchema {
    @typegoose.prop({ required: true, unique: true })
    public roomId!: string

    @typegoose.prop({ required: true, unique: true })
    public egressId!: string

    @typegoose.prop({ required: true, unique: true })
    public roomName!: string

    @typegoose.prop({ required: true })
    public hostName!: string;

    @typegoose.prop({ required: false, unique: false })
    public email?: string

    @typegoose.prop({ required: true })
    public identity!: string

    @typegoose.prop({ type: () => Room, required: true })
    public rooms!: Room

    public createdAt?: Date;

    public updatedAt?: Date;
}
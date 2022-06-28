import * as type from "../../interfaces/stream"
import * as model from "../model"
import * as util from "../utils"
import * as exception from "../exceptions"


export class StreamService {

  public async findAllStream(): Promise<type.Stream[]> {
    const streams: type.Stream[] = await model.StreamModel.find();
    return streams;
  }

  public async findStreamByRoomName(roomName: string, email: string): Promise<type.Stream[] | null> {
    if (util.isEmpty(roomName)) throw new exception.HttpException(400, "[FIND STREAM]: Room name has not been provided!!!");
    try {
      const streams: type.Stream[] | null = await model.StreamModel.find({ roomName: roomName, email: email });
      if (!streams.length) return null;
      return streams;
    } catch (e) {
      console.error(e, "[Error]: find stream by room name!!!")
      throw new exception.HttpException(409, "[GET]: Stream with provided identity doesn't exists!!!");
    }
  }

  public async createStream(streamData: type.Stream): Promise<type.Stream | null> {
    if (util.isEmpty(streamData)) throw new exception.HttpException(400, "[CREATE]: Error in streamData!!!");
    const findStream: type.Stream | null = await model.StreamModel.findOne({ identity: streamData.identity });
    if (findStream)
      await model.StreamModel.findOneAndUpdate({ identity: streamData.identity }, streamData)
    try {
      const createStreamData = await model.StreamModel.create({
        ...streamData
      })
      return createStreamData;
    } catch (e) {
      console.error(e, "[CREATE]: error while creating stream!!!")
      throw new exception.HttpException(409, `${streamData.email} already exists!!!`);
    }
  }

  public async updateStreamEndDate(egressId: string, endDate: string): Promise<type.Stream | null> {
    if (util.isEmpty(endDate)) throw new exception.HttpException(400, "[UPDATE USER]: SteamData is empty!!!");
    const stream: type.Stream = await model.StreamModel.findOne({ egressId: egressId }) as type.Stream;
    if (egressId && endDate) {
      if (!stream) return null
      if (stream && stream.egressId !== egressId) return null
    } else throw new exception.HttpException(400, 'egress id or end date is not provided!!!')
    try {
      stream!.rooms!.endTime = endDate
      const updateStreamByRoomName: type.Stream | null = await model.StreamModel.findOneAndUpdate({ egressId: egressId }, stream)
      if (!updateStreamByRoomName) return null
      return updateStreamByRoomName;
    } catch (e) {
      console.error(e, "[UPDATE]: error in stream update end date!!!");
      throw new exception.HttpException(409, "Updation is not successful!!!");
    }
  }

  public async deleteStream(identity: string): Promise<type.Stream | null> {
    try {
      const deleteStreamByIdentity: type.Stream | null = await model.StreamModel.findOneAndDelete({ identity: identity });
      if (!deleteStreamByIdentity) return null
      return deleteStreamByIdentity;
    } catch (e) {
      console.error(e, "[DELETE]: error in delete stream!!!")
      throw new exception.HttpException(409, "You're not user");
    }
  }
}

export default StreamService; 
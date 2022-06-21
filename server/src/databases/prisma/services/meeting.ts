import prisma from "../init";

const { meeting } = prisma

export const create = async (data: any) => {
    try {
        return await meeting.create({
            data: data
        })
    } catch (e: any) {
        console.log("[service]: error while creating!!!", e)
        throw new Error("unique containt vialoation!!!")
    }
}


export const remove = async (uuid: string) => {
    try {
        return await meeting.delete({
            where: {
                uuid: uuid,
            },
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const update = async (data: any) => {
    try {
        return await meeting.update({
            where: {
                uuid: data.uuid,
            },
            data: data,
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const updateStatus = async (uuid: string, status: any) => {
    try {
        return await meeting.update({
            where: {
                uuid: uuid,
            },
            data: {
                status: status
            },
        })
    } catch (e: any) {
        console.log(e)
        throw new Error(e.message)
    }
}

export const updateWaitingRoom = async (uuid: string, value: boolean) => {
    try {
        return await meeting.update({
            where: {
                uuid: uuid,
            },
            data: {
                waiting_room_enabled: value
            },
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const updateParticipant = async (uuid: string, participants: any) => {
    try {
        return await meeting.update({
            where: {
                uuid: uuid,
            },
            data: {
                participants: participants
            },
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const addParticipant = async (uuid: string, participants: any) => {
    try {
        const uniqueParticipants = meeting.findUnique({
            select: {
                participants
            },
            where: {
                uuid: uuid
            }
        })
        return await meeting.update({
            where: {
                uuid: uuid,
            },
            data: {
                participants: { ...uniqueParticipants, ...participants }
            },
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const findAll = async (cursor: any, limit: any) => {
    let data;
    const cur: any = parseInt(cursor)
    const lim = parseInt(limit) ?? 1
    if (isNaN(cur) || cur === 0) data = undefined; else data = { id: cur };
    try {
        return await meeting.findMany({
            cursor: data,
            take: lim
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const findOne = async (data: any) => {
    try {
        return await meeting.findUnique({
            where: data,
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const findByUUID = async (uuid: string) => {
    try {
        return await meeting.findUnique({
            where: {
                uuid: uuid
            }
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const findByUserId = async (userid: string) => {
    try {
        return await meeting.findUnique({
            where: {
                user_id: userid
            }
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}

export const findByRoom = async (room: string) => {
    try {
        return await meeting.findUnique({
            where: {
                room: room
            }
        })
    } catch (e: any) {
        throw new Error(e.message)
    }
}
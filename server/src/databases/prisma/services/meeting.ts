import * as prisma from "../init";
const { meeting } = prisma.default

export const create = async (data: any) => {
    try {
        return await meeting.create({
            data: data
        })
    } catch (e: any) {
        console.error(e, "[service]: error while creating!!!")
        throw new Error("something went wrong!!!")
    }
}


export const remove = async (uuid: string) => {
    try {
        return await meeting.delete({
            where: {
                id: uuid,
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while removing!!!")
        throw new Error('something went wrong!!!')
    }
}

export const update = async (data: any) => {
    try {
        return await meeting.update({
            where: {
                id: data.uuid,
            },
            data: data,
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating!!!")
        throw new Error('something went wrong!!!')
    }
}

export const updateStatus = async (uuid: string, status: any) => {
    try {
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                status: status
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating status!!!")
        throw new Error('something went wrong!!!')
    }
}

export const updateWaitingRoom = async (uuid: string, value: boolean) => {
    try {
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                waiting_room_enabled: value
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating waiting room!!!")
        throw new Error('something went wrong!!!')
    }
}

export const updateParticipant = async (uuid: string, participants: any) => {
    try {
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                participants: participants
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating participant!!!")
        throw new Error('something went wrong!!!')
    }
}

export const addParticipant = async (uuid: string, participants: any) => {
    try {
        const uniqueParticipants = meeting.findUnique({
            select: {
                participants
            },
            where: {
                id: uuid
            }
        })
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                participants: { ...uniqueParticipants, ...participants }
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while adding participant!!!")
        throw new Error('something went wrong!!!')
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
        console.error(e, "[service]: error while finding all!!!")
        throw new Error('something went wrong!!!')
    }
}

export const findOne = async (data: any) => {
    try {
        return await meeting.findUnique({
            where: data,
        })
    } catch (e: any) {
        console.error(e, "[service]: error while finding one!!!")
        throw new Error('something went wrong!!!')
    }
}

export const findById = async (id: string) => {
    try {
        return await meeting.findUnique({
            where: {
                id: id
            }
        })
    } catch (e: any) {
        console.error(e, "[service]: error while finding by id!!!")
        throw new Error('something went wrong!!!')
    }
}

// export const findByUserId = async (userid: string) => {
//     try {
//         return await meeting.findUnique({
//             where: {
//                 user_id: userid
//             }
//         })
//     } catch (e: any) {
//         throw new Error(e.message)
//     }
// }

export const findByRoom = async (room: string) => {
    try {
        return await meeting.findUnique({
            where: {
                room: room
            }
        })
    } catch (e: any) {
        console.error(e, "[service]: error while finding by room!!!")
        throw new Error('something went wrong!!!')
    }
}
import * as prisma from "../init";
const { meeting } = prisma.default

export const create = async (data: any) => {
    try {
        return await meeting.create({
            data: { ...data, created_at: Date.now(), updated_at: Date.now() }
        })
    } catch (e: any) {
        console.error(e, "[service]: error while creating!!!")
        throw new Error("error while creating!!!")
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
        throw new Error('error while removing!!!')
    }
}

export const update = async (data: any) => {
    try {
        return await meeting.update({
            where: {
                id: data.uuid,
            },
            data: { ...data, updated_at: Date.now() },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating!!!")
        throw new Error('error while updating!!!')
    }
}

export const updateStatus = async (uuid: string, status: any) => {
    try {
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                status: status,
                updated_at: Date.now()
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating status!!!")
        throw new Error('error while updating status!!!')
    }
}

export const updateWaitingRoom = async (uuid: string, value: boolean) => {
    try {
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                waiting_room_enabled: value,
                updated_at: Date.now()
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating waiting room!!!")
        throw new Error('error while updating waiting room!!!')
    }
}

export const updateParticipant = async (uuid: string, participants: any) => {
    try {
        return await meeting.update({
            where: {
                id: uuid,
            },
            data: {
                participants: participants,
                updated_at: Date.now()
            },
        })
    } catch (e: any) {
        console.error(e, "[service]: error while updating participant!!!")
        throw new Error('error while updating participant!!!')
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
        throw new Error('error while adding participant!!!')
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
        throw new Error('error while finding all!!!')
    }
}

export const findOne = async (data: any) => {
    try {
        return await meeting.findUnique({
            where: data,
        })
    } catch (e: any) {
        console.error(e, "[service]: error while finding one!!!")
        throw new Error('error while finding one!!!')
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
        throw new Error('error while finding by id!!!')
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
                room: room,
            }
        })
    } catch (e: any) {
        console.error(e, "[service]: error while finding by room!!!")
        throw new Error('error while finding by room!!!')
    }
}

export const getTokenById = async (meeting_id: string) => {
    try {
        return await meeting.findUnique({
            where: {
                id: meeting_id,
            },
            select: {
                token: true
            }
        })
    } catch (e: any) {
        console.error(e, "[service]: error while fetching token from meeting id!!!")
        throw new Error('error while fetching token from meeting id!!!')
    }
}

export const findByDate = async (startDate: number, endDate: number, appId: string) => {
    try {
        return await meeting.findMany({
            where: {
                app_id: appId,
                start_date: {
                    gt: startDate,
                    lt: endDate
                }
            },
            select: {
                id: true,
                title: true,
                description: true,
                participants: true,
                status: true,
                cover_image: true,
                created_at: true,
                updated_at: true,
                country: true,
                room: true
            }
        })
    } catch (e: any) {
        console.error(e, "[service]: error while finding by room!!!")
        throw new Error('error while finding by room!!!')
    }
}
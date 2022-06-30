import * as express from "express";
import * as db from "../databases"

export async function tokenValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
    const headers = req.headers
    const token = headers?.token
    const { meeting_id = '', id = '' } = req.body
    if (req.method === 'POST' || req.method === 'GET' || req.method === 'PUT' || req.method === 'PATCH') {
        if (token) {
            const search = await db.meeting.getTokenById(meeting_id || id)
            if (!search) return res.status(403).json({ message: 'forbidden!!!' })
        }
    }
    next();
}
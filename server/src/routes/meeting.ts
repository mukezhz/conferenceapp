import * as express from "express"
import * as m from "../controllers"

export const router = express.Router()

// start meeting
router.post('/create', m.handleStartMeeting)

// get all meetings
router.get('/all', m.handleFindAll)

// get meeting by uuid
router.get('/uuid/:uuid', m.handleFindByUUID)

// get meeting by uuid
router.get('/id/:id', m.handleFindByUserId)

// update status
router.patch('/status', m.handleUpdateStatus)

// update waiting room enabled
router.patch('/waiting', m.handleUpdateWaiting)

// update waiting room enabled
router.patch('/join', m.handleJoinMeeting)
import * as express from "express"
import * as w from "../controllers"

export const router = express.Router()

// initiate waiting status
router.post('/init', w.handleInitiateWaiting)

// update status
router.patch('/status', w.handleUpdateWaitingStatus)

// update status
router.get('/approveall/:meeting_id', w.handleApproveAll)
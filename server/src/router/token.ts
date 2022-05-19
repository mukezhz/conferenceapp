import * as express from "express"
import * as t from "../controller"

export const router = express.Router()

// fetch a token with admin privilages
router.post("/admintoken", t.handleAdminToken)

// fetch a token with member privilages
router.post("/membertoken", t.handleMemberToken)

// fetch a token with viewer privilages
router.post("/viewertoken", t.handleViewerToken)

// remove a token from cookie
router.get('/removetoken', t.handleRemoveToken)
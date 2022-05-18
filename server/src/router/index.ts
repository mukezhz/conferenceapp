import * as helloRouter from "./helloWorld"
import * as participantRouter from "./participant"
import * as roomRouter from "./room"
import * as tokenRouter from "./token"
import * as trackRouter from "./track"

import * as express from "express"

export const router = express.Router()

router.use('/', helloRouter.router)
router.use('/participants', participantRouter.router)
router.use('/rooms', roomRouter.router)
router.use('/tokens', tokenRouter.router)
router.use('/tracks', tokenRouter.router)
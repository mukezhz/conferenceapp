import * as express from "express"
import * as controller from "../controller"

export const router = express.Router()

router.get("/", controller.indexHandler);
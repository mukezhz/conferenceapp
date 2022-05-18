import * as express from "express"
import * as t from "../controller"

export const router = express.Router()

//Mutes a track that the participant has published.
router.use('/mutetrack', t.handleMutePublishedTrack)

// Updates a participant's subscription to tracks
router.use('/subscrption', t.handleUpdateSubscriptions)

// Sends data message to participants in the room
router.use('/data', t.handleSendData)

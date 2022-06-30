import * as express from "express";
import { WebhookReceiver } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'

const receiver = new WebhookReceiver(apiKey, apiSecret);

export const handleWebEvent = async (req: express.Request, res: express.Response) => {
    // event is a WebhookEvent object
    try {
        console.log(JSON.stringify(req.body))
        console.log(req.get('Authorization'))
        const event = receiver.receive(req.body, req.get('Authorization'))
        console.log("handle web event", event)
    } catch (e) {
        console.log(e)
        console.log("[error]: something went very wrong")
    }
}
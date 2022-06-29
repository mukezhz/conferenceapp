import * as express from "express";
import { WebhookReceiver } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY || 'apikey'
const apiSecret = process.env.LIVEKIT_API_SECRET || 'apisecret'

const receiver = new WebhookReceiver(apiKey, apiSecret);

export const handleWebEvent = async (req: express.Request, res: express.Response) => {
    // event is a WebhookEvent object
    const event = receiver.receive(req.body, req.get('Authorization'))
    console.log("handle web event", event)
    return res.json({ message: "success", data: event })
}
import * as express from 'express';
import * as dotenv from 'dotenv';
// dotenv.config();
import { Express } from 'express'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import * as router from "./router"

const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));

const port = process.env.PORT || 8000;

app.use("/api", router.router)

app.listen(port, () => {
    console.log("Listening on port ", port);
})

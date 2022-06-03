import * as express from 'express';
import * as dotenv from 'dotenv';
// dotenv.config();
import { Express } from 'express'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import * as router from "./routes"
import * as mongo from "./databases"

const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));

const port = process.env.PORT || 80;
mongo.connectDatabase()

app.get("/", (req: express.Request, res: express.Response) => {
    return res.status(200).json({ message: 'Hello World!!!' })
})

app.use("/api", router.router)

app.listen(port, () => {
    console.log("Listening on port ", port);
})

# Livekit server
- for development
  - Generate config file
    - `docker run --rm -v$PWD:/output livekit/generate --local
`
  - use livekit/livekit-server docker image and livekit.yaml [config file] generated from above and expose the necessary ports
  ```
  docker run -d --name livekit-server --rm -p 7880:7880 \
          -p 7881:7881 \
          -p 7882:7882/udp \
          -v $PWD/livekit.yaml:/livekit.yaml \
          livekit/livekit-server \
          --config /livekit.yaml \
          --dev \
          --node-ip <machine ip>
  ```
- for production
  - [read the official docs](https://docs.livekit.io/deploy)

---
# Livekit Backend server
### TLDR;
- use livekit-server SDK to obtain access token
- use TokenVerifier method to check token
- use RoomServiceClient to create and modify the room property like assigning roomname, timeout, maxParticipants...
- return the created Room

### Long
- set livekit host and port:
  - hostURL -> ip of host where livekit-server is running
  - hostPort -> port of the livekit-server
```
const livekitHost = `http://${hostURL}:${hostPort}/`;
```
- obtain the token using `room name`, `participant name`, `api key` and `api secret`
```
function obtainToken(roomName: string, participantName: string) {
    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
    });
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });

    const token = at.toJwt();
    return token
}
```
- verify the token using `api key` and `api secret` and the `token you obtained`
- if the participant or room is new:
  - respond the access token and set the token into cookie when `/join` endpoint is hitted 
- else
  - respond with token already exists
```
app.post("/join", (req: Request, res: Response) => {
    const { room = "", name = "" } = req.body;
    let message = "";
    if (!room && !name) {
        message = "room and name both are not provided"
    } else if (!room) {
        message = "room is not provided"
    } else if (!name) {
        message = "name is not provided"
    }
    else {
        const token = req.cookies['token']
        if (token) {
            message = "token already exists"
            const user = verifyToken(token)
            const { video, iss, sub, jti } = user
            if ((jti === name || sub === name) && video.room === room) {
                res.json({ message, access_token: token })
                return
            }
        }
        const access_token = obtainToken(room, name)
        res.cookie("token", access_token, {
            // secure: process.env.NODE_ENV !== "devel`opment",
            httpOnly: true,
        });
        res.json({ access_token, message: "success" })
        return
    }
    return res.status(400).json({ message })

})
``` 
- respond the room when hitted to endpoint `/create`
```
app.post("/create", async (req: Request, res: Response) => {
    const { room = "" } = req.body;
    const svc = <RoomServiceClient>roomService(livekitHost)
    const createdRoom = await createRoom(svc, room);
    return res.json(createdRoom);
});
```
-  create room service client
```
function roomService(url: string) {
    try {
        const svc = new RoomServiceClient(livekitHost, apiKey, apiSecret);
        return svc
    } catch (e) {
        console.log("room service creation error!!!");
    }
}
```

- create room using RoomServiceClient
```
async function createRoom(svc: RoomServiceClient, roomName: string, timeout = 5, participantno = 10) {

    const opts = {
        name: roomName,
        emptyTimeout: timeout,
        maxParticipants: participantno
    }
    try {
        const room: Room = await svc.createRoom(opts);
        return room
    } catch (e) {
        console.log("room creation error");
        console.log(e);
    }
}
```

- delete room
```
function deleteRoom(svc: RoomServiceClient, roomName: string) {
    svc.deleteRoom(roomName).then(() => {
        console.log('room deleted', roomName)
    })
}
```
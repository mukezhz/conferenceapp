# Livekit Client
- **NOTE:** Everything you send post to backend server must be `content-type: appliation/json`

---
## TLDR;
- fetch the access token from the backend server `/join`
- get the create room from the backend server `/create`
- create a Local Room
- use the `access token`, `websocket url` and `local room` to connect the Room using `connectRoom` method
- `room received from the server` and from `connectRoom method` are same **[using client local room and connectRoom method bring more flexibility]**
- create the track and publish the track to the room when button is clicked
- attach the track to the appropriate html element depending upon the `kind` of track
- if there are participant A and participant B,
  - track published to room by A is localTrack for A and remoteTrack for B
  - track published to room by B is localTrack for B and remoteTrack for A
- use the remoteTrack/localTrack concept to show it in html

---
### Create room
```
function getRoom() {
    const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
            resolution: VideoPresets.hd.resolution,
        }
    })
    return room
}
```
- import nessary methods from the `livekit-client` SDK
- set livekit-server's url for web socket
`const url = 'ws://<your host IP>:7880'`
- fetch access token from livekit backend server by providing `room` and `your name` to endpoint `/join`
```
async function fetchToken(url, room, name) {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            room,
            name
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    const token = await response.json()
    return token
}
```
- [fetched token have detail `about you` and `the room`]
- fetch the room from the backend server by providing the `room name` to `/create`
```
async function createRoom() {
    const { room, name, token } = history.state
    const { access_token } = token
    const serverRoom = await fetch(`${serverUrl}/create`, {
        method: "POST",
        body: JSON.stringify({
            name,
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    // body.removeChild(board)
    const createdRoom = await serverRoom.json()
    const livekitRoom = getRoom()
    const connectedRoom = await connectRoom(livekitRoom, url, access_token)
    return { createdRoom, ...connectedRoom }
}
```
**NOTE:** `credentials: "include"` is necessary for HTTP Only token [Token will not store in browser if you don't use it]

- connect to the room by providing `Room`, `url` and `token` and add handler for `RoomEvent`:
```
async function connectRoom(room: Room, url: string, token: string) {
    room
        .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
        // .on(RoomEvent.TrackPublished, handleTrackPublished)
        .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
        .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
        .on(RoomEvent.Disconnected, handleDisconnect)
        .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);
    const connect = await room.connect(url, token, {
        autoSubscribe: true,
    });
    return { connect, room };
}
```
- you can get localparticipant from the Room
- when you click the joinButton:
  - join the room and publish the track
```
async function joinWithTracks(localRoom: Room, localParticipant: LocalParticipant) {
    let tracks: LocalTrack[];
    let flag = 0;
    if (localParticipant.tracks.size === 0) {
        tracks = await createLocalTracks({ audio: true, video: true })
        tracks.forEach(async (t) => {
            if (t.kind === "video") {
                await publishTrack(localRoom, t)
                attachLocalTrack(localRoom, t, "video")
            } else if (t.kind === "audio") {
                await publishTrack(localRoom, t)
            }
        })
    }
}
```
    - attach the published track to the video element and audio element of the html
    - attach local track when user click on join room:
```
function attachLocalTrack(room: Room, track: Track, kind: string) {
    const usTitle = document.getElementById("local") as HTMLDivElement
    usTitle.innerText = "Local Participant"
    // document.getElementById("us-title").innerText = room.localParticipant.identity
    if (track.kind === "video" && track.kind == kind) {
        console.log("appending video");
        const v = document.getElementById("us-video") as HTMLVideoElement;
        track.attach(v);
    }
    if (track.kind === "audio" && track.kind == kind) {
        console.log("appending audio");
        const a = document.getElementById("us-audio") as HTMLAudioElement;
        track.attach(a);
    }
}
```
    - attach remote track when TrackSubscribed event get triggered
```
function handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
) {
    console.log("handle track subscribed===========", publication.isSubscribed);
    if (remoteParticipants.length === 0) {
        let info: RemoteParticipantInterface = {
            sid: participant.sid,
            identity: participant.identity,
            isSpeaking: participant.isSpeaking,
            audio: "",
            video: "",
        }
        if (track.kind === "audio")
            info.audio = track.sid
        else if (track.kind === "video")
            info.video = track.sid
        remoteParticipants.push(info)
    } else {
        remoteParticipants.forEach(user => {
            if (user.sid === participant.sid) {
                if (track.kind === "audio")
                    user.sid = track.sid
                else if (track.kind === "video")
                    user.video = track.sid
            } else {
                const info: RemoteParticipantInterface = {
                    sid: participant.sid,
                    identity: participant.identity,
                    isSpeaking: participant.isSpeaking,
                    audio: "",
                    video: ""
                }
                if (track.kind === "audio")
                    info.sid = track.sid
                else if (track.kind === "video")
                    info.video = track.sid
                remoteParticipants.push(info)
            }
        })
    }
    if (track.kind === "audio") {
        attachRemoteTrack(participant, track, track.kind)
    }
    else if (track.kind === "video")
        attachRemoteTrack(participant, track, track.kind)
}

function attachRemoteTrack(participant: Participant, track: Track, kind: string) {
    const themTitle = document.getElementById("remote")
    themTitle.innerText = "Remote Participant"
    console.log("attaching");
    let objs: RemoteTrackInterface = null
    const board = document.getElementById("remote-div")
    const remoteDiv = document.getElementById(participant.sid)
    if (!remoteDiv) {
        objs = remoteTrackComponent(participant.identity, "", "", board)
        const { videoElement, audioElement } = objs
        objs.remoteDiv.id = participant.sid
        if (track.kind === "video" && track.kind == kind) {
            videoElement.id = track.sid
            console.log("appending remote video");
            track.attach(videoElement);
        } else if (track.kind === "audio" && track.kind == kind) {
            audioElement.id = track.sid
            console.log("appending remote audio");
            track.attach(audioElement);
        }
    } else {
        const videoElement = remoteDiv.childNodes[1] as HTMLVideoElement
        const audioElement = remoteDiv.lastChild as HTMLAudioElement
        if (track.kind === "video" && track.kind == kind) {
            videoElement.id = track.sid
            console.log("appending video");
            track.attach(videoElement);
        } else if (track.kind === "audio" && track.kind == kind) {
            audioElement.id = track.sid
            console.log("appending audio");
            track.attach(audioElement);
        }
    }
    // document.getElementById("us-title").innerText = room.localParticipant.identity
}
```
    - detach remote track when TracnUnsubscribed event get triggered 
```
function handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
) {
    // remove tracks from all attached elements
    console.log("handle track unpublished");
    console.log("track", track);
    const div = document.getElementById(participant.sid)
    if (div) div.remove()
    if (track.kind === "video") {
        const video = document.getElementById(track.sid) as HTMLVideoElement
        track.detach(video);
    }
    else if (track.kind === "audio") {
        const audio = document.getElementById(track.sid) as HTMLAudioElement
        track.detach(audio)
    }
}
```

---
### TODO:
- check whether tracks[video/audio] can be accessible or not before joining the room [`for this enable/disable method can be used`]
- mute/unmute the video and audio track by clicking the button after joining the room[`for this mute/unmute method can be used`]
- deploy to the internet so that it can be accesible by everyone
- add persmissions so that admin participant can `mute/remove` other participant
- show status of the currently speaking user [for the there is `isSpeaking` property of track]
- use simulcast feature to show different resolution video depending upon the bandwidth
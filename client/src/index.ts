import "./styles.css";
import {
    RoomEvent,
    LocalTrackPublication,
    LocalParticipant,
    RemoteParticipant,
    RemoteTrackPublication,
    RemoteTrack,
    Participant,
    VideoPresets,
    Room,
    createLocalTracks,
    createLocalVideoTrack,
    RemoteVideoTrack,
    LocalTrack,
    LocalVideoTrack,
    Track,
    createLocalAudioTrack,
    TrackEvent
} from "livekit-client";
import { checkTrack, roomNameForm, remoteTrack, remoteTrackComponent } from "./views/main";

// const url = 'ws://192.168.86.115:7880' || 'ws://192.168.86.92:7880'
// const url = 'wss://lvkserver.alpha.hamrostack.com'
const serverUrl = process.env.SERVER_URL || ""
const url = process.env.LIVEKIT_WS || ""
console.log("I am here", serverUrl, url);
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTE5ODQ2MTcsImlzcyI6IkFQSUJkZFFmZENyM1c4ViIsImp0aSI6InRlc3RpZGVudGl0eSIsIm5iZiI6MTY0OTM5MjYxNywic3ViIjoidGVzdGlkZW50aXR5IiwidmlkZW8iOnsicm9vbSI6InRlc3Ryb29tIiwicm9vbUpvaW4iOnRydWV9fQ.NaL9f1FLEwabqUTY19MEiIsDnPmsBqLinDnkWj5-LYM'

async function fetchToken(url: string, room: string, name: string) {
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
// const serverUrl = "http://192.168.86.115:8000" || "http://localhost:8000"
// const serverUrl = "http://livekit-api.alpha.hamrostrack.com"


// document.getElementById("connect").addEventListener("click", videoToggle)

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

interface RemoteTrackInterface {
    videoElement: HTMLVideoElement;
    audioElement: HTMLAudioElement;
    remoteDiv: HTMLDivElement;
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

function detachLocalTrack(room: Room, track: Track, kind: string) {
    const usTitle = document.getElementById("local")
    usTitle.innerText = "Local Participant"
    // document.getElementById("us-title").innerText = room.localParticipant.identity
    if (track.kind === "video" && track.kind == kind) {
        console.log("removing video");
        const v = document.getElementById("us-video") as HTMLVideoElement
        track.detach(v);
    }
    if (track.kind === "audio" && track.kind == kind) {
        console.log("removing audio");
        const a = document.getElementById("us-audio") as HTMLAudioElement
        track.detach(a);
    }
}

async function publishTrack(room: Room, track: MediaStreamTrack | LocalTrack) {
    const localTrack = await room.localParticipant.publishTrack(track)
    return localTrack
}

// async function videoToggle() {
//     const token = document.getElementById("jwt").value;
//     const { connect, room } = await connectRoom(getRoom(), url, token)
//     console.log("local sid", room.localParticipant.sid);
//     const tracks = await createLocalTracks({
//         audio: true,
//         video: true
//     });
//     const remoteParticipants = []
//     connect.participants.forEach(participant => { const { sid, identity, joinedAt } = participant.participantInfo; remoteParticipants.push({ sid, identity, joinedAt }) })
//     console.log("remoteParticipants", remoteParticipants);
//     remoteParticipants.forEach(remote => {
//         const p = connect.participants.get(remote.sid)
//         if (p) {
//             // if the other user has enabled their camera, attach it to a new HTMLVideoElement
//             if (p.isCameraEnabled) {
//                 const track = p.getTrack(Track.Source.Camera);
//                 track.setSubscribed(true)
//             }
//         }
//     })
//     attachLocalTrack(room, tracks)
//     videoOnly(room)
// }

function getRoom() {
    const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
            resolution: VideoPresets.hd.resolution,
        }
    })
    console.log("client side room", room);
    return room
}
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
    console.log("connect room", connect);
    return { connect, room };
}

interface RemoteParticipantInterface {
    identity: string;
    sid: string;
    isSpeaking: boolean;
    audio: string;
    video: string;
}

let remoteParticipants: RemoteParticipantInterface[] = []
// await room.localParticipant.enableCameraAndMicrophone();
// function handleTrackPublished(publication: RemoteTrackPublication, participant: RemoteParticipant) {
//     const isSub = publication.isSubscribed
//     const dimensions = publication.dimensions
//     console.log("published published", publication);
//     console.log(participant);
//     if (remoteParticipants.length === 0) {
//         const data: RemoteParticipantInterface = {
//             identity: participant.identity,
//             sid: participant.sid,
//             isSpeaking: participant.isSpeaking
//         }
//         remoteParticipants.push(data)
//     } else {
//         remoteParticipants.map(data => {
//             if (participant.sid !== data.sid) {
//                 const info: RemoteParticipantInterface = {
//                     identity: participant.identity,
//                     sid: participant.sid,
//                     isSpeaking: participant.isSpeaking
//                 }
//                 return info
//             }
//             return data
//         })
//     }
//     console.log("object", remoteParticipants);
//     // console.log(dimensions);
//     const tracksid = publication.trackSid
//     // console.log("issub", publication.isSubscribed);
//     if (!isSub) {
//         publication.setSubscribed(true)
//     }

// }

async function videoOnly(room) {
    const cameramic = await room.localParticipant.enableCameraAndMicrophone();
    console.log("video only", cameramic);
    // room.emit(Track.Kind.Audio, room.RemoteTrackPublication, room.RemoteParticipant)
}

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

    if (track.kind === "video") { }
}

function attachTrack(track, participant) {
    // console.log("=======participant=======", participant);
    // attach track to a new HTMLVideoElement or HTMLAudioElement
    const parentElement = document.getElementById("them")
    document.getElementById("remote").innerText = "Remote Participants"
    let videoElement = document.getElementById(track.sid)
    if (!videoElement) {
        const div = document.createElement("div")
        const v = document.createElement("video")
        v.id = "video" + track.sid
        const t = document.createElement("h1")
        t.id = "text" + track.sid
        t.innerText = participant.identity
        v.height = 400
        v.width = 400
        v.autoplay = true
        div.appendChild(t);
        div.appendChild(v);
        parentElement.style.display = "flex"
        parentElement.appendChild(div)
    }

    track.attach();
    // or attach to existing element
    // track.attach(element)
}

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

function handleLocalTrackUnpublished(
    trackpublication: LocalTrackPublication,
    participant: LocalParticipant,
) {
    // when local tracks are ended, update UI to remove them from rendering
    console.log("unpublish", trackpublication);
    console.log("participation", participant);
}

function handleActiveSpeakerChange(speakers: Participant[]) {
    // show UI indicators when participant is speaking
}

function handleDisconnect() {
    console.log('disconnected from room');
}

const board = document.querySelector("#board") as HTMLDivElement

function createForm() {
    const form = roomNameForm()
    board.appendChild(form)
    return form
}

function pathRedirect() {
    const { pathname } = window.location
    if (pathname !== "/" || window.location.search) {
        history.pushState({}, "Main", "/")
    }
}
pathRedirect()
const joinForm = <HTMLFormElement>createForm()
joinForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(joinForm)
    const body = document.body
    const room = data.get("room") as string
    const name = data.get("name") as string
    if (window.location.pathname === "/") {
        try {
            const token = await fetchToken(`${serverUrl}/join`, room, name)
            if (token) {
                // redirecting to /create
                history.pushState({ room, name, token }, "Room", "create");
                document.title = `Hamro Conference - ${room}`
                const newBoard = board.cloneNode()
                board.remove()
                body.appendChild(newBoard)
                const { header, videoElement, videoButton, micButton, joinButton } = checkTrack("local", "us-video", "us-audio", room, newBoard)
                const { connect, createdRoom, room: localRoom } = await createRoom()
                console.log("connect", connect);
                const { localParticipant } = <Room>localRoom
                // videoButton.addEventListener("click", () => checkVideo(localRoom, localParticipant))
                // micButton.addEventListener("click", () => checkMic(localRoom, localParticipant))
                joinButton.addEventListener("click", () => {
                    joinWithTracks(localRoom, localParticipant)
                })
            }
        }
        catch (err) { console.log(err) }
    }
})
const localTrackObj = {
    video: "",
    audio: ""
}
async function createRoom() {
    const { room, name, token } = history.state
    const { access_token } = token
    const serverRoom = await fetch(`${serverUrl}/create`, {
        method: "POST",
        body: JSON.stringify({
            room,
            name,
            access_token
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    // body.removeChild(board)
    const createdRoom = await serverRoom.json()
    console.log("created room server", createdRoom);
    const livekitRoom = getRoom()
    const connectedRoom = await connectRoom(livekitRoom, url, access_token)
    return { createdRoom, ...connectedRoom }
}

async function checkVideo(localRoom: Room, localParticipant: LocalParticipant) {
    let cameraTrack: LocalTrack;
    let flag = 0;
    if (localParticipant.tracks.size === 0) {
        cameraTrack = await createLocalVideoTrack()
        await publishTrack(localRoom, cameraTrack)
        attachLocalTrack(localRoom, cameraTrack, "video")
        localTrackObj.video = cameraTrack.sid;
    }
    else {
        flag = 1
        localParticipant.tracks.forEach(async (data) => {
            // audio already exists and find it first
            if (data.track.sid === localTrackObj.audio && localParticipant.tracks.size === 1) {
                cameraTrack = await createLocalVideoTrack()
                await publishTrack(localRoom, cameraTrack)
                attachLocalTrack(localRoom, cameraTrack, "video")
                localTrackObj.video = cameraTrack.sid;
            }
            else if (data.track.sid === localTrackObj.video) {
                console.log("video already exists!!!");
                cameraTrack = data.track
            }
        })
    }
    if (!cameraTrack) return
    if (!cameraTrack.isMuted && flag == 1) {
        await cameraTrack.mute()
        detachLocalTrack(localRoom, cameraTrack, "video")
    } else if (cameraTrack.isMuted && flag == 1) {
        await cameraTrack.unmute()
        attachLocalTrack(localRoom, cameraTrack, "video")
    }
}

async function checkMic(localRoom: Room, localParticipant: LocalParticipant) {
    let micTrack: LocalTrack;
    let flag = 0;
    if (localParticipant.tracks.size === 0) {
        micTrack = await createLocalAudioTrack()
        await publishTrack(localRoom, micTrack)
        attachLocalTrack(localRoom, micTrack, "audio")
        localTrackObj.audio = micTrack.sid;
    }
    else {
        flag = 1
        localParticipant.tracks.forEach(async (data) => {
            // audio already exists and find it first
            if (data.track.sid === localTrackObj.video && localParticipant.tracks.size === 1) {
                micTrack = await createLocalAudioTrack()
                await publishTrack(localRoom, micTrack)
                attachLocalTrack(localRoom, micTrack, "audio")
                localTrackObj.audio = micTrack.sid;
            }
            else if (data.track.sid === localTrackObj.audio) {
                console.log("audio already exists!!!");
                micTrack = data.track
            }
        })
    }
    if (!micTrack) return
    if (!micTrack.isMuted && flag == 1) {
        await micTrack.mute()
        detachLocalTrack(localRoom, micTrack, "audio")
    } else if (micTrack.isMuted && flag == 1) {
        await micTrack.unmute()
        attachLocalTrack(localRoom, micTrack, "audio")
    }
}

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
        //     await publishTrack(localRoom, micTrack)
        //     attachLocalTrack(localRoom, micTrack, "audio")
        //     localTrackObj.audio = micTrack.sid;
    }
    console.log(localParticipant);
    // else {
    //     flag = 1
    //     localParticipant.tracks.forEach(async (data) => {
    //         // audio already exists and find it first
    //         if (data.track.sid === localTrackObj.video && localParticipant.tracks.size === 1) {
    //             micTrack = await createLocalAudioTrack()
    //             await publishTrack(localRoom, micTrack)
    //             attachLocalTrack(localRoom, micTrack, "audio")
    //             localTrackObj.audio = micTrack.sid;
    //         }
    //         else if (data.track.sid === localTrackObj.audio) {
    //             console.log("audio already exists!!!");
    //             micTrack = data.track
    //         }
    //     })
    // }
}
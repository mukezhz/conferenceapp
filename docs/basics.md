# Livekit
- WebRTC Selective Forwarding Unit (SFU) [P2P vs MFU vs SFU](./assets/webrtc.png)
- built-in TURN
- speaker detection, simulcast, selective subscription, and moderation APIs
- [livekit architecture](./assets/livekit.png)

## Overview
- your **backend server** generates an access token using **LiveKit's server SDK**
- your **client** obtains this token from your **backend**
- your **client** passes the token to **LiveKit's client SDK**
- the **LiveKit client** connects to a **LiveKit server** instance with the provided token
- **LiveKit server** validates the token and accepts your incoming connection

## For development server
- Generate a key [you will get livekit.yaml]:

`$docker run --rm -v$PWD:/output livekit/generate --local`

- Start docker using livekit.yaml file [--node-ip needs to be set to your machine's IP address to expose]
  
```
docker run --rm -p 7880:7880 \
    -p 7881:7881 \
    -p 7882:7882/udp \
    -v $PWD/livekit.yaml:/livekit.yaml \
    livekit/livekit-server \
    --config /livekit.yaml \
    --node-ip <machine-ip>
```
## Core concepts
- **Room**
  - A Room is a container for a LiveKit session
  - Participants in the same room may subscribe to one another's tracks.
  - When a single participant changes their tracks (e.g. mutes or unpublishes), other participants will be notified of this change
  - Participants within the room may also exchange data with one another, including one-to-one and one-to-many deliveries.
  - Rooms may be manually created with server APIs, or automatically created when the first participant attempts to join a room.
  - When the last remaining participant leaves a room, it will be closed after a short delay.

- **Participant**
  - A participant represents a user in a room.
  - Each one is represented by a unique, client-provided `identity`, and a server-generated `sid`.
  - the server will automatically disconnect other participants using the same identity.
  - A `Participant` object contains metadata about its state, as well as a list of tracks they have published.
  - There are two kinds of participants:
    - LocalParticipant - represents the current user. Publishes tracks to the room.
    - RemoteParticipant - represents a remote user. You may subscribe to any of the tracks they've published.
- **Track and TrackPublication**
  - `Track` - a wrapper around the native WebRTC MediaStreamTrack, representing a playable track.
  - `TrackPublication` - a track that's been published to the server. If the track is subscribed by the current participant, and available for playback locally, it will have a .track attribute representing the underlying `Track` object.
  - Having a separate `TrackPublication` construct lets us represent tracks which may not be subscribed to by the current participant.
  - We can now list and manipulate track publications others have published, without the local participant necessarily being subscribed.

  - [**TrackPublication attributes**](./assets/trackpublication.png)

  - **Track subscription**
    - Each participant in the room may subscribe to one or more tracks published by other participants.
    - When autoSubscribe is set to true (default), participants will automatically subscribe to all published tracks.
    - When unsubscribed, a participant will stop receiving media for that track, and may re-subscribe to it at any time.

# On connecting to Room
- Upon successful connection, you're provided a room object to interact with.
- The two key properties on a room object are the LocalParticipant object, representing the current user, and RemoteParticipants, an array of other users in the room.
- You can also listen for room events. Your callbacks will be invoked whenever various states of the room change.
- For events happening to a specific participant, will also be fired on the appropriate `RemoteParticipant` or `LocalParticipant` object.

# Connecting to a room
- Connecting to a room requires two parameters: a url and a token.
- url: `ws://localhost:7880`
- token: `access token representing the particular local participant.`

# Events on room
- On successful connection to the room you can now listen to various events like:
  - [LocalTrackPublished](https://docs.livekit.io/client-sdk-js/enums/RoomEvent.html#LocalTrackPublished)
  - [TrackPublished](https://docs.livekit.io/client-sdk-js/enums/RoomEvent.html#TrackPublished)
  - [Many more ...](https://docs.livekit.io/client-sdk-js/enums/RoomEvent.html)

# Leaving a room
- When leaving a room, `disconnect()` Room event got triggered
- If the application is `closed without notifying` the `LiveKit`, it will continue to display the participant as being in the room for more than `20 seconds`.

# Connectivity
- LiveKit configures WebRTC to enable connectivity from a wide variety of network conditions. It'll try the following in order of preference.
  
  1. ICE over UDP: ideal connection type, used in majority of conditions
  2. TURN with UDP (443): used when firewall blocks all other UDP port other than 443
  3. ICE over TCP: used when network disallows UDP (i.e. over VPN or corporate firewalls)
  4. TURN with TLS: used when firewall only allows outbound TLS connections
- ICE over UDP and TCP works automatically, while TURN requires additional configurations and your own SSL certificate.

# Network changes and reconnection
- When network changes, LiveKit will attempt to re-establish the connection behind the scenes. It'll fire off an `Reconnecting` event so your client could display additional UI to inform the user.
- If the reconnection is successful, you will receive a `Reconnected` callback to let you know that things are back to normal. 
- Otherwise, it'll disconnect you from the room.

**NOTE:** During the reconnection, the video/audio tracks may stop sending/receiving data for a few seconds. When the connection is re-established, the tracks will then "unfreeze".

# Publishing media
- It's simple to publish the local participant's camera and/or microphone streams to the room. We provide a consistent way to do this across platforms:
```
// Turns camera track on
room.localParticipant.setCameraEnabled(true)

// Turns microphone track on
room.localParticipant.setMicrophoneEnabled(true)
```
- and to mute but also publish, you can perform:
```
room.localParticipant.setCameraEnabled(false)
room.localParticipant.setMicrophoneEnabled(false)
```

**Disabling camera or microphone will turn off their respective recording indicators. Other participants will receive a TrackMuted event.**


## Screen sharing
```
// this will trigger browser prompt to share screen
await currentRoom.localParticipant.setScreenShareEnabled(true);
```

**NOTE:** `setCameraEnabled()`, `setMicrophoneEnabled()`, `setScreenShareEnabled()` method will create andautomatically publish your track to the room

## Manually create and publish track to Room
- `localParticipant.createLocalVideoTrack()`, `localParticipant.createLocalAudioTrack()` are used to create Video Track and Audio Track respectively
- You can even pass additional options while creating tracks for eg:
    ```
    async function publishTracks() {
        const videoTrack = await createLocalVideoTrack({
            facingMode: { ideal: "user" },
            // preset resolutions
            resolution: VideoPresets.hd
        })
        
        const audioTrack = await createLocalAudioTrack({
            echoCancellation: true,
            noiseSuppression: {
            ideal: true,
            }
        })
    }
    ```
- `Tracks` need to be published one at a time. It's **important** to `await` the `first publishTrack` call before attempting to publish again.

## Mute and unmute
- You can mute any track to stop it from sending data to the server.
- When a track is muted, LiveKit will trigger a TrackMuted event on all participants in the room.
- Mute/unmute a track using its corresponding `LocalTrackPublication` object.

## Video simulcasting
-  a client publishes multiple versions of the same video track with varying bitrate profiles.
-  This allows LiveKit to dynamically forward the stream that's most appropriate given each receiving participant's available `bandwidth` and `desired resolution`.
-  [For more simulcast](https://blog.livekit.io/an-introduction-to-webrtc-simulcast-6c5f1f6402eb)

# Receiving media
- While connected to a room, the server may send down one or more audio/video/data tracks at any time
- By default, a client automatically subscribes to a received track, and lets your app know by invoking callbacks on the room object and associated participant who published the track.

## Track Subscription
- Receiving tracks from the server starts with a subscription.
- LiveKit models tracks with two constructs: `TrackPublication` and `Track`
- You can think of a `TrackPublication` as metadata for a track registered with the server and `Track` as the raw media stream.
- Track subscription callbacks provide your app with both the `Track` and `TrackPublication` objects.
- Subscribed callback will be fired on both `Room` and `RemoteParticipant` objects.

## Speaker detection
- When audio tracks are published, LiveKit will detect participants whom are speaking.
- Speaker updates are sent for both local and remote participants.
- They will fire on both, Room and Participant objects.
```
room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
  // do something with the active speakers
})

participant.on(ParticipantEvent.IsSpeakingChanged, (speaking: boolean) => {
  console.log(`${participant.identity} is ${speaking ? "now" : "no longer"} speaking. audio level: ${participant.audioLevel}`)
})
```

## Subscriber controls
- LiveKit supports selective subscription. [Default: subscribe to all newly published tracks]
- Both client and server APIs are available to setup a connection for selective subscription and 
- once configured, only `explicitly subscribed tracks` are `sent down to the client`.

### Client-side selective subscription
```
let room = await room.connect(url, token, {
  autoSubscribe: false,
})

room.on(RoomEvent.TrackPublished, (track, publication, participant) => {
  publication.setSubscribed(true)
})
```

### Server-side selective subscription
```
import { RoomServiceClient } from 'livekit-server-sdk';

const client = new RoomServiceClient("myhost", "api-key", "my secret")

// subscribe to new track
client.updateSubscriptions("myroom", "receiving-participant-identity", ["TR_TRACKID"], true)

// unsubscribe from existing track
client.updateSubscriptions("myroom", "receiving-participant-identity", ["TR_TRACKID"], false)
```

## Enabling/disabling tracks 
- Client implementations seeking fine-grain control over bandwidth consumption can enable or disable tracks at their discretion [Default: enabled]
- When a track is disabled, the client will not receive any new data for that track
- If a disabled track is subsequently enabled, `new data` will be received by the client
- The `disable` action is useful when optimzing for a client's bandwidth consumption
- For example:
  - if a particular user's video track is offscreen, disabling this track will reduce bytes from being sent by the LiveKit server until the track's data is needed again.
```
import {
  connect,
  RoomEvent,
} from 'livekit-client';

const room = await connect('ws://your_host', token);
room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) {
  publication.setEnabled(false)
}
```

## Simulcast controls
- this would result a quality and bandwidth reduction for the target track
- This might come in handy, for instance, when an application's user interface is displaying a small thumbnail for a particular user's video track.
```
import {
  connect,
  RoomEvent,
} from 'livekit-client';

connect('ws://your_host', token, {
  audio: true,
  video: true,
}).then((room) => {
  room
    .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
});

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) {
  if (track.kind === Track.Kind.Video) {
    publication.setVideoQuality(VideoQuality.LOW)
  }
}
```

## Working with data
- you can use it to pass around custom application data
- e have a flexible system that enables you to pass messages from both the backend, and between participants

### Participant metadata
- LiveKit participants have a metadata field that you could use to store application-specific data
-  For example, 
   -  this could be the seat number around a table, or other participant-specific state.
- Metadata is encoded in the `access token` that participants use to connect to the room.
- With our server SDKs, you can update the metadata from your backend. 
- LiveKit will broadcast metadata changes to all participants in the room
- You can receive these updates by listening to the MetadataUpdated callback/event.

## Example: Updating metadata from server API
```
import { RoomServiceClient } from 'livekit-server-sdk';

const client = new RoomServiceClient("myhost", "api-key", "my secret")

const data = JSON.stringify({
  some: "values",
})
client.updateParticipant("myroom", "participant-identity", data)
```

## Data messages
- From both server and clients, LiveKit lets you publish arbitrary data messages to any participants in the room via the `LocalParticipant.publishData` API.
- Room data is published to the SFU via WebRTC data channels; and LiveKit server would forward that data to one or more participants in the room.
- From the server side, this API is exposed on `RoomService` as `SendData`
- Since the data is sent via UDP, you have a flexibility in regard to the reliability of delivery.
- In reliable mode, 
  - your packets will be retransmitted until they are received.[For use-cases such as in-room chat, this is preferable.]
- When using lossy delivery, 
  - we suggest keeping data packets small (under network MTU of 1.4k). 
  - If a message is packetized into multiple packets, and a single packet doesn't arrive, your client will not receive the message at all.

```
const strData = JSON.stringify({some: "data"})
const encoder = new TextEncoder()
const decoder = new TextDecoder()

// publishData takes in a Uint8Array, so we need to convert it
const data = encoder.encode(strData);

// publish to everyone in the room
room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE)

// publish to specific participants
room.localParticipant.publishData(data, DataPacket_Kind.LOSSY, ['participant_sid'])

// receive data from other participants
room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: Participant, kind: DataPacket_Kind) => {
  const strData = decoder.decode(payload)
  ...
})
```

## Access Tokens

- For a LiveKit client to successfully connect to the server, it must pass an access token with the request.
- This token encodes the `identity of a participant`, `name of the room`, `capabilities` and `permissions`. 
- Access tokens are `JWT-based` and signed with your `API secret` to prevent forgery.
- Each access token can be used only by a single participant.

### [Creating a token](https://docs.livekit.io/guides/access-tokens#creating-a-token)
```
import { AccessToken } from 'livekit-server-sdk';

const roomName = 'name-of-room';
const participantIdentity = 'unique-identity';
const participantName = 'display name';

const at = new AccessToken('api-key', 'secret-key', {
  identity: participantIdentity,
  name: participantName,
});
at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

const token = at.toJwt();
console.log('access token', token);
```
- We use:
  - `iss` to identify the API key, 
  - `sub` to indicate participant identity, and video to encode LiveKit VideoGrant.

### Room permissions
- Room permissions are specified in the video field of a decoded join token
- [It may contain one or more of the following properties:](./assets/roompermissoins.png)
  
- Example: subscribe-only token
```
{
    ...
    "video": {
    "room": "myroom",
    "roomJoin": true,
    "canSubscribe": true,
    "canPublish": false,
    "canPublishData": false
    }
}
```

## Token expiration
- A tokens has an expiration time.
- We recommend setting it to the expected duration of a session
- A LiveKit client will store a token for the entire session duration, in case it needs to reconnect.

## Participant metadata
- You may also attach any arbirary `metadata` onto each participant via the `metadata field`
- When provided, LiveKit will attach the metadata to the participant object that the clients would receive.

## Server APIs
- LiveKit has built-in APIs that lets you to manage rooms, update and moderate participants.
- These APIs are designed to be used by your backend.
- Room APIs are built on top of [Twirp](https://twitchtv.github.io/twirp/docs/intro.html), and differ from a traditional REST interface.
- Arguments are passed via POSTing JSON body to the endpoints.
- The APIs are available at:
  - `/twirp/livekit.RoomService/<MethodName>`
  - `/twirp/livekit.RoomService/ListRooms`
- Room APIs are fully distributed across multiple nodes
- Each instance is capable of fulfilling requests about any room or participant

## Authorization header
- All of the APIs require a signed access token. The token should be set in HTTP headers as
  - `Authorization: Bearer <token>`
  -  server sdks will include the authentication header automatically.
-  **Post body**
   -  Twirp expects each request to be a HTTP POST
   -  The body of the request should be a JSON object `(application/json)` containing parameters specific to each request.
   -  For requests that takes no parameters, an empty {} body should be used.
-  **APIs**
   -  CreateRoom
   -  ListRooms
   -  DeleteRoom
   -  ListParticipants
   -  GetParticipant
   -  RemoveParticipant
   -  MutePublishedTrack
   -  [Many more...](https://docs.livekit.io/guides/server-api#apis)

## Webhooks
- LiveKit can be configured to notify your server when room events take place
- This can be helpful for your backend to know when a room has finished, or when a participant leaves
- Webhooks can be enabled by setting the `webhook` section in config.
```
webhook:
  api_key: 'api-key-to-sign-with'
  urls:
    - 'https://yourhost'
```

## Receiving webhooks
- Webhook requests are HTTP POST requests sent to URLs that you specify in the config
- A `WebhookEvent` is sent as the `body` of the `request`, encoded in JSON
- In order to ensure the requests are coming from LiveKit, the requests carry a `Authentication` header, containing a signed JWT token.
  - The token includes a sha256 hash of the payload.
- LiveKit server SDKs provide webhook receiver libraries that will help with validation and decoding of the payload.
```
import { WebhookReceiver } from 'livekit-server-sdk';

const receiver = new WebhookReceiver("apikey", "apisecret");

// In order to use the validator, WebhookReceiver must have access to the raw POSTed string (instead of a parsed JSON object)
// if you are using express middleware, ensure that `express.raw` is used for the webhook endpoint
// router.use('/webhook/path', express.raw());

app.post('/webhook-endpoint', (req, res) => {
  // event is a WebhookEvent object
  const event = receiver.receive(req.body, req.get('Authorization'))
})
```

### [Events](https://docs.livekit.io/guides/webhooks#events)
- Room Started
- Room Finished
- ...
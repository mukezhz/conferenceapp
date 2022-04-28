// Fake Spaces SDK.
// https://c.tenor.com/J7B7Y3Dz6GMAAAAC/dont-look-at-me.gif

export function Space(token) {
    this.token = token;
}

Space.prototype.join = join;
async function join() {
    console.log("Joining Space");
}

Space.prototype.publishStream = publishStream;
async function publishStream(stream) {
    console.log("Publishing MediaStream");
}

Space.prototype.on = on;
async function on(event, callback) {
    console.log("Registering Callback");
    setTimeout(callback, 2000);
}

export function SpaceEvent() {
    const ParticipantTrackSubscribed = 0;
}

export function attach(track, mediaElement) {
    console.log(`Attatching Track to MediaElement`);
    mediaElement.src =
        "https://stream.mux.com/KE4TS6F63HWIO2EaIVmb1SjrXHBeaqsx/low.mp4";
    mediaElement.loop = true;
}
